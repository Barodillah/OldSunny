import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRight,
  HiOutlinePhone
} from 'react-icons/hi2'
import { RiAlertLine, RiUserUnfollowLine, RiWhatsappLine } from 'react-icons/ri'

gsap.registerPlugin(ScrollTrigger)

// Daftar sampel sales & staf yang sudah tidak aktif / nonaktif resmi
const INACTIVE_STAFF_LIST = [
  {
    id: 'inact-1',
    name: 'Agus Pratama',
    formerRole: 'Senior Sales Consultant',
    formerBranch: 'Showroom BSD City',
    formerNik: 'SNY-SLS-0199',
    inactiveDate: '15 Januari 2024',
    reason: 'Resigned / Tidak lagi bekerja di Mitsubishi Sun Bekasi',
  },
  {
    id: 'inact-2',
    name: 'Rizky Fauzi',
    formerRole: 'Sales Executive',
    formerBranch: 'Showroom Pusat Sudirman',
    formerNik: 'SNY-SLS-0284',
    inactiveDate: '10 Agustus 2023',
    reason: 'Resigned / Tidak lagi bekerja di Mitsubishi Sun Bekasi',
  },
  {
    id: 'inact-3',
    name: 'Maya Anggraini',
    formerRole: 'Telemarketing & CRM',
    formerBranch: 'Showroom Kelapa Gading',
    formerNik: 'SNY-SLS-0351',
    inactiveDate: '28 November 2023',
    reason: 'Habis Masa Kontrak Kerja',
  },
  {
    id: 'inact-4',
    name: 'Hendra Saputra',
    formerRole: 'Junior Sales Advisor',
    formerBranch: 'Showroom Puri Indah',
    formerNik: 'SNY-SLS-0490',
    inactiveDate: '05 Maret 2024',
    reason: 'Nonaktif / Surat Keputusan Direksi',
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

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const filteredInactiveStaff = INACTIVE_STAFF_LIST.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formerNik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formerBranch.toLowerCase().includes(searchQuery.toLowerCase())
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
            <span className="warning-meta-code">SEC // ANTI-FRAUD VERIFICATION {new Date().getFullYear()}</span>
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

      {/* MODAL: DAFTAR SALES & KARYAWAN NONAKTIF */}
      {isModalOpen && (
        <div
          className="warning-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-inactive-title"
        >
          <div
            className="warning-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="warning-modal-header">
              <div className="warning-modal-title-group">
                <div className="warning-modal-badge">
                  <RiAlertLine size={16} />
                  <span>Direktori Pencegahan Penipuan</span>
                </div>
                <h3 id="modal-inactive-title" className="warning-modal-heading">
                  Daftar Sales & Karyawan Nonaktif
                </h3>
                <p className="warning-modal-sub">
                  Pihak di bawah ini sudah tidak lagi terafiliasi dengan Mitsubishi Sun Bekasi dan tidak memiliki wewenang untuk transaksi, janji unit, maupun penerimaan dana.
                </p>
              </div>
              <button
                type="button"
                className="warning-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup Dialog"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="warning-modal-search-box">
              <HiOutlineMagnifyingGlass size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama mantan staf, NIK lama, atau cabang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="warning-modal-input"
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

            {/* Inactive Staff Table / List */}
            <div className="warning-modal-list-body">
              {filteredInactiveStaff.length > 0 ? (
                <div className="inactive-staff-table">
                  {filteredInactiveStaff.map((staff) => (
                    <div key={staff.id} className="inactive-staff-row">
                      <div className="inactive-staff-primary">
                        <div className="inactive-staff-name-wrap">
                          <span className="inactive-staff-name">{staff.name}</span>
                          <span className="inactive-status-pill">STATUS: NONAKTIF</span>
                        </div>
                        <div className="inactive-staff-meta">
                          <span>Mantan Posisi: <strong>{staff.formerRole}</strong></span>
                          <span>•</span>
                          <span>Cabang Terakhir: <strong>{staff.formerBranch}</strong></span>
                        </div>
                      </div>

                      <div className="inactive-staff-secondary">
                        <span className="inactive-nik-label">Eks NIK: <strong>{staff.formerNik}</strong></span>
                        <span className="inactive-date-label">Efektif Sejak: {staff.inactiveDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="inactive-empty-state">
                  <p>Tidak ada personel nonaktif yang sesuai dengan kata kunci pencarian.</p>
                </div>
              )}
            </div>

            {/* Bank Security Disclaimer Box */}
            <div className="warning-security-box">
              <div className="security-box-header">
                <HiOutlineShieldCheck size={20} className="text-emerald" />
                <h4>Rekening Resmi PT Sun Star Prima Motor</h4>
              </div>
              <p className="security-box-text">
                Mitsubishi Sun Bekasi tidak pernah mengizinkan transaksi tunai di luar kasir showroom maupun transfer ke rekening pribadi atas nama perorangan. Seluruh pembayaran wajib ke rekening resmi:
              </p>
              <div className="security-bank-pill">
                <strong>Bank BCA • No. Rek: 3425419999</strong> a.n. <strong>PT Sun Star Prima Motor</strong>
              </div>
            </div>

            {/* Modal Footer Callout */}
            <div className="warning-modal-footer">
              <span className="footer-callout-text">
                Menemukan penawaran mencurigakan?
              </span>
              <a
                href="https://wa.me/6281289001234?text=Halo%20Tim%20Keamanan%20Mitsubishi%20Sun%20Bekasi,%20saya%20ingin%20verifikasi%20keaslian%20sales/transaksi%20kendaraan."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-report-fraud"
              >
                <RiWhatsappLine size={18} />
                <span>Lapor & Verifikasi ke Hotline Resmi (24/7)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
