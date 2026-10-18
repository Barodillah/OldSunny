import { useState, useMemo } from 'react'
import {
  HiOutlineUserPlus,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlineIdentification
} from 'react-icons/hi2'
import './PortalUsers.css'

const INITIAL_USERS = [
  {
    id: 'USR-01',
    name: 'Hendra Gunawan',
    nik: 'SNY-ADM-001',
    email: 'hendra.gunawan@sunmargahayu.co.id',
    role: 'Super Admin',
    roleCategory: 'admin',
    status: 'active',
    lastLogin: 'Hari ini, 09:30 WIB',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  },
  {
    id: 'USR-02',
    name: 'Agnes',
    nik: 'SNY-SLS-0412',
    email: 'agnes@sunmargahayu.co.id',
    role: 'Senior Sales Executive',
    roleCategory: 'sales',
    status: 'active',
    lastLogin: 'Kemarin, 16:45 WIB',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  },
  {
    id: 'USR-03',
    name: 'Amin',
    nik: 'SNY-SLS-0588',
    email: 'amin@sunmargahayu.co.id',
    role: 'Sales Specialist',
    roleCategory: 'sales',
    status: 'active',
    lastLogin: 'Hari ini, 08:10 WIB',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  },
  {
    id: 'USR-04',
    name: 'Bambang Prakoso',
    nik: 'SNY-SLS-0721',
    email: 'bambang.prakoso@sunmargahayu.co.id',
    role: 'Junior Sales Advisor',
    roleCategory: 'sales',
    status: 'active',
    lastLogin: '3 hari yang lalu',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  },
  {
    id: 'USR-05',
    name: 'Bpk. Joko Santoso',
    nik: 'SNY-MGR-002',
    email: 'joko.santoso@sunmargahayu.co.id',
    role: 'Branch Manager',
    roleCategory: 'management',
    status: 'active',
    lastLogin: 'Hari ini, 10:15 WIB',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  },
  {
    id: 'USR-06',
    name: 'Rudi Hermawan',
    nik: 'SNY-SVC-0104',
    email: 'rudi.service@sunmargahayu.co.id',
    role: 'Service Advisor Coordinator',
    roleCategory: 'service',
    status: 'active',
    lastLogin: 'Hari ini, 07:50 WIB',
    avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
  }
]

export default function PortalUsers() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form New User State
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    role: 'Sales Specialist',
    roleCategory: 'sales'
  })

  // Filtered Users
  const filteredUsers = useMemo(() => {
    let list = users

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.roleCategory === roleFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.nik.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      )
    }

    return list
  }, [users, roleFilter, searchQuery])

  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Hapus akses pengguna ${name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === 'active' ? 'inactive' : 'active'
          }
        }
        return u
      })
    )
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.nik || !formData.email) {
      alert('Mohon lengkapi seluruh isian data pengguna.')
      return
    }

    const newUser = {
      id: `USR-0${users.length + 1}`,
      name: formData.name,
      nik: formData.nik,
      email: formData.email,
      role: formData.role,
      roleCategory: formData.roleCategory,
      status: 'active',
      lastLogin: 'Belum pernah login',
      avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
    }

    setUsers([newUser, ...users])
    setIsModalOpen(false)
    setFormData({
      name: '',
      nik: '',
      email: '',
      role: 'Sales Specialist',
      roleCategory: 'sales'
    })
  }

  return (
    <div className="portal-users-page">
      {/* Page Header */}
      <div className="users-header-row">
        <div>
          <h2 className="users-page-title">Manajemen Pengguna</h2>
          <p className="users-page-desc">
            Kelola akun pengguna, hak akses peranan, dan verifikasi staf dealer resmi Sun Margahayu.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-user"
          onClick={() => setIsModalOpen(true)}
        >
          <HiOutlineUserPlus size={18} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="users-filter-bar">
        {/* Category Chips */}
        <div className="users-role-chips">
          <button
            type="button"
            className={`role-chip ${roleFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            Semua ({users.length})
          </button>
          <button
            type="button"
            className={`role-chip ${roleFilter === 'admin' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-chip ${roleFilter === 'sales' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('sales')}
          >
            Sales Team
          </button>
          <button
            type="button"
            className={`role-chip ${roleFilter === 'service' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('service')}
          >
            Service Advisor
          </button>
          <button
            type="button"
            className={`role-chip ${roleFilter === 'management' ? 'is-active' : ''}`}
            onClick={() => setRoleFilter('management')}
          >
            Management
          </button>
        </div>

        {/* Search Input */}
        <div className="users-search-box">
          <HiOutlineMagnifyingGlass size={17} className="search-box-icon" />
          <input
            type="text"
            placeholder="Cari nama, NIK, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-box-clear"
              onClick={() => setSearchQuery('')}
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
            <p className="empty-state-title">Tidak ada pengguna yang cocok dengan "{searchQuery}"</p>
            <button
              type="button"
              className="btn-empty-reset"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
              }}
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="portal-users-table">
              <thead>
                <tr>
                  <th>Pengguna &amp; NIK</th>
                  <th>Kontak Email</th>
                  <th>Peran (Role)</th>
                  <th>Status</th>
                  <th>Terakhir Login</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="user-info-cell">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="user-avatar-circle"
                          onError={(e) => {
                            e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                          }}
                        />
                        <div className="user-details-col">
                          <span className="user-full-name">{item.name}</span>
                          <span className="user-nik-tag">
                            <HiOutlineIdentification size={12} />
                            <span>{item.nik}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="user-email-text">
                        <HiOutlineEnvelope size={13} className="email-icon" />
                        <span>{item.email}</span>
                      </span>
                    </td>

                    <td>
                      <span className={`role-pill role-${item.roleCategory}`}>
                        {item.role}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`status-toggle-btn ${item.status === 'active' ? 'is-active' : 'is-inactive'}`}
                        onClick={() => handleToggleStatus(item.id)}
                        title="Klik untuk mengubah status aktif"
                      >
                        <span className="status-toggle-dot" />
                        <span>{item.status === 'active' ? 'Aktif' : 'Non-aktif'}</span>
                      </button>
                    </td>

                    <td>
                      <span className="user-login-text">{item.lastLogin}</span>
                    </td>

                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-action-icon btn-edit"
                          title={`Edit data ${item.name}`}
                          onClick={() => alert(`Fitur edit profil untuk ${item.name} siap dikonfigurasikan.`)}
                        >
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon btn-delete"
                          title={`Hapus akses ${item.name}`}
                          onClick={() => handleDeleteUser(item.id, item.name)}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Pengguna */}
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
                <h3 className="modal-title">Tambah Pengguna Baru</h3>
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

            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-field-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Dimas Nugroho"
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
                    placeholder="Contoh: SNY-SLS-0649"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Peran (Role)</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => {
                      const r = e.target.value
                      let cat = 'sales'
                      if (r === 'Super Admin') cat = 'admin'
                      if (r === 'Branch Manager') cat = 'management'
                      if (r.includes('Service')) cat = 'service'
                      setFormData({ ...formData, role: r, roleCategory: cat })
                    }}
                  >
                    <option value="Sales Specialist">Sales Specialist</option>
                    <option value="Senior Sales Executive">Senior Sales Executive</option>
                    <option value="Service Advisor">Service Advisor</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Branch Manager">Branch Manager</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-label">Alamat Email Resmi</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="nama@sunmargahayu.co.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
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
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
