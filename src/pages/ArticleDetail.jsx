import { useState, useEffect, useRef, useMemo } from 'react'
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
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineEye,
  HiHeart,
  HiOutlineHeart,
  HiOutlineChatBubbleLeft,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlinePhoto
} from 'react-icons/hi2'
import { RiWhatsappLine, RiTwitterXLine, RiSendPlane2Line } from 'react-icons/ri'
import { SiThreads } from 'react-icons/si'
import {
  getStoredArticles,
  recordArticleView,
  toggleArticleLike,
  fetchArticleComments,
  submitArticleComment,
  fetchArticlesFromBackend
} from '../utils/articleStorage'
import './ArticleDetail.css'

// ============================================================================
// MARKDOWN PARSER UTILITIES FOR ARTICLE BODY
// ============================================================================

// Escape HTML entities to prevent XSS injection
const escapeHtml = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Format inline markdown (bold, italic, inline code, links, and embedded images)
const formatInline = (text) => {
  if (!text) return ''
  let formatted = escapeHtml(text)

  // Markdown Custom Image syntax: [img:url] or [img:url|caption]
  formatted = formatted.replace(
    /\[img:(https?:\/\/[^\]|]+)(?:\|([^\]]*))?\]/gi,
    (match, url, caption) => {
      const cleanUrl = url.trim()
      const cleanCaption = caption ? caption.trim() : ''
      return `<figure class="article-body-figure"><div class="article-figure-img-wrap"><img src="${cleanUrl}" alt="${cleanCaption || 'Gambar Artikel'}" class="article-body-image" loading="lazy" /></div>${cleanCaption ? `<figcaption class="article-body-figcaption"><span>${cleanCaption}</span></figcaption>` : ''}</figure>`
    }
  )

  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>')

  // Italic: *text* or _text_
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  formatted = formatted.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>')

  // Inline Code: `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="article-inline-code">$1</code>')

  // Links: [label](url)
  formatted = formatted.replace(
    /\[(.*?)\]\(((?:https?:\/\/|tel:|mailto:|wa\.me|\/).*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="article-inline-link">$1</a>'
  )

  return formatted
}

// Parse markdown content into structured blocks (headings, tables, quotes, lists, images, paragraphs)
const parseMarkdownArticleContent = (rawMarkdown) => {
  if (!rawMarkdown) return []

  const rawBlocks = String(rawMarkdown)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  const elements = []

  const isTableSeparator = (line) => {
    return line.includes('|') && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line)
  }

  const parseRowCells = (line) => {
    let clean = line.trim()
    if (clean.startsWith('|')) clean = clean.substring(1)
    if (clean.endsWith('|')) clean = clean.substring(0, clean.length - 1)
    return clean.split('|').map((c) => c.trim())
  }

  const parseHeading = (line) => {
    if (/^####\s+/.test(line)) {
      return { level: 4, text: line.replace(/^####\s+/, '').trim() }
    }
    if (/^###\s+/.test(line)) {
      return { level: 3, text: line.replace(/^###\s+/, '').trim() }
    }
    if (/^##\s+/.test(line)) {
      return { level: 2, text: line.replace(/^##\s+/, '').trim() }
    }
    if (/^#\s+/.test(line)) {
      return { level: 2, text: line.replace(/^#\s+/, '').trim() }
    }
    return null
  }

  const parseImageLine = (line) => {
    const match = line.trim().match(/^\[img:(https?:\/\/[^\]|]+)(?:\|([^\]]*))?\]$/i)
    if (!match) return null
    return {
      url: match[1].trim(),
      caption: match[2]?.trim() || ''
    }
  }

  rawBlocks.forEach((block) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) return

    // 1. Table Block Detection
    const sepIdx = lines.findIndex(isTableSeparator)
    if (sepIdx > 0) {
      const headerCells = parseRowCells(lines[0])
      const bodyRows = lines
        .slice(sepIdx + 1)
        .filter((l) => l.includes('|'))
        .map(parseRowCells)

      elements.push({
        type: 'table',
        headers: headerCells,
        rows: bodyRows
      })
      return
    }

    // 2. Blockquote Detection (line starts with >)
    if (lines[0].startsWith('>')) {
      const quoteRaw = lines
        .map((l) => l.replace(/^>\s*/, '').trim())
        .filter(Boolean)
        .join(' ')

      const citeParts = quoteRaw.split(/\s+[—–-]{1,2}\s+/)
      const quoteText = citeParts[0].replace(/^["']|["']$/g, '').trim()
      const quoteAuthor = citeParts[1]?.trim() || null

      elements.push({
        type: 'quote',
        quoteText,
        quoteAuthor
      })
      return
    }

    // 3. Single-line Image Block [img:url] or [img:url|caption]
    if (lines.length === 1) {
      const imgData = parseImageLine(lines[0])
      if (imgData) {
        elements.push({
          type: 'image',
          url: imgData.url,
          caption: imgData.caption
        })
        return
      }
    }

    // 4. Single-line Heading
    if (lines.length === 1) {
      const heading = parseHeading(lines[0])
      if (heading) {
        elements.push({
          type: 'heading',
          ...heading
        })
        return
      }
    }

    // 5. Mixed lines: Headings, Images, Bullet Lists, Numbered Lists, Paragraphs
    let currentList = null
    let listKind = null // 'ul' | 'ol'

    lines.forEach((line) => {
      const imgData = parseImageLine(line)
      if (imgData) {
        if (currentList) {
          elements.push({ type: listKind, items: currentList })
          currentList = null
          listKind = null
        }
        elements.push({
          type: 'image',
          url: imgData.url,
          caption: imgData.caption
        })
        return
      }

      const heading = parseHeading(line)
      if (heading) {
        if (currentList) {
          elements.push({ type: listKind, items: currentList })
          currentList = null
          listKind = null
        }
        elements.push({ type: 'heading', ...heading })
        return
      }

      const isBullet = /^[•\-\*]\s+/.test(line)
      const isNumbered = /^\d+[\.\)]\s+/.test(line)

      if (isBullet) {
        if (currentList && listKind !== 'ul') {
          elements.push({ type: listKind, items: currentList })
          currentList = null
        }
        if (!currentList) {
          currentList = []
          listKind = 'ul'
        }
        currentList.push(line.replace(/^[•\-\*]\s+/, ''))
      } else if (isNumbered) {
        if (currentList && listKind !== 'ol') {
          elements.push({ type: listKind, items: currentList })
          currentList = null
        }
        if (!currentList) {
          currentList = []
          listKind = 'ol'
        }
        currentList.push(line.replace(/^\d+[\.\)]\s+/, ''))
      } else {
        if (currentList) {
          elements.push({ type: listKind, items: currentList })
          currentList = null
          listKind = null
        }
        const lastEl = elements[elements.length - 1]
        if (lastEl && lastEl.type === 'p') {
          lastEl.text += ' ' + line
        } else {
          elements.push({ type: 'p', text: line })
        }
      }
    })

    if (currentList) {
      elements.push({ type: listKind, items: currentList })
    }
  })

  return elements
}

export default function ArticleDetail() {
  const { slug, id } = useParams()
  const articleSlug = slug || id
  const navigate = useNavigate()
  const articleContentRef = useRef(null)
  const commentTextareaRef = useRef(null)
  const commentsSectionRef = useRef(null)

  const [readingProgress, setReadingProgress] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Views, Likes, & Comments State
  const [viewCount, setViewCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [authorChoice, setAuthorChoice] = useState('anon') // 'anon' | 'name'
  const [customName, setCustomName] = useState('')

  // Reactive article list loaded from articleStorage
  const [articleList, setArticleList] = useState(() => getStoredArticles())

  useEffect(() => {
    const handleUpdate = () => {
      setArticleList(getStoredArticles())
    }
    window.addEventListener('sunny_articles_updated', handleUpdate)
    return () => window.removeEventListener('sunny_articles_updated', handleUpdate)
  }, [])

  // Find article by slug (primary) or id (fallback)
  const article = useMemo(() => {
    return articleList.find(
      (item) => item.slug === articleSlug || String(item.id) === String(articleSlug)
    )
  }, [articleList, articleSlug])

  // If accessed by ID, replace URL with canonical slug URL
  useEffect(() => {
    if (article?.slug && articleSlug && String(article.id) === String(articleSlug) && articleSlug !== article.slug) {
      navigate(`/news/${article.slug}`, { replace: true })
    }
  }, [article, articleSlug, navigate])

  // Scroll to top on article change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [articleSlug])

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

  // Initial backend sync
  useEffect(() => {
    fetchArticlesFromBackend()
  }, [])

  // Views counter tracking with backend telemetry & session de-duplication
  useEffect(() => {
    if (!article?.id) return
    const sessionKey = `sunny_article_viewed_${article.id}`

    // Set initial view count from article
    setViewCount(article.viewsCount || article.views_count || 1)

    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true')
      recordArticleView(article.id).then((res) => {
        if (res?.views_count) {
          setViewCount(res.views_count)
        }
      })
    }
  }, [article?.id, article?.viewsCount, article?.views_count])

  // Likes tracking
  useEffect(() => {
    if (!article?.id) return
    const likedKey = `sunny_article_liked_${article.id}`
    setIsLiked(localStorage.getItem(likedKey) === 'true')
    setLikeCount(article.likesCount || article.likes_count || 0)
  }, [article?.id, article?.likesCount, article?.likes_count])

  // Comments loading from backend
  useEffect(() => {
    if (!article?.id) return
    fetchArticleComments(article.id).then((data) => {
      if (Array.isArray(data)) {
        setComments(data.map(c => ({
          id: c.id,
          name: c.name,
          isAnon: Boolean(c.is_anon),
          text: c.comment || c.text,
          createdAt: c.created_at
        })))
      }
    })
  }, [article?.id])

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

  const handleShareThreads = () => {
    if (!article) return
    const text = `${article.title} - Baca selengkapnya di Mitsubishi Sun Margahayu: ${window.location.href}`
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Like Toggle
  const handleToggleLike = async () => {
    if (!article?.id) return
    const likedKey = `sunny_article_liked_${article.id}`
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1))
    localStorage.setItem(likedKey, String(nextLiked))

    const res = await toggleArticleLike(article.id)
    if (res && typeof res.likes_count === 'number') {
      setLikeCount(res.likes_count)
      setIsLiked(res.is_liked)
    }
  }

  // Scroll to Comment Form & Focus Textarea
  const handleScrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      commentTextareaRef.current?.focus()
    }, 450)
  }

  // Comment Modal & Submission
  const handleOpenCommentModal = (e) => {
    if (e) e.preventDefault()
    if (!commentText.trim()) {
      commentTextareaRef.current?.focus()
      return
    }
    setIsCommentModalOpen(true)
  }

  const handleConfirmSubmitComment = async () => {
    if (!commentText.trim() || !article?.id) return
    const finalName = authorChoice === 'name' && customName.trim()
      ? customName.trim()
      : 'Anonim'

    const payload = {
      name: finalName,
      is_anon: authorChoice === 'anon',
      comment: commentText.trim()
    }

    const tempComment = {
      id: Date.now(),
      name: finalName,
      isAnon: authorChoice === 'anon',
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    }

    setComments(prev => [tempComment, ...prev])
    setCommentText('')
    setIsCommentModalOpen(false)
    setCustomName('')
    setAuthorChoice('anon')

    // Submit to Laravel backend
    const saved = await submitArticleComment(article.id, payload)
    if (saved) {
      setComments(prev => prev.map(c => c.id === tempComment.id ? {
        id: saved.id,
        name: saved.name,
        isAnon: Boolean(saved.is_anon),
        text: saved.comment,
        createdAt: saved.created_at
      } : c))
    }
  }

  // Reusable Interaction Grid (Used in mobile above comments & desktop in sidebar)
  const renderInteractionGrid = (isMobile = false) => (
    <div className={`sidebar-widget-card share-widget-card ${isMobile ? 'share-card-mobile' : 'share-card-desktop'}`}>
      <h4 className="sidebar-widget-heading">Bagikan & Interaksi</h4>
      <div className="sidebar-share-grid">
        <button
          type="button"
          className={`btn-sidebar-grid ${isCopied ? 'copied' : ''}`}
          onClick={handleCopyLink}
          title="Salin Tautan Artikel"
        >
          <HiOutlineClipboardDocumentCheck size={16} />
          <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
        </button>

        <button
          type="button"
          className="btn-sidebar-grid btn-grid-wa"
          onClick={handleShareWhatsApp}
          title="Bagikan via WhatsApp"
        >
          <RiWhatsappLine size={16} />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          className="btn-sidebar-grid btn-grid-tw"
          onClick={handleShareTwitter}
          title="Bagikan via X (Twitter)"
        >
          <RiTwitterXLine size={15} />
          <span>X / Twitter</span>
        </button>

        <button
          type="button"
          className="btn-sidebar-grid btn-grid-threads"
          onClick={handleShareThreads}
          title="Bagikan via Threads"
        >
          <SiThreads size={15} />
          <span>Threads</span>
        </button>

        <button
          type="button"
          className={`btn-sidebar-grid btn-grid-like ${isLiked ? 'liked' : ''}`}
          onClick={handleToggleLike}
          title={isLiked ? 'Batal Suka' : 'Sukai Artikel'}
          aria-label={`Sukai artikel, saat ini ${likeCount} suka`}
        >
          {isLiked ? (
            <HiHeart size={18} className="icon-like-active" />
          ) : (
            <HiOutlineHeart size={18} />
          )}
          <span className="grid-count">{likeCount}</span>
        </button>

        <button
          type="button"
          className="btn-sidebar-grid btn-grid-comment"
          onClick={handleScrollToComments}
          title="Tulis dan lihat komentar artikel"
          aria-label={`Lihat komentar, saat ini ${comments.length} komentar`}
        >
          <HiOutlineChatBubbleLeft size={18} />
          <span className="grid-count">{comments.length}</span>
        </button>
      </div>
    </div>
  )

  // Dynamic CTA configuration based on article category & content
  const ctaConfig = useMemo(() => {
    const cat = (article?.category || '').toLowerCase()
    const title = article?.title || 'Artikel ini'

    // 1. Rilis Unit Baru / Mobil Baru / Spesifikasi / Test Drive
    if (
      cat.includes('rilis') ||
      cat.includes('unit') ||
      cat.includes('mobil') ||
      cat.includes('hybrid') ||
      cat.includes('spesifikasi') ||
      cat.includes('xforce') ||
      cat.includes('pajero') ||
      cat.includes('xpander')
    ) {
      const unitName = title.includes('XForce')
        ? 'New XForce'
        : title.includes('Pajero')
        ? 'Pajero Sport'
        : title.includes('Xpander')
        ? 'New Xpander'
        : 'Unit Ini'
      return {
        tag: 'KONSULTASI UNIT & TEST DRIVE',
        title: `Tertarik dengan ${unitName} atau Ingin Jadwal Test Drive?`,
        desc: 'Konsultasikan ketersediaan unit, promo diskon OTR, atau jadwalkan sesi test drive langsung bersama Sunny AI.',
        buttonText: 'Tanya Sunny AI tentang Unit Ini',
        prompt: `Halo Sunny, saya sedang membaca ulasan "${title}". Boleh minta info detail spesifikasi, ketersediaan unit, promo diskon OTR, dan jadwal test drive di dealer Sun Margahayu?`
      }
    }

    // 2. Tips & Perawatan / Servis / Bengkel / Sparepart
    if (
      cat.includes('tips') ||
      cat.includes('rawat') ||
      cat.includes('servis') ||
      cat.includes('bengkel') ||
      cat.includes('oli') ||
      cat.includes('mesin') ||
      cat.includes('bodi') ||
      cat.includes('body')
    ) {
      return {
        tag: 'BENGKEL & SERVIS RESMI',
        title: 'Ingin Booking Servis atau Konsultasi Kendala Kendaraan?',
        desc: 'Dapatkan estimasi biaya servis berkala, konsultasi suku cadang orisinal, atau booking antrean bengkel resmi secara instan.',
        buttonText: 'Konsultasi Servis via Sunny AI',
        prompt: `Halo Sunny, terkait artikel "${title}", saya ingin konsultasi perawatan berkala dan booking jadwal servis di bengkel resmi Sun Margahayu.`
      }
    }

    // 3. Promo & Program / Kredit / Diskon / Cicilan
    if (
      cat.includes('promo') ||
      cat.includes('program') ||
      cat.includes('kredit') ||
      cat.includes('diskon') ||
      cat.includes('harga') ||
      cat.includes('cicil') ||
      cat.includes('dp')
    ) {
      return {
        tag: 'PROMO & SIMULASI KREDIT',
        title: 'Mau Hitung Simulasi DP Ringan & Promo Terbaru?',
        desc: 'Ketahui rincian paket bunga 0%, diskon OTR spesial, dan perhitungan cicilan bulanan yang sesuai anggaran Anda.',
        buttonText: 'Hitung Simulasi via Sunny AI',
        prompt: `Halo Sunny, saya tertarik dengan promo di artikel "${title}". Bisakah bantu hitungkan simulasi kredit DP ringan dan rincian diskon OTR bulan ini?`
      }
    }

    // 4. Edukasi & Keamanan / Proteksi / Rekening Dealer
    if (
      cat.includes('edukasi') ||
      cat.includes('aman') ||
      cat.includes('keamanan') ||
      cat.includes('proteksi') ||
      cat.includes('resmi') ||
      cat.includes('rekening')
    ) {
      return {
        tag: 'PROTEKSI & KEAMANAN DEALER',
        title: 'Butuh Verifikasi Rekening atau Transaksi Resmi?',
        desc: 'Pastikan seluruh pembayaran dan SPK Anda terverifikasi langsung atas nama PT Sun Star Prima Motor untuk keamanan mutlak.',
        buttonText: 'Verifikasi Transaksi via Sunny AI',
        prompt: `Halo Sunny, setelah membaca "${title}", saya ingin verifikasi nomor rekening resmi dealer dan prosedur transaksi aman di PT Sun Star Prima Motor.`
      }
    }

    // 5. Default / Standar Layanan / Lainnya
    return {
      tag: 'KONSULTASI RESMI 24/7',
      title: `Ada Pertanyaan Seputar ${article?.category || 'Layanan Dealer'}?`,
      desc: 'Asisten virtual Sunny siap memberikan informasi produk, jadwal operasional bengkel, atau bantuan darurat 24 jam kapan pun Anda butuhkan.',
      buttonText: 'Tanya Sunny AI Sekarang',
      prompt: `Halo Sunny, saya sedang membaca artikel "${title}" (Kategori: ${article?.category || 'Umum'}). Boleh bantu informasi lebih lanjut mengenai hal ini?`
    }
  }, [article])

  // Dispatch question directly to AIAssistantFloating
  const handleAskSunnyAI = () => {
    if (!ctaConfig?.prompt) return
    window.dispatchEvent(
      new CustomEvent('sunny_ask_question', {
        detail: { query: ctaConfig.prompt }
      })
    )
  }

  // Related Articles (excluding current article, published only)
  const relatedArticles = useMemo(() => {
    return articleList
      .filter((item) => (item.status || 'published') === 'published' && String(item.id) !== String(article?.id || 0))
      .slice(0, 3)
  }, [articleList, article])

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

              {/* Action Utilities: View Counter & Bookmark */}
              <div className="article-action-buttons">
                <div className="article-views-counter" title="Total pembaca artikel ini">
                  <HiOutlineEye size={17} className="views-icon" />
                  <span className="views-count">{(viewCount || 0).toLocaleString('id-ID')}</span>
                  <span className="views-label">dilihat</span>
                </div>

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

            {/* Editorial Article Prose Body with Comprehensive Markdown Parser */}
            <section className="article-prose-body">
              {(() => {
                const rawMarkdown =
                  article.fullContent ||
                  (Array.isArray(article.paragraphs) && article.paragraphs.length > 0
                    ? article.paragraphs.join('\n\n')
                    : '') ||
                  article.summary ||
                  ''

                const elements = parseMarkdownArticleContent(rawMarkdown)
                const hasQuoteInBody = elements.some((el) => el.type === 'quote')

                return (
                  <>
                    {elements.map((el, idx) => {
                      if (el.type === 'heading') {
                        if (el.level === 3) {
                          return (
                            <h3
                              key={idx}
                              className="article-body-h3"
                              dangerouslySetInnerHTML={{ __html: formatInline(el.text) }}
                            />
                          )
                        }
                        if (el.level === 4) {
                          return (
                            <h4
                              key={idx}
                              className="article-body-h4"
                              dangerouslySetInnerHTML={{ __html: formatInline(el.text) }}
                            />
                          )
                        }
                        return (
                          <h2
                            key={idx}
                            className="article-body-h2"
                            dangerouslySetInnerHTML={{ __html: formatInline(el.text) }}
                          />
                        )
                      }

                      if (el.type === 'image') {
                        return (
                          <figure key={idx} className="article-body-figure">
                            <div className="article-figure-img-wrap">
                              <img
                                src={el.url}
                                alt={el.caption || 'Ilustrasi Artikel Sun Star Prima Motor'}
                                className="article-body-image"
                                loading="lazy"
                              />
                            </div>
                            {el.caption && (
                              <figcaption className="article-body-figcaption">
                                <HiOutlinePhoto size={15} className="figcaption-icon" />
                                <span>{el.caption}</span>
                              </figcaption>
                            )}
                          </figure>
                        )
                      }

                      if (el.type === 'table') {
                        return (
                          <div key={idx} className="article-table-responsive">
                            <table className="article-content-table">
                              {el.headers.length > 0 && (
                                <thead>
                                  <tr>
                                    {el.headers.map((h, hIdx) => (
                                      <th
                                        key={hIdx}
                                        dangerouslySetInnerHTML={{ __html: formatInline(h) }}
                                      />
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {el.rows.map((rowCells, rIdx) => (
                                  <tr key={rIdx}>
                                    {rowCells.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                                      />
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      }

                      if (el.type === 'quote') {
                        return (
                          <blockquote key={idx} className="article-quote-block">
                            <p
                              className="quote-text"
                              dangerouslySetInnerHTML={{ __html: `"${formatInline(el.quoteText)}"` }}
                            />
                            {el.quoteAuthor && (
                              <cite
                                className="quote-author"
                                dangerouslySetInnerHTML={{ __html: `— ${formatInline(el.quoteAuthor)}` }}
                              />
                            )}
                          </blockquote>
                        )
                      }

                      if (el.type === 'ul') {
                        return (
                          <ul key={idx} className="article-body-ul">
                            {el.items.map((it, iIdx) => (
                              <li
                                key={iIdx}
                                dangerouslySetInnerHTML={{ __html: formatInline(it) }}
                              />
                            ))}
                          </ul>
                        )
                      }

                      if (el.type === 'ol') {
                        return (
                          <ol key={idx} className="article-body-ol">
                            {el.items.map((it, iIdx) => (
                              <li
                                key={iIdx}
                                dangerouslySetInnerHTML={{ __html: formatInline(it) }}
                              />
                            ))}
                          </ol>
                        )
                      }

                      if (el.type === 'p') {
                        return (
                          <p
                            key={idx}
                            className="article-body-p"
                            dangerouslySetInnerHTML={{ __html: formatInline(el.text) }}
                          />
                        )
                      }

                      return null
                    })}

                    {/* Legacy Expert Quote fallback (only if no markdown > blockquote was used) */}
                    {article.expertQuote && !hasQuoteInBody && (
                      <blockquote className="article-quote-block">
                        <p className="quote-text">"{article.expertQuote}"</p>
                        <cite className="quote-author">
                          — {article.author}, {article.authorRole}
                        </cite>
                      </blockquote>
                    )}
                  </>
                )
              })()}
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

            {/* Article Tags Section */}
            <section className="article-tags-section" aria-label="Tag dan Topik Terkait">
              <div className="article-tags-header">
                <HiOutlineTag size={18} className="article-tags-icon" />
                <span className="article-tags-title">Topik Terkait:</span>
              </div>
              <div className="article-tags-list">
                {(article.tags && article.tags.length > 0
                  ? article.tags
                  : [
                    article.category,
                    article.highlightBadge || 'Berita Resmi',
                    'Mitsubishi Motors',
                    'Sun Margahayu',
                    'Dealer Resmi'
                  ]
                ).map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/news?q=${encodeURIComponent(tag)}`}
                    className="article-tag-item"
                  >
                    <span className="tag-hash">#</span>
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Mobile Interaction Grid (Placed directly above Comments Section on Mobile) */}
            {renderInteractionGrid(true)}

            {/* ==========================================================
                COMMENTS SECTION
                ========================================================== */}
            <section
              className="article-comments-section"
              id="comments-section"
              ref={commentsSectionRef}
              aria-label="Kolom Komentar Artikel"
            >
              {/* Header: Red chat bubble icon + Komentar (N) */}
              <div className="comments-section-header">
                <HiOutlineChatBubbleLeft className="comments-header-icon" size={24} />
                <h3 className="comments-header-title">
                  Komentar ({comments.length})
                </h3>
              </div>

              {/* Input Row: Avatar "You" + Rounded Textarea Box with Paper Airplane Send Button */}
              <form className="comment-form-box" onSubmit={handleOpenCommentModal}>
                <div className="comment-user-avatar">
                  <span>You</span>
                </div>

                <div className="comment-textarea-wrap">
                  <textarea
                    ref={commentTextareaRef}
                    className="comment-textarea"
                    placeholder="Tulis komentar Anda..."
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleOpenCommentModal(e)
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className={`btn-send-comment ${commentText.trim() ? 'active' : ''}`}
                    title="Kirim Komentar"
                    aria-label="Kirim Komentar"
                    disabled={!commentText.trim()}
                  >
                    <RiSendPlane2Line size={20} />
                  </button>
                </div>
              </form>

              {/* Comments Display: Empty State or List */}
              {comments.length === 0 ? (
                <div className="comments-empty-state">
                  <p>Belum ada komentar. Jadilah yang pertama!</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((item) => (
                    <div key={item.id} className="comment-item-card">
                      <div className={`comment-author-avatar ${item.isAnon ? 'anon' : ''}`}>
                        <span>
                          {item.isAnon
                            ? 'AN'
                            : (item.name ? item.name.charAt(0).toUpperCase() : 'U')}
                        </span>
                      </div>
                      <div className="comment-item-body">
                        <div className="comment-item-header">
                          <span className="comment-author-name">{item.name}</span>
                          <span className={`comment-badge ${item.isAnon ? 'badge-anon' : 'badge-reader'}`}>
                            {item.isAnon ? 'Anonim' : 'Pembaca'}
                          </span>
                          <span className="comment-dot">•</span>
                          <span className="comment-time">
                            {(() => {
                              try {
                                const d = new Date(item.createdAt)
                                return d.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              } catch {
                                return 'Baru saja'
                              }
                            })()}
                          </span>
                        </div>
                        <p className="comment-item-text">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

              {/* Quick Actions Card: 2-Column Grid (Desktop Sidebar) */}
              {renderInteractionGrid(false)}

              {/* Quick Dealer Contact Card - Dynamic by Article Category & Contextual AI Prompt */}
              <div className="sidebar-widget-card sidebar-dealer-card">
                <span className="sidebar-dealer-tag">{ctaConfig.tag}</span>
                <h4 className="sidebar-dealer-title">{ctaConfig.title}</h4>
                <p className="sidebar-dealer-desc">{ctaConfig.desc}</p>
                <button
                  type="button"
                  className="btn-sidebar-dealer-action"
                  onClick={handleAskSunnyAI}
                  title="Tanyakan langsung ke Asisten Virtual Sunny AI"
                >
                  <HiOutlineSparkles size={16} />
                  <span>{ctaConfig.buttonText}</span>
                </button>
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
                  to={`/news/${rel.slug || rel.id}`}
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
                      className={`news-category-tag ${relIsYellow ? 'tag-yellow' : 'tag-red'
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

      {/* ================================================================
          MODAL PILIHAN IDENTITAS KOMENTAR (ANONIM ATAU MASUKKAN NAMA)
          ================================================================ */}
      {isCommentModalOpen && (
        <div
          className="comment-modal-backdrop"
          onClick={() => setIsCommentModalOpen(false)}
        >
          <div
            className="comment-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="comment-modal-header">
              <div>
                <h4 className="comment-modal-title">Kirim Komentar</h4>
                <p className="comment-modal-subtitle">
                  Pilih bagaimana identitas Anda ingin ditampilkan
                </p>
              </div>
              <button
                type="button"
                className="btn-close-comment-modal"
                onClick={() => setIsCommentModalOpen(false)}
                aria-label="Tutup modal"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="comment-identity-choices">
              {/* Option 1: Anonim */}
              <label
                className={`choice-card ${authorChoice === 'anon' ? 'selected' : ''}`}
                onClick={() => setAuthorChoice('anon')}
              >
                <input
                  type="radio"
                  name="authorChoice"
                  value="anon"
                  checked={authorChoice === 'anon'}
                  onChange={() => setAuthorChoice('anon')}
                />
                <div className="choice-info">
                  <div className="choice-title-row">
                    <span className="choice-title">Kirim sebagai Anonim</span>
                    {authorChoice === 'anon' && <span className="choice-pill">Dipilih</span>}
                  </div>
                  <span className="choice-desc">
                    Nama Anda tidak akan ditampilkan kepada publik. Identitas tetap rahasia.
                  </span>
                </div>
              </label>

              {/* Option 2: Masukkan Nama */}
              <label
                className={`choice-card ${authorChoice === 'name' ? 'selected' : ''}`}
                onClick={() => setAuthorChoice('name')}
              >
                <input
                  type="radio"
                  name="authorChoice"
                  value="name"
                  checked={authorChoice === 'name'}
                  onChange={() => setAuthorChoice('name')}
                />
                <div className="choice-info">
                  <div className="choice-title-row">
                    <span className="choice-title">Masukkan Nama</span>
                    {authorChoice === 'name' && <span className="choice-pill">Dipilih</span>}
                  </div>
                  <span className="choice-desc">
                    Tampilkan nama panggilan atau nama lengkap Anda pada kolom komentar.
                  </span>
                </div>
              </label>

              {/* Name Input Field (Shown when 'name' is selected) */}
              {authorChoice === 'name' && (
                <div className="comment-name-input-group">
                  <label htmlFor="custom-author-name">Nama Pengirim:</label>
                  <div className="name-input-wrap">
                    <HiOutlineUser size={16} className="name-input-icon" />
                    <input
                      id="custom-author-name"
                      type="text"
                      className="name-input-field"
                      placeholder="Contoh: Budi Santoso / Denny K."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      autoFocus
                      maxLength={40}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comment Preview snippet */}
            <div className="comment-preview-box">
              <span className="preview-label">Isi Komentar:</span>
              <p className="preview-content">"{commentText}"</p>
            </div>

            <div className="comment-modal-actions">
              <button
                type="button"
                className="btn-comment-modal-cancel"
                onClick={() => setIsCommentModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-comment-modal-submit"
                onClick={handleConfirmSubmitComment}
                disabled={authorChoice === 'name' && !customName.trim()}
              >
                <RiSendPlane2Line size={16} />
                <span>Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
