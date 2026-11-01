import { useState, useEffect } from 'react'
import { usePortalAuth } from '../context/PortalAuthContext.jsx'
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineKey,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import './PortalProfile.css'

const DEFAULT_AVATAR = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'

export default function PortalProfile() {
  const { user, updateProfile } = usePortalAuth()

  // Form states: nama, ava, password
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Feedback & Loading
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Nama lengkap wajib diisi.' })
      return
    }

    if (password) {
      if (password.length < 6) {
        setFeedback({ type: 'error', message: 'Kata sandi baru minimal 6 karakter.' })
        return
      }
      if (password !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' })
        return
      }
    }

    setIsSubmitting(true)

    try {
      const res = await updateProfile({
        name: trimmedName,
        avatar: avatar.trim() || DEFAULT_AVATAR,
        password: password || undefined,
      })

      if (res.success) {
        setFeedback({
          type: 'success',
          message: password
            ? 'Profil dan kata sandi baru berhasil diperbarui.'
            : 'Perubahan profil berhasil disimpan.',
        })
        setPassword('')
        setConfirmPassword('')
      } else {
        setFeedback({ type: 'error', message: res.message || 'Gagal menyimpan perubahan profil.' })
      }
    } catch (err) {
      console.error('Update profile error:', err)
      setFeedback({ type: 'error', message: 'Terjadi kendala koneksi ke server.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset to original state
  const handleReset = () => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
      setPassword('')
      setConfirmPassword('')
      setFeedback(null)
    }
  }

  return (
    <div className="portal-profile-container">

      {/* Notifikasi Alert Feedback */}
      {feedback && (
        <div className={`profile-alert ${feedback.type}`} role="alert">
          {feedback.type === 'success' ? (
            <HiOutlineCheckCircle size={18} className="flex-shrink-0" />
          ) : (
            <HiOutlineExclamationTriangle size={18} className="flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Tutup notifikasi"
            className="profile-alert-close"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Layout Full Width Grid: Card Kiri & Card Kanan */}
      <form onSubmit={handleSubmit} className="profile-layout-grid">
        {/* CARD KIRI: Identitas, Avatar Preview & Data Akun */}
        <div className="profile-card profile-card-left">
          <div className="profile-card-header">
            <h2 className="profile-card-title">
              <HiOutlineUser size={18} className="profile-card-title-icon" />
              Identitas Pengguna
            </h2>
          </div>

          {/* Tampilan Visual Avatar */}
          <div className="profile-user-preview">
            <div className="profile-avatar-frame">
              <img
                src={avatar || DEFAULT_AVATAR}
                alt={name || 'Avatar Pengguna'}
                className="profile-avatar-img"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR
                }}
              />
              <span className="profile-status-indicator" title="Akun Aktif" />
            </div>
            <h3 className="profile-preview-name">{name || user?.name || 'Nama Pengguna'}</h3>
            <p className="profile-preview-position">{user?.position || 'Staf Operasional'}</p>
            <div className="profile-preview-role-row">
              <span className={`profile-role-pill ${user?.role || 'user'}`}>
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Pengaturan URL Foto Profil */}
          <div className="profile-field-group">
            <label htmlFor="profile-avatar-input" className="profile-field-label">
              URL Foto Avatar
            </label>
            <div className="profile-input-box">
              <input
                id="profile-avatar-input"
                type="url"
                className="profile-input-text"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>
            <div className="profile-avatar-action-row">
              <span className="profile-field-hint">Gunakan tautan HTTPS gambar langsung (.jpg, .png).</span>
              {avatar && avatar !== DEFAULT_AVATAR && (
                <button
                  type="button"
                  className="profile-btn-text-reset"
                  onClick={() => setAvatar(DEFAULT_AVATAR)}
                >
                  <HiOutlineArrowPath size={12} />
                  Gunakan foto bawaan
                </button>
              )}
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Ringkasan Akun (Read-Only) */}
          <div className="profile-readonly-section">
            <span className="profile-readonly-heading">Data Akun Terdaftar</span>
            <div className="profile-readonly-list">
              <div className="profile-readonly-row">
                <span className="profile-readonly-lbl">Email Akun</span>
                <span className="profile-readonly-val" title={user?.email || '-'}>
                  {user?.email || '-'}
                </span>
              </div>
              <div className="profile-readonly-row">
                <span className="profile-readonly-lbl">NIK Karyawan</span>
                <span className="profile-readonly-val font-mono">
                  {user?.nik || '-'}
                </span>
              </div>
              <div className="profile-readonly-row">
                <span className="profile-readonly-lbl">Dealer / Lokasi</span>
                <span className="profile-readonly-val">
                  Sun Margahayu
                </span>
              </div>
              <div className="profile-readonly-row">
                <span className="profile-readonly-lbl">Status Akun</span>
                <span className="profile-readonly-status">
                  <span className="status-dot-green" />
                  Aktif & Terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD KANAN: Form Pengaturan Nama & Keamanan Sandi */}
        <div className="profile-card profile-card-right">
          <div className="profile-card-header">
            <h2 className="profile-card-title">
              <HiOutlineShieldCheck size={18} className="profile-card-title-icon" />
              Informasi & Keamanan
            </h2>
          </div>

          {/* Bagian 1: Nama Lengkap */}
          <div className="profile-section-block">
            <h3 className="profile-block-title">Informasi Personal</h3>
            <p className="profile-block-desc">
              Nama ini digunakan pada seluruh sistem operasional dan tanda pengenal resmi portal.
            </p>

            <div className="profile-field-group">
              <label htmlFor="profile-name-input" className="profile-field-label">
                Nama Lengkap *
              </label>
              <div className="profile-input-box">
                <input
                  id="profile-name-input"
                  type="text"
                  className="profile-input-text"
                  placeholder="Nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Bagian 2: Kata Sandi */}
          <div className="profile-section-block">
            <div className="profile-block-header-inline">
              <HiOutlineKey size={16} className="text-slate-400" />
              <h3 className="profile-block-title">Ubah Kata Sandi</h3>
            </div>
            <p className="profile-block-desc">
              Kosongkan bagian ini jika Anda tidak ingin mengganti kata sandi akun saat ini.
            </p>

            <div className="profile-password-grid">
              <div className="profile-field-group">
                <label htmlFor="profile-pwd-input" className="profile-field-label">
                  Kata Sandi Baru
                </label>
                <div className="profile-input-box">
                  <input
                    id="profile-pwd-input"
                    type={showPassword ? 'text' : 'password'}
                    className="profile-input-text has-toggle"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="profile-field-group">
                <label htmlFor="profile-pwd-confirm" className="profile-field-label">
                  Konfirmasi Sandi Baru
                </label>
                <div className="profile-input-box">
                  <input
                    id="profile-pwd-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="profile-input-text has-toggle"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={!password}
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    disabled={!password}
                  >
                    {showConfirmPassword ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Action Footer */}
          <div className="profile-card-footer">
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="profile-btn-primary"
              disabled={isSubmitting}
            >
              <HiOutlineCheck size={16} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
