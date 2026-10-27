import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  HiOutlineSparkles,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineLink,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineDocumentDuplicate,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronUp,
  HiOutlineChevronDown
} from 'react-icons/hi2'
import {
  RiPercentLine,
  RiCoupon2Line,
  RiCarLine,
  RiShieldCheckLine,
  RiExternalLinkLine
} from 'react-icons/ri'
import './PortalPromoEvent.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalPromoEvent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Promos list state
  const [promos, setPromos] = useState([])
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all' | 'leasing' | 'event' | 'service'
  const [linkFilter, setLinkFilter] = useState('all') // 'all' | 'active_link' | 'no_link'

  // Modals state
  const [modalConfig, setModalConfig] = useState(null) // { mode: 'add'|'edit', index?: number, item: {...} }
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState(null) // { id, title, onConfirm }
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false)

  // Toast notifications state
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7)
    setToasts((prev) => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Fetch promos from API
  const fetchPromos = useCallback(async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE_URL}/portal/promos`, {
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data Promo & Event`)

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setPromos(json.data)
        setLastUpdatedAt(json.last_updated || new Date().toISOString())
        setHasUnsavedChanges(false)
      } else {
        throw new Error(json.message || 'Format data respon tidak valid.')
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Terjadi kendala saat memuat data: ${err.message}. Pastikan backend API aktif.`
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromos()
  }, [fetchPromos])

  // Overview stats
  const stats = useMemo(() => {
    const total = promos.length
    const leasing = promos.filter((p) => p.category === 'leasing').length
    const event = promos.filter((p) => p.category === 'event').length
    const service = promos.filter((p) => p.category === 'service').length
    const activeLinks = promos.filter((p) => Boolean(p.action_link_active)).length
    return { total, leasing, event, service, activeLinks }
  }, [promos])

  // Filtered list
  const filteredPromos = useMemo(() => {
    return promos.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = item.title?.toLowerCase().includes(q)
        const matchVehicles = item.target_vehicles?.toLowerCase().includes(q)
        const matchBadge = item.badge?.toLowerCase().includes(q)
        const matchLink = item.action_link?.toLowerCase().includes(q)
        if (!matchTitle && !matchVehicles && !matchBadge && !matchLink) {
          return false
        }
      }

      // 2. Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      // 3. Link Filter
      if (linkFilter === 'active_link' && !item.action_link_active) {
        return false
      }
      if (linkFilter === 'no_link' && item.action_link_active) {
        return false
      }

      return true
    })
  }, [promos, searchQuery, selectedCategory, linkFilter])

  // Save all changes to API
  const handleSaveAll = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      // Reorder items and save in sequence
      const reorderRes = await fetch(`${API_BASE_URL}/portal/promos/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ids: promos.map((p) => p.id)
        })
      })

      if (!reorderRes.ok) {
        throw new Error('Gagal menyinkronkan urutan promo.')
      }

      setHasUnsavedChanges(false)
      setLastUpdatedAt(new Date().toISOString())
      setFeedback({
        type: 'success',
        message: 'Seluruh data Promo & Event berhasil disimpan dan disinkronkan ke website serta Sunny AI.'
      })
      showToast('Data Promo & Event berhasil disimpan!', 'success')
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Gagal menyimpan: ${err.message}`
      })
      showToast(`Gagal menyimpan: ${err.message}`, 'error', 4500)
    } finally {
      setSaving(false)
    }
  }

  // Toggle quick action link active
  const handleToggleActionLink = async (promoItem) => {
    const updatedStatus = !promoItem.action_link_active
    setPromos((prev) =>
      prev.map((p) => (p.id === promoItem.id ? { ...p, action_link_active: updatedStatus } : p))
    )
    setHasUnsavedChanges(true)

    try {
      const res = await fetch(`${API_BASE_URL}/portal/promos/${promoItem.id}/toggle-link`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) throw new Error('Gagal menghubungi server')

      if (updatedStatus && (!promoItem.action_link || !promoItem.action_link.trim())) {
        showToast(
          `Link Action "${promoItem.title}" AKTIF. Silakan klik Edit untuk mengisi URL formulir jika belum diisi.`,
          'warning',
          4500
        )
      } else {
        showToast(
          `Link Action "${promoItem.title}" sekarang ${updatedStatus ? 'AKTIF' : 'NONAKTIF'}!`,
          updatedStatus ? 'success' : 'info'
        )
      }
    } catch (err) {
      showToast('Perubahan disimpan di sesi lokal.', 'warning')
    }
  }

  // Toggle promo status (is_active)
  const handleToggleActive = (promoItem) => {
    const updatedStatus = !promoItem.is_active
    setPromos((prev) =>
      prev.map((p) => (p.id === promoItem.id ? { ...p, is_active: updatedStatus } : p))
    )
    setHasUnsavedChanges(true)
    showToast(
      `Status promo "${promoItem.title}" diubah menjadi ${updatedStatus ? 'Aktif' : 'Non-aktif'}.`,
      'info'
    )
  }

  // Move Promo Up / Down
  const handleMovePromo = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= promos.length) return

    const copy = [...promos]
    const [moved] = copy.splice(index, 1)
    copy.splice(targetIndex, 0, moved)

    setPromos(copy)
    setHasUnsavedChanges(true)
    showToast('Urutan promo diperbarui', 'info', 2000)
  }

  // Delete Promo
  const handleDeletePromo = (promoItem) => {
    setDeleteConfirmConfig({
      id: promoItem.id,
      title: promoItem.title,
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE_URL}/portal/promos/${promoItem.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' }
          })
          setPromos((prev) => prev.filter((p) => p.id !== promoItem.id))
          setDeleteConfirmConfig(null)
          showToast(`Promo "${promoItem.title}" berhasil dihapus`, 'info')
        } catch (err) {
          showToast(`Gagal menghapus promo: ${err.message}`, 'error')
        }
      }
    })
  }

  // Duplicate Promo
  const handleDuplicatePromo = (promoItem) => {
    const duplicated = {
      ...promoItem,
      id: Date.now(),
      title: `${promoItem.title} (Salinan)`,
      is_active: false
    }
    const idx = promos.findIndex((p) => p.id === promoItem.id)
    const copy = [...promos]
    copy.splice(idx + 1, 0, duplicated)
    setPromos(copy)
    setHasUnsavedChanges(true)
    showToast(`Salinan untuk "${promoItem.title}" berhasil dibuat`, 'success')
  }

  // Save Modal Form
  const handleSaveModal = async (formData) => {
    const { mode, id, data } = formData

    try {
      if (mode === 'edit' && id) {
        const res = await fetch(`${API_BASE_URL}/portal/promos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal memperbarui promo.')

        setPromos((prev) => prev.map((p) => (p.id === id ? json.data : p)))
        showToast(`Promo "${data.title}" berhasil diperbarui!`, 'success')
      } else {
        const res = await fetch(`${API_BASE_URL}/portal/promos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal menambahkan promo.')

        setPromos((prev) => [json.data, ...prev])
        showToast(`Promo baru "${data.title}" berhasil ditambahkan!`, 'success')
      }

      setModalConfig(null)
      setHasUnsavedChanges(false)
    } catch (err) {
      showToast(`Gagal menyimpan: ${err.message}`, 'error', 4500)
    }
  }

  // Reset to default
  const handleConfirmReset = async () => {
    setIsResetConfirmModalOpen(false)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/portal/promos/reset`, {
        method: 'POST',
        headers: { Accept: 'application/json' }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal mereset data promo.')

      setPromos(json.data || [])
      setHasUnsavedChanges(false)
      showToast('Seluruh Promo & Event berhasil direset ke data default!', 'info')
    } catch (err) {
      showToast(`Gagal mereset: ${err.message}`, 'error', 4500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="portal-promo-page">
        <div className="promo-loading-state">
          <HiOutlineArrowPath size={36} className="spin-slow" />
          <p>Memuat Master Data Promo & Event Dealer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-promo-page">
      {/* Toast Alert Notifications */}
      {toasts.length > 0 && (
        <div className="promo-toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`promo-toast-item promo-toast-${toast.type}`}>
              <div className="promo-toast-icon">
                {toast.type === 'success' && <HiOutlineCheck size={18} />}
                {toast.type === 'error' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'warning' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'info' && <HiOutlineInformationCircle size={18} />}
              </div>
              <div className="promo-toast-message">{toast.message}</div>
              <button
                type="button"
                className="promo-toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup Notifikasi"
              >
                <HiOutlineXMark size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header Row */}
      <div className="promo-header-row">
        <div className="promo-title-group">
          <div className="promo-title-badge">
            <RiPercentLine size={16} />
            <span>Public Knowledge — Promo & Event</span>
          </div>
          <h1>Manajemen Promo & Event Mitsubishi Margahayu</h1>
          <p>
            Kelola program pembiayaan bunga 0%, paket DP ringan, cashback tukar tambah, event showroom weekend gathering, dan diskon servis berkala.
            Dilengkapi pengaturan <strong>Link Action</strong> untuk formulir pendaftaran event terpisah dan form klaim promo.
          </p>
        </div>

        <div className="promo-header-actions">
          <a
            href="/promo"
            target="_blank"
            rel="noopener noreferrer"
            className="promo-btn-preview"
            title="Buka halaman publik Promo di tab baru"
          >
            <HiOutlineArrowTopRightOnSquare size={16} />
            <span>Lihat Halaman Publik</span>
          </a>

          <button
            type="button"
            className="promo-btn-reset"
            onClick={() => setIsResetConfirmModalOpen(true)}
            disabled={saving}
            title="Kembalikan semua data promo ke default awal"
          >
            <HiOutlineArrowPath size={16} className={saving ? 'spin-slow' : ''} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            className="promo-btn-save"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <>
                <HiOutlineArrowPath size={18} className="spin-slow" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <HiOutlineCheckBadge size={18} />
                <span>Simpan Perubahan Promo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning Alert Banner */}
      {hasUnsavedChanges && (
        <div className="promo-unsaved-banner">
          <div className="promo-unsaved-content">
            <HiOutlineExclamationTriangle size={22} className="promo-unsaved-icon" />
            <div>
              <strong>Ada perubahan yang belum disimpan!</strong>
              <p>
                Perubahan yang Anda lakukan hanya tersimpan di sesi lokal ini. Klik tombol merah "Simpan Perubahan Promo" di atas untuk memperbarui website publik dan Sunny AI.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="promo-btn-quick-save"
            onClick={handleSaveAll}
            disabled={saving}
          >
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`promo-feedback-banner promo-feedback-${feedback.type}`}>
          <div className="promo-feedback-icon">
            {feedback.type === 'success' ? <HiOutlineCheck size={20} /> : <HiOutlineExclamationTriangle size={20} />}
          </div>
          <div className="promo-feedback-text">{feedback.message}</div>
          <button type="button" className="promo-feedback-close" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Overview Statistics Grid */}
      <div className="promo-stats-grid">
        <div className="promo-stat-card">
          <div className="promo-stat-icon red">
            <RiPercentLine size={24} />
          </div>
          <div className="promo-stat-info">
            <span className="promo-stat-label">Total Promo & Event</span>
            <strong className="promo-stat-value">{stats.total} Program</strong>
          </div>
        </div>

        <div className="promo-stat-card">
          <div className="promo-stat-icon blue">
            <RiCarLine size={24} />
          </div>
          <div className="promo-stat-info">
            <span className="promo-stat-label">Paket Leasing & Penjualan</span>
            <strong className="promo-stat-value">{stats.leasing} Promo</strong>
          </div>
        </div>

        <div className="promo-stat-card">
          <div className="promo-stat-icon dark">
            <HiOutlineCalendar size={24} />
          </div>
          <div className="promo-stat-info">
            <span className="promo-stat-label">Event Showroom</span>
            <strong className="promo-stat-value">{stats.event} Event</strong>
          </div>
        </div>

        <div className="promo-stat-card">
          <div className="promo-stat-icon emerald">
            <HiOutlineLink size={24} />
          </div>
          <div className="promo-stat-info">
            <span className="promo-stat-label">Link Action Aktif</span>
            <strong className="promo-stat-value">{stats.activeLinks} Tombol Link</strong>
          </div>
        </div>
      </div>

      {/* Main Content Card: Toolbar, Table, and Actions */}
      <div className="promo-content-card">
        {/* Toolbar */}
        <div className="promo-toolbar">
          <div className="promo-search-box">
            <HiOutlineMagnifyingGlass size={18} className="promo-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul promo, target kendaraan, badge, atau URL link..."
              className="promo-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="promo-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <HiOutlineXMark size={15} />
              </button>
            )}
          </div>

          <div className="promo-filter-controls">
            {/* Filter Link Action Dropdown */}
            <div className="promo-filter-select-wrap">
              <label>Link Action:</label>
              <select
                value={linkFilter}
                onChange={(e) => setLinkFilter(e.target.value)}
                className="promo-select"
              >
                <option value="all">Semua</option>
                <option value="active_link">Hanya Link Aktif ({stats.activeLinks})</option>
                <option value="no_link">Tanpa Link Action</option>
              </select>
            </div>

            {/* Add Promo Button */}
            <button
              type="button"
              className="promo-btn-add-primary"
              onClick={() =>
                setModalConfig({
                  mode: 'add',
                  item: {
                    title: '',
                    category: selectedCategory !== 'all' ? selectedCategory : 'leasing',
                    category_label: 'Leasing',
                    badge: 'PROMO BULAN INI',
                    badge_theme: 'red',
                    target_vehicles: 'New XFORCE, New Xpander',
                    validity: 'Berlaku s/d Akhir Bulan Ini',
                    highlight: '',
                    bullets: ['Poin penawaran unggulan pertama'],
                    terms: ['Syarat & ketentuan berlaku'],
                    action_link: '',
                    action_link_active: false,
                    action_button_label: 'Klaim Promo',
                    is_active: true
                  }
                })
              }
            >
              <HiOutlinePlus size={18} />
              <span>Tambah Promo / Event</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="promo-category-pills-bar">
          <button
            type="button"
            className={`promo-category-pill ${selectedCategory === 'all' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Semua ({promos.length})
          </button>
          <button
            type="button"
            className={`promo-category-pill ${selectedCategory === 'leasing' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('leasing')}
          >
            Leasing &amp; Bunga 0% ({stats.leasing})
          </button>
          <button
            type="button"
            className={`promo-category-pill ${selectedCategory === 'event' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('event')}
          >
            Event Showroom &amp; Gathering ({stats.event})
          </button>
          <button
            type="button"
            className={`promo-category-pill ${selectedCategory === 'service' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('service')}
          >
            Servis &amp; After Sales ({stats.service})
          </button>
        </div>

        {/* Table View */}
        {filteredPromos.length === 0 ? (
          <div className="promo-empty-table">
            <RiPercentLine size={40} className="promo-empty-icon" />
            <h3>Tidak ada program promo yang cocok</h3>
            <p>Cobalah mengatur kata kunci pencarian atau reset filter kategori.</p>
            <button
              type="button"
              className="promo-btn-empty-reset"
              onClick={() => {
                setSelectedCategory('all')
                setLinkFilter('all')
                setSearchQuery('')
              }}
            >
              Tampilkan Semua Promo
            </button>
          </div>
        ) : (
          <div className="promo-table-container">
            <table className="promo-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Urutan</th>
                  <th style={{ width: '130px' }}>Badge &amp; Kategori</th>
                  <th>Judul Promo / Event</th>
                  <th>Target Unit &amp; Masa Berlaku</th>
                  {/* Kolom Link Action Utama */}
                  <th style={{ width: '260px' }}>
                    <div className="th-link-action-header">
                      <HiOutlineLink size={16} />
                      <span>Kolom Link Action (Form / Klaim)</span>
                    </div>
                  </th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map((item, index) => {
                  const originalIndex = promos.indexOf(item)
                  const isFirst = originalIndex === 0
                  const isLast = originalIndex === promos.length - 1
                  const hasLink = Boolean(item.action_link && item.action_link.trim())
                  const isLinkActive = Boolean(item.action_link_active)

                  return (
                    <tr key={item.id} className="promo-table-row">
                      {/* Urutan */}
                      <td className="promo-td-order">
                        <div className="promo-order-btns">
                          <button
                            type="button"
                            className="promo-btn-order"
                            disabled={isFirst}
                            onClick={() => handleMovePromo(originalIndex, 'up')}
                            title="Naikkan Urutan"
                          >
                            <HiOutlineChevronUp size={14} />
                          </button>
                          <span className="promo-order-number">{originalIndex + 1}</span>
                          <button
                            type="button"
                            className="promo-btn-order"
                            disabled={isLast}
                            onClick={() => handleMovePromo(originalIndex, 'down')}
                            title="Turunkan Urutan"
                          >
                            <HiOutlineChevronDown size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Badge & Kategori */}
                      <td className="promo-td-badge">
                        <span className={`promo-item-badge badge-${item.badge_theme || item.badgeTheme || 'red'}`}>
                          {item.badge}
                        </span>
                        <span className="promo-cat-label">
                          {item.category === 'leasing' && 'Leasing & Finance'}
                          {item.category === 'event' && 'Event Showroom'}
                          {item.category === 'service' && 'After Sales Servis'}
                        </span>
                      </td>

                      {/* Judul & Highlight */}
                      <td className="promo-td-title">
                        <strong className="promo-title-text">{item.title}</strong>
                        {item.highlight && <p className="promo-highlight-text">{item.highlight}</p>}
                      </td>

                      {/* Target Unit & Validity */}
                      <td className="promo-td-meta">
                        <div className="promo-meta-unit">
                          <RiCarLine size={15} />
                          <span>{item.target_vehicles || item.targetVehicles || '-'}</span>
                        </div>
                        <div className="promo-meta-validity">
                          <HiOutlineCalendar size={14} />
                          <span>{item.validity || 'Berlaku saat ini'}</span>
                        </div>
                      </td>

                      {/* Kolom Link Action */}
                      <td className="promo-td-link-action">
                        <div className="promo-link-action-card">
                          <div className="promo-link-top-row">
                            <div className="promo-switch-group">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isLinkActive}
                                className={`promo-toggle-btn ${isLinkActive ? 'is-active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleActionLink(item)
                                }}
                                title={isLinkActive ? 'Klik untuk menonaktifkan link' : 'Klik untuk mengaktifkan link'}
                              >
                                <span className="promo-toggle-thumb" />
                              </button>
                              <span
                                className={`promo-toggle-status-text ${isLinkActive ? 'is-active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleActionLink(item)
                                }}
                              >
                                {isLinkActive ? 'Tombol Aktif' : 'Non-aktif'}
                              </span>
                            </div>

                            {hasLink && (
                              <a
                                href={item.action_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="promo-btn-test-link"
                                title="Buka dan uji link formulir di tab baru"
                              >
                                <RiExternalLinkLine size={13} />
                                <span>Uji Link</span>
                              </a>
                            )}
                          </div>

                          {hasLink ? (
                            <div className="promo-link-url-box" title={item.action_link}>
                              <HiOutlineLink size={13} className="link-icon" />
                              <span className="link-url-text">{item.action_link}</span>
                            </div>
                          ) : (
                            <div
                              className="promo-link-empty-box"
                              onClick={() =>
                                setModalConfig({
                                  mode: 'edit',
                                  id: item.id,
                                  item: { ...item }
                                })
                              }
                              title="Klik untuk mengisi URL link sekarang"
                            >
                              <span>Belum ada URL link. Klik untuk mengisi →</span>
                            </div>
                          )}

                          <div className="promo-link-preview-row">
                            <span className="promo-preview-tag">
                              Label: <strong>{item.action_button_label || (item.category === 'event' ? 'Ikuti Event' : 'Klaim Promo')}</strong>
                            </span>
                            <span className="promo-role-tag">
                              {item.category === 'event' ? 'Form Pendaftaran' : 'Form Klaim'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="promo-td-status">
                        <button
                          type="button"
                          className={`promo-status-toggle-btn ${item.is_active ? 'is-active' : ''}`}
                          onClick={() => handleToggleActive(item)}
                          title="Klik untuk mengubah status aktif promo"
                        >
                          <span className="status-dot" />
                          <span>{item.is_active ? 'Aktif' : 'Non-aktif'}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="promo-td-actions">
                        <div className="promo-action-buttons">
                          <button
                            type="button"
                            className="promo-btn-action edit"
                            onClick={() =>
                              setModalConfig({
                                mode: 'edit',
                                id: item.id,
                                item: { ...item }
                              })
                            }
                            title="Edit Promo / Event"
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>
                          <button
                            type="button"
                            className="promo-btn-action duplicate"
                            onClick={() => handleDuplicatePromo(item)}
                            title="Duplikasi Promo"
                          >
                            <HiOutlineDocumentDuplicate size={16} />
                          </button>
                          <button
                            type="button"
                            className="promo-btn-action delete"
                            onClick={() => handleDeletePromo(item)}
                            title="Hapus Promo"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
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

      {/* ==========================================================================
          MODAL: FORM TAMBAH / EDIT PROMO & EVENT
          ========================================================================== */}
      {modalConfig && (
        <PromoFormModal
          config={modalConfig}
          onClose={() => setModalConfig(null)}
          onSave={handleSaveModal}
        />
      )}

      {/* ==========================================================================
          MODAL: KONFIRMASI HAPUS (PROPER MODAL DIALOG)
          ========================================================================== */}
      {deleteConfirmConfig && (
        <div className="promo-modal-overlay" onClick={() => setDeleteConfirmConfig(null)}>
          <div className="promo-modal-card promo-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="promo-delete-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="promo-delete-modal-title">Hapus Promo / Event?</h3>
            <p className="promo-delete-modal-desc">
              Apakah Anda yakin ingin menghapus program <strong>"{deleteConfirmConfig.title}"</strong> dari katalog promo?
            </p>
            <div className="promo-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>Program ini tidak akan tampil lagi di website publik dan asisten AI Sunny.</span>
            </div>
            <div className="promo-delete-modal-actions">
              <button
                type="button"
                className="promo-btn-delete-cancel"
                onClick={() => setDeleteConfirmConfig(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="promo-btn-delete-confirm"
                onClick={deleteConfirmConfig.onConfirm}
              >
                <HiOutlineTrash size={16} />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL: KONFIRMASI RESET DEFAULT (PROPER MODAL DIALOG)
          ========================================================================== */}
      {isResetConfirmModalOpen && (
        <div className="promo-modal-overlay" onClick={() => setIsResetConfirmModalOpen(false)}>
          <div className="promo-modal-card promo-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="promo-delete-icon-wrap warning-yellow">
              <HiOutlineArrowPath size={32} />
            </div>
            <h3 className="promo-delete-modal-title">Reset ke Promo Default?</h3>
            <p className="promo-delete-modal-desc">
              Tindakan ini akan mengembalikan seluruh data Promo &amp; Event ke program bawaan awal dealer (Bunga 0%, DP Ringan, Subsidi Trade-in, Gathering Showroom, dsb).
            </p>
            <div className="promo-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>Semua penambahan promo kustom dan link action baru yang telah dibuat akan digantikan data default.</span>
            </div>
            <div className="promo-delete-modal-actions">
              <button
                type="button"
                className="promo-btn-delete-cancel"
                onClick={() => setIsResetConfirmModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="promo-btn-reset-confirm"
                onClick={handleConfirmReset}
              >
                <HiOutlineArrowPath size={16} />
                <span>Ya, Reset Data Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Subcomponent: Form Tambah / Edit Promo & Event
function PromoFormModal({ config, onClose, onSave }) {
  const { mode, id, item: initialItem } = config

  const [title, setTitle] = useState(initialItem?.title || '')
  const [category, setCategory] = useState(initialItem?.category || 'leasing')
  const [badge, setBadge] = useState(initialItem?.badge || 'PROMO')
  const [badgeTheme, setBadgeTheme] = useState(initialItem?.badge_theme || initialItem?.badgeTheme || 'red')
  const [targetVehicles, setTargetVehicles] = useState(initialItem?.target_vehicles || initialItem?.targetVehicles || '')
  const [validity, setValidity] = useState(initialItem?.validity || 'Berlaku s/d Akhir Bulan Ini')
  const [highlight, setHighlight] = useState(initialItem?.highlight || '')

  // Bullets & Terms
  const [bullets, setBullets] = useState(
    Array.isArray(initialItem?.bullets) && initialItem.bullets.length > 0
      ? [...initialItem.bullets]
      : ['']
  )
  const [terms, setTerms] = useState(
    Array.isArray(initialItem?.terms) && initialItem.terms.length > 0
      ? [...initialItem.terms]
      : ['']
  )

  // Link Action States (Feature Highlight)
  const [actionLink, setActionLink] = useState(initialItem?.action_link || '')
  const [actionLinkActive, setActionLinkActive] = useState(Boolean(initialItem?.action_link_active))
  const [actionButtonLabel, setActionButtonLabel] = useState(
    initialItem?.action_button_label || (initialItem?.category === 'event' ? 'Ikuti Event' : 'Klaim Promo')
  )

  const [isActive, setIsActive] = useState(initialItem?.is_active !== false)

  // Auto-adjust default button label when category changes if user hasn't typed custom label
  const handleCategoryChange = (newCat) => {
    setCategory(newCat)
    if (newCat === 'event' && (!actionButtonLabel || actionButtonLabel === 'Klaim Promo')) {
      setActionButtonLabel('Daftar Event Sekarang')
      setBadge('EVENT DEALER')
      setBadgeTheme('dark')
    } else if (newCat !== 'event' && (!actionButtonLabel || actionButtonLabel === 'Daftar Event Sekarang')) {
      setActionButtonLabel('Klaim Promo')
      if (newCat === 'service') {
        setBadge('AFTER SALES')
        setBadgeTheme('red')
      } else {
        setBadge('BUNGA 0%')
        setBadgeTheme('red')
      }
    }
  }

  // Manage Bullets Array
  const handleBulletChange = (idx, value) => {
    const copy = [...bullets]
    copy[idx] = value
    setBullets(copy)
  }

  const handleAddBullet = () => setBullets([...bullets, ''])
  const handleRemoveBullet = (idx) => setBullets(bullets.filter((_, i) => i !== idx))

  // Manage Terms Array
  const handleTermChange = (idx, value) => {
    const copy = [...terms]
    copy[idx] = value
    setTerms(copy)
  }

  const handleAddTerm = () => setTerms([...terms, ''])
  const handleRemoveTerm = (idx) => setTerms(terms.filter((_, i) => i !== idx))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const categoryLabel =
      category === 'event'
        ? 'Event Showroom'
        : category === 'service'
        ? 'After Sales'
        : 'Leasing'

    onSave({
      mode,
      id,
      data: {
        title: title.trim(),
        category,
        category_label: categoryLabel,
        badge: badge.trim() || 'PROMO',
        badge_theme: badgeTheme,
        target_vehicles: targetVehicles.trim(),
        validity: validity.trim(),
        highlight: highlight.trim(),
        bullets: bullets.map((b) => b.trim()).filter(Boolean),
        terms: terms.map((t) => t.trim()).filter(Boolean),
        action_link: actionLink.trim(),
        action_link_active: actionLinkActive,
        action_button_label: actionButtonLabel.trim(),
        is_active: isActive
      }
    })
  }

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal-card promo-form-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="promo-modal-header">
          <div className="promo-modal-title-wrap">
            <RiPercentLine size={24} className="promo-modal-icon-header" />
            <div>
              <h3 className="promo-modal-title">
                {mode === 'edit' ? 'Edit Promo & Event' : 'Tambah Promo / Event Baru'}
              </h3>
              <p className="promo-modal-subtitle">
                Atur rincian penawaran dan formulir Link Action untuk konsumen
              </p>
            </div>
          </div>
          <button type="button" className="promo-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="promo-modal-form">
          {/* Judul & Kategori */}
          <div className="promo-form-group">
            <label className="promo-form-label">
              Judul Program Promo / Event <span className="req">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Program Bunga 0% Tenor hingga 2 Tahun"
              className="promo-modal-input"
            />
          </div>

          <div className="promo-form-row">
            <div className="promo-form-group">
              <label className="promo-form-label">Kategori Program</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="promo-modal-select"
              >
                <option value="leasing">Leasing / Penjualan Unit</option>
                <option value="event">Event Showroom &amp; Gathering</option>
                <option value="service">After Sales / Servis Bengkel</option>
              </select>
            </div>

            <div className="promo-form-group">
              <label className="promo-form-label">Badge Label &amp; Warna</label>
              <div className="promo-badge-inputs-row">
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value.toUpperCase())}
                  placeholder="BUNGA 0%"
                  className="promo-modal-input"
                />
                <select
                  value={badgeTheme}
                  onChange={(e) => setBadgeTheme(e.target.value)}
                  className="promo-modal-select-theme"
                >
                  <option value="red">Merah</option>
                  <option value="dark">Hitam</option>
                  <option value="emerald">Hijau</option>
                  <option value="blue">Biru</option>
                </select>
              </div>
            </div>
          </div>

          <div className="promo-form-row">
            <div className="promo-form-group">
              <label className="promo-form-label">Target Lini Mobil</label>
              <input
                type="text"
                value={targetVehicles}
                onChange={(e) => setTargetVehicles(e.target.value)}
                placeholder="Contoh: New XFORCE, New Xpander, Pajero Sport"
                className="promo-modal-input"
              />
            </div>

            <div className="promo-form-group">
              <label className="promo-form-label">Masa Berlaku / Kuota</label>
              <input
                type="text"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                placeholder="Contoh: Berlaku s/d Akhir Bulan Ini"
                className="promo-modal-input"
              />
            </div>
          </div>

          <div className="promo-form-group">
            <label className="promo-form-label">Ringkasan / Highlight Penawaran</label>
            <textarea
              rows={2}
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="Contoh: Angsuran bebas bunga hingga 24 bulan resmi pembiayaan Dipo Star Finance..."
              className="promo-modal-textarea"
            />
          </div>

          {/* ====================================================================
              FITUR UTAMA: SECTION KOLOM LINK ACTION (EVENT REGISTRATION / PROMO CLAIM)
              ==================================================================== */}
          <div className="promo-link-action-editor-section">
            <div className="promo-link-editor-header">
              <div className="promo-link-editor-title">
                <HiOutlineLink size={20} className="editor-icon" />
                <div>
                  <strong>Pengaturan Kolom Link Action (Formulir Pendaftaran / Form Klaim)</strong>
                  <p>
                    {category === 'event'
                      ? 'Untuk Event: Tombol "Ikuti Event" di website akan mengarahkan peserta ke link formulir ini.'
                      : 'Untuk Promo: Menampilkan tombol "Klaim Promo" di antara tombol utama (Pilih Sales / Booking Servis) dan Syarat & Ketentuan.'}
                  </p>
                </div>
              </div>

              <div className="promo-switch-group promo-modal-switch-wrap">
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(actionLinkActive)}
                  className={`promo-toggle-btn ${actionLinkActive ? 'is-active' : ''}`}
                  onClick={() => setActionLinkActive(!actionLinkActive)}
                  title="Klik untuk mengaktifkan / menonaktifkan link tombol di web publik"
                >
                  <span className="promo-toggle-thumb" />
                </button>
                <span
                  className={`promo-toggle-status-text ${actionLinkActive ? 'is-active' : ''}`}
                  onClick={() => setActionLinkActive(!actionLinkActive)}
                >
                  {actionLinkActive ? 'Aktif di Web' : 'Non-aktif'}
                </span>
              </div>
            </div>

            <div className="promo-link-editor-body">
              <div className="promo-form-group">
                <label className="promo-form-label">
                  URL Tujuan Link Action (Google Form / Typeform / Landing Page / WhatsApp)
                </label>
                <input
                  type="url"
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                  placeholder="https://forms.gle/... atau https://..."
                  className="promo-modal-input"
                />
                <span className="promo-form-hint">
                  Pastikan diawali dengan <code>https://</code> agar konsumen dapat diarahkan langsung saat mengklik tombol.
                </span>
              </div>

              <div className="promo-form-group">
                <label className="promo-form-label">Teks Label Tombol Aksi</label>
                <input
                  type="text"
                  value={actionButtonLabel}
                  onChange={(e) => setActionButtonLabel(e.target.value)}
                  placeholder={category === 'event' ? 'Daftar Event Sekarang' : 'Klaim Promo Sekarang'}
                  className="promo-modal-input"
                />
              </div>

              {actionLinkActive && actionLink && (
                <div className="promo-link-live-preview">
                  <span className="preview-label">Live Preview Tombol di Halaman Web:</span>
                  <div className="preview-button-box">
                    <span className={`preview-btn-mockup ${category === 'event' ? 'mockup-event' : 'mockup-claim'}`}>
                      {category === 'event' ? <HiOutlineCalendar size={16} /> : <RiCoupon2Line size={16} />}
                      <span>{actionButtonLabel || (category === 'event' ? 'Ikuti Event' : 'Klaim Promo')}</span>
                    </span>
                    <span className="preview-note">→ Mengarah ke: {actionLink}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bullets List (Poin Keunggulan) */}
          <div className="promo-form-group">
            <div className="promo-multi-header">
              <label className="promo-form-label">Poin Keunggulan Penawaran ({bullets.length})</label>
              <button type="button" className="promo-btn-add-line" onClick={handleAddBullet}>
                <HiOutlinePlus size={14} /> Tambah Poin
              </button>
            </div>
            <div className="promo-multi-inputs-list">
              {bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="promo-multi-input-row">
                  <HiOutlineCheck size={16} className="bullet-check" />
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleBulletChange(bIdx, e.target.value)}
                    placeholder={`Poin keunggulan #${bIdx + 1}`}
                    className="promo-modal-input"
                  />
                  {bullets.length > 1 && (
                    <button
                      type="button"
                      className="promo-btn-del-line"
                      onClick={() => handleRemoveBullet(bIdx)}
                      title="Hapus baris ini"
                    >
                      <HiOutlineXMark size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terms List (Syarat & Ketentuan) */}
          <div className="promo-form-group">
            <div className="promo-multi-header">
              <label className="promo-form-label">Syarat &amp; Ketentuan ({terms.length})</label>
              <button type="button" className="promo-btn-add-line" onClick={handleAddTerm}>
                <HiOutlinePlus size={14} /> Tambah Syarat
              </button>
            </div>
            <div className="promo-multi-inputs-list">
              {terms.map((term, tIdx) => (
                <div key={tIdx} className="promo-multi-input-row">
                  <span className="term-num">{tIdx + 1}.</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(tIdx, e.target.value)}
                    placeholder={`Syarat & Ketentuan #${tIdx + 1}`}
                    className="promo-modal-input"
                  />
                  {terms.length > 1 && (
                    <button
                      type="button"
                      className="promo-btn-del-line"
                      onClick={() => handleRemoveTerm(tIdx)}
                      title="Hapus baris ini"
                    >
                      <HiOutlineXMark size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="promo-modal-footer">
            <button type="button" className="promo-btn-modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="promo-btn-modal-submit">
              <HiOutlineCheck size={18} />
              <span>{mode === 'edit' ? 'Perbarui Promo' : 'Tambahkan Promo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
