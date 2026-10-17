import { useState, useMemo, useEffect } from 'react'
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
  HiOutlineCube
} from 'react-icons/hi2'
import {
  RiWhatsappLine,
  RiCustomerService2Line,
  RiCarLine,
  RiShoppingBag3Line
} from 'react-icons/ri'
import accessoriesData from '../../aksesoris.json'
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
    const text = `Halo Dealer Mitsubishi Sun Star Prima Motor Bekasi Timur,\n\nSaya tertarik dengan aksesoris resmi:\n• Produk: ${item.item}\n• Model: ${activeVehicleInfo.name}\n• Estimasi Harga: ${formatIDR(item.price)}\n\nApakah stok unit tersedia dan bisa dijadwalkan pemasangan resmi tanpa menggugurkan garansi kelistrikan? Terima kasih!`
    return `https://wa.me/6281288347777?text=${encodeURIComponent(text)}`
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
                        <a
                          href={createWhatsAppLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-bento-wa"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RiWhatsappLine size={18} />
                          <span>Pesan Paket via WA</span>
                        </a>
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
                    </div>

                    <div className="bento-content-box">
                      <h3 className="bento-item-title">{item.item}</h3>
                      <div className="bento-card-price-row">
                        <span className="bento-price-label">Harga Satuan:</span>
                        <span className="bento-price-val">{formatIDR(item.price)}</span>
                      </div>

                      <div className="bento-item-footer">
                        <span className="bento-socket-note">✓ Soket OEM Plug &amp; Play</span>
                        <a
                          href={createWhatsAppLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-bento-icon-wa"
                          title="Pesan via WhatsApp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RiWhatsappLine size={18} />
                        </a>
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
                    Sun Motor Bekasi Timur tidak memotong kabel asli bawaan mobil, menjaga garansi kelistrikan tetap berlaku penuh.
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
            <span className="acc-cta-kicker">INSTALASI RESMI MITSUBISHI BEKASI TIMUR</span>
            <h2 className="acc-cta-heading">Siap Kustomisasi Kendaraan Idaman Anda?</h2>
            <p className="acc-cta-sub">
              Hubungi Service Advisor kami untuk konfirmasi ketersediaan stok komponen, estimasi waktu pasang, atau
              simulasi bundling aksesoris saat pemesanan unit baru.
            </p>
            <div className="acc-cta-btn-group">
              <a
                href="https://wa.me/6281288347777?text=Halo%20Sun%20Star%20Prima%20Motor%20Bekasi%2C%20saya%20ingin%20konsultasi%20pemasangan%20aksesoris%20resmi%20Mitsubishi."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-acc-cta-primary"
              >
                <RiWhatsappLine size={20} />
                <span>Hubungi Service Advisor via WA</span>
              </a>

              <a
                href="tel:0218808000"
                className="btn-acc-cta-secondary"
              >
                <HiOutlinePhone size={18} />
                <span>Telepon Dealer (021) 880-8000</span>
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
                    <span className="spec-val">Bengkel Resmi Sun Star Prima Motor Bekasi</span>
                  </div>
                </div>

                <div className="modal-actions-group">
                  <a
                    href={createWhatsAppLink(selectedModalItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-btn-wa"
                  >
                    <RiWhatsappLine size={20} />
                    <span>Pesan &amp; Jadwalkan Pasang via WhatsApp</span>
                  </a>

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
    </div>
  )
}
