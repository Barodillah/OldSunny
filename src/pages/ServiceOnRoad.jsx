import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineMapPin,
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineArrowPath
} from 'react-icons/hi2'
import { RiWhatsappLine, RiCarLine } from 'react-icons/ri'
import './ServiceOnRoad.css'

// Default center: Showroom Mitsubishi Sun Star Prima Motor Margahayu
const DEFAULT_CENTER = {
  lat: -6.2508468,
  lng: 107.0245155
}

// Popular models for quick selection
const CAR_MODELS = [
  'New XFORCE',
  'New Xpander',
  'New Xpander Cross',
  'New Pajero Sport',
  'Triton 4x4',
  'L300 Euro 4',
  'Kendaraan Mitsubishi Lainnya'
]

export default function ServiceOnRoad() {
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    noPolisi: '',
    kendaraan: 'New Xpander',
    kendala: '',
    detailAlamat: '',
    latitude: '',
    longitude: '',
    alamatPeta: ''
  })

  // UI State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Temp map state for modal
  const [tempCoords, setTempCoords] = useState(DEFAULT_CENTER)
  const [tempAddress, setTempAddress] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const initialCoordsRef = useRef(DEFAULT_CENTER)

  // Map DOM refs
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Reverse geocoding helper using Nominatim
  const fetchAddress = async (lat, lng) => {
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      )
      if (res.ok) {
        const data = await res.json()
        const display = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setTempAddress(display)
        return display
      }
    } catch {
      // Fallback if offline / rate limited
      const fallback = `Titik Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setTempAddress(fallback)
      return fallback
    } finally {
      setIsGeocoding(false)
    }
    return ''
  }

  // Handle Request Current Geolocation
  const handleRequestCurrentLocation = () => {
    setIsLocating(true)
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis. Silakan pilih titik langsung pada peta.')
      initialCoordsRef.current = DEFAULT_CENTER
      setTempCoords(DEFAULT_CENTER)
      setIsMapModalOpen(true)
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        initialCoordsRef.current = coords
        setTempCoords(coords)
        fetchAddress(coords.lat, coords.lng)
        setIsLocating(false)
        setIsMapModalOpen(true)
      },
      () => {
        // Fallback to default showroom coordinates if user denies
        initialCoordsRef.current = DEFAULT_CENTER
        setTempCoords(DEFAULT_CENTER)
        fetchAddress(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
        setIsLocating(false)
        setIsMapModalOpen(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Initialize Leaflet Map inside Modal
  useEffect(() => {
    if (!isMapModalOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return

      // Create Custom SVG Map Pin
      const pinIcon = L.divIcon({
        className: 'sor-custom-marker',
        html: `
          <div class="marker-pin-outer">
            <div class="marker-pin-dot"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      })

      const startLat = initialCoordsRef.current.lat
      const startLng = initialCoordsRef.current.lng

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 16,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      const marker = L.marker([startLat, startLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map)

      marker.bindPopup('<b>Geser pin</b> ke titik tepat kendaraan Anda berada.').openPopup()

      // Handle marker drag
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setTempCoords({ lat: pos.lat, lng: pos.lng })
        fetchAddress(pos.lat, pos.lng)
      })

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setTempCoords({ lat, lng })
        fetchAddress(lat, lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      // Ensure proper render size after modal animation
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [isMapModalOpen])

  // Confirm Location from Modal
  const handleConfirmLocation = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: tempCoords.lat.toFixed(6),
      longitude: tempCoords.lng.toFixed(6),
      alamatPeta: tempAddress || `${tempCoords.lat.toFixed(5)}, ${tempCoords.lng.toFixed(5)}`
    }))
    setFormErrors((prev) => ({ ...prev, lokasi: null }))
    setIsMapModalOpen(false)
  }

  // Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Pre-submit validation
  const handlePreSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!formData.nama.trim()) errors.nama = 'Nama lengkap wajib diisi'
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'Nomor WhatsApp wajib diisi'
    } else if (!/^[0-9+-\s]{8,18}$/.test(formData.whatsapp.trim())) {
      errors.whatsapp = 'Format nomor WhatsApp tidak valid'
    }
    if (!formData.noPolisi.trim()) errors.noPolisi = 'Nomor polisi kendaraan wajib diisi'
    if (!formData.kendaraan) errors.kendaraan = 'Pilih model kendaraan'
    if (!formData.kendala.trim()) errors.kendala = 'Jelaskan kendala kerusakan kendaraan Anda'
    if (!formData.latitude || !formData.longitude) {
      errors.lokasi = 'Silakan bagikan / tentukan titik lokasi kendaraan Anda'
    }
    if (!formData.detailAlamat.trim()) {
      errors.detailAlamat = 'Detail alamat / patokan lokasi wajib diisi'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // Scroll to first error
      window.scrollTo({ top: 180, behavior: 'smooth' })
      return
    }

    setFormErrors({})
    setIsTermsModalOpen(true)
  }

  // Final submit after agreeing to Terms
  const handleFinalConfirmDispatch = () => {
    const mapsUrl = `https://maps.google.com/?q=${formData.latitude},${formData.longitude}`
    const message = [
      `*PERMINTAAN SERVICE ON ROAD - MITSUBISHI SUN MARGAHAYU*`,
      ``,
      `Halo Dispatcher Bengkel Resmi Mitsubishi Sun Star Prima Motor Margahayu, saya membutuhkan kedatangan teknisi darurat Service On Road untuk kendaraan mogok:`,
      ``,
      `• *Nama Pelapor:* ${formData.nama}`,
      `• *No. WhatsApp:* ${formData.whatsapp}`,
      `• *No. Polisi:* ${formData.noPolisi.toUpperCase()}`,
      `• *Model Unit:* ${formData.kendaraan}`,
      `• *Kendala Kerusakan:* ${formData.kendala}`,
      `• *Titik Koordinat:* ${formData.latitude}, ${formData.longitude}`,
      `• *Alamat / Patokan:* ${formData.detailAlamat}`,
      `• *Lokasi Peta:* ${formData.alamatPeta}`,
      `• *Link Google Maps:* ${mapsUrl}`,
      ``,
      `_Saya telah menyetujui syarat & ketentuan bahwa kendaraan dalam kondisi tidak dapat dinyalakan/dikendarai dan bersedia menerima verifikasi teknisi bengkel._`
    ].join('\n')

    const waUrl = `https://wa.me/6282210928822?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')

    setIsTermsModalOpen(false)
    setIsSubmittedSuccess(true)
  }

  return (
    <div className="sor-page-root">
      {/* 1. MINIMALIST CLEAN HEADER */}
      <header className="sor-header">
        <div className="sor-header-inner">
          <div className="sor-badge-tag">
            <span className="sor-pulse-dot" />
            <span>LAYANAN DARURAT RESMI BENGKEL</span>
          </div>

          <h1 className="sor-main-title">Kunjungan Servis</h1>
        </div>
      </header>

      {/* 2. SIMPLE & CLEAN FORM CONTAINER */}
      <main className="sor-main-container">
        {isSubmittedSuccess ? (
          <div className="sor-success-card">
            <div className="success-icon-wrap">
              <HiOutlineCheckCircle size={54} />
            </div>
            <h2 className="success-title">Permintaan Kunjungan Berhasil Terkirim</h2>
            <p className="success-desc">
              Data laporan Anda telah diteruskan ke Dispatcher Bengkel Resmi PT Sun Star Prima Motor Margahayu via WhatsApp.
              Tim teknisi kami akan segera memverifikasi ketersediaan armada dan menghubungi nomor WhatsApp Anda.
            </p>

            <div className="success-ticket-box">
              <div className="ticket-row">
                <span className="t-label">Nama:</span>
                <span className="t-value">{formData.nama}</span>
              </div>
              <div className="ticket-row">
                <span className="t-label">Kendaraan:</span>
                <span className="t-value">{formData.kendaraan} ({formData.noPolisi.toUpperCase()})</span>
              </div>
              <div className="ticket-row">
                <span className="t-label">Koordinat:</span>
                <span className="t-value">{formData.latitude}, {formData.longitude}</span>
              </div>
            </div>

            <div className="success-action-row">
              <button
                type="button"
                className="btn-sor-reset"
                onClick={() => {
                  setIsSubmittedSuccess(false)
                  setFormData({
                    nama: '',
                    whatsapp: '',
                    noPolisi: '',
                    kendaraan: 'New Xpander',
                    kendala: '',
                    detailAlamat: '',
                    latitude: '',
                    longitude: '',
                    alamatPeta: ''
                  })
                }}
              >
                <HiOutlineArrowPath size={16} />
                <span>Buat Pengajuan Baru</span>
              </button>

              <Link to="/" className="btn-sor-home">
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        ) : (
          <form className="sor-form-card" onSubmit={handlePreSubmit} noValidate>
            <div className="sor-form-heading">
              <h2 className="form-title">Formulir Panggilan Teknisi</h2>
              <span className="form-req-hint">* Seluruh kolom wajib diisi dengan benar</span>
            </div>

            {/* Row 1: Nama & WhatsApp */}
            <div className="sor-grid-2">
              <div className="sor-field-group">
                <label htmlFor="sor-nama" className="sor-label">
                  Nama Lengkap Pemilik / Pelapor *
                </label>
                <div className="sor-input-wrap">
                  <HiOutlineIdentification size={18} className="input-icon" />
                  <input
                    id="sor-nama"
                    type="text"
                    name="nama"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={handleChange}
                    className={`sor-input ${formErrors.nama ? 'has-error' : ''}`}
                  />
                </div>
                {formErrors.nama && <span className="sor-error-msg">{formErrors.nama}</span>}
              </div>

              <div className="sor-field-group">
                <label htmlFor="sor-wa" className="sor-label">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="sor-input-wrap">
                  <RiWhatsappLine size={18} className="input-icon" />
                  <input
                    id="sor-wa"
                    type="tel"
                    name="whatsapp"
                    placeholder="Contoh: 081234567890"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className={`sor-input ${formErrors.whatsapp ? 'has-error' : ''}`}
                  />
                </div>
                {formErrors.whatsapp && <span className="sor-error-msg">{formErrors.whatsapp}</span>}
              </div>
            </div>

            {/* Row 2: No Polisi & Kendaraan */}
            <div className="sor-grid-2">
              <div className="sor-field-group">
                <label htmlFor="sor-nopol" className="sor-label">
                  Nomor Polisi (Plat Nomor) *
                </label>
                <div className="sor-input-wrap">
                  <HiOutlineDocumentText size={18} className="input-icon" />
                  <input
                    id="sor-nopol"
                    type="text"
                    name="noPolisi"
                    placeholder="Contoh: B 1234 SMN"
                    value={formData.noPolisi}
                    onChange={handleChange}
                    className={`sor-input ${formErrors.noPolisi ? 'has-error' : ''}`}
                  />
                </div>
                {formErrors.noPolisi && <span className="sor-error-msg">{formErrors.noPolisi}</span>}
              </div>

              <div className="sor-field-group">
                <label htmlFor="sor-kendaraan" className="sor-label">
                  Model Kendaraan Mitsubishi *
                </label>
                <div className="sor-input-wrap">
                  <RiCarLine size={18} className="input-icon" />
                  <select
                    id="sor-kendaraan"
                    name="kendaraan"
                    value={formData.kendaraan}
                    onChange={handleChange}
                    className={`sor-input sor-select ${formErrors.kendaraan ? 'has-error' : ''}`}
                  >
                    {CAR_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.kendaraan && <span className="sor-error-msg">{formErrors.kendaraan}</span>}
              </div>
            </div>

            {/* Kendala Kendaraan */}
            <div className="sor-field-group">
              <label htmlFor="sor-kendala" className="sor-label">
                Deskripsi Kendala Kerusakan Kendaraan *
              </label>
              <textarea
                id="sor-kendala"
                name="kendala"
                rows="3"
                placeholder="Jelaskan kondisi kendaraan (contoh: Mesin mati tiba-tiba di pinggir jalan, starter tidak merespon sama sekali, ada indikator aki menyala merah)..."
                value={formData.kendala}
                onChange={handleChange}
                className={`sor-textarea ${formErrors.kendala ? 'has-error' : ''}`}
              />
              {formErrors.kendala && <span className="sor-error-msg">{formErrors.kendala}</span>}
            </div>

            {/* Share Location Section */}
            <div className="sor-location-block">
              <div className="location-header-row">
                <div>
                  <label className="sor-label">Titik Lokasi Kendaraan (Share Loc) *</label>
                  <p className="location-desc">
                    Tentukan titik tepat mobil Anda berada agar mekanik kami langsung menuju posisi GPS yang akurat.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-share-loc"
                  onClick={handleRequestCurrentLocation}
                  disabled={isLocating}
                >
                  <HiOutlineMapPin size={17} />
                  <span>{isLocating ? 'Mencari Titik GPS...' : 'Kirim Lokasi Saat Ini'}</span>
                </button>
              </div>

              {formData.latitude && formData.longitude ? (
                <div className="location-confirmed-box">
                  <div className="loc-badge-row">
                    <span className="loc-status-badge">
                      <HiOutlineCheckCircle size={15} />
                      <span>Titik Lokasi Terpilih</span>
                    </span>
                    <span className="loc-coords">
                      Lat: {formData.latitude}, Lng: {formData.longitude}
                    </span>
                  </div>

                  <p className="loc-address-text">{formData.alamatPeta}</p>

                  <button
                    type="button"
                    className="btn-loc-reselect"
                    onClick={() => {
                      const lat = parseFloat(formData.latitude)
                      const lng = parseFloat(formData.longitude)
                      initialCoordsRef.current = { lat, lng }
                      setTempCoords({ lat, lng })
                      setIsMapModalOpen(true)
                    }}
                  >
                    <span>Ubah / Geser Titik di Peta</span>
                  </button>
                </div>
              ) : (
                <div className={`location-empty-box ${formErrors.lokasi ? 'has-error' : ''}`}>
                  <HiOutlineMapPin size={24} className="empty-pin-icon" />
                  <p className="empty-text">
                    Belum ada titik lokasi yang dipilih. Klik tombol <strong>"Kirim Lokasi Saat Ini"</strong> untuk membuka peta interaktif.
                  </p>
                  {formErrors.lokasi && <span className="sor-error-msg">{formErrors.lokasi}</span>}
                </div>
              )}
            </div>

            {/* Detail Alamat / Patokan */}
            <div className="sor-field-group">
              <label htmlFor="sor-detail-alamat" className="sor-label">
                Detail Alamat &amp; Patokan Lapangan *
              </label>
              <textarea
                id="sor-detail-alamat"
                name="detailAlamat"
                rows="2"
                placeholder="Contoh: Jl. Ahmad Yani No. 45, depan Indomaret samping flyover, mobil Avanza abu-abu terparkir di bahu jalan kiri..."
                value={formData.detailAlamat}
                onChange={handleChange}
                className={`sor-textarea ${formErrors.detailAlamat ? 'has-error' : ''}`}
              />
              {formErrors.detailAlamat && <span className="sor-error-msg">{formErrors.detailAlamat}</span>}
            </div>

            {/* Notice bar */}
            <div className="sor-notice-bar">
              <HiOutlineExclamationTriangle size={18} className="notice-icon" />
              <span>
                Teknisi Service On Road beroperasi pada jam kerja bengkel (08.00 – 16.30 WIB). Untuk bantuan teknis darurat atau informasi Service on Road, hubungi hotline siaga.
              </span>
            </div>

            {/* Submit Action */}
            <div className="sor-submit-row">
              <button type="submit" className="btn-sor-submit">
                <HiOutlineWrenchScrewdriver size={18} />
                <span>Panggil Teknisi Service On Road</span>
                <HiOutlineArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </main>

      {/* 3. MODAL LEAFLET MAP: PILIH TITIK KOORDINAT */}
      {isMapModalOpen && (
        <div
          className="sor-modal-backdrop"
          onClick={() => setIsMapModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sor-map-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="map-modal-header">
              <div className="modal-title-col">
                <h3 className="modal-title">Tentukan Titik Kendaraan</h3>
                <p className="modal-subtitle">
                  Klik pada peta atau geser pin merah untuk menandai posisi mobil Anda saat ini.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMapModalOpen(false)}
                aria-label="Tutup Peta"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="sor-map-container" ref={mapContainerRef} />

            <div className="map-modal-footer">
              <div className="footer-coords-info">
                <span className="coords-label">
                  {isGeocoding ? 'Mengambil nama jalan...' : 'Posisi Terpilih:'}
                </span>
                <p className="coords-address">
                  {tempAddress || `${tempCoords.lat.toFixed(5)}, ${tempCoords.lng.toFixed(5)}`}
                </p>
              </div>

              <div className="footer-btns-row">
                <button
                  type="button"
                  className="btn-map-cancel"
                  onClick={() => setIsMapModalOpen(false)}
                  aria-label="Batal memilih lokasi"
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-map-confirm"
                  onClick={handleConfirmLocation}
                >
                  <HiOutlineCheckCircle size={18} className="btn-confirm-icon" />
                  <span className="btn-confirm-text-full">Konfirmasi Titik Lokasi</span>
                  <span className="btn-confirm-text-short">Konfirmasi Lokasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL SYARAT & KETENTUAN SEBELUM DISPATCH */}
      {isTermsModalOpen && (
        <div
          className="sor-modal-backdrop"
          onClick={() => setIsTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sor-terms-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="terms-modal-header">
              <div className="terms-header-left">
                <div className="terms-icon-circle">
                  <HiOutlineShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="terms-title">Syarat &amp; Ketentuan Service On Road</h3>
                  <p className="terms-subtitle">
                    Konfirmasi kondisi kendaraan sebelum dispatcher mengirimkan teknisi resmi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsTermsModalOpen(false)}
                aria-label="Tutup Syarat & Ketentuan"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="terms-body">
              <div className="terms-grid-2">
                <div className="term-card-row">
                  <div className="term-number">1</div>
                  <div className="term-content">
                    <h4 className="term-heading">Mobil Tidak Bisa Beroperasi</h4>
                    <p className="term-text">
                      Khusus unit yang <strong>mati total, starter tidak merespon</strong>, atau membahayakan jika dipaksa jalan ke bengkel.
                    </p>
                  </div>
                </div>

                <div className="term-card-row">
                  <div className="term-number">2</div>
                  <div className="term-content">
                    <h4 className="term-heading">Jam Operasional Bengkel</h4>
                    <p className="term-text">
                      Teknisi visit beroperasi <strong>Senin – Sabtu, 08.00 – 16.30 WIB</strong>. Di luar jam kerja diprioritaskan hari berikutnya.
                    </p>
                  </div>
                </div>

                <div className="term-card-row">
                  <div className="term-number">3</div>
                  <div className="term-content">
                    <h4 className="term-heading">Kelengkapan Dokumen</h4>
                    <p className="term-text">
                      Pelapor wajib menunjukkan <strong>STNK asli / bukti sah</strong> saat mekanik resmi tiba di lokasi kejadian.
                    </p>
                  </div>
                </div>

                <div className="term-card-row">
                  <div className="term-number">4</div>
                  <div className="term-content">
                    <h4 className="term-heading">Biaya Resmi &amp; Transparan</h4>
                    <p className="term-text">
                      Biaya jasa visit dan spare part orisinal mengacu pada <strong>standar tarif resmi bengkel</strong> tanpa pungutan lain.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="terms-modal-footer">
              <button
                type="button"
                className="btn-terms-cancel"
                onClick={() => setIsTermsModalOpen(false)}
              >
                Batal / Periksa Kembali
              </button>

              <button
                type="button"
                className="btn-terms-confirm"
                onClick={handleFinalConfirmDispatch}
              >
                <RiWhatsappLine size={19} />
                <span>Konfirmasi Panggil Teknisi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
