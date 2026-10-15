import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TEAM_SHOWCASE = [
  {
    id: 'dkt-tim',
    title: 'DKT Tim',
    role: 'Divisi Komersial & Teknis',
    company: 'at Mitsubishi Sun Bekasi®',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e51235.21441135.jpeg',
  },
  {
    id: 'frontliner-tim',
    title: 'Frontliner Tim',
    role: 'Pelayanan & Customer Relations',
    company: 'at Mitsubishi Sun Bekasi®',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6acfe735e4a127.45708367.jpeg',
  },
]

export default function DealerTeamSection() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!sectionRef.current || !cardRef.current) return

    const photos = cardRef.current.querySelectorAll('.team-photo-card')
    const leftContent = cardRef.current.querySelector('.dealer-team-left')

    const ctx = gsap.context(() => {
      // 1. White container card entrance
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

      // 2. Left content subtle slide-in
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

      // 3. Right 2 photos staggered entrance
      if (photos.length > 0) {
        gsap.fromTo(
          photos,
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
            stagger: 0.2,
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
                <Link to="/about" className="team-cta-pill-btn" title="Buka Halaman Struktur Organisasi">
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

          {/* RIGHT SIDE: 2 HORIZONTAL PHOTOS (ATAS & BAWAH, RATIO 2:3 HORIZONTAL) */}
          <div className="dealer-team-right">
            {TEAM_SHOWCASE.map((team) => (
              <div key={team.id} className="team-photo-card">
                <img
                  src={team.imageUrl}
                  alt={team.title}
                  className="team-photo-img"
                  loading="lazy"
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
    </section>
  )
}
