import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalculator,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2'
import {
  RiEmotionHappyLine,
  RiLightbulbLine,
  RiAlertLine,
  RiCustomerService2Line
} from 'react-icons/ri'

gsap.registerPlugin(ScrollTrigger)

// 4 Ekspresi Maskot Sunny sesuai aset resmi
const SUNNY_EXPRESSIONS = [
  {
    id: 'senang',
    label: 'Senang',
    shortTitle: 'Konsultasi',
    title: 'Sambutan & Konsultasi Ramah',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acffcd78c6424.40233068.png',
    quote: 'Halo! Saya Sunny, asisten virtual resmi Dealer Sunny. Siap bantu temukan kendaraan idaman Anda kapan saja!',
    badge: 'Aktif Siaga 24 Jam',
    icon: RiEmotionHappyLine,
    topicAction: {
      id: 'general_consult',
      title: 'Konsultasi Rekomendasi Unit Mobil Baru',
    },
  },
  {
    id: 'berfikir',
    label: 'Berfikir',
    shortTitle: 'Hitung Kredit',
    title: 'Kalkulator Simulasi Kredit',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acffcd78c33d4.03984600.png',
    quote: 'Sedang menghitung simulasi DP dan angsuran bulanan yang paling pas untuk anggaran Anda, transparan tanpa biaya tersembunyi!',
    badge: 'Hitung Kredit Cepat',
    icon: RiLightbulbLine,
    topicAction: {
      id: 'credit_sim',
      title: 'Simulasi Kredit & Perhitungan Angsuran Transparan',
    },
  },
  {
    id: 'kaget',
    label: 'Kaget',
    shortTitle: 'Anti-Penipuan',
    title: 'Proteksi Anti-Penipuan',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acffcd78c0434.75758336.png',
    quote: 'Peringatan penting! Jangan pernah transfer ke rekening perorangan ya. Semua pembayaran resmi hanya via PT Dealer Transparan.',
    badge: 'Keamanan Transaksi',
    icon: RiAlertLine,
    topicAction: {
      id: 'anti_fraud',
      title: 'Verifikasi Staf & Keamanan Rekening Resmi Dealer',
    },
  },
  {
    id: 'berempati',
    label: 'Berempati',
    shortTitle: 'Darurat 24/7',
    title: 'Bantuan Darurat (SOS)',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acffcd78bbb23.46001204.png',
    quote: 'Mobil Anda mengalami kendala di jalan? Jangan panik, tim derek dan mekanik resmi kami siap meluncur ke lokasi Anda 24/7.',
    badge: 'Layanan Derek 24/7',
    icon: RiCustomerService2Line,
    topicAction: {
      id: 'emergency',
      title: 'Bantuan Darurat 24/7 (SOS Derek & Teknisi Bengkel)',
    },
  },
]

export default function SunnyAssistantSection({ onOpenAiChat }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [slideCycleKey, setSlideCycleKey] = useState(0)

  const sectionRef = useRef(null)
  const cardContainerRef = useRef(null)
  const mascotImgRef = useRef(null)
  const speechBubbleRef = useRef(null)
  const speedLinesRef = useRef(null)
  const contentColRef = useRef(null)

  const activeMood = SUNNY_EXPRESSIONS[currentIndex]

  // Preload semua gambar maskot di awal
  useEffect(() => {
    SUNNY_EXPRESSIONS.forEach((expr) => {
      const img = new Image()
      img.src = expr.imageUrl
    })
  }, [])

  // Auto-slide setiap 3 detik
  const handleNextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SUNNY_EXPRESSIONS.length)
    setSlideCycleKey((k) => k + 1)
  }, [])

  const handlePrevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SUNNY_EXPRESSIONS.length) % SUNNY_EXPRESSIONS.length)
    setSlideCycleKey((k) => k + 1)
  }, [])

  const handleSelectSlide = (index) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
    setSlideCycleKey((k) => k + 1)
  }

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      handleNextSlide()
    }, 3000)
    return () => clearInterval(timer)
  }, [isPaused, handleNextSlide])

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    if (!sectionRef.current || !cardContainerRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardContainerRef.current,
        {
          y: 45,
          opacity: 0,
          scale: 0.98,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      if (mascotImgRef.current) {
        gsap.fromTo(
          mascotImgRef.current,
          {
            x: -35,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            delay: 0.15,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (contentColRef.current) {
        gsap.fromTo(
          contentColRef.current,
          {
            x: 25,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Smooth GSAP Micro-Transition saat ganti gambar/slide (setiap 3 detik atau klik slider)
  useEffect(() => {
    if (mascotImgRef.current) {
      gsap.fromTo(
        mascotImgRef.current,
        {
          scale: 0.93,
          opacity: 0.45,
          y: 6,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.42,
          ease: 'back.out(1.5)',
        }
      )
    }

    if (speechBubbleRef.current) {
      gsap.fromTo(
        speechBubbleRef.current,
        {
          opacity: 0.35,
          y: 5,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        }
      )
    }
  }, [currentIndex])

  const handleLaunchChat = (topic) => {
    if (onOpenAiChat) {
      onOpenAiChat(topic || activeMood.topicAction)
    }
  }

  return (
    <section
      ref={sectionRef}
      className="sunny-assistant-section"
      id="sunny-assistant"
      aria-labelledby="sunny-main-title"
    >
      <div className="sunny-section-container">
        {/* SHOWCASE CARD DENGAN BRANDING AKSEN MERAH DAN KUNING DEALER */}
        <div
          ref={cardContainerRef}
          className="sunny-showcase-card"
          onMouseEnter={() => {
            setIsHovered(true)
            setIsPaused(true)
          }}
          onMouseLeave={() => {
            setIsHovered(false)
            setIsPaused(false)
          }}
        >
          {/* Top Decorative Gradient Accent Bar (Merah ke Kuning) */}
          <div className="sunny-card-top-accent" aria-hidden="true" />

          {/* Ambient Glows: Red & Yellow */}
          <div className="sunny-card-glow glow-red" aria-hidden="true" />
          <div className="sunny-card-glow glow-yellow" aria-hidden="true" />

          {/* LEFT SIDE: MASCOT CHARACTER & SPEED LINES (GAYA POKI REFERENSI) */}
          <div className="sunny-mascot-col">
            {/* Speed Lines Behind Mascot (Vivid Yellow Accent) */}
            <div ref={speedLinesRef} className="mascot-speed-lines" aria-hidden="true">
              <span className="speed-bar bar-1" />
              <span className="speed-bar bar-2" />
              <span className="speed-bar bar-3" />
            </div>

            {/* Mascot Image Display with Halo Lighting */}
            <div className={`sunny-character-wrap ${isHovered ? 'is-hovered' : ''}`}>
              <div className="mascot-warm-halo" aria-hidden="true" />
              <img
                ref={mascotImgRef}
                src={activeMood.imageUrl}
                alt={`Maskot Sunny Ekspresi ${activeMood.label}`}
                className="sunny-mascot-img"
                loading="eager"
              />

              {/* Status Badge Over Mascot */}
              <div className="sunny-mascot-status-pill">
                <span className="status-indicator-dot" />
                <span>{activeMood.badge}</span>
              </div>
            </div>

            {/* Dynamic Speech Bubble Under Mascot */}
            <div ref={speechBubbleRef} className="sunny-speech-bubble" role="status" aria-live="polite">
              <div className="bubble-tail" aria-hidden="true" />
              <div className="bubble-content">
                <span className="bubble-mood-tag">{activeMood.label}</span>
                <p className="bubble-quote-text">
                  &ldquo;{activeMood.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: EDITORIAL TITLE, COPY & 3-SECOND SLIDER UX */}
          <div ref={contentColRef} className="sunny-content-col">

            {/* Giant Title (Matching Reference 'POKI') */}
            <h2 id="sunny-main-title" className="sunny-giant-title">
              SUNNY
            </h2>

            {/* Narrative Description Paragraph */}
            <p className="sunny-narrative-copy">
              Kenalkan <strong>Sunny</strong>, asisten virtual resmi Dealer Sunny. Siap mendampingi dan menjawab seluruh kebutuhan otomotif Anda 24 jam penuh: mulai dari konsultasi unit mobil, kalkulasi kredit terbuka tanpa biaya siluman, jadwal test drive, hingga proteksi keamanan transaksi dari oknum.
            </p>

            {/* UX SLIDER DENGAN ROTASI OTOMATIS SETIAP 3 DETIK */}
            <div className="sunny-slider-container">
              {/* Slider Header: Ticker & Prev/Next Navigation */}
              <div className="sunny-slider-header">
                <div className="slider-mode-meta">
                  <span className="slider-timer-indicator">
                    <span
                      className={`timer-pulse-dot ${isPaused ? 'is-paused' : ''}`}
                      title={isPaused ? 'Rotasi dijeda saat kursor berada di atas kartu' : 'Rotasi otomatis aktif setiap 3 detik'}
                    />
                    <span className="slider-expression-text">
                      <span className="slider-expression-mood">{activeMood.label}</span>
                    </span>
                  </span>
                </div>

                <div className="slider-nav-arrows">
                  <button
                    type="button"
                    className="slider-arrow-btn"
                    onClick={handlePrevSlide}
                    aria-label="Ekspresi Sebelumnya"
                  >
                    <HiChevronLeft size={16} />
                  </button>
                  <span className="slider-counter">
                    0{currentIndex + 1} / 0{SUNNY_EXPRESSIONS.length}
                  </span>
                  <button
                    type="button"
                    className="slider-arrow-btn"
                    onClick={handleNextSlide}
                    aria-label="Ekspresi Berikutnya"
                  >
                    <HiChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 4 Segmented Progress Bars (Clickable) */}
              <div className="sunny-slider-segments" role="tablist">
                {SUNNY_EXPRESSIONS.map((expr, idx) => {
                  const isActive = idx === currentIndex
                  return (
                    <button
                      key={expr.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`slider-segment-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => handleSelectSlide(idx)}
                    >
                      <div className="segment-track">
                        {isActive && (
                          <div
                            key={slideCycleKey}
                            className={`segment-fill ${isPaused ? 'is-paused' : ''}`}
                          />
                        )}
                      </div>
                      <div className="segment-label-wrap">
                        <span className="segment-num">0{idx + 1}</span>
                        <span className="segment-title">{expr.shortTitle}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Action CTAs (Aksen Merah & Kuning) */}
            <div className="sunny-action-row">
              <button
                type="button"
                className="btn-sunny-chat-primary"
                onClick={() => handleLaunchChat(activeMood.topicAction)}
              >
                <HiOutlineChatBubbleLeftRight size={19} />
                <span>Mulai Chat dengan Sunny</span>
                <HiOutlineArrowRight size={16} className="btn-arrow-icon" />
              </button>

              <button
                type="button"
                className="btn-sunny-feature-secondary"
                onClick={() => handleLaunchChat(SUNNY_EXPRESSIONS[1].topicAction)}
              >
                <HiOutlineCalculator size={18} />
                <span>Tanya Simulasi Kredit</span>
              </button>
            </div>

            {/* Value Guarantees Footer Bar */}
            <div className="sunny-guarantee-bar">
              <div className="guarantee-item">
                <HiOutlineShieldCheck size={16} className="text-yellow-brand" />
                <span>Terverifikasi Sistem Dealer</span>
              </div>
              <span className="guarantee-dot">•</span>
              <div className="guarantee-item">
                <span>Respon Cepat 24 Jam</span>
              </div>
              <span className="guarantee-dot">•</span>
              <div className="guarantee-item">
                <span>Privasi Data Aman</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

