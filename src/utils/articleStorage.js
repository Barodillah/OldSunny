import { NEWS_ARTICLES } from '../data/newsData'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'
const STORAGE_KEY = 'sunny_news_articles'

// Helper to format current date in Indonesian
export const formatIndonesianDate = (d = new Date()) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Helper to generate slug from title
export const generateSlug = (text = '') => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Client-side device & browser telemetry for analytics
export const getClientTelemetry = () => {
  if (typeof navigator === 'undefined') {
    return { device: 'Desktop', browser: 'Google Chrome', os: 'Windows', city: 'Bekasi', country: 'Indonesia' }
  }

  const ua = navigator.userAgent || ''
  let device = 'Desktop'
  if (/tablet|ipad|playbook/i.test(ua)) device = 'Tablet'
  else if (/mobile|iphone|ipod|android/i.test(ua)) device = 'Mobile'

  let browser = 'Google Chrome'
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge'
  else if (/Chrome/i.test(ua)) browser = 'Google Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox'
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera'

  let os = 'Windows 11'
  if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let city = 'Bekasi'
  let country = 'Indonesia'
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz.includes('Jakarta') || tz.includes('Asia/Jakarta')) city = 'Bekasi'
    else if (tz.includes('Makassar')) city = 'Makassar'
    else if (tz.includes('Jayapura')) city = 'Jayapura'
  } catch {
    // fallback
  }

  return { device, browser, os, city, country, userAgent: ua }
}

// Transform backend snake_case article to frontend camelCase
export const normalizeArticle = (item) => {
  if (!item) return null
  return {
    ...item,
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    categoryTheme: item.category_theme || item.categoryTheme || 'red',
    date: item.date,
    readTime: item.read_time || item.readTime || '3 mnt baca',
    imageUrl: item.image_url || item.imageUrl,
    summary: item.summary,
    author: item.author,
    authorRole: item.author_role || item.authorRole,
    isHighlight: Boolean(item.is_highlight ?? item.isHighlight),
    highlightBadge: item.highlight_badge || item.highlightBadge || '',
    fullContent: item.full_content || item.fullContent || '',
    paragraphs: Array.isArray(item.paragraphs)
      ? item.paragraphs
      : (typeof item.paragraphs === 'string' ? JSON.parse(item.paragraphs) : []),
    expertQuote: item.expert_quote || item.expertQuote || '',
    highlights: Array.isArray(item.highlights)
      ? item.highlights
      : (typeof item.highlights === 'string' ? JSON.parse(item.highlights) : []),
    tags: Array.isArray(item.tags)
      ? item.tags
      : (typeof item.tags === 'string' ? JSON.parse(item.tags) : []),
    status: item.status || 'published',
    viewsCount: Number(item.views_count ?? item.viewsCount ?? 0),
    likesCount: Number(item.likes_count ?? item.likesCount ?? 0),
    commentsCount: Number(item.comments_count ?? item.commentsCount ?? 0),
    approvedCommentsCount: Number(item.approved_comments_count ?? item.approvedCommentsCount ?? 0)
  }
}

// Synchronous local storage read (with auto initial fallback)
export const getStoredArticles = () => {
  if (typeof window === 'undefined') {
    return NEWS_ARTICLES.map(a => ({ ...a, status: a.status || 'published' }))
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeArticle)
      }
    }
  } catch (err) {
    console.error('Error reading articles from localStorage:', err)
  }

  const initial = NEWS_ARTICLES.map(a => ({
    ...a,
    status: a.status || 'published',
    tags: a.tags || [a.category, 'Mitsubishi Motors', 'Dealer Resmi']
  }))
  saveStoredArticles(initial)
  return initial
}

// Helper to save array to localStorage and optionally notify listeners
export const saveStoredArticles = (articles, notify = true) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
    if (notify) {
      window.dispatchEvent(new Event('sunny_articles_updated'))
    }
  } catch (err) {
    console.error('Error saving articles to localStorage:', err)
  }
}

// Fetch articles from Laravel backend API and update localStorage cache
export const fetchArticlesFromBackend = async (caller = 'public', filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (caller === 'portal') params.append('caller', 'portal')
    if (filters.status) params.append('status', filters.status)
    if (filters.category && filters.category !== 'Semua') params.append('category', filters.category)
    if (filters.q) params.append('q', filters.q)

    const url = `${API_BASE_URL}/articles?${params.toString()}`
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Caller': caller
      }
    })

    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const json = await res.json()
    if (json.success && Array.isArray(json.data)) {
      const normalized = json.data.map(normalizeArticle)
      // Save quietly to cache without re-triggering sunny_articles_updated event loop
      saveStoredArticles(normalized, false)
      return normalized
    }
  } catch (err) {
    console.warn('Backend fetchArticles failed, using localStorage fallback:', err)
  }
  return getStoredArticles()
}

// Find single article by ID or slug
export const getStoredArticleByIdOrSlug = (idOrSlug) => {
  const articles = getStoredArticles()
  return articles.find(
    (item) => String(item.id) === String(idOrSlug) || item.slug === idOrSlug
  )
}

// Fetch single article from backend with approved comments
export const fetchArticleByIdOrSlugFromBackend = async (idOrSlug) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}`, {
      headers: { 'Accept': 'application/json' }
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        return normalizeArticle(json.data)
      }
    }
  } catch (err) {
    console.warn('Backend fetchArticleByIdOrSlug failed, using cache:', err)
  }
  return getStoredArticleByIdOrSlug(idOrSlug)
}

// Save article (Create or Update) to backend & sync local
export const saveArticle = async (articleData) => {
  const isUpdate = Boolean(articleData.id && !String(articleData.id).startsWith('temp_'))
  const url = isUpdate ? `${API_BASE_URL}/articles/${articleData.id}` : `${API_BASE_URL}/articles`
  const method = isUpdate ? 'PUT' : 'POST'

  const payload = {
    title: articleData.title,
    category: articleData.category,
    category_theme: articleData.categoryTheme || 'red',
    date: articleData.date || formatIndonesianDate(new Date()),
    read_time: articleData.readTime || '3 mnt baca',
    image_url: articleData.imageUrl,
    summary: articleData.summary,
    author: articleData.author,
    author_role: articleData.authorRole,
    is_highlight: Boolean(articleData.isHighlight),
    highlight_badge: articleData.highlightBadge || '',
    full_content: articleData.fullContent || '',
    paragraphs: articleData.paragraphs || [],
    expert_quote: articleData.expertQuote || '',
    highlights: articleData.highlights || [],
    tags: articleData.tags || [],
    status: articleData.status || 'published',
    slug: articleData.slug || undefined
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Caller': 'portal'
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        const saved = normalizeArticle(json.data)
        const current = getStoredArticles()
        const idx = current.findIndex(a => String(a.id) === String(saved.id))
        if (idx !== -1) {
          current[idx] = saved
        } else {
          current.unshift(saved)
        }
        saveStoredArticles(current)
        return saved
      }
    }
  } catch (err) {
    console.warn('Backend saveArticle failed, falling back to localStorage:', err)
  }

  // Local fallback
  const articles = getStoredArticles()
  const now = new Date()
  if (articleData.id) {
    const index = articles.findIndex((a) => String(a.id) === String(articleData.id))
    if (index !== -1) {
      const updatedArticle = {
        ...articles[index],
        ...articleData,
        updatedAt: now.toISOString(),
      }
      articles[index] = normalizeArticle(updatedArticle)
      saveStoredArticles(articles)
      return articles[index]
    }
  }

  const newId = Date.now()
  const newSlug = articleData.slug?.trim() || generateSlug(articleData.title) || `artikel-${newId}`
  const newArticle = normalizeArticle({
    ...articleData,
    id: newId,
    slug: newSlug,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  })
  articles.unshift(newArticle)
  saveStoredArticles(articles)
  return newArticle
}

// Delete article from backend & local
export const deleteArticle = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (!res.ok) console.warn('Backend delete returned status', res.status)
  } catch (err) {
    console.warn('Backend deleteArticle failed, updating local cache only:', err)
  }

  const articles = getStoredArticles()
  const filtered = articles.filter((a) => String(a.id) !== String(id))
  saveStoredArticles(filtered)
  return filtered
}

// Toggle published / draft status in backend & local
export const toggleArticleStatus = async (id, newStatus = null) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Caller': 'portal'
      },
      body: JSON.stringify({ status: newStatus })
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success) {
        const articles = getStoredArticles()
        const found = articles.find(a => String(a.id) === String(id))
        if (found) {
          found.status = json.status
          saveStoredArticles(articles)
          return found
        }
      }
    }
  } catch (err) {
    console.warn('Backend toggleArticleStatus failed, updating local cache:', err)
  }

  const articles = getStoredArticles()
  const article = articles.find((a) => String(a.id) === String(id))
  if (article) {
    article.status = article.status === 'published' ? 'draft' : 'published'
    article.updatedAt = new Date().toISOString()
    saveStoredArticles(articles)
    return article
  }
  return null
}

// Record Article View with full IP, device, browser, city, country telemetry
export const recordArticleView = async (idOrSlug) => {
  const telemetry = getClientTelemetry()
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(telemetry)
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success) {
        return json
      }
    }
  } catch (err) {
    console.warn('Backend recordArticleView failed:', err)
  }
  return null
}

// Toggle Like in backend
export const toggleArticleLike = async (idOrSlug, sessionId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ session_id: sessionId })
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success) {
        return json
      }
    }
  } catch (err) {
    console.warn('Backend toggleArticleLike failed:', err)
  }
  return null
}

// Comments: Fetch for article
export const fetchArticleComments = async (idOrSlug, caller = 'public') => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}/comments`, {
      headers: {
        'Accept': 'application/json',
        'X-Caller': caller
      }
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data
      }
    }
  } catch (err) {
    console.warn('Backend fetchArticleComments failed:', err)
  }
  return []
}

// Comments: Submit comment
export const submitArticleComment = async (idOrSlug, { name, is_anon, comment }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, is_anon, comment })
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      }
    }
  } catch (err) {
    console.warn('Backend submitArticleComment failed:', err)
  }
  return null
}

// Comments: Portal moderation (all comments)
export const fetchAllCommentsForPortal = async (status = 'all') => {
  try {
    const url = `${API_BASE_URL}/articles/comments/all?status=${status}`
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data
      }
    }
  } catch (err) {
    console.warn('Backend fetchAllCommentsForPortal failed:', err)
  }
  return []
}

// Comments: Approve comment
export const approveArticleComment = async (commentId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/comments/${commentId}/approve`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (res.ok) {
      const json = await res.json()
      return json.success
    }
  } catch (err) {
    console.warn('Backend approveArticleComment failed:', err)
  }
  return false
}

// Comments: Reject comment
export const rejectArticleComment = async (commentId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/comments/${commentId}/reject`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (res.ok) {
      const json = await res.json()
      return json.success
    }
  } catch (err) {
    console.warn('Backend rejectArticleComment failed:', err)
  }
  return false
}

// Comments: Delete comment
export const deleteArticleComment = async (commentId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (res.ok) {
      const json = await res.json()
      return json.success
    }
  } catch (err) {
    console.warn('Backend deleteArticleComment failed:', err)
  }
  return false
}

// Analytics: Get View Analytics for an article
export const fetchArticleViewAnalytics = async (idOrSlug) => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}/analytics`, {
      headers: {
        'Accept': 'application/json',
        'X-Caller': 'portal'
      }
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success) {
        return json
      }
    }
  } catch (err) {
    console.warn('Backend fetchArticleViewAnalytics failed:', err)
  }
  return null
}

// Toggle carousel highlight flag
export const toggleArticleHighlight = async (id) => {
  const articles = getStoredArticles()
  const article = articles.find((a) => String(a.id) === String(id))
  if (article) {
    article.isHighlight = !article.isHighlight
    if (article.isHighlight && !article.highlightBadge) {
      article.highlightBadge = 'HIGHLIGHT UTAMA'
    }
    article.updatedAt = new Date().toISOString()
    // Save to backend
    saveArticle(article)
    return article
  }
  return null
}

// Reset to initial articles from newsData.js
export const resetArticlesToDefault = () => {
  const initial = NEWS_ARTICLES.map(a => ({
    ...a,
    status: 'published',
    tags: a.tags || [a.category, 'Mitsubishi Motors', 'Dealer Resmi']
  }))
  saveStoredArticles(initial)
  return initial
}
