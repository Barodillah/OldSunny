import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineChevronDown
} from 'react-icons/hi2'
import { openChatHistoryModal } from '../utils/sunnySessionStorage.js'

const NAV_MEGA_MENUS = {
  hospitality: {
    id: 'hospitality',
    title: 'Hospitality',
    acronym: 'H',
    rest: 'ospitality',
    defaultImage: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e4a127.45708367.jpeg',
    links: [
      {
        label: 'Fasilitas Dealer',
        to: '/facilities',
        image: 'https://bewhy.id/wp-content/uploads/asset_6ad2db7cd48d67.36244714.webp'
      },
      {
        label: 'Koleksi Kendaraan',
        to: '/vehicles',
        image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg'
      },
      {
        label: 'Jelajahi Layanan Kami',
        to: '/#layanan',
        sectionId: 'layanan',
        image: 'https://bewhy.id/wp-content/uploads/url_6acf48b4e326b2.90529833.webp'
      }
    ]
  },
  one: {
    id: 'one',
    title: 'One Service Standard',
    acronym: 'O',
    rest: 'ne Service Standard',
    defaultImage: 'https://bewhy.id/wp-content/uploads/asset_6ad20f3f4c1a78.73235556.jpeg',
    links: [
      {
        label: 'Struktur Organisasi & Pimpinan',
        to: '/organization',
        image: 'https://bewhy.id/wp-content/uploads/asset_6ad20f3f4c1a78.73235556.jpeg'
      },
      {
        label: 'Konsultan Sales Bersertifikat',
        to: '/sales',
        image: 'https://bewhy.id/wp-content/uploads/url_6ab0a0964447f8.27266986.png'
      },
      {
        label: 'Sales of The Month',
        to: '/#hall-of-fame',
        sectionId: 'hall-of-fame',
        image: 'https://bewhy.id/wp-content/uploads/url_6ad348bb728297.76754474.jpg'
      },
      {
        label: 'Tim Dealer Resmi',
        to: '/#tim-dealer',
        sectionId: 'tim-dealer',
        image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f987280e1.14368522.jpeg'
      },
      {
        label: 'Peringatan Sales Nonaktif',
        to: '/#security-warning',
        sectionId: 'security-warning',
        image: 'https://bewhy.id/wp-content/uploads/url_6ad348dc577e51.43814009.jpg'
      }
    ]
  },
  memorable: {
    id: 'memorable',
    title: 'Memorable Experience',
    acronym: 'M',
    rest: 'emorable Experience',
    defaultImage: 'https://bewhy.id/wp-content/uploads/url_6acf48c9b8f122.20055577.webp',
    links: [
      {
        label: 'Berita & Update Resmi',
        to: '/news',
        image: 'https://bewhy.id/wp-content/uploads/url_6acf48c9b8f122.20055577.webp'
      },
      {
        label: 'Model Favorit',
        to: '/#kendaraan',
        sectionId: 'kendaraan',
        image: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png'
      },
      {
        label: 'Promo & Event Spesial',
        to: '/promo',
        image: 'https://bewhy.id/wp-content/uploads/url_6ad36ecc0b0961.94264127.webp'
      },
      {
        label: 'Aksesoris Resmi OEM',
        to: '/accessories',
        image: 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
      }
    ]
  },
  empathy: {
    id: 'empathy',
    title: 'Empathy',
    acronym: 'E',
    rest: 'mpathy',
    defaultImage: 'https://bewhy.id/wp-content/uploads/asset_6ad2db7cd48d67.36244714.webp',
    links: [
      {
        label: 'Hubungi Dealer & Lokasi',
        to: '/contact',
        image: 'https://bewhy.id/wp-content/uploads/asset_6ad2db7cd48d67.36244714.webp'
      },
      {
        label: 'Ulasan Konsumen',
        to: '/#google-reviews',
        sectionId: 'google-reviews',
        image: 'https://bewhy.id/wp-content/uploads/asset_6acd9f9872a8a7.97772027.jpeg'
      },
      {
        label: 'Sunny Virtual Assistant 24/7',
        to: '/#sunny-assistant',
        sectionId: 'sunny-assistant',
        image: 'https://bewhy.id/wp-content/uploads/asset_6ad35b160330c6.97658223.png'
      },
      {
        label: 'Riwayat Chat Sunny',
        to: '/#chat-history',
        action: 'chat-history',
        image: 'https://bewhy.id/wp-content/uploads/asset_6ad09424acedb0.44157863.png'
      },
      {
        label: 'Emergency Service',
        to: '/service-on-road',
        image: 'https://bewhy.id/wp-content/uploads/url_6ab0a0771891e7.52336063.webp'
      }
    ]
  }
}

export default function Navbar({ onOpenEmergency }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState(null)
  const [hoveredImage, setHoveredImage] = useState(null)
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null)
  const location = useLocation()
  const closeTimeoutRef = useRef(null)
  const navContainerRef = useRef(null)

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset mega menu & mobile drawer on route change
  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setActiveMegaMenu(null)
    setHoveredImage(null)
    setIsOpen(false)
  }

  // Close menu on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const scrollToSection = (id) => {
    setIsOpen(false)
    setActiveMegaMenu(null)
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    const elem = document.getElementById(id)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Open mega menu with preview image default
  const handleMenuHoverOpen = (menuKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setActiveMegaMenu(menuKey)
    if (NAV_MEGA_MENUS[menuKey]) {
      setHoveredImage(NAV_MEGA_MENUS[menuKey].links[0]?.image || NAV_MEGA_MENUS[menuKey].defaultImage)
    }
  }

  // Schedule close on mouse leave
  const handleMenuHoverLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
      setHoveredImage(null)
    }, 220)
  }

  // Check if current route is part of a menu
  const isMenuRouteActive = (menuKey) => {
    const path = location.pathname
    if (menuKey === 'hospitality') {
      return path === '/facilities' || path === '/fasilitas' || path === '/vehicles' || path === '/vehicle-list' || path === '/services'
    }
    if (menuKey === 'one') {
      return path === '/organization' || path === '/about' || path === '/struktur-organisasi' || path === '/sales' || path === '/sales-list'
    }
    if (menuKey === 'memorable') {
      return path === '/news' || path.startsWith('/news/') || path.startsWith('/article/')
    }
    if (menuKey === 'empathy') {
      return path === '/contact'
    }
    return false
  }

  const isTransparent = location.pathname === '/' && !isScrolled && !activeMegaMenu

  const currentMegaData = activeMegaMenu ? NAV_MEGA_MENUS[activeMegaMenu] : null

  return (
    <header
      ref={navContainerRef}
      className={`minimal-header ${isTransparent && !isOpen ? 'is-merged' : 'is-scrolled'} ${activeMegaMenu ? 'has-megamenu-open' : ''} ${isOpen ? 'is-mobile-open' : ''}`}
      onMouseLeave={handleMenuHoverLeave}
    >
      <div className="minimal-header-container">
        {/* Brand Logo with supplied image */}
        <Link to="/" className="minimal-brand" onClick={() => scrollToSection('hero')}>
          <img
            src="https://bewhy.id/wp-content/uploads/url_6acf112141e379.21076281.webp"
            onError={(e) => {
              e.currentTarget.src = '/logo-brand.webp'
            }}
            alt="Sun Margahayu Brand Logo"
            className="brand-logo-img"
          />
          <span className="minimal-brand-name">Sunny</span>
        </Link>

        {/* Center / Right Links: Mega Menu Navigation (Desktop) */}
        <nav className="minimal-nav minimal-desktop-nav">
          <ul className="minimal-nav-links">
            {/* 1. HOME (Beranda langsung, tanpa dropdown) */}
            <li className="nav-item-home">
              <Link
                to="/"
                className={`nav-link-home-text ${location.pathname === '/' ? 'is-active' : ''}`}
                onClick={() => scrollToSection('hero')}
                title="Beranda Sunny"
              >
                HOME
              </Link>
            </li>

            {/* 2. Hospitality (H) */}
            <li
              className="nav-item-mega"
              onMouseEnter={() => handleMenuHoverOpen('hospitality')}
            >
              <button
                type="button"
                className={`nav-mega-trigger ${activeMegaMenu === 'hospitality' ? 'is-open' : ''} ${isMenuRouteActive('hospitality') ? 'is-route-active' : ''}`}
                onClick={() => {
                  if (activeMegaMenu === 'hospitality') {
                    setActiveMegaMenu(null)
                  } else {
                    handleMenuHoverOpen('hospitality')
                  }
                }}
                aria-expanded={activeMegaMenu === 'hospitality'}
                title="Hospitality - Layanan & Fasilitas Dealer"
              >
                <span className="acronym-letter">H</span><span className="acronym-rest">ospitality</span>
              </button>
            </li>

            {/* 3. One Service Standard (O) - Expand on hover */}
            <li
              className="nav-item-mega"
              onMouseEnter={() => handleMenuHoverOpen('one')}
            >
              <button
                type="button"
                className={`nav-mega-trigger nav-expandable ${activeMegaMenu === 'one' ? 'is-open' : ''} ${isMenuRouteActive('one') ? 'is-route-active' : ''}`}
                onClick={() => {
                  if (activeMegaMenu === 'one') {
                    setActiveMegaMenu(null)
                  } else {
                    handleMenuHoverOpen('one')
                  }
                }}
                aria-expanded={activeMegaMenu === 'one'}
                title="One Service Standard - Standar Integritas & Organisasi"
              >
                <span className="nav-main-part"><span className="acronym-letter">O</span><span className="acronym-rest">ne</span></span>
                <span className="nav-expand-suffix">Service Standard</span>
              </button>
            </li>

            {/* 4. Memorable Experience (M) - Expand on hover */}
            <li
              className="nav-item-mega"
              onMouseEnter={() => handleMenuHoverOpen('memorable')}
            >
              <button
                type="button"
                className={`nav-mega-trigger nav-expandable ${activeMegaMenu === 'memorable' ? 'is-open' : ''} ${isMenuRouteActive('memorable') ? 'is-route-active' : ''}`}
                onClick={() => {
                  if (activeMegaMenu === 'memorable') {
                    setActiveMegaMenu(null)
                  } else {
                    handleMenuHoverOpen('memorable')
                  }
                }}
                aria-expanded={activeMegaMenu === 'memorable'}
                title="Memorable Experience - Berita, Inovasi & Panduan"
              >
                <span className="nav-main-part"><span className="acronym-letter">M</span><span className="acronym-rest">emorable</span></span>
                <span className="nav-expand-suffix">Experience</span>
              </button>
            </li>

            {/* 5. Empathy (E) */}
            <li
              className="nav-item-mega"
              onMouseEnter={() => handleMenuHoverOpen('empathy')}
            >
              <button
                type="button"
                className={`nav-mega-trigger ${activeMegaMenu === 'empathy' ? 'is-open' : ''} ${isMenuRouteActive('empathy') ? 'is-route-active' : ''}`}
                onClick={() => {
                  if (activeMegaMenu === 'empathy') {
                    setActiveMegaMenu(null)
                  } else {
                    handleMenuHoverOpen('empathy')
                  }
                }}
                aria-expanded={activeMegaMenu === 'empathy'}
                title="Empathy - Kontak Langsung & Hotline Bantuan"
              >
                <span className="acronym-letter">E</span><span className="acronym-rest">mpathy</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Right Action Utilities */}
        <div className="minimal-header-actions">
          <button
            type="button"
            className="minimal-action-btn emergency-circle-btn"
            title="Hotline Bantuan Darurat 24 Jam"
            onClick={onOpenEmergency}
          >
            <HiOutlinePhone size={17} />
          </button>

          <Link to="/about" className="minimal-action-btn user-avatar-btn" title="Profil Mitsubishi Sun Margahayu">
            <HiOutlineUser size={18} />
          </Link>

          <button
            type="button"
            className="mobile-hamburger-btn"
            aria-label="Toggle navigasi"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiOutlineXMark size={24} /> : <HiOutlineBars3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Dropdown (Dropdown biasa tanpa gambar) */}
      <div className={`mobile-nav-drawer ${isOpen ? 'is-open' : ''}`} aria-label="Navigasi Mobile">
        <div className="mobile-nav-drawer-inner">
          <Link
            to="/"
            className={`mobile-home-item ${location.pathname === '/' ? 'is-active' : ''}`}
            onClick={() => {
              scrollToSection('hero')
              setIsOpen(false)
            }}
          >
            HOME
          </Link>

          {Object.keys(NAV_MEGA_MENUS).map((key) => {
            const menu = NAV_MEGA_MENUS[key]
            const isExpanded = mobileExpandedSection === key
            const isRouteActive = isMenuRouteActive(key)
            return (
              <div key={key} className="mobile-accordion-group">
                <button
                  type="button"
                  className={`mobile-accordion-header ${isRouteActive ? 'is-active' : ''}`}
                  onClick={() => setMobileExpandedSection(isExpanded ? null : key)}
                >
                  <span>
                    <strong className="acronym-letter">{menu.acronym}</strong>
                    {menu.rest}
                  </span>
                  <HiOutlineChevronDown className={`mobile-accordion-chevron ${isExpanded ? 'is-rotated' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="mobile-accordion-body">
                    {menu.links.map((linkItem, idx) => (
                      <Link
                        key={idx}
                        to={linkItem.to}
                        className={`mobile-accordion-link ${location.pathname === linkItem.to ? 'is-active' : ''}`}
                        onClick={(e) => {
                          if (linkItem.action === 'chat-history') {
                            e.preventDefault()
                            openChatHistoryModal()
                            setIsOpen(false)
                            return
                          }
                          if (linkItem.sectionId && location.pathname === '/') {
                            e.preventDefault()
                            scrollToSection(linkItem.sectionId)
                          }
                          setIsOpen(false)
                        }}
                      >
                        {linkItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* MEGA MENU DROPDOWN PANEL (DESKTOP) */}
      {currentMegaData && (
        <div
          className="megamenu-panel"
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current)
            }
          }}
          onMouseLeave={handleMenuHoverLeave}
        >
          <div className="megamenu-inner-container">
            <div className="megamenu-grid">
              {/* LEFT COLUMN: Clean Car / Facility Preview Photo */}
              <div className="megamenu-preview-col">
                <div className="megamenu-photo-stage">
                  <img
                    key={hoveredImage || currentMegaData.defaultImage}
                    src={hoveredImage || currentMegaData.defaultImage}
                    alt={currentMegaData.title}
                    className="megamenu-preview-image"
                    loading="lazy"
                  />
                  <div className="megamenu-photo-overlay" />
                </div>
              </div>

              {/* RIGHT COLUMN: Minimalist Clean Links List */}
              <div className="megamenu-links-col">
                <nav className="megamenu-links-nav" aria-label={`Submenu ${currentMegaData.title}`}>
                  {currentMegaData.links.map((item, idx) => {
                    const isLinkActive = location.pathname === item.to
                    return (
                      <Link
                        key={idx}
                        to={item.to}
                        className={`megamenu-link ${isLinkActive ? 'is-active' : ''}`}
                        onMouseEnter={() => setHoveredImage(item.image)}
                        onClick={(e) => {
                          if (item.action === 'chat-history') {
                            e.preventDefault()
                            openChatHistoryModal()
                            setActiveMegaMenu(null)
                            return
                          }
                          if (item.sectionId && location.pathname === '/') {
                            e.preventDefault()
                            scrollToSection(item.sectionId)
                          }
                          setActiveMegaMenu(null)
                        }}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

