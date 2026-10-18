import { useState, useEffect, useCallback } from 'react'
import {
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineExclamationTriangle,
  HiOutlineUserGroup,
  HiOutlineIdentification,
  HiOutlineClock
} from 'react-icons/hi2'
import './PortalInactive.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalInactive() {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'employee' | 'sales'
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [inactiveData, setInactiveData] = useState({ employees: [], sales: [] })
  const [counts, setCounts] = useState({ employees: 0, sales: 0, total: 0 })
  const [activeSupervisors, setActiveSupervisors] = useState([])
  const [feedback, setFeedback] = useState(null)

  // Action Modals State
  const [modalType, setModalType] = useState(null) // 'reactivate' | 'delete'
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [recordCategory, setRecordCategory] = useState(null) // 'employee' | 'sales'
  const [targetSpvId, setTargetSpvId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch inactive records
  const fetchInactive = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('type', activeTab)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const res = await fetch(`${API_BASE_URL}/inactive?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setInactiveData(json.data || { employees: [], sales: [] })
        setCounts(json.counts || { employees: 0, sales: 0, total: 0 })
      }
    } catch (err) {
      console.error('Failed to load inactive records:', err)
      setFeedback({ type: 'error', message: 'Gagal memuat data nonaktif dari database.' })
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm])

  // Fetch active supervisors (in case we need to reactivate sales and reassign SPV)
  const fetchSupervisors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees?level=supervisor&status=active`)
      const json = await res.json()
      if (json.success && json.data) {
        setActiveSupervisors(json.data)
      }
    } catch (err) {
      console.error('Failed to load active supervisors:', err)
    }
  }, [])

  useEffect(() => {
    fetchInactive()
    fetchSupervisors()
  }, [fetchInactive, fetchSupervisors])

  // Open Reactivate Modal
  const openReactivateModal = (item, category) => {
    setSelectedRecord(item)
    setRecordCategory(category)
    if (category === 'sales') {
      setTargetSpvId(item.supervisor_id ? String(item.supervisor_id) : (activeSupervisors[0]?.id ? String(activeSupervisors[0].id) : ''))
    }
    setModalType('reactivate')
  }

  // Open Delete Modal
  const openDeleteModal = (item, category) => {
    setSelectedRecord(item)
    setRecordCategory(category)
    setModalType('delete')
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedRecord(null)
    setRecordCategory(null)
    setIsSubmitting(false)
  }

  // Execute Reactivate
  const handleReactivateSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      let url = ''
      let payload = { status: 'active' }

      if (recordCategory === 'employee') {
        url = `${API_BASE_URL}/employees/${selectedRecord.id}/status`
      } else {
        url = `${API_BASE_URL}/sales/${selectedRecord.id}/status`
        if (targetSpvId) {
          payload.supervisor_id = targetSpvId
        }
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (json.success) {
        setFeedback({ type: 'success', message: json.message })
        closeModal()
        fetchInactive()
      } else {
        setFeedback({ type: 'error', message: json.message || 'Gagal mengaktifkan kembali.' })
      }
    } catch (err) {
      console.error('Reactivation error:', err)
      setFeedback({ type: 'error', message: 'Terjadi kendala jaringan saat memulihkan status data.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Execute Permanent Delete
  const handleDeleteSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const url = recordCategory === 'employee'
        ? `${API_BASE_URL}/employees/${selectedRecord.id}`
        : `${API_BASE_URL}/sales/${selectedRecord.id}`

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })

      const json = await res.json()
      if (json.success) {
        setFeedback({ type: 'success', message: json.message })
        closeModal()
        fetchInactive()
      } else {
        setFeedback({ type: 'error', message: json.message || 'Gagal menghapus data secara permanen.' })
      }
    } catch (err) {
      console.error('Deletion error:', err)
      setFeedback({ type: 'error', message: 'Terjadi kendala jaringan saat menghapus data permanen.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const showEmployeeTable = activeTab === 'all' || activeTab === 'employee'
  const showSalesTable = activeTab === 'all' || activeTab === 'sales'

  return (
    <div className="portal-inactive-page">
      {/* Page Header */}
      <div className="portal-inactive-header">
        <div>
          <h2 className="portal-inactive-title">Arsip Nonaktif (Employee & Sales)</h2>
          <p className="portal-inactive-subtitle">
            Daftar data pegawai struktur organisasi dan sales yang dinonaktifkan dari sistem dealer.
          </p>
        </div>

        <button
          type="button"
          className="portal-inactive-refresh-btn"
          onClick={fetchInactive}
          disabled={loading}
        >
          <HiOutlineArrowPath size={16} className={loading ? 'spin-icon' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div className={`portal-inactive-alert ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="portal-inactive-controls-card">
        <div className="inactive-tabs-group">
          <button
            type="button"
            className={`inactive-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>Semua Nonaktif</span>
            <span className="tab-count-pill">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`inactive-tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee')}
          >
            <HiOutlineIdentification size={16} />
            <span>Struktur Organisasi</span>
            <span className="tab-count-pill">{counts.employees}</span>
          </button>
          <button
            type="button"
            className={`inactive-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <HiOutlineUserGroup size={16} />
            <span>Sales</span>
            <span className="tab-count-pill">{counts.sales}</span>
          </button>
        </div>

        {/* Search */}
        <div className="inactive-search-wrap">
          <HiOutlineMagnifyingGlass size={16} className="inactive-search-icon" />
          <input
            type="text"
            className="inactive-search-input"
            placeholder="Cari nama, NIK, jabatan, atau alasan nonaktif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="inactive-search-clear"
              onClick={() => setSearchTerm('')}
            >
              <HiOutlineXMark size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          TABEL 1: PEGAWAI STRUKTUR ORGANISASI (NONAKTIF)
          ==================================================================== */}
      {showEmployeeTable && (
        <div className="portal-inactive-card">
          <div className="inactive-card-header">
            <div className="card-title-wrap">
              <span className="card-badge-org">STRUKTUR ORGANISASI</span>
              <h3 className="card-title-text">Pegawai Organisasi Nonaktif</h3>
            </div>
            <span className="card-count-text">
              {inactiveData.employees.length} data ditemukan
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="portal-inactive-table">
              <thead>
                <tr>
                  <th>PEGAWAI & NIK</th>
                  <th>LEVEL HIERARKI</th>
                  <th>JABATAN / DEPARTEMEN</th>
                  <th>TGL NONAKTIF</th>
                  <th>ALASAN / CATATAN</th>
                  <th style={{ textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading && inactiveData.employees.length === 0 ? (
                  <tr className="table-empty-row">
                    <td colSpan={6}>Memuat data dari database...</td>
                  </tr>
                ) : inactiveData.employees.length === 0 ? (
                  <tr className="table-empty-row">
                    <td colSpan={6}>Tidak ada arsip pegawai organisasi yang nonaktif.</td>
                  </tr>
                ) : (
                  inactiveData.employees.map((emp) => (
                    <tr key={emp.id}>
                      {/* Name & Photo */}
                      <td>
                        <div className="cell-profile-wrap">
                          <img
                            src={emp.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                            alt={emp.name}
                            className="avatar-img-dimmed"
                            onError={(e) => {
                              e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                            }}
                          />
                          <div className="profile-meta">
                            <span className="profile-name-text">{emp.name}</span>
                            <span className="profile-nik-text">{emp.nik || 'SNY-EMP-XXXX'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td>
                        <span className={`level-pill-badge ${emp.level}`}>
                          {emp.level.toUpperCase()}
                        </span>
                      </td>

                      {/* Role & Dept */}
                      <td>
                        <div className="role-dept-wrap">
                          <span className="role-bold">{emp.role}</span>
                          <span className="dept-sub">{emp.department || '-'}</span>
                        </div>
                      </td>

                      {/* Deactivated Date */}
                      <td>
                        <span className="date-text">{formatDate(emp.deactivated_at)}</span>
                      </td>

                      {/* Deactivation Reason / Notes */}
                      <td>
                        <span className="reason-text" title={emp.deactivation_reason || emp.notes}>
                          {emp.deactivation_reason || emp.notes || 'Tanpa catatan khusus'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-wrap">
                          <button
                            type="button"
                            className="btn-action-restore"
                            onClick={() => openReactivateModal(emp, 'employee')}
                            title="Aktifkan Kembali ke Struktur Organisasi"
                          >
                            <HiOutlineArrowUturnLeft size={14} />
                            <span>Pulihkan</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => openDeleteModal(emp, 'employee')}
                            title="Hapus Permanen dari Database"
                          >
                            <HiOutlineTrash size={14} />
                            <span>Hapus</span>
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
      )}

      {/* ====================================================================
          TABEL 2: SALES NONAKTIF
          ==================================================================== */}
      {showSalesTable && (
        <div className="portal-inactive-card">
          <div className="inactive-card-header">
            <div className="card-title-wrap">
              <span className="card-badge-sales">SALES</span>
              <h3 className="card-title-text">Sales Nonaktif</h3>
            </div>
            <span className="card-count-text">
              {inactiveData.sales.length} data ditemukan
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="portal-inactive-table">
              <thead>
                <tr>
                  <th>SALES & NIK</th>
                  <th>SUPERVISOR TERAKHIR</th>
                  <th>JABATAN & KONTAK</th>
                  <th>TGL NONAKTIF</th>
                  <th>ALASAN / CATATAN</th>
                  <th style={{ textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading && inactiveData.sales.length === 0 ? (
                  <tr className="table-empty-row">
                    <td colSpan={6}>Memuat data dari database...</td>
                  </tr>
                ) : inactiveData.sales.length === 0 ? (
                  <tr className="table-empty-row">
                    <td colSpan={6}>Tidak ada arsip sales yang nonaktif.</td>
                  </tr>
                ) : (
                  inactiveData.sales.map((sales) => (
                    <tr key={sales.id}>
                      {/* Name & Photo */}
                      <td>
                        <div className="cell-profile-wrap">
                          <img
                            src={sales.photo_url || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                            alt={sales.name}
                            className="avatar-img-dimmed"
                            onError={(e) => {
                              e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                            }}
                          />
                          <div className="profile-meta">
                            <span className="profile-name-text">{sales.name}</span>
                            <span className="profile-nik-text">{sales.nik || 'SNY-SLS-XXXX'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Supervisor */}
                      <td>
                        {sales.supervisor ? (
                          <div className="spv-sub-badge">
                            <span className="spv-badge-pill">{sales.supervisor.badge || 'SPV'}</span>
                            <span>{sales.supervisor.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-spv">Belum Diatur</span>
                        )}
                      </td>

                      {/* Position & Phone */}
                      <td>
                        <div className="role-dept-wrap">
                          <span className="role-bold">{sales.position || 'Sales Consultant'}</span>
                          <span className="dept-sub">{sales.phone || '-'}</span>
                        </div>
                      </td>

                      {/* Deactivated Date */}
                      <td>
                        <span className="date-text">{formatDate(sales.deactivated_at)}</span>
                      </td>

                      {/* Deactivation Reason / Notes */}
                      <td>
                        <span className="reason-text" title={sales.notes}>
                          {sales.notes || 'Tanpa catatan khusus'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-wrap">
                          <button
                            type="button"
                            className="btn-action-restore"
                            onClick={() => openReactivateModal(sales, 'sales')}
                            title="Aktifkan Kembali Sales"
                          >
                            <HiOutlineArrowUturnLeft size={14} />
                            <span>Pulihkan</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => openDeleteModal(sales, 'sales')}
                            title="Hapus Permanen dari Database"
                          >
                            <HiOutlineTrash size={14} />
                            <span>Hapus</span>
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
      )}

      {/* ====================================================================
          MODAL: PULIHKAN / AKTIFKAN KEMBALI
          ==================================================================== */}
      {modalType === 'reactivate' && selectedRecord && (
        <div className="portal-inactive-modal-backdrop" onClick={closeModal}>
          <div className="portal-inactive-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-tag-restore">PULIHKAN DATA</span>
                <h3 className="modal-title">Aktifkan Kembali {selectedRecord.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleReactivateSubmit} className="modal-form-content">
              <div className="modal-info-box">
                <HiOutlineArrowUturnLeft size={22} className="info-icon" />
                <div>
                  <p>
                    Anda akan mengaktifkan kembali status <strong>{selectedRecord.name}</strong> ({recordCategory === 'employee' ? `Level ${selectedRecord.level}` : 'Sales'}).
                  </p>
                  <p className="info-sub">
                    Setelah dipulihkan, data ini akan kembali muncul pada halaman aktif.
                  </p>
                </div>
              </div>

              {/* Special check for Direksi / CSM */}
              {recordCategory === 'employee' && (selectedRecord.level === 'direksi' || selectedRecord.level === 'csm') && (
                <div className="modal-warning-tier">
                  <HiOutlineExclamationTriangle size={18} />
                  <span>
                    Perhatian: Tier Direksi dan CSM hanya mengizinkan 1 pejabat aktif. Jika saat ini sudah ada pejabat aktif di posisi tersebut, pemulihan akan ditolak sistem.
                  </span>
                </div>
              )}

              {/* Special requirement for Sales: Must assign Supervisor */}
              {recordCategory === 'sales' && (
                <div className="form-group">
                  <label className="form-label highlight-label">
                    Pilih Supervisor Penginduk * (Wajib untuk Sales)
                  </label>
                  <select
                    className="form-select select-spv"
                    required
                    value={targetSpvId}
                    onChange={(e) => setTargetSpvId(e.target.value)}
                  >
                    <option value="" disabled>-- Pilih Supervisor Aktif --</option>
                    {activeSupervisors.map((spv) => (
                      <option key={spv.id} value={spv.id}>
                        SPV {spv.name} ({spv.badge || 'Aktif'})
                      </option>
                    ))}
                  </select>
                  <span className="form-help-text">
                    Sales wajib memiliki penginduk supervisor aktif untuk dapat dipulihkan.
                  </span>
                </div>
              )}

              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-confirm-restore" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Ya, Aktifkan Kembali'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: HAPUS PERMANEN
          ==================================================================== */}
      {modalType === 'delete' && selectedRecord && (
        <div className="portal-inactive-modal-backdrop" onClick={closeModal}>
          <div className="portal-inactive-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-tag-danger">HAPUS PERMANEN</span>
                <h3 className="modal-title">Hapus Data: {selectedRecord.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleDeleteSubmit} className="modal-form-content">
              <div className="modal-danger-box">
                <HiOutlineExclamationTriangle size={24} className="danger-icon" />
                <div>
                  <p>
                    Apakah Anda yakin ingin menghapus data <strong>{selectedRecord.name}</strong> secara <strong>PERMANEN</strong> dari database?
                  </p>
                  <p className="danger-sub">
                    Tindakan ini tidak dapat dibatalkan (irreversible). Riwayat dan data terkait akan dihapus selamanya dari tabel MySQL.
                  </p>
                </div>
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-confirm-delete" disabled={isSubmitting}>
                  {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
