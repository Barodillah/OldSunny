/**
 * tenureHelper.js
 * Utility untuk menghitung masa kerja / pengalaman kerja secara dinamis
 * berdasarkan tanggal bergabung (join date) dari tahun ke tahun.
 */

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const MONTH_NAMES_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

/**
 * Memeriksa apakah string merupakan format tanggal YYYY-MM-DD
 */
export function isIsoDate(val) {
  if (!val || typeof val !== 'string') return false
  return /^\d{4}-\d{2}-\d{2}/.test(val.trim())
}

/**
 * Menghitung masa kerja secara dinamis dari tanggal bergabung.
 * Jika input adalah string teks lama (misal "12 Tahun Pengalaman" atau "4 Tahun"),
 * fungsi ini mempertahankan teks tersebut untuk backward-compatibility.
 *
 * @param {string} tenureVal - Nilai tanggal "YYYY-MM-DD" atau string warisan
 * @param {object} options - { suffix: string, includeMonths: boolean, defaultText: string }
 * @returns {string} - Hasil perhitungan dinamis, misal "4 Tahun", "6 Bulan", dsb.
 */
export function calculateTenure(tenureVal, options = {}) {
  if (!tenureVal) return '-'
  if (typeof tenureVal !== 'string') return String(tenureVal)

  const cleanVal = tenureVal.trim()
  if (!cleanVal) return '-'

  // Jika bukan format tanggal (misal data lama: "12 Tahun Pengalaman", "4 Tahun", "Baru Bergabung")
  if (!isIsoDate(cleanVal)) {
    return cleanVal
  }

  const parts = cleanVal.split('T')[0].split('-').map(Number)
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return cleanVal
  }

  const [year, month, day] = parts
  const joinDate = new Date(year, month - 1, day)
  const today = new Date()

  let years = today.getFullYear() - joinDate.getFullYear()
  let months = today.getMonth() - joinDate.getMonth()
  let days = today.getDate() - joinDate.getDate()

  if (days < 0) {
    months -= 1
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  // Jika tanggal di masa depan atau baru saja hari ini
  if (years < 0) {
    return options.defaultText || 'Baru Bergabung'
  }

  const suffix = options.suffix ? ` ${options.suffix}` : ''

  if (years === 0) {
    if (months <= 0) {
      return options.defaultText || 'Baru Bergabung'
    }
    return `${months} Bulan${suffix}`
  }

  if (options.includeMonths && months > 0) {
    return `${years} Tahun ${months} Bulan${suffix}`
  }

  return `${years} Tahun${suffix}`
}

/**
 * Mengubah nilai tenure dari database ke format aman untuk input type="date" (YYYY-MM-DD).
 * Jika nilai berupa teks lama, mencoba mengambil tahun fallback atau kosong agar date picker tidak error.
 *
 * @param {string} val - Nilai dari database
 * @param {string|number} fallbackYear - Tahun fallback (opsional)
 * @returns {string} - "YYYY-MM-DD" atau ""
 */
export function parseDateForInput(val, fallbackYear) {
  if (!val || typeof val !== 'string') {
    if (fallbackYear && /^\d{4}$/.test(String(fallbackYear).trim())) {
      return `${String(fallbackYear).trim()}-01-01`
    }
    return ''
  }

  const clean = val.trim()
  if (isIsoDate(clean)) {
    return clean.split('T')[0]
  }

  if (fallbackYear && /^\d{4}$/.test(String(fallbackYear).trim())) {
    return `${String(fallbackYear).trim()}-01-01`
  }

  // Coba cari pola tahun 4 digit di dalam teks lama
  const yearMatch = clean.match(/\b(19\d\d|20\d\d)\b/)
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`
  }

  return ''
}

/**
 * Memformat tanggal YYYY-MM-DD ke teks bahasa Indonesia yang ramah (contoh: "15 Mar 2022").
 * Mengembalikan null jika input bukan tanggal YYYY-MM-DD.
 *
 * @param {string} dateStr
 * @param {boolean} shortMonth
 * @returns {string|null}
 */
export function formatIndonesianDate(dateStr, shortMonth = true) {
  if (!isIsoDate(dateStr)) return null

  const clean = dateStr.trim().split('T')[0]
  const [y, m, d] = clean.split('-').map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null

  const monthList = shortMonth ? MONTH_NAMES_SHORT_ID : MONTH_NAMES_ID
  const monthName = monthList[m - 1] || ''

  return `${d} ${monthName} ${y}`
}
