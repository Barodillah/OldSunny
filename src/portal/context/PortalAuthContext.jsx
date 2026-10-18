import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const PortalAuthContext = createContext(null)

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

export function PortalAuthProvider({ children }) {
  // 1. Data Users Table (Sinkronisasi langsung dengan MySQL Database via Laravel API)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sunny_portal_users')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        // fallback
      }
    }
    return []
  })

  // 2. Data OTPs Table (Tersimpan di LocalStorage & MySQL)
  const [otps, setOtps] = useState(() => {
    const saved = localStorage.getItem('sunny_portal_otps')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // 3. Status Sesi Pengguna
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('sunny_portal_auth')
    return stored === 'true'
  })

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('sunny_portal_current_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        return null
      }
    }
    return null
  })

  // Ambil data users terbaru langsung dari database MySQL
  const refreshUsersFromDb = useCallback(async () => {
    try {
      const headers = { 'Accept': 'application/json' }
      const storedUser = localStorage.getItem('sunny_portal_current_user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed && parsed.role) {
            headers['X-User-Role'] = parsed.role
          }
        } catch {
          // fallback
        }
      }

      const response = await fetch(`${API_BASE_URL}/users`, { headers })
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setUsers(result.data)
          localStorage.setItem('sunny_portal_users', JSON.stringify(result.data))
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data users dari MySQL, menggunakan cache lokal:', err)
    }
  }, [])

  // Jalankan fetch dari MySQL saat awal aplikasi dibuka
  useEffect(() => {
    refreshUsersFromDb()
  }, [refreshUsersFromDb])

  // Login handler: Memverifikasi langsung ke tabel users di database MySQL
  const login = async (identifier, password) => {
    const cleanId = String(identifier || '').trim()
    const cleanPass = String(password || '').trim()

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        message: 'Silakan masukkan Email / No. Telepon / NIK dan kata sandi Anda.'
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identifier: cleanId,
          password: cleanPass
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const loggedInUser = data.user
        setUser(loggedInUser)
        setIsAuthenticated(true)
        localStorage.setItem('sunny_portal_auth', 'true')
        localStorage.setItem('sunny_portal_current_user', JSON.stringify(loggedInUser))
        refreshUsersFromDb()
        return { success: true, user: loggedInUser }
      } else {
        return {
          success: false,
          message: data.message || 'Login gagal. Periksa kembali kredensial Anda.'
        }
      }
    } catch (err) {
      console.error('Koneksi ke backend MySQL gagal:', err)
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server database MySQL. Pastikan koneksi internet atau server backend aktif.'
      }
    }
  }

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false)
    localStorage.setItem('sunny_portal_auth', 'false')
    localStorage.removeItem('sunny_portal_current_user')
    setUser(null)
  }

  // Request Reset Password OTP: Simpan ke tabel otps di MySQL
  const requestResetOtp = async (identifier) => {
    const cleanId = String(identifier || '').trim()

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ identifier: cleanId })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const newOtp = {
          id: 'OTP-' + Date.now(),
          userId: data.user.id,
          userName: data.user.name,
          identifier: data.user.email,
          phone: data.user.phone,
          otpCode: data.otpCode,
          type: 'reset_password',
          createdAt: new Date().toISOString(),
          expiresAt: data.expiresAt,
          isUsed: false
        }
        setOtps((prev) => [newOtp, ...prev])
        return {
          success: true,
          otpCode: data.otpCode,
          user: data.user,
          expiresAt: data.expiresAt,
          message: data.message
        }
      } else {
        return { success: false, message: data.message || 'Gagal membuat kode OTP.' }
      }
    } catch (err) {
      console.error('Request OTP error:', err)
      return { success: false, message: 'Gagal menghubungi server database OTP.' }
    }
  }

  // Verify Reset Password OTP & Update Password langsung di MySQL
  const verifyResetOtp = async (identifier, otpCode, newPassword) => {
    const cleanId = String(identifier || '').trim()
    const cleanCode = String(otpCode || '').trim()
    const cleanNewPass = String(newPassword || '').trim()

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identifier: cleanId,
          otp_code: cleanCode,
          new_password: cleanNewPass
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        refreshUsersFromDb()
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || 'Verifikasi OTP gagal.' }
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      return { success: false, message: 'Terjadi kesalahan saat memverifikasi OTP ke database.' }
    }
  }

  // Add new user ke database MySQL
  const addUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        refreshUsersFromDb()
        return { success: true, user: data.data }
      } else {
        alert(data.message || 'Gagal menambahkan pengguna ke database.')
        return { success: false, message: data.message }
      }
    } catch (err) {
      console.error('Add user error:', err)
      return { success: false, message: 'Gagal terhubung ke database.' }
    }
  }

  // Update user di database MySQL
  const updateUser = async (userId, updatedFields) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedFields)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        refreshUsersFromDb()
        if (user && String(user.id) === String(userId)) {
          const merged = { ...user, ...updatedFields }
          setUser(merged)
          localStorage.setItem('sunny_portal_current_user', JSON.stringify(merged))
        }
        return { success: true }
      } else {
        alert(data.message || 'Gagal memperbarui pengguna.')
        return { success: false }
      }
    } catch (err) {
      console.error('Update user error:', err)
      return { success: false }
    }
  }

  // Delete user dari database MySQL
  const deleteUser = async (userId) => {
    if (user && String(user.id) === String(userId)) {
      return { success: false, message: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini.' }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        refreshUsersFromDb()
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Gagal menghapus pengguna dari database.' }
      }
    } catch (err) {
      console.error('Delete user error:', err)
      return { success: false, message: 'Gagal terhubung ke server database.' }
    }
  }

  return (
    <PortalAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        users,
        otps,
        login,
        logout,
        requestResetOtp,
        verifyResetOtp,
        addUser,
        updateUser,
        deleteUser,
        refreshUsersFromDb
      }}
    >
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
