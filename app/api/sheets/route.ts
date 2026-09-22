import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CACHE_TTL_MS = 15 * 60 * 1000
const REQUEST_TIMEOUT_MS = 90 * 1000
const RANGE_CHUNK_SIZE = 5000
const responseCache = new Map<string, { expiresAt: number; values: unknown[][] }>()
const pendingRequests = new Map<string, Promise<unknown[][]>>()

type GoogleValuesPayload = { values?: unknown[][]; error?: { message?: string; status?: string } }
type SheetMetadataPayload = {
  sheets?: Array<{ properties?: { title?: string; gridProperties?: { rowCount?: number } } }>
}

const clean = (value: unknown): string | number => {
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

const valuesEndpoint = (spreadsheetId: string, range: string, key: string) => {
  const params = new URLSearchParams({ key, fields: 'values', valueRenderOption: 'UNFORMATTED_VALUE', majorDimension: 'ROWS' })
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?${params.toString()}`
}

const metadataEndpoint = (spreadsheetId: string, key: string) => {
  const params = new URLSearchParams({ key, fields: 'sheets(properties(title,gridProperties(rowCount)))' })
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?${params.toString()}`
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, { cache: 'no-store', signal: controller.signal })
    const payload = await response.json().catch(() => ({})) as T & GoogleValuesPayload
    if (!response.ok) {
      const apiMessage = payload?.error?.message || payload?.error?.status
      throw new Error(apiMessage ? `Google Sheets API: ${apiMessage}` : `Google Sheets API error (${response.status})`)
    }
    return payload
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchRawValues(spreadsheetId: string, range: string, key: string) {
  const payload = await fetchJson<GoogleValuesPayload>(valuesEndpoint(spreadsheetId, range, key))
  return Array.isArray(payload.values) ? payload.values.filter(Array.isArray).map(row => row.map(clean)) : []
}

async function fetchOpenRangeValues(spreadsheetId: string, range: string, key: string, match: RegExpMatchArray) {
  const [, rawSheetName, firstColumn, lastColumn] = match
  const sheetName = rawSheetName.replace(/^'|'$/g, '').replace(/''/g, "'")
  const metadata = await fetchJson<SheetMetadataPayload>(metadataEndpoint(spreadsheetId, key))
  const rowCount = metadata.sheets?.find(sheet => sheet.properties?.title === sheetName)?.properties?.gridProperties?.rowCount

  // If a custom sheet name cannot be found, preserve compatibility by using one normal request.
  if (!rowCount || rowCount < 1) return fetchRawValues(spreadsheetId, range, key)

  const ranges = Array.from({ length: Math.ceil(rowCount / RANGE_CHUNK_SIZE) }, (_, index) => {
    const start = index * RANGE_CHUNK_SIZE + 1
    const end = Math.min(rowCount, start + RANGE_CHUNK_SIZE - 1)
    return `${rawSheetName}!${firstColumn}${start}:${lastColumn}${end}`
  })
  const chunks = await Promise.all(ranges.map(chunkRange => fetchRawValues(spreadsheetId, chunkRange, key)))
  return chunks.flat()
}

async function fetchSheetValues(spreadsheetId: string, range: string, key: string, cacheKey: string, forceRefresh: boolean) {
  const now = Date.now()
  const cached = responseCache.get(cacheKey)
  if (!forceRefresh && cached && cached.expiresAt > now) return cached.values

  const pending = pendingRequests.get(cacheKey)
  if (pending) return pending

  const request = (async () => {
    // The current sheet has tens of thousands of rows. Chunking prevents one large
    // Google response from timing out, while metadata prevents requests past its last row.
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z'
  const forceRefresh = searchParams.get('refresh') === '1'
  const key = process.env.GOOGLE_SHEETS_API_KEY?.trim()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()

  if (!key || !spreadsheetId || key.startsWith('your_') || spreadsheetId.startsWith('your_')) {
    return NextResponse.json({ source: 'demo', message: 'Google Sheets credentials are not configured.', values: [] })
  }

  const cacheKey = `${spreadsheetId}:${range}`
  try {
    const values = await fetchSheetValues(spreadsheetId, range, key, cacheKey, forceRefresh)
    return NextResponse.json(
      { source: 'google-sheets', values, rowCount: Math.max(0, values.length - 1), range },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const cached = responseCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(
        { source: 'google-sheets', values: cached.values, rowCount: Math.max(0, cached.values.length - 1), range, message: 'Menggunakan cache terakhir karena koneksi sedang bermasalah.' },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Google Sheets terlalu lama merespons (batas 90 detik).'
      : error instanceof Error ? error.message : 'Unable to reach Google Sheets.'
    return NextResponse.json({ source: 'error', error: message }, { status: 502 })
  }
}
