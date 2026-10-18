import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { usePortalAuth } from './context/PortalAuthContext.jsx'
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineShieldCheck
} from 'react-icons/hi2'
import './PortalLayout.css'

export default function PortalLayout() {
  const { isAuthenticated, user, logout } = usePortalAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  const getPageTitle = () => {
    if (location.pathname.includes('/users')) return 'Manajemen Pengguna'
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
                src="https://bewhy.id/wp-content/uploads/url_6acf112141e379.21076281.webp"
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
              <li>
                <NavLink
                  to="/portal/users"
                  className={({ isActive }) => `portal-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <HiOutlineUsers size={19} className="nav-item-icon" />
                  <span>Pengguna (Users)</span>
                </NavLink>
              </li>
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
                  <span>Website Showroom</span>
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
                <span className="portal-user-role">{user.role}</span>
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
            <div className="portal-status-pill">
              <span className="portal-status-dot" />
              <span>Sistem Operasional Normal</span>
            </div>

            <div className="portal-topbar-user">
              <HiOutlineShieldCheck size={16} className="text-emerald" />
              <span className="portal-topbar-user-name">{user.name}</span>
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
