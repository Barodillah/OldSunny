import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineExclamationTriangle,
  HiOutlineStar,
  HiStar,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineInformationCircle,
  HiOutlineCheck,
  HiOutlineBolt,
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText
} from 'react-icons/hi2'
import { usePortalAuth } from '../context/PortalAuthContext'
import {
  getStoredArticleByIdOrSlug,
  saveArticle,
  generateSlug,
  formatIndonesianDate
} from '../../utils/articleStorage'
import { NEWS_CATEGORIES } from '../../data/newsData'
import './PortalArticleEditor.css'

// ============================================================================
// MARKDOWN PARSER UTILITIES FOR ARTICLE LIVE PREVIEW & RENDERING
// ============================================================================

const escapeHtml = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>')
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  formatted = formatted.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>')
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="article-inline-code">$1</code>')
  formatted = formatted.replace(
    /\[(.*?)\]\(((?:https?:\/\/|tel:|mailto:|wa\.me|\/).*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="article-inline-link">$1</a>'
  )

  return formatted
}

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
    if (/^####\s+/.test(line)) return { level: 4, text: line.replace(/^####\s+/, '').trim() }
    if (/^###\s+/.test(line)) return { level: 3, text: line.replace(/^###\s+/, '').trim() }
    if (/^##\s+/.test(line)) return { level: 2, text: line.replace(/^##\s+/, '').trim() }
    if (/^#\s+/.test(line)) return { level: 2, text: line.replace(/^#\s+/, '').trim() }
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
    let listKind = null

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

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

const SAMPLE_IMAGE_PRESETS = [
  { label: 'Emergency', url: 'https://bewhy.id/wp-content/uploads/url_6ab0a0771891e7.52336063.webp' },
  { label: 'Destinator', url: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg' },
  { label: 'Interior Xforce', url: 'https://bewhy.id/wp-content/uploads/url_6acf48c9b8f122.20055577.webp' },
  { label: 'Tampilan Dealer', url: 'https://bewhy.id/wp-content/uploads/asset_6ad2db7cd48d67.36244714.webp' },
  { label: 'Playground', url: 'https://bewhy.id/wp-content/uploads/asset_6acd9f98722822.51908344.jpeg' }
]

// Quick suggestions for tags
const SUGGESTED_TAG_CHIPS = [
  'Mitsubishi Motors',
  'Sun Margahayu',
  'Dealer Resmi',
  'SUV Tangguh',
  'Servis Berkala',
  'Promo Bandung'
]

// Convert Indonesian Date String into YYYY-MM-DD
const parseIndonesianDateToYMD = (dateStr) => {
  if (!dateStr) {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr

  const indonesianMonths = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
  }
  const parts = dateStr.trim().toLowerCase().split(/\s+/)
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0')
    const month = indonesianMonths[parts[1]] || '01'
    const year = parts[2]
    if (year && month && day) {
      return `${year}-${month}-${day}`
    }
  }

  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// Convert YYYY-MM-DD into Indonesian display string
const formatYMDToIndonesian = (ymdStr) => {
  if (!ymdStr) return formatIndonesianDate(new Date())
  const parts = ymdStr.split('-').map(Number)
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return formatIndonesianDate(new Date())
  }
  const [y, m, d] = parts
  return formatIndonesianDate(new Date(y, m - 1, d))
}

export default function PortalArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = usePortalAuth()
  const isEditMode = Boolean(id)

  // Auth User Name & Position
  const loggedInUserName = user?.name || 'Tim Redaksi Mitsubishi Sun'
  const loggedInUserRole = user?.position || user?.role || 'Editorial Staff PT Sun Star Prima Motor'

  // Dynamic Highlights List State
  const [highlightsList, setHighlightsList] = useState([
    'Konsumsi bahan bakar efisien dan responsif',
    'Teknologi keselamatan aktif terdepan Mitsubishi',
    'Jaminan purna jual resmi PT Sun Star Prima Motor Margahayu'
  ])

  // Dynamic Interactive Tags State
  const [tagsList, setTagsList] = useState(['Mitsubishi Motors', 'Sun Margahayu', 'Dealer Resmi'])
  const [tagInput, setTagInput] = useState('')

  // Date picker state (YYYY-MM-DD)
  const [datePickerVal, setDatePickerVal] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })

  // Core Form Data
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    category: 'Rilis Unit Baru',
    categoryTheme: 'red',
    status: 'published',
    isHighlight: false,
    highlightBadge: 'HIGHLIGHT UTAMA',
    date: formatIndonesianDate(new Date()),
    readTime: '3 mnt baca',
    imageUrl: SAMPLE_IMAGE_PRESETS[0].url,
    summary: '',
    author: loggedInUserName,
    authorRole: loggedInUserRole,
    fullContentText: ''
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // AI Generator Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiStage, setAiStage] = useState('')

  // Content View & Markdown/Image Modal States
  const [activeContentView, setActiveContentView] = useState('edit') // 'edit' | 'preview'
  const [isInsertImageModalOpen, setIsInsertImageModalOpen] = useState(false)
  const [insertImageUrl, setInsertImageUrl] = useState('')
  const [insertImageCaption, setInsertImageCaption] = useState('')
  const [imagePreviewError, setImagePreviewError] = useState(false)
  const [isMarkdownGuideModalOpen, setIsMarkdownGuideModalOpen] = useState(false)
  const contentTextareaRef = useRef(null)

  // Detect embedded images in fullContentText for the preview strip
  const embeddedImages = useMemo(() => {
    const text = formData.fullContentText || ''
    const regex = /\[img:(https?:\/\/[^\]|]+)(?:\|([^\]]*))?\]/gi
    const matches = []
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        raw: match[0],
        url: match[1].trim(),
        caption: match[2]?.trim() || ''
      })
    }
    return matches
  }, [formData.fullContentText])

  const handleInsertImageIntoContent = () => {
    const cleanUrl = insertImageUrl.trim()
    if (!cleanUrl) return

    const cleanCaption = insertImageCaption.trim()
    const imgTag = cleanCaption
      ? `\n\n[img:${cleanUrl}|${cleanCaption}]\n\n`
      : `\n\n[img:${cleanUrl}]\n\n`

    const textarea = contentTextareaRef.current
    if (textarea) {
      const startPos = textarea.selectionStart ?? formData.fullContentText.length
      const endPos = textarea.selectionEnd ?? formData.fullContentText.length
      const textBefore = formData.fullContentText.substring(0, startPos)
      const textAfter = formData.fullContentText.substring(endPos)
      const updatedText = `${textBefore}${imgTag}${textAfter}`

      setFormData((prev) => ({
        ...prev,
        fullContentText: updatedText
      }))

      setTimeout(() => {
        if (contentTextareaRef.current) {
          contentTextareaRef.current.focus()
          const newCursorPos = startPos + imgTag.length
          contentTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 50)
    } else {
      setFormData((prev) => ({
        ...prev,
        fullContentText: `${prev.fullContentText}${imgTag}`
      }))
    }

    setInsertImageUrl('')
    setInsertImageCaption('')
    setImagePreviewError(false)
    setIsInsertImageModalOpen(false)
  }

  // Load article if in edit mode
  useEffect(() => {
    if (!id) return

    const existing = getStoredArticleByIdOrSlug(id)
    if (existing) {
      // 1. Process Highlights
      if (Array.isArray(existing.highlights) && existing.highlights.length > 0) {
        setHighlightsList(existing.highlights)
      } else if (existing.highlightsText) {
        const parsedH = existing.highlightsText
          .split(/\n+/)
          .map((h) => h.trim().replace(/^[-*•]\s*/, ''))
          .filter(Boolean)
        if (parsedH.length > 0) setHighlightsList(parsedH)
      }

      // 2. Process Tags
      if (Array.isArray(existing.tags) && existing.tags.length > 0) {
        setTagsList(existing.tags)
      } else if (existing.tagsText) {
        const parsedT = existing.tagsText
          .split(/[,;\n]+/)
          .map((t) => t.trim())
          .filter(Boolean)
        if (parsedT.length > 0) setTagsList(parsedT)
      }

      // 3. Process Date
      const rawDate = existing.date || formatIndonesianDate(new Date())
      setDatePickerVal(parseIndonesianDateToYMD(rawDate))

      // 4. Populate Form Data (author adheres to login or existing)
      setFormData({
        id: existing.id,
        title: existing.title || '',
        slug: existing.slug || '',
        category: existing.category || 'Rilis Unit Baru',
        categoryTheme: existing.categoryTheme || 'red',
        status: existing.status || 'published',
        isHighlight: Boolean(existing.isHighlight),
        highlightBadge: existing.highlightBadge || (existing.isHighlight ? 'HIGHLIGHT UTAMA' : ''),
        date: rawDate,
        readTime: existing.readTime || '3 mnt baca',
        imageUrl: existing.imageUrl || SAMPLE_IMAGE_PRESETS[0].url,
        summary: existing.summary || '',
        author: loggedInUserName,
        authorRole: loggedInUserRole,
        fullContentText: Array.isArray(existing.paragraphs) && existing.paragraphs.length > 0
          ? existing.paragraphs.join('\n\n')
          : (existing.fullContent || '')
      })
    } else {
      setErrorMessage(`Artikel dengan ID "${id}" tidak ditemukan.`)
    }
  }, [id, loggedInUserName, loggedInUserRole])

  // Word count and auto estimated read time calculation
  const wordCount = useMemo(() => {
    const text = `${formData.title} ${formData.summary} ${formData.fullContentText}`
    const words = text.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [formData.title, formData.summary, formData.fullContentText])

  const calculatedReadTime = useMemo(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 180))
    return `${minutes} mnt baca`
  }, [wordCount])

  // Automatically update estimated readTime if new article
  useEffect(() => {
    if (!isEditMode && wordCount > 20) {
      setFormData((prev) => ({ ...prev, readTime: calculatedReadTime }))
    }
  }, [calculatedReadTime, isEditMode, wordCount])

  // Title change with auto-slug
  const handleTitleChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : generateSlug(val)
    }))
  }

  // Highlights handlers
  const handleAddHighlight = () => {
    setHighlightsList((prev) => [...prev, ''])
  }

  const handleUpdateHighlight = (index, value) => {
    setHighlightsList((prev) => prev.map((item, idx) => (idx === index ? value : item)))
  }

  const handleRemoveHighlight = (index) => {
    setHighlightsList((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleHighlightKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setHighlightsList((prev) => [
        ...prev.slice(0, index + 1),
        '',
        ...prev.slice(index + 1)
      ])
    }
  }

  // Tags handlers
  const handleAddTag = (rawText) => {
    const clean = rawText.replace(/[,#]/g, '').trim()
    if (!clean) return
    if (!tagsList.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTagsList((prev) => [...prev, clean])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tagsList.length > 0) {
      setTagsList((prev) => prev.slice(0, -1))
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTagsList((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Date picker handler
  const handleDatePickerChange = (e) => {
    const ymd = e.target.value
    setDatePickerVal(ymd)
    const formatted = formatYMDToIndonesian(ymd)
    setFormData((prev) => ({ ...prev, date: formatted }))
  }

  // =========================================================================
  // AI GENERATOR HANDLER (Backend API: POST /api/articles/generate-ai)
  // =========================================================================
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Silakan masukkan topik, informasi, atau ringkasan draf terlebih dahulu.')
      return
    }

    setIsGeneratingAi(true)
    setAiError('')
    setAiStage('Menghubungkan ke Backend AI Service...')

    try {
      setAiStage('Merumuskan headline, isi lengkap, format konten, dan metadata...')

      const response = await fetch(`${API_BASE_URL}/articles/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: aiPrompt.trim() })
      })

      const resData = await response.json().catch(() => ({}))

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || `Gagal men-generate artikel dari backend (Status: ${response.status})`)
      }

      const generated = resData.data
      if (!generated || typeof generated !== 'object') {
        throw new Error('Format data artikel dari AI tidak valid.')
      }

      setAiStage('Menerapkan seluruh data ke formulir editor...')

      // 1. Title & Slug
      const newTitle = generated.title || 'Artikel Baru Mitsubishi Sun Margahayu'
      const newSlug = generated.slug ? generateSlug(generated.slug) : generateSlug(newTitle)
      const newSummary = generated.summary || ''
      const newContent = generated.fullContent || ''

      // 2. Category & Theme
      const newCategory = NEWS_CATEGORIES.includes(generated.category) ? generated.category : 'Rilis Unit Baru'
      const newTheme = generated.categoryTheme === 'yellow' ? 'yellow' : 'red'
      const newStatus = generated.status || 'published'
      const newIsHighlight = generated.isHighlight !== undefined ? Boolean(generated.isHighlight) : true
      const newHighlightBadge = generated.highlightBadge || (newIsHighlight ? 'HIGHLIGHT UTAMA' : '')

      // 3. Preset Image
      const presetIdx = typeof generated.recommendedPresetIndex === 'number' && SAMPLE_IMAGE_PRESETS[generated.recommendedPresetIndex]
        ? generated.recommendedPresetIndex
        : 0
      const newImageUrl = SAMPLE_IMAGE_PRESETS[presetIdx]?.url || SAMPLE_IMAGE_PRESETS[0].url

      // 4. Highlights List
      if (Array.isArray(generated.highlights) && generated.highlights.length > 0) {
        setHighlightsList(generated.highlights)
      }

      // 5. Tags List
      if (Array.isArray(generated.tags) && generated.tags.length > 0) {
        setTagsList(generated.tags)
      }

      // 6. Date Setup (today)
      const today = new Date()
      const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      setDatePickerVal(todayYMD)

      // 7. Read Time
      const calculatedWords = `${newTitle} ${newSummary} ${newContent}`.trim().split(/\s+/).filter(Boolean).length
      const estMinutes = Math.max(1, Math.ceil(calculatedWords / 180))
      const newReadTime = generated.readTime || `${estMinutes} mnt baca`

      // 8. Populate Form Data
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
        slug: newSlug,
        summary: newSummary,
        fullContentText: newContent,
        category: newCategory,
        categoryTheme: newTheme,
        status: newStatus,
        isHighlight: newIsHighlight,
        highlightBadge: newHighlightBadge,
        date: formatIndonesianDate(today),
        readTime: newReadTime,
        imageUrl: newImageUrl,
        author: loggedInUserName,
        authorRole: loggedInUserRole
      }))

      setIsAiModalOpen(false)
      setSuccessNotice('✨ Berhasil! Seluruh form artikel telah diisi otomatis oleh Sunny AI tanpa terkecuali.')
      setTimeout(() => setSuccessNotice(''), 5000)
    } catch (err) {
      console.error('Error generating article with backend AI:', err)
      setAiError(err.message || 'Terjadi kendala saat men-generate artikel. Silakan coba kembali.')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Handle Save
  const handleSave = async (targetStatus = null) => {
    setErrorMessage('')
    setSuccessNotice('')

    if (!formData.title.trim()) {
      setErrorMessage('Judul artikel wajib diisi.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.summary.trim()) {
      setErrorMessage('Ringkasan artikel (summary) wajib diisi.')
      return
    }

    setIsSubmitting(true)

    const paragraphs = formData.fullContentText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)

    const cleanedHighlights = highlightsList
      .map((h) => h.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean)

    const cleanedTags = tagsList.length > 0
      ? tagsList
      : [formData.category, 'Mitsubishi Motors']

    const finalStatus = targetStatus || formData.status

    const payload = {
      id: formData.id,
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      category: formData.category,
      categoryTheme: formData.categoryTheme,
      status: finalStatus,
      isHighlight: Boolean(formData.isHighlight),
      highlightBadge: formData.isHighlight ? (formData.highlightBadge.trim() || 'HIGHLIGHT UTAMA') : '',
      date: formData.date.trim() || formatIndonesianDate(new Date()),
      readTime: formData.readTime.trim() || calculatedReadTime,
      imageUrl: formData.imageUrl.trim(),
      summary: formData.summary.trim(),
      author: loggedInUserName,
      authorRole: loggedInUserRole,
      paragraphs: paragraphs.length > 0 ? paragraphs : [formData.summary.trim()],
      fullContent: formData.fullContentText.trim() || formData.summary.trim(),
      highlights: cleanedHighlights,
      tags: cleanedTags
    }

    try {
      const saved = await saveArticle(payload)
      setIsSubmitting(false)

      if (saved) {
        setSuccessNotice(
          isEditMode
            ? 'Perubahan artikel berhasil disimpan ke database!'
            : 'Artikel baru berhasil diterbitkan ke database!'
        )
        setTimeout(() => {
          navigate('/portal/articles')
        }, 1000)
      }
    } catch (err) {
      setIsSubmitting(false)
      setErrorMessage(err.message || 'Gagal menyimpan artikel ke server.')
    }
  }

  return (
    <div className="portal-editor-page">
      {/* Top Navigation & Action Bar */}
      <div className="editor-top-nav-bar">
        <div className="editor-nav-left">
          <Link to="/portal/articles" className="btn-editor-back">
            <HiOutlineArrowLeft size={16} />
            <span>Kembali ke Daftar</span>
          </Link>
          <div className="editor-breadcrumb">
            <span className="crumb-root">Artikel</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">
              {isEditMode ? `Edit: ${formData.title ? formData.title.slice(0, 38) + '...' : 'Artikel'}` : 'Tulis Artikel Baru'}
            </span>
          </div>
        </div>

        <div className="editor-nav-actions">
          {isEditMode && formData.id && (
            <Link
              to={`/news/${formData.slug || formData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editor-preview"
              title="Lihat tampilan publik artikel ini"
            >
              <HiOutlineEye size={17} />
              <span>Lihat Publik</span>
            </Link>
          )}

          {/* Tombol Generate AI - Hanya tampil untuk Tulis Artikel Baru (sembunyikan saat Edit) */}
          {!isEditMode && (
            <button
              type="button"
              className="btn-editor-ai"
              onClick={() => setIsAiModalOpen(true)}
              title="Generate seluruh konten dan metadata artikel dengan Sunny AI"
            >
              <HiOutlineSparkles size={17} className="ai-btn-sparkle" />
              <span>Generate AI</span>
            </button>
          )}

          <button
            type="button"
            className="btn-editor-draft"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
          >
            <span>Simpan Draf</span>
          </button>

          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSave('published')}
            disabled={isSubmitting}
          >
            <HiOutlineCheckCircle size={18} />
            <span>{isEditMode ? 'Simpan Perubahan' : 'Terbitkan Artikel'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {errorMessage && (
        <div className="editor-alert-banner alert-error">
          <HiOutlineExclamationTriangle size={18} />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} className="btn-alert-dismiss">
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="editor-alert-banner alert-success">
          <HiOutlineCheckCircle size={18} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main 2-Column Grid Layout */}
      <div className="editor-layout-grid">
        {/* MAIN COLUMN (Writing & Content) */}
        <div className="editor-main-column">
          {/* Title & Slug Card */}
          <div className="editor-card main-headline-card">
            <label className="editor-field-label required">Judul Artikel</label>
            <input
              type="text"
              className="editor-title-input"
              placeholder="Contoh: Peluncuran New XForce Hybrid 2026: Efisiensi Maksimal & Standar Baru SUV..."
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <div className="editor-slug-row">
              <span className="slug-prefix">Tautan Publik: /news/</span>
              <input
                type="text"
                className="slug-input"
                placeholder="slug-otomatis-dari-judul"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          {/* Summary / Excerpt Card */}
          <div className="editor-card">
            <div className="card-header-row">
              <label className="editor-field-label required">Ringkasan Artikel (Summary / Lead Intro)</label>
              <span className="editor-char-hint">{formData.summary.length} karakter</span>
            </div>
            <textarea
              rows={3}
              className="editor-textarea"
              placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu depan berita, deskripsi carousel hero, dan snippet media sosial..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
            />
            <span className="field-sub-hint">
              Ringkasan ini akan tampil sebagai paragraf pembuka tebal di kartu daftar berita dan hero slider.
            </span>
          </div>

          {/* Full Article Content Card */}
          <div className="editor-card content-editor-card">
            <div className="card-header-row content-card-header">
              <div className="content-header-left">
                <label className="editor-field-label required">Isi Paragraf Lengkap Artikel</label>
                <div className="editor-stats-hint">
                  <span>{wordCount} kata</span>
                  <span>•</span>
                  <span>Est. {calculatedReadTime}</span>
                </div>
              </div>

              <div className="content-header-actions">
                {/* Tombol Sisipkan Gambar (Icon pic saja) */}
                <button
                  type="button"
                  className="btn-content-action"
                  onClick={() => setIsInsertImageModalOpen(true)}
                  title="Sisipkan Gambar ke Paragraf Artikel"
                  aria-label="Sisipkan Gambar"
                >
                  <HiOutlinePhoto size={18} />
                </button>

                {/* Tombol Panduan / Edukasi Format Markdown (Icon ? saja) */}
                <button
                  type="button"
                  className="btn-content-action"
                  onClick={() => setIsMarkdownGuideModalOpen(true)}
                  title="Panduan & Edukasi Format Markdown Lengkap"
                  aria-label="Panduan Format Markdown"
                >
                  <HiOutlineQuestionMarkCircle size={18} />
                </button>

                {/* View Mode Toggle: Tulis / Preview */}
                <div className="content-view-toggle">
                  <button
                    type="button"
                    className={`btn-view-toggle ${activeContentView === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveContentView('edit')}
                    title="Mode Edit Teks"
                  >
                    Tulis
                  </button>
                  <button
                    type="button"
                    className={`btn-view-toggle ${activeContentView === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveContentView('preview')}
                    title="Live Preview Tampilan Artikel"
                  >
                    <HiOutlineEye size={13} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {activeContentView === 'edit' ? (
              <>
                <textarea
                  ref={contentTextareaRef}
                  rows={14}
                  className="editor-textarea editor-content-textarea"
                  placeholder="Tulis isi artikel lengkap di sini...&#10;&#10;Gunakan baris baru ganda (Enter 2x) untuk memisahkan antar paragraf.&#10;&#10;Gunakan tombol icon gambar di atas untuk menyisipkan foto ([img:https://...]), atau icon '?' untuk panduan format lengkap (subtitle, tabel, kutipan, list)."
                  value={formData.fullContentText}
                  onChange={(e) => setFormData({ ...formData, fullContentText: e.target.value })}
                  required
                />

                {/* Strip Preview Gambar Tersemat di Bawah Textarea */}
                {embeddedImages.length > 0 && (
                  <div className="embedded-images-preview-bar">
                    <div className="embedded-images-header">
                      <div className="embedded-header-title">
                        <HiOutlinePhoto size={16} />
                        <span>Gambar Tersemat ({embeddedImages.length}):</span>
                      </div>
                      <span className="embedded-header-hint">Format otomatis: [img:URL]</span>
                    </div>
                    <div className="embedded-images-grid">
                      {embeddedImages.map((img, idx) => (
                        <div key={idx} className="embedded-image-card">
                          <div className="embedded-thumb-wrap">
                            <img
                              src={img.url}
                              alt={img.caption || `Gambar ${idx + 1}`}
                              className="embedded-thumb"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80'
                              }}
                            />
                          </div>
                          <div className="embedded-meta">
                            <span className="embedded-tag-syntax">[img #{idx + 1}]</span>
                            <span className="embedded-caption-text" title={img.caption || img.url}>
                              {img.caption || 'Tanpa keterangan'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="editor-live-preview-box">
                <div className="preview-box-header">
                  <div className="preview-badge">
                    <HiOutlineEye size={14} />
                    <span>Live Preview Editorial</span>
                  </div>
                  <span className="preview-desc">
                    Tampilan nyata rendering Markdown, Heading, Tabel, Kutipan, & Gambar
                  </span>
                </div>

                <div className="preview-prose-wrap">
                  {(() => {
                    const elements = parseMarkdownArticleContent(formData.fullContentText || formData.summary)
                    if (elements.length === 0) {
                      return (
                        <div className="preview-empty-state">
                          <HiOutlineDocumentText size={32} />
                          <p>Belum ada konten paragraf untuk dipratinjau. Mulai mengetik di tab "Tulis".</p>
                        </div>
                      )
                    }

                    return elements.map((el, idx) => {
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
                                alt={el.caption || 'Gambar Artikel'}
                                className="article-body-image"
                                loading="lazy"
                              />
                            </div>
                            {el.caption && (
                              <figcaption className="article-body-figcaption">
                                <HiOutlinePhoto size={14} className="figcaption-icon" />
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
                    })
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Highlights Checklist Card */}
          <div className="editor-card">
            <div className="card-header-row">
              <div>
                <h4 className="card-section-heading">Poin-Poin Utama / Checklist (Highlights)</h4>
                <span className="field-sub-hint">
                  Ditampilkan sebagai checklist emas eksklusif di bagian awal halaman artikel pembaca.
                </span>
              </div>
              <HiOutlineSparkles size={18} className="text-amber" />
            </div>

            <div className="highlights-list-builder">
              {highlightsList.map((point, index) => (
                <div key={index} className="highlight-row-item">
                  <span className="highlight-num-badge">{index + 1}</span>
                  <input
                    type="text"
                    className="editor-input highlight-row-input"
                    placeholder={`Poin sorotan ke-${index + 1} (tekan Enter untuk tambah baru)...`}
                    value={point}
                    onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                    onKeyDown={(e) => handleHighlightKeyDown(e, index)}
                  />
                  <button
                    type="button"
                    className="btn-remove-highlight-item"
                    onClick={() => handleRemoveHighlight(index)}
                    title="Hapus poin ini"
                    aria-label={`Hapus poin ${index + 1}`}
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn-add-highlight-item"
                onClick={handleAddHighlight}
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Poin Sorotan</span>
              </button>
            </div>
          </div>

          {/* Interactive Tags Card */}
          <div className="editor-card">
            <div className="card-header-row">
              <label className="editor-field-label">Topik & Tag Terkait</label>
              <HiOutlineTag size={16} className="text-muted" />
            </div>

            <div className="interactive-tags-box">
              {tagsList.map((tag) => (
                <span key={tag} className="tag-badge-pill">
                  <span className="hash-symbol">#</span>
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="btn-tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <HiOutlineXMark size={13} />
                  </button>
                </span>
              ))}

              <input
                type="text"
                className="interactive-tag-input-inline"
                placeholder={tagsList.length === 0 ? 'Ketik tag lalu tekan Enter atau koma (,)...' : 'Ketik tag baru...'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput)
                }}
              />
            </div>

            <span className="field-sub-hint">
              Ketik kata kunci lalu tekan <strong>Enter</strong> atau <strong>koma (,)</strong> untuk membuat tag baru. Tag dapat diklik pembaca untuk menyaring topik sejenis.
            </span>

            {/* Quick Suggestions */}
            <div className="tag-quick-suggests">
              <span className="suggest-label">Saran Cepat:</span>
              {SUGGESTED_TAG_CHIPS.filter((st) => !tagsList.includes(st)).map((st) => (
                <button
                  key={st}
                  type="button"
                  className="btn-suggest-chip"
                  onClick={() => handleAddTag(st)}
                >
                  + {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN (Settings & Metadata) */}
        <div className="editor-sidebar-column">
          {/* Publishing Box */}
          <div className="editor-card sidebar-panel-card">
            <h4 className="panel-title">Pengaturan Publikasi</h4>

            {/* Status Button Select */}
            <div className="editor-form-group">
              <label className="editor-field-label">Status Tayang</label>
              <div className="status-select-group" role="group" aria-label="Pilih Status Tayang">
                <button
                  type="button"
                  className={`status-btn-opt opt-published ${formData.status === 'published' ? 'is-active' : ''}`}
                  onClick={() => setFormData({ ...formData, status: 'published' })}
                  aria-pressed={formData.status === 'published'}
                >
                  <span className="status-opt-dot dot-published" />
                  <div className="status-opt-text">
                    <span className="status-opt-title">Published</span>
                  </div>
                  {formData.status === 'published' && (
                    <HiOutlineCheck className="status-opt-check" size={15} />
                  )}
                </button>

                <button
                  type="button"
                  className={`status-btn-opt opt-draft ${formData.status === 'draft' ? 'is-active' : ''}`}
                  onClick={() => setFormData({ ...formData, status: 'draft' })}
                  aria-pressed={formData.status === 'draft'}
                >
                  <span className="status-opt-dot dot-draft" />
                  <div className="status-opt-text">
                    <span className="status-opt-title">Draft</span>
                  </div>
                  {formData.status === 'draft' && (
                    <HiOutlineCheck className="status-opt-check" size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Date Picker */}
            <div className="editor-form-group">
              <label className="editor-field-label">Tanggal Terbit</label>
              <div className="input-with-icon">
                <HiOutlineCalendar size={16} className="field-icon" />
                <input
                  type="date"
                  className="editor-input with-icon editor-date-picker"
                  value={datePickerVal}
                  onChange={handleDatePickerChange}
                />
              </div>
              <div className="date-preview-badge">
                <HiOutlineCheck size={13} />
                <span>Format Tayang: <strong>{formData.date}</strong></span>
              </div>
            </div>

            <div className="editor-form-group">
              <label className="editor-field-label">Estimasi Waktu Baca</label>
              <div className="input-with-icon">
                <HiOutlineClock size={16} className="field-icon" />
                <input
                  type="text"
                  className="editor-input with-icon"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                />
              </div>
            </div>

            {/* Highlight Carousel Switch */}
            <div className="hero-highlight-box">
              <label className="highlight-toggle-label">
                <input
                  type="checkbox"
                  checked={formData.isHighlight}
                  onChange={(e) => setFormData({ ...formData, isHighlight: e.target.checked })}
                />
                <div className="toggle-label-content">
                  <div className="toggle-title-row">
                    <HiStar size={17} className={formData.isHighlight ? 'fill-gold' : 'text-muted'} />
                    <strong>Sorotan Hero Carousel</strong>
                  </div>
                  <span className="toggle-sub-hint">
                    Tampilkan artikel di slider hero utama halaman Berita.
                  </span>
                </div>
              </label>

              {formData.isHighlight && (
                <div className="highlight-badge-group">
                  <label className="editor-field-label">Teks Badge Sorotan</label>
                  <input
                    type="text"
                    className="editor-input"
                    placeholder="Contoh: HIGHLIGHT UTAMA"
                    value={formData.highlightBadge}
                    onChange={(e) => setFormData({ ...formData, highlightBadge: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Featured Image Banner Card */}
          <div className="editor-card sidebar-panel-card">
            <div className="card-header-row">
              <h4 className="panel-title">Banner Gambar Utama</h4>
              <HiOutlinePhoto size={16} className="text-muted" />
            </div>

            <div className="editor-form-group">
              <label className="editor-field-label required">URL Gambar</label>
              <input
                type="url"
                className="editor-input"
                placeholder="https://.../gambar.webp"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>

            {/* Presets Grid */}
            <div className="preset-buttons-wrap">
              <span className="preset-strip-title">Preset Dealer Sun Margahayu:</span>
              <div className="presets-flow">
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`btn-dealer-preset ${formData.imageUrl === preset.url ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Banner */}
            {formData.imageUrl && (
              <div className="editor-banner-preview-box">
                <img
                  src={formData.imageUrl}
                  alt="Pratinjau Banner"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="banner-preview-badge">Pratinjau Rasio 16:9</span>
              </div>
            )}
          </div>

          {/* Category & Theme Card */}
          <div className="editor-card sidebar-panel-card">
            <h4 className="panel-title">Kategori & Visual Tag</h4>

            <div className="editor-form-group">
              <label className="editor-field-label">Kategori Artikel</label>
              <select
                className="editor-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {NEWS_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-form-group">
              <label className="editor-field-label">Aksen Warna Tag</label>
              <select
                className="editor-select"
                value={formData.categoryTheme}
                onChange={(e) => setFormData({ ...formData, categoryTheme: e.target.value })}
              >
                <option value="red">Merah (Sporty, Rilis, Peluncuran)</option>
                <option value="yellow">Kuning Emas (Tips, Edukasi, Standar Layanan)</option>
              </select>
            </div>
          </div>

          {/* Logged in User Author Credentials Card */}
          <div className="editor-card sidebar-panel-card">
            <div className="card-header-row">
              <h4 className="panel-title">Kredensial Penulis</h4>
              <HiOutlineUser size={16} className="text-muted" />
            </div>

            <div className="author-login-card">
              <div className="author-login-avatar">
                {loggedInUserName.slice(0, 2).toUpperCase()}
              </div>
              <div className="author-login-info">
                <span className="author-login-name">{loggedInUserName}</span>
                <span className="author-login-role">{loggedInUserRole}</span>
                <span className="author-login-status-badge">
                  <HiOutlineCheck size={11} /> Akun Login Aktif
                </span>
              </div>
            </div>

            <p className="field-sub-hint" style={{ marginTop: '0.25rem' }}>
              Artikel otomatis dikaitkan dengan profil akun pengguna yang sedang login saat ini di Portal Dealer.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL: GENERATE ARTIKEL DENGAN AI (SECURE BACKEND SERVICE)
          ==================================================================== */}
      {isAiModalOpen && (
        <div className="portal-modal-backdrop" onClick={() => !isGeneratingAi && setIsAiModalOpen(false)}>
          <div className="portal-modal-container ai-generate-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ai-modal-header">
              <div className="ai-modal-title-box">
                <div className="ai-modal-icon-badge">
                  <HiOutlineSparkles size={20} />
                </div>
                <div>
                  <h3 className="ai-modal-title">Generate Artikel dengan AI</h3>
                  <div className="ai-modal-meta-row">
                    <span className="ai-model-tag">Sunny AI Assistant</span>
                    <span className="ai-meta-sep">•</span>
                    <span className="ai-meta-desc">Backend Secure Service</span>
                  </div>
                </div>
              </div>

              {!isGeneratingAi && (
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsAiModalOpen(false)}
                  aria-label="Tutup modal AI"
                >
                  <HiOutlineXMark size={20} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="ai-modal-body">
              {aiError && (
                <div className="ai-modal-error-alert">
                  <HiOutlineExclamationTriangle size={18} />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="editor-form-group">
                <label className="editor-field-label required">
                  Konteks, Topik, Informasi, atau Draf Mentah Artikel
                </label>
                <textarea
                  rows={6}
                  className="editor-textarea ai-prompt-textarea"
                  placeholder="Ketik topik, poin-poin informasi, ringkasan rilis pers, atau draf artikel di sini...&#10;&#10;Contoh: Kami sedang meluncurkan program promo servis berkala awal tahun di Sun Star Prima Motor Margahayu. Diskon jasa 20%, gratis oli mesin 1 liter untuk Xpander dan Pajero Sport, gratis cek 20 titik keselamatan, dan gratis uji emisi..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGeneratingAi}
                />
                <span className="field-sub-hint">
                  AI akan secara adaptif menyesuaikan panjang artikel sesuai konteks Anda (ringkas jika konteks sedikit, detail & mendalam jika panjang) dan menyusun tata letak kaya format (subtitle, list, kutipan, tabel data, dan penekanan teks) secara variatif.
                </span>
              </div>

              {/* Template Quick Suggestions */}
              <div className="ai-quick-templates">
                <span className="quick-templates-title">Pilih Contoh Topik Cepat:</span>
                <div className="quick-templates-wrap">
                  {[
                    { label: '🚀 Rilis Unit Baru', text: 'Peluncuran resmi unit New Mitsubishi XForce Hybrid di dealer Sun Star Prima Motor Margahayu. Highlight efisiensi bahan bakar 24,5 km/liter, 4 drive modes, interior audio Yamaha, dan penawaran DP mulai 15% serta bunga 0%.' },
                    { label: '🔧 Promo Servis Dealer', text: 'Program promo servis berkala Sun Margahayu bulan ini. Paket diskon jasa servis 20%, gratis cek 20 titik keselamatan, gratis uji emisi, dan diskon sparepart orisinal 10% untuk seluruh model kendaraan Mitsubishi.' },
                    { label: '🛡️ Tips Rawat Transmisi CVT', text: 'Tips merawat transmisi otomatis CVT mobil Mitsubishi agar awet dan responsif. Penjelasan interval penggantian oli transmisi resmi, cara mengemudi yang benar saat tanjakan, dan pentingnya servis di bengkel resmi bergaransi.' },
                    { label: '✨ Fasilitas Body & Paint', text: 'Layanan bengkel perbaikan bodi dan cat (Body & Paint) berstandar pabrikan di Sun Margahayu dengan fasilitas oven steril bertekanan positif, formulasi cat water-based ramah lingkungan, dan garansi kilau 6 bulan.' }
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      className="btn-quick-template"
                      onClick={() => setAiPrompt(tpl.text)}
                      disabled={isGeneratingAi}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generating Progress State */}
              {isGeneratingAi && (
                <div className="ai-generating-progress-card">
                  <div className="ai-pulsing-spinner">
                    <HiOutlineSparkles size={22} className="spin-icon" />
                  </div>
                  <div className="ai-progress-text-col">
                    <span className="ai-progress-stage">{aiStage}</span>
                    <span className="ai-progress-hint">Mohon tunggu beberapa detik, Sunny AI sedang menyusun artikel berkualitas tinggi...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="ai-modal-footer">
              <button
                type="button"
                className="btn-portal-secondary"
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGeneratingAi}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-portal-ai-generate"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi || !aiPrompt.trim()}
              >
                <HiOutlineSparkles size={18} />
                <span>{isGeneratingAi ? 'Sedang Men-generate...' : 'Generate Artikel Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL SISIPKAN GAMBAR (INSERT IMAGE)
          ==================================================================== */}
      {isInsertImageModalOpen && (
        <div className="portal-modal-backdrop" onClick={() => setIsInsertImageModalOpen(false)}>
          <div className="portal-modal-container insert-image-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ai-modal-header">
              <div className="ai-modal-title-box">
                <div className="image-modal-icon-badge">
                  <HiOutlinePhoto size={20} />
                </div>
                <div>
                  <h3 className="ai-modal-title">Sisipkan Gambar ke Paragraf</h3>
                  <span className="ai-meta-desc">Format otomatis tersimpan sebagai [img:URL]</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsInsertImageModalOpen(false)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="ai-modal-body">
              <div className="editor-form-group">
                <label className="editor-field-label required">Link / URL Gambar (WebP, JPG, PNG)</label>
                <input
                  type="url"
                  className="editor-input"
                  placeholder="https://cssunmotor.com/wp-content/uploads/... atau https://images.unsplash.com/..."
                  value={insertImageUrl}
                  onChange={(e) => {
                    setInsertImageUrl(e.target.value)
                    setImagePreviewError(false)
                  }}
                  autoFocus
                />
                <span className="field-sub-hint">
                  Pastikan link gambar dapat diakses secara publik (contoh website resmi Sun Motor atau CDN).
                </span>
              </div>

              <div className="editor-form-group">
                <label className="editor-field-label">Keterangan / Caption Gambar (Opsional)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="Contoh: Tampak samping New Mitsubishi Xforce Ultimate..."
                  value={insertImageCaption}
                  onChange={(e) => setInsertImageCaption(e.target.value)}
                />
              </div>

              {/* Quick Sample Image Presets */}
              <div className="quick-image-samples">
                <span className="quick-image-title">Pilih Contoh Cepat:</span>
                <div className="quick-image-pills">
                  {[
                    {
                      label: 'Asset CS Sun Motor',
                      url: 'https://cssunmotor.com/wp-content/uploads/asset_6adf19096f23f3.46940972.webp',
                      caption: 'Asset Unit Sun Star Prima Motor'
                    },
                    {
                      label: 'Fasilitas Bengkel',
                      url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
                      caption: 'Fasilitas Bengkel Resmi Sun Margahayu'
                    },
                    {
                      label: 'Showroom Dealer',
                      url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80',
                      caption: 'Showroom Mitsubishi Sun Margahayu Bekasi'
                    }
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      className="btn-quick-image-sample"
                      onClick={() => {
                        setInsertImageUrl(sample.url)
                        setInsertImageCaption(sample.caption)
                        setImagePreviewError(false)
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Image Preview Box */}
              {insertImageUrl.trim() && (
                <div className="modal-image-preview-card">
                  <span className="preview-label">Live Preview Gambar:</span>
                  <div className="modal-preview-img-wrap">
                    {!imagePreviewError ? (
                      <img
                        src={insertImageUrl.trim()}
                        alt="Preview"
                        className="modal-preview-img"
                        onError={() => setImagePreviewError(true)}
                      />
                    ) : (
                      <div className="modal-preview-error">
                        <HiOutlineExclamationTriangle size={24} />
                        <span>Gambar tidak dapat dimuat dari URL ini. Silakan periksa kembali tautan.</span>
                      </div>
                    )}
                  </div>
                  {insertImageCaption.trim() && !imagePreviewError && (
                    <div className="modal-preview-caption">
                      <HiOutlinePhoto size={14} />
                      <span>{insertImageCaption.trim()}</span>
                    </div>
                  )}
                  <div className="syntax-code-preview">
                    <span className="syntax-label">Akan disisipkan sebagai:</span>
                    <code>
                      {insertImageCaption.trim()
                        ? `[img:${insertImageUrl.trim()}|${insertImageCaption.trim()}]`
                        : `[img:${insertImageUrl.trim()}]`}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="ai-modal-footer">
              <button
                type="button"
                className="btn-portal-secondary"
                onClick={() => {
                  setInsertImageUrl('')
                  setInsertImageCaption('')
                  setImagePreviewError(false)
                  setIsInsertImageModalOpen(false)
                }}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-portal-primary"
                onClick={handleInsertImageIntoContent}
                disabled={!insertImageUrl.trim() || imagePreviewError}
              >
                <HiOutlinePhoto size={18} />
                <span>Sisipkan ke Artikel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL EDUKASI & PANDUAN FORMAT MARKDOWN
          ==================================================================== */}
      {isMarkdownGuideModalOpen && (
        <div className="portal-modal-backdrop" onClick={() => setIsMarkdownGuideModalOpen(false)}>
          <div className="portal-modal-container markdown-guide-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ai-modal-header">
              <div className="ai-modal-title-box">
                <div className="guide-modal-icon-badge">
                  <HiOutlineQuestionMarkCircle size={22} />
                </div>
                <div>
                  <h3 className="ai-modal-title">Panduan Format Editorial Markdown</h3>
                  <span className="ai-meta-desc">Format penulisan yang didukung penuh oleh portal berita dealer</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsMarkdownGuideModalOpen(false)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="ai-modal-body guide-modal-body">
              <p className="guide-intro">
                Gunakan sintaks sederhana berikut di dalam textarea untuk menghasilkan tata letak editorial yang kaya, rapi, dan variatif:
              </p>

              <div className="guide-grid">
                {/* Card 1: Sisipkan Gambar */}
                <div className="guide-card highlight-card">
                  <div className="guide-card-head">
                    <HiOutlinePhoto size={18} />
                    <h4>1. Sisipkan Gambar di Tengah Paragraf</h4>
                  </div>
                  <p className="guide-card-desc">
                    Gunakan sintaks <code>[img:URL]</code> atau tambahkan keterangan foto dengan garis pipa <code>|</code>:
                  </p>
                  <pre className="guide-code-block">[img:https://cssunmotor.com/wp-content/uploads/asset_6adf19096f23f3.46940972.webp]&#10;[img:https://link-gambar.com/foto.webp|Keterangan Foto]</pre>
                </div>

                {/* Card 2: Sub-Judul */}
                <div className="guide-card">
                  <div className="guide-card-head">
                    <span className="guide-icon-pill">H2 / H3</span>
                    <h4>2. Sub-Judul / Heading</h4>
                  </div>
                  <p className="guide-card-desc">Gunakan tanda pagar untuk memecah sub-topik:</p>
                  <pre className="guide-code-block">## Keunggulan Mesin Turbo MIVEC&#10;### Spesifikasi Transmisi CVT</pre>
                </div>

                {/* Card 3: Kutipan Editorial */}
                <div className="guide-card">
                  <div className="guide-card-head">
                    <span className="guide-icon-pill">&gt;</span>
                    <h4>3. Kutipan Editorial (Quote)</h4>
                  </div>
                  <p className="guide-card-desc">Awali dengan tanda <code>&gt;</code> dan sertakan nama tokoh:</p>
                  <pre className="guide-code-block">&gt; "Kepuasan servis pelanggan adalah prioritas kami." — Service Manager Sun Margahayu</pre>
                </div>

                {/* Card 4: Tabel Data Perbandingan */}
                <div className="guide-card">
                  <div className="guide-card-head">
                    <span className="guide-icon-pill">Table</span>
                    <h4>4. Tabel Data & Spesifikasi</h4>
                  </div>
                  <p className="guide-card-desc">Gunakan garis pipa <code>|</code> untuk membuat tabel data:</p>
                  <pre className="guide-code-block">| Varian | Transmisi | Diskon Servis |&#10;| --- | --- | --- |&#10;| Exceed | CVT | 20% Jasa |&#10;| Ultimate | CVT 7-Spd | Gratis Oli 1L |</pre>
                </div>

                {/* Card 5: Poin & Nomor */}
                <div className="guide-card">
                  <div className="guide-card-head">
                    <span className="guide-icon-pill">• 1.</span>
                    <h4>5. Daftar Poin & Nomor</h4>
                  </div>
                  <p className="guide-card-desc">Daftar benefit atau langkah prosedur berurutan:</p>
                  <pre className="guide-code-block">- Poin keunggulan pertama&#10;- Poin keunggulan kedua&#10;&#10;1. Hubungi sales konsultan&#10;2. Jadwalkan test drive</pre>
                </div>

                {/* Card 6: Penekanan & Tautan */}
                <div className="guide-card">
                  <div className="guide-card-head">
                    <span className="guide-icon-pill">B / I</span>
                    <h4>6. Tebal, Miring, & Link</h4>
                  </div>
                  <p className="guide-card-desc">Penekanan teks dan tautan resmi:</p>
                  <pre className="guide-code-block">**Teks Tebal** dan *Teks Miring*&#10;[Klik Unduh Brosur](https://mitsubishi-motors.co.id)</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="ai-modal-footer">
              <button
                type="button"
                className="btn-portal-primary"
                onClick={() => setIsMarkdownGuideModalOpen(false)}
              >
                Mengerti, Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
