import { createServer } from 'node:http'
import { URL } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnvFile(path.join(__dirname, '.env'))

const PORT = Number(process.env.PORT || 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const CACHE_TTL_MS = 15 * 60 * 1000
const REQUEST_TIMEOUT_MS = 90 * 1000
const RANGE_CHUNK_SIZE = 5000
const responseCache = new Map()
const pendingRequests = new Map()

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match || match[1] in process.env) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

function clean(value) {
  if (value === null || value === undefined) return ''
  const text = String(value).trim()
  if (!text || ['-', '#VALUE!', '#N/A', '#DIV/0!', '#REF!', 'N/A'].includes(text.toUpperCase())) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? value : ''

  const normalized = text.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
  if (/^[-+]?\d+(?:[.,]\d+)?$/.test(normalized)) {
    const numeric = Number(normalized)
    if (Number.isFinite(numeric)) return numeric
  }
  return text
}

function valuesEndpoint(spreadsheetId, range, key) {
  const params = new URLSearchParams({ key, fields: 'values', valueRenderOption: 'UNFORMATTED_VALUE', majorDimension: 'ROWS' })
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?${params}`
}

function metadataEndpoint(spreadsheetId, key) {
  const params = new URLSearchParams({ key, fields: 'sheets(properties(title,gridProperties(rowCount)))' })
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?${params}`
}

async function fetchJson(endpoint) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, { cache: 'no-store', signal: controller.signal })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const apiMessage = payload?.error?.message || payload?.error?.status
      throw new Error(apiMessage ? `Google Sheets API: ${apiMessage}` : `Google Sheets API error (${response.status})`)
    }
    return payload
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchRawValues(spreadsheetId, range, key) {
  const payload = await fetchJson(valuesEndpoint(spreadsheetId, range, key))
  return Array.isArray(payload.values) ? payload.values.filter(Array.isArray).map(row => row.map(clean)) : []
}

async function fetchOpenRangeValues(spreadsheetId, range, key, match) {
  const [, rawSheetName, firstColumn, lastColumn] = match
  const sheetName = rawSheetName.replace(/^'|'$/g, '').replace(/''/g, "'")
  const metadata = await fetchJson(metadataEndpoint(spreadsheetId, key))
  const rowCount = metadata.sheets?.find(sheet => sheet.properties?.title === sheetName)?.properties?.gridProperties?.rowCount
  if (!rowCount || rowCount < 1) return fetchRawValues(spreadsheetId, range, key)

  const ranges = Array.from({ length: Math.ceil(rowCount / RANGE_CHUNK_SIZE) }, (_, index) => {
    const start = index * RANGE_CHUNK_SIZE + 1
    const end = Math.min(rowCount, start + RANGE_CHUNK_SIZE - 1)
    return `${rawSheetName}!${firstColumn}${start}:${lastColumn}${end}`
  })
  return (await Promise.all(ranges.map(chunkRange => fetchRawValues(spreadsheetId, chunkRange, key)))).flat()
}

async function fetchSheetValues(spreadsheetId, range, key, cacheKey, forceRefresh) {
  const now = Date.now()
  const cached = responseCache.get(cacheKey)
  if (!forceRefresh && cached && cached.expiresAt > now) return cached.values

  const pending = pendingRequests.get(cacheKey)
  if (pending) return pending

  const request = (async () => {
    const openRange = range.match(/^(.+)!([A-Z]+):([A-Z]+)$/i)
    const values = openRange
      ? await fetchOpenRangeValues(spreadsheetId, range, key, openRange)
      : await fetchRawValues(spreadsheetId, range, key)
    responseCache.set(cacheKey, { values, expiresAt: Date.now() + CACHE_TTL_MS })
    return values
  })()

  pendingRequests.set(cacheKey, request)
  try {
    return await request
  } finally {
    pendingRequests.delete(cacheKey)
  }
}

async function sheetsHandler(url) {
  const range = url.searchParams.get('range') || process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z'
  const forceRefresh = url.searchParams.get('refresh') === '1'
  const key = process.env.GOOGLE_SHEETS_API_KEY?.trim()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()

  if (!key || !spreadsheetId || key.startsWith('your_') || spreadsheetId.startsWith('your_')) {
    return { status: 200, body: { source: 'demo', message: 'Google Sheets credentials are not configured.', values: [] } }
  }

  const cacheKey = `${spreadsheetId}:${range}`
  try {
    const values = await fetchSheetValues(spreadsheetId, range, key, cacheKey, forceRefresh)
    return { status: 200, body: { source: 'google-sheets', values, rowCount: Math.max(0, values.length - 1), range } }
  } catch (error) {
    const cached = responseCache.get(cacheKey)
    if (cached) return { status: 200, body: { source: 'google-sheets', values: cached.values, rowCount: Math.max(0, cached.values.length - 1), range, message: 'Menggunakan cache terakhir karena koneksi sedang bermasalah.' } }
    const message = error?.name === 'AbortError' ? 'Google Sheets terlalu lama merespons (batas 90 detik).' : error?.message || 'Unable to reach Google Sheets.'
    return { status: 502, body: { source: 'error', error: message } }
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = ''
    request.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) reject(new Error('Request body too large')) })
    request.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch { reject(new Error('Invalid JSON')) } })
    request.on('error', reject)
  })
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  if (request.method === 'OPTIONS') return sendJson(response, 204, {})

  try {
    if (request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, { status: 'ok', service: 'akabi-backend' })
    if (request.method === 'GET' && url.pathname === '/api/sheets') {
      const result = await sheetsHandler(url)
      return sendJson(response, result.status, result.body)
    }
    if (request.method === 'POST' && url.pathname === '/api/export-auth') {
      const body = await readBody(request)
      const configuredToken = process.env.EXPORT_TOKEN?.trim()
      const providedToken = typeof body.token === 'string' ? body.token.trim() : ''
      const valid = Boolean(configuredToken && providedToken && providedToken === configuredToken)
      return sendJson(response, valid ? 200 : 401, { valid })
    }
    return sendJson(response, 404, { error: 'Route not found' })
  } catch (error) {
    return sendJson(response, 500, { error: error?.message || 'Internal server error' })
  }
})

server.listen(PORT, () => console.log(`AKABI backend berjalan di http://localhost:${PORT}`))
