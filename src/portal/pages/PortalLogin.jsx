import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePortalAuth } from '../context/PortalAuthContext.jsx'
import {
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineArrowLeft,
  HiOutlineKey,
  HiOutlineXMark,
  HiOutlineDevicePhoneMobile,
  HiOutlineSparkles,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import './PortalLogin.css'

export default function PortalLogin() {
  const navigate = useNavigate()
  const { login, requestResetOtp, verifyResetOtp } = usePortalAuth()

  // Form State
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Forgot Password / OTP Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: request OTP, 2: verify & change password
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [resetOtpCode, setResetOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeOtpPreview, setActiveOtpPreview] = useState(null)
  const [forgotError, setForgotError] = useState('')
  const [isOtpLoading, setIsOtpLoading] = useState(false)

  // Handle Standard Login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!identifier || !password) {
      setError('Silakan masukkan Email / No. Telepon / NIK dan kata sandi Anda.')
      return
    }

    setIsLoading(true)
    try {
      const res = await login(identifier, password)
      if (res.success) {
        navigate('/portal')
      } else {
        setError(res.message || 'Gagal masuk. Periksa kembali kredensial Anda.')
      }
    } catch {
      setError('Gagal menghubungi server database. Pastikan koneksi internet atau server backend aktif.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Send Reset OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setForgotError('')

    if (!resetIdentifier) {
      setForgotError('Masukkan Email, No. Telepon, atau NIK akun Anda.')
      return
    }

    setIsOtpLoading(true)
    try {
      const res = await requestResetOtp(resetIdentifier)
      if (res.success) {
        setActiveOtpPreview(res)
        setForgotStep(2)
      } else {
        setForgotError(res.message || 'Gagal mengirim kode OTP.')
      }
    } catch {
      setForgotError('Terjadi kendala saat menghubungi server database OTP.')
    } finally {
      setIsOtpLoading(false)
    }
  }

  // Handle Verify OTP & Change Password
  const handleVerifyOtpAndChange = async (e) => {
    e.preventDefault()
    setForgotError('')

    if (!resetOtpCode || resetOtpCode.length !== 6) {
      setForgotError('Masukkan 6-digit kode OTP yang valid.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setIsOtpLoading(true)
    try {
      const res = await verifyResetOtp(resetIdentifier, resetOtpCode, newPassword)
      if (res.success) {
        setSuccessMsg('Kata sandi berhasil diperbarui! Silakan klik Masuk.')
        setPassword(newPassword)
        setIdentifier(resetIdentifier)
        setIsForgotModalOpen(false)
        setForgotStep(1)
        setActiveOtpPreview(null)
      } else {
        setForgotError(res.message || 'Verifikasi OTP gagal.')
      }
    } catch {
      setForgotError('Terjadi kesalahan saat memverifikasi OTP ke database.')
    } finally {
      setIsOtpLoading(false)
    }
  }

  return (
    <div className="portal-login-page">
      <div className="portal-login-backdrop-glow" />

      <div className="portal-login-card">
        {/* Top Nav */}
        <div className="portal-login-top-nav">
          <Link to="/" className="portal-back-to-web" title="Kembali ke Beranda Showroom">
            <HiOutlineArrowLeft size={16} />
            <span>Website Showroom</span>
          </Link>
          <span className="portal-env-tag">Portal Resmi</span>
        </div>

        {/* Brand Header */}
        <div className="portal-login-header">
          <div className="portal-brand-row">
            <img
              src="https://bewhy.id/wp-content/uploads/url_6acf112141e379.21076281.webp"
              alt="Logo Sunny"
              className="portal-login-logo"
              onError={(e) => {
                e.currentTarget.src = '/logo-brand.webp'
              }}
            />
            <div className="portal-brand-text">
              <span className="portal-title-brand">Sunny Portal</span>
              <span className="portal-subtitle-brand">Mitsubishi Sun Margahayu</span>
            </div>
          </div>
          <h1 className="portal-login-title">Masuk ke Portal Internal</h1>
          <p className="portal-login-desc">
            Sistem manajemen operasional terpadu, pemantauan SPK/PKT, dan verifikasi staf resmi.
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="portal-login-success" role="alert">
            <HiOutlineCheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="portal-login-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="portal-login-form">
          <div className="portal-input-group">
            <label htmlFor="portal-email" className="portal-label">
              Email, No. Telepon / WhatsApp, atau NIK
            </label>
            <div className="portal-input-wrapper">
              <HiOutlineEnvelope className="portal-input-icon" size={18} />
              <input
                id="portal-email"
                type="text"
                className="portal-input"
                placeholder="csm@cssunmotor.com / 0812... / NIK"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="portal-input-group">
            <div className="portal-label-row">
              <label htmlFor="portal-password" className="portal-label">
                Kata Sandi
              </label>
              <button
                type="button"
                className="portal-forgot-link"
                onClick={() => {
                  setForgotError('')
                  setForgotStep(1)
                  setActiveOtpPreview(null)
                  setResetIdentifier(identifier)
                  setIsForgotModalOpen(true)
                }}
              >
                Lupa sandi? (Reset via OTP)
              </button>
            </div>
            <div className="portal-input-wrapper">
              <HiOutlineLockClosed className="portal-input-icon" size={18} />
              <input
                id="portal-password"
                type="password"
                className="portal-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="portal-form-options">
            <label className="portal-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="portal-checkbox"
              />
              <span>Ingat sesi di perangkat ini</span>
            </label>
          </div>

          <button
            type="submit"
            className="portal-btn-primary"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            <HiOutlineArrowRight size={17} />
          </button>
        </form>



        {/* Security Footer Note */}
        <div className="portal-login-footer">
          <HiOutlineShieldCheck size={15} className="text-emerald" />
          <span>Akses terenkripsi khusus staf resmi PT Sun Star Prima Motor.</span>
        </div>
      </div>

      {/* ====================================================================
          MODAL: RESET PASSWORD DENGAN SISTEM OTP
          ==================================================================== */}
      {isForgotModalOpen && (
        <div
          className="portal-otp-modal-backdrop"
          onClick={() => setIsForgotModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="portal-otp-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="portal-otp-modal-header">
              <div>
                <h3 className="portal-otp-modal-title">Reset Kata Sandi via OTP</h3>
                <p className="portal-otp-modal-subtitle">
                  {forgotStep === 1
                    ? 'Langkah 1: Masukkan identitas akun Anda'
                    : 'Langkah 2: Masukkan 6-digit OTP & sandi baru'}
                </p>
              </div>
              <button
                type="button"
                className="portal-otp-modal-close"
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>

            {forgotError && (
              <div className="portal-login-error" role="alert">
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: REQUEST OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="portal-login-form">
                <div className="portal-input-group">
                  <label className="portal-label">Email, No. Telepon, atau NIK</label>
                  <div className="portal-input-wrapper">
                    <HiOutlineDevicePhoneMobile className="portal-input-icon" size={18} />
                    <input
                      type="text"
                      className="portal-input"
                      placeholder="csm@cssunmotor.com / 0812... / NIK"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isOtpLoading}
                >
                  <HiOutlineSparkles size={17} />
                  <span>{isOtpLoading ? 'Mengirim...' : 'Kirim Kode OTP (6-Digit)'}</span>
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtpAndChange} className="portal-login-form">
                {/* Simulated Real-Time OTP Banner (For Testing & Demo) */}
                {activeOtpPreview && (
                  <div className="portal-simulated-otp-box">
                    <div className="simulated-otp-header">
                      <HiOutlineSparkles size={14} />
                      <span>Simulasi SMS / WhatsApp OTP Masuk:</span>
                    </div>
                    <div className="simulated-otp-code-row">
                      <span className="simulated-otp-big-code">
                        {activeOtpPreview.otpCode}
                      </span>
                      <button
                        type="button"
                        className="btn-copy-otp"
                        onClick={() => setResetOtpCode(activeOtpPreview.otpCode)}
                      >
                        Isi Otomatis
                      </button>
                    </div>
                  </div>
                )}

                <div className="portal-input-group">
                  <label className="portal-label">Masukkan 6-Digit Kode OTP</label>
                  <div className="portal-input-wrapper">
                    <HiOutlineKey className="portal-input-icon" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      className="portal-input font-mono"
                      placeholder="Contoh: 123456"
                      value={resetOtpCode}
                      onChange={(e) => setResetOtpCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="portal-input-group">
                  <label className="portal-label">Kata Sandi Baru (Min. 6 Karakter)</label>
                  <div className="portal-input-wrapper">
                    <HiOutlineLockClosed className="portal-input-icon" size={18} />
                    <input
                      type="password"
                      className="portal-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="portal-input-group">
                  <label className="portal-label">Konfirmasi Kata Sandi Baru</label>
                  <div className="portal-input-wrapper">
                    <HiOutlineLockClosed className="portal-input-icon" size={18} />
                    <input
                      type="password"
                      className="portal-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isOtpLoading}
                >
                  <HiOutlineCheckCircle size={17} />
                  <span>{isOtpLoading ? 'Memproses...' : 'Simpan Sandi Baru'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
