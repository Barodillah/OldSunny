import { useState, useEffect } from 'react'
import {
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineArrowPath,
  HiSparkles,
  HiArrowRight
} from 'react-icons/hi2'
import { RiShoppingBag3Line } from 'react-icons/ri'
import { getActiveSessionId } from '../utils/sunnySessionStorage.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format IDR currency
const formatIDR = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

/**
 * Reusable Accessory Order / Reservation Modal Component
 *
 * @param {Object} props
 * @param {Object} props.item - Accessory item { item, price, img, categoryLabel }
 * @param {Object} props.vehicle - Vehicle object { name, shortName }
 * @param {boolean} props.isOpen - Modal open status
 * @param {Function} props.onClose - Modal close handler
 * @param {string} [props.source='Website - Form Pesan Aksesoris'] - Lead tracking source
 */
export default function AccessoryOrderModal({
  item,
  vehicle,
  isOpen,
  onClose,
  source = 'Website - Form Pesan Aksesoris'
}) {
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setFormSuccess(false)
      setErrorMessage('')
      setIsSubmitting(false)
      setFormData({
        name: '',
        phone: ''
      })
    }
  }, [isOpen, item])

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

  if (!isOpen || !item) return null

  const vehicleName = vehicle?.name || vehicle?.shortName || 'Kendaraan Mitsubishi'
  const itemName = item.item || 'Aksesoris Resmi'
  const itemPriceFormatted = formatIDR(item.price)
  const itemImage = item.img || 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const payload = {
      session_id: getActiveSessionId() || null,
      type: 'sparepart',
      customer_name: formData.name.trim(),
      customer_phone: formData.phone.trim(),
      vehicle_model: vehicleName,
      source: source,
      notes: `Pemesanan Aksesoris Resmi: ${itemName} (${itemPriceFormatted}).\nModel Kendaraan: ${vehicleName}`,
      data: {
        accessory_name: itemName,
        accessory_price: item.price,
        vehicle_name: vehicleName,
        category: item.categoryLabel || item.categoryType || 'Aksesoris'
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
        setErrorMessage(result.message || 'Gagal mengirimkan pesanan aksesoris. Silakan coba kembali.')
      }
    } catch (err) {
      console.error('Error submitting accessory lead:', err)
      setErrorMessage('Terjadi kendala jaringan saat mengirim pesanan. Silakan coba kembali.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiBridgeClick = () => {
    const trimmedName = formData.name?.trim()
    const contextualQuery = trimmedName
      ? `Halo Sunny, saya ${trimmedName}. Saya ingin tanya informasi ketersediaan stok dan jadwal pemasangan untuk aksesoris "${itemName}" pada mobil ${vehicleName} (${itemPriceFormatted}). Apakah ready di dealer Sun Margahayu?`
      : `Halo Sunny, saya ingin tanya ketersediaan stok dan jadwal pemasangan untuk aksesoris "${itemName}" pada mobil ${vehicleName} (${itemPriceFormatted}). Apakah ready di dealer Sun Margahayu?`

    // Tutup modal agar fokus ke flyout chat
    onClose()

    // Kirim Custom Event ke Sunny AI Floating
    window.dispatchEvent(
      new CustomEvent('sunny_ask_question', {
        detail: {
          query: contextualQuery,
          accessory: item,
          vehicle,
          source: 'accessory_order_modal'
        }
      })
    )
  }

  return (
    <div
      className="vehicle-modal-backdrop"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessory-order-modal-title"
    >
      <div
        className="vehicle-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="vehicle-modal-header">
          <div className="modal-header-badge">
            <RiShoppingBag3Line size={18} className="text-accent-red" />
            <span id="accessory-order-modal-title">Pemesanan Aksesoris Resmi</span>
          </div>
          <button
            type="button"
            className="vehicle-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup Dialog Pemesanan"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="vehicle-modal-body">
          {/* Selected Item Summary */}
          <div className="modal-vehicle-summary">
            <img
              src={itemImage}
              alt={itemName}
              className="modal-vehicle-img"
              onError={(e) => {
                e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/url_6ab0a091597dd8.89523512.webp'
              }}
            />
            <div className="modal-vehicle-meta">
              <h4 className="modal-vehicle-title">{itemName}</h4>
              <p className="modal-vehicle-price">
                {itemPriceFormatted} • <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{vehicleName}</span>
              </p>
            </div>
          </div>

          {formSuccess ? (
            <div className="modal-success-state">
              <div className="success-icon-box">
                <HiOutlineCheck size={44} className="text-emerald-500" />
              </div>
              <h4 className="success-title">Pesanan Aksesoris Terkirim!</h4>
              <p className="success-desc">
                Terima kasih, <strong>{formData.name || 'Bpk/Ibu'}</strong>. Tim sparepart & aksesoris Sun Margahayu
                akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi ketersediaan stok & jadwal instalasi resmi.
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
                <label htmlFor="acc-name" className="form-label">
                  Nama Lengkap *
                </label>
                <input
                  id="acc-name"
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
                <label htmlFor="acc-phone" className="form-label">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  id="acc-phone"
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                />
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
                  aria-label={`Tanya Asisten AI Sunny mengenai ${itemName}`}
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
                      <span>Mengirim Pesanan...</span>
                    </span>
                  ) : (
                    'Konfirmasi Pesan Aksesoris'
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
