import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineLockClosed,
  HiOutlineMagnifyingGlass,
  HiOutlineClock,
  HiOutlineServerStack,
  HiOutlineWrenchScrewdriver,
  HiOutlinePhone
} from 'react-icons/hi2'
import {
  RiWhatsappLine,
  RiCarLine,
  RiCalendarCheckLine,
  RiUserStarLine,
  RiPercentLine
} from 'react-icons/ri'
import './ErrorPage.css'

const ERROR_CONFIGS = {
  '400': {
    code: '400',
    status: 'Bad Request',
    badge: 'HTTP 400 // BAD REQUEST',
    title: 'Permintaan Tidak Valid',
    headline: 'Format Permintaan Tidak Dapat Diproses',
    description: 'Server sistem tidak dapat memahami permintaan Anda karena struktur parameter URL tidak sesuai, format data rusak, atau sesi penjelajahan tidak valid.',
    advice: 'Periksa kembali URL yang Anda tuju, pastikan tidak ada karakter terpotong, atau coba muat ulang halaman.',
    icon: HiOutlineExclamationTriangle,
    themeClass: 'theme-400',
    primaryAction: { type: 'reload', label: 'Muat Ulang Halaman' },
    secondaryAction: { type: 'home', label: 'Kembali ke Beranda' }
  },
  '403': {
    code: '403',
    status: 'Forbidden',
    badge: 'HTTP 403 // FORBIDDEN ACCESS',
    title: 'Akses Ditolak & Terproteksi',
    headline: 'Area Memerlukan Otorisasi Khusus',
    description: 'Anda tidak memiliki hak otorisasi yang sah untuk membuka direktori atau berkas sistem internal ini. Area ini dibatasi khusus untuk pengguna terverifikasi.',
    advice: 'Jika Anda staf resmi Mitsubishi Sun Margahayu, silakan masuk melalui Portal Internal atau hubungi Administrator IT dealer.',
    icon: HiOutlineLockClosed,
    themeClass: 'theme-403',
    primaryAction: { type: 'portal', label: 'Login Portal Dealer' },
    secondaryAction: { type: 'home', label: 'Kembali ke Beranda' }
  },
  '404': {
    code: '404',
    status: 'Not Found',
    badge: 'HTTP 404 // NOT FOUND',
    title: 'Halaman Tidak Ditemukan',
    headline: 'Jejak Halaman Tidak Tersedia',
    description: 'Tautan yang Anda tuju mungkin telah dipindahkan, dinonaktifkan, atau terdapat kesalahan ketik pada alamat URL di bilah peramban Anda.',
    advice: 'Silakan gunakan tautan navigasi di bawah ini untuk menjelajahi katalog mobil baru, penawaran promo, atau jadwal booking servis resmi.',
    icon: HiOutlineMagnifyingGlass,
    themeClass: 'theme-404',
    primaryAction: { type: 'home', label: 'Kembali ke Beranda' },
    secondaryAction: { type: 'vehicles', label: 'Lihat Katalog Mobil' }
  },
  '429': {
    code: '429',
    status: 'Too Many Requests',
    badge: 'HTTP 429 // RATE LIMIT EXCEEDED',
    title: 'Terlalu Banyak Permintaan',
    headline: 'Batas Frekuensi Akses Sementara Tercapai',
    description: 'Sistem mendeteksi aktivitas penjelajahan atau pengiriman data yang terlalu cepat dari koneksi Anda. Pembatasan ini diterapkan otomatis untuk menjaga stabilitas & keamanan server dealer.',
    advice: 'Pendinginan sistem sedang berlangsung. Mohon tunggu beberapa saat sebelum mencoba memuat ulang kembali.',
    icon: HiOutlineClock,
    themeClass: 'theme-429',
    hasCountdown: true,
    primaryAction: { type: 'retry', label: 'Coba Lagi Sekarang' },
    secondaryAction: { type: 'home', label: 'Kembali ke Beranda' }
  },
  '500': {
    code: '500',
    status: 'Internal Server Error',
    badge: 'HTTP 500 // SERVER EXCEPTION',
    title: 'Kendala Teknis Internal',
    headline: 'Terjadi Gangguan Pada Server Sistem',
    description: 'Server kami mengalami kendala tidak terduga saat memproses tanggapan data. Masalah ini bersumber dari sisi teknis sistem, bukan dari gawai maupun koneksi internet Anda.',
    advice: 'Tim teknis kami otomatis menerima laporan status ini. Silakan coba kembali beberapa saat lagi atau hubungi layanan WhatsApp bantuan.',
    icon: HiOutlineServerStack,
    themeClass: 'theme-500',
    primaryAction: { type: 'reload', label: 'Muat Ulang Halaman' },
    secondaryAction: { type: 'whatsapp', label: 'Hubungi WhatsApp Bantuan' }
  },
  '503': {
    code: '503',
    status: 'Service Unavailable',
    badge: 'HTTP 503 // MAINTENANCE MODE',
    title: 'Layanan Dalam Pemeliharaan',
    headline: 'Peningkatan Sistem Sedang Berlangsung',
    description: 'Sistem web dealer sedang menjalani pemeliharaan berkala terjadwal demi meningkatkan keandalan, kecepatan akses, dan keamanan data transaksi Anda.',
    advice: 'Showroom dan bengkel resmi kami tetap melayani Anda secara langsung. Layanan darurat 24 jam tetap aktif via telepon resmi.',
    icon: HiOutlineWrenchScrewdriver,
    themeClass: 'theme-503',
    primaryAction: { type: 'emergency', label: 'Hubungi Hotline Darurat' },
    secondaryAction: { type: 'home', label: 'Kembali ke Beranda' }
  }
}

const QUICK_RECOVERY_LINKS = [
  {
    title: 'Katalog Kendaraan',
    desc: 'Lihat New XFORCE, Pajero Sport, Xpander & Triton',
    to: '/vehicles',
    icon: RiCarLine
  },
  {
    title: 'Booking Servis',
    desc: 'Jadwalkan perawatan berkala tanpa antre lama',
    to: '/booking',
    icon: RiCalendarCheckLine
  },
  {
    title: 'Pilih Sales Terbaik',
    desc: 'Konsultasi simulasi kredit & harga OTR resmi',
    to: '/sales',
    icon: RiUserStarLine
  },
  {
    title: 'Promo & Diskon',
    desc: 'Program DP ringan, bunga 0% & bonus aksesoris',
    to: '/promo',
    icon: RiPercentLine
  }
]

export default function ErrorPage({ code: codeProp }) {
  const { code: codeParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active error code: prop > url param > default 404
  const activeCode = String(codeProp || codeParam || '404')
  const config = ERROR_CONFIGS[activeCode] || ERROR_CONFIGS['404']

  // 429 countdown logic (30 seconds countdown)
  const [countdown, setCountdown] = useState(30)
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeCode, location.pathname])

  useEffect(() => {
    if (!config.hasCountdown) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanRetry(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeCode, config.hasCountdown])

  const handleAction = (actionType) => {
    switch (actionType) {
      case 'reload':
        window.location.reload()
        break
      case 'portal':
        navigate('/portal/login')
        break
      case 'vehicles':
        navigate('/vehicles')
        break
      case 'whatsapp':
        window.open('https://wa.me/6285183325604?text=Halo%20CS%20Manager%20Mitsubishi%20Sun%20Margahayu,%20saya%20mendapati%20kendala%20saat%20mengakses%20web.', '_blank')
        break
      case 'emergency':
        window.location.href = 'tel:02188347777'
        break
      case 'retry':
        if (canRetry) {
          window.location.reload()
        } else {
          setCountdown(30)
        }
        break
      case 'home':
      default:
        navigate('/')
        break
    }
  }

  const IconComponent = config.icon

  return (
    <main className="error-page-wrapper" role="main" aria-label={`Halaman Error ${config.code}`}>
      <div className="error-bg-decoration" aria-hidden="true" />
      <div className="error-brand-strip" aria-hidden="true" />

      <div className="error-container">
        {/* Main Error Showcase Card */}
        <section className="error-hero-card">
          <div className="error-watermark-number" aria-hidden="true">
            {config.code}
          </div>

          {/* Top Status Badge */}
          <div className="error-badge-row">
            <div className={`error-status-pill ${config.themeClass}`}>
              <span className="error-pill-dot" />
              <span>{config.badge}</span>
            </div>
            <span className="error-dealer-meta">
              • PT Sun Star Prima Motor Margahayu
            </span>
          </div>

          {/* Main Error Content */}
          <div className="error-main-content">
            <div className={`error-icon-box ${config.themeClass}`}>
              <IconComponent size={30} />
            </div>

            <h1 className="error-headline">
              <span className="error-headline-red">{config.code}</span> — {config.title}
            </h1>

            <p className="error-description">
              {config.description}
            </p>

            <div className={`error-advice-card ${config.themeClass}`}>
              <div>
                <strong>Panduan Sistem: </strong>
                {config.advice}
              </div>
            </div>

            {/* 429 Specific Rate-Limit Countdown Bar */}
            {config.hasCountdown && (
              <div className="error-countdown-block">
                <div className="countdown-top-info">
                  <span>Waktu tunggu pemulihan koneksi:</span>
                  <span className="countdown-timer-value">
                    {countdown > 0 ? `${countdown} detik` : 'Siap Dicoba Kembali'}
                  </span>
                </div>
                <div className="countdown-progress-bar">
                  <div
                    className="countdown-progress-fill"
                    style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="error-cta-group">
            <button
              type="button"
              className="btn-error-primary"
              onClick={() => handleAction(config.primaryAction.type)}
            >
              {config.primaryAction.type === 'home' && <HiOutlineHome size={18} />}
              {config.primaryAction.type === 'reload' && <HiOutlineArrowPath size={18} />}
              {config.primaryAction.type === 'retry' && <HiOutlineArrowPath size={18} />}
              {config.primaryAction.type === 'portal' && <HiOutlineLockClosed size={18} />}
              {config.primaryAction.type === 'emergency' && <HiOutlinePhone size={18} />}
              <span>{config.primaryAction.label}</span>
            </button>

            <button
              type="button"
              className="btn-error-secondary"
              onClick={() => {
                if (config.secondaryAction.type === 'home') {
                  navigate('/')
                } else if (config.secondaryAction.type === 'vehicles') {
                  navigate('/vehicles')
                } else if (config.secondaryAction.type === 'whatsapp') {
                  window.open('https://wa.me/6285183325604', '_blank')
                } else {
                  navigate(-1)
                }
              }}
            >
              <HiOutlineArrowLeft size={16} />
              <span>{config.secondaryAction.label}</span>
            </button>

            <a
              href="https://wa.me/6285183325604?text=Halo%20Bantuan%20Mitsubishi%20Sun%20Margahayu,%20saya%20butuh%20bantuan%20terkait%20halaman%20web."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-error-emergency"
            >
              <RiWhatsappLine size={18} />
              <span>Bantuan Cepat via WhatsApp (CS Manager)</span>
            </a>
          </div>
        </section>

        {/* Quick Recovery Navigation Grid */}
        <section className="error-quick-recovery" aria-label="Rute Populer yang Tersedia">
          <h2 className="recovery-section-title">
            <span>Rute Populer yang Mungkin Anda Cari</span>
          </h2>

          <div className="recovery-grid">
            {QUICK_RECOVERY_LINKS.map((item, idx) => {
              const ItemIcon = item.icon
              return (
                <Link key={idx} to={item.to} className="recovery-card">
                  <div className="recovery-icon-circle">
                    <ItemIcon />
                  </div>
                  <div className="recovery-card-title">
                    <span>{item.title}</span>
                    <HiOutlineChevronRight size={15} className="recovery-card-arrow" />
                  </div>
                  <p className="recovery-card-desc">{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
