import { useState, useMemo, useEffect } from 'react'
import { usePortalAuth } from '../context/PortalAuthContext.jsx'
import {
  HiOutlineUserPlus,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineSparkles
} from 'react-icons/hi2'
import { RiWhatsappLine } from 'react-icons/ri'
import './PortalUsers.css'

export default function PortalUsers() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, requestResetOtp } = usePortalAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all' | 'superadmin' | 'admin' | 'user'

  const isSuperAdmin = currentUser?.role === 'superadmin'

  // Pengguna yang dapat dilihat: Pengguna selain superadmin (seperti Admin) TIDAK BISA melihat Superadmin
  const visibleUsers = useMemo(() => {
    if (isSuperAdmin) {
      return users
    }
    return users.filter((u) => u.role !== 'superadmin')
  }, [users, isSuperAdmin])

  // Cegah filter tersangkut di 'superadmin' bila login bukan sebagai superadmin
  useEffect(() => {
    if (!isSuperAdmin && roleFilter === 'superadmin') {
      setRoleFilter('all')
    }
  }, [isSuperAdmin, roleFilter])

  // Modal State: Create / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    phone: '',
    position: 'Sales Specialist',
    role: 'user', // 'superadmin' | 'admin' | 'user'
    department: 'Sales & Marketing',
    password: 'password123',
    status: 'active'
  })

  // Modal State: OTP Generator / Reset Details
  const [activeOtpModalData, setActiveOtpModalData] = useState(null)

  // Filtered Users
  const filteredUsers = useMemo(() => {
    let list = visibleUsers

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.nik && u.nik.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          (u.position && u.position.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
      )
    }

    return list
  }, [visibleUsers, roleFilter, searchQuery])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUserId(null)
    setFormData({
      name: '',
      nik: `SNY-USR-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      phone: '',
      position: 'Sales Executive',
      role: 'user',
      department: 'Sales & Marketing',
      password: 'user2026',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingUserId(item.id)
    setFormData({
      name: item.name,
      nik: item.nik || '',
      email: item.email,
      phone: item.phone || '',
      position: item.position || 'Staf Operasional',
      role: item.role || 'user',
      department: item.department || 'Operasional',
      password: item.password || 'password123',
      status: item.status || 'active'
    })
    setIsModalOpen(true)
  }

  // Save (Create or Update) User
  const handleSaveUser = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Mohon isi nama lengkap dan alamat email.')
      return
    }

    if (formData.role === 'superadmin' && !isSuperAdmin) {
      alert('Anda tidak memiliki izin untuk menetapkan peran Superadmin.')
      return
    }

    if (editingUserId) {
      await updateUser(editingUserId, formData)
    } else {
      await addUser(formData)
    }

    setIsModalOpen(false)
  }

  // Toggle User Active Status
  const handleToggleStatus = async (userItem) => {
    const nextStatus = userItem.status === 'active' ? 'inactive' : 'active'
    await updateUser(userItem.id, { status: nextStatus })
  }

  // Delete User
  const handleDelete = async (userItem) => {
    if (userItem.role === 'superadmin') {
      alert('Akun Superadmin Developer terproteksi dan tidak dapat dihapus.')
      return
    }

    if (window.confirm(`Yakin ingin menghapus akses pengguna ${userItem.name} (${userItem.email})?`)) {
      const res = await deleteUser(userItem.id)
      if (!res.success) {
        alert(res.message || 'Gagal menghapus pengguna.')
      }
    }
  }

  // Generate / Send Reset OTP for User
  const handleGenerateOtpForUser = async (userItem) => {
    try {
      const res = await requestResetOtp(userItem.email)
      if (res.success) {
        setActiveOtpModalData(res)
      } else {
        alert(res.message || 'Gagal membuat kode OTP.')
      }
    } catch {
      alert('Terjadi kesalahan saat memproses kode OTP.')
    }
  }

  return (
    <div className="portal-users-page">
      {/* Page Header */}
      <div className="users-header-row">
        <div className="users-header-text-col">
          <h2 className="users-page-title">Manajemen Pengguna</h2>
          <p className="users-page-desc">
            Basis data akun, penetapan hak peranan, kontak WhatsApp, dan reset kata sandi via OTP.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-user"
          onClick={handleOpenCreateModal}
        >
          <HiOutlineUserPlus size={18} />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="users-filter-bar">
        {/* Role Chips Filter */}
        <div className="users-role-chips">
          <button
            type="button"
            className={`role-chip ${roleFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            Semua ({visibleUsers.length})
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              className={`role-chip ${roleFilter === 'superadmin' ? 'is-active' : ''}`}
              onClick={() => setRoleFilter('superadmin')}
            >
              Superadmin ({users.filter((u) => u.role === 'superadmin').length})
            </button>
          )}

          <button
            type="button"
            className={`role-chip ${roleFilter === 'admin' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admin ({visibleUsers.filter((u) => u.role === 'admin').length})
          </button>

          <button
            type="button"
            className={`role-chip ${roleFilter === 'user' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('user')}
          >
            User ({visibleUsers.filter((u) => u.role === 'user').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="users-search-box">
          <HiOutlineMagnifyingGlass size={17} className="search-box-icon" />
          <input
            type="text"
            placeholder="Cari nama, NIK, email, no. telp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-box-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Bersihkan pencarian"
            >
              <HiOutlineXMark size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="users-table-card">
        {filteredUsers.length === 0 ? (
          <div className="users-empty-state">
            <p className="empty-state-title">
              Tidak ada pengguna yang cocok dengan kriteria "{searchQuery || roleFilter}"
            </p>
            <button
              type="button"
              className="btn-empty-reset"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
              }}
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="portal-users-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Kontak (Email / WhatsApp)</th>
                  <th>Jabatan &amp; Divisi</th>
                  <th>Hak Akses (Role)</th>
                  <th>Status</th>
                  <th>Terakhir Login</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, '') : ''
                  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone

                  return (
                    <tr key={item.id}>
                      {/* Name & NIK */}
                      <td>
                        <div className="user-info-cell">
                          <img
                            src={item.avatar || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                            alt={item.name}
                            className="user-avatar-circle"
                            onError={(e) => {
                              e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                            }}
                          />
                          <div className="user-details-col">
                            <span className="user-full-name">{item.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="user-contact-col">
                          <span className="user-email-text" title={item.email}>
                            <HiOutlineEnvelope size={13} />
                            <span>{item.email}</span>
                          </span>
                          {item.phone && (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="user-phone-link"
                              title="Kirim pesan WhatsApp"
                            >
                              <RiWhatsappLine size={13} />
                              <span>{item.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td>
                        <div className="user-position-col">
                          <span className="user-position-title">{item.position}</span>
                          <span className="user-department-tag">{item.department}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`role-badge ${item.role}`}>
                          {item.role === 'superadmin' && <HiOutlineShieldCheck size={13} />}
                          <span>
                            {item.role === 'superadmin'
                              ? 'Superadmin (Dev)'
                              : item.role === 'admin'
                                ? 'Admin'
                                : 'User'}
                          </span>
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${item.status === 'active' ? 'is-active' : 'is-inactive'}`}
                          onClick={() => handleToggleStatus(item)}
                          title="Klik untuk mengubah status aktif"
                        >
                          <span className="status-toggle-dot" />
                          <span>{item.status === 'active' ? 'Aktif' : 'Non-aktif'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td>
                        <span className="user-login-text">{item.lastLogin || '-'}</span>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn-action-icon btn-otp"
                            title={`Buat / Kirim OTP Reset Sandi untuk ${item.name}`}
                            onClick={() => handleGenerateOtpForUser(item)}
                          >
                            <HiOutlineKey size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn-action-icon btn-edit"
                            title={`Edit data ${item.name}`}
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>

                          {item.role !== 'superadmin' && (
                            <button
                              type="button"
                              className="btn-action-icon btn-delete"
                              title={`Hapus akses ${item.name}`}
                              onClick={() => handleDelete(item)}
                            >
                              <HiOutlineTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL: TAMBAH / EDIT PENGGUNA
          ==================================================================== */}
      {isModalOpen && (
        <div
          className="portal-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="portal-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div className="modal-header-title-box">
                <HiOutlineCheckBadge size={20} className="text-red" />
                <h3 className="modal-title">
                  {editingUserId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-field-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Budi Prasetyo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">NIK Karyawan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: SNY-SLS-0901"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Peran (Role Akses)</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {isSuperAdmin && (
                      <option value="superadmin">Superadmin (Khusus Developer)</option>
                    )}
                    <option value="admin">Admin (Manajemen Dealer)</option>
                    <option value="user">User (Staf / Sales / Service)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">Alamat Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="nama@sunmargahayu.co.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Nomor WhatsApp / Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 081289001234"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">Jabatan (Position)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Senior Sales Executive"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Departemen / Divisi</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Aftersales & Service">Aftersales & Service</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="General Affairs">General Affairs</option>
                  </select>
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">Kata Sandi</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Status Akun</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-aktif</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                >
                  {editingUserId ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: HASIL GENERATE OTP RESET PASSWORD
          ==================================================================== */}
      {activeOtpModalData && (
        <div
          className="portal-modal-backdrop"
          onClick={() => setActiveOtpModalData(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="portal-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px' }}
          >
            <div className="modal-header-row">
              <div className="modal-header-title-box">
                <HiOutlineSparkles size={20} className="text-red" />
                <h3 className="modal-title">OTP Reset Password Dibuat</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveOtpModalData(null)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-otp-alert-box">
                <span style={{ fontSize: '0.82rem', color: '#713f12' }}>
                  Kode verifikasi 6-digit untuk <strong>{activeOtpModalData.user?.name}</strong>:
                </span>

                <div className="otp-alert-code-display">
                  {activeOtpModalData.otpCode}
                </div>

                <span style={{ fontSize: '0.75rem', color: '#854d0e', textAlign: 'center' }}>
                  Berlaku selama 5 menit. Kirimkan kode ini kepada pengguna untuk mereset kata sandi.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>Email: <strong>{activeOtpModalData.user?.email}</strong></div>
                <div>No. WhatsApp: <strong>{activeOtpModalData.user?.phone || '-'}</strong></div>
              </div>

              <div className="modal-actions-bar">
                {activeOtpModalData.user?.phone && (
                  <a
                    href={`https://wa.me/${activeOtpModalData.user.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(activeOtpModalData.user.name)},%20berikut%20kode%20OTP%20reset%20kata%20sandi%20Portal%20Anda:%20*${activeOtpModalData.otpCode}*%20(berlaku%205%20menit).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modal-cancel"
                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RiWhatsappLine size={16} />
                    <span>Kirim via WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  className="btn-modal-submit"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeOtpModalData.otpCode)
                    alert('Kode OTP berhasil disalin ke clipboard!')
                  }}
                >
                  Salin Kode OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
