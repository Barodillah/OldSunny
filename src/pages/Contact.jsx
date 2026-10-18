import { useState, useEffect } from 'react'
import {
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineDocumentDuplicate,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineEnvelope,
  HiChevronDown,
  HiOutlineShieldExclamation
} from 'react-icons/hi2'
import {
  RiWhatsappLine,
  RiCustomerService2Line,
  RiCarLine,
  RiToolsLine,
  RiDirectionLine
} from 'react-icons/ri'
import SunnyAssistantSection from '../components/SunnyAssistantSection.jsx'
import './Contact.css'

const VEHICLE_OPTIONS = [
  'All New Xforce',
  'New Pajero Sport',
  'New Xpander Cross',
  'New Xpander',
  'All New Triton',
  'Colt L300 Euro 4',
  'Mitsubishi Fuso Canter / Fighter X',
  'Lainnya / Belum Memilih'
]

export default function Contact({ onOpenAiChat }) {
  // Accordion active state: 'hubungi' by default, or 'promo' or 'keluhan', or null
  const [activeAccordion, setActiveAccordion] = useState('hubungi')

  // 1. Beri Tahu Update & Promo (Berlangganan)
  const [promoEmail, setPromoEmail] = useState('')
  const [submittedPromo, setSubmittedPromo] = useState(false)

  // 2. Hubungi Saya
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [submittedContact, setSubmittedContact] = useState(false)

  // 3. Lapor Keluhan
  const [complaintType, setComplaintType] = useState('penjualan') // 'penjualan' | 'service' | 'bodypaint'
  const [complaintName, setComplaintName] = useState('')
  const [complaintPhone, setComplaintPhone] = useState('')
  const [complaintVehicle, setComplaintVehicle] = useState('All New Xforce')
  const [complaintSalesName, setComplaintSalesName] = useState('')
  const [complaintPlate, setComplaintPlate] = useState('')
  const [complaintNotes, setComplaintNotes] = useState('')
  const [submittedComplaint, setSubmittedComplaint] = useState(false)

  const [copiedBank, setCopiedBank] = useState(false)

  // Scroll to top on mount and set page title
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.title = 'Hubungi Kami & Asisten Sunny | Dealer Resmi Mitsubishi Sun Margahayu'
  }, [])

  const handleCopyBank = () => {
    navigator.clipboard.writeText('3425419999')
    setCopiedBank(true)
    setTimeout(() => setCopiedBank(false), 2500)
  }

  const toggleAccordion = (id) => {
    setActiveAccordion((prev) => (prev === id ? null : id))
  }

  const handleSubmitPromo = (e) => {
    e.preventDefault()
    if (promoEmail) {
      setSubmittedPromo(true)
    }
  }

  const handleSubmitContact = (e) => {
    e.preventDefault()
    if (contactName && contactPhone) {
      setSubmittedContact(true)
    }
  }

  const handleSubmitComplaint = (e) => {
    e.preventDefault()
    if (complaintName && complaintPhone && complaintNotes) {
      setSubmittedComplaint(true)
    }
  }

  // Pre-formatted WhatsApp text for Form 2 (Hubungi Saya)
  const waContactMessage = encodeURIComponent(
    `Halo Admin Mitsubishi Sun Margahayu, saya *${contactName}* ingin dihubungi kembali oleh tim sales/layanan via WhatsApp: ${contactPhone}`
  )

  // Pre-formatted WhatsApp text for Form 3 (Lapor Keluhan)
  const complaintTypeLabel = complaintType === 'penjualan'
    ? 'Penjualan Unit (Sales)'
    : complaintType === 'service'
      ? 'Bengkel Resmi (Service)'
      : 'Bodi & Cat (Body & Paint)'

  const waComplaintMessage = encodeURIComponent(
    `Halo Tim Manajemen & CSM Mitsubishi Sun Margahayu, saya ingin menyampaikan laporan keluhan:\n` +
    `• Jenis Layanan: ${complaintTypeLabel}\n` +
    `• Nama: ${complaintName}\n` +
    `• No. WhatsApp: ${complaintPhone}\n` +
    (complaintType === 'penjualan'
      ? `• Kendaraan: ${complaintVehicle}\n• Nama Sales: ${complaintSalesName || '-'}\n`
      : `• No. Polisi (Plat): ${complaintPlate || '-'}\n`) +
    `• Catatan Keluhan: ${complaintNotes}`
  )

  return (
    <main className="contact-page-wrapper">
      {/* ====================================================================
          1. HIGHLIGHT & HEADER HERO: SUNNY VIRTUAL ASSISTANT
          ==================================================================== */}
      <SunnyAssistantSection
        onOpenAiChat={onOpenAiChat}
        isHeader={true}
        customBadge="PUSAT KONTAK & ASISTEN VIRTUAL RESMI DEALER"
      />

      {/* ====================================================================
          3. DIRECT CONTACT ACTION CHANNELS (4 HUB UTAMA)
          ==================================================================== */}
      <section className="contact-channels-section" aria-label="Saluran Kontak Cepat">
        <div className="contact-channels-grid">
          {/* Card 1: WhatsApp CS & Sales */}
          <article className="contact-channel-card">
            <div className="channel-card-stripe stripe-green" aria-hidden="true" />
            <div className="channel-card-header">
              <div className="channel-icon-wrap icon-whatsapp" aria-hidden="true">
                <RiWhatsappLine />
              </div>
              <span className="channel-badge">Respon Cepat</span>
            </div>
            <h2 className="channel-title">WhatsApp Resmi Dealer</h2>
            <p className="channel-desc">
              Tanya promo harga spesial, diskon bulan ini, simulasi kredit DP terjangkau, atau jadwalkan janji temu.
            </p>
            <a
              href="https://wa.me/6281288347777?text=Halo%20Sunny%20Mitsubishi%2C%20saya%20ingin%20konsultasi%20kendaraan%20baru"
              target="_blank"
              rel="noopener noreferrer"
              className="channel-action-btn btn-whatsapp"
            >
              <RiWhatsappLine size={18} />
              <span>Chat WhatsApp Sekarang</span>
            </a>
          </article>

          {/* Card 2: Hotline Darurat SOS 24 Jam */}
          <article className="contact-channel-card">
            <div className="channel-card-stripe stripe-red" aria-hidden="true" />
            <div className="channel-card-header">
              <div className="channel-icon-wrap icon-emergency" aria-hidden="true">
                <RiCustomerService2Line />
              </div>
              <span className="channel-badge badge-urgent">Siaga 24 Jam</span>
            </div>
            <h2 className="channel-title">Hotline Darurat (SOS)</h2>
            <p className="channel-desc">
              Kendaraan mogok, kendala mesin, atau butuh bantuan Service on Road di area Bekasi & Jabodetabek 24/7.
            </p>
            <a href="tel:02188347777" className="channel-action-btn btn-emergency">
              <HiOutlinePhone size={18} />
              <span>Telepon: (021) 8834 7777</span>
            </a>
          </article>

          {/* Card 3: Showroom & Bengkel Terpadu */}
          <article className="contact-channel-card">
            <div className="channel-card-stripe stripe-yellow" aria-hidden="true" />
            <div className="channel-card-header">
              <div className="channel-icon-wrap icon-location" aria-hidden="true">
                <HiOutlineMapPin />
              </div>
              <span className="channel-badge">Gedung Resmi</span>
            </div>
            <h2 className="channel-title">Kunjungan Showroom</h2>
            <p className="channel-desc">
              Jl. Ir. H. Juanda No. 35 Bulak Kapal, Bekasi Timur. Uji coba test drive unit dan nikmati fasilitas Noah Coffee gratis.
            </p>
            <a
              href="https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6"
              target="_blank"
              rel="noopener noreferrer"
              className="channel-action-btn btn-location"
            >
              <RiDirectionLine size={18} />
              <span>Buka Petunjuk Arah</span>
            </a>
          </article>

          {/* Card 4: Keamanan Rekening Sah */}
          <article className="contact-channel-card">
            <div className="channel-card-stripe stripe-blue" aria-hidden="true" />
            <div className="channel-card-header">
              <div className="channel-icon-wrap icon-trust" aria-hidden="true">
                <HiOutlineShieldCheck />
              </div>
              <span className="channel-badge badge-official">Anti-Penipuan</span>
            </div>
            <h2 className="channel-title">Rekening Resmi Sah</h2>
            <p className="channel-desc">
              Semua transfer DP/pelunasan wajib ke <strong>BCA: 3425419999</strong> a/n PT Sun Star Prima Motor.
            </p>
            <button
              type="button"
              className="channel-action-btn btn-trust"
              onClick={handleCopyBank}
            >
              {copiedBank ? <HiOutlineCheck size={18} /> : <HiOutlineDocumentDuplicate size={18} />}
              <span>{copiedBank ? 'No. Rekening Tersalin!' : 'Salin BCA: 3425419999'}</span>
            </button>
          </article>
        </div>
      </section>

      {/* ====================================================================
          4. MAIN SECTION: 3 ACCORDION / COLLAPSE FORMS
          ==================================================================== */}
      <section className="contact-accordion-section" aria-label="Pusat Formulir Layanan Dealer">
        <div className="accordion-section-header">
          <span className="accordion-section-kicker">Layanan Terpadu Satu Pintu</span>
          <h2 className="accordion-section-title">Pusat Bantuan & Permohonan Konsumen</h2>
          <p className="accordion-section-subtitle">
            Pilih jenis formulir di bawah ini. Sistem accordion interaktif memudahkan Anda berlangganan update promo, meminta panggilan balik, atau melaporkan keluhan resmi.
          </p>
        </div>

        <div className="contact-accordion-list" role="region" aria-label="Daftar Formulir Kontak">
          {/* ----------------------------------------------------------------
              ACCORDION 1: BERI TAHU UPDATE & PROMO (BERLANGGANAN)
              ---------------------------------------------------------------- */}
          <div className={`contact-accordion-item ${activeAccordion === 'promo' ? 'is-open' : ''}`}>
            <button
              type="button"
              className="accordion-header-btn"
              onClick={() => toggleAccordion('promo')}
              aria-expanded={activeAccordion === 'promo'}
            >
              <div className="accordion-header-left">
                <div className="accordion-icon-wrap icon-promo-bg" aria-hidden="true">
                  <HiOutlineEnvelope />
                </div>
                <div className="accordion-title-meta">
                  <h3 className="accordion-item-title">1. Beri Tahu Update & Promo</h3>
                  <p className="accordion-item-desc">
                    Dapatkan kabar eksklusif diskon cashback bulanan, pameran otomotif, dan rilis varian terbaru.
                  </p>
                </div>
              </div>
              <div className="accordion-header-right">
                <HiChevronDown className="accordion-chevron-icon" aria-hidden="true" />
              </div>
            </button>

            {activeAccordion === 'promo' && (
              <div className="accordion-content-collapse">
                {submittedPromo ? (
                  <div className="form-success-box" role="alert">
                    <div className="success-icon-wrap">
                      <HiOutlineCheck />
                    </div>
                    <h4 className="success-title">Berhasil Berlangganan!</h4>
                    <p className="success-desc">
                      Terima kasih! Alamat email <strong>{promoEmail}</strong> telah terdaftar. Kami akan mengirimkan buletin promo eksklusif dan penawaran terbaik berkala.
                    </p>
                    <div className="success-actions-wrap">
                      <button
                        type="button"
                        className="btn-success-reset"
                        onClick={() => {
                          setSubmittedPromo(false)
                          setPromoEmail('')
                        }}
                      >
                        Daftarkan Email Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="accordion-form-inner" onSubmit={handleSubmitPromo}>
                    <p className="form-guide-text">
                      Masukkan alamat email aktif Anda untuk menerima informasi promo resmi, penawaran bunga rendah, dan voucher diskon servis dealer.
                    </p>
                    <div className="promo-input-row">
                      <div className="form-field-group promo-field-flex">
                        <label htmlFor="promo-email" className="field-label">
                          Alamat Email Anda *
                        </label>
                        <input
                          id="promo-email"
                          type="email"
                          required
                          className="field-input"
                          placeholder="nama@email.com"
                          value={promoEmail}
                          onChange={(e) => setPromoEmail(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="form-submit-btn promo-submit-btn">
                        <HiOutlinePaperAirplane size={18} />
                        <span>Langganan Update</span>
                      </button>
                    </div>
                    <div className="form-guarantee-note promo-guarantee">
                      <HiOutlineShieldCheck size={17} color="#10B981" />
                      <span>Bebas spam. Anda dapat berhenti berlangganan kapan saja dengan 1-klik.</span>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------
              ACCORDION 2: HUBUNGI SAYA (NAMA & WHATSAPP)
              ---------------------------------------------------------------- */}
          <div className={`contact-accordion-item ${activeAccordion === 'hubungi' ? 'is-open' : ''}`}>
            <button
              type="button"
              className="accordion-header-btn"
              onClick={() => toggleAccordion('hubungi')}
              aria-expanded={activeAccordion === 'hubungi'}
            >
              <div className="accordion-header-left">
                <div className="accordion-icon-wrap icon-hubungi-bg" aria-hidden="true">
                  <RiWhatsappLine />
                </div>
                <div className="accordion-title-meta">
                  <h3 className="accordion-item-title">2. Hubungi Saya</h3>
                  <p className="accordion-item-desc">
                    Permintaan panggilan balik dari konsultan resmi kami untuk konsultasi cepat via WhatsApp.
                  </p>
                </div>
              </div>
              <div className="accordion-header-right">
                <HiChevronDown className="accordion-chevron-icon" aria-hidden="true" />
              </div>
            </button>

            {activeAccordion === 'hubungi' && (
              <div className="accordion-content-collapse">
                {submittedContact ? (
                  <div className="form-success-box" role="alert">
                    <div className="success-icon-wrap">
                      <HiOutlineCheck />
                    </div>
                    <h4 className="success-title">Permintaan Diterima!</h4>
                    <p className="success-desc">
                      Terima kasih, <strong>{contactName}</strong>. Konsultan resmi Mitsubishi Sun Margahayu akan segera menghubungi nomor WhatsApp <strong>{contactPhone}</strong> Anda.
                    </p>
                    <div className="success-actions-wrap">
                      <a
                        href={`https://wa.me/6281288347777?text=${waContactMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-success-wa"
                      >
                        <RiWhatsappLine size={18} />
                        <span>Chat WhatsApp Cepat Sekarang</span>
                      </a>
                      <button
                        type="button"
                        className="btn-success-reset"
                        onClick={() => {
                          setSubmittedContact(false)
                          setContactName('')
                          setContactPhone('')
                        }}
                      >
                        Kirim Permintaan Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="accordion-form-inner" onSubmit={handleSubmitContact}>
                    <div className="form-two-cols">
                      <div className="form-field-group">
                        <label htmlFor="hubungi-name" className="field-label">
                          Nama Lengkap *
                        </label>
                        <input
                          id="hubungi-name"
                          type="text"
                          required
                          className="field-input"
                          placeholder="Masukkan nama lengkap Anda"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="hubungi-phone" className="field-label">
                          Nomor WhatsApp *
                        </label>
                        <input
                          id="hubungi-phone"
                          type="tel"
                          required
                          className="field-input"
                          placeholder="Contoh: 081234567890"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="form-submit-btn">
                        <HiOutlinePaperAirplane size={18} />
                        <span>Minta Dihubungi</span>
                      </button>

                      <div className="form-guarantee-note">
                        <HiOutlineShieldCheck size={18} color="#10B981" />
                        <span>Respon rata-rata di bawah 5 menit pada jam operasional</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------
              ACCORDION 3: LAPOR KELUHAN (PENJUALAN / SERVICE / BODY PAINT)
              ---------------------------------------------------------------- */}
          <div className={`contact-accordion-item ${activeAccordion === 'keluhan' ? 'is-open' : ''}`}>
            <button
              type="button"
              className="accordion-header-btn"
              onClick={() => toggleAccordion('keluhan')}
              aria-expanded={activeAccordion === 'keluhan'}
            >
              <div className="accordion-header-left">
                <div className="accordion-icon-wrap icon-keluhan-bg" aria-hidden="true">
                  <HiOutlineShieldExclamation />
                </div>
                <div className="accordion-title-meta">
                  <h3 className="accordion-item-title">3. Lapor Keluhan</h3>
                  <p className="accordion-item-desc">
                    Kanal penanganan resmi langsung diaudit oleh Customer Satisfaction Manager (CSM).
                  </p>
                </div>
              </div>
              <div className="accordion-header-right">
                <HiChevronDown className="accordion-chevron-icon" aria-hidden="true" />
              </div>
            </button>

            {activeAccordion === 'keluhan' && (
              <div className="accordion-content-collapse">
                {submittedComplaint ? (
                  <div className="form-success-box" role="alert">
                    <div className="success-icon-wrap">
                      <HiOutlineCheck />
                    </div>
                    <h4 className="success-title">Laporan Keluhan Diterima</h4>
                    <p className="success-desc">
                      Terima kasih atas masukan berharga Anda, <strong>{complaintName}</strong>. Laporan keluhan divisi <em>{complaintTypeLabel}</em> Anda telah diteruskan ke Customer Satisfaction Manager dan pimpinan cabang untuk investigasi prioritas. Kami akan menghubungi nomor <strong>{complaintPhone}</strong> dalam waktu maksimal 1x24 jam kerja.
                    </p>
                    <div className="success-actions-wrap">
                      <a
                        href={`https://wa.me/6281288347777?text=${waComplaintMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-success-wa"
                      >
                        <RiWhatsappLine size={18} />
                        <span>Kirim Salinan via WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        className="btn-success-reset"
                        onClick={() => {
                          setSubmittedComplaint(false)
                          setComplaintName('')
                          setComplaintPhone('')
                          setComplaintSalesName('')
                          setComplaintPlate('')
                          setComplaintNotes('')
                        }}
                      >
                        Kirim Laporan Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="accordion-form-inner" onSubmit={handleSubmitComplaint}>
                    {/* Pilih Jenis Keluhan */}
                    <div className="form-field-group mb-4">
                      <label className="field-label">
                        Pilih Jenis Layanan yang Dikeluhkan *
                      </label>
                      <div className="complaint-type-selector" role="radiogroup" aria-label="Jenis Layanan Keluhan">
                        <button
                          type="button"
                          className={`type-pill-btn ${complaintType === 'penjualan' ? 'is-active' : ''}`}
                          onClick={() => setComplaintType('penjualan')}
                          role="radio"
                          aria-checked={complaintType === 'penjualan'}
                        >
                          <RiCarLine />
                          <span>Penjualan</span>
                        </button>
                        <button
                          type="button"
                          className={`type-pill-btn ${complaintType === 'service' ? 'is-active' : ''}`}
                          onClick={() => setComplaintType('service')}
                          role="radio"
                          aria-checked={complaintType === 'service'}
                        >
                          <RiToolsLine />
                          <span>Service</span>
                        </button>
                        <button
                          type="button"
                          className={`type-pill-btn ${complaintType === 'bodypaint' ? 'is-active' : ''}`}
                          onClick={() => setComplaintType('bodypaint')}
                          role="radio"
                          aria-checked={complaintType === 'bodypaint'}
                        >
                          <HiOutlineSparkles />
                          <span>Body Paint</span>
                        </button>
                      </div>
                    </div>

                    {/* Common Fields: Nama & WhatsApp */}
                    <div className="form-two-cols">
                      <div className="form-field-group">
                        <label htmlFor="complaint-name" className="field-label">
                          Nama Lengkap *
                        </label>
                        <input
                          id="complaint-name"
                          type="text"
                          required
                          className="field-input"
                          placeholder="Masukkan nama lengkap Anda"
                          value={complaintName}
                          onChange={(e) => setComplaintName(e.target.value)}
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="complaint-phone" className="field-label">
                          Nomor WhatsApp *
                        </label>
                        <input
                          id="complaint-phone"
                          type="tel"
                          required
                          className="field-input"
                          placeholder="Contoh: 081234567890"
                          value={complaintPhone}
                          onChange={(e) => setComplaintPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC FIELDS: Jika Penjualan -> Kendaraan & Nama Sales */}
                    {complaintType === 'penjualan' && (
                      <div className="form-two-cols">
                        <div className="form-field-group">
                          <label htmlFor="complaint-vehicle" className="field-label">
                            Kendaraan *
                          </label>
                          <select
                            id="complaint-vehicle"
                            className="field-select"
                            value={complaintVehicle}
                            onChange={(e) => setComplaintVehicle(e.target.value)}
                          >
                            {VEHICLE_OPTIONS.map((veh) => (
                              <option key={veh} value={veh}>
                                {veh}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field-group">
                          <label htmlFor="complaint-sales" className="field-label">
                            Nama Sales *
                          </label>
                          <input
                            id="complaint-sales"
                            type="text"
                            required
                            className="field-input"
                            placeholder="Nama wiraniaga / sales yang menangani"
                            value={complaintSalesName}
                            onChange={(e) => setComplaintSalesName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC FIELDS: Jika Service atau Body Paint -> No Polisi */}
                    {(complaintType === 'service' || complaintType === 'bodypaint') && (
                      <div className="form-field-group">
                        <label htmlFor="complaint-plate" className="field-label">
                          No. Polisi / Plat Kendaraan *
                        </label>
                        <input
                          id="complaint-plate"
                          type="text"
                          required
                          className="field-input"
                          placeholder="Contoh: B 1234 ABC"
                          value={complaintPlate}
                          onChange={(e) => setComplaintPlate(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Catatan / Keluhan */}
                    <div className="form-field-group">
                      <label htmlFor="complaint-notes" className="field-label">
                        Catatan Keluhan *
                      </label>
                      <textarea
                        id="complaint-notes"
                        rows="4"
                        required
                        className="field-textarea"
                        placeholder="Jelaskan detail kendala, kronologi, atau ketidaksesuaian pelayanan yang Anda alami..."
                        value={complaintNotes}
                        onChange={(e) => setComplaintNotes(e.target.value)}
                      />
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="form-submit-btn">
                        <HiOutlinePaperAirplane size={18} />
                        <span>Kirim Laporan Keluhan</span>
                      </button>

                      <div className="form-guarantee-note">
                        <HiOutlineShieldCheck size={18} color="#10B981" />
                        <span>Kerahasiaan data pelapor dijamin 100% oleh manajemen dealer</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. JADWAL OPERASIONAL & PETA LOKASI RESMI (BERDAMPINGAN DI DESKTOP)
          ==================================================================== */}
      <section className="contact-location-schedule-section" aria-label="Jadwal Operasional dan Lokasi Gedung Showroom">
        <div className="location-schedule-grid">
          {/* KOLOM KIRI: KARTU JAM OPERASIONAL DEALER */}
          <div className="location-schedule-card">
            <h3 className="sidebar-card-title">
              <HiOutlineClock className="sidebar-title-icon" />
              <span>Jam Operasional Dealer</span>
            </h3>

            <div className="schedule-list">
              <div className="schedule-item">
                <div className="schedule-header">
                  <span className="schedule-dept">Showroom Penjualan</span>
                  <span className="schedule-status-tag">Setiap Hari</span>
                </div>
                <span className="schedule-hours">Senin – Sabtu: 08:30 – 19:00 WIB</span>
                <span className="schedule-hours">Minggu / Libur: 09:00 – 17:00 WIB</span>
              </div>

              <div className="schedule-item">
                <div className="schedule-header">
                  <span className="schedule-dept">Bengkel Resmi</span>
                  <span className="schedule-status-tag">Senin – Sabtu</span>
                </div>
                <span className="schedule-hours">Senin – Jumat: 08:00 – 16:30 WIB</span>
                <span className="schedule-hours">Sabtu: 08:00 – 15:00 WIB</span>
              </div>

              <div className="schedule-item">
                <div className="schedule-header">
                  <span className="schedule-dept">Layanan Darurat & Sunny AI</span>
                  <span className="schedule-status-tag">24 Jam</span>
                </div>
                <span className="schedule-hours">Siaga setiap hari termasuk tanggal merah</span>
              </div>
            </div>

            <div className="schedule-footer-hint">
              <p>
                Butuh bantuan di luar jam kerja operasional? Asisten virtual <strong>Sunny</strong> siaga menjawab pertanyaan Anda 24 jam penuh.
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: PETA LOKASI RESMI GOOGLE MAPS */}
          <div className="map-card-wrapper">
            <div className="map-header-bar">
              <div className="map-header-left">
                <span className="map-kicker">Lokasi Dealer Resmi</span>
                <h3 className="map-dealer-name">MITSUBISHI SUN MARGAHAYU (PT. SUN STAR PRIMA MOTOR) OFFICIAL</h3>
                <p className="map-address-text">
                  Jl. Ir. H. Juanda No. 35 Bulak Kapal, RT.001/RW.001, Aren Jaya, Kec. Bekasi Timur, Kota Bekasi, Jawa Barat 17111
                </p>
              </div>

              <a
                href="https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6"
                target="_blank"
                rel="noopener noreferrer"
                className="map-directions-btn"
              >
                <RiDirectionLine size={19} />
                <span>Buka Rute di Google Maps</span>
                <HiOutlineArrowRight size={16} />
              </a>
            </div>

            <div className="map-iframe-container">
              <iframe
                title="Peta Lokasi MITSUBISHI SUN MARGAHAYU (PT. SUN STAR PRIMA MOTOR) OFFICIAL"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.097769966587!2d107.02451547363883!3d-6.250846761200644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698fa99dbded31%3A0x19c817d443b35a3a!2sMITSUBISHI%20BEKASI%20TIMUR%20(PT.SUN%20STAR%20PRIMA%20MOTOR)%20OFFICIAL!5e0!3m2!1sid!2sid!4v1792233105635!5m2!1sid!2sid"
                className="map-iframe"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="map-perks-strip">
              <span className="perks-label">Fasilitas Pengunjung Dealer:</span>
              <div className="perks-pills-row">
                <span className="perk-pill">
                  <RiCarLine className="perk-pill-icon" />
                  <span>Area Parkir Luas</span>
                </span>
                <span className="perk-pill">
                  <HiOutlineSparkles className="perk-pill-icon" />
                  <span>Voucher Noah Coffee Gratis</span>
                </span>
                <span className="perk-pill">
                  <RiToolsLine className="perk-pill-icon" />
                  <span>Shuttle Service</span>
                </span>
                <span className="perk-pill">
                  <HiOutlineSparkles className="perk-pill-icon" />
                  <span>Wi-Fi 6 Lounge & Charging</span>
                </span>
                <span className="perk-pill">
                  <HiOutlineSparkles className="perk-pill-icon" />
                  <span>Kids Zone Playground</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
