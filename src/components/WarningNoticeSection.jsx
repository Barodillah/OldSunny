import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineXMark,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2'
import { RiUserUnfollowLine, RiWhatsappLine } from 'react-icons/ri'

gsap.registerPlugin(ScrollTrigger)

const CURRENT_YEAR = new Date().getFullYear()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format tanggal Indonesia
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function WarningNoticeSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCategoryTab, setActiveCategoryTab] = useState('all') // 'all' | 'sales' | 'employee'
  const [counts, setCounts] = useState({ employees: 0, sales: 0, total: 0 })

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

  // Fetch dynamic inactive staff from backend API (synced with PortalInactive)
  const fetchInactiveStaff = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/inactive?type=all`)
      const json = await res.json()
      if (json.success && json.data) {
        const employees = (json.data.employees || []).map((emp) => ({
          id: `emp-${emp.id}`,
          name: emp.name,
          category: 'employee',
          categoryBadge: 'Karyawan',
          formerRole: emp.role || emp.badge || 'Karyawan Staf Dealer',
          formerNik: emp.nik || '-',
          inactiveDate: formatDate(emp.deactivated_at),
          reason: emp.deactivated_reason || 'Resigned / Tidak lagi bekerja di dealer',
          photoUrl: emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
        }))

        const sales = (json.data.sales || []).map((s) => ({
          id: `sales-${s.id}`,
          name: s.name,
          category: 'sales',
          categoryBadge: 'Sales',
          formerRole: s.position || 'Sales Consultant',
          formerNik: s.nik || '-',
          inactiveDate: formatDate(s.deactivated_at),
          reason: s.deactivated_reason || 'Resigned / Tidak lagi bekerja di dealer',
          photoUrl: s.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
        }))

        const combined = [...sales, ...employees]
        setStaffList(combined)
        setCounts(json.counts || { employees: employees.length, sales: sales.length, total: combined.length })
      }
    } catch (err) {
      console.error('Failed to load inactive staff from API:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInactiveStaff()
  }, [fetchInactiveStaff])

  useEffect(() => {
    if (isModalOpen) {
      fetchInactiveStaff()
    }
  }, [isModalOpen, fetchInactiveStaff])

  const filteredInactiveStaff = useMemo(() => {
    return staffList.filter((item) => {
      // 1. Category Tab Filter
      if (activeCategoryTab !== 'all' && item.category !== activeCategoryTab) {
        return false
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.name?.toLowerCase().includes(q)
        const matchNik = item.formerNik?.toLowerCase().includes(q)
        const matchRole = item.formerRole?.toLowerCase().includes(q)
        const matchReason = item.reason?.toLowerCase().includes(q)
        if (!matchName && !matchNik && !matchRole && !matchReason) {
          return false
        }
      }

      return true
    })
  }, [staffList, activeCategoryTab, searchQuery])

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
                  Daftar Sales &amp; Karyawan Nonaktif
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

            {/* Drawer Category Tabs Bar */}
            <div className="warning-drawer-tabs">
              <div className="warning-drawer-pills">
                <button
                  type="button"
                  className={`warning-drawer-tab ${activeCategoryTab === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActiveCategoryTab('all')}
                >
                  Semua ({counts.total || staffList.length})
                </button>
                <button
                  type="button"
                  className={`warning-drawer-tab ${activeCategoryTab === 'sales' ? 'is-active' : ''}`}
                  onClick={() => setActiveCategoryTab('sales')}
                >
                  Sales ({counts.sales || staffList.filter((s) => s.category === 'sales').length})
                </button>
                <button
                  type="button"
                  className={`warning-drawer-tab ${activeCategoryTab === 'employee' ? 'is-active' : ''}`}
                  onClick={() => setActiveCategoryTab('employee')}
                >
                  Karyawan &amp; Manajemen ({counts.employees || staffList.filter((s) => s.category === 'employee').length})
                </button>
              </div>

              <button
                type="button"
                className="warning-drawer-refresh-btn"
                onClick={fetchInactiveStaff}
                disabled={loading}
                title="Muat ulang data dari database dealer"
              >
                <HiOutlineArrowPath size={14} className={loading ? 'spin-fast' : ''} />
                <span>Segarkan Data</span>
              </button>
            </div>

            {/* Drawer Search & Count Bar */}
            <div className="warning-drawer-search-wrap">
              <div className="warning-drawer-search-box">
                <HiOutlineMagnifyingGlass size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama mantan staf, eks NIK, atau posisi..."
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
              <div className="warning-drawer-count">
                Menampilkan <strong>{filteredInactiveStaff.length}</strong> dari <strong>{staffList.length}</strong> data nonaktif
              </div>
            </div>

            {/* Inactive Staff Cards Grid with Photos */}
            <div className="warning-drawer-body">
              {loading && staffList.length === 0 ? (
                <div className="inactive-loading-state">
                  <HiOutlineArrowPath size={32} className="spin-fast" />
                  <p>Memuat arsip data personel nonaktif dari database...</p>
                </div>
              ) : filteredInactiveStaff.length > 0 ? (
                <div className="inactive-staff-grid">
                  {filteredInactiveStaff.map((staff) => (
                    <div key={staff.id} className="inactive-staff-card">
                      <div className="inactive-card-avatar-wrap">
                        <img
                          src={staff.photoUrl}
                          alt={staff.name}
                          className="inactive-card-avatar"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                          }}
                        />
                        <div className="inactive-card-status-badge">
                          NONAKTIF
                        </div>
                      </div>

                      <div className="inactive-card-content">
                        <div className="inactive-card-header">
                          <span className={`inactive-card-cat-badge badge-${staff.category}`}>
                            {staff.categoryBadge}
                          </span>
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
                  <p>
                    {searchQuery
                      ? `Tidak ada personel nonaktif yang sesuai dengan kata kunci "${searchQuery}".`
                      : 'Saat ini belum ada catatan staf atau sales yang dinonaktifkan.'}
                  </p>
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
