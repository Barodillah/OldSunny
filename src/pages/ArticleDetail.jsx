import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineShare,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookmark,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
  HiOutlineDocumentText
} from 'react-icons/hi2'
import { RiWhatsappLine, RiTwitterXLine } from 'react-icons/ri'
import { NEWS_ARTICLES } from '../data/newsData'
import './ArticleDetail.css'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const articleContentRef = useRef(null)

  const [readingProgress, setReadingProgress] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Find article by id or slug
  const article = NEWS_ARTICLES.find(
    (item) => String(item.id) === String(id) || item.slug === id
  )

  // Scroll to top on article change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  // Track Reading Progress as user scrolls through the article container
  useEffect(() => {
    const handleScroll = () => {
      const container = articleContentRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const totalHeight = container.clientHeight
      const windowHeight = window.innerHeight

      // If top of container is below viewport, progress is 0
      if (rect.top > 0) {
        setReadingProgress(0)
        return
      }

      // Calculate how much of container has been scrolled past
      const scrolled = -rect.top
      const maxScrollable = totalHeight - windowHeight + 100

      if (maxScrollable <= 0) {
        setReadingProgress(100)
        return
      }

      const progress = Math.min(100, Math.max(0, Math.round((scrolled / maxScrollable) * 100)))
      setReadingProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [id])

  // Share Handlers
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2400)
  }

  const handleShareWhatsApp = () => {
    if (!article) return
    const text = `Baca informasi menarik dari Dealer Mitsubishi Sun Margahayu: "${article.title}" di ${window.location.href}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareTwitter = () => {
    if (!article) return
    const text = `${article.title} - Mitsubishi Sun Star Prima Motor Margahayu`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        window.location.href
      )}`,
      '_blank'
    )
  }

  // Related Articles (excluding current article)
  const relatedArticles = NEWS_ARTICLES.filter(
    (item) => item.id !== (article?.id || 0)
  ).slice(0, 3)

  // If article not found
  if (!article) {
    return (
      <main className="article-not-found-page">
        <div className="article-not-found-card">
          <HiOutlineDocumentText size={48} className="not-found-icon" />
          <h1>Artikel Tidak Ditemukan</h1>
          <p>
            Maaf, artikel yang Anda cari tidak tersedia atau tautan telah diperbarui. Silakan kembali ke pusat berita untuk melihat update resmi lainnya.
          </p>
          <Link to="/news" className="btn-article-back-hub">
            <HiOutlineArrowLeft size={16} />
            <span>Kembali ke News & Update</span>
          </Link>
        </div>
      </main>
    )
  }

  const isYellow = article.categoryTheme === 'yellow'

  return (
    <article className="article-page-wrapper" ref={articleContentRef}>
      {/* ==================================================================
          READING PROGRESS BAR (STICKY AT TOP OF PAGE)
          ================================================================== */}
      <div
        className="reading-progress-track"
        aria-hidden="true"
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="reading-progress-fill"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Reading Progress Pill for Mobile & Tablet */}
      <div className={`floating-reading-pill ${readingProgress > 5 ? 'visible' : ''}`}>
        <span className="reading-pill-icon">📖</span>
        <span className="reading-pill-text">
          {readingProgress === 100 ? 'Selesai Dibaca' : `${readingProgress}% Selesai`}
        </span>
      </div>

      <div className="article-page-container">
        {/* ==================================================================
            TOP NAVIGATION & BREADCRUMBS
            ================================================================== */}
        <nav className="article-nav-top" aria-label="Navigasi Artikel">
          <button
            type="button"
            className="btn-article-back-nav"
            onClick={() => navigate('/news')}
            aria-label="Kembali ke daftar berita"
          >
            <HiOutlineArrowLeft size={16} />
            <span>Semua Berita</span>
          </button>

          <div className="article-breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Beranda
            </Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/news" className="breadcrumb-link">
              News & Update
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{article.category}</span>
          </div>
        </nav>

        {/* ==================================================================
            ARTICLE EDITORIAL HEADER (FULL-SCREEN SPREAD)
            ================================================================== */}
        <header className="article-main-header">
          <div className="article-category-badge-wrap">
            <span className={`article-cat-tag ${isYellow ? 'tag-yellow' : 'tag-red'}`}>
              {article.category}
            </span>
            {article.highlightBadge && (
              <span className="article-highlight-pill">
                <HiOutlineSparkles size={13} />
                <span>{article.highlightBadge}</span>
              </span>
            )}
          </div>

          <h1 className="article-headline-title">{article.title}</h1>

          {/* Lead Paragraph Summary */}
          <p className="article-lead-text">{article.summary}</p>

          {/* Metadata & Author Bar */}
          <div className="article-meta-author-bar">
            <div className="article-author-info">
              <div className="author-avatar-badge">
                <span>MS</span>
              </div>
              <div className="author-details">
                <span className="author-name">{article.author || 'Tim Redaksi Mitsubishi Sun'}</span>
                <span className="author-role">{article.authorRole || 'Dealer Resmi Sun Star Prima Motor Margahayu'}</span>
              </div>
            </div>

            <div className="article-meta-details">
              <div className="meta-time-group">
                <span className="meta-item">
                  <HiOutlineCalendar size={15} className="meta-icon" />
                  <span>{article.date}</span>
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-item">
                  <HiOutlineClock size={15} className="meta-icon" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              {/* Action Utilities: Share & Bookmark */}
              <div className="article-action-buttons">
                <button
                  type="button"
                  className={`btn-action-util ${isCopied ? 'copied' : ''}`}
                  onClick={handleCopyLink}
                  title="Salin Tautan Artikel"
                  aria-label="Salin tautan artikel"
                >
                  {isCopied ? (
                    <>
                      <HiOutlineClipboardDocumentCheck size={16} />
                      <span className="action-label">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineShare size={16} />
                      <span className="action-label">Bagikan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-action-util btn-share-wa"
                  onClick={handleShareWhatsApp}
                  title="Bagikan via WhatsApp"
                  aria-label="Bagikan via WhatsApp"
                >
                  <RiWhatsappLine size={16} />
                </button>

                <button
                  type="button"
                  className="btn-action-util btn-share-tw"
                  onClick={handleShareTwitter}
                  title="Bagikan via X / Twitter"
                  aria-label="Bagikan via Twitter"
                >
                  <RiTwitterXLine size={15} />
                </button>

                <button
                  type="button"
                  className={`btn-action-util ${isBookmarked ? 'active' : ''}`}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  title={isBookmarked ? 'Disimpan' : 'Simpan Bacaan'}
                  aria-label="Simpan artikel"
                >
                  <HiOutlineBookmark size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================================
            FEATURED CINEMATIC HERO IMAGE (WIDE SPREAD)
            ================================================================== */}
        <figure className="article-hero-figure">
          <div className="article-hero-img-wrap">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="article-hero-img"
              loading="eager"
            />
          </div>
          <figcaption className="article-hero-caption">
            Dokumentasi resmi layanan & unit di dealer PT Sun Star Prima Motor Margahayu. Seluruh materi hak cipta dilindungi.
          </figcaption>
        </figure>

        {/* ==================================================================
            MAIN CONTENT AREA: 2-COLUMN LAYOUT ON DESKTOP
            ================================================================== */}
        <div className="article-main-layout">
          {/* Main Content Column */}
          <div className="article-content-column">
            {/* Key Takeaways / Highlights Callout Box */}
            {article.highlights && article.highlights.length > 0 && (
              <aside className="article-highlights-box" aria-label="Poin Kunci Informasi">
                <div className="highlights-box-header">
                  <div className="highlights-icon-wrap">
                    <HiOutlineSparkles size={18} />
                  </div>
                  <div>
                    <h3 className="highlights-title">Poin Utama Informasi</h3>
                    <span className="highlights-sub">Ringkasan cepat yang perlu Anda ketahui:</span>
                  </div>
                </div>

                <ul className="highlights-key-list">
                  {article.highlights.map((point, index) => (
                    <li key={index} className="highlights-key-item">
                      <HiOutlineCheckCircle size={18} className="highlight-check" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Editorial Article Prose Body */}
            <section className="article-prose-body">
              {article.paragraphs && article.paragraphs.length > 0 ? (
                article.paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="article-body-p">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="article-body-p">
                  {article.fullContent || article.summary}
                </p>
              )}

              {/* Expert Quote Callout */}
              {article.expertQuote && (
                <blockquote className="article-quote-block">
                  <p className="quote-text">"{article.expertQuote}"</p>
                  <cite className="quote-author">
                    — {article.author}, {article.authorRole}
                  </cite>
                </blockquote>
              )}

              {/* Pro-Tip Box */}
              <div className="article-protip-box">
                <div className="protip-icon-badge">
                  <HiOutlineLightBulb size={20} />
                </div>
                <div className="protip-content">
                  <h4>Tips dari Staf Dealer Mitsubishi Sun:</h4>
                  <p>
                    Simpan nomor kontak resmi customer care dan verifikasi seluruh transaksi hanya melalui rekening Virtual Account perusahaan untuk perlindungan maksimal.
                  </p>
                </div>
              </div>
            </section>

            {/* Author Credential & Trust Banner */}
            <section className="article-author-credential-card">
              <div className="author-card-avatar">
                <span>SUN</span>
              </div>
              <div className="author-card-content">
                <div className="author-card-header">
                  <h4>{article.author}</h4>
                  <span className="author-verified-tag">
                    <HiOutlineShieldCheck size={14} />
                    <span>Terverifikasi Resmi Dealer</span>
                  </span>
                </div>
                <p className="author-card-desc">
                  Artikel ini disusun dan diverifikasi langsung oleh divisi operasional PT Sun Star Prima Motor Margahayu untuk memastikan keterbukaan informasi dan kepuasan pemilik kendaraan Mitsubishi.
                </p>
              </div>
            </section>

            {/* Consultation / Contact Banner */}
            <section className="article-cta-box">
              <div className="cta-box-text">
                <h3>Ingin Konsultasi Lebih Lanjut Seputar Informasi Ini?</h3>
                <p>
                  Konsultan penjualan dan teknisi bengkel kami siap menjawab pertanyaan Anda mengenai pemesanan unit, estimasi biaya servis, atau verifikasi promo.
                </p>
              </div>
              <Link to="/contact" className="btn-article-cta-contact">
                <HiOutlineChatBubbleLeftRight size={18} />
                <span>Hubungi Customer Care</span>
              </Link>
            </section>
          </div>

          {/* Sticky Sidebar on Desktop */}
          <aside className="article-sidebar-column" aria-label="Informasi dan Navigasi Cepat">
            <div className="article-sticky-sidebar">
              {/* Reading Progress Card */}
              <div className="sidebar-widget-card sidebar-progress-card">
                <div className="sidebar-widget-header">
                  <span className="sidebar-widget-icon">📖</span>
                  <span className="sidebar-widget-title">Progres Baca</span>
                  <span className="sidebar-progress-badge">{readingProgress}%</span>
                </div>
                <div className="sidebar-progress-bar-bg">
                  <div
                    className="sidebar-progress-bar-fill"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
                <span className="sidebar-progress-hint">
                  {readingProgress >= 100
                    ? 'Anda telah menyelesaikan artikel ini'
                    : `Estimasi waktu baca: ${article.readTime}`}
                </span>
              </div>

              {/* Quick Actions Card */}
              <div className="sidebar-widget-card">
                <h4 className="sidebar-widget-heading">Bagikan Artikel</h4>
                <div className="sidebar-share-buttons">
                  <button
                    type="button"
                    className={`btn-sidebar-share ${isCopied ? 'copied' : ''}`}
                    onClick={handleCopyLink}
                  >
                    <HiOutlineClipboardDocumentCheck size={16} />
                    <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Tautan'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-sidebar-share btn-sidebar-wa"
                    onClick={handleShareWhatsApp}
                  >
                    <RiWhatsappLine size={16} />
                    <span>Bagikan WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className="btn-sidebar-share btn-sidebar-tw"
                    onClick={handleShareTwitter}
                  >
                    <RiTwitterXLine size={15} />
                    <span>Bagikan X / Twitter</span>
                  </button>
                </div>
              </div>

              {/* Quick Dealer Contact Card */}
              <div className="sidebar-widget-card sidebar-dealer-card">
                <span className="sidebar-dealer-tag">LAYANAN DEALER RESMI</span>
                <h4 className="sidebar-dealer-title">Butuh Jadwal Servis atau Test Drive?</h4>
                <p className="sidebar-dealer-desc">
                  Konsultan sales dan service advisor kami siap melayani Anda secara responsif.
                </p>
                <Link to="/contact" className="btn-sidebar-dealer-action">
                  <HiOutlineChatBubbleLeftRight size={16} />
                  <span>Hubungi Tim Dealer</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* ==================================================================
            RELATED ARTICLES (BACA ARTIKEL LAINNYA - FULL WIDTH)
            ================================================================== */}
        <section className="article-related-section" aria-label="Artikel Terkait">
          <div className="related-section-header">
            <div>
              <span className="related-badge">REKOMENDASI BACAAN</span>
              <h2 className="related-title">Artikel Terkait Lainnya</h2>
            </div>
            <Link to="/news" className="btn-see-all-news">
              <span>Lihat Semua Berita</span>
              <HiOutlineArrowRight size={15} />
            </Link>
          </div>

          <div className="news-articles-grid">
            {relatedArticles.map((rel) => {
              const relIsYellow = rel.categoryTheme === 'yellow'
              return (
                <Link
                  key={rel.id}
                  to={`/news/${rel.id}`}
                  className="news-article-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="news-card-thumbnail-wrap">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="news-card-thumbnail"
                      loading="lazy"
                    />
                    <div className="news-card-overlay"></div>
                    <span
                      className={`news-category-tag ${
                        relIsYellow ? 'tag-yellow' : 'tag-red'
                      }`}
                    >
                      {rel.category}
                    </span>
                  </div>

                  <div className="news-card-body">
                    <div className="news-meta-row">
                      <span className="news-meta-item">
                        <HiOutlineCalendar size={13} className="news-meta-icon" />
                        <span>{rel.date}</span>
                      </span>
                      <span className="news-meta-divider">•</span>
                      <span className="news-meta-item news-desktop-read-time">
                        <HiOutlineClock size={13} className="news-meta-icon" />
                        <span>{rel.readTime}</span>
                      </span>
                    </div>

                    <h3 className="news-card-title">{rel.title}</h3>
                    <p className="news-card-summary">{rel.summary}</p>

                    <div className="news-card-footer">
                      <span className="news-read-more-text">
                        <span>Baca Artikel</span>
                        <HiOutlineArrowRight size={15} className="footer-arrow" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </article>
  )
}
