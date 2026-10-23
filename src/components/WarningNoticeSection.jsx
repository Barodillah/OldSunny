import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineXMark,
  HiOutlineArrowRight
} from 'react-icons/hi2'
import { RiUserUnfollowLine, RiWhatsappLine } from 'react-icons/ri'

gsap.registerPlugin(ScrollTrigger)

const CURRENT_YEAR = new Date().getFullYear()

// Daftar sampel sales & staf yang sudah tidak aktif / nonaktif resmi dengan foto
const INACTIVE_STAFF_LIST = [
  {
    id: 'inact-1',
    name: 'Agus Pratama',
    formerRole: 'Senior Sales Consultant',
    formerNik: 'SNY-SLS-0199',
    inactiveDate: '15 Januari 2024',
    reason: 'Resigned / Tidak lagi bekerja di Mitsubishi Sun Margahayu',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  {
    id: 'inact-2',
    name: 'Rizky Fauzi',
    formerRole: 'Sales Executive',
    formerNik: 'SNY-SLS-0284',
    inactiveDate: '10 Agustus 2023',
    reason: 'Resigned / Tidak lagi bekerja di Mitsubishi Sun Margahayu',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  {
    id: 'inact-3',
    name: 'Maya Anggraini',
    formerRole: 'Telemarketing & CRM',
    formerNik: 'SNY-SLS-0351',
    inactiveDate: '28 November 2023',
    reason: 'Habis Masa Kontrak Kerja',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  {
    id: 'inact-4',
    name: 'Hendra Saputra',
    formerRole: 'Junior Sales Advisor',
    formerNik: 'SNY-SLS-0490',
    inactiveDate: '05 Maret 2024',
    reason: 'Nonaktif / Surat Keputusan Direksi',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  {
    id: 'inact-5',
    name: 'Dedi Kurniawan',
    formerRole: 'Sales Fleet & Commercial',
    formerNik: 'SNY-SLS-0512',
    inactiveDate: '20 Mei 2024',
    reason: 'Resigned / Tidak lagi memiliki lisensi MMKSI',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
  {
    id: 'inact-6',
    name: 'Siti Rahmawati',
    formerRole: 'Counter Sales Staff',
    formerNik: 'SNY-SLS-0628',
    inactiveDate: '12 September 2024',
    reason: 'Mutasi Luar Kota / Nonaktif dari Dealer',
    photoUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  },
]

export default function WarningNoticeSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sectionRef = useRef(null)
  const marqueeRef = useRef(null)
  const bottomRowRef = useRef(null)

  useEffect(() => {
    if (!sectionRef.current || !marqueeRef.current) return

    const ctx = gsap.context(() => {
      // 1. Running marquee entrance animation
      gsap.fromTo(
        marqueeRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // 2. Bottom Row entrance
      if (bottomRowRef.current) {
        gsap.fromTo(
          bottomRowRef.current,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if (typeof window !== 'undefined' && window.location.hash === '#security-warning') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  // Keyboard Escape listener for drawer & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }

    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  // Listen for open security warning drawer event or URL hash #security-warning
  useEffect(() => {
    const handleOpen = () => {
      setIsModalOpen(true)
    }

    if (window.location.hash === '#security-warning') {
      setIsModalOpen(true)
    }

    const handleHashChange = () => {
      if (window.location.hash === '#security-warning') {
        setIsModalOpen(true)
      }
    }

    window.addEventListener('open_security_warning_drawer', handleOpen)
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('open_security_warning_drawer', handleOpen)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const filteredInactiveStaff = INACTIVE_STAFF_LIST.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formerNik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formerRole.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section
      ref={sectionRef}
      className="warning-notice-section"
      id="security-warning"
      aria-labelledby="warning-giant-heading"
    >
      <div className="warning-notice-container">
        {/* INFINITE RUNNING TEXT MARQUEE LOOP */}
        <div ref={marqueeRef} className="warning-marquee-wrapper" aria-label="WARNING">
          <div className="warning-marquee-track">
            {/* Group 1 */}
            <div className="warning-marquee-group">
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
            </div>
            {/* Group 2 (Duplicate for Seamless Infinite Loop) */}
            <div className="warning-marquee-group" aria-hidden="true">
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
              <span className="warning-marquee-word">WARNING</span>
              <span className="warning-marquee-sep">•</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: LEFT NOTICE, CENTER METADATA, RIGHT CTA */}
        <div ref={bottomRowRef} className="warning-bottom-row">
          {/* Bottom Left: Keterangan Hati-Hati Sales/Karyawan */}
          <div className="warning-left-col">
            <p className="warning-desc-text">
              Waspada penipuan mengatasnamakan sales/karyawan kami. Seluruh transaksi wajib ke rekening resmi <strong>PT Sun Star Prima Motor</strong>.
            </p>
          </div>

          {/* Bottom Center: Secondary Metadata Code */}
          <div className="warning-center-col" aria-hidden="true">
            <span className="warning-meta-dot">•</span>
            <span className="warning-meta-code">SEC // ANTI-FRAUD VERIFICATION {CURRENT_YEAR}</span>
            <span className="warning-meta-dot">•</span>
          </div>

          {/* Bottom Right: CTA Lihat Detail Sales/Karyawan Nonaktif */}
          <div className="warning-right-col">
            <button
              type="button"
              className="warning-btn-inactive"
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
            >
              <RiUserUnfollowLine size={17} />
              <span>Lihat Sales/Karyawan Nonaktif</span>
              <HiOutlineArrowRight size={15} className="warning-btn-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL SCREEN LEFT DRAWER: DAFTAR SALES & KARYAWAN NONAKTIF */}
      {isModalOpen && (
        <div
          className="warning-drawer-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-inactive-title"
        >
          <div
            className="warning-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="warning-drawer-header">
              <div className="warning-drawer-title-group">
                <h3 id="drawer-inactive-title" className="warning-drawer-heading">
                  Daftar Sales & Karyawan Nonaktif
                </h3>
                <p className="warning-drawer-sub">
                  Pihak di bawah ini sudah tidak terafiliasi dengan PT Sun Star Prima Motor Margahayu. Segala bentuk transaksi, janji unit, maupun penerimaan uang di luar kasir resmi adalah <strong>tidak sah</strong>.
                </p>
              </div>
              <button
                type="button"
                className="warning-drawer-close"
                onClick={handleCloseModal}
                aria-label="Tutup Drawer"
              >
                <HiOutlineXMark size={24} />
              </button>
            </div>

            {/* Drawer Search & Count Bar */}
            <div className="warning-drawer-search-wrap">
              <div className="warning-drawer-search-box">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama mantan staf atau eks NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="warning-drawer-input"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Inactive Staff Cards Grid with Photos */}
            <div className="warning-drawer-body">
              {filteredInactiveStaff.length > 0 ? (
                <div className="inactive-staff-grid">
                  {filteredInactiveStaff.map((staff) => (
                    <div key={staff.id} className="inactive-staff-card">
                      <div className="inactive-card-avatar-wrap">
                        <img
                          src={staff.photoUrl}
                          alt={staff.name}
                          className="inactive-card-avatar"
                          loading="lazy"
                        />
                        <div className="inactive-card-status-badge">
                          NONAKTIF
                        </div>
                      </div>

                      <div className="inactive-card-content">
                        <div className="inactive-card-header">
                          <h4 className="inactive-card-name">{staff.name}</h4>
                          <span className="inactive-card-nik">Eks NIK: <strong>{staff.formerNik}</strong></span>
                        </div>

                        <div className="inactive-card-meta-list">
                          <div className="inactive-card-meta-row">
                            <span className="meta-label">Mantan Posisi:</span>
                            <span className="meta-value">{staff.formerRole}</span>
                          </div>
                          <div className="inactive-card-meta-row">
                            <span className="meta-label">Efektif Sejak:</span>
                            <span className="meta-value text-red">{staff.inactiveDate}</span>
                          </div>
                          <div className="inactive-card-meta-row">
                            <span className="meta-label">Status Hubungan:</span>
                            <span className="meta-value text-muted">{staff.reason}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="inactive-empty-state">
                  <p>Tidak ada personel nonaktif yang sesuai dengan kata kunci "{searchQuery}".</p>
                </div>
              )}
            </div>

            {/* Drawer Footer with Compact Official Bank Info & Report Button */}
            <div className="warning-drawer-footer">
              <div className="footer-bank-simple">
                <span className="footer-bank-label">Rekening Resmi Dealer:</span>
                <span className="footer-bank-account">
                  <strong>Bank BCA 3425419999</strong> a.n. <strong>PT Sun Star Prima Motor</strong>
                </span>
              </div>
              <a
                href="https://wa.me/6285183325604?text=Halo%20CS%20Manager%20Mitsubishi%20Sun%20Margahayu,%20saya%20ingin%20verifikasi%20keaslian%20sales/transaksi%20kendaraan."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-report-fraud"
              >
                <RiWhatsappLine size={19} />
                <span>Lapor penawaran mencurigakan (CS Manager)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
