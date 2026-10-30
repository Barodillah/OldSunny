import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineTag,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2'
import { RiCarLine } from 'react-icons/ri'
import './GlobalSearchModal.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Reset & focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setActiveIndex(-1)
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = scrollBarWidth + 'px'
      }
      document.body.classList.add('search-modal-open')
      return () => {
        clearTimeout(timeout)
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        document.body.classList.remove('search-modal-open')
      }
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.classList.remove('search-modal-open')
    }
  }, [isOpen])

  // Handle live search suggestions (min 3 chars, 250ms debounce)
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setResults([])
      setCounts({})
      setLoading(false)
      setActiveIndex(-1)
      return
    }

    let active = true
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        if (active && data.success) {
          setResults(data.results || [])
          setCounts(data.counts || {})
          setActiveIndex(-1)
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err)
      } finally {
        if (active) setLoading(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  // Handle clicking a specific suggestion item
  const handleItemClick = (item) => {
    if (!item) return
    onClose()
    if (item.type === 'sparepart') {
      window.dispatchEvent(new CustomEvent('sunny_ask_question', {
        detail: {
          query: `Halo Sunny, saya sedang mencari suku cadang resmi "${item.title}" (${item.subtitle || ''}). Apakah stoknya tersedia di bengkel resmi Mitsubishi Margahayu dan berapa estimasi biaya pasangnya?`
        }
      }))
      return
    }
    if (item.link) {
      navigate(item.link)
    }
  }

  // Handle Enter key or redirect to search results page
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    // If an item is actively selected via arrow keys, open that item
    if (activeIndex >= 0 && results[activeIndex]) {
      handleItemClick(results[activeIndex])
      return
    }

    // Otherwise redirect to full search result page
    onClose()
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  // Keyboard navigation (ArrowUp, ArrowDown, Escape, Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (results.length > 0) {
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (results.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
      }
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    }
  }

  // Helper icon renderer based on result category
  const renderItemIcon = (item) => {
    if (item.image) {
      return <img src={item.image} alt={item.title} className="search-item-img" />
    }
    switch (item.type) {
      case 'vehicle':
        return <RiCarLine size={20} />
      case 'sales':
        return <HiOutlineUserGroup size={20} />
      case 'employee':
        return <HiOutlineBuildingOffice2 size={20} />
      case 'promo':
        return <HiOutlineTag size={20} />
      case 'accessory':
        return <HiOutlineSparkles size={20} />
      case 'sparepart':
        return <HiOutlineWrenchScrewdriver size={20} />
      default:
        return <HiOutlineDocumentText size={20} />
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="global-search-backdrop" onClick={onClose}>
      <div
        className="global-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Modal Pencarian Universal"
      >
        {/* Search Header Input Field */}
        <form className="global-search-input-row" onSubmit={handleSearchSubmit}>
          <HiOutlineMagnifyingGlass size={22} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Cari mobil, promo, sales, servis, aksesoris, sparepart..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Kolom Pencarian"
          />
          {loading && <div className="search-loading-spinner" title="Mencari..." />}
          <button
            type="button"
            className="search-close-btn"
            onClick={onClose}
            title="Tutup pencarian"
            aria-label="Tutup pencarian"
          >
            <HiOutlineXMark size={18} />
          </button>
        </form>

        {/* Suggestion & Results Body */}
        <div className="global-search-body">
          {query.trim().length < 3 ? (
            <div className="search-hint-empty">
              <p>Tekan <strong>Enter</strong> setelah mengetik untuk melihat hasil pencarian lengkap.</p>
            </div>
          ) : !loading && results.length === 0 ? (
            <div className="search-hint-empty">
              Tidak ada hasil yang sesuai dengan "<strong>{query}</strong>"
              <p>Coba gunakan kata kunci lain seperti <em>Xpander, Servis, Promo, Sales, atau Sparepart</em>.</p>
            </div>
          ) : (
            <div className="search-results-list" role="listbox">
              {results.slice(0, 10).map((item, idx) => {
                const isActive = idx === activeIndex
                return (
                  <div
                    key={item.id || idx}
                    className={`search-result-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div className="search-item-thumb">
                      {renderItemIcon(item)}
                    </div>
                    <div className="search-item-info">
                      <div className="search-item-top">
                        <span
                          className="search-item-badge"
                          style={{
                            color: item.badge_color || '#dc2626',
                            backgroundColor: item.badge_bg || '#fef2f2'
                          }}
                        >
                          {item.badge || item.category_name}
                        </span>
                      </div>
                      <h4 className="search-item-title">{item.title}</h4>
                      {item.subtitle && <p className="search-item-sub">{item.subtitle}</p>}
                    </div>
                    <HiOutlineArrowRight size={16} className="search-item-arrow" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="global-search-footer">
          <div className="search-footer-shortcuts">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Pilih</span>
            <span><kbd>↵</kbd> Buka / Cari</span>
            <span><kbd>ESC</kbd> Tutup</span>
          </div>

          {query.trim().length >= 3 && (
            <button
              type="button"
              className="btn-search-all-full"
              onClick={handleSearchSubmit}
            >
              <span>Lihat semua hasil ({results.length})</span>
              <HiOutlineArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

