import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineShieldCheck,
  HiOutlineCalculator,
  HiOutlinePaintBrush,
  HiOutlineArrowRight
} from 'react-icons/hi2'
import { RiCarLine, RiCustomerService2Line } from 'react-icons/ri'

export default function HeroSection({ onSelectService, onSelectEmergency, onSelectTrust, onSelectSunny }) {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const fanRef = useRef(null)
  const ctaRef = useRef(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeDeckIndex, setActiveDeckIndex] = useState(0)

  const handleDeckScroll = (e) => {
    const el = e.currentTarget
    if (!el) return
    const scrollLeft = el.scrollLeft
    const card = el.querySelector('.fanned-card')
    const cardWidth = card ? card.offsetWidth + 16 : 280
    const idx = Math.min(
      Math.max(0, Math.round(scrollLeft / cardWidth)),
      5
    )
    setActiveDeckIndex(idx)
  }

  // 6 Fanned-Out Cards with Unsplash Photography & Clean Typography (Up to Legalitas Dealer)
  const fannedCards = [
    {
      id: 'sunny',
      title: 'SUNNY',
      subtitle: 'Asisten virtual dealer 24 jam',
      icon: RiCustomerService2Line,
      badge: 'ASISTEN 24/7',
      accentColor: '#E3000C',
      imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad35b160330c6.97658223.png',
      angle: -12,
      yOffset: 46,
    },
    {
      id: 'vehicles',
      title: 'Katalog Mobil',
      subtitle: 'Harga OTR resmi transparan',
      icon: RiCarLine,
      badge: 'MOBIL BARU',
      accentColor: '#FDC700',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
      angle: -6,
      yOffset: 12,
    },
    {
      id: 'booking',
      title: 'Booking Servis',
      subtitle: 'Booking slot kalender real-time',
      icon: HiOutlineWrenchScrewdriver,
      badge: 'BENGKEL RESMI',
      accentColor: '#E3000C',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0870ef816.72351873.webp',
      angle: -2,
      yOffset: -6,
    },
    {
      id: 'credit',
      title: 'Simulasi Kredit',
      subtitle: 'DP & angsuran tanpa biaya tersembunyi',
      icon: HiOutlineCalculator,
      badge: 'SIMULASI KREDIT',
      accentColor: '#FDC700',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6ab0a0964447f8.27266986.png',
      angle: 2,
      yOffset: -4,
    },
    {
      id: 'bodypaint',
      title: 'Cat & Body Oven',
      subtitle: 'Reparasi warna standar pabrik',
      icon: HiOutlinePaintBrush,
      badge: 'BODY REPAIR',
      accentColor: '#E3000C',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf19f5415295.43153383.webp',
      angle: 6,
      yOffset: 14,
    },
    {
      id: 'trust',
      title: 'Legalitas Dealer',
      subtitle: 'Rekening resmi & perlindungan konsumen',
      icon: HiOutlineShieldCheck,
      badge: 'BEBAS OKNUM',
      accentColor: '#FDC700',
      imageUrl: 'https://bewhy.id/wp-content/uploads/url_6acf1a837771d8.78886143.jpeg',
      angle: 12,
      yOffset: 48,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })

      tl.from(titleRef.current, { y: 28, opacity: 0, duration: 0.65 })
        .from(fanRef.current?.children || [], {
          y: 50,
          opacity: 0,
          stagger: 0.07,
          duration: 0.65,
          ease: 'back.out(1.2)',
        }, '-=0.35')
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.5 }, '-=0.25')
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="fullscreen-hero-section" id="hero">
      <div className="fullscreen-hero-content">
        {/* Main Centered Headline */}
        <div ref={titleRef} className="reference-hero-header">
          <h1 className="reference-main-title">
            Kami hadir untuk setiap perjalanan Anda.
          </h1>
        </div>

        {/* Center Fanned-Out Cards Showcase with Images */}
        <div ref={fanRef} className="reference-card-deck" onScroll={handleDeckScroll}>
          {fannedCards.map((card, idx) => {
            const Icon = card.icon
            const isHovered = hoveredCard === card.id
            const transformStyle = isHovered
              ? 'translateY(-28px) rotate(0deg)'
              : `translateY(${card.yOffset}px) rotate(${card.angle}deg)`

            return (
              <div
                key={card.id}
                className={`fanned-card card-index-${idx} ${isHovered ? 'is-lifted' : ''}`}
                style={{
                  transform: transformStyle,
                  zIndex: isHovered ? 30 : idx + 1,
                }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  if (card.id === 'sunny') {
                    if (onSelectSunny) onSelectSunny()
                    else {
                      const elem = document.getElementById('sunny-assistant')
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' })
                      else if (onSelectEmergency) onSelectEmergency()
                    }
                  }
                  else if (card.id === 'vehicles') navigate('/vehicles')
                  else if (card.id === 'trust') navigate('/organization')
                  else if (card.id === 'emergency') onSelectEmergency()
                  else onSelectService()
                }}
              >
                <div className="fanned-card-visual">
                  {/* Dedicated Clean Background Image Layer */}
                  <div
                    className="fanned-card-bg"
                    style={{ backgroundImage: `url(${card.imageUrl})` }}
                  />

                  {/* Adaptive Overlay Gradient Layer */}
                  <div className="fanned-card-overlay" />

                  <div className="fanned-card-topbar">
                    <span
                      className="fanned-card-badge"
                      style={{ borderLeftColor: card.accentColor }}
                    >
                      {card.badge}
                    </span>
                    <div className="fanned-icon-circle">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="fanned-card-footer">
                    <h3 className="fanned-card-title">{card.title}</h3>
                    <p className="fanned-card-sub">{card.subtitle}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Touch Indicators */}
        <div className="hero-mobile-deck-indicators">
          <div className="hero-mobile-dots">
            {fannedCards.map((c, i) => (
              <span
                key={c.id}
                className={`hero-mobile-dot ${activeDeckIndex === i ? 'is-active' : ''}`}
                style={activeDeckIndex === i ? { backgroundColor: c.accentColor } : {}}
              />
            ))}
          </div>
          <span className="hero-mobile-swipe-hint">Geser kartu untuk melihat seluruh layanan →</span>
        </div>

        {/* Bottom Centered Subtitle & Dual CTA Pill Buttons */}
        <div ref={ctaRef} className="reference-hero-bottom">
          <p className="reference-hero-subtext">
            Seluruh kebutuhan bengkel, suku cadang asli, hingga kepastian transparansi
            legalitas dealer terpadu dalam satu platform 24/7.
          </p>

          <div className="reference-cta-row">
            <button
              type="button"
              className="btn-pill-dark"
              onClick={onSelectService}
            >
              <span>Eksplorasi Layanan</span>
              <HiOutlineArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn-pill-light"
              onClick={onSelectTrust}
            >
              <span>Pelajari Transparansi</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
