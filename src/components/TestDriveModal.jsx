import { useState, useEffect, useMemo } from 'react'
import {
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiSparkles,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineCheck,
  HiOutlineArrowPath,
  HiOutlineClock,
  HiArrowRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowLeft
} from 'react-icons/hi2'
import { RiSteering2Line } from 'react-icons/ri'
import { getActiveSessionId } from '../utils/sunnySessionStorage.js'
import './TestDriveModal.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Showroom Working Hours Time Slots:
// Senin - Sabtu: 08:30 - 18:00 WIB (slot: 09:00 - 17:00)
const WEEKDAY_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
// Minggu: 09:00 - 16:30 WIB (slot: 09:30 - 15:30)
const SUNDAY_SLOTS = ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30']

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const toYYYYMMDD = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDateIndo = (dateStr, fullMonth = false) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dt = new Date(y, m - 1, d)
  const monthName = fullMonth ? MONTH_NAMES_ID[dt.getMonth()] : MONTH_NAMES_ID[dt.getMonth()].substring(0, 3)
  return `${DAY_NAMES_ID[dt.getDay()]}, ${dt.getDate()} ${monthName} ${dt.getFullYear()}`
}

const formatDisplayDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const [datePart, timePart] = dateTimeStr.split('T')
  const dateFormatted = formatDisplayDateIndo(datePart, false)
  return timePart ? `${dateFormatted} • Pukul ${timePart} WIB` : dateFormatted
}

const getAvailableSlots = (dateStr) => {
  if (!dateStr) return []
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return []
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2])
  const isSunday = targetDate.getDay() === 0
  const rawSlots = isSunday ? SUNDAY_SLOTS : WEEKDAY_SLOTS

  const now = new Date()
  const todayStr = toYYYYMMDD(now)
  const isToday = dateStr === todayStr

  return rawSlots.map((timeStr) => {
    let isPassed = false
    if (isToday) {
      const [slotH, slotM] = timeStr.split(':').map(Number)
      const slotTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotH, slotM)
      // Buffer 30 menit dari sekarang untuk persiapan unit & wiraniaga
      const minAvailableTime = new Date(now.getTime() + 30 * 60 * 1000)
      if (slotTimeDate < minAvailableTime) {
        isPassed = true
      }
    }
    return {
      time: timeStr,
      isPassed
    }
  })
}

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

  // Calendar & Time Picker Modal State
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false)
  const [pickerStep, setPickerStep] = useState('calendar') // 'calendar' | 'time'
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const now = new Date()
  const todayStr = toYYYYMMDD(now)

  // Reset & inisialisasi state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormSuccess(false)
      setErrorMessage('')
      setIsSubmitting(false)
      setIsPickerModalOpen(false)
      setPickerStep('calendar')

      const curDate = new Date()
      setCalendarMonth(new Date(curDate.getFullYear(), curDate.getMonth(), 1))

      const tStr = toYYYYMMDD(curDate)
      const nextDay = new Date(curDate)
      nextDay.setDate(curDate.getDate() + 1)
      const tNextStr = toYYYYMMDD(nextDay)

      // Cek apakah slot hari ini masih ada yang belum lewat
      const todaySlots = getAvailableSlots(tStr)
      const hasSlotToday = todaySlots.some((s) => !s.isPassed)

      const initialDate = hasSlotToday ? tStr : tNextStr
      const slots = getAvailableSlots(initialDate)
      const firstValidSlot = slots.find((s) => !s.isPassed)?.time || '10:00'

      setSelectedDate(initialDate)
      setSelectedTime(firstValidSlot)
      setFormData({
        name: '',
        phone: '',
        locationType: 'home',
        preferredDate: `${initialDate}T${firstValidSlot}`
      })
    }
  }, [isOpen, vehicle])

  // Calendar Navigation
  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const isPrevDisabled = useMemo(() => {
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() <= now.getMonth())
    )
  }, [calendarMonth, now])

  const isNextDisabled = useMemo(() => {
    const maxMonth = new Date(now.getFullYear(), now.getMonth() + 4, 1)
    return calendarMonth >= maxMonth
  }, [calendarMonth, now])

  // Grid dates calculation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const blanks = Array.from({ length: firstDayIndex }, (_, i) => ({
      key: `blank-${i}`,
      isBlank: true
    }))

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      const isPast = dateStr < todayStr
      const isToday = dateStr === todayStr
      const isSelected = dateStr === selectedDate
      const isSunday = new Date(year, month, dayNum).getDay() === 0

      return {
        key: dateStr,
        dateStr,
        dayNum,
        isPast,
        isToday,
        isSelected,
        isSunday,
        isBlank: false
      }
    })

    return [...blanks, ...days]
  }, [calendarMonth, todayStr, selectedDate])

  // Step 1: Ketika tanggal dipilih di kalender, langsung buka modal pilihan jam saja!
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr)
    setPickerStep('time')
  }

  // Step 2: Slot waktu untuk tanggal terpilih
  const availableSlots = useMemo(() => getAvailableSlots(selectedDate), [selectedDate])

  // Ketika jam dipilih, simpan ke form dan tutup modal kalender/jam
  const handleTimeClick = (timeStr) => {
    setSelectedTime(timeStr)
    const combined = `${selectedDate}T${timeStr}`
    setFormData((prev) => ({
      ...prev,
      preferredDate: combined
    }))
    setIsPickerModalOpen(false)
  }

  // ESC key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        if (isPickerModalOpen) {
          setIsPickerModalOpen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, isPickerModalOpen, onClose])

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
                    <span>Di Showroom</span>
                  </button>
                </div>
              </div>

              {/* Trigger Input Card untuk Calendar & Time Modal */}
              <div className="form-group">
                <div className="td-schedule-header">
                  <label className="form-label" style={{ margin: 0 }}>
                    Rencana Tanggal & Waktu Uji Jalan *
                  </label>
                  <span className="td-schedule-badge">
                    <HiOutlineClock size={13} />
                    <span>Sesuai Jam Kerja Showroom</span>
                  </span>
                </div>

                <div
                  className={`td-schedule-trigger-card ${formData.preferredDate ? 'is-filled' : ''}`}
                  onClick={() => {
                    if (selectedDate) {
                      const parts = selectedDate.split('-').map(Number)
                      if (parts.length === 3) {
                        setCalendarMonth(new Date(parts[0], parts[1] - 1, 1))
                      }
                    }
                    setPickerStep('calendar')
                    setIsPickerModalOpen(true)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Pilih tanggal dan jam uji jalan dari kalender"
                >
                  <div className="td-schedule-trigger-left">
                    <div className="td-schedule-trigger-icon">
                      <HiOutlineCalendarDays size={22} />
                    </div>
                    <div className="td-schedule-trigger-info">
                      <div className="td-schedule-selected-title">
                        {formData.preferredDate
                          ? formatDisplayDateTime(formData.preferredDate)
                          : 'Pilih Tanggal & Jam Test Drive'}
                      </div>
                      <div className="td-schedule-selected-sub">
                        {formData.preferredDate
                          ? 'Senin – Sabtu: 08.30–18.00 • Minggu: 09.00–16.30 WIB'
                          : 'Ketuk untuk membuka kalender interaktif'}
                      </div>
                    </div>
                  </div>
                  <span className="td-schedule-trigger-badge">
                    {formData.preferredDate ? 'Ubah' : 'Pilih'}
                  </span>
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

      {/* Sub-Modal: Calendar & Time Picker Interaktif */}
      {isPickerModalOpen && (
        <div
          className="td-calendar-modal-backdrop"
          onClick={() => setIsPickerModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="td-picker-title"
        >
          <div
            className="td-calendar-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {pickerStep === 'calendar' ? (
              <div className="td-cal-view">
                {/* Header Kalender */}
                <div className="td-cal-header">
                  <div>
                    <h4 id="td-picker-title" className="td-cal-title">Pilih Tanggal Test Drive</h4>
                    <p className="td-cal-subtitle">Geser bulan untuk memilih tanggal uji jalan yang diinginkan</p>
                  </div>
                  <button
                    type="button"
                    className="td-cal-close-btn"
                    onClick={() => setIsPickerModalOpen(false)}
                    aria-label="Tutup Kalender"
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                </div>

                {/* Navigasi Geser Bulan */}
                <div className="td-month-nav-row">
                  <button
                    type="button"
                    className="td-month-nav-btn"
                    onClick={handlePrevMonth}
                    disabled={isPrevDisabled}
                    aria-label="Bulan Sebelumnya"
                    title={isPrevDisabled ? 'Tidak dapat memilih bulan masa lalu' : 'Bulan Sebelumnya'}
                  >
                    <HiOutlineChevronLeft size={18} />
                  </button>
                  <div className="td-month-nav-label">
                    {MONTH_NAMES_ID[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </div>
                  <button
                    type="button"
                    className="td-month-nav-btn"
                    onClick={handleNextMonth}
                    disabled={isNextDisabled}
                    aria-label="Bulan Berikutnya"
                    title={isNextDisabled ? 'Batas maksimal 3 bulan ke depan' : 'Bulan Berikutnya'}
                  >
                    <HiOutlineChevronRight size={18} />
                  </button>
                </div>

                {/* Header Hari dalam Seminggu */}
                <div className="td-cal-weekdays-grid">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, idx) => (
                    <div key={d} className={`td-cal-weekday-cell ${idx === 0 ? 'is-sunday' : ''}`}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid Tanggal Kalender */}
                <div className="td-cal-days-grid">
                  {calendarDays.map((cell) => {
                    if (cell.isBlank) {
                      return <div key={cell.key} className="td-cal-day-cell is-blank" />
                    }
                    return (
                      <button
                        key={cell.key}
                        type="button"
                        className={`td-cal-day-cell ${cell.isSelected ? 'is-selected' : ''} ${cell.isToday ? 'is-today' : ''} ${cell.isSunday ? 'is-sunday' : ''}`}
                        disabled={cell.isPast}
                        onClick={() => handleDateClick(cell.dateStr)}
                        title={cell.isPast ? 'Tanggal telah lewat' : formatDisplayDateIndo(cell.dateStr, true)}
                      >
                        <span className="td-day-num">{cell.dayNum}</span>
                        {cell.isToday && !cell.isSelected && <span className="td-today-dot" title="Hari ini" />}
                      </button>
                    )
                  })}
                </div>

                {/* Petunjuk Bawah Kalender */}
                <div className="td-cal-footer-hint">
                  <HiOutlineClock size={15} color="#E3000C" />
                  <span>Pilih tanggal di atas untuk lanjut ke pilihan jam showroom</span>
                </div>
              </div>
            ) : (
              <div className="td-time-view">
                {/* Header Modal Pilihan Jam Saja */}
                <div className="td-cal-header">
                  <button
                    type="button"
                    className="td-modal-back-btn"
                    onClick={() => setPickerStep('calendar')}
                    aria-label="Kembali ke kalender"
                  >
                    <HiOutlineArrowLeft size={16} />
                    <span>Ganti Tanggal</span>
                  </button>
                  <button
                    type="button"
                    className="td-cal-close-btn"
                    onClick={() => setIsPickerModalOpen(false)}
                    aria-label="Tutup Pilihan Jam"
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                </div>

                {/* Banner Tanggal yang Dipilih */}
                <div className="td-time-selected-banner">
                  <div className="td-time-banner-icon">
                    <HiOutlineCalendarDays size={20} />
                  </div>
                  <div>
                    <div className="td-time-banner-date">
                      {formatDisplayDateIndo(selectedDate, true)}
                    </div>
                    <div className="td-time-banner-hours">
                      {selectedDate && new Date(selectedDate.replace(/-/g, '/')).getDay() === 0
                        ? 'Jam Operasional Minggu: 09.00 – 16.30 WIB'
                        : 'Jam Operasional Senin – Sabtu: 08.30 – 18.00 WIB'}
                    </div>
                  </div>
                </div>

                <div className="td-time-section-title">
                  <HiOutlineClock size={16} color="#E3000C" />
                  <span>Pilih Jam Kunjungan Uji Jalan:</span>
                </div>

                {availableSlots.length > 0 && availableSlots.every((s) => s.isPassed) ? (
                  <div className="td-time-all-passed-alert">
                    <p>Semua slot operasional uji jalan hari ini telah selesai.</p>
                    <button
                      type="button"
                      className="td-btn-pick-another-date"
                      onClick={() => setPickerStep('calendar')}
                    >
                      ← Pilih Tanggal Lain
                    </button>
                  </div>
                ) : (
                  <div className="td-time-options-grid">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          className={`td-time-option-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleTimeClick(slot.time)}
                          disabled={slot.isPassed}
                          title={slot.isPassed ? 'Waktu telah lewat untuk hari ini' : `Pukul ${slot.time} WIB`}
                        >
                          <span className="td-slot-hour">{slot.time}</span>
                          <span className="td-slot-wib">WIB</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="td-time-footer-note">
                  <span>Wiraniaga resmi siap menyambut & menyiapkan unit {vehicleName} sesuai jam pilihan Anda.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
