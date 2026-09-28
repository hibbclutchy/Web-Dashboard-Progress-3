export type Region = {
  province: string; city: string; provinceCode?: string; cityCode?: string
  planted: number; harvested: number; production: number; month: string; year: string
  lat: number; lng: number; commodity?: string; note?: string
}

export const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const monthMap: Record<string, string> = { januari:'Jan', jan:'Jan', februari:'Feb', feb:'Feb', maret:'Mar', mar:'Mar', april:'Apr', apr:'Apr', mei:'May', may:'May', juni:'Jun', jun:'Jun', juli:'Jul', jul:'Jul', agustus:'Aug', agu:'Aug', agt:'Aug', aug:'Aug', september:'Sep', sep:'Sep', oktober:'Oct', okt:'Oct', oct:'Oct', november:'Nov', nov:'Nov', desember:'Dec', des:'Dec', dec:'Dec' }

const numberValue = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  let text = String(value ?? '').trim()
  if (!text || ['-', '#VALUE!', '#N/A', '#DIV/0!', '#REF!', 'N/A'].some(error => text.toUpperCase().startsWith(error))) return 0

  // Accept both Indonesian (1.234,56) and English (1,234.56) input formats.
  const negative = /^\(.*\)$/.test(text)
  text = text.replace(/[()\s]/g, '').replace(/[^\d,.-]/g, '')
  const lastComma = text.lastIndexOf(','), lastDot = text.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    text = lastComma > lastDot
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '')
  } else if (lastComma >= 0) {
    const decimals = text.length - lastComma - 1
    text = decimals === 3 ? text.replace(/,/g, '') : text.replace(',', '.')
  } else if ((text.match(/\./g) || []).length > 1) {
    text = text.replace(/\./g, '')
  }
  const parsed = Number(text)
  return Number.isFinite(parsed) ? (negative ? -Math.abs(parsed) : parsed) : 0
}

const textValue = (value: unknown) => String(value ?? '').replace(/\u00a0/g, ' ').trim()
const normalizeHeader = (value: unknown) => textValue(value).toLowerCase().replace(/[()/_-]+/g, ' ').replace(/\s+/g, ' ').trim()
const headerIndex = (headers: string[], names: string[]) => {
  const wanted = names.map(normalizeHeader)
  const exact = headers.findIndex(header => wanted.includes(header))
  if (exact >= 0) return exact
  return headers.findIndex(header => !/(kode|code)/.test(header) && wanted.some(name => header.includes(name)))
}
const findHeader = (values: unknown[][]) => {
  for (let index = 0; index < Math.min(values.length, 20); index += 1) {
    const headers = (values[index] || []).map(normalizeHeader)
    const required = [
      headerIndex(headers, ['tahun', 'year']),
      headerIndex(headers, ['bulan', 'month']),
      headerIndex(headers, ['provinsi', 'province', 'nama provinsi']),
      headerIndex(headers, ['kabupaten kota', 'kabupaten', 'kota', 'city', 'nama kabupaten kota']),
    ]
    if (required.every(column => column >= 0)) return { index, headers }
  }
  return { index: -1, headers: [] as string[] }
}

const monthValue = (value: unknown) => {
  const original = textValue(value)
  const normalized = original.toLowerCase().replace(/[.\s]/g, '')
  if (/^\d{1,2}$/.test(normalized)) return months[Math.max(0, Math.min(11, Number(normalized) - 1))] || original.slice(0, 3)
  return monthMap[normalized] || monthMap[normalized.slice(0, 3)] || original.slice(0, 3)
}

export function parseSheetValues(values: unknown[][]): Region[] {
  if (!Array.isArray(values) || !values.length) return []
  const { index: headerRow, headers } = findHeader(values)
  if (headerRow < 0) return []

  const yearIndex = headerIndex(headers, ['tahun', 'year'])
  const monthIndex = headerIndex(headers, ['bulan', 'month'])
  const provinceCodeIndex = headerIndex(headers, ['kode provinsi', 'province code'])
  const provinceIndex = headerIndex(headers, ['provinsi', 'province', 'nama provinsi'])
  const cityCodeIndex = headerIndex(headers, ['kode kabupaten kota', 'kode kabupaten', 'city code'])
  const cityIndex = headerIndex(headers, ['kabupaten kota', 'kabupaten', 'kota', 'city', 'nama kabupaten kota'])
  const plantedIndex = headerIndex(headers, ['luas tanam ha', 'luas tanam', 'planted area'])
  const harvestedIndex = headerIndex(headers, ['luas panen ha', 'luas panen', 'harvested area'])
  const productionIndex = headerIndex(headers, ['produksi ton', 'produksi', 'production'])
  const commodityIndex = headerIndex(headers, ['komoditas', 'commodity'])
  const noteIndex = headerIndex(headers, ['catatan', 'keterangan', 'note'])
  if ([yearIndex, monthIndex, provinceIndex, cityIndex].some(value => value < 0)) return []

  const provinceNames = new Map<string, string>(), cityNames = new Map<string, string>()
  values.slice(headerRow + 1).forEach(row => {
    const provinceCode = provinceCodeIndex >= 0 ? textValue(row[provinceCodeIndex]) : ''
    const provinceName = provinceIndex >= 0 ? textValue(row[provinceIndex]) : ''
    const cityCode = cityCodeIndex >= 0 ? textValue(row[cityCodeIndex]) : ''
    const cityName = cityIndex >= 0 ? textValue(row[cityIndex]) : ''
    if (provinceCode && provinceName && !/^\d+(?:\.\d+)?$/.test(provinceName)) provinceNames.set(provinceCode, provinceName)
    if (cityCode && cityName && !/^\d+(?:\.\d+)?$/.test(cityName)) cityNames.set(cityCode, cityName)
  })

  return values.slice(headerRow + 1).map(row => {
    const provinceCode = provinceCodeIndex >= 0 ? textValue(row[provinceCodeIndex]) : ''
    const cityCode = cityCodeIndex >= 0 ? textValue(row[cityCodeIndex]) : ''
    const rawProvince = textValue(row[provinceIndex]), rawCity = textValue(row[cityIndex])
    const province = rawProvince && !/^\d+(?:\.\d+)?$/.test(rawProvince) ? rawProvince : provinceNames.get(provinceCode) || ''
    const city = rawCity && !/^\d+(?:\.\d+)?$/.test(rawCity) ? rawCity : cityNames.get(cityCode) || ''
    return {
      year: textValue(row[yearIndex]), month: monthValue(row[monthIndex]), province, city, provinceCode, cityCode,
      planted: plantedIndex >= 0 ? numberValue(row[plantedIndex]) : 0,
      harvested: harvestedIndex >= 0 ? numberValue(row[harvestedIndex]) : 0,
      production: productionIndex >= 0 ? numberValue(row[productionIndex]) : 0,
      commodity: commodityIndex >= 0 ? textValue(row[commodityIndex]) : undefined,
      note: noteIndex >= 0 ? textValue(row[noteIndex]) : undefined, lat: 0, lng: 0
    }
  }).filter(row => row.year && row.province && row.city)
}

export const regions: Region[] = [
 {province:'Jawa Timur',city:'Banyuwangi',planted:1280,harvested:1110,production:1890,month:'Jan',year:'2024',lat:-8.22,lng:114.37},
 {province:'Jawa Tengah',city:'Grobogan',planted:1530,harvested:1350,production:2450,month:'Feb',year:'2024',lat:-7.15,lng:110.91},
 {province:'Jawa Barat',city:'Indramayu',planted:980,harvested:860,production:1420,month:'Mar',year:'2024',lat:-6.33,lng:108.32},
 {province:'Sulawesi Selatan',city:'Gowa',planted:870,harvested:690,production:1090,month:'Apr',year:'2024',lat:-5.31,lng:119.74},
 {province:'Aceh',city:'Pidie',planted:540,harvested:420,production:630,month:'May',year:'2024',lat:5.38,lng:95.95},
 {province:'NTB',city:'Lombok Timur',planted:760,harvested:540,production:890,month:'Jun',year:'2024',lat:-8.53,lng:116.53},
 {province:'Sumatera Utara',city:'Deli Serdang',planted:620,harvested:490,production:730,month:'Jul',year:'2024',lat:3.42,lng:98.7},
 {province:'DIY',city:'Gunungkidul',planted:410,harvested:260,production:350,month:'Aug',year:'2024',lat:-8.03,lng:110.61},
 {province:'Bali',city:'Buleleng',planted:360,harvested:310,production:510,month:'Sep',year:'2024',lat:-8.11,lng:115.09},
 {province:'Lampung',city:'Lampung Timur',planted:690,harvested:530,production:810,month:'Oct',year:'2024',lat:-5.11,lng:105.68},
 {province:'Jawa Timur',city:'Jember',planted:970,harvested:800,production:1250,month:'Nov',year:'2024',lat:-8.17,lng:113.7},
 {province:'Jawa Tengah',city:'Pati',planted:510,harvested:0,production:0,month:'Dec',year:'2024',lat:-6.75,lng:111.04}
]

