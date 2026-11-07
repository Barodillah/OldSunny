import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronDown,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import {
  getPageFaqs,
  resolveCanonicalFaqKey,
  getDynamicSeoGeneratedAt,
} from '../utils/seo.js'
import './DynamicFaqSection.css'

const ROUTE_FAQ_META = {
  '/': {
    badge: 'FAQ & Transparansi Resmi',
    title: 'Pertanyaan Umum Dealer & Layanan Resmi',
    subtitle:
      'Jawaban berikut disinkronkan secara dinamis dari database operasional Mitsubishi Sun Star Prima Motor Margahayu Bekasi.',
  },
  '/vehicles': {
    badge: 'Informasi Harga OTR & Varian',
    title: 'Pertanyaan Umum Katalog & Harga Mobil',
    subtitle:
      'Ringkasan harga OTR Bekasi, penyesuaian warna khusus, serta program gratis servis berkala langsung dari database price list aktif.',
  },
  '/promo': {
    badge: 'Program Penawaran Aktif',
    title: 'Pertanyaan Umum Promo, Kredit & Trade-In',
    subtitle:
      'Informasi program bunga 0%, DP ringan, subsidi tukar tambah, dan promo purnajual yang sedang aktif di database dealer.',
  },
  '/booking': {
    badge: 'Panduan Bengkel Resmi',
    title: 'Pertanyaan Umum Booking Servis & Paket SMART',
    subtitle:
      'Rincian harga Extended SMART Package, estimasi perawatan berkala 10.000 - 100.000 KM, serta prosedur reservasi bengkel.',
  },
  '/service-on-road': {
    badge: 'Siaga Darurat 24/7',
    title: 'Pertanyaan Umum Layanan Darurat Service on Road',
    subtitle:
      'Informasi cakupan wilayah bantuan mekanik darurat di jalan, jumper aki, dan koordinasi towing resmi 24 jam.',
  },
  '/facilities': {
    badge: 'Panduan Kunjungan Showroom',
    title: 'Pertanyaan Umum Seputar Fasilitas Dealer',
    subtitle:
      'Informasi layanan gratis Noach Coffee, Free Shuttle Service, Kids Zone, Authorized Body & Paint, serta program event showroom aktif.',
  },
  '/accessories': {
    badge: 'Suku Cadang & Aksesoris Asli',
    title: 'Pertanyaan Umum Aksesoris Resmi & Genuine Parts',
    subtitle:
      'Daftar harga paket Mitsubishi Genuine Accessories (MGA) serta suku cadang fast-moving resmi dari database gudang.',
  },
  '/sales': {
    badge: 'Verifikasi Wiraniaga Sah',
    title: 'Pertanyaan Umum Direktori Sales & Anti-Penipuan',
    subtitle:
      'Data jumlah dan daftar Sales Consultant aktif serta arsip personel nonaktif diperbarui langsung dari database SDM dealer.',
  },
  '/organization': {
    badge: 'Tata Kelola & Kepemimpinan',
    title: 'Pertanyaan Umum Struktur Organisasi Cabang',
    subtitle:
      'Susunan jajaran pimpinan cabang, manajer divisi, dan supervisor aktif PT Sun Star Prima Motor Margahayu.',
  },
  '/news': {
    badge: 'Pusat Edukasi Otomotif',
    title: 'Pertanyaan Umum Berita & Publikasi Resmi',
    subtitle:
      'Informasi publikasi artikel terbaru, panduan perawatan kendaraan, dan diskusi interaktif bersama Sunny AI.',
  },
  '/contact': {
    badge: 'Saluran Komunikasi Resmi',
    title: 'Pertanyaan Umum Kontak Divisi & Pengaduan CSM',
    subtitle:
      'Panduan menghubungi nomor WhatsApp resmi Sales, Booking Servis, Hotline Darurat 24 Jam, dan Customer Satisfaction Manager.',
  },
}

const SKIP_PATHS = new Set(['/faq', '/faqs', '/search'])

export default function DynamicFaqSection({ onOpenAiChat }) {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/+$/, '') || '/'
  const canonicalKey = resolveCanonicalFaqKey(pathname)

  const [faqs, setFaqs] = useState(() => getPageFaqs(pathname))
  const [generatedAt, setGeneratedAt] = useState(() => getDynamicSeoGeneratedAt())
  const [openIndex, setOpenIndex] = useState(0)

  useEffect(() => {
    setFaqs(getPageFaqs(pathname))
    setGeneratedAt(getDynamicSeoGeneratedAt())
    setOpenIndex(0)
  }, [pathname])

  useEffect(() => {
    const handleUpdate = () => {
      setFaqs(getPageFaqs(pathname))
      setGeneratedAt(getDynamicSeoGeneratedAt())
    }
    window.addEventListener('sunny-dynamic-seo-updated', handleUpdate)
    return () => {
      window.removeEventListener('sunny-dynamic-seo-updated', handleUpdate)
    }
  }, [pathname])

  if (
    SKIP_PATHS.has(pathname) ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/news/') ||
    pathname.startsWith('/article/') ||
    pathname.startsWith('/error/')
  ) {
    return null
  }

  if (!faqs || faqs.length === 0) {
    return null
  }

  const meta = ROUTE_FAQ_META[canonicalKey] || ROUTE_FAQ_META['/']
  const faqHubUrl =
    canonicalKey && canonicalKey !== '/'
      ? `/faq?category=${encodeURIComponent(canonicalKey)}`
      : '/faq'

  const toggleIndex = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx))
  }

  return (
    <section
      className="dynamic-faq-section"
      aria-label={meta.title}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="dynamic-faq-container">
        <div className="dynamic-faq-header">
          <div className="dynamic-faq-badge-row">
            <span className="dynamic-faq-pill">{meta.badge}</span>
            <span className="dynamic-faq-live-tag">
              <HiOutlineCheckBadge size={15} />
              <span>Data Live Updated</span>
            </span>
          </div>
          <h2 className="dynamic-faq-title">{meta.title}</h2>
          <p className="dynamic-faq-subtitle">{meta.subtitle}</p>
        </div>

        <div className="dynamic-faq-list" role="region" aria-label="Daftar Pertanyaan Umum">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx
            const triggerId = `dyn-faq-trigger-${idx}`
            const panelId = `dyn-faq-panel-${idx}`

            return (
              <div
                key={item.q || idx}
                className={`dynamic-faq-item ${isOpen ? 'is-open' : ''}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  id={triggerId}
                  className="dynamic-faq-trigger"
                  onClick={() => toggleIndex(idx)}
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
                              id: `faq_${canonicalKey}_${idx}`,
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

        <div className="dynamic-faq-bottom-actions">
          <Link to={faqHubUrl} className="dynamic-faq-main-cta">
            <span>Lihat Semua Pertanyaan di Pusat FAQ</span>
            <HiOutlineArrowRight size={16} />
          </Link>
          {onOpenAiChat && (
            <button
              type="button"
              className="dynamic-faq-secondary-ai-btn"
              onClick={() =>
                onOpenAiChat({
                  id: `faq_general_${canonicalKey}`,
                  title: meta.title,
                })
              }
            >
              <HiOutlineChatBubbleLeftRight size={16} />
              <span>Tanya Langsung ke Sunny AI 24/7</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
