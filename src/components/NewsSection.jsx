import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineArrowUpRight
} from 'react-icons/hi2'
import { getStoredArticles, fetchArticlesFromBackend } from '../utils/articleStorage'
import { LATEST_HOMEPAGE_ARTICLES } from '../data/newsData'

gsap.registerPlugin(ScrollTrigger)

export default function NewsSection() {
  const sectionRef = useRef(null)
  const cardsGridRef = useRef(null)

  const [articles, setArticles] = useState(() => {
    try {
      const stored = getStoredArticles()
      const pub = stored.filter((a) => (a.status || 'published') === 'published')
      return pub.length > 0 ? pub.slice(0, 3) : LATEST_HOMEPAGE_ARTICLES
    } catch {
      return LATEST_HOMEPAGE_ARTICLES
    }
  })

  useEffect(() => {
    fetchArticlesFromBackend()
    const handleUpdate = () => {
      const stored = getStoredArticles()
      const pub = stored.filter((a) => (a.status || 'published') === 'published')
      if (pub.length > 0) {
        setArticles(pub.slice(0, 3))
      }
    }
    window.addEventListener('sunny_articles_updated', handleUpdate)
    return () => window.removeEventListener('sunny_articles_updated', handleUpdate)
  }, [])

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    if (!sectionRef.current || !cardsGridRef.current) return

    const ctx = gsap.context(() => {
      const cards = cardsGridRef.current.querySelectorAll('.news-article-card')
      gsap.fromTo(
        cards,
        {
          y: 35,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="news-updates-section"
      id="news-updates"
      aria-labelledby="news-main-title"
    >
      <div className="news-section-container">
        {/* HEADER SECTION: TITLES & TOP CTA LINK */}
        <div className="news-section-header">
          <div className="news-header-text">
            <h2 id="news-main-title" className="news-section-title">
              News & Update
            </h2>
            <p className="news-section-desc">
              Informasi terkini seputar rilis varian baru, edukasi transparansi transaksi, serta panduan perawatan berkala resmi dari Mitsubishi Sun Margahayu.
            </p>
          </div>

          <div className="news-header-cta-desktop">
            <Link to="/news" className="btn-news-header-link">
              <span>Lihat lebih banyak</span>
              <HiOutlineArrowRight size={16} className="news-link-arrow" />
            </Link>
          </div>
        </div>

        {/* 3 ARTIKEL TERBARU GRID */}
        <div ref={cardsGridRef} className="news-articles-grid">
          {articles.map((article) => {
            const isYellow = article.categoryTheme === 'yellow'
            return (
              <Link
                key={article.id}
                to={`/news/${article.slug || article.id}`}
                className="news-article-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
                aria-label={`Baca artikel: ${article.title}`}
              >
                {/* Visual Thumbnail */}
                <div className="news-card-thumbnail-wrap">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="news-card-thumbnail"
                    loading="lazy"
                  />
                  <div className="news-card-overlay" aria-hidden="true" />

                  {/* Category Pill Floating Over Image */}
                  <div className={`news-category-tag ${isYellow ? 'tag-yellow' : 'tag-red'}`}>
                    <span>{article.category}</span>
                  </div>

                  {/* Read Action Corner Icon */}
                  <div className="news-card-hover-icon" aria-hidden="true">
                    <HiOutlineArrowUpRight size={17} />
                  </div>
                </div>

                {/* Card Body Content */}
                <div className="news-card-body">
                  <div className="news-meta-row">
                    <span className="news-meta-item">
                      <HiOutlineCalendar size={14} className="news-meta-icon" />
                      <span>{article.date}</span>
                    </span>
                    <span className="news-meta-divider">•</span>
                    <span className="news-meta-item news-desktop-read-time">
                      <HiOutlineClock size={14} className="news-meta-icon" />
                      <span>{article.readTime}</span>
                    </span>
                    <span className={`news-mobile-category-tag ${isYellow ? 'tag-yellow' : 'tag-red'}`}>
                      {article.category}
                    </span>
                  </div>

                  <h3 className="news-card-title">
                    {article.title}
                  </h3>

                  <p className="news-card-summary">
                    {article.summary}
                  </p>

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

        {/* BOTTOM CTA: LIHAT LEBIH BANYAK */}
        <div className="news-bottom-cta-wrap">
          <Link to="/news" className="btn-news-bottom-primary">
            <span>Lihat Lebih Banyak Artikel</span>
            <HiOutlineArrowRight size={18} className="btn-arrow" />
          </Link>
        </div>
      </div>
    </section>
  )
}
