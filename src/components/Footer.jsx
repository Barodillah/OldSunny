import { Link } from 'react-router-dom'
import {
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineChevronUp,
  HiOutlineCheckBadge
} from 'react-icons/hi2'

const currentYear = new Date().getFullYear()

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer className="dealer-footer" role="contentinfo" aria-label="Informasi Showroom dan Kontak Dealer">
      {/* 1. Official Transaction & Anti-Fraud Security Notice */}
      <div className="footer-security-banner">
        <div className="footer-container footer-security-inner">
          <div className="footer-security-left">
            <span className="footer-security-icon-wrap" aria-hidden="true">
              <HiOutlineShieldCheck className="footer-security-icon" />
            </span>
            <div className="footer-security-text">
              <strong className="footer-security-title">
                Peringatan Transaksi Resmi & Anti-Penipuan
              </strong>
              <p className="footer-security-desc">
                Seluruh pembayaran tanda jadi, uang muka (DP), dan pelunasan hanya sah jika ditransfer ke rekening resmi atas nama{' '}
                <strong>PT Sun Star Prima Motor (Bank BCA: 3425419999)</strong>. Dealer tidak bertanggung jawab atas pembayaran ke rekening pribadi wiraniaga.
              </p>
            </div>
          </div>
          <div className="footer-security-badge">
            <HiOutlineCheckBadge className="footer-badge-icon" aria-hidden="true" />
            <span>Rekening Resmi Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer - Clean, Simple 3-Column Layout */}
      <div className="footer-main-area">
        <div className="footer-container footer-grid-clean">
          {/* Kolom 1: Brand & Navigasi */}
          <div className="footer-clean-col footer-col-brand">
            <Link to="/" className="footer-brand-logo" aria-label="Kembali ke Beranda Sun Margahayu">
              <img
                src="https://bewhy.id/wp-content/uploads/url_6acf112141e379.21076281.webp"
                onError={(e) => {
                  e.currentTarget.src = '/logo-brand.webp'
                }}
                alt="Sun Margahayu Brand Logo"
                className="footer-logo-img"
              />
              <div className="footer-brand-meta">
                <span className="footer-brand-name">Sunny</span>
                <span className="footer-brand-tagline">Mitsubishi Sun Margahayu</span>
              </div>
            </Link>

            <p className="footer-brand-desc">
              Dealer resmi dan bengkel terpadu Sun Margahayu. Melayani penjualan unit baru, servis berkala berstandar pabrikan, dan penyediaan suku cadang orisinal.
            </p>

            <nav className="footer-inline-nav" aria-label="Navigasi Footer">
              <Link to="/">Beranda</Link>
              <span className="footer-nav-sep" aria-hidden="true">•</span>
              <Link to="/vehicles">Kendaraan</Link>
              <span className="footer-nav-sep" aria-hidden="true">•</span>
              <Link to="/about">Tentang</Link>
              <span className="footer-nav-sep" aria-hidden="true">•</span>
              <Link to="/services">Layanan</Link>
              <span className="footer-nav-sep" aria-hidden="true">•</span>
              <Link to="/news">Berita</Link>
              <span className="footer-nav-sep" aria-hidden="true">•</span>
              <Link to="/contact">Kontak</Link>
            </nav>
          </div>

          {/* Kolom 2: Alamat & Kontak Showroom */}
          <div className="footer-clean-col">
            <h4 className="footer-clean-heading">Showroom & Bengkel</h4>
            <p className="footer-clean-address">
              Jl. Ir. H. Juanda No. 35 Bulak Kapal, Bekasi Timur
            </p>

            <div className="footer-clean-contacts">
              <a href="tel:02188347777" className="footer-phone-btn">
                <HiOutlinePhone className="footer-clean-icon" aria-hidden="true" />
                <span>(021) 8834 7777</span>
              </a>

              <a
                href="https://maps.google.com/?q=Jl.+Ir.+H.+Juanda+No.+35+Bulak+Kapal+Bekasi+Timur"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-maps-link"
              >
                <HiOutlineMapPin className="footer-clean-icon" aria-hidden="true" />
                <span>Petunjuk Arah Google Maps</span>
              </a>
            </div>
          </div>

          {/* Kolom 3: Jam Operasional */}
          <div className="footer-clean-col">
            <h4 className="footer-clean-heading">Jam Operasional</h4>
            <div className="footer-schedule-clean">
              <div className="schedule-clean-item">
                <span className="schedule-days">Senin - Jumat</span>
                <span className="schedule-hours">08.30 - 17.00 WIB</span>
              </div>
              <div className="schedule-clean-item">
                <span className="schedule-days">Sabtu</span>
                <span className="schedule-hours">08.30 - 15.00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Minimal Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-container footer-bottom-clean">
          <p className="footer-clean-copyright">
            © {currentYear} Mitsubishi Sun Margahayu. PT Sun Star Prima Motor. Hak cipta dilindungi.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="footer-clean-scroll"
            aria-label="Kembali ke atas"
          >
            <span>Ke Atas</span>
            <HiOutlineChevronUp className="scroll-clean-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
