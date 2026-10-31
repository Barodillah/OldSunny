import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineCheckBadge,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
} from 'react-icons/hi2'
import {
  RiAwardLine,
  RiWhatsappLine,
  RiShieldCheckLine,
} from 'react-icons/ri'
import {
  TOP_SALES_TRADING_CARDS,
  NEXT_RANKED_SALES,
  DEFAULT_SALES_PHOTO,
  transformSalesFromApi,
} from '../data/salesData.js'
import './SalesList.css'

gsap.registerPlugin(ScrollTrigger)

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function SalesList() {
  const location = useLocation()
  const [salesList, setSalesList] = useState([])
  const [selectedConsultantModal, setSelectedConsultantModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const highlightSectionRef = useRef(null)
  const tradingCardsContainerRef = useRef(null)
  const cursorPopRef = useRef(null)
  const [hoveredConsultant, setHoveredConsultant] = useState(
    TOP_SALES_TRADING_CARDS[0]
  )

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Fetch data sales dari database MySQL
  useEffect(() => {
    let isMounted = true

    const fetchSales = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/sales?status=active`)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const transformed = transformSalesFromApi(json.data)
          if (isMounted) {
            setSalesList(transformed)
            setHoveredConsultant(transformed[0])
          }
        }
      } catch (err) {
        console.warn('Fallback ke data statis sales:', err)
      }
    }

    fetchSales()

    return () => {
      isMounted = false
    }
  }, [])

  // Top 3 (Rank 01 - 03) & Next Ranked (Rank 04+)
  const topSalesCards = useMemo(() => {
    return salesList.length > 0
      ? salesList.slice(0, 3)
      : TOP_SALES_TRADING_CARDS
  }, [salesList])

  const nextRankedSales = useMemo(() => {
    return salesList.length > 0
      ? salesList.slice(3)
      : NEXT_RANKED_SALES
  }, [salesList])

  // Cursor Pop Position Tracking
  const updateCursorPopPosition = (clientX, clientY, immediate = false) => {
    if (!cursorPopRef.current) return
    const popWidth = 295
    const popHeight = 230
    const padding = 16

    let posX = clientX + 18
    let posY = clientY + 18

    // Flip to left if it would overflow right viewport edge
    if (posX + popWidth > window.innerWidth - padding) {
      posX = clientX - popWidth - 18
    }

    // Flip to top if it would overflow bottom viewport edge
    if (posY + popHeight > window.innerHeight - padding) {
      posY = clientY - popHeight - 18
    }

    posX = Math.max(padding, posX)
    posY = Math.max(padding, posY)

    if (immediate) {
      gsap.set(cursorPopRef.current, { x: posX, y: posY })
    } else {
      gsap.to(cursorPopRef.current, {
        x: posX,
        y: posY,
        duration: 0.16,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleCardMouseEnter = (consultant, e) => {
    setHoveredConsultant(consultant)

    if (cursorPopRef.current) {
      updateCursorPopPosition(e.clientX, e.clientY, true)
      gsap.killTweensOf(cursorPopRef.current)
      gsap.set(cursorPopRef.current, { visibility: 'visible' })
      gsap.fromTo(
        cursorPopRef.current,
        { scale: 0.88, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.22,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        }
      )
    }
  }

  const handleCardMouseMove = (e) => {
    updateCursorPopPosition(e.clientX, e.clientY, false)
  }

  const handleCardMouseLeave = () => {
    if (cursorPopRef.current) {
      gsap.to(cursorPopRef.current, {
        scale: 0.88,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          if (cursorPopRef.current) {
            gsap.set(cursorPopRef.current, { visibility: 'hidden' })
          }
        },
      })
    }
  }

  // GSAP ScrollTrigger Entrance Animation (Sama persis seperti SalesOfTheMonthSection.jsx)
  useEffect(() => {
    if (!highlightSectionRef.current || !tradingCardsContainerRef.current) return

    const cards = tradingCardsContainerRef.current.querySelectorAll('.trading-card-item')
    const headerCopy = highlightSectionRef.current.querySelector('.hall-header-copy')

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerCopy) {
        gsap.fromTo(
          headerCopy,
          {
            y: 32,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: highlightSectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 2. Trading cards staggered entrance and photo slide shutter
      cards.forEach((card, i) => {
        const shutter = card.querySelector('.card-photo-shutter')
        const photo = card.querySelector('.card-portrait-img')
        const direction = card.getAttribute('data-slide-direction') || 'top'

        // Card container entrance
        gsap.fromTo(
          card,
          {
            y: 70,
            opacity: 0,
            scale: 0.94,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tradingCardsContainerRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Photo shutter slide open: revealing photo from top or bottom
        if (shutter) {
          const targetYPercent = direction === 'bottom' ? 102 : -102
          gsap.fromTo(
            shutter,
            { yPercent: 0 },
            {
              yPercent: targetYPercent,
              duration: 1.1,
              delay: 0.18 + i * 0.15,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: tradingCardsContainerRef.current,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }

        // Photo smooth settle
        if (photo) {
          gsap.fromTo(
            photo,
            { scale: 1.22 },
            {
              scale: 1,
              duration: 1.25,
              delay: 0.18 + i * 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: tradingCardsContainerRef.current,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })
    }, highlightSectionRef)

    return () => ctx.revert()
  }, [])

  // Keyboard navigation for escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedConsultantModal) {
        setSelectedConsultantModal(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedConsultantModal])

  const openWhatsApp = (consultant) => {
    const text = encodeURIComponent(
      consultant.whatsappMessage ||
        `Halo Bpk/Ibu ${consultant.name}, saya ingin konsultasi mengenai unit kendaraan resmi di Mitsubishi Sun Margahayu.`
    )
    window.open(
      `https://wa.me/${consultant.whatsappNumber}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // Filtered Next Ranked Sales (Rank 04 ke atas)
  const filteredRankedSales = useMemo(() => {
    let list = nextRankedSales

    if (selectedCategory !== 'all') {
      list = list.filter((item) => {
        const spec = (
          (item.specialization || '') +
          ' ' +
          (item.title || '')
        ).toLowerCase()
        if (selectedCategory === 'fleet')
          return (
            spec.includes('fleet') ||
            spec.includes('niaga') ||
            spec.includes('l300') ||
            spec.includes('triton') ||
            spec.includes('armada') ||
            spec.includes('koperasi')
          )
        if (selectedCategory === 'ev')
          return (
            spec.includes('ev') ||
            spec.includes('listrik') ||
            spec.includes('pengisian')
          )
        if (selectedCategory === 'crossover')
          return (
            spec.includes('crossover') ||
            spec.includes('mpv') ||
            spec.includes('first-time') ||
            spec.includes('suv')
          )
        if (selectedCategory === 'finance')
          return (
            spec.includes('bunga') ||
            spec.includes('pembiayaan') ||
            spec.includes('tukar') ||
            spec.includes('trade-in') ||
            spec.includes('cicilan') ||
            spec.includes('promo')
          )
        return true
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.specialization.toLowerCase().includes(q) ||
          item.nik.toLowerCase().includes(q) ||
          item.rank.includes(q)
      )
    }

    return list
  }, [nextRankedSales, selectedCategory, searchQuery])

  return (
    <div className="sales-page">
      {/* ====================================================================
          SECTION 1: TOP 3 HIGHLIGHT (PERSIS SEPERTI SalesOfTheMonthSection.jsx)
          ==================================================================== */}
      <section
        ref={highlightSectionRef}
        className="sales-highlight-wrapper"
        aria-labelledby="highlight-title"
      >
        {/* Background Video */}
        <div className="sales-video-wrapper">
          <video
            className="sales-bg-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://bewhy.id/wp-content/uploads/asset_6ad1f10e16a491.82974221.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Ambient Overlay */}
        <div className="sales-video-overlay" />

        <div className="sales-section-container">
          <div className="hall-header-row">
            <div className="hall-header-copy">
              <h2 id="highlight-title" className="hall-title">
                Sales Satisfaction of the Month
              </h2>
              <p className="hall-subtitle">
                Top 3 Sales berperingkat tertinggi dengan dedikasi prima, skor
                kepuasan Net Promoter Score (NPS) tertinggi, dan respon konsultasi
                terbaik.
              </p>
            </div>
          </div>

          {/* 3 TRADING CARDS GRID (DENGAN ANIMASI SHUTTER DAN HOVER POPUP) */}
          <div ref={tradingCardsContainerRef} className="trading-cards-grid">
            {topSalesCards.map((consultant) => {
              const isInverted = consultant.isInverted

              return (
                <article
                  key={consultant.rank || consultant.id}
                  className={`trading-card-item ${consultant.themeStyle} ${
                    isInverted ? 'is-inverted' : ''
                  }`}
                  data-slide-direction={consultant.slideDirection}
                  onMouseEnter={(e) => handleCardMouseEnter(consultant, e)}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={() => setSelectedConsultantModal(consultant)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedConsultantModal(consultant)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {isInverted ? (
                    /* INVERTED CARD (RANK 2: TEXT ON TOP, PHOTO ON BOTTOM) */
                    <div className="card-inner-wrapper">
                      {/* Top Content Block */}
                      <div className="card-content-block">
                        <div className="card-top-nav-row">
                          {/* Circular Emblem with Rank Number */}
                          <div
                            className="circle-rank-emblem"
                            aria-label={`Peringkat ${consultant.rank}`}
                          >
                            <span className="emblem-number">
                              {consultant.rank}
                            </span>
                          </div>

                          {/* Tenure & NPS Badge */}
                          <div className="card-meta-badge">
                            <span className="badge-since">
                              Since {consultant.joinedYear}
                            </span>
                            <span className="badge-nps">
                              {consultant.npsScore === '-'
                                ? '-'
                                : `${consultant.npsScore} NPS`}
                            </span>
                          </div>
                        </div>

                        <div className="card-identity-group">
                          <h3 className="card-consultant-name">
                            {consultant.name}
                          </h3>
                        </div>
                      </div>

                      {/* Bottom Photo Block with Slide Shutter & Bottom-Right Floating CTA */}
                      <div className="card-photo-block">
                        <div
                          className={`card-photo-shutter shutter-${consultant.slideDirection}`}
                        />

                        <div className="card-photo-floating-actions pos-bottom-right">
                          <button
                            type="button"
                            className="btn-icon-floating btn-floating-wa"
                            onClick={(e) => {
                              e.stopPropagation()
                              openWhatsApp(consultant)
                            }}
                            title={`Hubungi ${consultant.name} via WhatsApp`}
                            aria-label={`Hubungi ${consultant.name} via WhatsApp`}
                          >
                            <RiWhatsappLine size={19} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-floating btn-floating-profile"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedConsultantModal(consultant)
                            }}
                            title={`Buka Profil ${consultant.name}`}
                            aria-label={`Buka Profil ${consultant.name}`}
                          >
                            <HiOutlineUser size={18} />
                          </button>
                        </div>

                        <img
                          src={consultant.photoUrl}
                          alt={`Foto ${consultant.name}`}
                          className="card-portrait-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_SALES_PHOTO
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* STANDARD CARD (RANKS 1 & 3: PHOTO ON TOP, TEXT ON BOTTOM) */
                    <div className="card-inner-wrapper">
                      {/* Top Photo Block with Slide Shutter & Top-Right Floating CTA */}
                      <div className="card-photo-block">
                        <div
                          className={`card-photo-shutter shutter-${consultant.slideDirection}`}
                        />

                        <div className="card-photo-floating-actions pos-top-right">
                          <button
                            type="button"
                            className="btn-icon-floating btn-floating-wa"
                            onClick={(e) => {
                              e.stopPropagation()
                              openWhatsApp(consultant)
                            }}
                            title={`Hubungi ${consultant.name} via WhatsApp`}
                            aria-label={`Hubungi ${consultant.name} via WhatsApp`}
                          >
                            <RiWhatsappLine size={19} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-floating btn-floating-profile"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedConsultantModal(consultant)
                            }}
                            title={`Buka Profil ${consultant.name}`}
                            aria-label={`Buka Profil ${consultant.name}`}
                          >
                            <HiOutlineUser size={18} />
                          </button>
                        </div>

                        <img
                          src={consultant.photoUrl}
                          alt={`Foto ${consultant.name}`}
                          className="card-portrait-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_SALES_PHOTO
                          }}
                        />
                      </div>

                      {/* Bottom Content Block */}
                      <div className="card-content-block">
                        <div className="card-identity-group">
                          <h3 className="card-consultant-name">
                            {consultant.name}
                          </h3>
                        </div>

                        <div className="card-bottom-nav-row">
                          {/* Circular Emblem with Rank Number */}
                          <div
                            className="circle-rank-emblem"
                            aria-label={`Peringkat ${consultant.rank}`}
                          >
                            <span className="emblem-number">
                              {consultant.rank}
                            </span>
                          </div>

                          {/* Tenure & NPS Badge */}
                          <div className="card-meta-badge">
                            <span className="badge-since">
                              Since {consultant.joinedYear}
                            </span>
                            <span className="badge-nps">
                              {consultant.npsScore === '-'
                                ? '-'
                                : `${consultant.npsScore} NPS`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {/* FLOATING CURSOR POP CARD (POPOVER DATA LAINNYA) */}
          <div
            ref={cursorPopRef}
            className="sales-cursor-pop"
            aria-hidden="true"
          >
            {hoveredConsultant && (
              <div className="cursor-pop-content">
                {/* Top Meta Bar: Rank & NIK */}
                <div className="pop-header-row">
                  <span
                    className={`pop-rank-badge rank-${hoveredConsultant.rankNumber}`}
                  >
                    <RiAwardLine size={13} />
                    TOP #{hoveredConsultant.rank}
                  </span>
                  <span className="pop-nik-badge">
                    <HiOutlineCheckBadge size={13} className="text-emerald" />
                    {hoveredConsultant.nik}
                  </span>
                </div>

                {/* Name & Title */}
                <div className="pop-identity-block">
                  <h4 className="pop-consultant-name">
                    {hoveredConsultant.name}
                  </h4>
                  <p className="pop-consultant-role">
                    {hoveredConsultant.title}
                  </p>
                </div>

                <div className="pop-divider" />

                {/* Detail Rows: Specialization & Tenure */}
                <div className="pop-details-list">
                  <div className="pop-detail-item">
                    <HiOutlineSparkles size={14} className="pop-icon text-gold" />
                    <div className="pop-detail-text">
                      <span className="pop-detail-label">Spesialisasi</span>
                      <span className="pop-detail-val">
                        {hoveredConsultant.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="pop-detail-item">
                    <HiOutlineCheckBadge
                      size={14}
                      className="pop-icon text-emerald"
                    />
                    <div className="pop-detail-text">
                      <span className="pop-detail-label">Pengalaman Kerja</span>
                      <span className="pop-detail-val">
                        {hoveredConsultant.tenure} ({hoveredConsultant.joinedSince})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dual Metric Box Row: CSI Score & PKT Time Rate */}
                <div className="pop-metrics-row">
                  <div className="pop-metric-box">
                    <span className="pop-metric-caption">Indeks CSI</span>
                    <span className="pop-metric-value">
                      {hoveredConsultant.csiScore || '-'}
                    </span>
                    <span className="pop-metric-sub">Kepuasan Pelanggan</span>
                  </div>
                  <div className="pop-metric-box">
                    <span className="pop-metric-caption">PKT Time Rate</span>
                    <span className="pop-metric-value text-emerald">
                      {hoveredConsultant.pktTimeRate || '-'}
                    </span>
                    <span className="pop-metric-sub">Rata-rata SPK ke PKT</span>
                  </div>
                </div>

                {/* Bottom Quick Hint */}
                <div className="pop-bottom-hint">
                  <HiOutlineInformationCircle size={13} />
                  <span>Klik kartu untuk profil & sertifikasi lengkap</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: CARD LIST KECIL SALES SELANJUTNYA (MENANDAKAN PERINGKAT)
          ==================================================================== */}
      <section
        className="sales-ranked-wrapper"
        aria-labelledby="ranked-list-title"
      >
        <div className="sales-section-container">
          <div className="hall-header-row">
            <div className="hall-header-copy">
              <div className="hall-badge-pill badge-dark">
                <RiShieldCheckLine size={16} className="hall-badge-icon" />
                <span>Peringkat Kepuasan Selanjutnya</span>
              </div>
              <p className="hall-subtitle">
                Konsultan resmi terverifikasi dengan nomor urut peringkat
                prestasi, spesialisasi unit kendaraan, dan kepatuhan transaksi
                dealer resmi.
              </p>
            </div>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="ranked-controls-bar">
            <div className="ranked-category-chips">
              <button
                type="button"
                className={`ranked-chip-btn ${
                  selectedCategory === 'all' ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua ({nextRankedSales.length})
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${
                  selectedCategory === 'fleet' ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory('fleet')}
              >
                Fleet & Komersial
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${
                  selectedCategory === 'ev' ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory('ev')}
              >
                EV & Ramah Lingkungan
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${
                  selectedCategory === 'crossover' ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory('crossover')}
              >
                Crossover & MPV
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${
                  selectedCategory === 'finance' ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory('finance')}
              >
                Pembiayaan & Trade-In
              </button>
            </div>

            <div className="ranked-search-wrapper">
              <HiOutlineMagnifyingGlass
                className="ranked-search-icon"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama, NIK, spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari wiraniaga per peringkat"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ranked-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                >
                  <HiOutlineXMark size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Small Ranked Cards Grid ("Card List Kecil Menandakan Peringkat") */}
          {filteredRankedSales.length === 0 ? (
            <div className="ranked-empty-box">
              <p className="ranked-empty-title">
                Tidak ada wiraniaga yang sesuai dengan pencarian "{searchQuery}"
              </p>
              <button
                type="button"
                className="ranked-empty-reset"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="ranked-cards-grid">
              {filteredRankedSales.map((sales) => (
                <article
                  key={sales.id}
                  className={`ranked-small-card rank-border-${sales.rankNumber}`}
                  onClick={() => setSelectedConsultantModal(sales)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedConsultantModal(sales)
                    }
                  }}
                >
                  {/* Card Header: Rank Badge + Avatar + Basic Details */}
                  <div className="ranked-card-header">
                    {/* Big Prominent Rank Badge */}
                    <div
                      className="ranked-num-pill"
                      title={`Peringkat #${sales.rank}`}
                    >
                      <span className="ranked-num-val">{sales.rank}</span>
                    </div>

                    {/* Avatar Photo / Initials */}
                    <div className="ranked-avatar-circle">
                      {sales.photoUrl ? (
                        <img
                          src={sales.photoUrl}
                          alt={sales.name}
                          className="ranked-avatar-img"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_SALES_PHOTO
                          }}
                        />
                      ) : (
                        <span>{sales.initials || 'SL'}</span>
                      )}
                    </div>

                    {/* Consultant Primary Meta */}
                    <div className="ranked-info-group">
                      <div className="ranked-tag-row">
                        <span className="ranked-status-dot" />
                        <span className="ranked-status-text">Resmi MMKSI</span>
                        <span className="ranked-nik-sep">•</span>
                        <span className="ranked-nik-val">{sales.nik}</span>
                      </div>
                      <h3 className="ranked-name">{sales.name}</h3>
                      <p className="ranked-role">{sales.title}</p>
                    </div>
                  </div>

                  {/* Card Body: Specialization & Branch */}
                  <div className="ranked-card-body">
                    <div className="ranked-spec-box">
                      <div className="spec-label-row">
                        <span className="spec-dot" />
                        <strong className="spec-title">
                          Fokus & Spesialisasi:
                        </strong>
                      </div>
                      <p className="spec-focus-desc">{sales.specialization}</p>
                      <p className="spec-branch-meta">
                        <HiOutlineCheckBadge
                          size={13}
                          className="text-emerald"
                        />
                        <span>
                          Pengalaman {sales.tenure} • {sales.joinedSince}
                        </span>
                      </p>
                    </div>

                    {/* Performance Metrics Row */}
                    <div className="ranked-scores-grid">
                      <div className="score-pill score-nps-highlight">
                        <span className="score-lbl">Skor NPS</span>
                        <strong className="score-val">
                          {sales.npsScore || '-'}
                        </strong>
                      </div>
                      <div className="score-pill">
                        <span className="score-lbl">Audit CSI</span>
                        <strong className="score-val">
                          {(sales.csiScore || '-').split('/')[0].trim()}
                        </strong>
                      </div>
                      <div className="score-pill">
                        <span className="score-lbl">PKT Time Rate</span>
                        <strong className="score-val score-val-pkt">
                          {sales.pktTimeRate || '-'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="ranked-card-footer">
                    <button
                      type="button"
                      className="btn-ranked-wa"
                      onClick={(e) => {
                        e.stopPropagation()
                        openWhatsApp(sales)
                      }}
                      title={`Hubungi WhatsApp ${sales.name}`}
                    >
                      <RiWhatsappLine size={17} />
                      <span>Chat WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      className="btn-ranked-profile"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedConsultantModal(sales)
                      }}
                      title={`Lihat Profil Lengkap ${sales.name}`}
                    >
                      <HiOutlineUser size={16} />
                      <span>Detail Profil</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          MODAL DETAIL PROFILE WIRANIAGA (SAMA DENGAN SalesOfTheMonthSection.jsx)
          ==================================================================== */}
      {selectedConsultantModal && (
        <div
          className="hall-modal-backdrop"
          onClick={() => setSelectedConsultantModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-consultant-name"
        >
          <div
            className="hall-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hall-modal-header">
              <div className="modal-header-tag">
                <RiAwardLine size={18} className="text-accent-red" />
                <span>Profil Konsultan Terverifikasi</span>
              </div>
              <button
                type="button"
                className="hall-modal-close"
                onClick={() => setSelectedConsultantModal(null)}
                aria-label="Tutup Dialog"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="hall-modal-body">
              <div className="modal-consultant-card">
                <div className="modal-consultant-top">
                  {selectedConsultantModal.photoUrl ? (
                    <img
                      src={selectedConsultantModal.photoUrl}
                      alt={selectedConsultantModal.name}
                      className="modal-consultant-avatar"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_SALES_PHOTO
                      }}
                    />
                  ) : (
                    <div className="modal-consultant-initials">
                      {selectedConsultantModal.initials || 'SL'}
                    </div>
                  )}

                  <div className="modal-consultant-primary">
                    <div className="modal-badge-status">
                      <HiOutlineCheckBadge
                        size={16}
                        className="text-emerald"
                      />
                      <span>Aktif Terverifikasi Dealer Resmi</span>
                    </div>
                    <h3
                      id="modal-consultant-name"
                      className="modal-consultant-title"
                    >
                      {selectedConsultantModal.name}
                    </h3>
                    <p className="modal-consultant-nik">
                      NIK: <strong>{selectedConsultantModal.nik}</strong> •{' '}
                      {selectedConsultantModal.joinedSince}
                    </p>
                    <p className="modal-consultant-role">
                      {selectedConsultantModal.title}
                    </p>
                  </div>
                </div>

                {/* Metrics: NPS, CSI, PKT Time Rate */}
                <div className="modal-metrics-grid">
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Skor NPS</span>
                    <span className="modal-metric-number">
                      {selectedConsultantModal.npsScore || '-'}
                    </span>
                    <span className="modal-metric-sub">
                      Net Promoter Score
                    </span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Indeks CSI</span>
                    <span className="modal-metric-number">
                      {selectedConsultantModal.csiScore || '-'}
                    </span>
                    <span className="modal-metric-sub">Customer Service</span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">PKT Time Rate</span>
                    <span className="modal-metric-number text-emerald">
                      {selectedConsultantModal.pktTimeRate || '-'}
                    </span>
                    <span className="modal-metric-sub">
                      Rata-rata SPK ke PKT
                    </span>
                  </div>
                </div>

                {/* Area of Focus */}
                <div className="modal-detail-section">
                  <h5 className="modal-section-title">
                    Bidang Spesialisasi & Unit:
                  </h5>
                  <p className="modal-section-text">
                    {selectedConsultantModal.specialization}
                  </p>
                </div>

                {/* Safety Transfer Reminder */}
                <div className="modal-safety-alert">
                  <HiOutlineInformationCircle
                    size={18}
                    className="text-accent-red flex-shrink-0"
                  />
                  <span>
                    Seluruh pembayaran uang muka (DP) dan pelunasan hanya
                    ditransfer ke rekening bank resmi{' '}
                    <strong>
                      PT Sun Star Prima Motor (BCA: 3425419999)
                    </strong>
                    , bukan rekening pribadi.
                  </span>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-modal-wa-direct"
                    onClick={() => openWhatsApp(selectedConsultantModal)}
                  >
                    <RiWhatsappLine size={19} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className="btn-modal-close-action"
                    onClick={() => setSelectedConsultantModal(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
