import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineCheck,
  HiOutlineCalendar,
  HiOutlineXMark,
  HiOutlineTag,
  HiOutlineSquares2X2,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2'
import {
  RiCustomerService2Line,
  RiCarLine,
  RiPercentLine,
  RiCoupon2Line,
  RiUserStarLine
} from 'react-icons/ri'
import './Promo.css'

// 6 Promo & Event Data Items for Mitsubishi Sun Star Prima Motor Margahayu
const PROMO_ITEMS = [
  {
    id: 'bunga-0-xforce-xpander',
    title: 'Program Bunga 0% Tenor hingga 2 Tahun',
    category: 'leasing',
    categoryLabel: 'Leasing',
    badge: 'BUNGA 0%',
    badgeTheme: 'red',
    targetVehicles: 'New XFORCE, New Xpander, New Xpander Cross',
    validity: 'Berlaku s/d Akhir Bulan Ini',
    highlight: 'Angsuran bebas bunga hingga 24 bulan resmi pembiayaan Dipo Star Finance.',
    bullets: [
      'Bunga 0% dengan pilihan tenor 1 hingga 2 tahun',
      'Gratis asuransi All-Risk komprehensif selama 1 tahun',
      'Bebas biaya provisi dan administrasi kredit resmi'
    ],
    terms: [
      'Berlaku khusus untuk aplikasi kredit via Dipo Star Finance',
      'Uang muka (DP) minimal mengikuti ketentuan paket reguler',
      'Promo dapat digabungkan dengan program gratis servis berkala hingga 50.000 KM'
    ]
  },
  {
    id: 'dp-ringan-xpander',
    title: 'Paket DP Ringan Mulai Rp 15 Jutaan',
    category: 'leasing',
    categoryLabel: 'Leasing',
    badge: 'DP RINGAN',
    badgeTheme: 'dark',
    targetVehicles: 'New Xpander & New Xpander Cross',
    validity: 'Kuota Terbatas 25 Unit',
    highlight: 'Bawa pulang MPV keluarga idaman dengan uang muka terjangkau dan cicilan fleksibel.',
    bullets: [
      'Uang muka (DP) super ringan mulai Rp 15 jutaan',
      'Pilihan tenor fleksibel panjang hingga 6 tahun',
      'Proses persetujuan (approval) cepat 1x24 jam kerja'
    ],
    terms: [
      'Kelengkapan berkas data nasabah lengkap dan valid',
      'Berlaku untuk seluruh varian New Xpander dan Xpander Cross',
      'Unit siap kirim (ready stock) selama kuota alokasi tersedia'
    ]
  },
  {
    id: 'subsidi-trade-in',
    title: 'Subsidi Tukar Tambah (Trade-In) s/d Rp 10 Juta',
    category: 'leasing',
    categoryLabel: 'Leasing',
    badge: 'SUBSIDI TRADE-IN',
    badgeTheme: 'red',
    targetVehicles: 'Semua Lini Mitsubishi Baru',
    validity: 'Berlaku Setiap Hari',
    highlight: 'Tukar mobil lama segala merk dengan harga appraisal pasar tertinggi plus subsidi langsung.',
    bullets: [
      'Tambahan subsidi cashback langsung hingga Rp 10.000.000',
      'Appraisal transparan di tempat oleh tim spesialis tersertifikasi',
      'Proses tukar tambah cepat, mobil lama langsung jadi pengurang DP unit baru'
    ],
    terms: [
      'Mobil lama bebas dari indikasi bekas tabrakan berat atau banjir',
      'Dokumen kendaraan lama (STNK, BPKB, faktur) lengkap dan sah',
      'Berlaku untuk upgrade ke unit Xpander, Xpander Cross, XFORCE, atau Pajero Sport'
    ]
  },
  {
    id: 'special-rate-pajero',
    title: 'Special Rate & Paket Mewah New Pajero Sport',
    category: 'leasing',
    categoryLabel: 'Leasing',
    badge: 'SPECIAL RATE',
    badgeTheme: 'red',
    targetVehicles: 'New Pajero Sport Dakar & Exceed',
    validity: 'Berlaku s/d Akhir Bulan Ini',
    highlight: 'Bunga rendah kompetitif mulai 2.5% dan paket bonus proteksi ekstra untuk SUV legendaris.',
    bullets: [
      'Bunga ringan kompetitif mulai 2.5% p.a. tenor 1 tahun',
      'Gratis paket Smart Package servis berkala & suku cadang hingga 50.000 KM / 4 tahun',
      'Bonus kaca film V-Kool kelas VIP dan karpet bludru eksklusif'
    ],
    terms: [
      'Paket leasing resmi rekanan Sun Star Prima Motor',
      'Berlaku untuk Pajero Sport Dakar 4x2, Dakar Ultimate, dan Exceed',
      'Garansi mesin resmi APM tetap berlaku 3 tahun / 100.000 KM'
    ]
  },
  {
    id: 'showroom-event-gathering',
    title: 'Showroom Weekend Gathering & Test Drive Berhadiah',
    category: 'event',
    categoryLabel: 'Event Showroom',
    badge: 'EVENT DEALER',
    badgeTheme: 'dark',
    targetVehicles: 'Terbuka untuk Seluruh Keluarga & Komunitas',
    validity: 'Setiap Sabtu & Minggu (09.00 - 16.00 WIB)',
    highlight: 'Rasakan impresi berkendara New XFORCE & Xpander sambil menikmati hospitalitas dealer.',
    bullets: [
      'Free flow Noah Coffee espresso bar & snack playground anak 100% gratis',
      'Hadiah langsung lucky dip merchandise eksklusif bagi setiap peserta test drive',
      'Hadiah doorprize alat elektronik rumah tangga bagi SPK yang diterbitkan di lokasi event'
    ],
    terms: [
      'Lokasi acara: Showroom Mitsubishi Sun Star Prima Motor Margahayu (Jl. Ir. H. Juanda No. 35)',
      'Peserta test drive wajib membawa SIM A aktif yang masih berlaku',
      'Keluarga dan anak-anak dapat menikmati arena playground Kids Zone'
    ]
  },
  {
    id: 'servis-oli-diskon',
    title: 'Promo Servis Berkala & Diskon Sparepart 15%',
    category: 'service',
    categoryLabel: 'After Sales',
    badge: 'AFTER SALES',
    badgeTheme: 'red',
    targetVehicles: 'Seluruh Kendaraan Penumpang & Komersial Mitsubishi',
    validity: 'Senin s/d Jumat (Booking H-1)',
    highlight: 'Perawatan berkala di bengkel resmi terpercaya dengan teknisi profesional bersertifikat.',
    bullets: [
      'Diskon jasa servis berkala 10% dan genuine parts 15%',
      'Gratis general check up menyeluruh pada 15 titik vital kendaraan',
      'Gratis 1 liter oli mesin resmi Mitsubishi Motors Genuine Oil (MMGO)'
    ],
    terms: [
      'Wajib melakukan booking servis minimal 1 hari sebelumnya (H-1)',
      'Berlaku di bengkel resmi Sun Star Prima Motor Margahayu',
      'Dapat digabungkan dengan fasilitas antar jemput shuttle service'
    ]
  }
]

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function Promo({ onOpenAiChat }) {
  const location = useLocation()
  const [promos, setPromos] = useState(PROMO_ITEMS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPromo, setSelectedPromo] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Real-time dynamic fetch from API
  useEffect(() => {
    let isMounted = true
    const fetchLivePromos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/promos`, {
          headers: { Accept: 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setPromos(json.data)
          }
        }
      } catch (err) {
        // Silently fallback to PROMO_ITEMS
      }
    }

    fetchLivePromos()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter items
  const filteredPromos = useMemo(() => {
    if (activeCategory === 'all') return promos
    return promos.filter((item) => item.category === activeCategory)
  }, [promos, activeCategory])

  // WhatsApp link generator
  const createWhatsAppLink = (item) => {
    const text = `Halo Dealer Mitsubishi Sun Star Prima Motor Margahayu,\n\nSaya tertarik dengan penawaran:\n• Program: ${item.title}\n• Kategori: ${item.category_label || item.categoryLabel}\n• Unit: ${item.target_vehicles || item.targetVehicles}\n\nMohon info simulasi detail dan persyaratan untuk klaim promo ini. Terima kasih!`
    return `https://wa.me/6281318747300?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="promo-page-root">
      {/* 1. EDITORIAL POSTER HERO HEADER (INSPIRED BY REFERENCE IMAGE) */}
      <header className="promo-editorial-hero">
        {/* Angled Red Graphic Banner Ribbon running top-right */}
        <div className="promo-ribbon-container" aria-hidden="true">
          <div className="promo-ribbon-stripe">
            <span className="ribbon-text">
              % off &nbsp;&nbsp;&nbsp; 50 % off &nbsp;&nbsp;&nbsp; BUNGA 0% &nbsp;&nbsp;&nbsp; DP RINGAN &nbsp;&nbsp;&nbsp; % off &nbsp;&nbsp;&nbsp; SUBSIDI TRADE-IN &nbsp;&nbsp;&nbsp; 50 % off
            </span>
          </div>
          <div className="promo-ribbon-angle">
            <span className="ribbon-angle-text">% off</span>
          </div>
        </div>

        <div className="promo-hero-inner">

          {/* Minimalist Uppercase Kicker */}
          <span className="promo-kicker">THE DEAL</span>

          {/* Big Editorial Headline with strong typography */}
          <h1 className="promo-main-heading">
            Dapatkan <span className="text-red">Bunga 0%</span><br />
            atau Pilih Paket<br />
            DP Ringan Mulai<br />
            <span className="text-red">10% OFF!</span>
          </h1>

          <p className="promo-sub-heading">
            Program penjualan resmi PT Sun Star Prima Motor Margahayu. Penawaran bunga 0%, paket DP terjangkau,
            subsidi tukar tambah tertinggi, serta gathering showroom berhadiah langsung bulan ini.
          </p>

          <div className="promo-hero-cta-row">

            <button
              type="button"
              className="btn-promo-hero-secondary"
              onClick={() => {
                if (onOpenAiChat) {
                  onOpenAiChat({
                    id: 'promo_consult',
                    title: 'Konsultasi Promo & Event Aktif Bulan Ini'
                  })
                } else {
                  window.location.href = '/#sunny-assistant'
                }
              }}
            >
              <RiCustomerService2Line size={18} />
              <span>Tanya Asisten Sunny</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CLEAN & SIMPLE CARD LIST SECTION */}
      <main className="promo-list-section">
        <div className="promo-list-container">
          {/* Simple Filter Pills */}
          <div className="promo-filter-bar">
            <div className="promo-filter-pills" role="tablist">
              <button
                type="button"
                className={`promo-pill ${activeCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <HiOutlineSquares2X2 size={15} />
                <span>Semua Promo ({promos.length})</span>
              </button>

              <button
                type="button"
                className={`promo-pill ${activeCategory === 'leasing' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('leasing')}
              >
                <RiPercentLine size={15} />
                <span>Leasing</span>
              </button>

              <button
                type="button"
                className={`promo-pill ${activeCategory === 'event' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('event')}
              >
                <RiCoupon2Line size={15} />
                <span>Event Showroom</span>
              </button>

              <button
                type="button"
                className={`promo-pill ${activeCategory === 'service' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('service')}
              >
                <HiOutlineSparkles size={15} />
                <span>After Sales</span>
              </button>
            </div>

            <span className="promo-status-label">
              ✓ Seluruh promo dijamin 100% resmi leasing &amp; distributor APM
            </span>
          </div>

          {/* Clean Card List */}
          <div className="promo-cards-grid">
            {filteredPromos.map((item) => {
              const bulletsList = Array.isArray(item.bullets) ? item.bullets : []
              const badgeClass = item.badge_theme || item.badgeTheme || 'red'
              const vehiclesText = item.target_vehicles || item.targetVehicles || ''
              const hasActiveLink = Boolean(item.action_link_active && item.action_link)

              return (
                <article key={item.id} className="promo-clean-card">
                  <div className="card-top-row">
                    <span className={`card-badge badge-${badgeClass}`}>
                      {item.badge}
                    </span>
                    <div className="card-validity">
                      <HiOutlineCalendar size={14} className="cal-icon" />
                      <span>{item.validity}</span>
                    </div>
                  </div>

                  <h2 className="card-title">{item.title}</h2>

                  {vehiclesText && (
                    <div className="card-vehicles-tag">
                      <RiCarLine size={15} className="car-icon" />
                      <span>{vehiclesText}</span>
                    </div>
                  )}

                  <p className="card-highlight">{item.highlight}</p>

                  {/* Clean concise bullet points */}
                  {bulletsList.length > 0 && (
                    <ul className="card-bullets-list">
                      {bulletsList.map((bullet, bIdx) => (
                        <li key={bIdx} className="bullet-item">
                          <HiOutlineCheck size={15} className="check-icon" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Clean bottom action row */}
                  <div className="card-action-row">
                    {item.category === 'leasing' && (
                      <Link
                        to="/sales"
                        className="btn-card-action btn-card-leasing"
                      >
                        <RiUserStarLine size={17} />
                        <span>{hasActiveLink ? 'Pilih Sales' : 'Pilih Sales Terbaik'}</span>
                      </Link>
                    )}

                    {item.category === 'event' && (
                      hasActiveLink ? (
                        <a
                          href={item.action_link}
                          target={item.action_link.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="btn-card-action btn-card-event"
                        >
                          <HiOutlineCalendar size={17} />
                          <span>{item.action_button_label || 'Ikuti Event'}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn-card-action btn-card-event"
                          onClick={() => {
                            if (onOpenAiChat) {
                              onOpenAiChat({
                                id: item.id,
                                title: `Registrasi Event: ${item.title}`
                              })
                            } else {
                              window.dispatchEvent(
                                new CustomEvent('sunny_ask_question', {
                                  detail: {
                                    query: `Halo Sunny, saya ingin registrasi dan mengikuti event: ${item.title}. Mohon info jadwal dan konfirmasi keikutsertaan saya.`
                                  }
                                })
                              )
                            }
                          }}
                        >
                          <HiOutlineCalendar size={17} />
                          <span>{item.action_button_label || 'Ikuti Event'}</span>
                        </button>
                      )
                    )}

                    {item.category === 'service' && (
                      <Link
                        to="/booking"
                        className="btn-card-action btn-card-service"
                      >
                        <HiOutlineWrenchScrewdriver size={17} />
                        <span>{hasActiveLink ? 'Booking' : 'Booking Servis'}</span>
                      </Link>
                    )}

                    {/* Tombol Klaim Promo jika action_link aktif (berada di antara tombol utama dan Syarat & Ketentuan) */}
                    {item.category !== 'event' && hasActiveLink && (
                      <a
                        href={item.action_link}
                        target={item.action_link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="btn-card-action btn-card-claim"
                      >
                        <RiCoupon2Line size={17} />
                        <span>{item.action_button_label || 'Klaim Promo'}</span>
                      </a>
                    )}

                    <button
                      type="button"
                      className="btn-card-terms"
                      onClick={() => setSelectedPromo(item)}
                    >
                      <span>Syarat &amp; Ketentuan</span>
                      <HiOutlineArrowRight size={14} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </main>

      {/* 3. MODAL SYARAT & KETENTUAN */}
      {selectedPromo && (
        <div
          className="promo-modal-backdrop"
          onClick={() => setSelectedPromo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="promo-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="promo-modal-close"
              onClick={() => setSelectedPromo(null)}
              aria-label="Tutup syarat & ketentuan"
            >
              <HiOutlineXMark size={20} />
            </button>

            <span className="modal-badge">{selectedPromo.badge}</span>
            <h3 className="modal-title">{selectedPromo.title}</h3>
            <p className="modal-unit">Unit yang berlaku: <strong>{selectedPromo.targetVehicles}</strong></p>

            <div className="modal-terms-content">
              <h4 className="terms-heading">Syarat &amp; Ketentuan Program:</h4>
              <ul className="terms-list">
                {selectedPromo.terms.map((term, tIdx) => (
                  <li key={tIdx} className="term-item">
                    <span className="term-num">{tIdx + 1}.</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-btn-row">
              <button
                type="button"
                className="btn-modal-sunny"
                onClick={() => {
                  const currentItem = selectedPromo
                  setSelectedPromo(null)
                  const queryText = `Halo Sunny, saya ingin menanyakan lebih detail mengenai program: ${currentItem.title} (${currentItem.categoryLabel}). Mohon informasi lengkap serta syarat dan ketentuannya.`

                  if (onOpenAiChat) {
                    onOpenAiChat({
                      id: currentItem.id,
                      title: currentItem.title
                    })
                  } else {
                    window.dispatchEvent(
                      new CustomEvent('sunny_ask_question', {
                        detail: { query: queryText }
                      })
                    )
                  }
                }}
              >
                <HiOutlineSparkles size={19} />
                <span>Tanyakan Program / Event ke Sunny</span>
              </button>
              <button
                type="button"
                className="btn-modal-back"
                onClick={() => setSelectedPromo(null)}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
