import { useState, useEffect, useCallback } from 'react'
import {
  HiOutlineUserGroup,
  HiOutlineArrowPath,
  HiOutlinePlus,
  HiOutlineArrowPathRoundedSquare,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles
} from 'react-icons/hi2'
import './PortalOrganization.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalOrganization() {
  const [data, setData] = useState({
    direksi: [],
    csm: [],
    managerial: [],
    supervisor: []
  })
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  // Modals state
  const [activeModal, setActiveModal] = useState(null) // 'replace' | 'add' | 'edit' | 'deactivate'
  const [targetEmployee, setTargetEmployee] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formLevel, setFormLevel] = useState('managerial')
  const [formDepartment, setFormDepartment] = useState('')
  const [formPhotoUrl, setFormPhotoUrl] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTenure, setFormTenure] = useState('')
  const [formNik, setFormNik] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Fetch structured employees
  const fetchOrganization = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/employees?structured=1&status=active`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.error('Gagal mengambil data struktur organisasi:', err)
      setFeedback({ type: 'error', message: 'Gagal memuat data dari database MySQL.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrganization()
  }, [fetchOrganization])

  // Open "Ganti Pejabat" Modal (Rule: Direksi & CSM, or any tier)
  const openReplaceModal = (emp) => {
    setTargetEmployee(emp)
    setFormName('')
    setFormRole(emp.role || '')
    setFormLevel(emp.level)
    setFormDepartment(emp.department || '')
    setFormPhotoUrl('https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg')
    setFormDescription('')
    setFormTenure('Baru Menjabat')
    setFormNik('')
    setFormBadge(emp.badge || '')
    setFormNotes('')
    setActiveModal('replace')
  }

  // Open "Tambah Jabatan Baru" Modal (Only for Managerial & Supervisor)
  const openAddModal = (level) => {
    setTargetEmployee(null)
    setFormName('')
    setFormRole(level === 'supervisor' ? 'Supervisor' : '')
    setFormLevel(level)
    setFormDepartment('')
    setFormPhotoUrl('https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg')
    setFormDescription('')
    setFormTenure('Baru Bergabung')
    setFormNik('')
    setFormBadge(level === 'supervisor' ? 'Tim III' : '')
    setFormNotes('')
    setActiveModal('add')
  }

  // Open "Edit Info" Modal
  const openEditModal = (emp) => {
    setTargetEmployee(emp)
    setFormName(emp.name || '')
    setFormRole(emp.role || '')
    setFormLevel(emp.level)
    setFormDepartment(emp.department || '')
    setFormPhotoUrl(emp.photo_url || '')
    setFormDescription(emp.description || '')
    setFormTenure(emp.tenure || '')
    setFormNik(emp.nik || '')
    setFormBadge(emp.badge || '')
    setFormNotes('')
    setActiveModal('edit')
  }

  // Open "Deactivate" Modal
  const openDeactivateModal = (emp) => {
    setTargetEmployee(emp)
    setFormNotes('')
    setActiveModal('deactivate')
  }

  const closeModal = () => {
    setActiveModal(null)
    setTargetEmployee(null)
    setIsSubmitting(false)
  }

  // Handle Form Submission
  const handleSubmitModal = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      if (activeModal === 'replace') {
        // Ganti Pejabat: Nonaktifkan lama, buat baru
        const res = await fetch(`${API_BASE_URL}/employees/${targetEmployee.id}/replace`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            department: formDepartment,
            photo_url: formPhotoUrl,
            description: formDescription,
            tenure: formTenure,
            nik: formNik,
            badge: formBadge,
            notes: formNotes
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchOrganization()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal mengganti pejabat.' })
        }
      } else if (activeModal === 'add') {
        // Tambah Jabatan Baru (Manajerial / SPV)
        const res = await fetch(`${API_BASE_URL}/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            level: formLevel,
            department: formDepartment,
            photo_url: formPhotoUrl,
            description: formDescription,
            tenure: formTenure,
            nik: formNik,
            badge: formBadge
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchOrganization()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal menambahkan jabatan baru.' })
        }
      } else if (activeModal === 'edit') {
        // Edit Informasi Pejabat
        const res = await fetch(`${API_BASE_URL}/employees/${targetEmployee.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            department: formDepartment,
            photo_url: formPhotoUrl,
            description: formDescription,
            tenure: formTenure,
            nik: formNik,
            badge: formBadge
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchOrganization()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal memperbarui data.' })
        }
      } else if (activeModal === 'deactivate') {
        // Nonaktifkan Pejabat
        const res = await fetch(`${API_BASE_URL}/employees/${targetEmployee.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            status: 'inactive',
            reason: formNotes || 'Dinonaktifkan melalui portal manajemen organisasi'
          })
        })
        const json = await res.json()
        if (json.success) {
          setFeedback({ type: 'success', message: json.message })
          closeModal()
          fetchOrganization()
        } else {
          setFeedback({ type: 'error', message: json.message || 'Gagal menonaktifkan pejabat.' })
        }
      }
    } catch (err) {
      console.error('Submission error:', err)
      setFeedback({ type: 'error', message: 'Terjadi kendala jaringan saat memproses data.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="portal-org-page">
      {/* Page Header */}
      <div className="portal-org-header">
        <div>
          <h2 className="portal-org-title">Struktur Organisasi Dealer</h2>
          <p className="portal-org-subtitle">
            Kelola hierarki pimpinan cabang, manajerial, dan supervisor. Pejabat yang digantikan otomatis diarsipkan ke tab Nonaktif.
          </p>
        </div>

        <button
          type="button"
          className="portal-org-refresh-btn"
          onClick={fetchOrganization}
          disabled={loading}
        >
          <HiOutlineArrowPath size={16} className={loading ? 'spin-icon' : ''} />
          <span>Segarkan Struktur</span>
        </button>
      </div>

      {/* Rules Notice Card */}
      <div className="portal-org-notice-card">
        <HiOutlineSparkles size={20} className="notice-icon" />
        <div className="notice-text">
          <strong>Aturan Tata Kelola Struktur Dealer:</strong>
          <span>
            Posisi <strong>Direksi (Branch Manager)</strong> dan <strong>Customer Satisfaction Manager (CSM)</strong> adalah posisi tunggal yang hanya dapat diganti (pejabat lama diarsipkan nonaktif, pejabat baru diangkat). Sedangkan posisi <strong>Manajerial</strong> dan <strong>Supervisor</strong> dapat ditambah jabatan baru di level tersebut.
          </span>
        </div>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div className={`portal-org-alert ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* ====================================================================
          TIER 1: LEVEL DIREKSI (BRANCH MANAGER)
          ==================================================================== */}
      <section className="portal-org-tier-section">
        <div className="tier-header-row">
          <div className="tier-title-wrap">
            <span className="tier-badge badge-direksi">LEVEL 01</span>
            <h3 className="tier-title">Pimpinan Cabang / Direksi</h3>
          </div>
          <span className="tier-rule-tag">Jabatan Tunggal • Khusus Ganti Pejabat</span>
        </div>

        <div className="tier-cards-container">
          {data.direksi.length === 0 ? (
            <div className="tier-empty-card">Belum ada pejabat Direksi aktif.</div>
          ) : (
            data.direksi.map((emp) => (
              <div key={emp.id} className="portal-org-card card-direksi">
                <div className="org-card-photo-box">
                  <img
                    src={emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                    alt={emp.name}
                    className="org-card-photo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                    }}
                  />
                  {emp.badge && <span className="org-card-badge-pill">{emp.badge}</span>}
                </div>

                <div className="org-card-body">
                  <span className="org-card-nik">{emp.nik || 'SNY-DIR-0101'}</span>
                  <h4 className="org-card-name">{emp.name}</h4>
                  <span className="org-card-role text-direksi">{emp.role}</span>
                  <span className="org-card-dept">{emp.department}</span>
                  <p className="org-card-desc">{emp.description}</p>
                  <span className="org-card-tenure">{emp.tenure}</span>

                  <div className="org-card-actions">
                    <button
                      type="button"
                      className="btn-card-replace"
                      onClick={() => openReplaceModal(emp)}
                      title="Ganti Pejabat (Pejabat lama akan dialihkan ke arsip nonaktif)"
                    >
                      <HiOutlineArrowPathRoundedSquare size={15} />
                      <span>Ganti Pejabat</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => openEditModal(emp)}
                      title="Edit Foto & Keterangan"
                    >
                      <HiOutlinePencilSquare size={15} />
                      <span>Edit Info</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====================================================================
          TIER 2: LEVEL CSM (CUSTOMER SATISFACTION MANAGER)
          ==================================================================== */}
      <section className="portal-org-tier-section">
        <div className="tier-header-row">
          <div className="tier-title-wrap">
            <span className="tier-badge badge-csm">LEVEL 02</span>
            <h3 className="tier-title">Customer Satisfaction Manager (CSM)</h3>
          </div>
          <span className="tier-rule-tag">Staf Khusus Mutu • Khusus Ganti Pejabat</span>
        </div>

        <div className="tier-cards-container">
          {data.csm.length === 0 ? (
            <div className="tier-empty-card">Belum ada pejabat CSM aktif.</div>
          ) : (
            data.csm.map((emp) => (
              <div key={emp.id} className="portal-org-card card-csm">
                <div className="org-card-photo-box">
                  <img
                    src={emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                    alt={emp.name}
                    className="org-card-photo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                    }}
                  />
                  {emp.badge && <span className="org-card-badge-pill">{emp.badge}</span>}
                </div>

                <div className="org-card-body">
                  <span className="org-card-nik">{emp.nik || 'SNY-CSM-0205'}</span>
                  <h4 className="org-card-name">{emp.name}</h4>
                  <span className="org-card-role text-csm">{emp.role}</span>
                  <span className="org-card-dept">{emp.department}</span>
                  <p className="org-card-desc">{emp.description}</p>
                  <span className="org-card-tenure">{emp.tenure}</span>

                  <div className="org-card-actions">
                    <button
                      type="button"
                      className="btn-card-replace"
                      onClick={() => openReplaceModal(emp)}
                      title="Ganti Pejabat (Pejabat lama akan dialihkan ke arsip nonaktif)"
                    >
                      <HiOutlineArrowPathRoundedSquare size={15} />
                      <span>Ganti Pejabat</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => openEditModal(emp)}
                      title="Edit Foto & Keterangan"
                    >
                      <HiOutlinePencilSquare size={15} />
                      <span>Edit Info</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====================================================================
          TIER 3: LEVEL MANAJERIAL
          ==================================================================== */}
      <section className="portal-org-tier-section">
        <div className="tier-header-row">
          <div className="tier-title-wrap">
            <span className="tier-badge badge-mgr">LEVEL 03</span>
            <h3 className="tier-title">Level Manajerial (Divisi Operasional)</h3>
          </div>

          <button
            type="button"
            className="btn-tier-add"
            onClick={() => openAddModal('managerial')}
          >
            <HiOutlinePlus size={16} />
            <span>Tambah Jabatan Manajerial</span>
          </button>
        </div>

        <div className="tier-cards-grid">
          {data.managerial.length === 0 ? (
            <div className="tier-empty-card">Belum ada pejabat manajerial aktif.</div>
          ) : (
            data.managerial.map((emp) => (
              <div key={emp.id} className="portal-org-card card-managerial">
                <div className="org-card-photo-box">
                  <img
                    src={emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                    alt={emp.name}
                    className="org-card-photo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                    }}
                  />
                  {emp.badge && <span className="org-card-badge-pill">{emp.badge}</span>}
                </div>

                <div className="org-card-body">
                  <span className="org-card-nik">{emp.nik || '-'}</span>
                  <h4 className="org-card-name">{emp.name}</h4>
                  <span className="org-card-role text-mgr">{emp.role}</span>
                  <span className="org-card-dept">{emp.department}</span>
                  <p className="org-card-desc">{emp.description}</p>
                  <span className="org-card-tenure">{emp.tenure}</span>

                  <div className="org-card-actions">
                    <button
                      type="button"
                      className="btn-card-replace"
                      onClick={() => openReplaceModal(emp)}
                      title="Ganti Pejabat"
                    >
                      <HiOutlineArrowPathRoundedSquare size={14} />
                      <span>Ganti</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => openEditModal(emp)}
                      title="Edit Info"
                    >
                      <HiOutlinePencilSquare size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-deactivate"
                      onClick={() => openDeactivateModal(emp)}
                      title="Nonaktifkan Pejabat ini"
                    >
                      <HiOutlineNoSymbol size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====================================================================
          TIER 4: LEVEL SUPERVISOR
          ==================================================================== */}
      <section className="portal-org-tier-section">
        <div className="tier-header-row">
          <div className="tier-title-wrap">
            <span className="tier-badge badge-spv">LEVEL 04</span>
            <h3 className="tier-title">Level Supervisor (SPV Sales)</h3>
          </div>

          <button
            type="button"
            className="btn-tier-add"
            onClick={() => openAddModal('supervisor')}
          >
            <HiOutlinePlus size={16} />
            <span>Tambah Supervisor Baru</span>
          </button>
        </div>

        <div className="tier-cards-grid">
          {data.supervisor.length === 0 ? (
            <div className="tier-empty-card">Belum ada supervisor aktif.</div>
          ) : (
            data.supervisor.map((emp) => (
              <div key={emp.id} className="portal-org-card card-supervisor">
                <div className="org-card-photo-box">
                  <img
                    src={emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                    alt={emp.name}
                    className="org-card-photo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                    }}
                  />
                  {emp.badge && <span className="org-card-badge-pill">{emp.badge}</span>}
                </div>

                <div className="org-card-body">
                  <span className="org-card-nik">{emp.nik || '-'}</span>
                  <h4 className="org-card-name">{emp.name}</h4>
                  <span className="org-card-role text-spv">{emp.role}</span>
                  <span className="org-card-dept">{emp.department}</span>
                  <p className="org-card-desc">{emp.description}</p>
                  
                  {/* Sales team tag */}
                  <div className="spv-sales-counter">
                    <HiOutlineUserGroup size={14} />
                    <span>{emp.sales_team ? emp.sales_team.length : 0} Sales Menginduk</span>
                  </div>

                  <span className="org-card-tenure">{emp.tenure}</span>

                  <div className="org-card-actions">
                    <button
                      type="button"
                      className="btn-card-replace"
                      onClick={() => openReplaceModal(emp)}
                      title="Ganti Pejabat"
                    >
                      <HiOutlineArrowPathRoundedSquare size={14} />
                      <span>Ganti</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => openEditModal(emp)}
                      title="Edit Info"
                    >
                      <HiOutlinePencilSquare size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-deactivate"
                      onClick={() => openDeactivateModal(emp)}
                      title="Nonaktifkan Supervisor ini"
                    >
                      <HiOutlineNoSymbol size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====================================================================
          MODAL DIALOG (GANTI / TAMBAH / EDIT / NONAKTIFKAN)
          ==================================================================== */}
      {activeModal && (
        <div className="portal-org-modal-backdrop" onClick={closeModal}>
          <div className="portal-org-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="org-modal-header">
              <div className="modal-header-meta">
                <span className="modal-tag">
                  {activeModal === 'replace'
                    ? 'PERGANTIAN PEJABAT'
                    : activeModal === 'add'
                    ? 'TAMBAH JABATAN BARU'
                    : activeModal === 'edit'
                    ? 'EDIT INFORMASI PEJABAT'
                    : 'KONFIRMASI NONAKTIF'}
                </span>
                <h3 className="modal-title">
                  {activeModal === 'replace'
                    ? `Ganti Pejabat: ${targetEmployee?.name}`
                    : activeModal === 'add'
                    ? `Tambah Jabatan Level ${formLevel.toUpperCase()}`
                    : activeModal === 'edit'
                    ? `Edit Data ${targetEmployee?.name}`
                    : `Nonaktifkan ${targetEmployee?.name}?`}
                </h3>
              </div>

              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {activeModal === 'deactivate' ? (
              <form onSubmit={handleSubmitModal} className="org-modal-form">
                <div className="modal-warning-box">
                  <HiOutlineExclamationTriangle size={24} className="warning-icon" />
                  <div>
                    <p>
                      Apakah Anda yakin ingin menonaktifkan <strong>{targetEmployee?.name}</strong> ({targetEmployee?.role})?
                    </p>
                    <p className="warning-sub">
                      Data ini akan otomatis dipindahkan ke halaman <strong>Nonaktif</strong> dan dapat diaktifkan kembali sewaktu-waktu.
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alasan / Catatan Penonaktifan:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Contoh: Mutasi ke cabang lain, pensiun, atau restrukturisasi..."
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
              <form onSubmit={handleSubmitModal} className="org-modal-form">
                {activeModal === 'replace' && (
                  <div className="modal-info-box">
                    <span>
                      Pejabat lama <strong>{targetEmployee?.name}</strong> akan otomatis diubah statusnya menjadi <strong>nonaktif</strong> dan dicatat ke arsip pergantian. Data di bawah adalah untuk <strong>pejabat baru</strong> yang akan menjabat.
                    </span>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Pejabat *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: Fendy Haryanto, S.E."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Jabatan / Role *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: Branch Manager, Service Manager..."
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nomor Induk Karyawan (NIK)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: SNY-DIR-0101"
                      value={formNik}
                      onChange={(e) => setFormNik(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Label Badge / Gelar Singkat</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Pimpinan Cabang, Tim I, Purna Jual"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Departemen / Lingkup Tugas</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Bengkel Resmi & Layanan Purna Jual"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Masa Pengalaman / Tenure</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: 12 Tahun Pengalaman"
                      value={formTenure}
                      onChange={(e) => setFormTenure(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">URL Foto Resmi</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                  />
                  <span className="form-help">
                    Gunakan tautan foto portrait berlatar belakang bersih atau default dealer.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Tanggung Jawab & Integritas</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Jelaskan peran kepemimpinan dan komitmen terhadap konsumen dealer..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {activeModal === 'replace' && (
                  <div className="form-group">
                    <label className="form-label">Catatan Pergantian Pejabat</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Keputusan Direksi No. 04/SK/2026"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>
                )}

                <div className="modal-footer-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Batal
                  </button>
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    <HiOutlineCheckCircle size={18} />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Struktur'}</span>
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
