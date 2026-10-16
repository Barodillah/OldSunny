import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineCheck
} from 'react-icons/hi2'
import { RiSteering2Line, RiCarLine } from 'react-icons/ri'

const FEATURED_VEHICLES = [
  {
    id: 'new-xforce',
    name: 'NEW XFORCE',
    priceFormatted: 'Rp 388.000.000',
    imageUrl: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png',
  },
  {
    id: 'destinator',
    name: 'DESTINATOR',
    priceFormatted: 'Rp 402.000.000',
    imageUrl: 'https://csdwindo.com/media/mmksi/destinator.png',
  },
  {
    id: 'new-xpander-cross',
    name: 'NEW XPANDER CROSS',
    priceFormatted: 'Rp 348.000.000',
    imageUrl: 'https://csdwindo.com/media/mmksi/xpander_cross.webp',
  },
]

export default function FeaturedVehiclesSection({ onSelectTestDrive }) {
  const [activeModalVehicle, setActiveModalVehicle] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locationType: 'home',
    preferredDate: '',
  })

  const handleOpenTestDriveModal = (vehicle) => {
    setActiveModalVehicle(vehicle)
    setFormSuccess(false)
    setFormData({
      name: '',
      phone: '',
      locationType: 'home',
      preferredDate: '',
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setFormSuccess(true)
  }

  return (
    <section className="featured-vehicles-section" id="kendaraan">
      {/* Background Ambient Video (Muted, Autoplay, Loop, PlaysInline) */}
      <div className="featured-video-bg-wrap" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="featured-video-bg-media"
        >
          <source
            src="https://bewhy.id/wp-content/uploads/url_6acb321e18d7d3.92845255.mp4"
            type="video/mp4"
          />
        </video>
        <div className="featured-video-overlay" />
      </div>

      <div className="featured-vehicles-container">
        {/* Section Header */}
        <div className="featured-vehicles-header">
          <div className="featured-header-left">
            <h2 className="featured-vehicles-title">
              Pilihan Favorit
            </h2>
            <p className="featured-vehicles-desc">
              Pilihan varian resmi dengan harga transparan dan ketersediaan unit uji jalan siap diantar.
            </p>
          </div>

          <div className="featured-header-right">
            <Link to="/vehicles" className="explore-all-link" title="Jelajahi Semua Model">
              <span>Explore All</span>
              <HiOutlineArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3 Main Vehicles Grid (Clean & Focused) */}
        <div className="featured-vehicles-grid">
          {FEATURED_VEHICLES.map((vehicle) => (
            <article key={vehicle.id} className="vehicle-card">
              {/* Visual Showcase */}
              <div className="vehicle-visual-wrapper">
                <div className="vehicle-image-stage">
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="vehicle-img"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div className="vehicle-body">
                <div className="vehicle-heading-group">
                  <h3 className="vehicle-model-name">{vehicle.name}</h3>
                </div>

                {/* Minimal Price Box */}
                <div className="vehicle-price-box">
                  <span className="price-label">Mulai Dari</span>
                  <span className="price-amount">{vehicle.priceFormatted}</span>
                </div>

                {/* Single Focused CTA */}
                <div className="vehicle-actions-row">
                  <button
                    type="button"
                    className="btn-testdrive-primary"
                    onClick={() => handleOpenTestDriveModal(vehicle)}
                  >
                    <RiSteering2Line size={19} />
                    <span>Test Drive</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile-only Explore All Link Bar */}
        <div className="featured-mobile-explore-wrap">
          <Link to="/services" className="explore-all-btn-mobile">
            <RiCarLine size={18} />
            <span>Lihat Semua Katalog Kendaraan (Explore All)</span>
            <HiOutlineArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Test Drive Reservation Modal */}
      {activeModalVehicle && (
        <div
          className="vehicle-modal-backdrop"
          onClick={() => setActiveModalVehicle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="vehicle-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="vehicle-modal-header">
              <div className="modal-header-badge">
                <RiSteering2Line size={18} className="text-accent-red" />
                <span>Reservasi Test Drive</span>
              </div>
              <button
                type="button"
                className="vehicle-modal-close"
                onClick={() => setActiveModalVehicle(null)}
                aria-label="Tutup Dialog"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="vehicle-modal-body">
              {/* Selected Vehicle Banner */}
              <div className="modal-vehicle-summary">
                <img
                  src={activeModalVehicle.imageUrl}
                  alt={activeModalVehicle.name}
                  className="modal-vehicle-img"
                />
                <div className="modal-vehicle-meta">
                  <h4 className="modal-vehicle-title">{activeModalVehicle.name}</h4>
                  <p className="modal-vehicle-price">Mulai {activeModalVehicle.priceFormatted}</p>
                </div>
              </div>

              {formSuccess ? (
                <div className="modal-success-state">
                  <div className="success-icon-box">
                    <HiOutlineCheck size={44} className="text-emerald-500" />
                  </div>
                  <h4 className="success-title">Permintaan Test Drive Terkirim!</h4>
                  <p className="success-desc">
                    Terima kasih, <strong>{formData.name || 'Bpk/Ibu'}</strong>. Tim konsultan resmi Sunny
                    akan segera menghubungi Anda untuk konfirmasi jadwal uji jalan {activeModalVehicle.name}.
                  </p>
                  <button
                    type="button"
                    className="btn-modal-done"
                    onClick={() => setActiveModalVehicle(null)}
                  >
                    Selesai & Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="testdrive-form">
                  <div className="form-group">
                    <label htmlFor="td-name" className="form-label">
                      Nama Lengkap *
                    </label>
                    <input
                      id="td-name"
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="td-phone" className="form-label">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      id="td-phone"
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lokasi Uji Jalan *</label>
                    <div className="location-toggle-row">
                      <button
                        type="button"
                        className={`location-toggle-btn ${formData.locationType === 'home' ? 'is-selected' : ''}`}
                        onClick={() => setFormData({ ...formData, locationType: 'home' })}
                      >
                        <HiOutlineMapPin size={16} />
                        <span>Diantar ke Rumah / Kantor</span>
                      </button>
                      <button
                        type="button"
                        className={`location-toggle-btn ${formData.locationType === 'showroom' ? 'is-selected' : ''}`}
                        onClick={() => setFormData({ ...formData, locationType: 'showroom' })}
                      >
                        <HiOutlineShieldCheck size={16} />
                        <span>Di Showroom Sunny</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="td-date" className="form-label">
                      Rencana Tanggal & Waktu
                    </label>
                    <div className="input-with-icon">
                      <HiOutlineCalendarDays size={18} className="input-prefix-icon" />
                      <input
                        id="td-date"
                        type="datetime-local"
                        className="form-input has-prefix"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* AI Quick Consultation Alternative */}
                  <div className="modal-ai-bridge">
                    <button
                      type="button"
                      className="btn-ai-bridge"
                      onClick={() => {
                        setActiveModalVehicle(null)
                        if (onSelectTestDrive) {
                          onSelectTestDrive(activeModalVehicle)
                        }
                      }}
                    >
                      <HiOutlineSparkles size={16} />
                      <span>Ingin konsultasi langsung via Asisten AI Sunny?</span>
                    </button>
                  </div>

                  {/* Modal Footer Submit */}
                  <div className="modal-actions-footer">
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => setActiveModalVehicle(null)}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn-modal-submit">
                      Konfirmasi Jadwal Test Drive
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
