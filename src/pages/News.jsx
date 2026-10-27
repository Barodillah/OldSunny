import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineArrowUpRight,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2'
import { NEWS_CATEGORIES } from '../data/newsData'
import { getStoredArticles, fetchArticlesFromBackend } from '../utils/articleStorage'
import './News.css'

export default function News() {
  const [searchParams] = useSearchParams()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  // Reactive article list loaded from backend
  const [allArticles, setAllArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchArticlesFromBackend().then((data) => {
      if (isMounted) {
        setAllArticles(data || [])
        setIsLoading(false)
      }
    })
    const handleUpdate = () => {
      setAllArticles(getStoredArticles())
    }
    window.addEventListener('sunny_articles_updated', handleUpdate)
    return () => {
      isMounted = false
      window.removeEventListener('sunny_articles_updated', handleUpdate)
    }
  }, [])

  // Only published articles are shown to visitors
  const publishedArticles = useMemo(() => {
    return allArticles.filter((a) => (a.status || 'published') === 'published')
  }, [allArticles])

  // Highlights for carousel
  const highlightArticles = useMemo(() => {
    const hl = publishedArticles.filter((a) => a.isHighlight)
    return hl.length > 0 ? hl : publishedArticles.slice(0, 3)
  }, [publishedArticles])

  // Sync with URL query parameter (e.g. from tag clicks)
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setSearchQuery(qParam)
    }
    const catParam = searchParams.get('category')
    if (catParam) {
      setSelectedCategory(catParam)
    }
  }, [searchParams])

  // Touch swipe support for carousel
  const touchStartXRef = useRef(null)
  const touchEndXRef = useRef(null)

  // 1. Auto-loop Carousel every 4.5s (pauses when user hovers or interacts)
  useEffect(() => {
    if (isCarouselPaused || highlightArticles.length <= 1) return

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % highlightArticles.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [isCarouselPaused, highlightArticles.length])

  const handlePrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? highlightArticles.length - 1 : prev - 1
    )
  }

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % highlightArticles.length)
  }

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return
    const distance = touchStartXRef.current - touchEndXRef.current
    if (distance > 50) {
      // Swiped left -> Next
      handleNextSlide()
    } else if (distance < -50) {
      // Swiped right -> Prev
      handlePrevSlide()
    }
    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  // 2. Filter and Search Logic
  const filteredArticles = publishedArticles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'Semua' || article.category === selectedCategory

    const query = searchQuery.trim().toLowerCase()
    const matchesQuery =
      query === '' ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      (article.author && article.author.toLowerCase().includes(query)) ||
      (article.fullContent && article.fullContent.toLowerCase().includes(query)) ||
      (article.tags && article.tags.some((t) => t.toLowerCase().includes(query)))

    return matchesCategory && matchesQuery
  })

  // Category counts map for pills
  const categoryCounts = NEWS_CATEGORIES.reduce((acc, cat) => {
    if (cat === 'Semua') {
      acc[cat] = publishedArticles.length
    } else {
      acc[cat] = publishedArticles.filter((item) => item.category === cat).length
    }
    return acc
  }, {})

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Semua')
  }

  return (
    <main className="news-page-wrapper">
      {/* ==================================================================
          HERO PAGE CAROUSEL (FULL-WIDTH HERO & INTEGRATED PAGE HEADER)
          ================================================================== */}
      {highlightArticles.length > 0 ? (
        <section
          className="news-hero-carousel"
          aria-label="Highlight Berita Utama dan Header News"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="news-hero-viewport">
            {highlightArticles.map((slide, index) => {
              const isActive = index === activeSlide
              return (
                <div
                  key={slide.id}
                  className={`news-hero-slide ${isActive ? 'active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="news-hero-backdrop"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="news-hero-overlay"></div>

                  <div className="news-hero-container">
                    <div className="news-hero-content-wrapper">
                      {/* Top Overline Header Bar within Hero */}
                      <div className="news-hero-top-bar">
                        <div className="news-hero-branding">
                          <span className="news-hero-pulse-dot"></span>
                          <span className="news-hero-badge-title">News & Update</span>
                          <span className="news-hero-badge-divider">•</span>
                          <span className="news-hero-badge-sub">PT Sun Star Prima Motor Margahayu</span>
                        </div>

                        <div className="news-hero-counter-pill">
                          <span className="counter-current">0{activeSlide + 1}</span>
                          <span className="counter-sep">/</span>
                          <span className="counter-total">0{highlightArticles.length}</span>
                        </div>
                      </div>

                      {/* Middle & Bottom: Main Title, Badges, Summary & Actions */}
                      <div className="news-hero-body">
                        <div className="news-hero-tag-row">
                          <span className="news-hero-highlight-pill">
                            <HiOutlineSparkles size={14} />
                            <span>{slide.highlightBadge || 'HIGHLIGHT UTAMA'}</span>
                          </span>
                          <span className="news-hero-category-pill">
                            {slide.category}
                          </span>
                        </div>

                        <h1 className="news-hero-headline">{slide.title}</h1>
                        <p className="news-hero-description">{slide.summary}</p>

                        <div className="news-hero-footer-row">
                          <Link
                            to={`/news/${slide.slug || slide.id}`}
                            className="btn-news-hero-read"
                          >
                            <span>Baca Berita Lengkap</span>
                            <HiOutlineArrowRight size={17} className="hero-arrow-icon" />
                          </Link>

                          <div className="news-hero-meta-items">
                            <span className="news-hero-meta">
                              <HiOutlineCalendar size={15} />
                              <span>{slide.date}</span>
                            </span>
                            <span className="news-hero-meta-dot">•</span>
                            <span className="news-hero-meta">
                              <HiOutlineClock size={15} />
                              <span>{slide.readTime}</span>
                            </span>
                            {slide.author && (
                              <>
                                <span className="news-hero-meta-dot">•</span>
                                <span className="news-hero-meta news-hero-author">
                                  Oleh: {slide.author}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Carousel Controls: Indicator Dots & Navigation Arrows */}
          <div className="news-hero-controls-container">
            <div className="news-hero-controls">
              <div className="news-hero-dots" role="tablist" aria-label="Pilih slide highlight">
                {highlightArticles.map((item, dotIndex) => (
                  <button
                    key={dotIndex}
                    type="button"
                    className={`news-hero-dot ${dotIndex === activeSlide ? 'active' : ''}`}
                    aria-label={`Slide ${dotIndex + 1}: ${item.title}`}
                    aria-selected={dotIndex === activeSlide}
                    onClick={() => setActiveSlide(dotIndex)}
                  />
                ))}
              </div>

              <div className="news-hero-arrows">
                <button
                  type="button"
                  className="btn-news-hero-arrow"
                  aria-label="Slide highlight sebelumnya"
                  onClick={handlePrevSlide}
                >
                  <HiOutlineChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="btn-news-hero-arrow"
                  aria-label="Slide highlight selanjutnya"
                  onClick={handleNextSlide}
                >
                  <HiOutlineChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section
          style={{
            background: 'linear-gradient(135deg, #090d16 0%, #161e2e 100%)',
            color: '#fff',
            padding: '5rem 1.5rem 3.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="news-hero-branding" style={{ marginBottom: '1.25rem' }}>
              <span className="news-hero-pulse-dot"></span>
              <span className="news-hero-badge-title">News & Update</span>
              <span className="news-hero-badge-divider">•</span>
              <span className="news-hero-badge-sub">PT Sun Star Prima Motor Margahayu</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.75rem', color: '#fff', letterSpacing: '-0.02em' }}>
              Berita & Informasi Resmi
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
              Pusat rilis varian terbaru, transparansi transaksi, serta edukasi resmi dari Mitsubishi Sun Margahayu.
            </p>
          </div>
        </section>
      )}

      <div className="news-page-container">
        {/* ==================================================================
            SEARCH AND CATEGORY FILTER SECTION
            ================================================================== */}
        <section
          className="news-filter-search-section"
          aria-label="Pencarian dan Filter Kategori Berita"
        >
          <div className="news-filter-top-bar">
            {/* Search Input Box */}
            <div className="news-search-box-wrap">
              <HiOutlineMagnifyingGlass size={20} className="news-search-icon" />
              <input
                type="text"
                className="news-search-input"
                placeholder="Cari berita, rilis unit, promo, atau topik servis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari artikel berita"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="news-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                >
                  <HiOutlineXMark size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="news-category-pills" role="tablist" aria-label="Filter kategori">
              {NEWS_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category
                const count = categoryCounts[category] || 0
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`news-cat-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    <span className="news-cat-count-badge">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Results Status Bar */}
          <div className="news-results-status-bar">
            <span className="news-results-count">
              Menampilkan <strong>{filteredArticles.length}</strong> dari{' '}
              {publishedArticles.length} artikel
            </span>

            {searchQuery && (
              <span className="news-active-query-chip">
                <span>Kata kunci: "{searchQuery}"</span>
                <button
                  type="button"
                  className="btn-chip-remove"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus filter pencarian"
                >
                  <HiOutlineXMark size={14} />
                </button>
              </span>
            )}
          </div>
        </section>

        {/* ==================================================================
            ARTICLE CARDS GRID (RESPONSIVE MATCHING NewsSection.jsx)
            ================================================================== */}
        {filteredArticles.length > 0 ? (
          <div className="news-articles-grid" role="region" aria-label="Daftar Artikel">
            {filteredArticles.map((article) => {
              const isYellow = article.categoryTheme === 'yellow'
              return (
                <Link
                  key={article.id}
                  to={`/news/${article.slug || article.id}`}
                  className="news-article-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  aria-label={`Baca artikel: ${article.title}`}
                >
                  {/* Thumbnail Wrap */}
                  <div className="news-card-thumbnail-wrap">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="news-card-thumbnail"
                      loading="lazy"
                    />
                    <div className="news-card-overlay"></div>

                    {/* Category Tag on Desktop Thumbnail */}
                    <span
                      className={`news-category-tag ${
                        isYellow ? 'tag-yellow' : 'tag-red'
                      }`}
                    >
                      {article.category}
                    </span>

                    {/* Hover Arrow Icon */}
                    <div className="news-card-hover-icon" aria-hidden="true">
                      <HiOutlineArrowUpRight size={18} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="news-card-body">
                    {/* Meta Row: Date, Read Time & Mobile Category */}
                    <div className="news-meta-row">
                      <span className="news-meta-item">
                        <HiOutlineCalendar size={13} className="news-meta-icon" />
                        <span>{article.date}</span>
                      </span>
                      <span className="news-meta-divider" aria-hidden="true">
                        •
                      </span>
                      <span className="news-meta-item news-desktop-read-time">
                        <HiOutlineClock size={13} className="news-meta-icon" />
                        <span>{article.readTime}</span>
                      </span>
                      <span
                        className={`news-mobile-category-tag ${
                          isYellow ? 'tag-yellow' : 'tag-red'
                        }`}
                      >
                        {article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="news-card-title">{article.title}</h3>

                    {/* Summary */}
                    <p className="news-card-summary">{article.summary}</p>

                    {/* Footer */}
                    <div className="news-card-footer">
                      <span className="news-read-more-text">
                        <span>Lihat Selengkapnya</span>
                        <HiOutlineArrowRight size={15} className="footer-arrow" />
                      </span>
                      <span className="news-mobile-read-time">
                        <HiOutlineClock size={12} className="read-time-icon" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="news-empty-state">
            <div className="news-empty-icon-wrap">
              <HiOutlineDocumentMagnifyingGlass size={32} />
            </div>
            <h3 className="news-empty-title">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak Ada Artikel Ditemukan'
                : 'Belum Ada Artikel'}
            </h3>
            <p className="news-empty-desc">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Kami tidak menemukan artikel yang cocok dengan kata kunci atau kategori yang Anda pilih. Coba gunakan istilah umum atau reset filter Anda.'
                : (isLoading ? 'Sedang memuat data artikel...' : 'Saat ini belum ada artikel yang dipublikasikan atau database sedang tidak terhubung.')}
            </p>
            {(searchQuery || selectedCategory !== 'Semua') && (
              <button
                type="button"
                className="btn-news-reset-filter"
                onClick={handleResetFilters}
              >
                Reset Filter & Tampilkan Semua
              </button>
            )}
          </div>
        )}

        {/* ==================================================================
            BOTTOM CONSULTATION / SUPPORT CARD
            ================================================================== */}
        <section className="news-page-bottom-info">
          <div className="news-bottom-info-text">
            <h4>Butuh Klarifikasi atau Informasi Seputar Layanan Dealer?</h4>
            <p>
              Staf konsultan dan tim customer care kami selalu siap mendampingi verifikasi rekening, promo bulanan, atau jadwal booking servis bengkel.
            </p>
          </div>
          <button
            type="button"
            className="btn-news-ask-sunny"
            onClick={() => window.dispatchEvent(new CustomEvent('open_sunny_chat'))}
          >
            <HiOutlineChatBubbleLeftRight size={18} />
            <span>Sampaikan ke Sunny</span>
          </button>
        </section>
      </div>
    </main>
  )
}
