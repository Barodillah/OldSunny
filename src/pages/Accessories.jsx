import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineMagnifyingGlass,
  HiOutlineCheck,
  HiOutlinePhone,
  HiOutlineXMark,
  HiOutlineTag,
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineArrowsPointingOut,
  HiOutlineArrowsPointingIn
} from 'react-icons/hi2'
import {
  RiWhatsappLine,
  RiCustomerService2Line,
  RiCarLine,
  RiShoppingBag3Line
} from 'react-icons/ri'
import accessoriesData from '../../aksesoris.json'
import AccessoryOrderModal from '../components/AccessoryOrderModal.jsx'
import './Accessories.css'

const RAW_ACCESSORIES = accessoriesData.mitsubishi_accessories || {}
const VEHICLE_KEYS = Object.keys(RAW_ACCESSORIES)

// Helper format IDR
const formatIDR = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

// Vehicle Metadata & Display Mapping
const VEHICLE_META = {
  Destinator: {
    name: 'Mitsubishi Destinator',
    shortName: 'Destinator',
    category: 'Premium MPV',
    badge: 'LUXURY SEATING',
    tagline: 'Aksesoris orisinal penunjang estetika eksklusif & kepraktisan kabin keluarga.',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg'
  },
  Xpander: {
    name: 'Mitsubishi New Xpander',
    shortName: 'New Xpander',
    category: 'Family MPV',
    badge: 'POPULAR CHOICE',
    tagline: 'Kustomisasi resmi MPV terfavorit Indonesia, teruji presisi dan aman garansi.',
    image: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png'
  },
  Xpander_Cross: {
    name: 'Mitsubishi New Xpander Cross',
    shortName: 'Xpander Cross',
    category: 'Crossover MPV',
    badge: 'ADVENTURE STYLING',
    tagline: 'Perkuat aksen gagah dan ketangguhan pelindung bodi siap lintas petualangan.',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg'
  },
  Pajero_Sport: {
    name: 'Mitsubishi New Pajero Sport',
    shortName: 'Pajero Sport',
    category: 'Prestige SUV 4x4',
    badge: 'ICONIC PRESTIGE',
    tagline: 'Aero kit dan styling mewah yang mempertegas dominasi sang legenda SUV.',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf1a837771d8.78886143.jpeg'
  },
  Xforce: {
    name: 'Mitsubishi New XFORCE',
    shortName: 'New XFORCE',
    category: 'Dynamic Compact SUV',
    badge: 'MODERN COMPACT',
    tagline: 'Styling aerodinamis futuristik dengan perlindungan soket OEM plug and play.',
    image: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png'
  }
}

export default function Accessories({ onOpenAiChat }) {
  const location = useLocation()

  const [activeVehicle, setActiveVehicle] = useState(VEHICLE_KEYS[0] || 'Destinator')
  const [singleCategoryFilter, setSingleCategoryFilter] = useState('all') // 'all' | 'exterior' | 'interior'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModalItem, setSelectedModalItem] = useState(null)
  const [orderModalItem, setOrderModalItem] = useState(null)

  // Full Image Preview Lightbox with Zoom & Pan state
  const [previewImage, setPreviewImage] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const openImagePreview = (item) => {
    setPreviewImage({
      src: item.img,
      title: item.item,
      price: item.price,
      vehicle: activeVehicleInfo.shortName,
      category: item.categoryLabel
    })
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const closeImagePreview = () => {
    setPreviewImage(null)
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 3.5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 0.6)
      if (next <= 1) setPanPosition({ x: 0, y: 0 })
      return next
    })
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.touches[0].clientX - panPosition.x,
      y: e.touches[0].clientY - panPosition.y
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return
    setPanPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  // Handle escape key and keyboard zoom controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          closeImagePreview()
        } else if (selectedModalItem) {
          setSelectedModalItem(null)
        }
      } else if (previewImage) {
        if (e.key === '+' || e.key === '=') {
          handleZoomIn()
        } else if (e.key === '-' || e.key === '_') {
          handleZoomOut()
        } else if (e.key === '0') {
          handleResetZoom()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewImage, selectedModalItem])

  // Scroll to top on page mount or vehicle switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Get active vehicle accessories
  const activeVehicleData = useMemo(() => {
    return RAW_ACCESSORIES[activeVehicle] || { exterior: [], interior: [], paket_aksesoris: [] }
  }, [activeVehicle])

  const activeVehicleInfo = VEHICLE_META[activeVehicle] || {
    name: activeVehicle.replace('_', ' '),
    shortName: activeVehicle.replace('_', ' '),
    category: 'Kendaraan Mitsubishi',
    badge: 'OEM GENUINE',
    tagline: 'Aksesoris resmi terverifikasi standar pabrikan.'
  }

  // 1. SECTION ATAS: Paket Aksesoris (Bundles)
  const bundleItems = useMemo(() => {
    const raw = activeVehicleData.paket_aksesoris || []
    return raw.map((item, idx) => ({
      ...item,
      categoryType: 'paket_aksesoris',
      categoryLabel: 'Paket Bundle Resmi',
      uniqueId: `bundle-${idx}`
    }))
  }, [activeVehicleData])

  // 2. SECTION BAWAH: Aksesoris Satuan (Exterior & Interior)
  const singleItems = useMemo(() => {
    const list = []

    // Exterior Items
    if (singleCategoryFilter === 'all' || singleCategoryFilter === 'exterior') {
      (activeVehicleData.exterior || []).forEach((item, idx) => {
        list.push({
          ...item,
          categoryType: 'exterior',
          categoryLabel: 'Eksterior & Styling',
          uniqueId: `ext-${idx}`
        })
      })
    }

    // Interior Items
    if (singleCategoryFilter === 'all' || singleCategoryFilter === 'interior') {
      (activeVehicleData.interior || []).forEach((item, idx) => {
        list.push({
          ...item,
          categoryType: 'interior',
          categoryLabel: 'Interior & Fungsional',
          uniqueId: `int-${idx}`
        })
      })
    }

    // Apply search query filter if user is searching
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter((item) => item.item.toLowerCase().includes(q))
  }, [activeVehicleData, singleCategoryFilter, searchQuery])

  // Total counts for active vehicle
  const counts = useMemo(() => {
    const p = (activeVehicleData.paket_aksesoris || []).length
    const e = (activeVehicleData.exterior || []).length
    const i = (activeVehicleData.interior || []).length
    return {
      total: p + e + i,
      paket: p,
      exterior: e,
      interior: i,
      satuanTotal: e + i
    }
  }, [activeVehicleData])

  // Build WhatsApp inquiry link
  const createWhatsAppLink = (item) => {
    if (!item) return '#'
    const text = `Halo Dealer Mitsubishi Sun Star Prima Motor Margahayu,\n\nSaya tertarik dengan aksesoris resmi:\n• Produk: ${item.item}\n• Model: ${activeVehicleInfo.name}\n• Estimasi Harga: ${formatIDR(item.price)}\n\nApakah stok unit tersedia dan bisa dijadwalkan pemasangan resmi tanpa menggugurkan garansi kelistrikan? Terima kasih!`
    return `https://wa.me/6282210928822?text=${encodeURIComponent(text)}`
  }

  // Handle direct inquiry via Sunny AI Floating Assistant
  const handleAskSunny = (item) => {
    if (!item) return
    const isPackage = Array.isArray(item.include)
    const promptQuery = isPackage
      ? `Halo Sunny, saya tertarik dengan paket aksesoris "${item.item}" untuk ${activeVehicleInfo.name} (${formatIDR(item.price)}). Apakah paket ini ready stok di dealer Sun Margahayu dan bagaimana proses estimasi pemasangannya?`
      : `Halo Sunny, saya ingin tanya ketersediaan dan pemasangan aksesoris resmi "${item.item}" untuk ${activeVehicleInfo.name} (${formatIDR(item.price)}). Apakah stok unit ready dan apakah garansi kelistrikan tetap aman?`

    // Dispatch custom event to trigger Sunny AI flyout & automatically submit query
    window.dispatchEvent(
      new CustomEvent('sunny_ask_question', {
        detail: {
          query: promptQuery,
          accessory: item,
          vehicle: activeVehicleInfo
        }
      })
    )

    // Fallback prop callback if provided
    if (onOpenAiChat) {
      onOpenAiChat({
        id: 'accessory_inquiry',
        title: `${item.item} (${activeVehicleInfo.shortName})`,
        query: promptQuery
      })
    }
  }

  return (
    <div className="accessories-page-root">
      {/* 2. VEHICLE TAB PANE SELECTOR */}
      <section className="acc-tabs-section" aria-label="Pilih Model Kendaraan">
        <div className="acc-tabs-container">
          <div className="acc-tabs-bar" role="tablist">
            {VEHICLE_KEYS.map((vKey) => {
              const meta = VEHICLE_META[vKey] || { shortName: vKey, badge: 'OEM' }
              const isSelected = activeVehicle === vKey
              const count = (RAW_ACCESSORIES[vKey]?.paket_aksesoris?.length || 0) +
                (RAW_ACCESSORIES[vKey]?.exterior?.length || 0) +
                (RAW_ACCESSORIES[vKey]?.interior?.length || 0)

              return (
                <button
                  key={vKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`acc-vehicle-tab ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveVehicle(vKey)
                    setSingleCategoryFilter('all')
                    setSearchQuery('')
                  }}
                >
                  <RiCarLine size={18} className="tab-car-icon" />
                  <span className="tab-car-name">{meta.shortName}</span>
                  <span className="tab-count-badge">{count} Item</span>
                </button>
              )
            })}
          </div>

          {/* Active Vehicle Status Bar */}
          <div className="acc-active-vehicle-banner">
            <div className="banner-left">
              <span className="banner-badge">{activeVehicleInfo.badge}</span>
              <h2 className="banner-title">{activeVehicleInfo.name}</h2>
              <p className="banner-tagline">{activeVehicleInfo.tagline}</p>
            </div>

            <div className="banner-right">
              <div className="banner-stat-box">
                <span className="stat-number">{counts.total}</span>
                <span className="stat-label">Total Aksesoris</span>
              </div>
              <div className="banner-stat-box">
                <span className="stat-number">{counts.paket}</span>
                <span className="stat-label">Paket Bundle</span>
              </div>
              <div className="banner-stat-box">
                <span className="stat-number">{counts.satuanTotal}</span>
                <span className="stat-label">Aksesoris Satuan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION ATAS: PAKET AKSESORIS (BUNDLE HEMAT) */}
      <section className="acc-bundles-section" aria-labelledby="section-bundles-heading">
        <div className="acc-content-container">
          <div className="acc-section-header">
            <div className="section-header-left">
              <div className="section-kicker-row">
                <span className="section-pill-tag tag-red">
                  <HiOutlineSparkles size={14} />
                  <span>Bundle Hemat</span>
                </span>
                <span className="section-pill-tag tag-neutral">PAKET HEMAT RESMI</span>
              </div>
            </div>
            <div className="section-header-right">
              <span className="bundle-count-pill">{bundleItems.length} Paket Tersedia</span>
            </div>
          </div>

          {bundleItems.length === 0 ? (
            <div className="acc-empty-bundle-notice">
              <p>Belum ada paket bundling khusus untuk model ini. Anda dapat memilih aksesoris satuan di bagian bawah.</p>
            </div>
          ) : (
            <div className="acc-bento-grid bento-bundles-grid">
              {bundleItems.map((item) => (
                <article
                  key={item.uniqueId}
                  className="bento-card bento-card-bundle"
                  onClick={() => setSelectedModalItem(item)}
                >
                  <div className="bento-bundle-top">
                    <div className="bento-badge-group">
                      <span className="bento-pill-bundle">
                        <HiOutlineSparkles size={13} />
                        <span>PAKET BUNDLE RESMI</span>
                      </span>
                      <span className="bento-category-tag">{activeVehicleInfo.shortName}</span>
                    </div>
                    <span className="bento-oem-label">100% Plug &amp; Play</span>
                  </div>

                  <div className="bento-bundle-body">
                    <div className="bento-bundle-img-wrap">
                      <img
                        src={item.img}
                        alt={item.item}
                        loading="lazy"
                        className="bento-bundle-img"
                        onError={(e) => {
                          e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
                        }}
                      />
                      <button
                        type="button"
                        className="bento-zoom-trigger-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openImagePreview(item)
                        }}
                        title="Perbesar / Full Preview Gambar"
                        aria-label="Perbesar gambar"
                      >
                        <HiOutlineMagnifyingGlassPlus size={15} />
                        <span>Preview Gambar</span>
                      </button>
                    </div>

                    <div className="bento-bundle-details">
                      <h3 className="bento-card-title">{item.item}</h3>
                      <div className="bento-price-tag">
                        <span className="price-kicker">Harga Resmi OTR Parts:</span>
                        <span className="price-number">{formatIDR(item.price)}</span>
                      </div>

                      {/* Included Items Checklist */}
                      {item.include && item.include.length > 0 && (
                        <div className="bento-bundle-includes">
                          <span className="includes-heading">Termasuk {item.include.length} Item Orisinal:</span>
                          <ul className="includes-list">
                            {item.include.map((incName, iIdx) => (
                              <li key={iIdx} className="includes-item">
                                <HiOutlineCheck size={14} className="inc-check-icon" />
                                <span>{incName}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bento-card-actions">
                        <button
                          type="button"
                          className="btn-bento-sunny"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAskSunny(item)
                          }}
                          title={`Tanya ketersediaan ${item.item} ke Asisten AI Sunny`}
                        >
                          <HiOutlineSparkles size={18} className="sunny-btn-sparkle" />
                          <span>Pesan Langsung ke Sunny</span>
                        </button>
                        <button
                          type="button"
                          className="btn-bento-detail"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedModalItem(item)
                          }}
                        >
                          <span>Detail Item</span>
                          <HiOutlineArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION BAWAH: AKSESORIS SATUAN (EKSTERIOR & INTERIOR) */}
      <section className="acc-singles-section" aria-labelledby="section-singles-heading">
        <div className="acc-content-container">
          <div className="acc-section-header">
            <div className="section-header-left">
              <div className="section-kicker-row">
                <span className="section-pill-tag tag-blue">
                  <HiOutlineCube size={14} />
                  <span>Aksesoris Satuan</span>
                </span>
                <span className="section-pill-tag tag-neutral">EXTERIOR &amp; INTERIOR</span>
              </div>
            </div>

            <div className="section-header-right">
              <span className="singles-count-pill">{counts.satuanTotal} Pilihan Satuan</span>
            </div>
          </div>

          {/* Sub-Category Filter & Live Search Controls for Satuan */}
          <div className="acc-filter-controls-row">
            <div className="acc-category-pills">
              <button
                type="button"
                className={`acc-cat-pill ${singleCategoryFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setSingleCategoryFilter('all')}
              >
                <HiOutlineSquares2X2 size={16} />
                <span>Semua Satuan ({counts.satuanTotal})</span>
              </button>

              <button
                type="button"
                className={`acc-cat-pill ${singleCategoryFilter === 'exterior' ? 'is-active' : ''}`}
                onClick={() => setSingleCategoryFilter('exterior')}
              >
                <HiOutlineTag size={16} />
                <span>Eksterior ({counts.exterior})</span>
              </button>

              <button
                type="button"
                className={`acc-cat-pill ${singleCategoryFilter === 'interior' ? 'is-active' : ''}`}
                onClick={() => setSingleCategoryFilter('interior')}
              >
                <RiShoppingBag3Line size={16} />
                <span>Interior ({counts.interior})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="acc-search-wrapper">
              <HiOutlineMagnifyingGlass size={18} className="search-icon" />
              <input
                type="text"
                placeholder={`Cari aksesoris satuan ${activeVehicleInfo.shortName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="acc-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                >
                  <HiOutlineXMark size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Bento Grid for Satuan */}
          {singleItems.length === 0 ? (
            <div className="acc-empty-state">
              <HiOutlineTag size={44} className="empty-icon" />
              <h3 className="empty-title">Aksesoris Satuan Tidak Ditemukan</h3>
              <p className="empty-desc">
                Tidak ada aksesoris satuan yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                className="btn-reset-filter"
                onClick={() => {
                  setSearchQuery('')
                  setSingleCategoryFilter('all')
                }}
              >
                Lihat Semua Aksesoris Satuan
              </button>
            </div>
          ) : (
            <>
              <div className="acc-bento-grid bento-singles-grid">
                {singleItems.map((item) => (
                  <article
                    key={item.uniqueId}
                    className="bento-card bento-card-standard"
                    onClick={() => setSelectedModalItem(item)}
                  >
                    <div className="bento-card-header">
                      <span className={`bento-type-badge type-${item.categoryType}`}>
                        {item.categoryLabel}
                      </span>
                      <span className="bento-vehicle-tag">{activeVehicleInfo.shortName}</span>
                    </div>

                    <div className="bento-img-container">
                      <img
                        src={item.img}
                        alt={item.item}
                        loading="lazy"
                        className="bento-standard-img"
                        onError={(e) => {
                          e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
                        }}
                      />
                      <button
                        type="button"
                        className="bento-zoom-trigger-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openImagePreview(item)
                        }}
                        title="Perbesar / Full Preview Gambar"
                        aria-label="Perbesar gambar"
                      >
                        <HiOutlineMagnifyingGlassPlus size={15} />
                        <span>Preview Gambar</span>
                      </button>
                    </div>

                    <div className="bento-content-box">
                      <h3 className="bento-item-title">{item.item}</h3>
                      <div className="bento-card-price-row">
                        <span className="bento-price-label">Harga Satuan:</span>
                        <span className="bento-price-val">{formatIDR(item.price)}</span>
                      </div>

                      <div className="bento-item-footer">
                        <div className="bento-footer-meta">
                          <span className="bento-socket-note">✓ Soket OEM Plug &amp; Play</span>
                        </div>
                        <button
                          type="button"
                          className="btn-bento-item-sunny"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAskSunny(item)
                          }}
                          title={`Tanya ketersediaan ${item.item} ke Asisten AI Sunny`}
                          aria-label={`Tanya ${item.item} ke Asisten AI Sunny`}
                        >
                          <HiOutlineSparkles size={15} className="sunny-btn-sparkle" />
                          <span>Pesan Langsung ke Sunny</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Informative Editorial Info Row (Break Di Bawah Grid Satuan) */}
              <div className="acc-editorial-info-row">
                {/* Informative Bento Tile 1: Jaminan Garansi Kelistrikan */}
                <div className="bento-card bento-card-info bento-info-warranty">
                  <div className="info-icon-circle">
                    <HiOutlineShieldCheck size={26} />
                  </div>
                  <h3 className="info-card-title">Jaminan Garansi 100% Aman</h3>
                  <p className="info-card-desc">
                    Setiap aksesoris satuan menggunakan soket konektor standar pabrikan. Pemasangan di bengkel resmi
                    Sun Margahayu tidak memotong kabel asli bawaan mobil, menjaga garansi kelistrikan tetap berlaku penuh.
                  </p>
                  <div className="info-check-row">
                    <span className="info-tag-check">✓ Tanpa Potong Kabel</span>
                    <span className="info-tag-check">✓ Presisi Pabrik</span>
                  </div>
                </div>

                {/* Informative Bento Tile 2: Sunny Virtual Assistant */}
                <div className="bento-card bento-card-info bento-info-sunny">
                  <div className="sunny-card-header">
                    <img
                      src="https://bewhy.id/wp-content/uploads/asset_6ad09424ada3f7.54954850.png"
                      alt="Maskot Asisten Sunny"
                      className="sunny-avatar-thumb"
                    />
                    <div>
                      <span className="sunny-badge-pill">ASISTEN 24 JAM</span>
                      <h3 className="sunny-box-title">Tanya Rekomendasi ke Sunny</h3>
                    </div>
                  </div>
                  <p className="sunny-card-desc">
                    Butuh rekomendasi aksesoris paling esensial untuk kebutuhan harian Anda?
                    Asisten Sunny siap membantu simulasi dan rekomendasi aksesoris terbaik.
                  </p>
                  <button
                    type="button"
                    className="btn-sunny-consult"
                    onClick={() => {
                      if (onOpenAiChat) {
                        onOpenAiChat({
                          id: 'accessories_consult',
                          title: `Konsultasi Aksesoris Resmi ${activeVehicleInfo.name}`
                        })
                      } else {
                        window.location.href = '/#sunny-assistant'
                      }
                    }}
                  >
                    <RiCustomerService2Line size={18} />
                    <span>Konsultasi Aksesoris AI</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. BOTTOM CONVERSION CTA BANNER */}
      <section className="acc-cta-section">
        <div className="acc-cta-container">
          <div className="acc-cta-content">
            <span className="acc-cta-kicker">INSTALASI RESMI MITSUBISHI SUN MARGAHAYU</span>
            <h2 className="acc-cta-heading">Siap Kustomisasi Kendaraan Idaman Anda?</h2>
            <p className="acc-cta-sub">
              Hubungi Service Advisor kami untuk konfirmasi ketersediaan stok komponen, estimasi waktu pasang, atau
              simulasi bundling aksesoris saat pemesanan unit baru.
            </p>
            <div className="acc-cta-btn-group">
              <a
                href="https://wa.me/6282210928822?text=Halo%20Layanan%20Servis%20Mitsubishi%20Sun%20Margahayu%2C%20saya%20ingin%20konsultasi%20pemasangan%20aksesoris%20resmi%20Mitsubishi."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-acc-cta-primary"
              >
                <RiWhatsappLine size={20} />
                <span>Hubungi Service Advisor via WA (0822-1092-8822)</span>
              </a>

              <a
                href="tel:02188347777"
                className="btn-acc-cta-secondary"
              >
                <HiOutlinePhone size={18} />
                <span>Telepon Dealer: (021) 8834 7777</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MODAL DETAIL POPUP */}
      {selectedModalItem && (
        <div
          className="acc-modal-backdrop"
          onClick={() => setSelectedModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="acc-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="acc-modal-close"
              onClick={() => setSelectedModalItem(null)}
              aria-label="Tutup modal"
            >
              <HiOutlineXMark size={22} />
            </button>

            <div className="acc-modal-layout">
              <div className="acc-modal-img-col">
                <img
                  src={selectedModalItem.img}
                  alt={selectedModalItem.item}
                  className="acc-modal-img"
                  onError={(e) => {
                    e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
                  }}
                />
                <button
                  type="button"
                  className="modal-zoom-trigger-btn"
                  onClick={() => openImagePreview(selectedModalItem)}
                  title="Buka Preview Gambar & Zoom"
                >
                  <HiOutlineArrowsPointingOut size={15} />
                  <span>Lihat Full &amp; Zoom</span>
                </button>
              </div>

              <div className="acc-modal-info-col">
                <div className="modal-top-tags">
                  <span className="modal-type-tag">{selectedModalItem.categoryLabel}</span>
                  <span className="modal-car-tag">{activeVehicleInfo.name}</span>
                </div>

                <h3 className="modal-item-name">{selectedModalItem.item}</h3>

                <div className="modal-price-box">
                  <span className="modal-price-kicker">Harga Resmi OTR:</span>
                  <span className="modal-price-val">{formatIDR(selectedModalItem.price)}</span>
                </div>

                {selectedModalItem.include && selectedModalItem.include.length > 0 && (
                  <div className="modal-included-box">
                    <h4 className="modal-included-title">Daftar Komponen Dalam Paket:</h4>
                    <ul className="modal-included-list">
                      {selectedModalItem.include.map((inc, i) => (
                        <li key={i} className="modal-included-item">
                          <HiOutlineCheck size={16} className="modal-check-icon" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-specs-list">
                  <div className="modal-spec-row">
                    <span className="spec-label">Standar Part:</span>
                    <span className="spec-val">100% Genuine OEM Mitsubishi Motors</span>
                  </div>
                  <div className="modal-spec-row">
                    <span className="spec-label">Metode Pasang:</span>
                    <span className="spec-val">Plug &amp; Play Soket Pabrik (Tanpa Potong Kabel)</span>
                  </div>
                  <div className="modal-spec-row">
                    <span className="spec-label">Status Garansi:</span>
                    <span className="spec-val text-green">100% Garansi Kelistrikan Tetap Berlaku</span>
                  </div>
                  <div className="modal-spec-row">
                    <span className="spec-label">Lokasi Pasang:</span>
                    <span className="spec-val">Bengkel Resmi Sun Star Prima Motor Margahayu</span>
                  </div>
                </div>

                <div className="modal-actions-group">
                  <button
                    type="button"
                    className="modal-btn-order"
                    onClick={() => {
                      const itemToOrder = selectedModalItem
                      setSelectedModalItem(null)
                      setOrderModalItem(itemToOrder)
                    }}
                  >
                    <RiShoppingBag3Line size={20} />
                    <span>Pesan Aksesoris</span>
                  </button>

                  <button
                    type="button"
                    className="modal-btn-secondary"
                    onClick={() => setSelectedModalItem(null)}
                  >
                    Kembali ke Katalog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FULL IMAGE PREVIEW & INTERACTIVE ZOOM LIGHTBOX */}
      {previewImage && (
        <div
          className="acc-lightbox-backdrop"
          onClick={closeImagePreview}
          role="dialog"
          aria-modal="true"
          aria-label="Preview Full Gambar"
        >
          <div
            className="acc-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header Bar */}
            <div className="acc-lightbox-header">
              <div className="lightbox-header-meta">
                <div className="lightbox-tags">
                  <span className="lightbox-badge-car">{previewImage.vehicle}</span>
                  <span className="lightbox-badge-cat">{previewImage.category}</span>
                </div>
                <h3 className="lightbox-item-title">{previewImage.title}</h3>
                {previewImage.price > 0 && (
                  <span className="lightbox-price-tag">{formatIDR(previewImage.price)}</span>
                )}
              </div>

              <div className="lightbox-header-actions">
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={closeImagePreview}
                  title="Tutup Preview (Esc)"
                  aria-label="Tutup Preview"
                >
                  <HiOutlineXMark size={22} />
                </button>
              </div>
            </div>

            {/* Lightbox Canvas Area with Zoom & Drag */}
            <div
              className={`acc-lightbox-viewport ${isDragging ? 'is-dragging' : ''} ${zoomLevel > 1 ? 'is-zoomed' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              onClick={() => {
                if (zoomLevel === 1) {
                  setZoomLevel(1.8)
                }
              }}
              title={zoomLevel === 1 ? 'Klik gambar untuk memperbesar' : 'Geser untuk melihat detail'}
            >
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="acc-lightbox-img"
                style={{
                  transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`,
                  transition: isDragging ? 'none' : 'transform 0.18s ease-out'
                }}
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
                }}
              />
            </div>

            {/* Lightbox Floating Controls Toolbar */}
            <div className="acc-lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-tool-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.6}
                title="Perkecil (-)"
                aria-label="Zoom Out"
              >
                <HiOutlineMagnifyingGlassMinus size={19} />
              </button>

              <span className="lightbox-zoom-readout">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                className="lightbox-tool-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                title="Perbesar (+)"
                aria-label="Zoom In"
              >
                <HiOutlineMagnifyingGlassPlus size={19} />
              </button>

              <div className="lightbox-tool-sep" />

              <button
                type="button"
                className="lightbox-tool-btn lightbox-tool-reset"
                onClick={handleResetZoom}
                title="Reset Ukuran (100%)"
                aria-label="Reset Ukuran"
              >
                <HiOutlineArrowsPointingIn size={18} />
                <span>Reset</span>
              </button>

              <div className="lightbox-hint-pill">
                <span>Gunakan roda mouse atau tombol zoom • Geser saat diperbesar</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 8. ACCESSORY ORDER FORM MODAL */}
      <AccessoryOrderModal
        isOpen={!!orderModalItem}
        item={orderModalItem}
        vehicle={activeVehicleInfo}
        onClose={() => setOrderModalItem(null)}
      />
    </div>
  )
}
