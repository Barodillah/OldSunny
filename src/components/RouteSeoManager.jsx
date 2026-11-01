import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_SEO_CONFIG, updateDocumentMeta, DEFAULT_SEO } from '../utils/seo.js'

/**
 * RouteSeoManager - Listens to route changes and applies corresponding SEO meta data.
 * Skips article detail routes (/news/:slug, /article/:slug) because ArticleDetail.jsx
 * supplies real-time, article-specific meta tags (title, summary, thumbnail).
 */
export default function RouteSeoManager() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    // 1. Article detail routes are handled by ArticleDetail.jsx directly
    if (pathname.startsWith('/news/') || pathname.startsWith('/article/')) {
      return
    }

    // 2. Portal Management routes
    if (pathname.startsWith('/portal')) {
      if (pathname === '/portal/login') {
        updateDocumentMeta({
          title: 'Masuk Portal Manajemen | Mitsubishi Sun Margahayu',
          description: 'Akses masuk portal operasional internal dealer PT Sun Star Motor Margahayu.',
          type: 'website',
        })
      } else {
        updateDocumentMeta({
          title: 'Portal Manajemen Operasional | Mitsubishi Sun Margahayu',
          description: 'Sistem operasional internal dealer, analitik leads, Sunny AI, dan manajemen data Sun Margahayu.',
          type: 'website',
        })
      }
      return
    }

    // 3. Match against static public route configuration
    const matchedConfig = PAGE_SEO_CONFIG[pathname]
    if (matchedConfig) {
      updateDocumentMeta({
        ...matchedConfig,
        url: window.location.href,
        type: 'website',
      })
    } else {
      // 4. Default fallback for unmatched routes
      updateDocumentMeta({
        title: DEFAULT_SEO.title,
        description: DEFAULT_SEO.description,
        image: DEFAULT_SEO.image,
        url: window.location.href,
        type: 'website',
      })
    }
  }, [pathname])

  return null
}

