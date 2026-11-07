import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronDown,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckBadge,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowUpRight,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'
import {
  getAllDynamicFaqsGrouped,
  getDynamicSeoGeneratedAt,
} from '../utils/seo.js'
import '../components/DynamicFaqSection.css'
import './FaqPage.css'

export default function FaqPage({ onOpenAiChat }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [groupedFaqs, setGroupedFaqs] = useState(() => getAllDynamicFaqsGrouped())
  const [generatedAt, setGeneratedAt] = useState(() => getDynamicSeoGeneratedAt())
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [openKey, setOpenKey] = useState('0-0')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const paramCat = searchParams.get('category')
    if (paramCat) {
      setSelectedCategory(paramCat)
    } else {
      setSelectedCategory('all')
    }
  }, [searchParams])

  useEffect(() => {
    const handleSeoUpdate = () => {
      setGroupedFaqs(getAllDynamicFaqsGrouped())
      setGeneratedAt(getDynamicSeoGeneratedAt())
    }
    window.addEventListener('sunny-dynamic-seo-updated', handleSeoUpdate)
    return () => {
      window.removeEventListener('sunny-dynamic-seo-updated', handleSeoUpdate)
    }
  }, [])

  const handleSelectCategory = (key) => {
    setSelectedCategory(key)
    setOpenKey('0-0')
    if (key === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: key })
    }
  }

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return groupedFaqs
      .filter((group) => selectedCategory === 'all' || group.key === selectedCategory)
      .map((group) => {
        if (!q) return group
        const matchedItems = group.items.filter(
          (item) =>
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q)
        )
        return {
          ...group,
          items: matchedItems,
        }
      })
      .filter((group) => group.items.length > 0)
  }, [groupedFaqs, selectedCategory, searchQuery])

  const totalQuestionsCount = useMemo(() => {
    return groupedFaqs.reduce((acc, group) => acc + group.items.length, 0)
  }, [groupedFaqs])

  const toggleItem = (compositeKey) => {
    setOpenKey((prev) => (prev === compositeKey ? null : compositeKey))
  }

  return (
    <main
      className="faq-page-main"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="faq-page-container">
        <header className="dynamic-faq-header faq-page-hero-header">
          <div className="dynamic-faq-badge-row">
            <span className="dynamic-faq-pill">Pusat Bantuan & Transparansi Resmi</span>
            <span className="dynamic-faq-live-tag">
              <HiOutlineCheckBadge size={15} />
              <span>
                Sinkronisasi Database Real-Time ({totalQuestionsCount} Pertanyaan
                {generatedAt ? ` • ${generatedAt}` : ''})
              </span>
            </span>
          </div>

          <h1 className="dynamic-faq-title faq-page-main-title">
            Pusat Pertanyaan Umum (FAQ) Mitsubishi Sun Margahayu
          </h1>
          <p className="dynamic-faq-subtitle">
            Temukan jawaban terverifikasi langsung dari database operasional PT Sun Star Prima Motor
            seputar harga OTR terbaru, promo kredit, paket servis SMART, suku cadang asli, hingga
            verifikasi rekening sah BCA 3425419999.
          </p>

          <div className="faq-page-search-box">
            <HiOutlineMagnifyingGlass size={20} className="faq-page-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan seputar harga OTR, bunga 0%, servis berkala, atau rekening resmi..."
              className="faq-page-search-input"
              aria-label="Cari pertanyaan di Pusat FAQ"
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-page-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus kata kunci pencarian"
              >
                <HiOutlineXMark size={18} />
              </button>
            )}
          </div>

          <nav className="faq-page-category-tabs" aria-label="Filter Kategori FAQ">
            <button
              type="button"
              className={`faq-page-cat-tab ${selectedCategory === 'all' ? 'is-active' : ''}`}
              onClick={() => handleSelectCategory('all')}
            >
              Semua Topik ({totalQuestionsCount})
            </button>
            {groupedFaqs.map((group) => (
              <button
                key={group.key}
                type="button"
                className={`faq-page-cat-tab ${selectedCategory === group.key ? 'is-active' : ''}`}
                onClick={() => handleSelectCategory(group.key)}
              >
                {group.label} ({group.items.length})
              </button>
            ))}
          </nav>
        </header>

        {filteredGroups.length === 0 ? (
          <div className="faq-page-empty-state">
            <HiOutlineQuestionMarkCircle size={40} className="faq-page-empty-icon" />
            <h2 className="faq-page-empty-title">Pertanyaan Tidak Ditemukan</h2>
            <p className="faq-page-empty-desc">
              Tidak ada pertanyaan yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;. Silakan
              reset pencarian atau tanyakan langsung kepada asisten virtual Sunny AI.
            </p>
            <div className="dynamic-faq-bottom-actions">
              <button
                type="button"
                className="dynamic-faq-main-cta"
                onClick={() => {
                  setSearchQuery('')
                  handleSelectCategory('all')
                }}
              >
                <span>Tampilkan Semua Pertanyaan</span>
              </button>
              {onOpenAiChat && (
                <button
                  type="button"
                  className="dynamic-faq-secondary-ai-btn"
                  onClick={() =>
                    onOpenAiChat({
                      id: 'faq_custom_search',
                      title: searchQuery || 'Pertanyaan Konsumen di Pusat FAQ',
                    })
                  }
                >
                  <HiOutlineChatBubbleLeftRight size={16} />
                  <span>Tanyakan ke Sunny AI 24/7</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="faq-page-groups-stack">
            {filteredGroups.map((group, gIdx) => (
              <section
                key={group.key}
                className="faq-page-group-block"
                aria-label={group.label}
              >
                <div className="faq-page-group-header">
                  <h2 className="faq-page-group-title">{group.label}</h2>
                  <Link to={group.path} className="faq-page-group-link">
                    <span>Buka Halaman Terkait</span>
                    <HiOutlineArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="dynamic-faq-list">
                  {group.items.map((item, iIdx) => {
                    const compositeKey = `${gIdx}-${iIdx}`
                    const isOpen = openKey === compositeKey
                    const triggerId = `faq-page-trigger-${gIdx}-${iIdx}`
                    const panelId = `faq-page-panel-${gIdx}-${iIdx}`

                    return (
                      <div
                        key={item.q || compositeKey}
                        className={`dynamic-faq-item ${isOpen ? 'is-open' : ''}`}
                        itemScope
                        itemProp="mainEntity"
                        itemType="https://schema.org/Question"
                      >
                        <button
                          type="button"
                          id={triggerId}
                          className="dynamic-faq-trigger"
                          onClick={() => toggleItem(compositeKey)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                        >
                          <div className="dynamic-faq-q-wrap">
                            <HiOutlineQuestionMarkCircle size={20} className="dynamic-faq-icon" />
                            <span itemProp="name">{item.q}</span>
                          </div>
                          <HiOutlineChevronDown className="dynamic-faq-chevron" aria-hidden="true" />
                        </button>

                        <div
                          id={panelId}
                          className="dynamic-faq-collapse"
                          role="region"
                          aria-labelledby={triggerId}
                          itemScope
                          itemProp="acceptedAnswer"
                          itemType="https://schema.org/Answer"
                        >
                          <div className="dynamic-faq-collapse-inner">
                            <p className="dynamic-faq-answer" itemProp="text">
                              {item.a}
                            </p>
                            {onOpenAiChat && (
                              <div className="dynamic-faq-item-footer">
                                <button
                                  type="button"
                                  className="dynamic-faq-ask-ai-btn"
                                  onClick={() =>
                                    onOpenAiChat({
                                      id: `faq_hub_${group.key}_${iIdx}`,
                                      title: item.q,
                                    })
                                  }
                                >
                                  <HiOutlineChatBubbleLeftRight size={15} />
                                  <span>Tanyakan Lebih Detail ke Sunny AI</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="faq-page-support-card">
          <div className="faq-page-support-badge">
            <HiOutlineShieldCheck size={18} />
            <span>Garansi Layanan Resmi PT Sun Star Prima Motor</span>
          </div>
          <h3 className="faq-page-support-title">
            Butuh Simulasi Spesifik atau Bantuan Langsung?
          </h3>
          <p className="faq-page-support-desc">
            Asisten virtual Sunny AI dan tim Customer Satisfaction Manager (CSM) kami siap membantu
            Anda 24 jam penuh untuk simulasi kredit, jadwal servis, maupun verifikasi keamanan
            transaksi.
          </p>
          <div className="dynamic-faq-bottom-actions">
            {onOpenAiChat && (
              <button
                type="button"
                className="dynamic-faq-main-cta"
                onClick={() =>
                  onOpenAiChat({
                    id: 'faq_page_support',
                    title: 'Konsultasi Langsung dari Pusat FAQ',
                  })
                }
              >
                <HiOutlineChatBubbleLeftRight size={17} />
                <span>Mulai Konsultasi dengan Sunny AI 24/7</span>
              </button>
            )}
            <Link to="/contact" className="dynamic-faq-secondary-ai-btn">
              <span>Hubungi Kontak Resmi & CSM</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

