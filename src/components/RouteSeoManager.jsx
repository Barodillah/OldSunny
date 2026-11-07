import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PAGE_SEO_CONFIG,
  updateDocumentMeta,
  DEFAULT_SEO,
  setJsonLd,
  removeJsonLd,
  getAutoDealerSchema,
  getBreadcrumbSchema,
  getPageFaqSchema,
  getVehicleCatalogSchema,
  fetchDynamicSeoData,
} from '../utils/seo.js'

const ERROR_ROUTES = new Set(['/400', '/403', '/404', '/429', '/500', '/503'])

// Synchronizes route metadata, robots directives, and live database-backed Schema.org JSON-LD blocks.
export default function RouteSeoManager() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/+$/, '') || '/'
  const [dynamicTick, setDynamicTick] = useState(0)

  useEffect(() => {
    fetchDynamicSeoData()

    const handleDynamicUpdate = () => {
      setDynamicTick((prev) => prev + 1)
    }

    window.addEventListener('sunny-dynamic-seo-updated', handleDynamicUpdate)
    return () => {
      window.removeEventListener('sunny-dynamic-seo-updated', handleDynamicUpdate)
    }
  }, [])

  useEffect(() => {
    // Article detail routes manage their own dynamic metadata and NewsArticle schema in ArticleDetail.jsx.
    if (pathname.startsWith('/news/') || pathname.startsWith('/article/')) {
      setJsonLd('schema-autodealer', getAutoDealerSchema())
      removeJsonLd('schema-faq')
      removeJsonLd('schema-vehicles')
      return
    }

    removeJsonLd('schema-article')

    if (pathname.startsWith('/portal')) {
      removeJsonLd('schema-autodealer')
      removeJsonLd('schema-breadcrumb')
      removeJsonLd('schema-faq')
      removeJsonLd('schema-vehicles')

      updateDocumentMeta({
        title:
          pathname === '/portal/login'
            ? 'Masuk Portal Manajemen | Mitsubishi Sun Margahayu'
            : 'Portal Manajemen Operasional | Mitsubishi Sun Margahayu',
        description:
          'Sistem operasional internal dealer, analitik leads, Sunny AI, dan manajemen data PT Sun Star Prima Motor Margahayu.',
        type: 'website',
        robots: 'noindex, nofollow',
      })
      return
    }

    if (ERROR_ROUTES.has(pathname) || pathname.startsWith('/error/')) {
      removeJsonLd('schema-breadcrumb')
      removeJsonLd('schema-faq')
      removeJsonLd('schema-vehicles')
      updateDocumentMeta({
        title: 'Halaman Tidak Tersedia | Mitsubishi Sun Margahayu',
        description: DEFAULT_SEO.description,
        type: 'website',
        robots: 'noindex, nofollow',
      })
      return
    }

    setJsonLd('schema-autodealer', getAutoDealerSchema())
    setJsonLd('schema-breadcrumb', getBreadcrumbSchema(pathname))
    setJsonLd('schema-faq', getPageFaqSchema(pathname))

    if (pathname === '/vehicles' || pathname === '/vehicle-list') {
      setJsonLd('schema-vehicles', getVehicleCatalogSchema())
    } else {
      removeJsonLd('schema-vehicles')
    }

    const matchedConfig = PAGE_SEO_CONFIG[pathname]
    if (matchedConfig) {
      updateDocumentMeta({
        ...matchedConfig,
        url: window.location.href,
        type: 'website',
      })
    } else {
      updateDocumentMeta({
        title: DEFAULT_SEO.title,
        description: DEFAULT_SEO.description,
        image: DEFAULT_SEO.image,
        url: window.location.href,
        type: 'website',
        robots: 'noindex, follow',
      })
    }
  }, [pathname, dynamicTick])

  return null
}
