import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TEAM_SHOWCASE = [
  {
    id: 'dkt-tim',
    title: 'Dealer Kaizen Team',
    role: 'Divisi Komersial & Teknis',
    company: 'at Mitsubishi Sun Bekasi®',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad20f3f4c1a78.73235556.jpeg',
  },
  {
    id: 'frontliner-tim',
    title: 'Frontliner Team',
    role: 'Pelayanan & Customer Relations',
    company: 'at Mitsubishi Sun Bekasi®',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e4a127.45708367.jpeg',
  },
  {
    id: 'operational-pelayanan',
    title: 'Operational Pelayanan',
    role: 'Operasional & Layanan Pelanggan',
    company: 'at Mitsubishi Sun Bekasi®',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acd9f987280e1.14368522.jpeg',
  },
]

export default function DealerTeamSection() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [topIndex, setTopIndex] = useState(0)
  const isHoveredRef = useRef(false)
  const isAnimatingRef = useRef(false)

  const count = TEAM_SHOWCASE.length

  // Preload all showcase images for instant seamless rendering
  useEffect(() => {
    TEAM_SHOWCASE.forEach((team) => {
      const img = new Image()
      img.src = team.imageUrl
    })
  }, [])

  // Section entrance animation
  useEffect(() => {
    if (!sectionRef.current || !cardRef.current) return

    const leftContent = cardRef.current.querySelector('.dealer-team-left')
    const viewport = viewportRef.current

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          y: 60,
          opacity: 0,
          scale: 0.96,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      if (leftContent) {
        gsap.fromTo(
          leftContent,
          {
            x: -30,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (viewport) {
        gsap.fromTo(
          viewport,
          {
            y: 40,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            delay: 0.25,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Calculate dynamic step (single item height + gap) to fit exactly 2 visible cards
  const getStep = () => {
    if (!viewportRef.current || !trackRef.current) return 0
    const firstItem = trackRef.current.children[0]
    if (!firstItem) return 0
    const gap = parseFloat(window.getComputedStyle(trackRef.current).gap || '20') || 20
    return firstItem.offsetHeight + gap
  }

  // Set viewport height dynamically to display exactly 2 cards
  const updateViewportHeight = () => {
    if (!viewportRef.current || !trackRef.current) return
    const items = trackRef.current.children
    if (items.length < 3) return
    const cardHeight = items[1].offsetHeight
    const gap = parseFloat(window.getComputedStyle(trackRef.current).gap || '20') || 20
    if (cardHeight > 0) {
      viewportRef.current.style.height = `${cardHeight * 2 + gap}px`
    }
  }

  // Align the track at y = -step immediately whenever index updates or resize occurs
  useLayoutEffect(() => {
    updateViewportHeight()
    const step = getStep()
    if (trackRef.current && step > 0) {
      gsap.set(trackRef.current, { y: -step })
    }
  }, [topIndex])

  // ResizeObserver to keep viewport perfectly scaled across responsive viewports
  useEffect(() => {
    const handleResize = () => {
      updateViewportHeight()
      const step = getStep()
      if (trackRef.current && !isAnimatingRef.current && step > 0) {
        gsap.set(trackRef.current, { y: -step })
      }
    }

    window.addEventListener('resize', handleResize)
    const ro = new ResizeObserver(handleResize)
    if (viewportRef.current) {
      ro.observe(viewportRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      ro.disconnect()
    }
  }, [])

  // Auto-slide every 2 seconds: Slide top-to-bottom (y moves from -step to 0)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isHoveredRef.current || isAnimatingRef.current) return

      const step = getStep()
      if (!step || !trackRef.current) return

      isAnimatingRef.current = true

      // Animate track down from -step to 0
      gsap.to(trackRef.current, {
        y: 0,
        duration: 0.65,
        ease: 'power2.inOut',
        onComplete: () => {
          // Shift active index backward so items move down in loop
          setTopIndex((prev) => (prev - 1 + count) % count)
          isAnimatingRef.current = false
        },
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [count])

  // Generate 4 items for the track:
  // Item 0: Prepared off-screen above viewport (incoming from top)
  // Item 1: Visible top card
  // Item 2: Visible bottom card
  // Item 3: Prepared off-screen below viewport (outgoing at bottom)
  const trackItems = [
    TEAM_SHOWCASE[(topIndex - 1 + count) % count],
    TEAM_SHOWCASE[topIndex],
    TEAM_SHOWCASE[(topIndex + 1) % count],
    TEAM_SHOWCASE[(topIndex + 2) % count],
  ]

  return (
    <section ref={sectionRef} className="dealer-team-section" id="tim-dealer" aria-labelledby="dealer-team-title">
      {/* Atmospheric Blurred Background Image */}
      <div
        className="dealer-team-bg-blur"
        style={{
          backgroundImage: "url('https://bewhy.id/wp-content/uploads/url_6acf1a837771d8.78886143.jpeg')",
        }}
        aria-hidden="true"
      />
      <div className="dealer-team-bg-overlay" aria-hidden="true" />

      {/* Floating Card Container */}
      <div className="dealer-team-container">
        <div ref={cardRef} className="dealer-team-card">
          {/* LEFT SIDE: EDITORIAL & BRAND MANIFESTO */}
          <div className="dealer-team-left">
            {/* Top Brand Tag */}
            <div className="team-brand-tag">Mitsubishi Sun Bekasi®</div>

            {/* Giant Title */}
            <h2 id="dealer-team-title" className="team-main-heading">
              The team. <span className="team-count-badge">(50+)</span>
            </h2>

            {/* Subtle Crosshairs in Whitespace (Matching Reference) */}
            <div className="team-crosshairs-row" aria-hidden="true">
              <span className="team-crosshair">+</span>
              <span className="team-crosshair">+</span>
            </div>

            {/* Bottom Row: Mission Callout & Manifesto Copy */}
            <div className="team-bottom-row">
              <div className="team-bottom-col team-mission-col">
                <h4 className="team-mission-title">Kenali Tim Kami</h4>
                <p className="team-mission-desc">
                  Pelajari dedikasi, divisi, serta struktur kepemimpinan resmi kami.
                </p>
                <Link to="/organization" className="team-cta-pill-btn" title="Buka Halaman Struktur Organisasi">
                  <span>Struktur Organisasi</span>
                  <span className="cta-dot">•</span>
                </Link>
              </div>

              <div className="team-bottom-col team-manifesto-col">
                <p className="team-manifesto-text">
                  Kami percaya pelayanan terbaik lahir <strong>dari kolaborasi nyata</strong>. Seluruh divisi mulai dari teknisi bengkel resmi bersertifikasi hingga tim frontliner bekerja terpadu untuk memastikan setiap kebutuhan Anda terpenuhi dengan standar tertinggi.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 2 HORIZONTAL PHOTOS (TOP-TO-BOTTOM CONTINUOUS LOOP SLIDER) */}
          <div
            className="dealer-team-right"
            onMouseEnter={() => {
              isHoveredRef.current = true
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false
            }}
          >
            <div ref={viewportRef} className="dealer-team-slider-viewport">
              <div ref={trackRef} className="dealer-team-slider-track">
                {trackItems.map((team, idx) => (
                  <div key={`${team.id}-${idx}`} className="team-photo-card">
                    <img
                      src={team.imageUrl}
                      alt={team.title}
                      className="team-photo-img"
                      loading="eager"
                    />
                    <div className="team-photo-gradient" />

                    {/* Top Overlay Bar */}
                    <div className="team-photo-top-bar">
                      <span className="team-badge-icon" aria-hidden="true">+</span>
                      <span className="team-role-tag">{team.role}</span>
                    </div>

                    {/* Bottom Overlay Bar */}
                    <div className="team-photo-bottom-bar">
                      <h3 className="team-member-name">{team.title}</h3>
                      <span className="team-member-company">{team.company}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
