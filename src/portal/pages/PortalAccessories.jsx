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
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlinePhoto
} from 'react-icons/hi2'
import { RiCarLine, RiShoppingBag3Line, RiShieldCheckLine } from 'react-icons/ri'
import './PortalAccessories.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format IDR
const formatIDR = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

// Default Vehicle Display Meta
const DEFAULT_VEHICLE_META = {
  Destinator: { name: 'Destinator', category: 'Premium MPV' },
  Xpander: { name: 'New Xpander', category: 'Family MPV' },
  Xpander_Cross: { name: 'New Xpander Cross', category: 'Crossover MPV' },
  Pajero_Sport: { name: 'New Pajero Sport', category: 'Prestige SUV 4x4' },
  Xforce: { name: 'New XFORCE', category: 'Dynamic Compact SUV' }
}

export default function PortalAccessories() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Full Knowledge Payload: { mitsubishi_accessories: { Destinator: { exterior: [], interior: [], paket_aksesoris: [] }, ... } }
  const [accessoriesMap, setAccessoriesMap] = useState({})
  const [metaInfo, setMetaInfo] = useState({})
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [updatedBy, setUpdatedBy] = useState('')

  // Selected Active Vehicle
  const [selectedVehicleKey, setSelectedVehicleKey] = useState('Destinator')

  // Sub-category filter: 'all' | 'paket_aksesoris' | 'exterior' | 'interior'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast notifications
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

  // Model Name Editing State
  const [isEditingModelName, setIsEditingModelName] = useState(false)
  const [tempModelName, setTempModelName] = useState('')

  // Modals State
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false)
  const [newModelNameInput, setNewModelNameInput] = useState('')

  const [itemModalConfig, setItemModalConfig] = useState(null) // { mode: 'add'|'edit', category: 'exterior'|'interior', index?: number, item: { item, price, img } }
  const [bundleModalConfig, setBundleModalConfig] = useState(null) // { mode: 'add'|'edit', index?: number, bundle: { item, price, img, include: [] } }

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState(null) // { type: 'model'|'bundle'|'single', title, message, onConfirm }
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false)

  // Fetch initial knowledge data
  const fetchAccessoriesKnowledge = useCallback(async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/accessories`, {
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data knowledge aksesoris`)

      const json = await res.json()
      if (json.success && json.data) {
        const payload = json.data
        const acc = payload.mitsubishi_accessories || payload

        setAccessoriesMap(acc)
        setMetaInfo(json.metadata || {})
        setLastUpdatedAt(json.updated_at || '')
        setUpdatedBy(json.updated_by || 'System')

        const keys = Object.keys(acc)
        if (keys.length > 0 && !keys.includes(selectedVehicleKey)) {
          setSelectedVehicleKey(keys[0])
        }
        setHasUnsavedChanges(false)
      } else {
        throw new Error(json.message || 'Payload data tidak valid.')
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Terjadi kesalahan saat memuat data: ${err.message}. Pastikan backend API aktif.`
      })
    } finally {
      setLoading(false)
    }
  }, [selectedVehicleKey])

  useEffect(() => {
    fetchAccessoriesKnowledge()
  }, [])

  // Model keys
  const vehicleKeys = useMemo(() => Object.keys(accessoriesMap), [accessoriesMap])

  // Current vehicle data
  const currentVehicleData = useMemo(() => {
    return (
      accessoriesMap[selectedVehicleKey] || {
        exterior: [],
        interior: [],
        paket_aksesoris: []
      }
    )
  }, [accessoriesMap, selectedVehicleKey])

  // Count items for badges
  const modelStats = useMemo(() => {
    const stats = {}
    vehicleKeys.forEach((key) => {
      const v = accessoriesMap[key] || {}
      const bCount = v.paket_aksesoris?.length || 0
      const eCount = v.exterior?.length || 0
      const iCount = v.interior?.length || 0
      stats[key] = {
        total: bCount + eCount + iCount,
        bundle: bCount,
        exterior: eCount,
        interior: iCount
      }
    })
    return stats
  }, [accessoriesMap, vehicleKeys])

  // Filtered Items for active vehicle
  const filteredBundles = useMemo(() => {
    const raw = currentVehicleData.paket_aksesoris || []
    if (!searchQuery.trim()) return raw
    const q = searchQuery.toLowerCase()
    return raw.filter(
      (b) =>
        b.item?.toLowerCase().includes(q) ||
        (b.include && b.include.some((inc) => inc.toLowerCase().includes(q)))
    )
  }, [currentVehicleData, searchQuery])

  const filteredExterior = useMemo(() => {
    const raw = currentVehicleData.exterior || []
    if (!searchQuery.trim()) return raw
    const q = searchQuery.toLowerCase()
    return raw.filter((item) => item.item?.toLowerCase().includes(q))
  }, [currentVehicleData, searchQuery])

  const filteredInterior = useMemo(() => {
    const raw = currentVehicleData.interior || []
    if (!searchQuery.trim()) return raw
    const q = searchQuery.toLowerCase()
    return raw.filter((item) => item.item?.toLowerCase().includes(q))
  }, [currentVehicleData, searchQuery])

  // Save changes to API
  const handleSaveAll = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const fullPayload = {
        mitsubishi_accessories: accessoriesMap,
        meta: {
          brand: 'Mitsubishi Motors',
          last_sync: new Date().toISOString()
        }
      }

      const res = await fetch(`${API_BASE_URL}/knowledge/accessories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          data: fullPayload,
          updated_by: 'Admin Portal Margahayu'
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan perubahan ke server.')
      }

      setHasUnsavedChanges(false)
      setLastUpdatedAt(json.updated_at || new Date().toISOString())
      setUpdatedBy('Admin Portal Margahayu')
      setFeedback({
        type: 'success',
        message: 'Katalog aksesoris berhasil disimpan! Data website publik & Asisten Sunny AI langsung tersinkron.'
      })
      showToast('Data aksesoris berhasil disimpan dan disinkronkan!', 'success')
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

  // Reset to default
  const handleConfirmReset = async () => {
    setIsResetConfirmModalOpen(false)
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/accessories/reset`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal mereset data default.')
      }

      const acc = json.data?.mitsubishi_accessories || json.data
      setAccessoriesMap(acc || {})
      setHasUnsavedChanges(false)
      setFeedback({
        type: 'success',
        message: 'Katalog aksesoris berhasil dikembalikan ke pengaturan file default bawaan dealer.'
      })
      showToast('Katalog aksesoris direset ke data awal!', 'info')
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Gagal mereset: ${err.message}`
      })
      showToast(`Gagal mereset: ${err.message}`, 'error', 4500)
    } finally {
      setSaving(false)
    }
  }

  // Model Name Edit
  const handleStartEditModelName = () => {
    setTempModelName(selectedVehicleKey.replace(/_/g, ' '))
    setIsEditingModelName(true)
  }

  const handleSaveModelName = () => {
    const trimmed = tempModelName.trim()
    if (!trimmed) {
      setIsEditingModelName(false)
      return
    }

    const newKey = trimmed.replace(/\s+/g, '_')
    if (newKey === selectedVehicleKey) {
      setIsEditingModelName(false)
      return
    }

    if (accessoriesMap[newKey]) {
      showToast(`Model dengan nama "${trimmed}" sudah ada!`, 'warning')
      return
    }

    setHasUnsavedChanges(true)
    setAccessoriesMap((prev) => {
      const next = {}
      for (const [k, v] of Object.entries(prev)) {
        if (k === selectedVehicleKey) {
          next[newKey] = v
        } else {
          next[k] = v
        }
      }
      return next
    })
    setSelectedVehicleKey(newKey)
    setIsEditingModelName(false)
    showToast(`Nama model diperbarui menjadi "${trimmed}"`, 'success')
  }

  // Add Model
  const handleCreateNewModel = (e) => {
    e.preventDefault()
    const trimmed = newModelNameInput.trim()
    if (!trimmed) return

    const key = trimmed.replace(/\s+/g, '_')
    if (accessoriesMap[key]) {
      showToast(`Model "${trimmed}" sudah ada dalam katalog!`, 'warning')
      return
    }

    setHasUnsavedChanges(true)
    setAccessoriesMap((prev) => ({
      ...prev,
      [key]: {
        paket_aksesoris: [],
        exterior: [],
        interior: []
      }
    }))
    setSelectedVehicleKey(key)
    setNewModelNameInput('')
    setIsAddModelModalOpen(false)
    showToast(`Model baru "${trimmed}" berhasil ditambahkan! Silakan isi paket atau aksesorisnya.`, 'success', 4500)
  }

  // Delete Model Modal Trigger
  const handleDeleteCurrentModel = () => {
    if (vehicleKeys.length <= 1) {
      showToast('Tidak dapat menghapus model terakhir!', 'warning')
      return
    }

    setDeleteConfirmConfig({
      type: 'model',
      title: 'Hapus Model Aksesoris?',
      message: `Apakah Anda yakin ingin menghapus model "${selectedVehicleKey.replace(/_/g, ' ')}" beserta seluruh paket bundle dan item aksesorisnya?`,
      warningText: 'Tindakan ini akan menghapus kategori model dari katalog aksesoris.',
      onConfirm: () => {
        const nextKey = vehicleKeys.find((k) => k !== selectedVehicleKey) || ''
        const deletedName = selectedVehicleKey.replace(/_/g, ' ')
        setHasUnsavedChanges(true)
        setAccessoriesMap((prev) => {
          const copy = { ...prev }
          delete copy[selectedVehicleKey]
          return copy
        })
        if (nextKey) setSelectedVehicleKey(nextKey)
        setDeleteConfirmConfig(null)
        showToast(`Model "${deletedName}" berhasil dihapus`, 'info')
      }
    })
  }

  // Reorder Items
  const handleMoveItem = (category, index, direction) => {
    const list = [...(currentVehicleData[category] || [])]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= list.length) return

    const [moved] = list.splice(index, 1)
    list.splice(targetIdx, 0, moved)

    setHasUnsavedChanges(true)
    setAccessoriesMap((prev) => ({
      ...prev,
      [selectedVehicleKey]: {
        ...prev[selectedVehicleKey],
        [category]: list
      }
    }))
    showToast('Urutan item diperbarui', 'info', 2000)
  }

  // Delete Single Item Trigger
  const handleDeleteSingleItem = (category, index, itemName) => {
    setDeleteConfirmConfig({
      type: 'single',
      title: 'Hapus Aksesoris?',
      message: `Apakah Anda yakin ingin menghapus "${itemName}" dari kategori ${category === 'exterior' ? 'Eksterior' : 'Interior'}?`,
      warningText: 'Item ini tidak akan ditampilkan lagi di halaman web dan katalog Sunny AI.',
      onConfirm: () => {
        const list = [...(currentVehicleData[category] || [])]
        list.splice(index, 1)
        setHasUnsavedChanges(true)
        setAccessoriesMap((prev) => ({
          ...prev,
          [selectedVehicleKey]: {
            ...prev[selectedVehicleKey],
            [category]: list
          }
        }))
        setDeleteConfirmConfig(null)
        showToast(`Aksesoris "${itemName}" berhasil dihapus`, 'info')
      }
    })
  }

  // Delete Bundle Trigger
  const handleDeleteBundle = (index, bundleName) => {
    setDeleteConfirmConfig({
      type: 'bundle',
      title: 'Hapus Paket Bundle?',
      message: `Apakah Anda yakin ingin menghapus paket bundle "${bundleName}"?`,
      warningText: 'Paket bundle ini akan dihapus dari rekomendasi katalog dealer.',
      onConfirm: () => {
        const list = [...(currentVehicleData.paket_aksesoris || [])]
        list.splice(index, 1)
        setHasUnsavedChanges(true)
        setAccessoriesMap((prev) => ({
          ...prev,
          [selectedVehicleKey]: {
            ...prev[selectedVehicleKey],
            paket_aksesoris: list
          }
        }))
        setDeleteConfirmConfig(null)
        showToast(`Paket "${bundleName}" berhasil dihapus`, 'info')
      }
    })
  }

  // Save / Update Single Item
  const handleSaveItemModal = (formData) => {
    const { category, targetIndex, item, price, img } = formData
    const list = [...(currentVehicleData[category] || [])]

    if (itemModalConfig.mode === 'edit' && typeof targetIndex === 'number') {
      list[targetIndex] = { item, price, img }
      showToast(`Aksesoris "${item}" diperbarui`, 'success')
    } else {
      list.push({ item, price, img })
      showToast(`Aksesoris "${item}" berhasil ditambahkan!`, 'success')
    }

    setHasUnsavedChanges(true)
    setAccessoriesMap((prev) => ({
      ...prev,
      [selectedVehicleKey]: {
        ...prev[selectedVehicleKey],
        [category]: list
      }
    }))
    setItemModalConfig(null)
  }

  // Save / Update Bundle Modal
  const handleSaveBundleModal = (formData) => {
    const { targetIndex, item, price, img, include } = formData
    const list = [...(currentVehicleData.paket_aksesoris || [])]

    if (bundleModalConfig.mode === 'edit' && typeof targetIndex === 'number') {
      list[targetIndex] = { item, price, img, include }
      showToast(`Paket "${item}" diperbarui`, 'success')
    } else {
      list.push({ item, price, img, include })
      showToast(`Paket "${item}" berhasil ditambahkan!`, 'success')
    }

    setHasUnsavedChanges(true)
    setAccessoriesMap((prev) => ({
      ...prev,
      [selectedVehicleKey]: {
        ...prev[selectedVehicleKey],
        paket_aksesoris: list
      }
    }))
    setBundleModalConfig(null)
  }

  if (loading) {
    return (
      <div className="portal-acc-page">
        <div className="acc-loading-state">
          <HiOutlineArrowPath size={36} className="spin-slow" />
          <p>Memuat Katalog Aksesoris Resmi Mitsubishi...</p>
        </div>
      </div>
    )
  }

  const currentStats = modelStats[selectedVehicleKey] || { total: 0, bundle: 0, exterior: 0, interior: 0 }
  const displayModelName = selectedVehicleKey.replace(/_/g, ' ')

  return (
    <div className="portal-acc-page">
      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div className="acc-toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`acc-toast-item acc-toast-${toast.type}`}>
              <div className="acc-toast-icon">
                {toast.type === 'success' && <HiOutlineCheck size={18} />}
                {toast.type === 'error' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'warning' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'info' && <HiOutlineInformationCircle size={18} />}
              </div>
              <div className="acc-toast-message">{toast.message}</div>
              <button
                type="button"
                className="acc-toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup Notifikasi"
              >
                <HiOutlineXMark size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header Bar */}
      <div className="acc-header-row">
        <div className="acc-title-group">
          <div className="acc-title-badge">
            <RiShoppingBag3Line size={16} />
            <span>Public Knowledge — Aksesoris Resmi</span>
          </div>
          <h1>Manajemen Aksesoris Mitsubishi Motors</h1>
          <p>
            Kelola rincian paket bundle, item eksterior, dan interior resmi per model secara dinamis.
            Perubahan langsung aktif di halaman website <strong>/accessories</strong> dan disuntikkan ke basis pengetahuan <strong>Sunny AI</strong>.
          </p>
        </div>

        <div className="acc-header-actions">
          <a
            href="/accessories"
            target="_blank"
            rel="noopener noreferrer"
            className="acc-btn-preview"
            title="Buka halaman publik Aksesoris di tab baru"
          >
            <HiOutlineArrowTopRightOnSquare size={16} />
            <span>Lihat Halaman Publik</span>
          </a>

          <button
            type="button"
            className="acc-btn-reset"
            onClick={() => setIsResetConfirmModalOpen(true)}
            disabled={saving}
            title="Kembalikan semua data aksesoris ke file default bawaan dealer"
          >
            <HiOutlineArrowPath size={16} className={saving ? 'spin-slow' : ''} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            className="acc-btn-save"
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
                <span>Simpan Perubahan Aksesoris</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes & Feedback Alert */}
      {hasUnsavedChanges && (
        <div className="acc-unsaved-banner">
          <div className="acc-unsaved-content">
            <HiOutlineExclamationTriangle size={20} className="acc-unsaved-icon" />
            <div>
              <strong>Ada perubahan yang belum disimpan!</strong>
              <p>Perubahan yang Anda lakukan hanya ada di sesi lokal ini. Klik tombol merah "Simpan Perubahan Aksesoris" di atas untuk memperbarui website publik & Sunny AI.</p>
            </div>
          </div>
          <button type="button" className="acc-btn-quick-save" onClick={handleSaveAll} disabled={saving}>
            Simpan Sekarang
          </button>
        </div>
      )}

      {feedback && (
        <div className={`acc-feedback-banner acc-feedback-${feedback.type}`}>
          <div className="acc-feedback-icon">
            {feedback.type === 'success' ? <HiOutlineCheck size={20} /> : <HiOutlineExclamationTriangle size={20} />}
          </div>
          <div className="acc-feedback-text">{feedback.message}</div>
          <button type="button" className="acc-feedback-close" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Model Selector Bar */}
      <div className="acc-model-bar-card">
        <div className="acc-model-bar-header">
          <div className="acc-model-bar-title">
            <RiCarLine size={20} />
            <span>Pilih Model Kendaraan:</span>
          </div>

          <button
            type="button"
            className="acc-btn-add-model"
            onClick={() => setIsAddModelModalOpen(true)}
          >
            <HiOutlinePlus size={16} />
            <span>Tambah Model Baru</span>
          </button>
        </div>

        <div className="acc-model-pills">
          {vehicleKeys.map((key) => {
            const isSelected = key === selectedVehicleKey
            const stats = modelStats[key] || { total: 0 }
            const label = key.replace(/_/g, ' ')

            return (
              <button
                key={key}
                type="button"
                className={`acc-model-pill ${isSelected ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedVehicleKey(key)
                  setSearchQuery('')
                }}
              >
                <span className="pill-name">{label}</span>
                <span className="pill-count">{stats.total} Item</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Model Content Card */}
      <div className="acc-content-card">
        {/* Model Meta Subheader */}
        <div className="acc-model-meta-header">
          <div className="acc-meta-left">
            {isEditingModelName ? (
              <div className="acc-inline-edit-wrap">
                <input
                  type="text"
                  autoFocus
                  value={tempModelName}
                  onChange={(e) => setTempModelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveModelName()
                    if (e.key === 'Escape') setIsEditingModelName(false)
                  }}
                  className="acc-inline-edit-input"
                  placeholder="Nama model mobil..."
                />
                <button
                  type="button"
                  className="acc-inline-btn-save"
                  onClick={handleSaveModelName}
                  title="Simpan nama model"
                >
                  <HiOutlineCheck size={16} />
                </button>
                <button
                  type="button"
                  className="acc-inline-btn-cancel"
                  onClick={() => setIsEditingModelName(false)}
                  title="Batal"
                >
                  <HiOutlineXMark size={16} />
                </button>
              </div>
            ) : (
              <div className="acc-model-name-group">
                <h2 className="acc-current-model-title">{displayModelName}</h2>
                <button
                  type="button"
                  className="acc-btn-edit-model-name"
                  onClick={handleStartEditModelName}
                  title="Edit nama model ini"
                >
                  <HiOutlinePencilSquare size={16} />
                  <span>Ubah Nama</span>
                </button>
              </div>
            )}

            <div className="acc-model-stat-badges">
              <span className="acc-badge acc-badge-bundle">
                <HiOutlineCube size={14} />
                {currentStats.bundle} Paket Bundle
              </span>
              <span className="acc-badge acc-badge-ext">
                {currentStats.exterior} Eksterior
              </span>
              <span className="acc-badge acc-badge-int">
                {currentStats.interior} Interior
              </span>
              <span className="acc-badge acc-badge-total">
                Total: {currentStats.total} Komponen
              </span>
            </div>
          </div>

          <div className="acc-meta-right">
            <button
              type="button"
              className="acc-btn-delete-model"
              onClick={handleDeleteCurrentModel}
              title="Hapus model ini dari katalog aksesoris"
            >
              <HiOutlineTrash size={16} />
              <span>Hapus Model Ini</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="acc-filter-search-row">
          <div className="acc-filter-tabs">
            <button
              type="button"
              className={`acc-filter-tab ${categoryFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              Semua ({currentStats.total})
            </button>
            <button
              type="button"
              className={`acc-filter-tab ${categoryFilter === 'paket_aksesoris' ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter('paket_aksesoris')}
            >
              Paket Bundle ({currentStats.bundle})
            </button>
            <button
              type="button"
              className={`acc-filter-tab ${categoryFilter === 'exterior' ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter('exterior')}
            >
              Eksterior ({currentStats.exterior})
            </button>
            <button
              type="button"
              className={`acc-filter-tab ${categoryFilter === 'interior' ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter('interior')}
            >
              Interior ({currentStats.interior})
            </button>
          </div>

          <div className="acc-search-input-wrap">
            <HiOutlineMagnifyingGlass size={17} className="acc-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aksesoris..."
              className="acc-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="acc-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <HiOutlineXMark size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ====================================================================
            SECTION 1: PAKET BUNDLE AKSESORIS
            ==================================================================== */}
        {(categoryFilter === 'all' || categoryFilter === 'paket_aksesoris') && (
          <div className="acc-section-block">
            <div className="acc-section-header">
              <div className="acc-section-title-wrap">
                <span className="acc-section-tag bundle-tag">Paket Resmi</span>
                <h3>Paket Bundle Aksesoris ({filteredBundles.length})</h3>
                <span className="acc-section-hint">Paket komplit hemat dengan harga resmi paket dealer.</span>
              </div>

              <button
                type="button"
                className="acc-btn-add-item primary-red"
                onClick={() =>
                  setBundleModalConfig({
                    mode: 'add',
                    bundle: { item: '', price: 0, img: '', include: [] }
                  })
                }
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Paket Bundle</span>
              </button>
            </div>

            {filteredBundles.length === 0 ? (
              <div className="acc-empty-state">
                <HiOutlineCube size={32} />
                <p>Belum ada paket bundle untuk model ini.</p>
                <button
                  type="button"
                  className="acc-btn-empty-add"
                  onClick={() =>
                    setBundleModalConfig({
                      mode: 'add',
                      bundle: { item: '', price: 0, img: '', include: [] }
                    })
                  }
                >
                  <HiOutlinePlus size={14} /> Buat Paket Pertama
                </button>
              </div>
            ) : (
              <div className="acc-bundle-grid">
                {filteredBundles.map((pkg, idx) => {
                  const originalIdx = (currentVehicleData.paket_aksesoris || []).indexOf(pkg)
                  const isFirst = originalIdx === 0
                  const isLast = originalIdx === (currentVehicleData.paket_aksesoris || []).length - 1

                  return (
                    <div key={idx} className="acc-bundle-card">
                      <div className="acc-bundle-card-top">
                        <div className="acc-bundle-img-wrap">
                          {pkg.img ? (
                            <img
                              src={pkg.img}
                              alt={pkg.item}
                              className="acc-bundle-thumb"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextElementSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className="acc-img-placeholder"
                            style={{ display: pkg.img ? 'none' : 'flex' }}
                          >
                            <HiOutlinePhoto size={24} />
                          </div>
                        </div>

                        <div className="acc-bundle-info">
                          <h4 className="acc-bundle-name">{pkg.item}</h4>
                          <div className="acc-bundle-price">{formatIDR(pkg.price)}</div>
                          <span className="acc-bundle-inc-count">
                            Mendapatkan {pkg.include?.length || 0} aksesoris:
                          </span>
                        </div>
                      </div>

                      {/* Included items list */}
                      <div className="acc-bundle-includes">
                        {pkg.include && pkg.include.length > 0 ? (
                          <div className="acc-chips-list">
                            {pkg.include.map((incItem, iIdx) => (
                              <span key={iIdx} className="acc-include-chip">
                                <HiOutlineCheck size={12} className="chip-check" />
                                {incItem}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="acc-no-include">Belum ada rincian item bawaan.</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="acc-card-actions">
                        <div className="acc-order-controls">
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isFirst}
                            onClick={() => handleMoveItem('paket_aksesoris', originalIdx, 'up')}
                            title="Pindah ke Atas"
                          >
                            <HiOutlineChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isLast}
                            onClick={() => handleMoveItem('paket_aksesoris', originalIdx, 'down')}
                            title="Pindah ke Bawah"
                          >
                            <HiOutlineChevronDown size={16} />
                          </button>
                        </div>

                        <div className="acc-crud-controls">
                          <button
                            type="button"
                            className="acc-btn-card-edit"
                            onClick={() =>
                              setBundleModalConfig({
                                mode: 'edit',
                                index: originalIdx,
                                bundle: {
                                  item: pkg.item || '',
                                  price: pkg.price || 0,
                                  img: pkg.img || '',
                                  include: Array.isArray(pkg.include) ? [...pkg.include] : []
                                }
                              })
                            }
                            title="Edit Paket"
                          >
                            <HiOutlinePencilSquare size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="acc-btn-card-delete"
                            onClick={() => handleDeleteBundle(originalIdx, pkg.item)}
                            title="Hapus Paket"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SECTION 2: AKSESORIS EKSTERIOR
            ==================================================================== */}
        {(categoryFilter === 'all' || categoryFilter === 'exterior') && (
          <div className="acc-section-block">
            <div className="acc-section-header">
              <div className="acc-section-title-wrap">
                <span className="acc-section-tag ext-tag">Eksterior</span>
                <h3>Aksesoris Satuan Eksterior ({filteredExterior.length})</h3>
                <span className="acc-section-hint">Komponen styling bodi luar, emblem, spoiler, dan scuff plate.</span>
              </div>

              <button
                type="button"
                className="acc-btn-add-item"
                onClick={() =>
                  setItemModalConfig({
                    mode: 'add',
                    category: 'exterior',
                    item: { item: '', price: 0, img: '' }
                  })
                }
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Eksterior</span>
              </button>
            </div>

            {filteredExterior.length === 0 ? (
              <div className="acc-empty-state">
                <RiCarLine size={32} />
                <p>Belum ada aksesoris eksterior untuk model ini.</p>
                <button
                  type="button"
                  className="acc-btn-empty-add"
                  onClick={() =>
                    setItemModalConfig({
                      mode: 'add',
                      category: 'exterior',
                      item: { item: '', price: 0, img: '' }
                    })
                  }
                >
                  <HiOutlinePlus size={14} /> Tambah Item Eksterior
                </button>
              </div>
            ) : (
              <div className="acc-single-grid">
                {filteredExterior.map((item, idx) => {
                  const originalIdx = (currentVehicleData.exterior || []).indexOf(item)
                  const isFirst = originalIdx === 0
                  const isLast = originalIdx === (currentVehicleData.exterior || []).length - 1

                  return (
                    <div key={idx} className="acc-single-card">
                      <div className="acc-single-thumb-box">
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.item}
                            className="acc-single-thumb"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="acc-img-placeholder"
                          style={{ display: item.img ? 'none' : 'flex' }}
                        >
                          <HiOutlinePhoto size={22} />
                        </div>
                      </div>

                      <div className="acc-single-details">
                        <span className="acc-category-mini-badge">Eksterior</span>
                        <h4 className="acc-single-title">{item.item}</h4>
                        <div className="acc-single-price">{formatIDR(item.price)}</div>
                        <span className="acc-single-path" title={item.img || 'Belum ada gambar'}>
                          {item.img ? item.img.replace('/media/aksesoris/', '') : 'Tanpa foto'}
                        </span>
                      </div>

                      <div className="acc-card-actions">
                        <div className="acc-order-controls">
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isFirst}
                            onClick={() => handleMoveItem('exterior', originalIdx, 'up')}
                            title="Geser ke Atas"
                          >
                            <HiOutlineChevronUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isLast}
                            onClick={() => handleMoveItem('exterior', originalIdx, 'down')}
                            title="Geser ke Bawah"
                          >
                            <HiOutlineChevronDown size={15} />
                          </button>
                        </div>

                        <div className="acc-crud-controls">
                          <button
                            type="button"
                            className="acc-btn-card-edit"
                            onClick={() =>
                              setItemModalConfig({
                                mode: 'edit',
                                category: 'exterior',
                                index: originalIdx,
                                item: { ...item }
                              })
                            }
                            title="Edit Aksesoris"
                          >
                            <HiOutlinePencilSquare size={15} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="acc-btn-card-delete"
                            onClick={() => handleDeleteSingleItem('exterior', originalIdx, item.item)}
                            title="Hapus Aksesoris"
                          >
                            <HiOutlineTrash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SECTION 3: AKSESORIS INTERIOR
            ==================================================================== */}
        {(categoryFilter === 'all' || categoryFilter === 'interior') && (
          <div className="acc-section-block">
            <div className="acc-section-header">
              <div className="acc-section-title-wrap">
                <span className="acc-section-tag int-tag">Interior</span>
                <h3>Aksesoris Satuan Interior ({filteredInterior.length})</h3>
                <span className="acc-section-hint">Aksesoris kenyamanan kabin, dashcam, luggage tray, dan storage.</span>
              </div>

              <button
                type="button"
                className="acc-btn-add-item"
                onClick={() =>
                  setItemModalConfig({
                    mode: 'add',
                    category: 'interior',
                    item: { item: '', price: 0, img: '' }
                  })
                }
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Interior</span>
              </button>
            </div>

            {filteredInterior.length === 0 ? (
              <div className="acc-empty-state">
                <HiOutlineCube size={32} />
                <p>Belum ada aksesoris interior untuk model ini.</p>
                <button
                  type="button"
                  className="acc-btn-empty-add"
                  onClick={() =>
                    setItemModalConfig({
                      mode: 'add',
                      category: 'interior',
                      item: { item: '', price: 0, img: '' }
                    })
                  }
                >
                  <HiOutlinePlus size={14} /> Tambah Item Interior
                </button>
              </div>
            ) : (
              <div className="acc-single-grid">
                {filteredInterior.map((item, idx) => {
                  const originalIdx = (currentVehicleData.interior || []).indexOf(item)
                  const isFirst = originalIdx === 0
                  const isLast = originalIdx === (currentVehicleData.interior || []).length - 1

                  return (
                    <div key={idx} className="acc-single-card">
                      <div className="acc-single-thumb-box">
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.item}
                            className="acc-single-thumb"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="acc-img-placeholder"
                          style={{ display: item.img ? 'none' : 'flex' }}
                        >
                          <HiOutlinePhoto size={22} />
                        </div>
                      </div>

                      <div className="acc-single-details">
                        <span className="acc-category-mini-badge int-badge">Interior</span>
                        <h4 className="acc-single-title">{item.item}</h4>
                        <div className="acc-single-price">{formatIDR(item.price)}</div>
                        <span className="acc-single-path" title={item.img || 'Belum ada gambar'}>
                          {item.img ? item.img.replace('/media/aksesoris/', '') : 'Tanpa foto'}
                        </span>
                      </div>

                      <div className="acc-card-actions">
                        <div className="acc-order-controls">
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isFirst}
                            onClick={() => handleMoveItem('interior', originalIdx, 'up')}
                            title="Geser ke Atas"
                          >
                            <HiOutlineChevronUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="acc-btn-order"
                            disabled={isLast}
                            onClick={() => handleMoveItem('interior', originalIdx, 'down')}
                            title="Geser ke Bawah"
                          >
                            <HiOutlineChevronDown size={15} />
                          </button>
                        </div>

                        <div className="acc-crud-controls">
                          <button
                            type="button"
                            className="acc-btn-card-edit"
                            onClick={() =>
                              setItemModalConfig({
                                mode: 'edit',
                                category: 'interior',
                                index: originalIdx,
                                item: { ...item }
                              })
                            }
                            title="Edit Aksesoris"
                          >
                            <HiOutlinePencilSquare size={15} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="acc-btn-card-delete"
                            onClick={() => handleDeleteSingleItem('interior', originalIdx, item.item)}
                            title="Hapus Aksesoris"
                          >
                            <HiOutlineTrash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==========================================================================
          MODAL 1: TAMBAH MODEL BARU
          ========================================================================== */}
      {isAddModelModalOpen && (
        <div className="acc-modal-overlay" onClick={() => setIsAddModelModalOpen(false)}>
          <div className="acc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="acc-modal-header">
              <div className="acc-modal-title-wrap">
                <RiCarLine size={24} className="acc-modal-icon-header" />
                <div>
                  <h3 className="acc-modal-title">Tambah Model Mobil Baru</h3>
                  <p className="acc-modal-subtitle">Buat grup katalog aksesoris untuk model Mitsubishi baru</p>
                </div>
              </div>
              <button
                type="button"
                className="acc-modal-close-btn"
                onClick={() => setIsAddModelModalOpen(false)}
                aria-label="Tutup Modal"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewModel} className="acc-modal-form">
              <div className="acc-form-group">
                <label className="acc-form-label">
                  Nama Model Kendaraan <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newModelNameInput}
                  onChange={(e) => setNewModelNameInput(e.target.value)}
                  placeholder="Contoh: All New Triton atau Outlander PHEV"
                  className="acc-modal-input"
                />
                <span className="acc-form-hint">
                  Nama model akan digunakan sebagai tab utama dan terintegrasi pada prompt Sunny AI.
                </span>
              </div>

              <div className="acc-modal-footer">
                <button
                  type="button"
                  className="acc-btn-modal-cancel"
                  onClick={() => setIsAddModelModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="acc-btn-modal-submit">
                  <HiOutlinePlus size={18} />
                  <span>Buat Model Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL 2: TAMBAH / EDIT ITEM SATUAN (EKSTERIOR / INTERIOR)
          ========================================================================== */}
      {itemModalConfig && (
        <ItemModal
          config={itemModalConfig}
          onClose={() => setItemModalConfig(null)}
          onSave={handleSaveItemModal}
          selectedModelName={displayModelName}
        />
      )}

      {/* ==========================================================================
          MODAL 3: TAMBAH / EDIT PAKET BUNDLE
          ========================================================================== */}
      {bundleModalConfig && (
        <BundleModal
          config={bundleModalConfig}
          onClose={() => setBundleModalConfig(null)}
          onSave={handleSaveBundleModal}
          selectedModelName={displayModelName}
          existingSingleItems={[
            ...(currentVehicleData.exterior || []).map((i) => i.item),
            ...(currentVehicleData.interior || []).map((i) => i.item)
          ]}
        />
      )}

      {/* ==========================================================================
          MODAL 4: KONFIRMASI HAPUS (PROPER MODAL DIALOG)
          ========================================================================== */}
      {deleteConfirmConfig && (
        <div className="acc-modal-overlay" onClick={() => setDeleteConfirmConfig(null)}>
          <div className="acc-modal-card acc-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="acc-delete-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="acc-delete-modal-title">{deleteConfirmConfig.title}</h3>
            <p className="acc-delete-modal-desc">{deleteConfirmConfig.message}</p>
            {deleteConfirmConfig.warningText && (
              <div className="acc-delete-modal-warning-note">
                <HiOutlineExclamationTriangle size={18} />
                <span>{deleteConfirmConfig.warningText}</span>
              </div>
            )}
            <div className="acc-delete-modal-actions">
              <button
                type="button"
                className="acc-btn-delete-cancel"
                onClick={() => setDeleteConfirmConfig(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="acc-btn-delete-confirm"
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
          MODAL 5: KONFIRMASI RESET DEFAULT (PROPER MODAL DIALOG)
          ========================================================================== */}
      {isResetConfirmModalOpen && (
        <div className="acc-modal-overlay" onClick={() => setIsResetConfirmModalOpen(false)}>
          <div className="acc-modal-card acc-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="acc-delete-icon-wrap warning-yellow">
              <HiOutlineArrowPath size={32} />
            </div>
            <h3 className="acc-delete-modal-title">Reset ke Data Default?</h3>
            <p className="acc-delete-modal-desc">
              Tindakan ini akan mengembalikan seluruh katalog aksesoris ke file template awal bawaan repository (<strong>knowledge/aksesoris.json</strong>).
            </p>
            <div className="acc-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>Semua penambahan item, modifikasi harga, dan nama baru yang belum tersimpan permanen akan digantikan data default.</span>
            </div>
            <div className="acc-delete-modal-actions">
              <button
                type="button"
                className="acc-btn-delete-cancel"
                onClick={() => setIsResetConfirmModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="acc-btn-reset-confirm"
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

// Subcomponent: Form Modal Tambah / Edit Aksesoris Satuan
function ItemModal({ config, onClose, onSave, selectedModelName }) {
  const { mode, category: initialCategory, index, item: initialItem } = config
  const [category, setCategory] = useState(initialCategory || 'exterior')
  const [name, setName] = useState(initialItem?.item || '')
  const [price, setPrice] = useState(initialItem?.price || 0)
  const [img, setImg] = useState(initialItem?.img || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      category,
      targetIndex: index,
      item: name.trim(),
      price: Number(price) || 0,
      img: img.trim()
    })
  }

  return (
    <div className="acc-modal-overlay" onClick={onClose}>
      <div className="acc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="acc-modal-header">
          <div className="acc-modal-title-wrap">
            <HiOutlineTag size={24} className="acc-modal-icon-header" />
            <div>
              <h3 className="acc-modal-title">
                {mode === 'edit' ? 'Edit Aksesoris' : 'Tambah Aksesoris Baru'}
              </h3>
              <p className="acc-modal-subtitle">Model: {selectedModelName}</p>
            </div>
          </div>
          <button type="button" className="acc-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="acc-modal-form">
          <div className="acc-form-group">
            <label className="acc-form-label">Kategori Komponen</label>
            <div className="acc-category-radio-group">
              <label className={`acc-radio-chip ${category === 'exterior' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="itemCategory"
                  value="exterior"
                  checked={category === 'exterior'}
                  onChange={() => setCategory('exterior')}
                />
                <span>Aksesoris Eksterior</span>
              </label>
              <label className={`acc-radio-chip ${category === 'interior' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="itemCategory"
                  value="interior"
                  checked={category === 'interior'}
                  onChange={() => setCategory('interior')}
                />
                <span>Aksesoris Interior</span>
              </label>
            </div>
          </div>

          <div className="acc-form-group">
            <label className="acc-form-label">
              Nama Aksesoris <span className="req">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Engine Hood Emblem, Scuff Plate, Luggage Tray"
              className="acc-modal-input"
            />
          </div>

          <div className="acc-form-group">
            <label className="acc-form-label">
              Harga Satuan Resmi: <strong>{formatIDR(price)}</strong>
            </label>
            <input
              type="text"
              required
              value={price}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                setPrice(val)
              }}
              placeholder="Contoh: 1480000"
              className="acc-modal-input"
            />
            <span className="acc-form-hint">Masukkan angka nominal tanpa titik atau simbol Rp.</span>
          </div>

          <div className="acc-form-group">
            <label className="acc-form-label">URL / Lokasi Path Foto</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="/media/aksesoris/... atau https://..."
              className="acc-modal-input"
            />
            {img && (
              <div className="acc-modal-img-preview">
                <span>Preview Foto:</span>
                <img
                  src={img}
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="acc-modal-footer">
            <button type="button" className="acc-btn-modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="acc-btn-modal-submit">
              <HiOutlineCheck size={18} />
              <span>{mode === 'edit' ? 'Perbarui Aksesoris' : 'Tambahkan Aksesoris'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Subcomponent: Form Modal Tambah / Edit Paket Bundle Aksesoris
function BundleModal({ config, onClose, onSave, selectedModelName, existingSingleItems = [] }) {
  const { mode, index, bundle } = config
  const [name, setName] = useState(bundle?.item || '')
  const [price, setPrice] = useState(bundle?.price || 0)
  const [img, setImg] = useState(bundle?.img || '')
  const [includeList, setIncludeList] = useState(Array.isArray(bundle?.include) ? [...bundle.include] : [])
  const [newIncludeText, setNewIncludeText] = useState('')

  const handleAddIncludeItem = () => {
    const trimmed = newIncludeText.trim()
    if (!trimmed) return
    if (includeList.includes(trimmed)) return
    setIncludeList([...includeList, trimmed])
    setNewIncludeText('')
  }

  const handleRemoveIncludeItem = (idxToRemove) => {
    setIncludeList(includeList.filter((_, idx) => idx !== idxToRemove))
  }

  const handleAddFromExisting = (itemName) => {
    if (!itemName || includeList.includes(itemName)) return
    setIncludeList([...includeList, itemName])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      targetIndex: index,
      item: name.trim(),
      price: Number(price) || 0,
      img: img.trim(),
      include: includeList
    })
  }

  return (
    <div className="acc-modal-overlay" onClick={onClose}>
      <div className="acc-modal-card acc-bundle-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="acc-modal-header">
          <div className="acc-modal-title-wrap">
            <HiOutlineCube size={24} className="acc-modal-icon-header" />
            <div>
              <h3 className="acc-modal-title">
                {mode === 'edit' ? 'Edit Paket Bundle Aksesoris' : 'Tambah Paket Bundle Baru'}
              </h3>
              <p className="acc-modal-subtitle">Model: {selectedModelName}</p>
            </div>
          </div>
          <button type="button" className="acc-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="acc-modal-form">
          <div className="acc-form-row">
            <div className="acc-form-group">
              <label className="acc-form-label">
                Nama Paket Bundle <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aero Package, Platinum Plus Package"
                className="acc-modal-input"
              />
            </div>

            <div className="acc-form-group">
              <label className="acc-form-label">
                Harga Resmi Paket: <strong>{formatIDR(price)}</strong>
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                  setPrice(val)
                }}
                placeholder="Contoh: 9710000"
                className="acc-modal-input"
              />
            </div>
          </div>

          <div className="acc-form-group">
            <label className="acc-form-label">URL / Lokasi Path Foto Paket</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="/media/aksesoris/... atau https://..."
              className="acc-modal-input"
            />
            {img && (
              <div className="acc-modal-img-preview">
                <span>Preview Foto:</span>
                <img
                  src={img}
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="acc-form-divider">
            <span>Daftar Aksesoris yang Didapat Konsumen ({includeList.length})</span>
          </div>

          <div className="acc-bundle-include-builder">
            <div className="acc-include-chips-wrap">
              {includeList.length === 0 ? (
                <span className="acc-no-chips">Belum ada item ditambahkan ke paket ini.</span>
              ) : (
                includeList.map((item, idx) => (
                  <span key={idx} className="acc-removable-chip">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIncludeItem(idx)}
                      title="Hapus item ini dari paket"
                    >
                      <HiOutlineXMark size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="acc-add-chip-row">
              <input
                type="text"
                value={newIncludeText}
                onChange={(e) => setNewIncludeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddIncludeItem()
                  }
                }}
                placeholder="Ketik nama item lalu klik Tambah..."
                className="acc-chip-input"
              />
              <button
                type="button"
                className="acc-btn-add-chip"
                onClick={handleAddIncludeItem}
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Item</span>
              </button>
            </div>

            {existingSingleItems.length > 0 && (
              <div className="acc-quick-suggest">
                <span className="acc-suggest-label">Pilih cepat dari aksesoris yang tersedia:</span>
                <div className="acc-suggest-pills">
                  {existingSingleItems
                    .filter((item) => !includeList.includes(item))
                    .slice(0, 10)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="acc-btn-suggest-pill"
                        onClick={() => handleAddFromExisting(item)}
                      >
                        + {item}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="acc-modal-footer">
            <button type="button" className="acc-btn-modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="acc-btn-modal-submit">
              <HiOutlineCheck size={18} />
              <span>{mode === 'edit' ? 'Perbarui Paket Bundle' : 'Tambahkan Paket Bundle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
