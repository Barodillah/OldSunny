import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineInformationCircle
} from 'react-icons/hi2'
import {
  RiAwardLine,
  RiWhatsappLine,
  RiShieldCheckLine
} from 'react-icons/ri'
import {
  TOP_SALES_TRADING_CARDS,
  NEXT_RANKED_SALES
} from '../data/salesData.js'
import './SalesList.css'

export default function SalesList() {
  const location = useLocation()
  const [selectedConsultantModal, setSelectedConsultantModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

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
    window.open(`https://wa.me/${consultant.whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  // Filtered Next Ranked Sales (Rank 04 to 08)
  const filteredRankedSales = useMemo(() => {
    let list = NEXT_RANKED_SALES

    if (selectedCategory !== 'all') {
      list = list.filter((item) => {
        const spec = (item.specialization + ' ' + item.title).toLowerCase()
        if (selectedCategory === 'fleet') return spec.includes('fleet') || spec.includes('niaga') || spec.includes('l300') || spec.includes('triton')
        if (selectedCategory === 'ev') return spec.includes('ev') || spec.includes('listrik') || spec.includes('pengisian')
        if (selectedCategory === 'crossover') return spec.includes('crossover') || spec.includes('mpv') || spec.includes('first-time')
        if (selectedCategory === 'finance') return spec.includes('bunga') || spec.includes('pembiayaan') || spec.includes('tukar') || spec.includes('trade-in')
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
  }, [selectedCategory, searchQuery])

  return (
    <div className="sales-page">

      {/* ====================================================================
          SECTION 1: TOP 3 HIGHLIGHT (PERSIS SEPERTI SalesOfTheMonthSection.jsx)
          ==================================================================== */}
      <section className="sales-highlight-wrapper" aria-labelledby="highlight-title">
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
                Top 3 Sales berperingkat tertinggi dengan dedikasi prima, skor kepuasan Net Promoter Score (NPS) tertinggi, dan respon konsultasi terbaik.
              </p>
            </div>
          </div>

          {/* 3 TRADING CARDS GRID (SAMA PERSIS DENGAN SalesOfTheMonthSection.jsx) */}
          <div className="trading-cards-grid">
            {TOP_SALES_TRADING_CARDS.map((consultant) => {
              const isInverted = consultant.isInverted

              return (
                <article
                  key={consultant.id}
                  className={`trading-card-item ${consultant.themeStyle} ${isInverted ? 'is-inverted' : ''}`}
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

                      {/* Bottom Photo Block with Bottom-Right Floating CTA */}
                      <div className="card-photo-block">
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
                      {/* Top Photo Block with Top-Right Floating CTA */}
                      <div className="card-photo-block">
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
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: CARD LIST KECIL SALES SELANJUTNYA (MENANDAKAN PERINGKAT)
          ==================================================================== */}
      <section className="sales-ranked-wrapper" aria-labelledby="ranked-list-title">
        <div className="sales-section-container">
          <div className="hall-header-row">
            <div className="hall-header-copy">
              <div className="hall-badge-pill badge-dark">
                <RiShieldCheckLine size={16} className="hall-badge-icon" />
                <span>Peringkat Kepuasan Selanjutnya</span>
              </div>
              <p className="hall-subtitle">
                Konsultan resmi terverifikasi dengan nomor urut peringkat prestasi, spesialisasi unit kendaraan, dan kepatuhan transaksi dealer resmi.
              </p>
            </div>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="ranked-controls-bar">
            <div className="ranked-category-chips">
              <button
                type="button"
                className={`ranked-chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua ({NEXT_RANKED_SALES.length})
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${selectedCategory === 'fleet' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('fleet')}
              >
                Fleet & Komersial
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${selectedCategory === 'ev' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ev')}
              >
                EV & Ramah Lingkungan
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${selectedCategory === 'crossover' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('crossover')}
              >
                Crossover & MPV
              </button>
              <button
                type="button"
                className={`ranked-chip-btn ${selectedCategory === 'finance' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('finance')}
              >
                Pembiayaan & Trade-In
              </button>
            </div>

            <div className="ranked-search-wrapper">
              <HiOutlineMagnifyingGlass className="ranked-search-icon" size={18} />
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
              <p className="ranked-empty-title">Tidak ada wiraniaga yang sesuai dengan pencarian "{searchQuery}"</p>
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
                    <div className="ranked-num-pill" title={`Peringkat #${sales.rank}`}>
                      <span className="ranked-num-val">{sales.rank}</span>
                    </div>

                    {/* Avatar Photo / Initials */}
                    <div className="ranked-avatar-circle">
                      {sales.photoUrl ? (
                        <img
                          src={sales.photoUrl}
                          alt={sales.name}
                          className="ranked-avatar-img"
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
                        <strong className="spec-title">Fokus & Spesialisasi:</strong>
                      </div>
                      <p className="spec-focus-desc">{sales.specialization}</p>
                      <p className="spec-branch-meta">
                        <HiOutlineCheckBadge size={13} className="text-emerald" />
                        <span>Pengalaman {sales.tenure} • {sales.joinedSince}</span>
                      </p>
                    </div>

                    {/* Performance Metrics Row */}
                    <div className="ranked-scores-grid">
                      <div className="score-pill score-nps-highlight">
                        <span className="score-lbl">Skor NPS</span>
                        <strong className="score-val">{sales.npsScore}</strong>
                      </div>
                      <div className="score-pill">
                        <span className="score-lbl">Audit CSI</span>
                        <strong className="score-val">{sales.csiScore.split('/')[0].trim()}</strong>
                      </div>
                      <div className="score-pill">
                        <span className="score-lbl">PKT Time Rate</span>
                        <strong className="score-val score-val-pkt">
                          {sales.pktTimeRate || '3 Hari'}
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
                    <p className="modal-consultant-role">
                      {selectedConsultantModal.title}
                    </p>
                  </div>
                </div>

                {/* Metrics: NPS, CSI, PKT Time Rate */}
                <div className="modal-metrics-grid">
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Skor NPS</span>
                    <span className="modal-metric-number">{selectedConsultantModal.npsScore}</span>
                    <span className="modal-metric-sub">Net Promoter Score</span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">Indeks CSI</span>
                    <span className="modal-metric-number">{selectedConsultantModal.csiScore || '98.0 / 100'}</span>
                    <span className="modal-metric-sub">Customer Service</span>
                  </div>
                  <div className="modal-metric-card">
                    <span className="modal-metric-label">PKT Time Rate</span>
                    <span className="modal-metric-number text-emerald">{selectedConsultantModal.pktTimeRate || '3 Hari'}</span>
                    <span className="modal-metric-sub">Rata-rata SPK ke PKT</span>
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
                    Seluruh pembayaran uang muka (DP) dan pelunasan hanya ditransfer ke rekening bank resmi <strong>PT Sun Star Prima Motor (BCA: 3425419999)</strong>, bukan rekening pribadi.
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
