import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlineCheckBadge,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
  HiStar
} from 'react-icons/hi2'
import {
  RiAwardLine,
  RiWhatsappLine,
  RiShieldCheckLine,
  RiStarFill
} from 'react-icons/ri'
import { TOP_SALES_TRADING_CARDS, ALL_SALES_DIRECTORY } from '../data/salesData.js'

gsap.registerPlugin(ScrollTrigger)

export default function SalesOfTheMonthSection() {
  const [selectedConsultantModal, setSelectedConsultantModal] = useState(null)
  const [hoveredConsultant, setHoveredConsultant] = useState(TOP_SALES_TRADING_CARDS[0])

  const sectionRef = useRef(null)
  const cardsContainerRef = useRef(null)
  const cursorPopRef = useRef(null)

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
        overwrite: 'auto'
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
        { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.6)', overwrite: 'auto' }
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
        }
      })
    }
  }

  // GSAP ScrollTrigger Entrance Animation (Slide shutter opening photo from top or bottom)
  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return

    const cards = cardsContainerRef.current.querySelectorAll('.trading-card-item')
    const headerCopy = sectionRef.current.querySelector('.hall-header-copy')
    const headerAction = sectionRef.current.querySelector('.hall-header-action')

    const ctx = gsap.context(() => {
      // 1. Header elements entrance
      if (headerCopy) {
        gsap.fromTo(
          [headerCopy, headerAction].filter(Boolean),
          {
            y: 32,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
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
              trigger: cardsContainerRef.current,
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
                trigger: cardsContainerRef.current,
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
                trigger: cardsContainerRef.current,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Keyboard navigation: Escape key closes active modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedConsultantModal) {
          setSelectedConsultantModal(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedConsultantModal])

  const openWhatsApp = (consultant) => {
    const text = encodeURIComponent(
      consultant.whatsappMessage ||
      `Halo Bpk/Ibu ${consultant.name}, saya ingin konsultasi mengenai unit kendaraan resmi di Mitsubishi Sun Bekasi.`
    )
    window.open(`https://wa.me/${consultant.whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section ref={sectionRef} className="hall-of-fame-section" id="hall-of-fame" aria-labelledby="hall-of-fame-title">
      <div className="hall-of-fame-container">
        {/* Section Header */}
        <div className="hall-header-row">
          <div className="hall-header-copy">
            <h2 id="hall-of-fame-title" className="hall-title">
              Sales Satisfaction of the Month
            </h2>
            <p className="hall-subtitle">
              Peringkat kehormatan berdasarkan indeks kepuasan Net Promoter Score (NPS), lama dedikasi melayani, dan ulasan konsumen terverifikasi.
            </p>
          </div>

          <div className="hall-header-action">
            <Link
              to="/sales"
              className="hall-btn-view-all"
              title="Lihat Direktori Seluruh Sales Resmi"
            >
              <HiOutlineUserGroup size={18} />
              <span>Lihat Semua ({ALL_SALES_DIRECTORY.length} Sales)</span>
              <HiOutlineArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 3 TRADING CARDS GRID (AS IN REFERENCE) */}
        <div ref={cardsContainerRef} className="trading-cards-grid">
          {TOP_SALES_TRADING_CARDS.map((consultant) => {
            const isInverted = consultant.isInverted

            return (
              <article
                key={consultant.id}
                className={`trading-card-item ${consultant.themeStyle} ${isInverted ? 'is-inverted' : ''}`}
                data-slide-direction={consultant.slideDirection}
                onMouseEnter={(e) => handleCardMouseEnter(consultant, e)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => setSelectedConsultantModal(consultant)}
                style={{ cursor: 'pointer' }}
              >
                {isInverted ? (
                  /* INVERTED CARD (RANK 2: TEXT ON TOP, PHOTO ON BOTTOM) */
                  <div className="card-inner-wrapper">
                    {/* Top Content Block */}
                    <div className="card-content-block">
                      <div className="card-top-nav-row">
                        {/* Circular Emblem with Rank Number */}
                        <div className="circle-rank-emblem" aria-label={`Peringkat ${consultant.rank}`}>
                          <span className="emblem-number">{consultant.rank}</span>
                        </div>

                        {/* Tenure & NPS Badge */}
                        <div className="card-meta-badge">
                          <span className="badge-since">Since {consultant.joinedYear}</span>
                          <span className="badge-nps">{consultant.npsScore} NPS</span>
                        </div>
                      </div>

                      <div className="card-identity-group">
                        <h3 className="card-consultant-name">{consultant.name}</h3>
                      </div>
                    </div>

                    {/* Bottom Photo Block with Slide Shutter & Bottom-Right Floating CTA */}
                    <div className="card-photo-block">
                      <div className={`card-photo-shutter shutter-${consultant.slideDirection}`} />

                      {/* Icon-Only CTA Floating at Bottom-Right of Photo */}
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
                      />
                    </div>
                  </div>
                ) : (
                  /* STANDARD CARD (RANKS 1 & 3: PHOTO ON TOP, TEXT ON BOTTOM) */
                  <div className="card-inner-wrapper">
                    {/* Top Photo Block with Slide Shutter & Top-Right Floating CTA */}
                    <div className="card-photo-block">
                      <div className={`card-photo-shutter shutter-${consultant.slideDirection}`} />

                      {/* Icon-Only CTA Floating at Top-Right of Photo */}
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
                      />
                    </div>

                    {/* Bottom Content Block */}
                    <div className="card-content-block">
                      <div className="card-identity-group">
                        <h3 className="card-consultant-name">{consultant.name}</h3>
                      </div>

                      <div className="card-bottom-nav-row">
                        {/* Circular Emblem with Rank Number */}
                        <div className="circle-rank-emblem" aria-label={`Peringkat ${consultant.rank}`}>
                          <span className="emblem-number">{consultant.rank}</span>
                        </div>

                        {/* Tenure & NPS Badge */}
                        <div className="card-meta-badge">
                          <span className="badge-since">Since {consultant.joinedYear}</span>
                          <span className="badge-nps">{consultant.npsScore} NPS</span>
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
                <span className={`pop-rank-badge rank-${hoveredConsultant.rankNumber}`}>
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
                <h4 className="pop-consultant-name">{hoveredConsultant.name}</h4>
                <p className="pop-consultant-role">{hoveredConsultant.title}</p>
              </div>

              <div className="pop-divider" />

              {/* Detail Rows: Specialization & Branch */}
              <div className="pop-details-list">
                <div className="pop-detail-item">
                  <HiOutlineSparkles size={14} className="pop-icon text-gold" />
                  <div className="pop-detail-text">
                    <span className="pop-detail-label">Spesialisasi</span>
                    <span className="pop-detail-val">{hoveredConsultant.specialization}</span>
                  </div>
                </div>

                <div className="pop-detail-item">
                  <HiOutlineMapPin size={14} className="pop-icon text-red" />
                  <div className="pop-detail-text">
                    <span className="pop-detail-label">Cabang Showroom</span>
                    <span className="pop-detail-val">{hoveredConsultant.branch}</span>
                  </div>
                </div>
              </div>

              {/* Dual Metric Box Row: CSI Score & Customer Voice */}
              <div className="pop-metrics-row">
                <div className="pop-metric-box">
                  <span className="pop-metric-caption">Indeks CSI</span>
                  <span className="pop-metric-value">{hoveredConsultant.csiScore.split('/')[0].trim()}</span>
                  <span className="pop-metric-sub">Kepuasan Pelanggan</span>
                </div>
                <div className="pop-metric-box">
                  <span className="pop-metric-caption">Ulasan Konsumen</span>
                  <span className="pop-metric-value">
                    <HiStar size={13} className="text-gold" /> {hoveredConsultant.customerVoiceScore.split('(')[0].trim()}
                  </span>
                  <span className="pop-metric-sub">
                    {hoveredConsultant.customerVoiceScore.match(/\((.*?)\)/)?.[0] || 'Terverifikasi'}
                  </span>
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

        {/* Direct Link to Verified Directory */}
        <div className="trading-section-footer">
          <p className="trading-footer-disclaimer">
            <RiShieldCheckLine size={18} className="text-accent-red" />
            <span>
              Seluruh transaksi uang muka (DP) dan pelunasan wajib disalurkan langsung ke rekening bank resmi <strong>PT Sun Star Prima Motor (BCA: 3425419999)</strong>.
            </span>
          </p>
        </div>
      </div>

      {/* MODAL 1: DETAIL PROFIL KONSULTAN */}
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
                    />
                  ) : (
                    <div className="modal-consultant-initials">
                      {selectedConsultantModal.initials || 'SL'}
                    </div>
                  )}

                  <div className="modal-consultant-primary">
                    <div className="modal-badge-status">
                      <HiOutlineCheckBadge size={16} className="text-emerald" />
                      <span>Aktif Terverifikasi Dealer Resmi</span>
                    </div>
                    <h3 id="modal-consultant-name" className="modal-consultant-title">
                      {selectedConsultantModal.name}
                    </h3>
                    <p className="modal-consultant-nik">
                      NIK: <strong>{selectedConsultantModal.nik}</strong> • {selectedConsultantModal.joinedSince}
                    </p>
                    <p className="modal-consultant-branch">
                      <HiOutlineMapPin size={14} /> {selectedConsultantModal.branch}
                    </p>
                    <p className="modal-consultant-role">
                      {selectedConsultantModal.title}
                    </p>
                  </div>
                </div>

                {/* Metrics: NPS, CSI, Suara Konsumen */}
                <div className="modal-metrics-grid">
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Skor NPS</span>
                    <span className="modal-metric-number">{selectedConsultantModal.npsScore}</span>
                    <span className="modal-metric-sub">Net Promoter Score</span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Lama Bekerja</span>
                    <span className="modal-metric-number">{selectedConsultantModal.tenure}</span>
                    <span className="modal-metric-sub">{selectedConsultantModal.joinedSince}</span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Indeks CSI</span>
                    <span className="modal-metric-number">{selectedConsultantModal.csiScore || '98.0 / 100'}</span>
                    <span className="modal-metric-sub">Customer Service</span>
                  </div>
                </div>

                {/* Area of Focus */}
                <div className="modal-detail-section">
                  <h5 className="modal-section-title">Bidang Spesialisasi & Unit:</h5>
                  <p className="modal-section-text">{selectedConsultantModal.specialization}</p>
                </div>

                {/* Safety Transfer Reminder */}
                <div className="modal-safety-alert">
                  <HiOutlineInformationCircle size={18} className="text-accent-red flex-shrink-0" />
                  <span>
                    Seluruh pembayaran uang muka (DP) dan pelunasan hanya ditransfer ke rekening bank resmi PT Sun Star Prima Motor (BCA: 3425419999), bukan rekening pribadi.
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
    </section>
  )
}
