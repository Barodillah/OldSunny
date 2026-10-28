import { useState, useEffect, useCallback } from 'react'
import {
  HiOutlineUserPlus,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineClock
} from 'react-icons/hi2'
import { RiWhatsappLine, RiShieldCheckLine } from 'react-icons/ri'
import { calculateTenure, parseDateForInput, formatIndonesianDate } from '../../utils/tenureHelper'
import './PortalSales.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalSales() {
  const [salesList, setSalesList] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpvFilter, setSelectedSpvFilter] = useState('all')
  const [feedback, setFeedback] = useState(null)

  // Modals state
  const [activeModal, setActiveModal] = useState(null) // 'add' | 'edit' | 'deactivate'
  const [targetSales, setTargetSales] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formName, setFormName] = useState('')
  const [formSpvId, setFormSpvId] = useState('')
  const [formPosition, setFormPosition] = useState('Sales Consultant')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formNik, setFormNik] = useState('')
  const [formPhotoUrl, setFormPhotoUrl] = useState('')
  const [formSpecialization, setFormSpecialization] = useState('')
  const [formTenure, setFormTenure] = useState('')
  const [formJoinedYear, setFormJoinedYear] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Fetch sales from API
  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', 'active')
      if (selectedSpvFilter !== 'all') params.append('supervisor_id', selectedSpvFilter)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const res = await fetch(`${API_BASE_URL}/sales?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setSalesList(json.data || [])
        setSupervisors(json.supervisors || [])
      }
    } catch (err) {
      console.error('Failed to load sales:', err)
      setFeedback({ type: 'error', message: 'Gagal memuat data sales dari database MySQL.' })
    } finally {
      setLoading(false)
    }
  }, [selectedSpvFilter, searchTerm])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  // Open "Tambah Sales" Modal
  const openAddModal = () => {
    setTargetSales(null)
    setFormName('')
    setFormSpvId(supervisors.length > 0 ? String(supervisors[0].id) : '')
    setFormPosition('Sales Consultant')
    setFormPhone('')
    setFormEmail('')
    setFormNik('')
    setFormPhotoUrl('https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg')
    setFormSpecialization('')
    const todayStr = new Date().toISOString().split('T')[0]
    setFormTenure(todayStr)
    setFormJoinedYear(todayStr.split('-')[0])
    setFormNotes('')
    setActiveModal('add')
  }

  // Open "Edit Sales" Modal
  const openEditModal = (sales) => {
    setTargetSales(sales)
    setFormName(sales.name || '')
    setFormSpvId(sales.supervisor_id ? String(sales.supervisor_id) : '')
    setFormPosition(sales.position || 'Sales Consultant')
    setFormPhone(sales.phone || '')
    setFormEmail(sales.email || '')
    setFormNik(sales.nik || '')
    setFormPhotoUrl(sales.photo_url || '')
    setFormSpecialization(sales.specialization || '')
    setFormTenure(parseDateForInput(sales.tenure, sales.joined_year))
    setFormJoinedYear(sales.joined_year || '')
    setFormNotes(sales.notes || '')
    setActiveModal('edit')
  }

  // Open "Nonaktifkan Sales" Modal
  const openDeactivateModal = (sales) => {
    setTargetSales(sales)
    setFormNotes('')
    setActiveModal('deactivate')
  }

  const closeModal = () => {
    setActiveModal(null)
    setTargetSales(null)
    setIsSubmitting(false)
  }

  // Submit Modal Action
  const handleSubmitModal = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      if (activeModal === 'add') {
        // Validation: Must select supervisor
        if (!formSpvId) {
          setFeedback({ type: 'error', message: 'Sales wajib menginduk ke salah satu Supervisor.' })
          setIsSubmitting(false)
          return
        }

        const res = await fetch(`${API_BASE_URL}/sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: formName,
            supervisor_id: formSpvId,
            position: formPosition,
            phone: formPhone,
            email: formEmail,
            nik: formNik,
            photo_url: formPhotoUrl,
            specialization: formSpecialization,
            tenure: formTenure,
            joined_year: formJoinedYear || (formTenure ? formTenure.substring(0, 4) : String(new Date().getFullYear())),
            notes: formNotes
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchSales()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal menambahkan sales.' })
        }
      } else if (activeModal === 'edit') {
        const res = await fetch(`${API_BASE_URL}/sales/${targetSales.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: formName,
            supervisor_id: formSpvId,
            position: formPosition,
            phone: formPhone,
            email: formEmail,
            nik: formNik,
            photo_url: formPhotoUrl,
            specialization: formSpecialization,
            tenure: formTenure,
            joined_year: formJoinedYear || (formTenure ? formTenure.substring(0, 4) : undefined),
            notes: formNotes
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchSales()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal memperbarui sales.' })
        }
      } else if (activeModal === 'deactivate') {
        const res = await fetch(`${API_BASE_URL}/sales/${targetSales.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            status: 'inactive',
            reason: formNotes || 'Dinonaktifkan melalui portal manajemen sales'
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchSales()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal menonaktifkan sales.' })
        }
      }
    } catch (err) {
      console.error('Sales submission error:', err)
      setFeedback({ type: 'error', message: 'Terjadi kendala jaringan saat memproses data sales.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format WhatsApp Link
  const formatWaLink = (phone, name) => {
    if (!phone) return '#'
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('08')) clean = '62' + clean.substring(1)
    else if (clean.startsWith('8')) clean = '62' + clean
    return `https://wa.me/${clean}?text=${encodeURIComponent(`Halo ${name}, ada koordinasi prospek dealer.`)}`
  }

  return (
    <div className="portal-sales-page">
      {/* Page Header */}
      <div className="portal-sales-header">
        <div>
          <h2 className="portal-sales-title">Manajemen Sales</h2>
          <p className="portal-sales-subtitle">
            Daftar sales aktif dealer resmi. Sesuai aturan operasional, setiap sales wajib menginduk ke salah satu Supervisor (SPV).
          </p>
        </div>

        <div className="header-actions-group">
          <button
            type="button"
            className="portal-sales-refresh-btn"
            onClick={fetchSales}
            disabled={loading}
          >
            <HiOutlineArrowPath size={16} className={loading ? 'spin-icon' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            className="portal-btn-primary"
            onClick={openAddModal}
          >
            <HiOutlineUserPlus size={18} />
            <span>Tambah Sales Baru</span>
          </button>
        </div>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div className={`portal-sales-alert ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Toolbar Filter & Search */}
      <div className="portal-sales-toolbar-card">
        <div className="sales-toolbar-row">
          {/* Search Box */}
          <div className="sales-search-col">
            <div className="sales-search-wrap">
              <HiOutlineMagnifyingGlass size={16} className="sales-search-icon" />
              <input
                type="text"
                className="sales-search-input"
                placeholder="Cari nama sales, NIK, no telepon, spesialisasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="sales-search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <HiOutlineXMark size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Supervisor Filter Dropdown */}
          <div className="sales-spv-filter-col">
            <label className="spv-filter-label">Induk Supervisor:</label>
            <select
              className="sales-spv-select"
              value={selectedSpvFilter}
              onChange={(e) => setSelectedSpvFilter(e.target.value)}
            >
              <option value="all">Semua Supervisor ({salesList.length})</option>
              {supervisors.map((spv) => (
                <option key={spv.id} value={spv.id}>
                  SPV {spv.name} ({spv.badge || 'Aktif'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table Container */}
      <div className="portal-sales-table-card">
        <div className="sales-table-scroll-wrapper">
          <table className="portal-sales-table">
            <thead>
              <tr>
                <th>SALES & NIK</th>
                <th>SUPERVISOR PENGINDUK</th>
                <th>JABATAN / POSISI</th>
                <th>KONTAK WHATSAPP</th>
                <th>SPESIALISASI</th>
                <th>MASA KERJA</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && salesList.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Memuat data sales dari database...</td>
                </tr>
              ) : salesList.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Tidak ada data sales aktif yang sesuai filter.</td>
                </tr>
              ) : (
                salesList.map((sales) => (
                  <tr key={sales.id}>
                    {/* Sales Name & Photo */}
                    <td>
                      <div className="cell-sales-profile">
                        <img
                          src={sales.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                          alt={sales.name}
                          className="sales-avatar-img"
                          onError={(e) => {
                            e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                          }}
                        />
                        <div className="sales-meta-col">
                          <span className="sales-name-strong">{sales.name}</span>
                          <span className="sales-nik-badge">{sales.nik || 'SNY-SLS-XXXX'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Supervisor Penginduk */}
                    <td>
                      {sales.supervisor ? (
                        <div className="cell-spv-tag">
                          <span className="spv-badge-pill">{sales.supervisor.badge || 'SPV'}</span>
                          <span className="spv-name-text">{sales.supervisor.name}</span>
                        </div>
                      ) : (
                        <span className="text-danger-unassigned">Belum Menginduk (Wajib Diatur)</span>
                      )}
                    </td>

                    {/* Position */}
                    <td>
                      <span className="sales-position-badge">{sales.position || 'Sales Consultant'}</span>
                    </td>

                    {/* Contact */}
                    <td>
                      {sales.phone ? (
                        <a
                          href={formatWaLink(sales.phone, sales.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sales-wa-link"
                          title="Hubungi via WhatsApp"
                        >
                          <RiWhatsappLine size={15} />
                          <span>{sales.phone}</span>
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    {/* Specialization */}
                    <td>
                      <span className="sales-spec-text">{sales.specialization || '-'}</span>
                    </td>

                    {/* Masa Kerja Dinamis */}
                    <td>
                      <div className="cell-tenure-csi">
                        <span className="tenure-text">{calculateTenure(sales.tenure)}</span>
                        {formatIndonesianDate(sales.tenure) && (
                          <span className="tenure-subdate">Mulai {formatIndonesianDate(sales.tenure)}</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="cell-action-buttons">
                        <button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => openEditModal(sales)}
                          title="Edit Data Sales & Ganti SPV"
                        >
                          <HiOutlinePencilSquare size={15} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action-deactivate"
                          onClick={() => openDeactivateModal(sales)}
                          title="Nonaktifkan Sales (Pindahkan ke Arsip)"
                        >
                          <HiOutlineNoSymbol size={15} />
                          <span>Nonaktif</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL (TAMBAH / EDIT / NONAKTIFKAN SALES)
          ==================================================================== */}
      {activeModal && (
        <div className="portal-sales-modal-backdrop" onClick={closeModal}>
          <div className="portal-sales-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sales-modal-header">
              <div>
                <span className="modal-category-tag">
                  {activeModal === 'add'
                    ? 'REGISTRASI SALES BARU'
                    : activeModal === 'edit'
                    ? 'EDIT DATA SALES'
                    : 'NONAKTIFKAN SALES'}
                </span>
                <h3 className="sales-modal-title">
                  {activeModal === 'add'
                    ? 'Tambah Sales Baru'
                    : activeModal === 'edit'
                    ? `Perbarui Data: ${targetSales?.name}`
                    : `Konfirmasi Nonaktif: ${targetSales?.name}`}
                </h3>
              </div>

              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {activeModal === 'deactivate' ? (
              <form onSubmit={handleSubmitModal} className="sales-modal-form">
                <div className="modal-warning-box">
                  <HiOutlineExclamationTriangle size={24} className="warning-icon" />
                  <div>
                    <p>
                      Apakah Anda yakin ingin menonaktifkan <strong>{targetSales?.name}</strong>?
                    </p>
                    <p className="warning-sub">
                      Data sales ini akan dipindahkan ke tab <strong>Nonaktif</strong> dan dapat diaktifkan kembali sewaktu-waktu.
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alasan / Catatan Penonaktifan:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Contoh: Resign, mutasi, atau tidak aktif transaksi..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Batal
                  </button>
                  <button type="submit" className="btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Ya, Nonaktifkan'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitModal} className="sales-modal-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Sales *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: Agnes, S.E."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  {/* MANDATORY: Supervisor Penginduk */}
                  <div className="form-group">
                    <label className="form-label highlight-spv">
                      Supervisor Penginduk * (Wajib)
                    </label>
                    <select
                      className="form-select select-spv-required"
                      required
                      value={formSpvId}
                      onChange={(e) => setFormSpvId(e.target.value)}
                    >
                      <option value="" disabled>-- Pilih Supervisor --</option>
                      {supervisors.map((spv) => (
                        <option key={spv.id} value={spv.id}>
                          SPV {spv.name} ({spv.badge || 'Supervisor'})
                        </option>
                      ))}
                    </select>
                    <span className="form-help-spv">
                      Sesuai SOP dealer, sales wajib menginduk ke seorang supervisor aktif.
                    </span>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Jabatan / Jenjang Karir</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Senior Sales Executive, Sales Specialist..."
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Induk Karyawan (NIK)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: SNY-SLS-0412"
                      value={formNik}
                      onChange={(e) => setFormNik(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp / HP *</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      placeholder="Contoh: 081289001234"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Resmi</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="nama.sales@sunmotor.co.id"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Spesialisasi Kendaraan</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Family MPV, SUV, Niaga Canter..."
                      value={formSpecialization}
                      onChange={(e) => setFormSpecialization(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Bergabung</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formTenure}
                      onChange={(e) => {
                        setFormTenure(e.target.value)
                        if (e.target.value) {
                          setFormJoinedYear(e.target.value.substring(0, 4))
                        }
                      }}
                    />
                    <span className="form-help">
                      Masa kerja sales dihitung secara dinamis dari tahun ke tahun berdasarkan tanggal ini.
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">URL Foto Resmi Sales</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Penghargaan atau catatan kualifikasi khusus..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Batal
                  </button>
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    <HiOutlineCheckCircle size={18} />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Sales'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
