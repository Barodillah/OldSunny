import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import {
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineXMark
} from 'react-icons/hi2'
import { RiShieldCheckLine } from 'react-icons/ri'
import WarningNoticeSection from '../components/WarningNoticeSection.jsx'
import './Organization.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Organizational Hierarchy Data based on Official Dealer Structure (Fallback / Default)
const DEFAULT_ORG_DATA = {
  direksi: [
    {
      id: 'fendy-haryanto',
      name: 'Fendy Haryanto',
      role: 'Branch Manager',
      level: 'Pimpinan Cabang / Direksi',
      department: 'Branch Executive & Operational Leadership',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6acf43d62380a8.00133085.png',
      description: 'Bertanggung jawab penuh atas arah strategis, integritas transaksi dealer resmi, dan tata kelola operasional Mitsubishi Sun Margahayu.',
      tenure: '12 Tahun Pengalaman',
      nik: 'SNY-DIR-0101',
      badge: 'Pimpinan Cabang'
    }
  ],
  csm: [
    {
      id: 'adi-ponco-prasetyo',
      name: 'Adi Ponco Prasetyo',
      role: 'Customer Satisfaction Manager',
      level: 'Staf Khusus Pimpinan Cabang',
      department: 'Customer Satisfaction & Quality Assurance',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6acf43d623df40.72416869.jpeg',
      description: 'Bertanggung jawab langsung kepada Branch Manager dalam mengawasi indeks kepuasan pelanggan, penanganan masukan konsumen, serta audit standar mutu pelayanan dealer resmi.',
      tenure: '9 Tahun Pengalaman',
      nik: 'SNY-CSM-0205',
      badge: 'Mutu & Kepuasan Pelanggan'
    }
  ],
  managerial: [
    {
      id: 'muhamad-santiko',
      name: 'Muhamad Santiko',
      role: 'Service Manager',
      level: 'Level Manajerial',
      department: 'Bengkel Resmi & Pelayanan Purna Jual',
      photoUrl: 'https://cssunmotor.com/wp-content/uploads/asset_6ad4f2fde1e349.91841935.jpeg',
      description: 'Memimpin tim mekanik bersertifikat MMKSI, jaminan kualitas perawatan berkala, perbaikan mesin, dan layanan Emergency SOS 24 Jam.',
      tenure: '10 Tahun Pengalaman',
      nik: 'SNY-MGR-0311',
      badge: 'Purna Jual & Bengkel'
    },
    {
      id: 'surie-handayani',
      name: 'Surie Handayani',
      role: 'Admin Head',
      level: 'Level Manajerial',
      department: 'Administrasi, Keuangan & Verifikasi Sah',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad4722c138b93.90082080.png',
      description: 'Mengawasi kepatuhan administrasi faktur, STNK/BPKB, serta memastikan seluruh transaksi uang muka disalurkan hanya ke rekening resmi dealer PT Sun Star Prima Motor.',
      tenure: '8 Tahun Pengalaman',
      nik: 'SNY-MGR-0324',
      badge: 'Legal & Keuangan'
    },
    {
      id: 'joko-triono',
      name: 'Joko Triono',
      role: 'Sparepart Manager',
      level: 'Level Manajerial',
      department: 'Suku Cadang Asli Mitsubishi Motors Genuine Parts',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad4722c11cc89.85094896.png',
      description: 'Menjamin ketersediaan suku cadang asli bergaransi pabrikan untuk varian kendaraan penumpang maupun kendaraan niaga berat.',
      tenure: '11 Tahun Pengalaman',
      nik: 'SNY-MGR-0338',
      badge: 'Suku Cadang Asli'
    }
  ],
  supervisor: [
    {
      id: 'yusuf-anshori',
      name: 'Yusuf Anshori',
      role: 'Supervisor',
      level: 'Level Supervisor',
      department: 'Supervisi Operasional Wiraniaga & Fleet',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
      description: 'Membimbing dan mengawal kualitas interaksi wiraniaga dengan konsumen serta koordinasi unit pengadaan armada komersial.',
      tenure: '6 Tahun Pengalaman',
      nik: 'SNY-SPV-0419',
      badge: 'Tim I'
    },
    {
      id: 'riki-melianto',
      name: 'Riki Melianto',
      role: 'Supervisor',
      level: 'Level Supervisor',
      department: 'Supervisi Layanan Konsultasi & Test Drive',
      photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
      description: 'Memastikan seluruh proses uji jalan (Test Drive) dan simulasi kredit berjalan transparan, ramah, dan sesuai standar H.O.M.E.',
      tenure: '5 Tahun Pengalaman',
      nik: 'SNY-SPV-0428',
      badge: 'Tim II'
    }
  ]
}

export default function Organization() {
  const location = useLocation()
  const [selectedLeader, setSelectedLeader] = useState(null)
  const [orgData, setOrgData] = useState(DEFAULT_ORG_DATA)
  const [loading, setLoading] = useState(true)

  // Fetch live structured organization data from MySQL database
  useEffect(() => {
    let isMounted = true

    const fetchOrgFromDatabase = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/employees?structured=1`)
        if (!res.ok) return
        const json = await res.json()

        if (isMounted && json.success && json.data) {
          const formatLevel = (lvl) => {
            if (lvl === 'direksi') return 'Pimpinan Cabang / Direksi'
            if (lvl === 'csm') return 'Staf Khusus Pimpinan Cabang'
            if (lvl === 'managerial') return 'Level Manajerial'
            if (lvl === 'supervisor') return 'Level Supervisor'
            return lvl
          }

          const normalize = (list, defaultLvl) =>
            (list || []).map((p) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              level: formatLevel(p.level) || defaultLvl,
              department: p.department || '',
              photoUrl: p.photo_url || p.photoUrl || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
              description: p.description || '',
              tenure: p.tenure || '',
              nik: p.nik || 'SNY-EMP-XXXX',
              badge: p.badge || p.role
            }))

          setOrgData({
            direksi: json.data.direksi?.length
              ? normalize(json.data.direksi, 'Pimpinan Cabang / Direksi')
              : DEFAULT_ORG_DATA.direksi,
            csm: json.data.csm?.length
              ? normalize(json.data.csm, 'Staf Khusus Pimpinan Cabang')
              : DEFAULT_ORG_DATA.csm,
            managerial: json.data.managerial?.length
              ? normalize(json.data.managerial, 'Level Manajerial')
              : DEFAULT_ORG_DATA.managerial,
            supervisor: json.data.supervisor?.length
              ? normalize(json.data.supervisor, 'Level Supervisor')
              : DEFAULT_ORG_DATA.supervisor
          })
        }
      } catch (err) {
        console.warn('Gagal memuat struktur organisasi dari database, menggunakan data cadangan default:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrgFromDatabase()

    return () => {
      isMounted = false
    }
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedLeader) {
        setSelectedLeader(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLeader])

  // Showcase Photos Slider (1 Card Visible at a time, sliding top-to-bottom, 3 photos loop)
  const SHOWCASE_PHOTOS = [
    {
      id: 'dkt-tim',
      title: 'Dealer Kaizen Team',
      role: 'Divisi Komersial & Teknis',
      company: 'at Mitsubishi Sun Margahayu®',
      imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad20f3f4c1a78.73235556.jpeg',
    },
    {
      id: 'frontliner-tim',
      title: 'Frontliner Team',
      role: 'Pelayanan & Customer Relations',
      company: 'at Mitsubishi Sun Margahayu®',
      imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e4a127.45708367.jpeg',
    },
    {
      id: 'operational-pelayanan',
      title: 'Operational Pelayanan',
      role: 'Operasional & Layanan Pelanggan',
      company: 'at Mitsubishi Sun Margahayu®',
      imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acd9f987280e1.14368522.jpeg',
    },
  ]

  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const heroViewportRef = useRef(null)
  const heroTrackRef = useRef(null)
  const heroHoverRef = useRef(false)
  const heroAnimatingRef = useRef(false)
  const heroCount = SHOWCASE_PHOTOS.length

  // Preload showcase images
  useEffect(() => {
    SHOWCASE_PHOTOS.forEach((item) => {
      const img = new Image()
      img.src = item.imageUrl
    })
  }, [])

  // Calculate dynamic step (single item height + gap) for 1 visible card
  const getHeroStep = () => {
    if (!heroViewportRef.current || !heroTrackRef.current) return 0
    const firstItem = heroTrackRef.current.children[0]
    if (!firstItem) return 0
    const gap = parseFloat(window.getComputedStyle(heroTrackRef.current).gap || '0') || 0
    return firstItem.offsetHeight + gap
  }

  // Update viewport height dynamically to display exactly 1 card
  const updateHeroViewportHeight = () => {
    if (!heroViewportRef.current || !heroTrackRef.current) return
    const items = heroTrackRef.current.children
    if (items.length < 2) return
    const cardHeight = items[1].offsetHeight
    if (cardHeight > 0) {
      heroViewportRef.current.style.height = `${cardHeight}px`
    }
  }

  // Reset track position to y = -step immediately after index changes
  useLayoutEffect(() => {
    updateHeroViewportHeight()
    const step = getHeroStep()
    if (heroTrackRef.current && step > 0) {
      gsap.set(heroTrackRef.current, { y: -step })
    }
  }, [heroSlideIndex])

  // ResizeObserver for responsive adjustment
  useEffect(() => {
    const handleResize = () => {
      updateHeroViewportHeight()
      const step = getHeroStep()
      if (heroTrackRef.current && !heroAnimatingRef.current && step > 0) {
        gsap.set(heroTrackRef.current, { y: -step })
      }
    }

    window.addEventListener('resize', handleResize)
    const ro = new ResizeObserver(handleResize)
    if (heroViewportRef.current) {
      ro.observe(heroViewportRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      ro.disconnect()
    }
  }, [])

  // Auto-slide every 2 seconds top-to-bottom
  useEffect(() => {
    const timer = setInterval(() => {
      if (heroHoverRef.current || heroAnimatingRef.current) return

      const step = getHeroStep()
      if (!step || !heroTrackRef.current) return

      heroAnimatingRef.current = true

      gsap.to(heroTrackRef.current, {
        y: 0,
        duration: 0.65,
        ease: 'power2.inOut',
        onComplete: () => {
          setHeroSlideIndex((prev) => (prev - 1 + heroCount) % heroCount)
          heroAnimatingRef.current = false
        },
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [heroCount])

  // Track items: item 0 (incoming from top), item 1 (currently visible 1 card), item 2 (outgoing below)
  const heroTrackItems = [
    SHOWCASE_PHOTOS[(heroSlideIndex - 1 + heroCount) % heroCount],
    SHOWCASE_PHOTOS[heroSlideIndex],
    SHOWCASE_PHOTOS[(heroSlideIndex + 1) % heroCount],
  ]

  return (
    <div className="org-page">
      {/* ====================================================================
          PAGE HEADER / HERO
          ==================================================================== */}
      <header className="org-hero-header">
        {/* Dynamic Background Images Matching Visible Slide */}
        <div className="org-hero-bg-container" aria-hidden="true">
          {SHOWCASE_PHOTOS.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.imageUrl}
              alt=""
              className={`org-hero-bg-layer ${index === heroSlideIndex ? 'active' : ''}`}
              loading="eager"
            />
          ))}
          <div className="org-hero-bg-overlay" />
        </div>

        <div className="org-hero-container">
          <div className="org-hero-left">
            <div className="org-header-tag">
              <span className="red-dot" />
              <span>MITSUBISHI SUN MARGAHAYU • STRUKTUR RESMI DEALER</span>
            </div>

            <h1 className="org-hero-title">
              Struktur Organisasi Dealer
            </h1>

            <p className="org-hero-desc">
              Bagan kepemimpinan resmi PT Sun Star Prima Motor Margahayu. Struktur terpadu yang menjamin
              layanan profesional, integritas transaksi anti-oknum, dan kepuasan pelanggan di setiap lini.
            </p>

            <div className="org-guarantee-row">
              <div className="org-guarantee-pill">
                <HiOutlineCheckBadge size={18} className="pill-icon" />
                <span>Tersertifikasi Standar MMKSI</span>
              </div>
              <div className="org-guarantee-pill">
                <HiOutlineSparkles size={18} className="pill-icon" />
                <span>Audit Mutu Pelayanan Terpadu</span>
              </div>
            </div>
          </div>

          {/* HERO RIGHT: 1 PHOTO VISIBLE VERTICAL LOOP SLIDER (3 PHOTOS) */}
          <div
            className="org-hero-right"
            onMouseEnter={() => {
              heroHoverRef.current = true
            }}
            onMouseLeave={() => {
              heroHoverRef.current = false
            }}
          >
            <div ref={heroViewportRef} className="org-hero-slider-viewport">
              <div ref={heroTrackRef} className="org-hero-slider-track">
                {heroTrackItems.map((team, idx) => (
                  <div key={`${team.id}-${idx}`} className="org-hero-photo-card">
                    <img
                      src={team.imageUrl}
                      alt={team.title}
                      className="org-hero-photo-img"
                      loading="eager"
                    />
                    <div className="org-hero-photo-gradient" />

                    {/* Top Overlay Bar */}
                    <div className="org-hero-photo-top-bar">
                      <span className="org-hero-badge-icon" aria-hidden="true">+</span>
                      <span className="org-hero-role-tag">{team.role}</span>
                    </div>

                    {/* Bottom Overlay Bar */}
                    <div className="org-hero-photo-bottom-bar">
                      <h3 className="org-hero-member-name">{team.title}</h3>
                      <span className="org-hero-member-company">{team.company}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          ORGANIZATIONAL TREE SECTION
          Hierarchy:
          1. Direksi (Center)
          2. Right Branch -> Customer Satisfaction Manager (Align Right)
          3. Level Managerial (Center - 3 Columns)
          4. Level Supervisor (Center - 2 Columns)
          ==================================================================== */}
      <main className="org-main-section">
        <div className="org-container">

          {/* ----------------------------------------------------------------
              TIER 1: LEVEL DIREKSI (BRANCH MANAGER - CENTER ALIGNED)
              ---------------------------------------------------------------- */}
          <section className="org-tier-section" aria-labelledby="tier-direksi-title">

            <div className="org-tier-cards-grid grid-direksi">
              {orgData.direksi.map((person) => (
                <div
                  key={person.id}
                  className="org-profile-card card-direksi"
                  onClick={() => setSelectedLeader(person)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedLeader(person)
                  }}
                >
                  <div className="org-photo-wrapper">
                    <img
                      src={person.photoUrl}
                      alt={`Foto ${person.name}`}
                      className="org-photo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'
                      }}
                    />
                    <div className="org-photo-overlay-tag">{person.badge}</div>
                  </div>
                  <div className="org-card-meta">
                    <span className="org-role-label">{person.role}</span>
                    <h3 className="org-name-label">{person.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              JUNCTION: SPINAL LINE WITH RIGHT BRANCH FOR CSM
              (Antara Garis Direksi & Manager Ada Cabang ke Kanan - Align Kanan)
              ---------------------------------------------------------------- */}
          <div className="org-spine-wrapper" aria-label="Garis Koordinasi Staf Khusus CSM">
            {/* Top Central Spine Stem */}
            <div className="spine-stem-top" />

            {/* Horizontal Branching Row */}
            <div className="advisory-branch-row">
              {/* Left Column: Context / Explanation Note */}
              <div className="advisory-left-box">
                <p className="advisory-desc">
                  Pengawasan langsung terhadap mutu pelayanan, penanganan keluhan, dan kepuasan pelanggan secara objektif.
                </p>
              </div>

              {/* Center Node on the Spine */}
              <div className="advisory-spine-node" aria-hidden="true">
                <span className="spine-dot" />
                <div className="spine-branch-arm" />
              </div>

              {/* Right Column: Customer Satisfaction Manager (Align Kanan) */}
              <div className="advisory-right-box">
                {orgData.csm.map((person) => (
                  <div
                    key={person.id}
                    className="org-profile-card card-csm"
                    onClick={() => setSelectedLeader(person)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedLeader(person)
                    }}
                  >
                    <div className="org-photo-wrapper">
                      <img
                        src={person.photoUrl}
                        alt={`Foto ${person.name}`}
                        className="org-photo-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80'
                        }}
                      />
                      <div className="org-photo-overlay-tag tag-csm">
                        {person.badge}
                      </div>
                    </div>
                    <div className="org-card-meta">
                      <span className="org-role-label">{person.role}</span>
                      <h3 className="org-name-label">{person.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Central Spine Stem going to Managerial level */}
            <div className="spine-stem-bottom" />
          </div>

          {/* Horizontal Distributor Line for Managerial Tier */}
          <div className="org-distributor-tree" aria-hidden="true">
            <div className="distributor-cross-bar" />
            <div className={`distributor-drops drops-${orgData.managerial.length}`}>
              {orgData.managerial.map((_, idx) => (
                <span key={idx} className="drop-stem" />
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              TIER 2: LEVEL MANAGERIAL (CARDS CENTER ALIGNED)
              ---------------------------------------------------------------- */}
          <section className="org-tier-section" aria-labelledby="tier-managerial-title">
            <div className="org-tier-header">
              <h2 id="tier-managerial-title" className="org-tier-title">Level Manajerial</h2>
              <div className="org-tier-line" />
            </div>

            <div className="org-tier-cards-grid grid-managerial">
              {orgData.managerial.map((person) => (
                <div
                  key={person.id}
                  className="org-profile-card card-managerial"
                  onClick={() => setSelectedLeader(person)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedLeader(person)
                  }}
                >
                  <div className="org-photo-wrapper">
                    <img
                      src={person.photoUrl}
                      alt={`Foto ${person.name}`}
                      className="org-photo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
                      }}
                    />
                    <div className="org-photo-overlay-tag">{person.badge}</div>
                  </div>
                  <div className="org-card-meta">
                    <span className="org-role-label">{person.role}</span>
                    <h3 className="org-name-label">{person.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Connector to Supervisor Tier */}
          <div className="org-connector-vertical" aria-hidden="true">
            <span className="connector-dot" />
            <span className="connector-stem" />
          </div>

          {/* Horizontal Distributor Line for Supervisor Tier */}
          <div className="org-distributor-tree distributor-supervisor" aria-hidden="true">
            <div className={`distributor-cross-bar bar-${orgData.supervisor.length}`} />
            <div className={`distributor-drops drops-${orgData.supervisor.length}`}>
              {orgData.supervisor.map((_, idx) => (
                <span key={idx} className="drop-stem" />
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              TIER 3: LEVEL SUPERVISOR (CARDS CENTER ALIGNED)
              ---------------------------------------------------------------- */}
          <section className="org-tier-section" aria-labelledby="tier-supervisor-title">
            <div className="org-tier-header">
              <h2 id="tier-supervisor-title" className="org-tier-title">Level Supervisor</h2>
              <div className="org-tier-line" />
            </div>

            <div className="org-tier-cards-grid grid-supervisor">
              {orgData.supervisor.map((person) => (
                <div
                  key={person.id}
                  className="org-profile-card card-supervisor"
                  onClick={() => setSelectedLeader(person)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedLeader(person)
                  }}
                >
                  <div className="org-photo-wrapper">
                    <img
                      src={person.photoUrl}
                      alt={`Foto ${person.name}`}
                      className="org-photo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80'
                      }}
                    />
                    <div className="org-photo-overlay-tag">{person.badge}</div>
                  </div>
                  <div className="org-card-meta">
                    <span className="org-role-label">{person.role}</span>
                    <h3 className="org-name-label">{person.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* WARNING NOTICE SECTION (CRITICAL: SALES NONAKTIF & ANTI-PENIPUAN REKENING) */}
      <WarningNoticeSection />

      {/* ====================================================================
          LEADER DETAIL MODAL DIALOG
          ==================================================================== */}
      {selectedLeader && (
        <div
          className="org-modal-backdrop"
          onClick={() => setSelectedLeader(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leader-modal-title"
        >
          <div
            className="org-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="org-modal-header">
              <div className="org-modal-tag">
                <HiOutlineCheckBadge size={18} className="text-emerald" />
                <span>Resmi Terverifikasi MMKSI</span>
              </div>
              <button
                type="button"
                className="org-modal-close"
                onClick={() => setSelectedLeader(null)}
                aria-label="Tutup Dialog"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="org-modal-body">
              <div className="org-modal-hero">
                <img
                  src={selectedLeader.photoUrl}
                  alt={selectedLeader.name}
                  className="org-modal-avatar"
                />
                <div className="org-modal-hero-text">
                  <span className="org-modal-badge">{selectedLeader.level}</span>
                  <h3 id="leader-modal-title" className="org-modal-name">
                    {selectedLeader.name}
                  </h3>
                  <p className="org-modal-role">{selectedLeader.role}</p>
                  <div className="org-modal-submeta">
                    <span>NIK: <strong>{selectedLeader.nik}</strong></span>
                    <span>•</span>
                    <span>{selectedLeader.tenure}</span>
                  </div>
                </div>
              </div>

              <div className="org-modal-details">
                <div className="detail-box">
                  <h4 className="detail-box-title">Bidang Tanggung Jawab:</h4>
                  <p className="detail-box-content">{selectedLeader.department}</p>
                </div>

                <div className="detail-box">
                  <h4 className="detail-box-title">Peran Strategis:</h4>
                  <p className="detail-box-content">{selectedLeader.description}</p>
                </div>

                <div className="org-modal-security-notice">
                  <RiShieldCheckLine size={20} className="notice-icon" />
                  <p>
                    <strong>Komitmen Integritas Dealer:</strong> Manajemen Mitsubishi Sun Margahayu memastikan seluruh proses pemesanan kendaraan, servis bengkel, dan pengadaan suku cadang mematuhi protokol resmi PT Sun Star Prima Motor.
                  </p>
                </div>
              </div>

              <div className="org-modal-actions">
                <button
                  type="button"
                  className="org-modal-btn-close"
                  onClick={() => setSelectedLeader(null)}
                >
                  Tutup Informasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
