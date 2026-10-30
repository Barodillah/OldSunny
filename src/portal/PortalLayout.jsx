import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { usePortalAuth } from './context/PortalAuthContext.jsx'
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
  HiOutlineChartBarSquare,
  HiOutlineBookOpen,
  HiOutlineNewspaper,
  HiOutlineClock
} from 'react-icons/hi2'
import './PortalLayout.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalLayout() {
  const { isAuthenticated, user, logout } = usePortalAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [dbStatus, setDbStatus] = useState('checking') // 'connected' | 'disconnected' | 'checking'

  // Real-time clock in topbar (Format: "HH:mm:ss Hari, DD Bulan YYYY")
  const [currentTime, setCurrentTime] = useState(() => {
    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const monthsId = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${daysId[now.getDay()]}, ${now.getDate()} ${monthsId[now.getMonth()]} ${now.getFullYear()}`
  })

  useEffect(() => {
    const pad = (n) => String(n).padStart(2, '0')
    const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const monthsId = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const updateClock = () => {
      const now = new Date()
      setCurrentTime(
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${daysId[now.getDay()]}, ${now.getDate()} ${monthsId[now.getMonth()]} ${now.getFullYear()}`
      )
    }

    const clockInterval = setInterval(updateClock, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Real-time count of new leads (by total and per-type)
  const [newLeadCounts, setNewLeadCounts] = useState({
    all: 0,
    booking: 0,
    test_drive: 0,
    prospect: 0,
    emergency: 0,
    sparepart: 0,
    complaint: 0
  })

  const fetchLeadCounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/leads/counts`, {
        headers: { 'Accept': 'application/json' }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.new_counts) {
          setNewLeadCounts(json.new_counts)
        }
      }
    } catch {
      // Silently catch network error
    }
  }, [])

  useEffect(() => {
    fetchLeadCounts()
    const timer = setInterval(fetchLeadCounts, 20000)

    const handleLeadsUpdated = () => {
      fetchLeadCounts()
    }
    window.addEventListener('leads_updated', handleLeadsUpdated)

    return () => {
      clearInterval(timer)
      window.removeEventListener('leads_updated', handleLeadsUpdated)
    }
  }, [fetchLeadCounts])

  // Health check database connection
  useEffect(() => {
    let isMounted = true

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, {
          cache: 'no-store'
        })
        if (!isMounted) return

        if (res.ok) {
          const json = await res.json()
          const isConnected =
            json.status === 'ok' ||
            json.database === 'connected' ||
            (json.database && json.database.connected === true)

          setDbStatus(isConnected ? 'connected' : 'disconnected')
        } else {
          setDbStatus('disconnected')
        }
      } catch (err) {
        if (isMounted) setDbStatus('disconnected')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const isLeadsActive = location.pathname.startsWith('/portal/leads')
  const [isLeadsSubmenuOpen, setIsLeadsSubmenuOpen] = useState(false)
  const currentSearchType = new URLSearchParams(location.search).get('type')

  const isEmployeeActive = location.pathname.startsWith('/portal/employees')
  const [isEmployeeSubmenuOpen, setIsEmployeeSubmenuOpen] = useState(false)

  const isKnowledgeActive = location.pathname.startsWith('/portal/knowledge')
  const [isKnowledgeSubmenuOpen, setIsKnowledgeSubmenuOpen] = useState(false)

  // Auto-close leads submenu when navigating away from portal leads
  useEffect(() => {
    if (location.pathname.startsWith('/portal/leads')) {
      setIsLeadsSubmenuOpen(true)
    } else {
      setIsLeadsSubmenuOpen(false)
    }
  }, [location.pathname])

  // Auto-close employee submenu when navigating away from portal employees
  useEffect(() => {
    if (location.pathname.startsWith('/portal/employees')) {
      setIsEmployeeSubmenuOpen(true)
    } else {
      setIsEmployeeSubmenuOpen(false)
    }
  }, [location.pathname])

  // Auto-close knowledge submenu when navigating away from portal knowledge
  useEffect(() => {
    if (location.pathname.startsWith('/portal/knowledge')) {
      setIsKnowledgeSubmenuOpen(true)
    } else {
      setIsKnowledgeSubmenuOpen(false)
    }
  }, [location.pathname])

  const LEAD_SUBMENU = [
    { label: 'Semua Lead', path: '/portal/leads', type: null },
    { label: 'Booking Servis', path: '/portal/leads?type=booking', type: 'booking' },
    { label: 'Test Drive', path: '/portal/leads?type=test_drive', type: 'test_drive' },
    { label: 'Pemesanan Unit', path: '/portal/leads?type=prospect', type: 'prospect' },
    { label: 'Emergency SOS', path: '/portal/leads?type=emergency', type: 'emergency' },
    { label: 'Sparepart & Aksesoris', path: '/portal/leads?type=sparepart', type: 'sparepart' },
    { label: 'Keluhan & Pertanyaan', path: '/portal/leads?type=complaint', type: 'complaint' },
  ]

  const EMPLOYEE_SUBMENU = [
    { label: 'Struktur Organisasi', path: '/portal/employees/organization' },
    { label: 'Sales', path: '/portal/employees/sales' },
    { label: 'Non aktif', path: '/portal/employees/inactive' },
  ]

  const PUBLIC_KNOWLEDGE_SUBMENU = [
    { label: 'Price List', path: '/portal/knowledge/price-list' },
    { label: 'Aksesoris', path: '/portal/knowledge/accessories' },
    { label: 'Sparepart', path: '/portal/knowledge/sparepart' },
    { label: 'Promo & Event', path: '/portal/knowledge/promo-event' },
  ]

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  const getPageTitle = () => {
    if (location.pathname.includes('/knowledge/price-list')) return 'Public Knowledge - Price List'
    if (location.pathname.includes('/knowledge/accessories')) return 'Public Knowledge - Aksesoris'
    if (location.pathname.includes('/knowledge/sparepart')) return 'Public Knowledge - Sparepart'
    if (location.pathname.includes('/knowledge/promo-event')) return 'Public Knowledge - Promo & Event'
    if (location.pathname.includes('/employees/organization')) return 'Struktur Organisasi Dealer'
    if (location.pathname.includes('/employees/sales')) return 'Manajemen Sales'
    if (location.pathname.includes('/employees/inactive')) return 'Arsip Nonaktif (Employee & Sales)'
    if (location.pathname.includes('/articles/create')) return 'Tulis Artikel Baru'
    if (location.pathname.includes('/articles/edit')) return 'Edit Artikel'
    if (location.pathname.includes('/articles')) return 'Manajemen Artikel & Berita'
    if (location.pathname.includes('/sales-rate')) return 'Sales Rate & Kinerja Sales'
    if (location.pathname.includes('/leads')) return 'Manajemen Leads (Sunny AI)'
    if (location.pathname.includes('/users')) return 'Manajemen Pengguna'
    if (location.pathname.includes('/chat-history')) return 'Riwayat Chat (Sunny AI)'
    return 'Dashboard Operasional'
  }

  return (
    <div className="portal-app">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="portal-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`portal-sidebar ${isMobileSidebarOpen ? 'is-open' : ''}`}>
        <div className="portal-sidebar-inner">
          {/* Brand Row */}
          <div className="portal-sidebar-brand">
            <Link to="/portal" className="portal-brand-link" onClick={() => setIsMobileSidebarOpen(false)}>
              <img
                src="https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp"
                alt="Logo Sunny"
                className="portal-sidebar-logo"
                onError={(e) => {
                  e.currentTarget.src = '/logo-brand.webp'
                }}
              />
              <div className="portal-brand-col">
                <span className="portal-brand-name">Sunny Portal</span>
                <span className="portal-brand-tagline">Sun Margahayu</span>
              </div>
            </Link>

            <button
              type="button"
              className="portal-sidebar-close-btn"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Tutup Menu"
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="portal-nav-section" aria-label="Menu Utama Portal">
            <span className="portal-nav-heading">MENU UTAMA</span>
            <ul className="portal-nav-list">
              <li>
                <NavLink
                  to="/portal"
                  end
                  className={({ isActive }) => `portal-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <HiOutlineSquares2X2 size={19} className="nav-item-icon" />
                  <span>Dashboard</span>
                </NavLink>
              </li>

              {/* Chat History */}
              <li>
                <NavLink
                  to="/portal/chat-history"
                  className={({ isActive }) => `portal-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <HiOutlineChatBubbleLeftRight size={19} className="nav-item-icon" />
                  <span>Chat History</span>
                </NavLink>
              </li>

              {/* Leads Dropdown Submenu (Toggle only, no direct page navigation) */}
              <li className={`portal-nav-group ${isLeadsActive ? 'has-active-child' : ''}`}>
                <button
                  type="button"
                  className={`portal-nav-parent-row ${isLeadsActive ? 'is-active' : ''}`}
                  onClick={() => setIsLeadsSubmenuOpen(prev => !prev)}
                  aria-expanded={isLeadsSubmenuOpen}
                  aria-label="Buka atau Tutup Submenu Leads"
                >
                  <div className="portal-nav-parent-label">
                    <HiOutlineClipboardDocumentList size={19} className="nav-item-icon" />
                    <span>Leads</span>
                  </div>

                  <div className="portal-nav-parent-actions">
                    {newLeadCounts.all > 0 && (
                      <span
                        className="portal-nav-badge-count"
                        title={`${newLeadCounts.all} lead baru`}
                      >
                        {newLeadCounts.all > 99 ? '99+' : newLeadCounts.all}
                      </span>
                    )}
                    <span className={`portal-nav-toggle-icon ${isLeadsSubmenuOpen ? 'is-open' : ''}`}>
                      <HiOutlineChevronDown size={14} />
                    </span>
                  </div>
                </button>

                {isLeadsSubmenuOpen && (
                  <ul className="portal-subnav-list">
                    {LEAD_SUBMENU.map((sub) => {
                      const isSubActive =
                        isLeadsActive &&
                        (sub.type === null
                          ? !currentSearchType || currentSearchType === 'all'
                          : currentSearchType === sub.type)

                      const count = sub.type === null ? newLeadCounts.all : (newLeadCounts[sub.type] || 0)

                      return (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`portal-subnav-item ${isSubActive ? 'is-active' : ''}`}
                            onClick={() => setIsMobileSidebarOpen(false)}
                          >
                            <span className="subnav-indicator-dot" />
                            <span className="subnav-item-label">{sub.label}</span>
                            {count > 0 && (
                              <span
                                className="portal-subnav-badge-count"
                                title={`${count} lead ${sub.label.toLowerCase()} berstatus baru`}
                              >
                                {count > 99 ? '99+' : count}
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>

              {/* Employee Dropdown Submenu (Toggle only, no direct page navigation) */}
              <li className={`portal-nav-group ${isEmployeeActive ? 'has-active-child' : ''}`}>
                <button
                  type="button"
                  className={`portal-nav-parent-row ${isEmployeeActive ? 'is-active' : ''}`}
                  onClick={() => setIsEmployeeSubmenuOpen(prev => !prev)}
                  aria-expanded={isEmployeeSubmenuOpen}
                  aria-label="Buka atau Tutup Submenu Employee"
                >
                  <div className="portal-nav-parent-label">
                    <HiOutlineUserGroup size={19} className="nav-item-icon" />
                    <span>Employee</span>
                  </div>

                  <span className={`portal-nav-toggle-icon ${isEmployeeSubmenuOpen ? 'is-open' : ''}`}>
                    <HiOutlineChevronDown size={14} />
                  </span>
                </button>

                {isEmployeeSubmenuOpen && (
                  <ul className="portal-subnav-list">
                    {EMPLOYEE_SUBMENU.map((sub) => {
                      const isSubActive = location.pathname === sub.path

                      return (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`portal-subnav-item ${isSubActive ? 'is-active' : ''}`}
                            onClick={() => setIsMobileSidebarOpen(false)}
                          >
                            <span className="subnav-indicator-dot" />
                            <span className="subnav-item-label">{sub.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>

              {/* Public Knowledge Dropdown Submenu */}
              <li className={`portal-nav-group ${isKnowledgeActive ? 'has-active-child' : ''}`}>
                <button
                  type="button"
                  className={`portal-nav-parent-row ${isKnowledgeActive ? 'is-active' : ''}`}
                  onClick={() => setIsKnowledgeSubmenuOpen(prev => !prev)}
                  aria-expanded={isKnowledgeSubmenuOpen}
                  aria-label="Buka atau Tutup Submenu Public Knowledge"
                >
                  <div className="portal-nav-parent-label">
                    <HiOutlineBookOpen size={19} className="nav-item-icon" />
                    <span>Public Knowledge</span>
                  </div>

                  <span className={`portal-nav-toggle-icon ${isKnowledgeSubmenuOpen ? 'is-open' : ''}`}>
                    <HiOutlineChevronDown size={14} />
                  </span>
                </button>

                {isKnowledgeSubmenuOpen && (
                  <ul className="portal-subnav-list">
                    {PUBLIC_KNOWLEDGE_SUBMENU.map((sub) => {
                      const isSubActive = location.pathname === sub.path

                      return (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`portal-subnav-item ${isSubActive ? 'is-active' : ''}`}
                            onClick={() => setIsMobileSidebarOpen(false)}
                          >
                            <span className="subnav-indicator-dot" />
                            <span className="subnav-item-label">{sub.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>

              {/* Artikel (Single Nav Link) */}
              <li>
                <NavLink
                  to="/portal/articles"
                  className={({ isActive }) => `portal-nav-item ${isActive || location.pathname.startsWith('/portal/articles') ? 'is-active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <HiOutlineNewspaper size={19} className="nav-item-icon" />
                  <span>Artikel</span>
                </NavLink>
              </li>

              {/* Sales Rate */}
              <li>
                <NavLink
                  to="/portal/sales-rate"
                  className={({ isActive }) => `portal-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <HiOutlineChartBarSquare size={19} className="nav-item-icon" />
                  <span>Sales Rate</span>
                </NavLink>
              </li>

              {/* Users Menu - Hanya untuk Admin dan Superadmin */}
              {user?.role && user.role !== 'user' && (
                <li>
                  <NavLink
                    to="/portal/users"
                    className={({ isActive }) => `portal-nav-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <HiOutlineUsers size={19} className="nav-item-icon" />
                    <span>Users</span>
                  </NavLink>
                </li>
              )}
            </ul>

            <span className="portal-nav-heading portal-nav-heading-sec">NAVIGASI EKSTERNAL</span>
            <ul className="portal-nav-list">
              <li>
                <Link
                  to="/"
                  className="portal-nav-item portal-nav-item-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineArrowTopRightOnSquare size={18} className="nav-item-icon" />
                  <span>Website Public</span>
                </Link>
              </li>
              <li>
                <Link
                  to="http://mivision.mitsubishi-motors.co.id/"
                  className="portal-nav-item portal-nav-item-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineArrowTopRightOnSquare size={18} className="nav-item-icon" />
                  <span>Mi Vision</span>
                </Link>
              </li>
              <li>
                <Link
                  to="https://csm-sunmargahayu.com/"
                  className="portal-nav-item portal-nav-item-external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineArrowTopRightOnSquare size={18} className="nav-item-icon" />
                  <span>Digital Checksheet</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Bottom Card */}
          <div className="portal-sidebar-footer">
            <div className="portal-user-card">
              <img
                src={user.avatar || 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'}
                alt={user.name}
                className="portal-user-avatar"
                onError={(e) => {
                  e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg'
                }}
              />
              <div className="portal-user-meta">
                <span className="portal-user-name">{user.name}</span>
                <span className="portal-user-position">{user.position}</span>
              </div>
              <button
                type="button"
                className="portal-btn-logout"
                onClick={handleLogout}
                title="Keluar dari Portal"
                aria-label="Keluar dari Portal"
              >
                <HiOutlineArrowRightOnRectangle size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main">
        {/* Top Header */}
        <header className="portal-topbar">
          <div className="portal-topbar-left">
            <button
              type="button"
              className="portal-mobile-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Buka Menu"
            >
              <HiOutlineBars3 size={22} />
            </button>

            <div className="portal-topbar-breadcrumb">
              <span className="portal-crumb-tag">Portal Dealer</span>
              <span className="portal-crumb-sep">/</span>
              <h1 className="portal-crumb-current">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="portal-topbar-right">
            <div
              className={`portal-status-pill ${dbStatus}`}
              title={
                dbStatus === 'connected'
                  ? 'Koneksi Database MySQL: Terhubung & Normal'
                  : dbStatus === 'disconnected'
                    ? 'Koneksi Database Terputus / Gangguan Server'
                    : 'Sedang memeriksa status koneksi database...'
              }
            >
              <span className={`portal-status-dot ${dbStatus}`} />
              <span>
                {dbStatus === 'connected'
                  ? 'System Normal'
                  : dbStatus === 'disconnected'
                    ? 'Database Terputus'
                    : 'Memeriksa DB...'}
              </span>
            </div>

            <div className="portal-topbar-clock" title="Waktu Sistem Saat Ini">
              <HiOutlineClock size={16} />
              <span>{currentTime}</span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="portal-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
