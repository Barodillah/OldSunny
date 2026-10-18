import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineCalculator,
  HiOutlinePaintBrush,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineBuildingStorefront,
  HiOutlineCog6Tooth,
  HiOutlineEye,
  HiOutlineCheckBadge,
  HiOutlineCursorArrowRays,
  HiOutlineKey,
  HiOutlineTicket,
  HiOutlineCalendar
} from 'react-icons/hi2'
import { RiCarLine } from 'react-icons/ri'

gsap.registerPlugin(ScrollTrigger)

export default function ServicesSection({ onOpenAiWithService }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const scrollTriggerRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeModal, setActiveModal] = useState(null)
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [cursorPos, setCursorPos] = useState({ x: -400, y: -400 })

  // 9 Complete Services in Fullscreen Horizontal Scroll
  const services = [
    {
      id: 'service_on_road',
      number: '01',
      title: 'Service On Road',
      category: 'Bantuan Lapangan',
      badge: 'EMERGENCY',
      statusNote: 'Siap Datang Servis di Lokasi Anda',
      icon: HiOutlineWrenchScrewdriver,
      accent: 'red',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
      summary: 'Layanan kunjungan teknisi resmi ke lokasi Anda khusus untuk unit yang mengalami mogok, tidak bisa menyala, atau tidak dapat dikendarai ke bengkel.',
      details: [
        'Syarat utama: Kendaraan mengalami mati total/tidak bisa dinyalakan atau tidak dapat dikendarai',
        'Waktu layanan: Beroperasi sesuai jam kerja resmi bengkel (Senin - Sabtu 08.00 - 16.30 WIB)',
        'Mekanik tersertifikasi dengan peralatan diagnosis mobile dan suku cadang orisinal Mitsubishi',
      ],
      tooltipNote: 'Sesuai jam kerja bengkel • Khusus unit tidak bisa jalan',
      aiAction: 'Panggil Service On Road',
    },
    {
      id: 'vehicles',
      number: '02',
      title: 'Katalog Mobil Baru',
      category: 'Showroom Resmi',
      badge: 'UNIT READY',
      statusNote: 'Stok Distributor Resmi Siap Kirim',
      icon: RiCarLine,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
      summary: 'Koleksi lengkap kendaraan keluarga dan niaga dengan kepastian harga On The Road (OTR) resmi tanpa biaya terselubung.',
      details: [
        'Harga OTR transparan tanpa biaya siluman atau pembebanan administrasi rahasia',
        'Unit baru dengan nomor rangka (VIN) terverifikasi distributor resmi pabrikan',
        'Test drive fleksibel dijadwalkan langsung ke rumah atau kantor Anda',
      ],
      tooltipNote: 'Garansi resmi ATPM • Simulasi OTR terbuka & test drive fleksibel',
      aiAction: 'Cek Katalog Unit',
    },
    {
      id: 'booking',
      number: '03',
      title: 'Servis Berkala & Booking',
      category: 'Bengkel Resmi',
      badge: 'SLOT REAL-TIME',
      statusNote: 'Booking Kalender Montir Bebas Antre',
      icon: HiOutlineWrenchScrewdriver,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0870ef816.72351873.webp',
      summary: 'Reservasi slot bengkel resmi secara digital dengan estimasi pengerjaan presisi dan montir tersertifikasi pabrik.',
      details: [
        'Sinkronisasi kalender stall bengkel dan mekanik secara real-time',
        'Servis berkala, tune-up, kuras oli mesin, hingga perbaikan kelistrikan terstandarisasi',
        'Laporan inspeksi digital multi-point check dikirim langsung ke smartphone Anda',
      ],
      tooltipNote: 'Bebas antrean fisik • Laporan inspeksi digital dikirim langsung',
      aiAction: 'Booking Slot Servis',
    },
    {
      id: 'credit',
      number: '04',
      title: 'Simulasi Kredit Terbuka',
      category: 'Pembiayaan Resmi',
      badge: 'SELALU TRANSPARAN',
      statusNote: 'Suku Bunga & DP Transparan',
      icon: HiOutlineCalculator,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0964447f8.27266986.png',
      summary: 'Kalkulasi uang muka (DP), angsuran bulanan, dan suku bunga resmi lembaga pembiayaan terdaftar dan diawasi OJK.',
      details: [
        'Transparansi suku bunga per tahun tanpa mark-up provisi rahasia dealer',
        'Pilihan tenor fleksibel 12 hingga 60 bulan dengan proteksi asuransi all-risk',
        'Persetujuan kredit cepat didampingi konsultan finansial tersertifikasi',
      ],
      tooltipNote: 'Lembaga pembiayaan resmi OJK • DP ringan & tenor hingga 5 tahun',
      aiAction: 'Hitung Simulasi Angsuran',
    },
    {
      id: 'bodypaint',
      number: '05',
      title: 'Cat & Body Repair Oven',
      category: 'Restorasi Bodi',
      badge: 'STANDAR PABRIK',
      statusNote: 'Ruang Oven Suhu Stabil Bebas Debu',
      icon: HiOutlinePaintBrush,
      accent: 'red',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf19f5415295.43153383.webp',
      summary: 'Pengecatan bodi kendaraan dengan formula warna asli pabrikan dan ruang oven bersuhu stabil bebas debu.',
      details: [
        'Formulasi pencampuran warna presisi computerized anti-belang',
        'Lapisan clear coat anti-UV tahan cuaca ekstrem dan goresan halus',
        'Garansi pengerjaan panel hingga 1 tahun pasca perbaikan bodi',
      ],
      tooltipNote: 'Cat computerized anti-belang • Garansi panel 1 tahun',
      aiAction: 'Konsultasi Perbaikan Bodi',
    },
    {
      id: 'trust',
      number: '06',
      title: 'Legalitas & Bebas Oknum',
      category: 'Transparansi Dealer',
      badge: 'ESCROW RESMI',
      statusNote: 'Rekening Resmi PT Sun Star Prima Motor',
      icon: HiOutlineShieldCheck,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6aca3f0eba26a5.94130516.webp',
      summary: 'Sistem perlindungan transaksi konsumen dengan rekening Virtual Account resmi atas nama badan hukum dealer.',
      details: [
        'Pembayaran HANYA sah ke Rekening Resmi PT Sun Star Prima Motor (BCA: 3425419999)',
        'Larangan keras transfer dana transaksi ke rekening pribadi staf atau salesman',
        'Verifikasi keaslian faktur, BPKB, dan surat serah terima kendaraan resmi',
      ],
      tooltipNote: '100% perlindungan dana nasabah • Anti transfer rekening pribadi',
      aiAction: 'Pelajari Rekening Resmi',
    },
    {
      id: 'accessories',
      number: '07',
      title: 'Aksesoris Resmi & Styling',
      category: 'Kustomisasi OEM',
      badge: 'PLUG & PLAY',
      statusNote: 'Garansi Kelistrikan Tetap Aman',
      icon: HiOutlineSparkles,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp',
      summary: 'Pilihan aksesoris resmi untuk meningkatkan kenyamanan, estetika, dan fungsionalitas kendaraan tanpa menggugurkan garansi pabrik.',
      details: [
        'Kaca film tolak panas tinggi, dashcam integrasi, dan audio premium OEM',
        'Pemasangan soket to soket tanpa memotong kabel asli bawaan pabrik',
        'Garansi kelistrikan kendaraan tetap berlaku 100% aman dan terlindungi',
      ],
      tooltipNote: 'Soket to soket plug & play • Garansi pabrik tidak hangus',
      aiAction: 'Lihat Paket Aksesoris',
    },
    {
      id: 'spareparts',
      number: '08',
      title: 'Suku Cadang & Sparepart Asli',
      category: 'Inventaris Pabrik',
      badge: '100% GENUINE OEM',
      statusNote: 'Barcode Otentikasi Terverifikasi',
      icon: HiOutlineCog6Tooth,
      accent: 'red',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a082701b82.14262272.webp',
      summary: 'Gudang suku cadang asli dan pelumas berbarcode distributor resmi dengan jaminan keaslian dan garansi penggantian.',
      details: [
        'Terhubung langsung ke sistem inventaris gudang pusat distributor nasional',
        'Barcode otentikasi pabrikan mencegah peredaran komponen imitasi atau palsu',
        'Pemasangan presisi oleh mekanik dengan sertifikasi keahlian pabrik',
      ],
      tooltipNote: 'Komponen 100% original distributor • Garansi penggantian suku cadang',
      aiAction: 'Cek Stok & Harga Suku Cadang',
    },
    {
      id: 'test_drive',
      number: '09',
      title: 'Uji Kemudi & Test Drive',
      category: 'Pengalaman Berkendara',
      badge: 'TEST DRIVE READY',
      statusNote: 'Bisa Diantar ke Rumah / Showroom',
      icon: HiOutlineKey,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf48c9b8f122.20055577.webp',
      summary: 'Sensasi kemudi langsung dengan unit test drive prima yang siap diantar ke rumah, kantor, atau dicoba di rute resmi dealer.',
      details: [
        'Pilihan lokasi fleksibel: pengujian di showroom resmi atau diantar langsung ke rumah/kantor Anda',
        'Didampingi product specialist terlatih untuk konsultasi fitur keselamatan aktif & kenyamanan berkendara',
        'Unit steril dan terawat prima, bahan bakar terisi, siap untuk rute tol maupun perkotaan',
      ],
      tooltipNote: 'Gratis 100% tanpa pungutan biaya • Diantar langsung ke rumah atau kantor',
      aiAction: 'Jadwalkan Test Drive',
    },
    {
      id: 'promo_event',
      number: '10',
      title: 'Promo & Event Spesial',
      category: 'Program Penjualan',
      badge: 'PENAWARAN TERBATAS',
      statusNote: 'Program Bunga 0% & DP Ringan',
      icon: HiOutlineTicket,
      accent: 'red',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ad36ecc0b0961.94264127.webp',
      summary: 'Penawaran promo musiman, paket DP ringan, bunga 0%, subsidi tukar-tambah (trade-in), serta gathering komunitas eksklusif.',
      details: [
        'Paket uang muka (DP) rendah, bunga 0% tenor tertentu, dan cicilan ringan resmi leasing rekanan',
        'Subsidi tukar-tambah (trade-in) kendaraan lama segala merk dengan appraisal transparan tertinggi',
        'Undangan eksklusif showroom gathering berhadiah langsung, lucky dip, dan voucher servis resmi',
      ],
      tooltipNote: 'Cashback resmi distributor • Lucky dip & voucher aksesoris gratis',
      aiAction: 'Cek Promo & Event Aktif',
    },
    {
      id: 'modern_dealer',
      number: '11',
      title: 'Dealer Masa Kini',
      category: 'Hospitality & Lounge',
      badge: '⭐ FASILITAS EKSKLUSIF',
      statusNote: 'Hospitalitas Bintang 5 Gratis Untuk Anda',
      icon: HiOutlineBuildingStorefront,
      accent: 'sunset',
      imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acd9f9872a8a7.97772027.jpeg',
      summary: 'Standar ruang tunggu modern dan fasilitas hospitalitas eksklusif: Shuttle Service, Noah Coffee, Playground & Cafe, dan Snack Corner.',
      details: [
        'Layanan antar-jemput eksekutif gratis saat mobil sedang diservis',
        'Voucher kopi spesialti gratis dari Noah Coffee untuk pelanggan dan keluarga',
        'Area playground anak ramah keluarga dan working cafe Wi-Fi 6',
      ],
      tooltipNote: 'Buka drawer fullscreen untuk melihat Shuttle, Noah Coffee, Playground & Snack!',
      aiAction: 'Tanya Fasilitas Eksklusif',
      isDealerMasaKini: true,
    },
  ]

  // GSAP Horizontal Scroll with Pinning (Active on Desktop and Mobile)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      const section = sectionRef.current
      if (!track || !section) return

      const getScrollDistance = () => {
        const viewportWidth = track.parentElement?.clientWidth || window.innerWidth
        return Math.max(0, track.scrollWidth - viewportWidth)
      }

      // Compact buffer after reaching the last card before smoothly unpinning to the next section
      const unpinBuffer = window.innerWidth <= 768 ? 40 : 80

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top 64px',
          end: () => `+=${getScrollDistance() + unpinBuffer}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            setScrollProgress(Math.round(p * 100))
            const idx = Math.min(Math.floor(p * services.length), services.length - 1)
            setActiveIndex(idx)
          },
        },
      })

      scrollTriggerRef.current = tween.scrollTrigger
    }, sectionRef)

    return () => ctx.revert()
  }, [services.length])

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock background scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModal])

  // Mouse move handler for floating interactive cursor tooltip
  const handleMouseMove = useCallback((e) => {
    setCursorPos({ x: e.clientX, y: e.clientY })
  }, [])

  // Smooth jump to specific card via GSAP ScrollTrigger
  const scrollToService = (index) => {
    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current
      const targetScroll = st.start + (index / (services.length - 1)) * (st.end - st.start)
      window.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
    setActiveIndex(index)
  }

  return (
    <section
      ref={sectionRef}
      className="fullscreen-services-stage stage-light-theme"
      id="layanan"
      onMouseMove={handleMouseMove}
    >
      {/* 1. HUD TOP BAR (Positioned below the sticky navbar) */}
      <header className="services-hud-header">
        <div className="hud-title-col">
          <h2 className="hud-main-heading">
            Jelajah Layanan Tanpa Henti
          </h2>
        </div>

        {/* Center Progress HUD */}
        <div className="hud-center-navigator">
          <div className="hud-counter-label">
            <span className="current-num">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="divider-slash">/</span>
            <span className="total-num">{String(services.length).padStart(2, '0')}</span>
            <span className="current-title-badge">
              {services[activeIndex]?.title}
            </span>
          </div>
          <div className="hud-progress-track" title={`Progres: ${scrollProgress}%`}>
            <div
              className="hud-progress-fill"
              style={{ width: `${Math.max(scrollProgress, 11)}%` }}
            />
          </div>
        </div>

        {/* Navigation Quick Jump Tabs */}
        <div className="hud-actions-col">
          <div className="hud-scroll-indicator">
            <HiOutlineCursorArrowRays size={15} className="hud-scroll-icon-anim" />
            <span className="hud-scroll-text-desktop">Scroll Mouse / Geser Layanan</span>
            <span className="hud-scroll-text-mobile">Geser Layanan →</span>
          </div>

          <div className="hud-nav-buttons">
            <button
              type="button"
              className="hud-arrow-btn"
              aria-label="Layanan Sebelumnya"
              disabled={activeIndex === 0}
              onClick={() => scrollToService(Math.max(activeIndex - 1, 0))}
            >
              <HiOutlineArrowLeft size={16} />
            </button>
            <button
              type="button"
              className="hud-arrow-btn"
              aria-label="Layanan Berikutnya"
              disabled={activeIndex === services.length - 1}
              onClick={() => scrollToService(Math.min(activeIndex + 1, services.length - 1))}
            >
              <HiOutlineArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FULLSCREEN HORIZONTAL SLIDES TRACK */}
      <div className="fullscreen-services-viewport">
        <div ref={trackRef} className="fullscreen-cards-track">
          {services.map((item, idx) => {
            const IconComponent = item.icon
            const isSpecialDealer = item.isDealerMasaKini
            const isActive = activeIndex === idx

            return (
              <article
                key={item.id}
                className={`widescreen-service-panel ${item.accent === 'red' ? 'accent-panel-red' : 'accent-panel-sunset'} ${isSpecialDealer ? 'panel-dealer-flagship' : ''
                  } ${isActive ? 'is-active-panel' : ''}`}
                onMouseEnter={() => setActiveTooltip(item)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* Visual Column (Left Half: Full-height photo with cinematic gradient & watermark) */}
                <div
                  className="panel-visual-col"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                  <div className="panel-media-gradient-overlay" />

                  {/* Watermark Index Number */}
                  <div className="panel-watermark-number">{item.number}</div>

                  {/* Top Badges */}
                  <div className="panel-visual-top">
                    <span className="panel-pill-badge">{item.badge}</span>
                    <div className="panel-icon-circle">
                      <IconComponent size={22} />
                    </div>
                  </div>

                  {/* Bottom Visual Highlights */}
                  <div className="panel-visual-bottom">
                    <div className="panel-status-pill">
                      <span className="status-indicator-dot" />
                      <span>{item.statusNote}</span>
                    </div>
                  </div>
                </div>

                {/* Content Column (Right Half: Clean light luxury typography, checklists, actions) */}
                <div className="panel-content-col">
                  <div className="panel-content-header">
                    <div className="panel-category-row">
                      <span className="panel-category-label">{item.category}</span>
                      <span className="panel-index-small">Layanan #{item.number}</span>
                    </div>
                    <h3 className="panel-service-title">{item.title}</h3>
                    <p className="panel-service-summary">{item.summary}</p>
                  </div>

                  {/* Features Bullet List */}
                  <div className="panel-features-section">
                    <span className="panel-features-heading">Standar Transparansi & Keunggulan:</span>
                    <ul className="panel-checklist">
                      {item.details.map((point, pIdx) => (
                        <li key={pIdx} className="panel-check-item">
                          <HiOutlineCheckBadge size={18} className="check-icon-svg" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="panel-actions-row">
                    {isSpecialDealer ? (
                      <Link
                        to="/facilities"
                        className="btn-flagship-dealer-trigger"
                      >
                        <HiOutlineEye size={18} />
                        <span>Buka Fasilitas Eksklusif</span>
                      </Link>
                    ) : item.id === 'accessories' ? (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <Link
                          to="/accessories"
                          className="btn-panel-secondary"
                        >
                          <span>Katalog Aksesoris</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : item.id === 'promo_event' ? (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <Link
                          to="/promo"
                          className="btn-panel-secondary"
                        >
                          <span>Lihat Promo &amp; Event</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : item.id === 'service_on_road' ? (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <Link
                          to="/service-on-road"
                          className="btn-panel-secondary"
                        >
                          <span>Panggil</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : item.id === 'vehicles' ? (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <Link
                          to="/vehicles"
                          className="btn-panel-secondary"
                        >
                          <span>Pilih Unit</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : item.id === 'trust' ? (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <Link
                          to="/organization"
                          className="btn-panel-secondary"
                        >
                          <span>Struktur Organisasi</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : item.id === 'booking' ? (
                      <div className="panel-standard-btn-group">
                        <Link to="/booking" className="btn-panel-primary">
                          <HiOutlineCalendar size={17} />
                          <span>Booking Slot Servis</span>
                        </Link>

                        <Link to="/booking" className="btn-panel-secondary">
                          <span>Jadwalkan Servis</span>
                          <HiOutlineArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="panel-standard-btn-group">
                        <button
                          type="button"
                          className="btn-panel-primary"
                          onClick={() => {
                            if (onOpenAiWithService) onOpenAiWithService(item)
                            else setActiveModal(item)
                          }}
                        >
                          <HiOutlineChatBubbleLeftRight size={17} />
                          <span>{item.aiAction}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-panel-secondary"
                          onClick={() => setActiveModal(item)}
                        >
                          <span>Pelajari Standar</span>
                          <HiOutlineArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* 3. FLOATING INTERACTIVE CURSOR TOOLTIP */}
      {activeTooltip && (
        <div
          className="fullscreen-cursor-tooltip"
          style={{
            transform: `translate3d(${cursorPos.x + 20}px, ${cursorPos.y + 20}px, 0)`,
          }}
        >
          <div className="tooltip-glass-box">
            <img
              src={activeTooltip.imageUrl}
              alt={activeTooltip.title}
              className="tooltip-glass-thumb"
            />
            <div className="tooltip-info-col">
              <div className="tooltip-badge-row">
                <span className="tooltip-cat-badge">{activeTooltip.badge}</span>
                <span className="tooltip-num-tag">#{activeTooltip.number}</span>
              </div>
              <strong className="tooltip-heading">{activeTooltip.title}</strong>
              <span className="tooltip-caption">{activeTooltip.tooltipNote}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Standard Service Detail Modal (Mounted directly to document.body) */}
      {activeModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-info">
                  <div className={`modal-icon-wrapper ${activeModal.accent === 'red' ? 'is-accent-red' : 'is-accent-sunset'}`}>
                    <activeModal.icon size={22} />
                  </div>
                  <div>
                    <h3 className="modal-title">{activeModal.title}</h3>
                    <span className="modal-badge-label">
                      {activeModal.category} • Layanan #{activeModal.number} • {activeModal.badge}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-trigger"
                  aria-label="Tutup modal"
                  onClick={() => setActiveModal(null)}
                >
                  <HiOutlineXMark size={20} />
                </button>
              </div>

              <div className="modal-content">
                <p className="modal-lead-text">{activeModal.summary}</p>

                <h4 className="modal-section-title">Standar Pengerjaan & Jaminan Transparansi:</h4>
                <ul className="modal-feature-list">
                  {activeModal.details.map((detail, idx) => (
                    <li key={idx} className="modal-feature-item">
                      <HiOutlineCheck size={16} className="feature-check-icon" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="modal-transparency-note">
                  <HiOutlineShieldCheck size={20} className="note-info-icon" />
                  <p>
                    Seluruh estimasi biaya, waktu pengerjaan, dan suku cadang untuk{' '}
                    <strong>{activeModal.title}</strong> dicatat secara resmi ke dalam sistem
                    dealer tanpa pungutan liar di luar tagihan resmi PT Sun Star Prima Motor.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-primary"
                  onClick={() => {
                    if (onOpenAiWithService) onOpenAiWithService(activeModal)
                    setActiveModal(null)
                  }}
                >
                  <HiOutlineChatBubbleLeftRight size={16} />
                  <span>Konsultasikan via Asisten AI 24/7</span>
                </button>
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setActiveModal(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}
