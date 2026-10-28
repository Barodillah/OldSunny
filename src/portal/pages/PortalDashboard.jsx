import { useState, useEffect } from 'react'
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineBolt,
  HiOutlineArrowPath
} from 'react-icons/hi2'
import { usePortalAuth } from '../context/PortalAuthContext.jsx'
import './PortalDashboard.css'

export default function PortalDashboard() {
  const { user } = usePortalAuth()

  const [stats, setStats] = useState({
    total_chat_sessions: 0,
    active_chat_sessions: 0,
    total_leads: 0,
    total_article_views: 0,
    total_articles: 0,
    avg_response_time: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'
  const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true)
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: { Accept: 'application/json' }
      })
      const data = await res.json()
      if (data.success && data.data) {
        setStats(data.data)
      }
    } catch (err) {
      console.warn('Gagal memuat statistik operasional dashboard:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Ucapan waktu dinamis (pagi / siang / sore / malam)
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat Pagi'
    if (hour >= 11 && hour < 15) return 'Selamat Siang'
    if (hour >= 15 && hour < 19) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Admin'
  const greeting = getGreeting()

  return (
    <div className="portal-dashboard">
      {/* Top Greeting Banner */}
      <div className="dashboard-welcome-card">
        <div className="welcome-text-col">
          <span className="welcome-kicker">RINGKASAN OPERASIONAL DEALER</span>
          <h2 className="welcome-title">{greeting}, {firstName}</h2>
          <p className="welcome-desc">
            Pantau metrik interaksi percakapan Sunny AI, penerimaan prospek Leads, dan jangkauan artikel resmi Mitsubishi Sun Margahayu.
          </p>
        </div>

        <div className="welcome-meta-col">
          <div className="meta-badge-box meta-badge-open">
            <span className="dot-green" />
            <span>Showroom &amp; Bengkel Buka Hari Ini</span>
          </div>
          <button
            type="button"
            className="meta-badge-box btn-refresh-stats"
            onClick={fetchDashboardStats}
            title="Muat ulang data statistik"
            style={{ cursor: 'pointer', background: '#ffffff', border: '1px solid #cbd5e1' }}
          >
            <HiOutlineArrowPath size={14} className={isLoadingStats ? 'spin-icon' : ''} />
            <span>{isLoadingStats ? 'Memperbarui...' : 'Perbarui Data'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Grid */}
      <div className="dashboard-metrics-grid">
        {/* 1. Total Chat Sunny */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Chat Sunny</span>
            <div className="metric-icon-wrap icon-blue">
              <HiOutlineChatBubbleLeftRight size={18} />
            </div>
          </div>
          <div className="metric-val">
            {isLoadingStats ? '...' : stats.total_chat_sessions}{' '}
            <span className="metric-unit">Sesi</span>
          </div>
          <div className="metric-sub text-green">
            <span>
              {isLoadingStats ? 'Memuat data...' : `${stats.active_chat_sessions || 0} sesi aktif terhubung`}
            </span>
          </div>
        </div>

        {/* 2. Semua Leads */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Semua Leads Diterima</span>
            <div className="metric-icon-wrap icon-green">
              <HiOutlineUserGroup size={18} />
            </div>
          </div>
          <div className="metric-val">
            {isLoadingStats ? '...' : stats.total_leads}{' '}
            <span className="metric-unit">Leads</span>
          </div>
          <div className="metric-sub">
            <span>Seluruh data leads dari semua status</span>
          </div>
        </div>

        {/* 3. Total View Artikel */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total View Artikel</span>
            <div className="metric-icon-wrap icon-red">
              <HiOutlineEye size={18} />
            </div>
          </div>
          <div className="metric-val">
            {isLoadingStats ? '...' : Number(stats.total_article_views || 0).toLocaleString('id-ID')}{' '}
            <span className="metric-unit">Views</span>
          </div>
          <div className="metric-sub">
            <span>
              Dari total <strong>{stats.total_articles || 0} artikel</strong> terbit
            </span>
          </div>
        </div>

        {/* 4. Waktu Respon Sunny */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Waktu Respon Sunny</span>
            <div className="metric-icon-wrap icon-yellow">
              <HiOutlineBolt size={18} />
            </div>
          </div>
          <div className="metric-val">
            {isLoadingStats ? '...' : stats.avg_response_time}{' '}
            <span className="metric-unit">Detik</span>
          </div>
          <div className="metric-sub text-green metric-sub-italic">
            <span>Rata-rata 50 chat message terakhir</span>
          </div>
        </div>
      </div>
    </div>
  )
}
