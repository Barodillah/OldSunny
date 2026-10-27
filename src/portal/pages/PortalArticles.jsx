import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineDocumentPlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineStar,
  HiStar,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineCheck,
  HiOutlineComputerDesktop,
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineUser
} from 'react-icons/hi2'
import {
  getStoredArticles,
  deleteArticle,
  toggleArticleStatus,
  toggleArticleHighlight,
  fetchArticlesFromBackend,
  fetchAllCommentsForPortal,
  approveArticleComment,
  rejectArticleComment,
  deleteArticleComment,
  fetchArticleViewAnalytics
} from '../../utils/articleStorage'
import { NEWS_CATEGORIES } from '../../data/newsData'
import './PortalArticles.css'

export default function PortalArticles() {
  // Navigation tab: 'articles' | 'comments'
  const [activeTab, setActiveTab] = useState('articles')

  // Articles state
  const [articles, setArticles] = useState([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [highlightFilter, setHighlightFilter] = useState('Semua')

  // Comments Moderation state
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentStatusFilter, setCommentStatusFilter] = useState('all')
  const [commentArticleFilter, setCommentArticleFilter] = useState('all')
  const [commentSearchQuery, setCommentSearchQuery] = useState('')

  // View Analytics Modal state
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [selectedArticleForAnalytics, setSelectedArticleForAnalytics] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Delete Article modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [targetArticle, setTargetArticle] = useState(null)

  // Delete Comment modal state
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false)
  const [targetComment, setTargetComment] = useState(null)

  // Feedback toast
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3600)
  }

  // Load articles from backend
  const loadArticles = useCallback(async () => {
    setArticlesLoading(true)
    const remote = await fetchArticlesFromBackend('portal')
    if (Array.isArray(remote)) {
      setArticles(remote)
    } else {
      setArticles([])
    }
    setArticlesLoading(false)
  }, [])

  // Load comments for moderation
  const loadComments = useCallback(async (status = 'all', showSpinner = true) => {
    if (showSpinner) setCommentsLoading(true)
    try {
      const list = await fetchAllCommentsForPortal(status)
      setComments(list || [])
    } catch (err) {
      console.warn('Error loading comments:', err)
    } finally {
      if (showSpinner) setCommentsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
    loadComments('all', false)

    const handleUpdate = () => {
      loadArticles()
    }
    window.addEventListener('sunny_articles_updated', handleUpdate)
    return () => window.removeEventListener('sunny_articles_updated', handleUpdate)
  }, [loadArticles, loadComments])

  // Count of pending comments for badge indicator
  const pendingCommentsCount = useMemo(() => {
    return comments.filter((c) => c.status === 'pending').length
  }, [comments])

  // Articles KPI Stats
  const articleStats = useMemo(() => {
    const total = articles.length
    const published = articles.filter((a) => (a.status || 'published') === 'published').length
    const draft = articles.filter((a) => a.status === 'draft').length
    const highlights = articles.filter((a) => a.isHighlight).length
    const totalViews = articles.reduce((acc, curr) => acc + (Number(curr.viewsCount) || 0), 0)
    const totalLikes = articles.reduce((acc, curr) => acc + (Number(curr.likesCount) || 0), 0)
    const totalComments = articles.reduce((acc, curr) => acc + (Number(curr.commentsCount) || 0), 0)
    return { total, published, draft, highlights, totalViews, totalLikes, totalComments }
  }, [articles])

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))

      const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter
      const itemStatus = item.status || 'published'
      const matchesStatus = statusFilter === 'Semua' || itemStatus === statusFilter
      const matchesHighlight =
        highlightFilter === 'Semua' ||
        (highlightFilter === 'highlight' && item.isHighlight) ||
        (highlightFilter === 'normal' && !item.isHighlight)

      return matchesSearch && matchesCategory && matchesStatus && matchesHighlight
    })
  }, [articles, searchQuery, categoryFilter, statusFilter, highlightFilter])

  // Filtered Comments
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      const matchesStatus = commentStatusFilter === 'all' || c.status === commentStatusFilter
      const matchesArticle =
        commentArticleFilter === 'all' ||
        String(c.article_id) === String(commentArticleFilter)

      const q = commentSearchQuery.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.comment && c.comment.toLowerCase().includes(q)) ||
        (c.article?.title && c.article.title.toLowerCase().includes(q)) ||
        (c.ip_address && c.ip_address.toLowerCase().includes(q))

      return matchesStatus && matchesArticle && matchesSearch
    })
  }, [comments, commentStatusFilter, commentArticleFilter, commentSearchQuery])

  // Quick Toggle Status (Published <-> Draft)
  const handleToggleStatus = async (id) => {
    const updated = await toggleArticleStatus(id)
    if (updated) {
      showFeedback('success', `Status artikel diubah menjadi: ${(updated.status || 'published').toUpperCase()}`)
      loadArticles()
    }
  }

  // Quick Toggle Highlight
  const handleToggleHighlight = async (id) => {
    const updated = await toggleArticleHighlight(id)
    if (updated) {
      showFeedback('success', updated.isHighlight ? 'Ditambahkan ke Sorotan Highlight Hero!' : 'Dihapus dari Sorotan Highlight.')
      loadArticles()
    }
  }

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (article) => {
    setTargetArticle(article)
    setIsDeleteModalOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetArticle) return
    const success = await deleteArticle(targetArticle.id)
    setIsDeleteModalOpen(false)
    setTargetArticle(null)
    if (success) {
      showFeedback('success', 'Artikel berhasil dihapus dari database.')
      loadArticles()
    } else {
      showFeedback('error', 'Gagal menghapus artikel.')
    }
  }


  // Open Analytics Modal
  const handleOpenAnalytics = async (article) => {
    setSelectedArticleForAnalytics(article)
    setIsAnalyticsModalOpen(true)
    setAnalyticsLoading(true)
    setAnalyticsData(null)

    const res = await fetchArticleViewAnalytics(article.id)
    if (res && res.success) {
      setAnalyticsData(res)
    } else {
      showFeedback('error', 'Gagal memuat telemetri pengunjung.')
    }
    setAnalyticsLoading(false)
  }

  // Refresh Analytics
  const handleRefreshAnalytics = async () => {
    if (!selectedArticleForAnalytics) return
    setAnalyticsLoading(true)
    const res = await fetchArticleViewAnalytics(selectedArticleForAnalytics.id)
    if (res && res.success) {
      setAnalyticsData(res)
    }
    setAnalyticsLoading(false)
  }

  // Comment Moderation Actions
  const handleApproveComment = async (commentId) => {
    const success = await approveArticleComment(commentId)
    if (success) {
      showFeedback('success', 'Komentar berhasil disetujui (Approved) & tayang ke publik.')
      loadComments(commentStatusFilter)
      loadArticles()
    } else {
      showFeedback('error', 'Gagal menyetujui komentar.')
    }
  }

  const handleRejectComment = async (commentId) => {
    const success = await rejectArticleComment(commentId)
    if (success) {
      showFeedback('info', 'Komentar ditandai Ditolak (Rejected).')
      loadComments(commentStatusFilter)
      loadArticles()
    } else {
      showFeedback('error', 'Gagal menolak komentar.')
    }
  }

  // Open Delete Comment Confirm Modal
  const handleOpenDeleteCommentConfirm = (comment) => {
    setTargetComment(comment)
    setIsDeleteCommentModalOpen(true)
  }

  // Confirm Delete Comment
  const handleConfirmDeleteComment = async () => {
    if (!targetComment) return
    const commentId = targetComment.id
    const success = await deleteArticleComment(commentId)
    setIsDeleteCommentModalOpen(false)
    setTargetComment(null)
    if (success) {
      showFeedback('success', 'Komentar berhasil dihapus permanen.')
      loadComments(commentStatusFilter, false)
      loadArticles()
    } else {
      showFeedback('error', 'Gagal menghapus komentar.')
    }
  }

  // Format Helper for Timestamps
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="portal-articles-page">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`portal-feedback-toast ${feedback.type}`}>
          {feedback.type === 'success' && <HiOutlineCheckCircle size={19} />}
          {feedback.type === 'error' && <HiOutlineExclamationTriangle size={19} />}
          {feedback.type === 'info' && <HiOutlineArrowPath size={19} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Header Row */}
      <header className="portal-articles-header">
        <div className="header-info-box">
          <h1 className="portal-articles-title">Manajemen Artikel, Berita & Interaksi</h1>
          <p className="portal-articles-subtitle">
            Kelola rilis berita, pantau detail pengunjung (IP, browser, lokasi), like pembaca, dan moderasi komentar publik.
          </p>
        </div>

        <div className="header-actions-box">
          <button
            type="button"
            className="btn-portal-secondary"
            onClick={loadArticles}
            disabled={articlesLoading}
            title="Refresh data artikel dan interaksi dari server"
          >
            <HiOutlineArrowPath size={16} className={articlesLoading ? 'spin-icon' : ''} />
            <span>{articlesLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>
          <Link
            to="/portal/articles/create"
            className="btn-portal-primary"
          >
            <HiOutlineDocumentPlus size={18} />
            <span>+ Tulis Artikel Baru</span>
          </Link>
        </div>
      </header>

      {/* Navigation Tabs (Articles vs Comments Moderation) */}
      <div className="portal-articles-tab-nav">
        <button
          type="button"
          className={`portal-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          <span>Daftar Artikel & Berita</span>
          <span className="tab-counter-badge">{articles.length}</span>
        </button>

        <button
          type="button"
          className={`portal-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('comments')
            loadComments(commentStatusFilter, comments.length === 0)
          }}
        >
          <div className="tab-btn-inner">
            <HiOutlineChatBubbleLeftRight size={17} />
            <span>Interaksi Komentar</span>
          </div>
          {pendingCommentsCount > 0 ? (
            <span className="tab-counter-badge badge-warning" title={`${pendingCommentsCount} komentar menunggu moderasi`}>
              {pendingCommentsCount} Baru
            </span>
          ) : (
            <span className="tab-counter-badge">{comments.length}</span>
          )}
        </button>
      </div>

      {/* ====================================================================
          TAB 1: DAFTAR ARTIKEL & STATISTIK
          ==================================================================== */}
      {activeTab === 'articles' && (
        <>
          {/* Bento Stats Metric Strip */}
          <div className="articles-metrics-grid">
            <div className="metric-card">
              <span className="metric-label">TOTAL ARTIKEL</span>
              <div className="metric-value-row">
                <span className="metric-number">{articleStats.total}</span>
                <span className="metric-pill pill-slate">Semua Postingan</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-label">STATUS TERBIT (PUBLISHED)</span>
              <div className="metric-value-row">
                <span className="metric-number text-emerald">{articleStats.published}</span>
                <span className="metric-pill pill-emerald">Tampil di Publik</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-label">STATUS DRAF</span>
              <div className="metric-value-row">
                <span className="metric-number text-amber">{articleStats.draft}</span>
                <span className="metric-pill pill-amber">Belum Tayang</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-label">INTERAKSI PEMBACA</span>
              <div className="metric-value-row">
                <span className="metric-number text-red">{articleStats.totalViews}</span>
                <span className="metric-pill pill-red metric-pill-cluster">
                  <span className="pill-sub-item" title="Total Tayang (Views)">
                    <HiOutlineEye size={13} />
                    <span>{articleStats.totalViews}</span>
                  </span>
                  <span className="pill-dot">•</span>
                  <span className="pill-sub-item" title="Total Suka (Likes)">
                    <HiOutlineHeart size={13} />
                    <span>{articleStats.totalLikes}</span>
                  </span>
                  <span className="pill-dot">•</span>
                  <span className="pill-sub-item" title="Total Komentar">
                    <HiOutlineChatBubbleLeftRight size={13} />
                    <span>{articleStats.totalComments}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar Card */}
          <div className="articles-filter-card">
            <div className="filter-search-box">
              <HiOutlineMagnifyingGlass size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Cari judul artikel, penulis, atau kata kunci tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  aria-label="Bersihkan pencarian"
                >
                  <HiOutlineXMark size={16} />
                </button>
              )}
            </div>

            <div className="filter-select-group">
              {/* Category Filter */}
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter berdasarkan kategori"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Semua' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter berdasarkan status"
              >
                <option value="Semua">Semua Status</option>
                <option value="published">Hanya Published</option>
                <option value="draft">Hanya Draft</option>
              </select>

              {/* Highlight Filter */}
              <select
                className="filter-select"
                value={highlightFilter}
                onChange={(e) => setHighlightFilter(e.target.value)}
                aria-label="Filter sorotan highlight"
              >
                <option value="Semua">Semua Sorotan</option>
                <option value="highlight">⭐ Highlight Hero Saja</option>
                <option value="normal">Non-Highlight</option>
              </select>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="articles-table-card">
            {filteredArticles.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-icon-wrap">
                  <HiOutlineMagnifyingGlass size={32} />
                </div>
                <h3>Tidak Ada Artikel yang Cocok</h3>
                <p>Cobalah mengganti kata kunci pencarian atau reset filter kategori di atas.</p>
                <button
                  type="button"
                  className="btn-portal-secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('Semua')
                    setStatusFilter('Semua')
                    setHighlightFilter('Semua')
                  }}
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="table-scroll-container">
                <table className="portal-articles-table">
                  <thead>
                    <tr>
                      <th style={{ width: '65px' }}>Banner</th>
                      <th>Judul & Ringkasan</th>
                      <th style={{ width: '135px' }}>Kategori</th>
                      <th style={{ width: '130px' }}>Penulis</th>
                      <th style={{ width: '110px' }}>Tanggal</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '90px' }}>Highlight</th>
                      <th style={{ width: '190px' }}>Statistik & Pengunjung</th>
                      <th style={{ width: '135px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((item) => {
                      const isPub = (item.status || 'published') === 'published'

                      return (
                        <tr key={item.id} className={!isPub ? 'is-row-draft' : ''}>
                          {/* Thumbnail Image */}
                          <td>
                            <div className="table-thumb-wrap">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="table-thumb-img"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a0771891e7.52336063.webp'
                                }}
                              />
                            </div>
                          </td>

                          {/* Title & Slug */}
                          <td>
                            <div className="table-title-box">
                              <div className="title-row">
                                <span className="article-table-title" title={item.title}>
                                  {item.title}
                                </span>
                              </div>
                              {item.summary && (
                                <p className="article-table-summary">
                                  {item.summary}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span className={`table-cat-badge ${item.categoryTheme === 'yellow' ? 'badge-yellow' : 'badge-red'}`}>
                              {item.category}
                            </span>
                          </td>

                          {/* Author */}
                          <td>
                            <div className="table-author-box">
                              <span className="author-name">{item.author || 'Tim Redaksi'}</span>
                            </div>
                          </td>

                          {/* Date & ReadTime */}
                          <td>
                            <div className="table-date-box">
                              <span className="date-text">{item.date}</span>
                              <span className="readtime-text">{item.readTime || '3 mnt'}</span>
                            </div>
                          </td>

                          {/* Status Toggle Pill */}
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-pill ${isPub ? 'status-published' : 'status-draft'}`}
                              onClick={() => handleToggleStatus(item.id)}
                              title={`Klik untuk ubah ke ${isPub ? 'Draft' : 'Published'}`}
                            >
                              <span className="status-dot" />
                              <span>{isPub ? 'Published' : 'Draft'}</span>
                            </button>
                          </td>

                          {/* Highlight Toggle Button */}
                          <td>
                            <button
                              type="button"
                              className={`highlight-toggle-btn ${item.isHighlight ? 'active' : ''}`}
                              onClick={() => handleToggleHighlight(item.id)}
                              title={item.isHighlight ? 'Aktif di Carousel Hero (Klik untuk matikan)' : 'Jadikan Highlight Hero'}
                            >
                              {item.isHighlight ? (
                                <>
                                  <HiStar size={15} className="star-icon fill-gold" />
                                  <span>Hero</span>
                                </>
                              ) : (
                                <>
                                  <HiOutlineStar size={15} className="star-icon" />
                                  <span>Off</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Statistics & Visitor Telemetry */}
                          <td>
                            <div className="table-stats-cluster">
                              <button
                                type="button"
                                className="stat-pill stat-views"
                                onClick={() => handleOpenAnalytics(item)}
                                title="Klik untuk melihat Detail Pengunjung (IP, Browser, Device, Lokasi)"
                              >
                                <HiOutlineEye size={13} />
                                <span>{item.viewsCount || 0}</span>
                              </button>

                              <span className="stat-pill stat-likes" title="Jumlah Disukai Pembaca">
                                <HiOutlineHeart size={13} />
                                <span>{item.likesCount || 0}</span>
                              </span>

                              <button
                                type="button"
                                className="stat-pill stat-comments"
                                onClick={() => {
                                  setActiveTab('comments')
                                  setCommentArticleFilter(String(item.id))
                                }}
                                title="Lihat dan moderasi komentar artikel ini"
                              >
                                <HiOutlineChatBubbleLeftRight size={13} />
                                <span>{item.commentsCount || 0}</span>
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="btn-action-icon analytics"
                                onClick={() => handleOpenAnalytics(item)}
                                title="Buka Detail Pengunjung (IP, Device, Lokasi)"
                              >
                                <HiOutlineChartBar size={16} />
                              </button>
                              <Link
                                to={`/news/${item.slug || item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-action-icon view"
                                title="Buka halaman publik artikel ini"
                              >
                                <HiOutlineEye size={16} />
                              </Link>
                              <Link
                                to={`/portal/articles/edit/${item.id}`}
                                className="btn-action-icon edit"
                                title="Edit isi artikel"
                              >
                                <HiOutlinePencilSquare size={16} />
                              </Link>
                              <button
                                type="button"
                                className="btn-action-icon delete"
                                onClick={() => handleOpenDeleteConfirm(item)}
                                title="Hapus artikel"
                              >
                                <HiOutlineTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================================================================
          TAB 2: MODERASI KOMENTAR PUBLIK
          ==================================================================== */}
      {activeTab === 'comments' && (
        <div className="portal-comments-management">
          {/* Filter Bar for Comments */}
          <div className="articles-filter-card">
            <div className="filter-search-box">
              <HiOutlineMagnifyingGlass size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Cari komentar berdasarkan nama, isi komentar, judul artikel, atau IP..."
                value={commentSearchQuery}
                onChange={(e) => setCommentSearchQuery(e.target.value)}
              />
              {commentSearchQuery && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => setCommentSearchQuery('')}
                  aria-label="Bersihkan pencarian"
                >
                  <HiOutlineXMark size={16} />
                </button>
              )}
            </div>

            <div className="filter-select-group">
              {/* Status Filter */}
              <select
                className="filter-select"
                value={commentStatusFilter}
                onChange={(e) => {
                  setCommentStatusFilter(e.target.value)
                  loadComments(e.target.value)
                }}
                aria-label="Filter status komentar"
              >
                <option value="all">Semua Status Komentar</option>
                <option value="pending">⏳ Menunggu Moderasi ({pendingCommentsCount})</option>
                <option value="approved">✅ Disetujui (Approved)</option>
                <option value="rejected">❌ Ditolak (Rejected)</option>
              </select>

              {/* Article Filter */}
              <select
                className="filter-select"
                value={commentArticleFilter}
                onChange={(e) => setCommentArticleFilter(e.target.value)}
                aria-label="Filter artikel komentar"
              >
                <option value="all">Semua Artikel</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title.length > 35 ? `${art.title.substring(0, 35)}...` : art.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn-portal-secondary btn-icon-only"
                onClick={() => loadComments(commentStatusFilter)}
                title="Refresh komentar"
              >
                <HiOutlineArrowPath size={16} className={commentsLoading ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>

          {/* Comments Table Card */}
          <div className="articles-table-card">
            {commentsLoading ? (
              <div className="table-empty-state">
                <div className="empty-icon-wrap spin-icon">
                  <HiOutlineArrowPath size={32} />
                </div>
                <h3>Memuat Komentar...</h3>
                <p>Mengambil data komentar terbaru dari server database.</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-icon-wrap">
                  <HiOutlineChatBubbleLeftRight size={32} />
                </div>
                <h3>Tidak Ada Komentar Ditemukan</h3>
                <p>Belum ada komentar dengan kriteria filter yang dipilih.</p>
                <button
                  type="button"
                  className="btn-portal-secondary"
                  onClick={() => {
                    setCommentSearchQuery('')
                    setCommentStatusFilter('all')
                    setCommentArticleFilter('all')
                    loadComments('all')
                  }}
                >
                  Reset Filter Komentar
                </button>
              </div>
            ) : (
              <div className="table-scroll-container">
                <table className="portal-articles-table comments-table">
                  <thead>
                    <tr>
                      <th style={{ width: '220px' }}>Artikel Terkait</th>
                      <th style={{ width: '200px' }}>Pengirim & Identitas</th>
                      <th>Isi Komentar</th>
                      <th style={{ width: '130px' }}>Status</th>
                      <th style={{ width: '140px' }}>Waktu Kirim</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.map((commentItem) => {
                      const isPending = commentItem.status === 'pending'
                      const isApproved = commentItem.status === 'approved'
                      const isRejected = commentItem.status === 'rejected'

                      return (
                        <tr key={commentItem.id} className={isPending ? 'is-row-pending' : ''}>
                          {/* Article info */}
                          <td>
                            <div className="comment-article-cell">
                              <span className="comment-article-title" title={commentItem.article?.title}>
                                {commentItem.article?.title || `Artikel #${commentItem.article_id}`}
                              </span>
                              {commentItem.article?.category && (
                                <span className="comment-article-badge">
                                  {commentItem.article.category}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Author & Telemetry info */}
                          <td>
                            <div className="comment-author-cell">
                              <div className="comment-author-row">
                                <HiOutlineUser size={14} className="user-icon" />
                                <strong className="comment-author-name">{commentItem.name || 'Anonim'}</strong>
                                {commentItem.is_anon && (
                                  <span className="pill-anon-badge">Anonim</span>
                                )}
                              </div>
                              <div className="comment-telemetry-meta">
                                <span className="telemetry-ip" title="IP Pengirim">
                                  {commentItem.ip_address || '127.0.0.1'}
                                </span>
                                {(commentItem.city || commentItem.country) && (
                                  <span className="telemetry-loc" title="Lokasi Pengirim">
                                    <HiOutlineMapPin size={11} />
                                    {commentItem.city ? `${commentItem.city}, ` : ''}{commentItem.country || 'Indonesia'}
                                  </span>
                                )}
                                {commentItem.device && (
                                  <span className="telemetry-device">
                                    {commentItem.device} • {commentItem.browser || 'Web'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Comment Content */}
                          <td>
                            <div className="comment-body-box">
                              <p className="comment-body-text">
                                "{commentItem.comment}"
                              </p>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td>
                            {isPending && (
                              <span className="comment-status-pill status-pending">
                                <HiOutlineClock size={13} />
                                <span>Menunggu</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="comment-status-pill status-approved">
                                <HiOutlineCheck size={13} />
                                <span>Disetujui</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="comment-status-pill status-rejected">
                                <HiOutlineXMark size={13} />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td>
                            <span className="comment-time-text">
                              {formatDateTime(commentItem.created_at)}
                            </span>
                          </td>

                          {/* Moderation Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="comment-actions-cluster">
                              {!isApproved && (
                                <button
                                  type="button"
                                  className="btn-mod-action btn-approve"
                                  onClick={() => handleApproveComment(commentItem.id)}
                                  title="Setujui komentar (Tampilkan di halaman publik)"
                                >
                                  <HiOutlineCheck size={16} />
                                  <span>Setujui</span>
                                </button>
                              )}
                              {!isRejected && (
                                <button
                                  type="button"
                                  className="btn-mod-action btn-reject"
                                  onClick={() => handleRejectComment(commentItem.id)}
                                  title="Tolak komentar"
                                >
                                  <HiOutlineXMark size={16} />
                                  <span>Tolak</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-mod-action btn-delete"
                                onClick={() => handleOpenDeleteCommentConfirm(commentItem)}
                                title="Hapus permanen komentar ini"
                              >
                                <HiOutlineTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DETAIL PENGUNJUNG / VIEW ANALYTICS
          ==================================================================== */}
      {isAnalyticsModalOpen && selectedArticleForAnalytics && (
        <div className="portal-modal-backdrop" onClick={() => setIsAnalyticsModalOpen(false)}>
          <div className="portal-modal-container analytics-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="analytics-modal-header">
              <div className="modal-title-cluster">
                <div className="icon-telemetry-badge">
                  <HiOutlineChartBar size={22} />
                </div>
                <div>
                  <h3 className="analytics-modal-title">
                    Detail Pengunjung & Telemetri Artikel
                  </h3>
                  <p className="analytics-modal-subtitle">
                    {selectedArticleForAnalytics.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsAnalyticsModalOpen(false)}
                aria-label="Tutup modal analitik"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="analytics-modal-body">
              {analyticsLoading ? (
                <div className="analytics-loading-box">
                  <HiOutlineArrowPath size={36} className="spin-icon text-red" />
                  <p>Memuat telemetri pengunjung (IP, perangkat, peramban, dan lokasi)...</p>
                </div>
              ) : analyticsData?.data ? (
                <div className="analytics-content-grid">
                  {/* Bento Metrics Strip */}
                  <div className="analytics-bento-strip">
                    <div className="analytics-kpi-card">
                      <span className="kpi-label">TOTAL TAYANG (VIEWS)</span>
                      <span className="kpi-value text-red">
                        {analyticsData.data.total_views || 0}
                      </span>
                      <span className="kpi-hint">Akumulasi klik baca</span>
                    </div>

                    <div className="analytics-kpi-card">
                      <span className="kpi-label">PENGUNJUNG UNIK (IP)</span>
                      <span className="kpi-value text-blue">
                        {analyticsData.data.unique_ips || 0}
                      </span>
                      <span className="kpi-hint">Alamat IP berbeda</span>
                    </div>

                    <div className="analytics-kpi-card">
                      <span className="kpi-label">PERANGKAT DOMINAN</span>
                      <span className="kpi-value text-emerald">
                        {analyticsData.data.device_breakdown?.[0]?.device || 'Desktop'}
                      </span>
                      <span className="kpi-hint">
                        {analyticsData.data.device_breakdown?.[0]?.count || 0} kunjungan
                      </span>
                    </div>

                    <div className="analytics-kpi-card">
                      <span className="kpi-label">KOTA TERBANYAK</span>
                      <span className="kpi-value text-purple">
                        {analyticsData.data.city_breakdown?.[0]?.city || 'Bekasi'}
                      </span>
                      <span className="kpi-hint">
                        {analyticsData.data.country_breakdown?.[0]?.country || 'Indonesia'}
                      </span>
                    </div>
                  </div>

                  {/* Distributions Grid */}
                  <div className="analytics-distributions-row">
                    {/* Device breakdown */}
                    <div className="analytics-dist-card">
                      <div className="dist-card-header">
                        <HiOutlineComputerDesktop size={17} />
                        <h4>Distribusi Perangkat</h4>
                      </div>
                      <div className="dist-items-list">
                        {(analyticsData.data.device_breakdown || []).length === 0 ? (
                          <span className="text-muted">Belum ada data</span>
                        ) : (
                          analyticsData.data.device_breakdown.map((d, idx) => {
                            const percent = analyticsData.data.total_views
                              ? Math.round((d.count / analyticsData.data.total_views) * 100)
                              : 0
                            return (
                              <div key={idx} className="dist-item-row">
                                <div className="dist-info-row">
                                  <span className="dist-name">
                                    {d.device === 'Mobile' && <HiOutlineDevicePhoneMobile size={14} />}
                                    {d.device === 'Tablet' && <HiOutlineDeviceTablet size={14} />}
                                    {d.device === 'Desktop' && <HiOutlineComputerDesktop size={14} />}
                                    <span>{d.device}</span>
                                  </span>
                                  <span className="dist-count">{d.count} ({percent}%)</span>
                                </div>
                                <div className="dist-progress-bar">
                                  <div className="dist-progress-fill" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Browser breakdown */}
                    <div className="analytics-dist-card">
                      <div className="dist-card-header">
                        <HiOutlineGlobeAlt size={17} />
                        <h4>Distribusi Peramban (Browser)</h4>
                      </div>
                      <div className="dist-items-list">
                        {(analyticsData.data.browser_breakdown || []).length === 0 ? (
                          <span className="text-muted">Belum ada data</span>
                        ) : (
                          analyticsData.data.browser_breakdown.map((b, idx) => (
                            <div key={idx} className="dist-item-badge-row">
                              <span className="dist-pill-name">{b.browser || 'Unknown'}</span>
                              <span className="dist-pill-val">{b.count} views</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* City & Country breakdown */}
                    <div className="analytics-dist-card">
                      <div className="dist-card-header">
                        <HiOutlineMapPin size={17} />
                        <h4>Lokasi Geografis (Kota / Negara)</h4>
                      </div>
                      <div className="dist-items-list">
                        {(analyticsData.data.city_breakdown || []).length === 0 ? (
                          <span className="text-muted">Belum ada data lokasi</span>
                        ) : (
                          analyticsData.data.city_breakdown.map((c, idx) => (
                            <div key={idx} className="dist-item-badge-row">
                              <span className="dist-pill-name">
                                <HiOutlineMapPin size={13} className="text-red" />
                                <span>{c.city || 'Bekasi'}</span>
                              </span>
                              <span className="dist-pill-val">{c.count} kunjungan</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Log Table */}
                  <div className="analytics-logs-box">
                    <div className="logs-header-row">
                      <h4>Log Rincian 50 Kunjungan Terakhir</h4>
                      <span className="logs-counter-note">
                        Terekam dengan detail IP, Perangkat, Browser & Lokasi Kota
                      </span>
                    </div>

                    <div className="table-scroll-container">
                      <table className="portal-articles-table logs-table">
                        <thead>
                          <tr>
                            <th style={{ width: '130px' }}>Alamat IP</th>
                            <th style={{ width: '150px' }}>Perangkat & OS</th>
                            <th style={{ width: '140px' }}>Browser</th>
                            <th>Lokasi Geografis</th>
                            <th style={{ width: '160px' }}>Waktu Kunjungan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!analyticsData.data.recent_views || analyticsData.data.recent_views.length === 0) ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>
                                Belum ada log kunjungan yang tercatat untuk artikel ini.
                              </td>
                            </tr>
                          ) : (
                            analyticsData.data.recent_views.map((log) => (
                              <tr key={log.id}>
                                <td>
                                  <span className="log-ip-badge">{log.ip_address}</span>
                                </td>
                                <td>
                                  <div className="log-device-box">
                                    <span className="log-device-name">
                                      {log.device === 'Mobile' && <HiOutlineDevicePhoneMobile size={13} />}
                                      {log.device === 'Tablet' && <HiOutlineDeviceTablet size={13} />}
                                      {log.device === 'Desktop' && <HiOutlineComputerDesktop size={13} />}
                                      <span>{log.device}</span>
                                    </span>
                                    <span className="log-os-name">{log.os || 'Windows'}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="log-browser-name">{log.browser}</span>
                                </td>
                                <td>
                                  <div className="log-location-box">
                                    <HiOutlineMapPin size={13} className="text-red" />
                                    <span>{log.city || 'Bekasi'}, {log.country || 'Indonesia'}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="log-time-text">
                                    {formatDateTime(log.viewed_at || log.created_at)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="table-empty-state">
                  <p>Tidak dapat memuat analitik pengunjung artikel.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="analytics-modal-footer">
              <button
                type="button"
                className="btn-portal-secondary"
                onClick={handleRefreshAnalytics}
                disabled={analyticsLoading}
              >
                <HiOutlineArrowPath size={16} className={analyticsLoading ? 'spin-icon' : ''} />
                <span>Refresh Telemetri</span>
              </button>
              <button
                type="button"
                className="btn-portal-primary"
                onClick={() => setIsAnalyticsModalOpen(false)}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: KONFIRMASI HAPUS ARTIKEL
          ==================================================================== */}
      {isDeleteModalOpen && targetArticle && (
        <div className="portal-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="portal-modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="delete-modal-title">Hapus Artikel Ini?</h3>
            <p className="delete-modal-desc">
              Artikel <strong>"{targetArticle.title}"</strong> serta semua riwayat tayang, like, dan komentarnya akan dihapus dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-portal-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-portal-danger"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: KONFIRMASI HAPUS KOMENTAR
          ==================================================================== */}
      {isDeleteCommentModalOpen && targetComment && (
        <div className="portal-modal-backdrop" onClick={() => setIsDeleteCommentModalOpen(false)}>
          <div className="portal-modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="delete-modal-title">Hapus Komentar Ini?</h3>
            <p className="delete-modal-desc">
              Komentar dari <strong>"{targetComment.name || 'Anonim'}"</strong> pada artikel <em>"{targetComment.article?.title || `Artikel #${targetComment.article_id}`}"</em> akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
            {targetComment.comment && (
              <div className="delete-comment-preview-box">
                "{targetComment.comment.length > 150 ? `${targetComment.comment.substring(0, 150)}...` : targetComment.comment}"
              </div>
            )}
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-portal-secondary"
                onClick={() => {
                  setIsDeleteCommentModalOpen(false)
                  setTargetComment(null)
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-portal-danger"
                onClick={handleConfirmDeleteComment}
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
