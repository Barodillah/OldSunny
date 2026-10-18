import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePortalAuth } from '../context/PortalAuthContext.jsx'
import {
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineArrowLeft
} from 'react-icons/hi2'
import './PortalLogin.css'

export default function PortalLogin() {
  const navigate = useNavigate()
  const { login } = usePortalAuth()

  const [email, setEmail] = useState('admin@sunmargahayu.co.id')
  const [password, setPassword] = useState('password123')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Silakan masukkan email / NIK dan kata sandi Anda.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      login(email, password)
      setIsLoading(false)
      navigate('/portal')
    }, 400)
  }

  const handleDemoLogin = () => {
    setEmail('admin@sunmargahayu.co.id')
    setPassword('admin2026')
    setIsLoading(true)
    setTimeout(() => {
      login('admin@sunmargahayu.co.id', 'admin2026')
      setIsLoading(false)
      navigate('/portal')
    }, 300)
  }

  return (
    <div className="portal-login-page">
      <div className="portal-login-backdrop-glow" />

      <div className="portal-login-card">
        {/* Back Link */}
        <div className="portal-login-top-nav">
          <Link to="/" className="portal-back-to-web" title="Kembali ke Beranda">
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
              Email atau NIK Staf
            </label>
            <div className="portal-input-wrapper">
              <HiOutlineEnvelope className="portal-input-icon" size={18} />
              <input
                id="portal-email"
                type="text"
                className="portal-input"
                placeholder="nama@sunmargahayu.co.id / NIK"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <a
                href="#forgot"
                className="portal-forgot-link"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Untuk pemulihan kata sandi, silakan hubungi Administrator IT Dealer Sun Margahayu.')
                }}
              >
                Lupa sandi?
              </a>
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

        {/* Quick Demo Access Button */}
        <div className="portal-demo-box">
          <div className="portal-demo-divider">
            <span>Akses Cepat Pengujian</span>
          </div>
          <button
            type="button"
            className="portal-btn-demo"
            onClick={handleDemoLogin}
          >
            <HiOutlineShieldCheck size={18} />
            <span>Masuk Langsung sebagai Super Admin (Demo)</span>
          </button>
        </div>

        {/* Security Footer Note */}
        <div className="portal-login-footer">
          <HiOutlineShieldCheck size={15} className="text-emerald" />
          <span>Akses terenkripsi khusus staf resmi PT Sun Star Prima Motor.</span>
        </div>
      </div>
    </div>
  )
}
