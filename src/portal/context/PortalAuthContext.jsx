import { createContext, useContext, useState, useEffect } from 'react'

const PortalAuthContext = createContext(null)

const DEFAULT_ADMIN = {
  name: 'Hendra Gunawan',
  email: 'hendra.gunawan@sunmargahayu.co.id',
  role: 'Super Admin',
  nik: 'SNY-ADM-001',
  avatar: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
  department: 'Executive Leadership'
}

export function PortalAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Default to true for easy initial preview, or check storage
    const stored = localStorage.getItem('sunny_portal_auth')
    return stored === null ? true : stored === 'true'
  })

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('sunny_portal_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        return DEFAULT_ADMIN
      }
    }
    return DEFAULT_ADMIN
  })

  const login = (email, password) => {
    // Mock login credentials
    setIsAuthenticated(true)
    localStorage.setItem('sunny_portal_auth', 'true')
    return true
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.setItem('sunny_portal_auth', 'false')
  }

  return (
    <PortalAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext)
  if (!context) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider')
  }
  return context
}
