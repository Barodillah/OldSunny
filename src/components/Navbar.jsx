import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlinePhone
} from 'react-icons/hi2'

export default function Navbar({ onOpenEmergency }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Track window scroll to merge with hero when at top, and become sticky when scrolled
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

  const scrollToSection = (id) => {
    setIsOpen(false)
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    const elem = document.getElementById(id)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isTransparent = location.pathname === '/' && !isScrolled

  return (
    <header className={`minimal-header ${isTransparent ? 'is-merged' : 'is-scrolled'}`}>
      <div className="minimal-header-container">
        {/* Brand Logo with supplied image */}
        <Link to="/" className="minimal-brand" onClick={() => scrollToSection('hero')}>
          <img
            src="https://bewhy.id/wp-content/uploads/url_6acf112141e379.21076281.webp"
            onError={(e) => {
              e.currentTarget.src = '/logo-brand.webp'
            }}
            alt="Sunny Brand Logo"
            className="brand-logo-img"
          />
          <span className="minimal-brand-name">Sunny</span>
        </Link>

        {/* Center / Right Links: Packaging the H.O.M.E Service Standard */}
        <nav className={`minimal-nav ${isOpen ? 'nav-open' : ''}`}>
          <ul className="minimal-nav-links">
            {/* 1. HOME (Text only, italic, slightly larger, no icon or button shape) */}
            <li className="nav-item-home">
              <button
                type="button"
                className="nav-link-home-text"
                onClick={() => scrollToSection('hero')}
                title="Beranda Sunny"
              >
                HOME
              </button>
            </li>

            {/* 2. Hospitality (H) -> Layanan */}
            <li>
              <button
                type="button"
                className="minimal-nav-link nav-acronym-item"
                onClick={() => scrollToSection('layanan')}
                title="Hospitality - Jelajah Layanan Bengkel & Showroom"
              >
                <span className="acronym-letter">H</span>
                <span className="acronym-rest">ospitality</span>
              </button>
            </li>

            {/* 3. One (O) -> One Service Standart -> Transparansi (/about) */}
            <li>
              <Link
                to="/about"
                className="minimal-nav-link nav-expandable nav-acronym-item"
                onClick={() => setIsOpen(false)}
                title="One Service Standard - Transparansi Resmi Mitsubishi Sun Bekasi"
              >
                <span className="nav-main-part">
                  <span className="acronym-letter">O</span>
                  <span className="acronym-rest">ne</span>
                </span>
                <span className="nav-expand-suffix">Service Standard</span>
              </Link>
            </li>

            {/* 4. Memoriable (M) -> Memoriable Experience -> News & Update (/news) */}
            <li>
              <Link
                to="/news"
                className="minimal-nav-link nav-expandable nav-acronym-item"
                onClick={() => setIsOpen(false)}
                title="Memoriable Experience - Berita & Update Sunny"
              >
                <span className="nav-main-part">
                  <span className="acronym-letter">M</span>
                  <span className="acronym-rest">emoriable</span>
                </span>
                <span className="nav-expand-suffix">Experience</span>
              </Link>
            </li>

            {/* 5. Empathy (E) -> Kontak (/contact) */}
            <li>
              <Link
                to="/contact"
                className="minimal-nav-link nav-acronym-item"
                onClick={() => setIsOpen(false)}
                title="Empathy - Kontak Langsung & Bantuan Konsumen"
              >
                <span className="acronym-letter">E</span>
                <span className="acronym-rest">mpathy</span>
              </Link>
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

          <Link to="/about" className="minimal-action-btn user-avatar-btn" title="Profil Mitsubishi Sun Bekasi">
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
    </header>
  )
}
