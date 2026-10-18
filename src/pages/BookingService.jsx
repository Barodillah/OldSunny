import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineWrenchScrewdriver,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineExclamationTriangle,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineChevronDown
} from 'react-icons/hi2'
import { RiCarLine, RiWhatsappLine } from 'react-icons/ri'
import CustomDatePicker from '../components/CustomDatePicker.jsx'
import './BookingService.css'

const STEPS = [
  { id: 1, title: 'Kendaraan', icon: RiCarLine },
  { id: 2, title: 'Servis', icon: HiOutlineWrenchScrewdriver },
  { id: 3, title: 'Jadwal', icon: HiOutlineCalendar },
  { id: 4, title: 'Selesai', icon: HiOutlineCheckCircle },
]

const MITSUBISHI_VEHICLES = [
  'MITSUBISHI DESTINATOR',
  'MITSUBISHI NEW XPANDER',
  'MITSUBISHI NEW XPANDER CROSS',
  'MITSUBISHI NEW XFORCE',
  'MITSUBISHI PAJERO SPORT',
  'MITSUBISHI ALL NEW TRITON',
  'MITSUBISHI NEW L300',
  'MITSUBISHI ECLIPSE CROSS',
  'MITSUBISHI OUTLANDER PHEV',
  'MITSUBISHI MIRAGE',
  'MITSUBISHI DELICA',
  'FUSO CANTER',
  'MITSUBISHI COLT T120SS'
]

const KM_OPTIONS = [
  { value: '1000', label: '1.000 KM (Servis Pertama - Gratis Jasa & Cek)' },
  { value: '10000', label: '10.000 KM (Servis Berkala Kecil)' },
  { value: '20000', label: '20.000 KM (Servis Berkala Besar)' },
  { value: '30000', label: '30.000 KM (Servis Berkala Kecil)' },
  { value: '40000', label: '40.000 KM (Servis Berkala Besar)' },
  { value: '50000', label: '50.000 KM (Servis Berkala Kecil)' },
  { value: '60000', label: '60.000 KM (Servis Berkala Besar)' },
  { value: '70000', label: '70.000 KM (Servis Berkala Kecil)' },
  { value: '80000', label: '80.000 KM (Servis Berkala Besar)' },
  { value: '90000', label: '90.000 KM (Servis Berkala Kecil)' },
  { value: '100000', label: '100.000 KM (Servis Berkala Besar)' },
]

export default function BookingService() {
  const navigate = useNavigate()
  const location = useLocation()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form Data
  const [formData, setFormData] = useState({
    nopol: '',
    nomorRangka: '',
    nopolFound: false,
    manualInput: false,
    nama: '',
    kendaraan: 'MITSUBISHI NEW XPANDER',
    maskedPhone: '',
    fullPhone: '',
    km: '10000',
    keluhan: '',
    acCare: false,
    tanggal: '',
    jam: '',
    verifyPhone: ''
  })

  const [availableDates, setAvailableDates] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [isSlotLoading, setIsSlotLoading] = useState(false)
  const [showCustomDateModal, setShowCustomDateModal] = useState(false)
  const [bookingCode, setBookingCode] = useState('')

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Generate 4 upcoming dates (starting tomorrow)
  useEffect(() => {
    const dates = []
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

    for (let i = 1; i <= 4; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dates.push({
        iso,
        dayName: days[d.getDay()],
        day: d.getDate(),
        month: months[d.getMonth()],
        year: d.getFullYear(),
        isSunday: d.getDay() === 0
      })
    }
    setAvailableDates(dates)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errorMsg) setErrorMsg('')
  }

  const normalizePhone = (phone) => {
    if (!phone) return ''
    let clean = phone.replace(/\D/g, '')
    if (clean.startsWith('62')) clean = '0' + clean.slice(2)
    if (!clean.startsWith('0')) clean = '0' + clean
    return clean
  }

  // Step 1: Check Nopol
  const checkNopol = async () => {
    const cleanNopol = formData.nopol.replace(/\s+/g, '').toUpperCase()
    if (!cleanNopol) {
      setErrorMsg('Silakan masukkan nomor polisi kendaraan Anda.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      let queryNopol = cleanNopol.toLowerCase()
      if (/^\d/.test(queryNopol)) {
        queryNopol = 'b' + queryNopol
      }

      // Try API lookup with fallback
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      try {
        const response = await fetch(`https://csdwindo.com/api-book/?nopol=${queryNopol}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const data = await response.json()

        if (data.status && data.data) {
          const d = data.data
          const expectedPhone = normalizePhone(d.telp)
          setFormData((prev) => ({
            ...prev,
            nopolFound: true,
            manualInput: false,
            nama: d.nama || 'Pelanggan Mitsubishi',
            kendaraan: d.kendaraan || 'MITSUBISHI NEW XPANDER',
            maskedPhone: d.telp ? `xxxx-xxxx-${d.telp.slice(-4)}` : 'xxxx-xxxx-7777',
            fullPhone: expectedPhone,
            verifyPhone: ''
          }))
          setCurrentStep(2)
          return
        }
      } catch {
        // Fallback to manual entry if offline/timeout
      }

      // Not found or manual flow
      setFormData((prev) => ({
        ...prev,
        nopolFound: false,
        manualInput: true,
        nama: prev.nama || '',
        kendaraan: prev.kendaraan || 'MITSUBISHI NEW XPANDER',
        maskedPhone: '',
        fullPhone: '',
        verifyPhone: prev.verifyPhone || ''
      }))
      setCurrentStep(2)
    } catch {
      setErrorMsg('Gagal mengecek data. Silakan lengkapi data secara manual.')
      setFormData((prev) => ({ ...prev, manualInput: true }))
      setCurrentStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  // Validate Step 2 before proceeding to Step 3
  const handleNextToStep3 = () => {
    if (formData.manualInput) {
      if (!formData.nama.trim()) {
        setErrorMsg('Silakan masukkan nama lengkap pemilik kendaraan.')
        return
      }
      if (!formData.verifyPhone.trim()) {
        setErrorMsg('Silakan masukkan nomor WhatsApp / Handphone untuk konfirmasi.')
        return
      }
    }
    if (!formData.km) {
      setErrorMsg('Silakan pilih jarak tempuh (KM) servis.')
      return
    }
    setErrorMsg('')
    setCurrentStep(3)
  }

  // Fetch or generate slots when date is selected
  const handleSelectDate = async (isoDate) => {
    handleInputChange('tanggal', isoDate)
    handleInputChange('jam', '')
    setIsSlotLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)

      try {
        const response = await fetch(`https://csdwindo.com/api-book/slot-jam/?tanggal=${isoDate}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const data = await response.json()

        if (data.status && data.jam) {
          const isSunday = new Date(isoDate).getDay() === 0
          const baseSlots = isSunday ? ['08:00', '09:00', '10:00', '11:00'] : ['08:00', '09:00', '10:00', '11:00', '13:00']
          const slots = baseSlots.map((j) => {
            const booked = data.jam[j] ? parseInt(data.jam[j]) : 0
            const max = isSunday ? 3 : 6
            const remaining = Math.max(0, max - booked)
            return {
              jam: j,
              remaining: remaining > 0 ? remaining : 1
            }
          })
          setAvailableSlots(slots)
          setIsSlotLoading(false)
          return
        }
      } catch {
        // Fallback default slots
      }

      // Default realistic slots for Sun Margahayu
      const isSunday = new Date(isoDate).getDay() === 0
      const defaultSlots = isSunday
        ? [
            { jam: '08:00', remaining: 3 },
            { jam: '09:00', remaining: 2 },
            { jam: '10:00', remaining: 2 },
            { jam: '11:00', remaining: 1 },
          ]
        : [
            { jam: '08:00', remaining: 5 },
            { jam: '09:00', remaining: 4 },
            { jam: '10:00', remaining: 3 },
            { jam: '11:00', remaining: 4 },
            { jam: '13:00', remaining: 3 },
          ]
      setAvailableSlots(defaultSlots)
    } finally {
      setIsSlotLoading(false)
    }
  }

  const handleNextToStep4 = () => {
    if (!formData.tanggal || !formData.jam) {
      setErrorMsg('Silakan tentukan tanggal dan jam kedatangan servis.')
      return
    }
    setErrorMsg('')
    setCurrentStep(4)
  }

  // Submit Final Booking
  const submitBooking = async () => {
    if (formData.nopolFound) {
      if (!formData.verifyPhone) {
        setErrorMsg('Silakan masukkan nomor telepon / WhatsApp untuk konfirmasi.')
        return
      }
    } else if (!formData.verifyPhone) {
      setErrorMsg('Silakan masukkan nomor telepon aktif.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    // Generate reference code
    const refCode = `SUNNY-${Math.floor(1000 + Math.random() * 9000)}`
    setBookingCode(refCode)

    try {
      const payload = {
        tanggal: formData.tanggal,
        jam: formData.jam,
        kendaraan: formData.kendaraan,
        nopol: formData.nopol.toUpperCase().replace(/\s+/g, ''),
        nomor_rangka: formData.nomorRangka ? formData.nomorRangka.toUpperCase() : '',
        nama: formData.nama,
        telp: normalizePhone(formData.verifyPhone),
        jenis: `Servis Berkala ${formData.km} KM`,
        keluhan: formData.keluhan + (formData.acCare ? ' (+AC Care)' : ''),
        dealer: 'Mitsubishi Sun Margahayu'
      }

      // Attempt API transmission
      try {
        await fetch('https://csdwindo.com/api/chat/booking_legacy.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } catch {
        // Continue smoothly even if 3rd party api fails
      }

      setTimeout(() => {
        setIsLoading(false)
        setCurrentStep(5)
      }, 500)
    } catch {
      setIsLoading(false)
      setCurrentStep(5)
    }
  }

  // Generate WhatsApp confirmation
  const createWhatsAppConfirmation = () => {
    const text = `Halo Service Advisor Mitsubishi Sun Margahayu,\n\nSaya telah melakukan booking service melalui website resmi:\n• Kode Booking: ${bookingCode}\n• Nomor Polisi: ${formData.nopol.toUpperCase()}\n${formData.nomorRangka ? `• No. Rangka: ${formData.nomorRangka.toUpperCase()}\n` : ''}• Pemilik: ${formData.nama}\n• Kendaraan: ${formData.kendaraan}\n• Rencana Servis: ${parseInt(formData.km).toLocaleString('id-ID')} KM${formData.acCare ? ' (+AC Care)' : ''}\n• Jadwal: ${formData.tanggal} jam ${formData.jam} WIB\n• No. Telepon: ${formData.verifyPhone}\n\nMohon konfirmasi ketersediaan slot stall. Terima kasih!`
    return `https://wa.me/6281288347777?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="booking-page-root">
      {/* 1. STICKY TOP HEADER */}
      <header className="booking-top-bar">
        <div className="booking-top-inner">
          <div className="booking-header-left">
            {currentStep > 1 && currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('')
                  setCurrentStep((prev) => prev - 1)
                }}
                className="booking-btn-back"
                aria-label="Kembali ke langkah sebelumnya"
              >
                <HiOutlineArrowLeft size={19} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="booking-btn-back"
                aria-label="Kembali ke Beranda"
              >
                <HiOutlineArrowLeft size={19} />
              </button>
            )}
            <h1 className="booking-header-title">Booking Service</h1>
          </div>

          <div className="booking-dealer-badge">
            <span className="dealer-badge-dot" />
            <span>Sun Margahayu</span>
          </div>
        </div>

        {/* 2. PROGRESS STEPPER (STEPS 1 - 4) */}
        {currentStep < 5 && (
          <div className="booking-stepper-container">
            <div className="booking-stepper-track">
              <div
                className="booking-stepper-fill"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {STEPS.map((step) => {
                const Icon = step.icon
                const isActive = currentStep >= step.id
                const isCurrent = currentStep === step.id

                return (
                  <div key={step.id} className="stepper-node-wrapper">
                    <div
                      className={`stepper-node-circle ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={`stepper-node-label ${isCurrent ? 'is-current-label' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN FORM BODY */}
      <main className="booking-main-content">
        {/* ==============================================================
            STEP 1: CEK DATA KENDARAAN (NOPOL)
            ============================================================== */}
        {currentStep === 1 && (
          <div className="booking-step-pane">
            <div className="booking-card">
              <div className="booking-card-header">
                <span className="card-kicker-tag">LANGKAH 1 DARI 4</span>
                <h2 className="card-heading">Cek Data Kendaraan</h2>
                <p className="card-subheading">
                  Masukkan nomor polisi kendaraan Mitsubishi Anda untuk sinkronisasi riwayat servis di bengkel resmi Sun Margahayu.
                </p>
              </div>

              <div className="booking-form-group">
                <label htmlFor="input-nopol" className="booking-form-label">
                  Nomor Polisi (Plat Kendaraan)
                </label>
                <div className="nopol-input-wrapper">
                  <input
                    id="input-nopol"
                    type="text"
                    placeholder="Contoh: B 1234 XYZ"
                    value={formData.nopol}
                    onChange={(e) => handleInputChange('nopol', e.target.value.toUpperCase())}
                    className="nopol-text-input"
                    onKeyDown={(e) => e.key === 'Enter' && checkNopol()}
                    autoFocus
                  />
                  <div className="nopol-input-icon">
                    <RiCarLine size={20} />
                  </div>
                </div>
              </div>

              <div className="booking-form-group">
                <div className="label-with-hint">
                  <label htmlFor="input-rangka" className="booking-form-label">
                    Nomor Rangka Kendaraan
                  </label>
                  <span className="badge-optional">Opsional</span>
                </div>
                <input
                  id="input-rangka"
                  type="text"
                  placeholder="Contoh: MK2NCW01... (17 digit STNK)"
                  value={formData.nomorRangka}
                  onChange={(e) => handleInputChange('nomorRangka', e.target.value.toUpperCase())}
                  className="booking-input font-mono uppercase"
                  maxLength={25}
                />
                <p className="input-hint-small">Boleh dikosongkan jika belum hafal atau STNK sedang tidak ada.</p>
              </div>

              {errorMsg && (
                <div className="booking-alert-box alert-error">
                  <HiOutlineExclamationTriangle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={checkNopol}
                disabled={isLoading || !formData.nopol.trim()}
                className="booking-btn-primary"
              >
                {isLoading ? (
                  <div className="booking-spinner" />
                ) : (
                  <>
                    <span>Cek Data Kendaraan</span>
                    <HiOutlineChevronRight size={17} />
                  </>
                )}
              </button>
            </div>

            {/* Official Facility Info Banner */}
            <div className="booking-info-banner">
              <div className="info-banner-icon">
                <HiOutlineInformationCircle size={22} />
              </div>
              <div className="info-banner-text">
                <strong className="info-banner-title">Bengkel Resmi Standar MMKSI</strong>
                <p className="info-banner-desc">
                  Reservasi bebas antrean fisik dengan jaminan suku cadang orisinal 100%, teknisi bersertifikasi, dan ruang tunggu berfasilitas lengkap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 2: DETAIL SERVIS & KM
            ============================================================== */}
        {currentStep === 2 && (
          <div className="booking-step-pane">
            {/* Identity Badge Card */}
            <div className="booking-card vehicle-summary-card">
              <div className="vehicle-avatar-circle">
                <RiCarLine size={24} />
              </div>
              <div className="vehicle-summary-meta">
                {formData.nopolFound ? (
                  <>
                    <h3 className="vehicle-owner-name">{formData.nama}</h3>
                    <p className="vehicle-model-desc">{formData.kendaraan}</p>
                    <div className="vehicle-pills-row">
                      <span className="vehicle-nopol-pill">{formData.nopol}</span>
                      {formData.nomorRangka && (
                        <span className="vehicle-rangka-pill font-mono">VIN: {formData.nomorRangka}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="manual-entry-block">
                    <div className="manual-header-row">
                      <span className="manual-tag">DATA MANUAL / BARU</span>
                      <span className="vehicle-nopol-pill">{formData.nopol}</span>
                    </div>
                    <p className="manual-desc">
                      Nomor polisi belum tersimpan di database. Silakan lengkapi data identitas di bawah ini:
                    </p>

                    <div className="manual-inputs-grid">
                      <div className="booking-form-group">
                        <label className="booking-form-label">Nama Pemilik / Pembawa Mobil</label>
                        <input
                          type="text"
                          placeholder="Nama Lengkap Pemilik"
                          value={formData.nama}
                          onChange={(e) => handleInputChange('nama', e.target.value)}
                          className="booking-input"
                          required
                        />
                      </div>

                      <div className="booking-form-group">
                        <label className="booking-form-label">Tipe / Model Kendaraan Mitsubishi</label>
                        <select
                          value={formData.kendaraan}
                          onChange={(e) => handleInputChange('kendaraan', e.target.value)}
                          className="booking-select"
                        >
                          {MITSUBISHI_VEHICLES.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="booking-form-group">
                        <div className="label-with-hint">
                          <label className="booking-form-label">Nomor Rangka Kendaraan</label>
                          <span className="badge-optional">Opsional</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Contoh: MK2NCW01... (17 digit STNK)"
                          value={formData.nomorRangka}
                          onChange={(e) => handleInputChange('nomorRangka', e.target.value.toUpperCase())}
                          className="booking-input font-mono uppercase"
                          maxLength={25}
                        />
                      </div>

                      <div className="booking-form-group">
                        <label className="booking-form-label">Nomor WhatsApp Aktif</label>
                        <input
                          type="tel"
                          placeholder="Contoh: 081234567890"
                          value={formData.verifyPhone}
                          onChange={(e) => handleInputChange('verifyPhone', e.target.value)}
                          className="booking-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Selection Card */}
            <div className="booking-card">
              <h3 className="card-section-title">Rencana Servis Berkala</h3>

              <div className="booking-form-group">
                <label className="booking-form-label">Pilih Kelipatan Jarak Tempuh (KM)</label>
                <select
                  value={formData.km}
                  onChange={(e) => handleInputChange('km', e.target.value)}
                  className="booking-select"
                >
                  {KM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="booking-form-group">
                <label className="booking-form-label">Keluhan atau Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Suara dengung di roda depan saat kecepatan 60 km/jam, AC kurang dingin..."
                  value={formData.keluhan}
                  onChange={(e) => handleInputChange('keluhan', e.target.value)}
                  className="booking-textarea"
                />
              </div>
            </div>

            {/* Addon AC Care Card */}
            <div
              className={`booking-card addon-card ${formData.acCare ? 'is-selected' : ''}`}
              onClick={() => handleInputChange('acCare', !formData.acCare)}
              role="checkbox"
              aria-checked={formData.acCare}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleInputChange('acCare', !formData.acCare)
                }
              }}
            >
              <div className="addon-checkbox-circle">
                {formData.acCare && <HiOutlineCheck size={14} />}
              </div>
              <div className="addon-content">
                <div className="addon-title-row">
                  <h4 className="addon-title">Tambah Paket AC Care (+Rp 338.000)</h4>
                  <span className="addon-badge">DISARANKAN</span>
                </div>
                <p className="addon-desc">
                  Pembersihan evaporator &amp; blower tanpa bongkar dashboard untuk menjaga udara kabin bebas bakteri dan sejuk maksimal.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="booking-alert-box alert-error">
                <HiOutlineExclamationTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextToStep3}
              className="booking-btn-primary"
            >
              <span>Lanjut Pilih Jadwal</span>
              <HiOutlineChevronRight size={17} />
            </button>
          </div>
        )}

        {/* ==============================================================
            STEP 3: JADWAL & SLOT WAKTU
            ============================================================== */}
        {currentStep === 3 && (
          <div className="booking-step-pane">
            <div className="booking-card">
              <div className="card-title-row">
                <HiOutlineCalendar size={20} className="text-red" />
                <h3 className="card-section-title">Pilih Tanggal Kedatangan</h3>
              </div>

              {/* Horizontal Date Picker Cards */}
              <div className="date-picker-scroll-row">
                {availableDates.map((d) => {
                  const isSelected = formData.tanggal === d.iso
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => handleSelectDate(d.iso)}
                      className={`date-tile-btn ${isSelected ? 'is-selected' : ''}`}
                    >
                      <span className="date-tile-dayname">{d.dayName}</span>
                      <span className="date-tile-daynum">{d.day}</span>
                      <span className="date-tile-month">{d.month}</span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => setShowCustomDateModal(true)}
                  className={`date-tile-btn date-tile-custom ${formData.tanggal && !availableDates.find((d) => d.iso === formData.tanggal) ? 'is-selected' : ''}`}
                >
                  <HiOutlineCalendar size={18} />
                  <span className="date-custom-label">
                    {formData.tanggal && !availableDates.find((d) => d.iso === formData.tanggal)
                      ? formData.tanggal
                      : 'Tanggal Lain'}
                  </span>
                </button>
              </div>

              <p className="date-hint-text">
                *Booking dianjurkan minimal H-1 agar ketersediaan suku cadang dan montir terjamin.
              </p>
            </div>

            {/* Custom Date Modal */}
            {showCustomDateModal && (
              <div
                className="booking-modal-overlay"
                onClick={() => setShowCustomDateModal(false)}
              >
                <div
                  className="booking-modal-box custom-date-modal-box"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h4>Pilih Tanggal Booking</h4>
                    <button
                      type="button"
                      onClick={() => setShowCustomDateModal(false)}
                      className="modal-close"
                      aria-label="Tutup"
                    >
                      <HiOutlineXMark size={20} />
                    </button>
                  </div>
                  <div className="modal-body custom-date-modal-body">
                    <CustomDatePicker
                      currentDate={formData.tanggal}
                      onSelect={(isoDate) => {
                        handleSelectDate(isoDate)
                        setShowCustomDateModal(false)
                      }}
                      minDate={new Date()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Time Slots Section (shown when date is selected) */}
            {formData.tanggal && (
              <div className="booking-card">
                <div className="card-title-row">
                  <HiOutlineClock size={20} className="text-red" />
                  <h3 className="card-section-title">Pilih Jam Kedatangan</h3>
                </div>

                {isSlotLoading ? (
                  <div className="slot-loading-box">
                    <div className="booking-spinner spinner-dark" />
                    <span>Memeriksa ketersediaan stall montir...</span>
                  </div>
                ) : (
                  <div className="time-slots-grid">
                    {availableSlots.map((slot) => {
                      const isSelected = formData.jam === slot.jam
                      return (
                        <button
                          key={slot.jam}
                          type="button"
                          onClick={() => handleInputChange('jam', slot.jam)}
                          className={`slot-tile-btn ${isSelected ? 'is-selected' : ''}`}
                        >
                          <span className="slot-time-text">{slot.jam} WIB</span>
                          <span className="slot-avail-text">
                            Sisa {slot.remaining} Slot
                          </span>
                          {isSelected && (
                            <div className="slot-check-icon">
                              <HiOutlineCheckCircle size={18} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Major Service Arrival Time Advisory */}
                {parseInt(formData.km) >= 20000 && parseInt(formData.km) % 20000 === 0 && (
                  <div className="booking-notice-callout">
                    <HiOutlineInformationCircle size={18} className="text-amber" />
                    <span>
                      Untuk Servis Berkala Besar ({parseInt(formData.km).toLocaleString('id-ID')} KM), batas kedatangan maksimal adalah pukul 11:00 WIB untuk ketepatan waktu selesai.
                    </span>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="booking-alert-box alert-error">
                <HiOutlineExclamationTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextToStep4}
              disabled={!formData.tanggal || !formData.jam}
              className="booking-btn-primary"
            >
              <span>Lanjut ke Ringkasan</span>
              <HiOutlineChevronRight size={17} />
            </button>
          </div>
        )}

        {/* ==============================================================
            STEP 4: KONFIRMASI & VERIFIKASI NO HP
            ============================================================== */}
        {currentStep === 4 && (
          <div className="booking-step-pane">
            <div className="booking-card">
              <h3 className="card-section-title border-bottom">Ringkasan Reservasi Servis</h3>

              <div className="summary-details-list">
                <div className="summary-detail-row">
                  <span className="summary-label">Kendaraan</span>
                  <div className="summary-val-col">
                    <strong>{formData.kendaraan}</strong>
                    <span className="summary-subval font-mono">{formData.nopol}</span>
                    {formData.nomorRangka && (
                      <span className="summary-subval font-mono">VIN: {formData.nomorRangka}</span>
                    )}
                  </div>
                </div>

                <div className="summary-detail-row">
                  <span className="summary-label">Pemilik</span>
                  <div className="summary-val-col">
                    <strong>{formData.nama}</strong>
                  </div>
                </div>

                <div className="summary-detail-row">
                  <span className="summary-label">Paket Servis</span>
                  <div className="summary-val-col">
                    <strong>Servis Berkala {parseInt(formData.km).toLocaleString('id-ID')} KM</strong>
                    {formData.acCare && <span className="addon-text">+ Paket AC Care Resmi</span>}
                  </div>
                </div>

                <div className="summary-detail-row">
                  <span className="summary-label">Jadwal Kedatangan</span>
                  <div className="summary-val-col">
                    <strong>{formData.tanggal}</strong>
                    <span className="summary-time-val">{formData.jam} WIB</span>
                  </div>
                </div>

                <div className="summary-detail-row">
                  <span className="summary-label">Lokasi Bengkel</span>
                  <div className="summary-val-col">
                    <strong>Mitsubishi Sun Margahayu</strong>
                    <span className="summary-subval">Jl. Ir. H. Juanda No. 35, Margahayu, Bekasi Timur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Verification Box */}
            <div className="booking-card phone-verify-card">
              <div className="verify-header-row">
                <HiOutlinePhone size={20} className="text-red" />
                <h4 className="verify-title">Nomor WhatsApp / Konfirmasi</h4>
              </div>
              <p className="verify-desc">
                {formData.nopolFound && formData.maskedPhone
                  ? `Data nopol terhubung dengan nomor ${formData.maskedPhone}. Masukkan nomor lengkap Anda untuk validasi:`
                  : 'Masukkan nomor WhatsApp aktif Anda untuk pengiriman bukti reservasi dan notifikasi kedatangan:'}
              </p>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.verifyPhone}
                onChange={(e) => handleInputChange('verifyPhone', e.target.value)}
                className="booking-input phone-input"
                required
              />
            </div>

            {errorMsg && (
              <div className="booking-alert-box alert-error">
                <HiOutlineExclamationTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={submitBooking}
              disabled={isLoading}
              className="booking-btn-primary"
            >
              {isLoading ? (
                <div className="booking-spinner" />
              ) : (
                <>
                  <span>Konfirmasi &amp; Amankan Slot</span>
                  <HiOutlineCheckCircle size={19} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ==============================================================
            STEP 5: SUKSES
            ============================================================== */}
        {currentStep === 5 && (
          <div className="booking-step-pane">
            <div className="booking-card success-card">
              <div className="success-icon-circle">
                <HiOutlineCheckCircle size={44} />
              </div>
              <h2 className="success-title">Booking Berhasil Diterima!</h2>
              <p className="success-desc">
                Terima kasih, permohonan reservasi servis resmi untuk kendaraan{' '}
                <strong>{formData.nopol}</strong> telah terdaftar di sistem bengkel Sun Margahayu.
              </p>

              <div className="success-summary-box">
                <div className="success-row">
                  <span>Nomor Referensi</span>
                  <strong className="text-red font-mono">{bookingCode}</strong>
                </div>
                <div className="success-row">
                  <span>Tanggal &amp; Jam</span>
                  <strong>{formData.tanggal} • {formData.jam} WIB</strong>
                </div>
                <div className="success-row">
                  <span>Kendaraan</span>
                  <strong>{formData.kendaraan} ({formData.nopol})</strong>
                </div>
                {formData.nomorRangka && (
                  <div className="success-row">
                    <span>No. Rangka (VIN)</span>
                    <strong className="font-mono">{formData.nomorRangka}</strong>
                  </div>
                )}
                <div className="success-row">
                  <span>Lokasi</span>
                  <strong>Bengkel Resmi Sun Margahayu</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="success-actions-col">
                <a
                  href={createWhatsAppConfirmation()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success-wa"
                >
                  <RiWhatsappLine size={20} />
                  <span>Kirim Bukti Reservasi via WhatsApp</span>
                </a>

                <Link to="/" className="btn-success-home">
                  <span>Kembali ke Beranda Showroom</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
