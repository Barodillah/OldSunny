import { useState, useEffect } from 'react'
import {
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiSparkles,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineCheck,
  HiOutlineArrowPath,
  HiArrowRight
} from 'react-icons/hi2'
import { RiSteering2Line } from 'react-icons/ri'
import { getActiveSessionId } from '../utils/sunnySessionStorage.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format IDR currency if vehicle only has raw minPrice
const formatIDR = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

/**
 * Reusable Test Drive Reservation Modal Component
 *
 * @param {Object} props
 * @param {Object} props.vehicle - Vehicle object { name, imageUrl|image, priceFormatted|minPrice, id }
 * @param {boolean} props.isOpen - Modal open status
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} [props.onSelectTestDrive] - Callback to transition to AI Sunny chat
 * @param {string} [props.source='Website - Test Drive Popup'] - Lead tracking source
 */
export default function TestDriveModal({
  vehicle,
  isOpen,
  onClose,
  onSelectTestDrive,
  source = 'Website - Test Drive Popup'
}) {
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locationType: 'home',
    preferredDate: '',
  })

  // Reset state when opening a new vehicle or closing
  useEffect(() => {
    if (isOpen) {
      setFormSuccess(false)
      setErrorMessage('')
      setIsSubmitting(false)
      setFormData({
        name: '',
        phone: '',
        locationType: 'home',
        preferredDate: '',
      })
    }
  }, [isOpen, vehicle])

  // ESC key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !vehicle) return null

  const vehicleName = vehicle.name || 'Mitsubishi Vehicle'
  const vehicleImage = vehicle.imageUrl || vehicle.image || 'https://csdwindo.com/media/mmksi/destinator.png'
  const vehiclePrice = vehicle.priceFormatted || (vehicle.minPrice ? formatIDR(vehicle.minPrice) : 'Harga Menyesuaikan Tipe')

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const locationLabel = formData.locationType === 'home'
      ? 'Diantar ke Rumah / Kantor'
      : 'Di Showroom Sun Margahayu'

    const payload = {
      session_id: getActiveSessionId() || null,
      type: 'test_drive',
      customer_name: formData.name.trim(),
      customer_phone: formData.phone.trim(),
      vehicle_model: vehicleName,
      source: source,
      notes: `Permintaan Jadwal Test Drive: ${vehicleName}.\nLokasi: ${locationLabel}${formData.preferredDate ? `\nRencana Jadwal: ${formData.preferredDate}` : ''
        }`,
      data: {
        location_type: formData.locationType,
        location_label: locationLabel,
        preferred_date: formData.preferredDate || null,
        vehicle_id: vehicle.id || null,
        vehicle_name: vehicleName,
        vehicle_price: vehiclePrice
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (response.ok && result.success) {
        setFormSuccess(true)
      } else {
        setErrorMessage(result.message || 'Gagal mengirimkan jadwal test drive. Silakan coba kembali.')
      }
    } catch (err) {
      console.error('Error submitting test drive lead:', err)
      setErrorMessage('Terjadi kendala jaringan saat mengirim jadwal test drive. Silakan coba kembali.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiBridgeClick = () => {
    // Susun prompt kontekstual sesuai unit kendaraan dan data form yang sudah diisi pengguna
    const trimmedName = formData.name?.trim()
    const locDesc = formData.locationType === 'showroom'
      ? 'di Showroom Sun Margahayu'
      : 'diantar ke Rumah/Kantor'

    let contextualQuery = trimmedName
      ? `Halo Sunny, saya ${trimmedName}. Saya ingin tanya informasi jadwal & persyaratan test drive untuk Mitsubishi ${vehicleName}. Apakah unit siap diuji coba (${locDesc}) dan bagaimana prosedur reservasinya?`
      : `Halo Sunny, saya ingin tahu ketersediaan unit dan persyaratan test drive untuk Mitsubishi ${vehicleName} (${locDesc}). Apakah unit siap diuji coba dan apa saja syaratnya?`

    if (formData.preferredDate) {
      const formattedDate = formData.preferredDate.replace('T', ' jam ')
      contextualQuery += ` (Rencana jadwal uji jalan saya: ${formattedDate})`
    }

    // 1. Tutup modal test drive agar layar fokus ke AI chat flyout
    onClose()

    // 2. Kirim Custom Event ke Sunny AI Floating
    window.dispatchEvent(
      new CustomEvent('sunny_ask_question', {
        detail: {
          query: contextualQuery,
          vehicle,
          source: 'test_drive_modal'
        }
      })
    )

    // 3. Fallback callback jika halaman induk (e.g. Home / FeaturedVehicles) menanganinya
    if (onSelectTestDrive) {
      onSelectTestDrive({
        ...vehicle,
        query: contextualQuery,
        title: `Test Drive ${vehicleName}`
      })
    } else {
      // Fallback tombol trigger bawaan jika event belum terdaftar
      const triggerBtn = document.querySelector('.assistant-trigger-btn')
      if (triggerBtn && !document.querySelector('.chat-flyout')) {
        triggerBtn.click()
      }
    }
  }

  return (
    <div
      className="vehicle-modal-backdrop"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-drive-modal-title"
    >
      <div
        className="vehicle-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="vehicle-modal-header">
          <div className="modal-header-badge">
            <RiSteering2Line size={18} className="text-accent-red" />
            <span id="test-drive-modal-title">Reservasi Test Drive</span>
          </div>
          <button
            type="button"
            className="vehicle-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup Dialog Reservasi"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="vehicle-modal-body">
          {/* Selected Vehicle Banner */}
          <div className="modal-vehicle-summary">
            <img
              src={vehicleImage}
              alt={vehicleName}
              className="modal-vehicle-img"
            />
            <div className="modal-vehicle-meta">
              <h4 className="modal-vehicle-title">{vehicleName}</h4>
              <p className="modal-vehicle-price">Mulai {vehiclePrice}</p>
            </div>
          </div>

          {formSuccess ? (
            <div className="modal-success-state">
              <div className="success-icon-box">
                <HiOutlineCheck size={44} className="text-emerald-500" />
              </div>
              <h4 className="success-title">Permintaan Test Drive Terkirim!</h4>
              <p className="success-desc">
                Terima kasih, <strong>{formData.name || 'Bpk/Ibu'}</strong>. Tim konsultan resmi Sun Margahayu
                akan segera menghubungi Anda untuk konfirmasi jadwal uji jalan {vehicleName}.
              </p>
              <button
                type="button"
                className="btn-modal-done"
                onClick={onClose}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Uji Jalan *</label>
                <div className="location-toggle-row">
                  <button
                    type="button"
                    className={`location-toggle-btn ${formData.locationType === 'home' ? 'is-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'home' })}
                    disabled={isSubmitting}
                  >
                    <HiOutlineMapPin size={16} />
                    <span>Diantar ke Rumah / Kantor</span>
                  </button>
                  <button
                    type="button"
                    className={`location-toggle-btn ${formData.locationType === 'showroom' ? 'is-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationType: 'showroom' })}
                    disabled={isSubmitting}
                  >
                    <HiOutlineShieldCheck size={16} />
                    <span>Di Showroom Sun Margahayu</span>
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* AI Quick Consultation Alternative CTA */}
              <div className="modal-ai-bridge-wrap">
                <div className="modal-ai-bridge-divider">
                  <span>atau butuh jawaban instan?</span>
                </div>
                <button
                  type="button"
                  className="btn-ai-bridge"
                  onClick={handleAiBridgeClick}
                  disabled={isSubmitting}
                  aria-label={`Tanya Asisten AI Sunny mengenai Test Drive ${vehicleName}`}
                >
                  <div className="ai-bridge-icon-box">
                    <HiSparkles size={20} className="ai-bridge-sparkle" />
                  </div>
                  <div className="ai-bridge-text">
                    <div className="ai-bridge-headline">
                      <span className="ai-bridge-title">Tanya Langsung ke Asisten AI Sunny</span>
                      <span className="ai-bridge-badge">Respon Instan</span>
                    </div>
                  </div>
                  <div className="ai-bridge-arrow">
                    <HiArrowRight size={18} />
                  </div>
                </button>
              </div>

              {/* Error Alert Feedback */}
              {errorMessage && (
                <div className="modal-error-alert" role="alert">
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Modal Footer Submit */}
              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="submit-loading-text">
                      <HiOutlineArrowPath className="spin-icon" size={16} />
                      <span>Mengirim Permintaan...</span>
                    </span>
                  ) : (
                    'Konfirmasi Jadwal Test Drive'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
