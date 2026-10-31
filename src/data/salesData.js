import { calculateTenure, isIsoDate } from '../utils/tenureHelper.js'

export const DEFAULT_SALES_PHOTO =
  'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'

/**
 * Transform data sales dari API MySQL (PortalSales) ke format komponen publik
 * Skor NPS, Indeks CSI, PKT Time Rate dikosongkan dan bernilai '-'
 */
export function transformSalesFromApi(apiSalesList) {
  if (!Array.isArray(apiSalesList)) return []

  return apiSalesList.map((s, index) => {
    const rankNum = index + 1
    const rankStr = String(rankNum).padStart(2, '0')
    const photo =
      s.photo_url && typeof s.photo_url === 'string' && s.photo_url.trim()
        ? s.photo_url.trim()
        : DEFAULT_SALES_PHOTO

    // Formatting masa kerja
    const dynamicTenure = calculateTenure(s.tenure)
    const joinedYear =
      s.joined_year ||
      (s.tenure && isIsoDate(s.tenure) ? s.tenure.split('-')[0] : '2024')
    const joinedSince = `Bergabung sejak ${joinedYear}`

    // Theme & direction styling untuk Top 3
    let themeStyle = 'card-cream-hero'
    let slideDirection = 'top'
    let isInverted = false

    if (index === 1) {
      themeStyle = 'card-dark'
      slideDirection = 'bottom'
      isInverted = true
    } else if (index === 2) {
      themeStyle = 'card-accent-red'
      slideDirection = 'top'
      isInverted = false
    }

    const initials = s.name
      ? s.name
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'SL'

    const cleanPhone = s.phone
      ? s.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')
      : '6281288347777'

    return {
      id: s.id || `sales-${rankNum}`,
      rank: rankStr,
      rankNumber: rankNum,
      isInverted,
      slideDirection,
      name: s.name || 'Sales Consultant',
      title: s.position || 'Sales Consultant',
      tenure: dynamicTenure,
      joinedYear,
      npsScore: '-',
      nik: s.nik || 'SNY-SLS-XXXX',
      joinedSince,
      specialization: s.specialization || 'Konsultasi Kendaraan Resmi Mitsubishi',
      photoUrl: photo,
      csiScore: '-',
      pktTimeRate: '-',
      themeStyle,
      whatsappNumber: cleanPhone,
      whatsappMessage: `Halo Bpk/Ibu ${s.name}, saya ingin konsultasi mengenai unit kendaraan resmi di Mitsubishi Sun Margahayu.`,
      initials,
      supervisor: s.supervisor || null,
      raw: s,
    }
  })
}

export const TOP_SALES_TRADING_CARDS = [
  {
    id: 'champion',
    rank: '01',
    rankNumber: 1,
    isInverted: false,
    slideDirection: 'top',
    name: 'Agnes',
    title: 'Senior Sales Executive',
    tenure: '6 Tahun',
    joinedYear: '2020',
    npsScore: '-',
    nik: 'SNY-SLS-0412',
    joinedSince: 'Bergabung sejak 2020',
    specialization: 'SUV & Varian Hybrid',
    photoUrl: DEFAULT_SALES_PHOTO,
    csiScore: '-',
    pktTimeRate: '-',
    themeStyle: 'card-cream-hero',
    whatsappNumber: '6281289001234',
    whatsappMessage:
      'Halo Bpk/Ibu Agnes, saya ingin konsultasi kendaraan resmi melalui rekomendasi Sales Satisfaction Mitsubishi Sun Margahayu.',
  },
  {
    id: 'rank-2',
    rank: '02',
    rankNumber: 2,
    isInverted: true,
    slideDirection: 'bottom',
    name: 'Amin',
    title: 'Sales Specialist',
    tenure: '4 Tahun',
    joinedYear: '2022',
    npsScore: '-',
    nik: 'SNY-SLS-0588',
    joinedSince: 'Bergabung sejak 2022',
    specialization: 'Family MPV & Crossover',
    photoUrl: DEFAULT_SALES_PHOTO,
    csiScore: '-',
    pktTimeRate: '-',
    themeStyle: 'card-dark',
    whatsappNumber: '6281377889900',
    whatsappMessage:
      'Halo Bpk/Ibu Amin, saya ingin konsultasi kendaraan resmi melalui rekomendasi Sales Satisfaction Mitsubishi Sun Margahayu.',
  },
  {
    id: 'rank-3',
    rank: '03',
    rankNumber: 3,
    isInverted: false,
    slideDirection: 'top',
    name: 'Bambang Prakoso',
    title: 'Junior Sales Advisor',
    tenure: '2.5 Tahun',
    joinedYear: '2023',
    npsScore: '-',
    nik: 'SNY-SLS-0721',
    joinedSince: 'Bergabung sejak 2023',
    specialization: 'Uji Jalan & Pembiayaan Syariah',
    photoUrl: DEFAULT_SALES_PHOTO,
    csiScore: '-',
    pktTimeRate: '-',
    themeStyle: 'card-accent-red',
    whatsappNumber: '6281544332211',
    whatsappMessage:
      'Halo Bpk Bambang Prakoso, saya ingin konsultasi kendaraan resmi melalui rekomendasi Sales Satisfaction Mitsubishi Sun Margahayu.',
  },
]

export const NEXT_RANKED_SALES = [
  {
    id: 'sales-4',
    rank: '04',
    rankNumber: 4,
    name: 'Siti Rahmawati',
    title: 'Corporate Fleet Consultant',
    nik: 'SNY-SLS-0335',
    joinedSince: 'Bergabung sejak 2019',
    joinedYear: '2019',
    tenure: '7 Tahun',
    specialization: 'Fleet Niaga & Komersial (L300 & Triton)',
    photoUrl: DEFAULT_SALES_PHOTO,
    initials: 'SR',
    npsScore: '-',
    csiScore: '-',
    pktTimeRate: '-',
    whatsappNumber: '6281122334455',
    whatsappMessage:
      'Halo Ibu Siti Rahmawati, saya ingin konsultasi pengadaan unit fleet dari Mitsubishi Sun Margahayu.',
  },
  {
    id: 'sales-5',
    rank: '05',
    rankNumber: 5,
    name: 'Dimas Nugroho',
    title: 'Electric Vehicle (EV) Advisor',
    nik: 'SNY-SLS-0649',
    joinedSince: 'Bergabung sejak 2023',
    joinedYear: '2023',
    tenure: '3 Tahun',
    specialization: 'Mobil Listrik & Ekosistem Pengisian Daya',
    photoUrl: DEFAULT_SALES_PHOTO,
    initials: 'DN',
    npsScore: '-',
    csiScore: '-',
    pktTimeRate: '-',
    whatsappNumber: '6281233445566',
    whatsappMessage:
      'Halo Bpk Dimas Nugroho, saya ingin konsultasi unit kendaraan listrik dari Mitsubishi Sun Margahayu.',
  },
  {
    id: 'sales-6',
    rank: '06',
    rankNumber: 6,
    name: 'Anisa Permata',
    title: 'Customer Relationship Consultant',
    nik: 'SNY-SLS-0810',
    joinedSince: 'Bergabung sejak 2024',
    joinedYear: '2024',
    tenure: '2 Tahun',
    specialization: 'Compact Crossover & First-Time Buyers',
    photoUrl: DEFAULT_SALES_PHOTO,
    initials: 'AP',
    npsScore: '-',
    csiScore: '-',
    pktTimeRate: '-',
    whatsappNumber: '6281355667788',
    whatsappMessage:
      'Halo Ibu Anisa Permata, saya ingin konsultasi mobil pertama melalui Mitsubishi Sun Margahayu.',
  },
  {
    id: 'sales-7',
    rank: '07',
    rankNumber: 7,
    name: 'Fajar Maulana',
    title: 'Senior Financing Advisor',
    nik: 'SNY-SLS-0482',
    joinedSince: 'Bergabung sejak 2021',
    joinedYear: '2021',
    tenure: '5 Tahun',
    specialization: 'Simulasi Bunga Rendah & Tenor Fleksibel',
    photoUrl: DEFAULT_SALES_PHOTO,
    initials: 'FM',
    npsScore: '-',
    csiScore: '-',
    pktTimeRate: '-',
    whatsappNumber: '6281466778899',
    whatsappMessage:
      'Halo Bpk Fajar Maulana, saya ingin konsultasi pembiayaan kendaraan Mitsubishi Sun Margahayu.',
  },
  {
    id: 'sales-8',
    rank: '08',
    rankNumber: 8,
    name: 'Hendra Wijaya',
    title: 'Trade-In & Valuation Specialist',
    nik: 'SNY-SLS-0520',
    joinedSince: 'Bergabung sejak 2022',
    joinedYear: '2022',
    tenure: '4 Tahun',
    specialization: 'Tukar Tambah Semua Merk (Fair Price)',
    photoUrl: DEFAULT_SALES_PHOTO,
    initials: 'HW',
    npsScore: '-',
    csiScore: '-',
    pktTimeRate: '-',
    whatsappNumber: '6281577889900',
    whatsappMessage:
      'Halo Bpk Hendra Wijaya, saya ingin konsultasi tukar tambah kendaraan di Mitsubishi Sun Margahayu.',
  },
]

export const ALL_SALES_DIRECTORY = [
  ...TOP_SALES_TRADING_CARDS,
  ...NEXT_RANKED_SALES,
]
