import { useState, useMemo, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
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
  HiOutlineSparkles,
  HiOutlineExclamationCircle
} from 'react-icons/hi2'
import { RiWhatsappLine } from 'react-icons/ri'
import './PortalUsers.css'

export default function PortalUsers() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, requestResetOtp } = usePortalAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all' | 'superadmin' | 'admin' | 'user'

  const isSuperAdmin = currentUser?.role === 'superadmin'
  const isAdmin = currentUser?.role === 'admin'
  const isRegularUser = currentUser?.role === 'user'

  // Proteksi: Role 'user' TIDAK BISA membuka halaman ini, redirect ke dashboard
  if (isRegularUser) {
    return <Navigate to="/portal" replace />
  }

  // Pengguna yang dapat dilihat:
  // - Superadmin: melihat semua pengguna (superadmin, admin, user)
  // - Admin: HANYA BISA melihat list akun user saja
  const visibleUsers = useMemo(() => {
    if (isSuperAdmin) {
      return users
    }
    if (isAdmin) {
      return users.filter((u) => u.role === 'user')
    }
    return []
  }, [users, isSuperAdmin, isAdmin])

  // Cegah filter tersangkut di selain 'all' bila login bukan sebagai superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      setRoleFilter('all')
    }
  }, [isSuperAdmin])

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

  // Form Validation & Feedback States
  const [formErrors, setFormErrors] = useState({})
  const [formGeneralError, setFormGeneralError] = useState('')
  const [isSubmittingUser, setIsSubmittingUser] = useState(false)

  // Modal State: Password Sementara
  const [tempPasswordModalUser, setTempPasswordModalUser] = useState(null)
  const [tempPasswordValue, setTempPasswordValue] = useState('')
  const [tempPasswordSuccess, setTempPasswordSuccess] = useState(false)
  const [isSubmittingTempPassword, setIsSubmittingTempPassword] = useState(false)

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

  // Helper normalisasi nomor telepon untuk cek duplikasi
  const normalizePhone = (p) => {
    if (!p) return ''
    let cleaned = String(p).replace(/[^0-9]/g, '')
    if (cleaned.startsWith('62')) {
      cleaned = '0' + cleaned.slice(2)
    }
    return cleaned
  }

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUserId(null)
    setFormErrors({})
    setFormGeneralError('')
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
    if (!isSuperAdmin && item.role !== 'user') {
      alert('Admin hanya memiliki izin untuk mengedit akun dengan peran User.')
      return
    }
    setEditingUserId(item.id)
    setFormErrors({})
    setFormGeneralError('')
    setFormData({
      name: item.name || '',
      nik: item.nik || '',
      email: item.email || '',
      phone: item.phone || '',
      position: item.position || 'Staf Operasional',
      role: isSuperAdmin ? (item.role || 'user') : 'user',
      department: item.department || 'Operasional',
      password: '', // Kosongkan saat edit agar password tidak ter-overwrite kecuali diisi
      status: item.status || 'active'
    })
    setIsModalOpen(true)
  }

  // Validasi Komprehensif Sebelum Submit
  const validateUserForm = () => {
    const errors = {}

    // 1. Nama Lengkap
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Nama lengkap wajib diisi.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nama lengkap minimal 2 karakter.'
    }

    // 2. NIK Karyawan
    if (!formData.nik || !formData.nik.trim()) {
      errors.nik = 'NIK karyawan wajib diisi.'
    } else {
      const cleanNik = formData.nik.trim().toLowerCase()
      const dupNik = users.find(
        (u) =>
          String(u.id) !== String(editingUserId) &&
          u.nik &&
          u.nik.trim().toLowerCase() === cleanNik
      )
      if (dupNik) {
        errors.nik = `NIK "${formData.nik.trim()}" sudah digunakan oleh ${dupNik.name}.`
      }
    }

    // 3. Alamat Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi.'
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Format alamat email tidak valid (contoh: user@sunmargahayu.co.id).'
    } else {
      const cleanEmail = formData.email.trim().toLowerCase()
      const dupEmail = users.find(
        (u) =>
          String(u.id) !== String(editingUserId) &&
          u.email &&
          u.email.trim().toLowerCase() === cleanEmail
      )
      if (dupEmail) {
        errors.email = `Email "${formData.email.trim()}" sudah terdaftar untuk ${dupEmail.name}.`
      }
    }

    // 4. Nomor Telepon / WhatsApp
    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = normalizePhone(formData.phone)
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        errors.phone = 'Nomor telepon / WhatsApp minimal 9-15 digit angka.'
      } else {
        const dupPhone = users.find(
          (u) =>
            String(u.id) !== String(editingUserId) &&
            u.phone &&
            normalizePhone(u.phone) === cleanPhone
        )
        if (dupPhone) {
          errors.phone = `Nomor WhatsApp "${formData.phone.trim()}" sudah digunakan oleh ${dupPhone.name}.`
        }
      }
    }

    // 5. Jabatan (Position)
    if (!formData.position || !formData.position.trim()) {
      errors.position = 'Jabatan / posisi karyawan wajib diisi.'
    }

    // 6. Password
    if (!editingUserId) {
      if (!formData.password || !formData.password.trim()) {
        errors.password = 'Password sementara wajib diisi.'
      } else if (formData.password.length < 6) {
        errors.password = 'Password minimal harus 6 karakter.'
      }
    } else {
      // Saat edit, jika password diisi, harus minimal 6 karakter
      if (formData.password && formData.password.length < 6) {
        errors.password = 'Password minimal harus 6 karakter.'
      }
    }

    return errors
  }

  // Save (Create or Update) User
  const handleSaveUser = async (e) => {
    e.preventDefault()
    setFormGeneralError('')

    // Jalankan validasi frontend terlebih dahulu
    const errors = validateUserForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (formData.role === 'superadmin' && !isSuperAdmin) {
      setFormGeneralError('Anda tidak memiliki izin untuk menetapkan peran Superadmin.')
      return
    }

    setIsSubmittingUser(true)

    try {
      // Bersihkan data sebelum dikirim
      const payload = {
        name: formData.name.trim(),
        nik: formData.nik ? formData.nik.trim() : null,
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : null,
        position: formData.position.trim(),
        role: isSuperAdmin ? formData.role : 'user', // Admin hanya bisa dan hanya boleh membuat role user
        department: formData.department,
        status: formData.status
      }

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim()
      }

      let res
      if (editingUserId) {
        res = await updateUser(editingUserId, payload)
      } else {
        res = await addUser(payload)
      }

      if (res && res.success) {
        setIsModalOpen(false)
        setFormErrors({})
        setFormGeneralError('')
      } else {
        // Tampilkan pesan error ramah pada banner modal tanpa menutup modal atau alert()
        const errorMsg = res?.message || 'Gagal menyimpan data pengguna. Silakan periksa kembali data Anda.'
        setFormGeneralError(errorMsg)

        // Petakan error spesifik field dari backend jika tersedia
        if (res?.errors) {
          const backendFieldErrors = {}
          for (const key in res.errors) {
            backendFieldErrors[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          }
          setFormErrors((prev) => ({ ...prev, ...backendFieldErrors }))
        }
      }
    } catch (err) {
      console.error('Save user failed:', err)
      setFormGeneralError('Terjadi kendala saat menghubungi server. Silakan coba kembali.')
    } finally {
      setIsSubmittingUser(false)
    }
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

    if (!isSuperAdmin && userItem.role !== 'user') {
      alert('Admin hanya memiliki izin untuk menghapus akun dengan peran User.')
      return
    }

    if (window.confirm(`Yakin ingin menghapus akses pengguna ${userItem.name} (${userItem.email})?`)) {
      const res = await deleteUser(userItem.id)
      if (!res.success) {
        alert(res.message || 'Gagal menghapus pengguna.')
      }
    }
  }

  // Buka Modal Set Password Sementara untuk User
  const handleOpenTempPasswordModal = (userItem) => {
    setTempPasswordModalUser(userItem)
    setTempPasswordValue('Sunny@' + Math.floor(1000 + Math.random() * 9000))
    setTempPasswordSuccess(false)
    setIsSubmittingTempPassword(false)
  }

  const handleSaveTempPassword = async (e) => {
    e.preventDefault()
    if (!tempPasswordValue.trim()) {
      alert('Password sementara tidak boleh kosong.')
      return
    }
    setIsSubmittingTempPassword(true)
    try {
      const res = await updateUser(tempPasswordModalUser.id, {
        password: tempPasswordValue.trim()
      })
      if (res.success) {
        setTempPasswordSuccess(true)
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan password sementara.')
    } finally {
      setIsSubmittingTempPassword(false)
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
          {isSuperAdmin ? (
            <>
              <button
                type="button"
                className={`role-chip ${roleFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                Semua ({visibleUsers.length})
              </button>

              <button
                type="button"
                className={`role-chip ${roleFilter === 'superadmin' ? 'is-active' : ''}`}
                onClick={() => setRoleFilter('superadmin')}
              >
                Superadmin ({users.filter((u) => u.role === 'superadmin').length})
              </button>

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
            </>
          ) : (
            <button
              type="button"
              className="role-chip is-active"
            >
              Daftar User ({visibleUsers.length})
            </button>
          )}
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
                            title={`Set Password Sementara untuk ${item.name}`}
                            onClick={() => handleOpenTempPasswordModal(item)}
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

            <form onSubmit={handleSaveUser} className="modal-form" noValidate>
              {formGeneralError && (
                <div className="modal-error-banner" role="alert">
                  <HiOutlineExclamationCircle size={20} className="error-icon" />
                  <span>{formGeneralError}</span>
                </div>
              )}

              <div className="form-field-group">
                <label className="form-label">
                  Nama Lengkap <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${formErrors.name ? 'has-error' : ''}`}
                  placeholder="Contoh: Budi Prasetyo"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null })
                  }}
                />
                {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">
                    NIK Karyawan <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.nik ? 'has-error' : ''}`}
                    placeholder="Contoh: SNY-SLS-0901"
                    value={formData.nik}
                    onChange={(e) => {
                      setFormData({ ...formData, nik: e.target.value })
                      if (formErrors.nik) setFormErrors({ ...formErrors, nik: null })
                    }}
                  />
                  {formErrors.nik && <span className="form-error-msg">{formErrors.nik}</span>}
                </div>

                <div className="form-field-group">
                  <label className="form-label">Peran (Role Akses)</label>
                  {isSuperAdmin ? (
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="superadmin">Superadmin (Khusus Developer)</option>
                      <option value="admin">Admin (Manajemen Dealer)</option>
                      <option value="user">User (Staf / Sales / Service)</option>
                    </select>
                  ) : (
                    <>
                      <select
                        className="form-select"
                        value="user"
                        disabled
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                      >
                        <option value="user">User (Staf / Sales / Service)</option>
                      </select>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Admin hanya memiliki izin untuk membuat akun dengan peran User.
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">
                    Alamat Email <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-input ${formErrors.email ? 'has-error' : ''}`}
                    placeholder="nama@sunmargahayu.co.id"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (formErrors.email) setFormErrors({ ...formErrors, email: null })
                    }}
                  />
                  {formErrors.email && <span className="form-error-msg">{formErrors.email}</span>}
                </div>

                <div className="form-field-group">
                  <label className="form-label">Nomor WhatsApp / Telepon</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.phone ? 'has-error' : ''}`}
                    placeholder="Contoh: 081289001234"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: null })
                    }}
                  />
                  {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-group">
                  <label className="form-label">
                    Jabatan (Position) <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.position ? 'has-error' : ''}`}
                    placeholder="Contoh: Senior Sales Executive"
                    value={formData.position}
                    onChange={(e) => {
                      setFormData({ ...formData, position: e.target.value })
                      if (formErrors.position) setFormErrors({ ...formErrors, position: null })
                    }}
                  />
                  {formErrors.position && <span className="form-error-msg">{formErrors.position}</span>}
                </div>

                <div className="form-field-group">
                  <label className="form-label">Departemen / Divisi</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="CS Staff">CS Staff</option>
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
                  <label className="form-label">
                    {editingUserId ? 'Password Baru (Opsional)' : 'Password Sementara'}{' '}
                    {!editingUserId && <span className="text-red">*</span>}
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.password ? 'has-error' : ''}`}
                    placeholder={editingUserId ? 'Kosongkan jika tetap password lama' : 'Minimal 6 karakter'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (formErrors.password) setFormErrors({ ...formErrors, password: null })
                    }}
                  />
                  {formErrors.password && <span className="form-error-msg">{formErrors.password}</span>}
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
                  disabled={isSubmittingUser}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmittingUser}
                >
                  {isSubmittingUser ? 'Menyimpan...' : editingUserId ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: SET PASSWORD SEMENTARA PENGGUNA
          ==================================================================== */}
      {tempPasswordModalUser && (
        <div
          className="portal-modal-backdrop"
          onClick={() => setTempPasswordModalUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="portal-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            <div className="modal-header-row">
              <div className="modal-header-title-box">
                <HiOutlineKey size={20} className="text-red" />
                <h3 className="modal-title">
                  {tempPasswordSuccess ? 'Password Sementara Berhasil Disimpan' : 'Set Password Sementara'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setTempPasswordModalUser(null)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {!tempPasswordSuccess ? (
              <form onSubmit={handleSaveTempPassword} className="modal-form">
                <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                    {tempPasswordModalUser.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Email: <strong>{tempPasswordModalUser.email}</strong> • NIK: <strong>{tempPasswordModalUser.nik || '-'}</strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Posisi: <strong>{tempPasswordModalUser.position || '-'}</strong> ({tempPasswordModalUser.role})
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Password Sementara</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Masukkan password sementara..."
                      value={tempPasswordValue}
                      onChange={(e) => setTempPasswordValue(e.target.value)}
                      required
                      autoFocus
                      style={{ fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.5px' }}
                    />
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      style={{ whiteSpace: 'nowrap', padding: '0.65rem 0.85rem', fontSize: '0.8rem', fontWeight: '600' }}
                      onClick={() => setTempPasswordValue('Sunny@' + Math.floor(1000 + Math.random() * 9000))}
                      title="Generate password acak baru"
                    >
                      Acak
                    </button>
                  </div>
                  <span className="form-help" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Pengguna dapat langsung login ke portal menggunakan password ini.
                  </span>
                </div>

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setTempPasswordModalUser(null)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-submit"
                    disabled={isSubmittingTempPassword}
                  >
                    {isSubmittingTempPassword ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-form">
                <div className="modal-otp-alert-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <span style={{ fontSize: '0.82rem', color: '#166534' }}>
                    Password sementara untuk <strong>{tempPasswordModalUser.name}</strong> berhasil diperbarui:
                  </span>

                  <div className="otp-alert-code-display" style={{ color: '#15803d', letterSpacing: '1px', fontSize: '1.3rem', fontFamily: 'monospace' }}>
                    {tempPasswordValue}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#166534', textAlign: 'center' }}>
                    Berikan password ini kepada pengguna agar dapat langsung login ke portal.
                  </span>
                </div>

                <div className="modal-actions-bar">
                  {tempPasswordModalUser.phone && (
                    <a
                      href={`https://wa.me/${tempPasswordModalUser.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(tempPasswordModalUser.name)},%20akun%20Portal%20Sunny%20Anda%20telah%20disetel%20password%20sementara:%20*${encodeURIComponent(tempPasswordValue)}*.%20Silakan%20login%20ke%20Portal%20Sunny.`}
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
                      navigator.clipboard?.writeText(tempPasswordValue)
                      alert('Password sementara berhasil disalin ke clipboard!')
                    }}
                  >
                    Salin Password
                  </button>

                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setTempPasswordModalUser(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
