import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineTag,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationCircle
} from 'react-icons/hi2'
import { RiCarLine, RiWhatsappLine } from 'react-icons/ri'
import './SearchResults.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua Hasil' },
  { id: 'vehicle', label: 'Kendaraan' },
  { id: 'article', label: 'Berita & Artikel' },
  { id: 'promo', label: 'Promo & Event' },
  { id: 'sales', label: 'Sales & Wiraniaga' },
  { id: 'employee', label: 'Karyawan & Pejabat' },
  { id: 'accessory', label: 'Aksesoris Resmi' },
  { id: 'sparepart', label: 'Suku Cadang' },
  { id: 'page', label: 'Halaman Website' }
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const q = searchParams.get('q') || ''
  const activeCategory = searchParams.get('category') || 'all'

  const [searchInput, setSearchInput] = useState(q)
  const [results, setResults] = useState([])
  const [counts, setCounts] = useState({
    all: 0,
    vehicle: 0,
    article: 0,
    promo: 0,
    sales: 0,
    employee: 0,
    accessory: 0,
    sparepart: 0,
    page: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Sync search input if query param changes
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  // Fetch search results on query or category change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (q.trim().length < 3) {
      setResults([])
      setCounts({
        all: 0,
        vehicle: 0,
        article: 0,
        promo: 0,
        sales: 0,
        employee: 0,
        accessory: 0,
        sparepart: 0,
        page: 0
      })
      return
    }

    let active = true
    setIsLoading(true)

    fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q.trim())}&category=${activeCategory}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) {
          setResults(data.results || [])
          setCounts(data.counts || {})
        }
      })
      .catch((err) => {
        console.error('Error fetching search results:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [q, activeCategory])

  const handleRefineSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (!trimmed) return
    setSearchParams({ q: trimmed, category: 'all' })
  }

  const handleSelectCategory = (catId) => {
    setSearchParams({ q, category: catId })
  }

  // Lempar pertanyaan suku cadang ke asisten Sunny AI
  const handleAskSunnySparepart = (item) => {
    const promptText = `Halo Sunny, saya sedang mencari suku cadang resmi "${item.title}" (${item.subtitle || ''}). Apakah stok suku cadang ini tersedia di bengkel resmi Mitsubishi Margahayu dan berapa estimasi biaya pasangnya?`
    window.dispatchEvent(
      new CustomEvent('sunny_ask_question', {
        detail: { query: promptText }
      })
    )
  }

  const renderIcon = (item) => {
    if (item.image) {
      return <img src={item.image} alt={item.title} className="search-card-img" />
    }
    switch (item.type) {
      case 'vehicle':
        return <RiCarLine size={24} />
      case 'article':
        return <HiOutlineDocumentText size={24} />
      case 'sales':
        return <HiOutlineUserGroup size={24} />
      case 'employee':
        return <HiOutlineBuildingOffice2 size={24} />
      case 'promo':
        return <HiOutlineTag size={24} />
      case 'accessory':
        return <HiOutlineSparkles size={24} />
      case 'sparepart':
        return <HiOutlineWrenchScrewdriver size={24} />
      default:
        return <HiOutlineDocumentText size={24} />
    }
  }

  const getActionLabel = (type) => {
    switch (type) {
      case 'vehicle':
        return 'Lihat Spesifikasi & Harga'
      case 'article':
        return 'Baca Artikel Lengkap'
      case 'sales':
        return 'Lihat Profil Sales'
      case 'employee':
        return 'Lihat Struktur Organisasi'
      case 'promo':
        return 'Lihat Program Promo'
      case 'accessory':
        return 'Katalog Aksesoris'
      default:
        return 'Kunjungi Halaman'
    }
  }

  return (
    <div className="search-page-root">
      <div className="search-page-container">
        {/* Search Refine Card */}
        <div className="search-header-card">
          <div className="search-header-kicker">Pencarian Universal</div>
          <h1 className="search-header-title">
            {q ? (
              <>
                Hasil Pencarian untuk: <strong>"{q}"</strong>
              </>
            ) : (
              'Pusat Pencarian Showroom & Layanan'
            )}
          </h1>

          <form className="search-refine-form" onSubmit={handleRefineSubmit}>
            <div className="search-refine-input-wrapper">
              <HiOutlineMagnifyingGlass size={20} className="search-refine-icon" />
              <input
                type="text"
                className="search-refine-input"
                placeholder="Cari mobil, promo, berita, booking servis, aksesoris, sparepart..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-search-submit">
              Cari Sekarang
            </button>
          </form>
        </div>

        {/* Category Tabs */}
        {q.trim().length >= 3 && (
          <div className="search-categories-bar" role="tablist">
            {CATEGORY_TABS.map((tab) => {
              const count = counts[tab.id] || 0
              const isActive = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`search-cat-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelectCategory(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{tab.label}</span>
                  <span className="cat-count-badge">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Results Area */}
        {isLoading ? (
          <div className="search-empty-state">
            <div className="search-loading-spinner" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="search-empty-title">Sedang Mencari Data...</h3>
            <p className="search-empty-desc">
              Menelusuri database kendaraan, berita artikel, sales, pejabat, promo, aksesoris, dan suku cadang.
            </p>
          </div>
        ) : q.trim().length < 3 ? (
          <div className="search-empty-state">
            <div className="search-empty-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <HiOutlineMagnifyingGlass size={28} />
            </div>
            <h3 className="search-empty-title">Masukkan Minimal 3 Karakter</h3>
            <p className="search-empty-desc">
              Ketikkan nama mobil, berita, tips servis, promo, aksesoris, atau nomor suku cadang untuk memulai pencarian.
            </p>
            <div className="search-empty-suggestions">
              {['Xpander', 'Pajero', 'Booking Servis', 'Promo Bunga 0%', 'Extended SMART Package', 'Air Aki'].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn-suggestion-pill"
                  onClick={() => setSearchParams({ q: s, category: 'all' })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">
              <HiOutlineExclamationCircle size={32} />
            </div>
            <h3 className="search-empty-title">Tidak Ada Hasil Ditemukan</h3>
            <p className="search-empty-desc">
              Kami tidak menemukan kecocokan untuk kata kunci "<strong>{q}</strong>" pada kategori{' '}
              {CATEGORY_TABS.find((t) => t.id === activeCategory)?.label || 'ini'}.
            </p>
            <div className="search-empty-suggestions">
              {['Xpander', 'Pajero Sport', 'Service on Road', 'Promo DP Ringan', 'Aksesoris', 'Tips Aki'].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn-suggestion-pill"
                  onClick={() => setSearchParams({ q: s, category: 'all' })}
                >
                  Coba: {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-results-grid">
            {results.map((item, idx) => (
              <div key={item.id || idx} className="search-card-item">
                <div className="search-card-header">
                  <div className="search-card-thumb">{renderIcon(item)}</div>
                  <div className="search-card-meta">
                    <span
                      className="search-card-badge"
                      style={{
                        color: item.badge_color || '#dc2626',
                        backgroundColor: item.badge_bg || '#fef2f2'
                      }}
                    >
                      {item.badge || item.category_name}
                    </span>
                    <h3 className="search-card-title">{item.title}</h3>
                  </div>
                </div>

                {item.subtitle && <p className="search-card-desc">{item.subtitle}</p>}

                <div className="search-card-footer">
                  {item.type === 'sparepart' ? (
                    <button
                      type="button"
                      className="search-card-action-btn btn-action-sparepart"
                      onClick={() => handleAskSunnySparepart(item)}
                      title="Tanya stok dan estimasi biaya suku cadang ke asisten Sunny"
                    >
                      <HiOutlineSparkles size={16} />
                      <span>Tanya Stok ke Sunny AI</span>
                      <HiOutlineArrowRight size={14} />
                    </button>
                  ) : item.type === 'sales' && item.phone ? (
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${item.title}, saya menemukan kontak Anda melalui pencarian dealer Mitsubishi Margahayu.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="search-card-action-btn btn-action-sales-wa"
                      title="Hubungi Sales via WhatsApp"
                    >
                      <RiWhatsappLine size={16} />
                      <span>Hubungi Sales (WA)</span>
                      <HiOutlineArrowRight size={14} />
                    </a>
                  ) : (
                    <Link
                      to={item.link}
                      className="search-card-action-btn"
                    >
                      <span>{getActionLabel(item.type)}</span>
                      <HiOutlineArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
