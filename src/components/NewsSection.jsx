import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineArrowUpRight,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineCheckCircle
} from 'react-icons/hi2'

gsap.registerPlugin(ScrollTrigger)

// 3 Artikel Terbaru dengan Beragam Kategori Dealer Resmi
const LATEST_NEWS_ARTICLES = [
  {
    id: 1,
    category: 'Rilis Unit Baru',
    categoryTheme: 'red',
    title: 'Peluncuran New XForce Hybrid 2026: Efisiensi Maksimal Tanpa Kompromi Ketangguhan',
    date: '14 Oktober 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
    summary: 'Mitsubishi Sun Bekasi secara resmi membuka pemesanan New XForce Hybrid 2026 dengan teknologi pintar 4 mode berkendara adaptif dan konsumsi bahan bakar hingga 24,5 km/liter.',
    author: 'Divisi Produk & Komersial',
    fullContent: 'New XForce Hybrid 2026 resmi diperkenalkan sebagai jawaban atas kebutuhan mobilitas perkotaan yang tangguh, hemat bahan bakar, dan sarat fitur keselamatan mutakhir. Dilengkapi mesin hybrid generasi terbaru, sistem audio premium, serta interior mewah yang lapang, unit ini siap memberikan pengalaman berkendara kelas atas bagi keluarga Indonesia. Seluruh pemesanan unit di Mitsubishi Sun Bekasi mendapatkan prioritas alokasi unit, garansi baterai hybrid hingga 8 tahun, dan gratis biaya jasa perawatan berkala hingga 50.000 KM.',
    highlights: [
      'Konsumsi bahan bakar efisien hingga 24,5 km/liter',
      '4 Mode berkendara: Normal, Wet, Gravel, dan Mud',
      'Garansi baterai resmi pabrikan 8 tahun / 160.000 KM'
    ]
  },
  {
    id: 2,
    category: 'Tips & Perawatan',
    categoryTheme: 'yellow',
    title: 'Panduan Servis Berkala 10.000 KM: Komponen Wajib Dicek Agar Garansi Sah',
    date: '09 Oktober 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
    summary: 'Ketahui titik-titik krusial yang wajib diperiksa teknisi bersertifikat mulai dari kampas rem, rotasi ban presisi, hingga verifikasi oli berbarcode resmi pabrik.',
    author: 'Tim Bengkel & Purnajual',
    fullContent: 'Servis berkala pada interval 10.000 KM merupakan tahapan fundamental dalam menjaga keandalan kendaraan Anda. Tim mekanik resmi Mitsubishi Sun Bekasi menerapkan protokol 35 titik inspeksi standar internasional: pembersihan sistem pengereman, rotasi ban, pengecekan komputer diagnosa OBD-II, dan pengisian pelumas asli bergaransi pabrik. Riwayat servis resmi yang tercatat rapi di sistem kami memastikan seluruh hak klaim garansi Anda tetap terlindungi tanpa risiko penolakan.',
    highlights: [
      'Protokol 35 titik inspeksi keselamatan mekanik',
      'Jaminan 100% suku cadang asli berbarcode pabrikan',
      'Riwayat servis otomatis tersimpan di data terpadu dealer'
    ]
  },
  {
    id: 3,
    category: 'Edukasi & Keamanan',
    categoryTheme: 'red',
    title: 'Waspada Penipuan Pembayaran: 4 Standar Rekening Virtual Sah PT Sun Star Prima Motor',
    date: '03 Oktober 2026',
    readTime: '5 mnt baca',
    imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf48c9b8f122.20055577.webp',
    summary: 'Pelajari aturan keamanan transaksi resmi agar terhindar dari modus transfer ke rekening pribadi perorangan. Kenali nama rekening sah atas nama perusahaan.',
    author: 'Divisi Kepatuhan & Anti-Fraud',
    fullContent: 'Komitmen transparansi Mitsubishi Sun Bekasi mewajibkan seluruh pembayaran transaksi unit baru, uang muka (DP), maupun perbaikan servis disalurkan hanya melalui Virtual Account atau Rekening Bank Resmi atas nama PT Sun Star Prima Motor (BCA 3425419999). Staf dan konsultan penjualan kami dilarang keras menerima transfer rekening pribadi maupun pembayaran tunai tanpa kwitansi resmi bercap basah kantor. Verifikasi selalu status staf dan rekening sah sebelum melakukan transaksi.',
    highlights: [
      'Rekening sah hanya atas nama PT Sun Star Prima Motor',
      'Dilarang mentransfer ke rekening pribadi perorangan',
      'Hotline verifikasi 24 jam via WhatsApp resmi dealer'
    ]
  }
]

export default function NewsSection() {
  const [selectedArticle, setSelectedArticle] = useState(null)
  const sectionRef = useRef(null)
  const cardsGridRef = useRef(null)

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

  // Keyboard navigation untuk modal dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null)
      }
    }
    if (selectedArticle) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedArticle])

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
              Informasi terkini seputar rilis varian baru, edukasi transparansi transaksi, serta panduan perawatan berkala resmi dari Mitsubishi Sun Bekasi.
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
          {LATEST_NEWS_ARTICLES.map((article) => {
            const isYellow = article.categoryTheme === 'yellow'
            return (
              <article
                key={article.id}
                className="news-article-card"
                onClick={() => setSelectedArticle(article)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedArticle(article)
                  }
                }}
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
                    <span className="news-meta-item">
                      <HiOutlineClock size={14} className="news-meta-icon" />
                      <span>{article.readTime}</span>
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
                      <span>Baca Selengkapnya</span>
                      <HiOutlineArrowRight size={15} className="footer-arrow" />
                    </span>
                  </div>
                </div>
              </article>
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

      {/* QUICK ARTICLE READER MODAL */}
      {selectedArticle && (
        <div
          className="news-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-article-title"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="news-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="news-modal-top-bar">
              <div className="news-modal-tags">
                <span className={`news-category-tag ${selectedArticle.categoryTheme === 'yellow' ? 'tag-yellow' : 'tag-red'}`}>
                  {selectedArticle.category}
                </span>
                <span className="news-modal-date">
                  <HiOutlineCalendar size={14} />
                  <span>{selectedArticle.date}</span>
                </span>
              </div>
              <button
                type="button"
                className="news-modal-close-btn"
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup jendela artikel"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="news-modal-body">
              <div className="news-modal-hero-img-wrap">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="news-modal-hero-img"
                />
              </div>

              <h2 id="modal-article-title" className="news-modal-title">
                {selectedArticle.title}
              </h2>

              <div className="news-modal-author-row">
                <span className="news-author-label">Oleh: <strong>{selectedArticle.author}</strong></span>
                <span className="news-meta-divider">•</span>
                <span className="news-read-time">{selectedArticle.readTime}</span>
              </div>

              <div className="news-modal-content-text">
                <p>{selectedArticle.fullContent}</p>

                {selectedArticle.highlights && (
                  <div className="news-modal-highlights">
                    <h4 className="highlights-heading">
                      <HiOutlineSparkles size={16} className="text-yellow-brand" />
                      <span>Poin Utama Informasi:</span>
                    </h4>
                    <ul className="highlights-list">
                      {selectedArticle.highlights.map((point, i) => (
                        <li key={i}>
                          <HiOutlineCheckCircle size={17} className="highlight-check-icon" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="news-modal-footer">
              <button
                type="button"
                className="btn-news-modal-close"
                onClick={() => setSelectedArticle(null)}
              >
                Tutup Baca
              </button>
              <Link
                to="/news"
                className="btn-news-modal-all"
                onClick={() => setSelectedArticle(null)}
              >
                <span>Lihat Semua Berita</span>
                <HiOutlineArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
