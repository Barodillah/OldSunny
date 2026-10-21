import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineArrowUpRight,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineChevronRight
} from 'react-icons/hi2'
import { RiAwardLine, RiSteering2Line } from 'react-icons/ri'
import TestDriveModal from '../components/TestDriveModal.jsx'
import vehicleData from '../../vehicle-list.json'
import './Vehicles.css'

// Helper format IDR currency
const formatIDR = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

// Format short price (e.g. 388 Jt or 1.33 M)
const formatShortPrice = (val) => {
  if (!val) return ''
  if (val >= 1000000000) {
    const m = (val / 1000000000).toFixed(2).replace(/\.?0+$/, '')
    return `Rp ${m} Milyar`
  }
  const jt = (val / 1000000).toFixed(1).replace(/\.?0+$/, '')
  return `Rp ${jt} Juta`
}

// Toggle tampilkan armada truk niaga (Commercial Trucks: Canter, Fighter X, Tractor Head)
const SHOW_COMMERCIAL = false

export default function Vehicles() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('passenger') // 'passenger' | 'commercial'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [testDriveVehicle, setTestDriveVehicle] = useState(null)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Normalize Passenger Cars
  const passengerCars = useMemo(() => {
    const raw = vehicleData.passenger_car || {}
    const modelMeta = {
      new_xforce: {
        name: 'New XFORCE',
        category: 'Compact SUV',
        tagline: 'Infinite Comfort & Dynamic Tech',
        isHighlight: true,
        highlightBadge: '★ Highlight Model'
      },
      destinator: {
        name: 'Destinator',
        category: 'Premium MPV',
        tagline: 'Elegance & Refined Spaciousness',
        isHighlight: false
      },
      new_xpander: {
        name: 'New Xpander',
        category: 'Family MPV',
        tagline: 'Pilihan Utama Keluarga Indonesia',
        isHighlight: false
      },
      new_xpander_cross: {
        name: 'New Xpander Cross',
        category: 'Crossover MPV',
        tagline: 'Tangguh Berjiwa Petualang',
        isHighlight: false
      },
      new_pajero_sport: {
        name: 'New Pajero Sport',
        category: 'Prestige SUV 4x4',
        tagline: 'Ikon Ketangguhan & Kemewahan Sejati',
        isHighlight: false
      },
      triton: {
        name: 'All New Triton',
        category: 'Double & Single Cabin',
        tagline: 'Tangguh di Medan Ekstrem & Fleksibel',
        isHighlight: false
      },
      l300: {
        name: 'Colt L300',
        category: 'Niaga Legendaris',
        tagline: 'Mitra Bisnis Tangguh & Efisien',
        isHighlight: false
      }
    }

    // Put new_xforce first because it's the highlight
    const order = ['new_xforce', 'new_pajero_sport', 'destinator', 'new_xpander', 'new_xpander_cross', 'triton', 'l300']

    return order.map((key) => {
      const data = raw[key] || {}
      const meta = modelMeta[key] || { name: key, category: 'Passenger' }
      const items = data.items || []
      const prices = items.map((i) => i.price).filter(Boolean)
      const minPrice = prices.length ? Math.min(...prices) : 0
      const maxPrice = prices.length ? Math.max(...prices) : 0

      return {
        id: key,
        typeGroup: 'passenger',
        name: meta.name,
        category: meta.category,
        tagline: meta.tagline,
        isHighlight: meta.isHighlight || false,
        highlightBadge: meta.highlightBadge || null,
        image: data.image,
        items: items,
        additionalCost: data.additional_cost || null,
        minPrice,
        maxPrice,
        variantCount: items.length,
        variantsPreview: items.map((i) => i.type).join(', ')
      }
    })
  }, [])

  // Normalize Commercial Cars
  const commercialCars = useMemo(() => {
    const raw = vehicleData.commercial_car || {}
    const modelMeta = {
      canter: {
        name: 'Canter Euro 4',
        category: 'Light Duty Truck',
        tagline: 'Si Jago Angkut Ekspedisi & Logistik',
        categoryLabels: {
          economical: 'Economical',
          capacity: 'High Capacity',
          bus: 'Bus Chassis & Body',
          speed: 'Speed & Highway',
          power: 'Power & Heavy Duty'
        }
      },
      fighter_x: {
        name: 'Fighter X Euro 4',
        category: 'Medium Duty Truck',
        tagline: 'Truk Muatan Berat 240 & 270 PS',
        categoryLabels: {
          '6x4': '6x4 Heavy Hauler',
          '6x2': '6x2 Long Cargo',
          '4x2': '4x2 Medium Delivery'
        }
      },
      tractor_head: {
        name: 'Tractor Head Euro 4',
        category: 'Heavy Duty Puller',
        tagline: 'Kekuatan Maksimal Penarik Kontainer & Tangki',
        categoryLabels: {
          head_unit: 'Head Unit Tractor'
        }
      }
    }

    const order = ['canter', 'fighter_x', 'tractor_head']

    return order.map((key) => {
      const data = raw[key] || {}
      const meta = modelMeta[key] || { name: key, category: 'Commercial' }
      const rawCategories = data.categories || {}

      // Flatten items while tagging category
      const flatItems = []
      Object.entries(rawCategories).forEach(([catKey, items]) => {
        const catLabel = meta.categoryLabels?.[catKey] || catKey
        items.forEach((item) => {
          flatItems.push({
            ...item,
            categoryGroup: catLabel
          })
        })
      })

      const prices = flatItems.map((i) => i.price).filter(Boolean)
      const minPrice = prices.length ? Math.min(...prices) : 0
      const maxPrice = prices.length ? Math.max(...prices) : 0

      return {
        id: key,
        typeGroup: 'commercial',
        name: meta.name,
        category: meta.category,
        tagline: meta.tagline,
        isHighlight: false,
        image: data.image,
        rawCategories: rawCategories,
        categoryLabels: meta.categoryLabels || {},
        items: flatItems,
        additionalCost: null,
        minPrice,
        maxPrice,
        variantCount: flatItems.length,
        variantsPreview: flatItems.slice(0, 3).map((i) => i.type).join(', ') + (flatItems.length > 3 ? '...' : '')
      }
    })
  }, [])

  // Highlight Vehicle (New XFORCE)
  const highlightVehicle = passengerCars.find((car) => car.id === 'new_xforce') || passengerCars[0]

  // Filtered List based on active tab and search query
  const displayedCars = useMemo(() => {
    const list = (SHOW_COMMERCIAL && activeTab === 'commercial') ? commercialCars : passengerCars
    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase().trim()
    return list.filter((car) => {
      const matchesName = car.name.toLowerCase().includes(q)
      const matchesCategory = car.category.toLowerCase().includes(q)
      const matchesVariants = car.items.some((i) =>
        i.type.toLowerCase().includes(q) || (i.spec && i.spec.toLowerCase().includes(q))
      )
      return matchesName || matchesCategory || matchesVariants
    })
  }, [activeTab, passengerCars, commercialCars, searchQuery])

  // Scroll to catalog section smoothly
  const scrollToCatalog = (tabKey) => {
    if (tabKey && (SHOW_COMMERCIAL || tabKey === 'passenger')) setActiveTab(tabKey)
    const el = document.getElementById('catalog-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="vehicles-page">
      {/* ====================================================================
          HERO SECTION (CINEMATIC VIDEO BACKGROUND & HUD CARD)
          Inspired by User Reference Image
          ==================================================================== */}
      <section className="vehicles-hero" aria-label="Line-up Kendaraan Mitsubishi">
        {/* Background Video */}
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="https://csdwindo.com/wp-content/uploads/newxforcetr.png"
          >
            <source
              src="https://bewhy.id/wp-content/uploads/asset_6ad1bff9cbc285.84139036.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Ambient Overlays */}
        <div className="hero-gradient-overlay" />
        <div className="hero-radial-glow" />

        {/* Hero Grid Container */}
        <div className="hero-content-grid">
          {/* Left Editorial Text */}
          <div className="hero-left-editorial">
            <div className="hero-top-badge-row">
              <span className="hero-brand-pill">
                <span className="dot" />
                Mitsubishi Sun Margahayu
              </span>
              <span className="hero-period-tag">
                Pricelist Resmi • {vehicleData.meta?.periode || 'Oktober 2026'}
              </span>
            </div>

            <h1 className="hero-main-title">
              Where style <br />
              meets the <span className="highlight-red">road</span>
            </h1>

            <p className="hero-description">
              Experience the road in unmatched elegance and power. Jelajahi line-up lengkap kendaraan
              penumpang (Passenger Car){SHOW_COMMERCIAL ? ' dan armada niaga (Commercial Car)' : ''} dengan penawaran OTR transparan
              dan unit uji jalan siap diantar ke tempat Anda.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="hero-btn-primary"
                onClick={() => scrollToCatalog('passenger')}
              >
                <span>Jelajahi Kendaraan</span>
                <HiOutlineChevronRight size={18} />
              </button>

              <Link
                to="/sales"
                className="hero-btn-secondary"
                title="Pilih Wiraniaga Terbaik Mitsubishi Sun Margahayu"
              >
                <RiAwardLine size={18} />
                <span>Pilih Sales Terbaik</span>
              </Link>
            </div>
          </div>

          {/* Right Floating Glassmorphic HUD Card */}
          <aside className="hero-hud-card" aria-label="Navigasi Cepat & Highlight Model">
            {/* Quick Links inside HUD */}
            <ul className="hud-nav-list">
              <li>
                <button
                  type="button"
                  className={`hud-nav-item ${activeTab === 'passenger' ? 'active' : ''}`}
                  onClick={() => scrollToCatalog('passenger')}
                >
                  <span>Passenger Cars</span>
                  <span className="hud-count">{passengerCars.length} Model</span>
                </button>
              </li>
              {SHOW_COMMERCIAL && (
                <li>
                  <button
                    type="button"
                    className={`hud-nav-item ${activeTab === 'commercial' ? 'active' : ''}`}
                    onClick={() => scrollToCatalog('commercial')}
                  >
                    <span>Commercial Trucks</span>
                    <span className="hud-count">{commercialCars.length} Seri</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  className="hud-nav-item"
                  onClick={() => scrollToCatalog(activeTab)}
                >
                  <span>Pricelist Lengkap</span>
                  <span className="hud-count">OTR JABODETABEK</span>
                </button>
              </li>
            </ul>

            {/* Quick Contact Info Strip */}
            <div className="hud-contact-strip">
              <span>Jl. Ir. H. Juanda No. 35 Bulak Kapal, Bekasi Timur</span>
              <a href="tel:02188347777">📞 (021) 8834 7777</a>
              <a
                href="https://wa.me/6281318747300?text=Halo%20CS%20Sales%20Mitsubishi%20Sun%20Margahayu%2C%20saya%20ingin%20konsultasi%20kendaraan%20baru"
                target="_blank"
                rel="noopener noreferrer"
                title="Hubungi CS Sales via WhatsApp"
              >
                💬 WA: 0813-1874-7300
              </a>
            </div>

            {/* HIGHLIGHT MINI CARD: NEW XFORCE (Requested) */}
            {highlightVehicle && (
              <div
                className="hud-highlight-card"
                onClick={() => setSelectedVehicle(highlightVehicle)}
                title="Lihat detail New XFORCE"
              >
                <div className="hud-highlight-thumb-box">
                  <img
                    src={highlightVehicle.image}
                    alt={highlightVehicle.name}
                    className="hud-highlight-thumb"
                  />
                </div>
                <div className="hud-highlight-info">
                  <span className="hud-highlight-badge">★ Highlight Model</span>
                  <h3 className="hud-highlight-title">{highlightVehicle.name}</h3>
                  <p className="hud-highlight-spec">1.5L HEV & CVT • Yamaha Audio</p>
                </div>
                <div className="hud-highlight-price-btn">
                  <span className="hud-price-pill">
                    Mulai {formatShortPrice(highlightVehicle.minPrice)}
                  </span>
                  <span className="hud-book-now">
                    Detail <HiOutlineArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ====================================================================
          CAR CATEGORY CATALOG SECTION
          Segmented Tabs: Passenger Car & Commercial Car
          ==================================================================== */}
      <main id="catalog-section" className="vehicles-catalog-section">
        {/* Header Bar */}
        <div className="catalog-header-bar">
          <div className="catalog-title-wrap">
            <h2 className="catalog-main-title">Car category</h2>
            <p className="catalog-subtitle">
              Pilih kategori dan model untuk melihat ragam varian, spesifikasi mesin, serta rincian
              harga resmi OTR Jabodetabek.
            </p>
          </div>

          {/* Two Tab Buttons */}
          <div className="catalog-tabs-container" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'passenger'}
              className={`catalog-tab-btn ${activeTab === 'passenger' ? 'active' : ''}`}
              onClick={() => setActiveTab('passenger')}
            >
              <span>Passenger Car</span>
              <span className="tab-badge-count">{passengerCars.length}</span>
            </button>

            {SHOW_COMMERCIAL && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'commercial'}
                className={`catalog-tab-btn ${activeTab === 'commercial' ? 'active' : ''}`}
                onClick={() => setActiveTab('commercial')}
              >
                <HiOutlineTruck size={17} />
                <span>Commercial Car</span>
                <span className="tab-badge-count">{commercialCars.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="catalog-filter-bar">
          <div className="search-input-wrapper">
            <HiOutlineMagnifyingGlass className="search-icon-inside" size={20} />
            <input
              type="text"
              placeholder={
                SHOW_COMMERCIAL && activeTab === 'commercial'
                  ? 'Cari varian Canter, Fighter, Tractor Head...'
                  : 'Cari varian Xforce, Pajero, Xpander, Triton...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari mobil atau tipe spesifikasi"
            />
          </div>

          <div className="catalog-meta-info">
            <span>
              Menampilkan <strong>{displayedCars.length}</strong> model kendaraan
            </span>
            <span>•</span>
            <span>Update Resmi: {vehicleData.meta?.periode || 'Oktober 2026'}</span>
          </div>
        </div>

        {/* Vehicle Cards Grid (Reference Image Style) */}
        <div className="vehicle-grid-container">
          {displayedCars.map((car) => {
            return (
              <article
                key={car.id}
                className={`vehicle-card-minimal ${car.isHighlight ? 'is-highlight' : ''}`}
                onClick={() => setSelectedVehicle(car)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedVehicle(car)
                  }
                }}
              >
                {/* Top Header: Title, Category & Arrow */}
                <div className="card-top-header">
                  <div className="card-title-group">
                    {car.isHighlight && (
                      <span className="card-highlight-tag">
                        <HiOutlineSparkles size={12} />
                        Highlight
                      </span>
                    )}
                    <h3 className="card-title-main">{car.name}</h3>
                    <span className="card-category-sub">{car.category}</span>
                  </div>

                  <div className="card-arrow-icon" aria-hidden="true">
                    <HiOutlineArrowUpRight size={19} />
                  </div>
                </div>

                {/* Center Image Showcase */}
                <div className="card-image-stage">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="card-vehicle-img"
                    loading="lazy"
                  />
                </div>

                {/* Bottom Information */}
                <div className="card-bottom-info">
                  <div className="card-price-row">
                    <span className="price-label-small">Harga Mulai</span>
                    <span className="price-value-bold">{formatIDR(car.minPrice)}</span>
                  </div>

                  <p className="card-variants-preview" title={car.variantsPreview}>
                    {car.variantsPreview}
                  </p>

                  <div className="card-action-bar">
                    <button
                      type="button"
                      className="card-view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVehicle(car)
                      }}
                    >
                      <span>Lihat Rincian Varian</span>
                      <HiOutlineChevronRight size={14} />
                    </button>
                    <span className="card-variant-count-pill">
                      {car.variantCount} Varian
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* ====================================================================
          VEHICLE DETAIL MODAL / DRAWER
          Shows All Variants, Specs, Additional Costs & Direct Consultation
          ==================================================================== */}
      {selectedVehicle && (
        <div
          className="vehicle-modal-backdrop"
          onClick={() => setSelectedVehicle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="vehicle-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-bar">
              <div className="modal-header-title-wrap">
                <h3 className="modal-title-main">{selectedVehicle.name}</h3>
                <span className="card-variant-count-pill">
                  {selectedVehicle.category}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedVehicle(null)}
                aria-label="Tutup detail kendaraan"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="modal-body-scrollable">
              {/* Showcase Image & Starting Price */}
              <div className="modal-showcase-box">
                <img
                  src={selectedVehicle.image}
                  alt={selectedVehicle.name}
                  className="modal-vehicle-img"
                />
                <div className="modal-starting-price-box">
                  <span className="modal-start-label">Harga OTR Mulai:</span>
                  <span className="modal-start-val">
                    {formatIDR(selectedVehicle.minPrice)}
                  </span>
                </div>
              </div>

              {/* Variants List */}
              <div>
                <h4 className="modal-section-title">
                  Daftar Tipe & Harga Resmi ({selectedVehicle.variantCount} Pilihan)
                </h4>

                <div className="variant-items-list">
                  {selectedVehicle.items.map((item, idx) => (
                    <div key={idx} className="variant-item-card">
                      <div className="variant-title-and-spec">
                        <span className="variant-type-name">{item.type}</span>
                        {item.spec && (
                          <span className="variant-spec-pill">
                            Spesifikasi: {item.spec}
                          </span>
                        )}
                        {item.categoryGroup && (
                          <span className="variant-spec-pill">
                            Kategori: {item.categoryGroup}
                          </span>
                        )}
                      </div>

                      <div className="variant-price-tag">
                        {formatIDR(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Cost if exists (Warna Putih, Two Tone, Paket Premium) */}
              {selectedVehicle.additionalCost && (
                <div className="additional-cost-box">
                  <div className="additional-cost-title">
                    Biaya Tambahan Pilihan Warna / Paket:
                  </div>
                  {Object.entries(selectedVehicle.additionalCost).map(([costKey, costVal]) => {
                    const label = costKey
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                    return (
                      <div key={costKey} className="cost-row">
                        <span>{label}</span>
                        <strong>+ {formatIDR(costVal)}</strong>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="modal-footer-bar">
              <button
                type="button"
                className="modal-testdrive-btn"
                onClick={() => {
                  setTestDriveVehicle(selectedVehicle)
                  setSelectedVehicle(null)
                }}
              >
                <RiSteering2Line size={18} />
                <span>Jadwalkan Test Drive</span>
              </button>

              <Link
                to="/sales"
                className="modal-sales-btn"
                onClick={() => setSelectedVehicle(null)}
                title="Pilih Sales Terbaik Mitsubishi Sun Margahayu"
              >
                <RiAwardLine size={18} />
                <span>Pilih Sales Terbaik</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Test Drive Reservation Modal */}
      <TestDriveModal
        vehicle={testDriveVehicle}
        isOpen={Boolean(testDriveVehicle)}
        onClose={() => setTestDriveVehicle(null)}
        source="Website - Vehicles Page Detail"
      />
    </div>
  )
}
