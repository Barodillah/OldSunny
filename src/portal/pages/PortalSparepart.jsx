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
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineDocumentDuplicate,
  HiOutlineClipboardDocument,
  HiOutlineWrenchScrewdriver,
  HiOutlineFunnel
} from 'react-icons/hi2'
import { RiCarLine, RiShieldCheckLine, RiPriceTag3Line } from 'react-icons/ri'
import './PortalSparepart.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Helper format IDR currency
const formatIDR = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

// Preset common categories for quick selection
const PRESET_CATEGORIES = [
  'Timing & Belt',
  'Filter',
  'Oli & Pelumas',
  'Cairan & Chemical',
  'Rem & Brake',
  'Seal & Gasket',
  'Pengapian',
  'Suspensi & Kaki-kaki',
  'Kelistrikan & Aki'
]

// Preset common Mitsubishi models
const PRESET_MODELS = [
  'Xpander',
  'All New Pajero Sport',
  'Pajero Sport CR45',
  'Destinator',
  'Xforce',
  'Xpander Cross',
  'All New Triton',
  'Colt L300',
  'Canter Euro 4'
]

export default function PortalSparepart() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Knowledge payload state
  const [metadata, setMetadata] = useState({
    judul: 'Master Data Spare Part Fast Moving Mitsubishi',
    keterangan: 'Data spare part yang digunakan dalam perawatan berkala. Semua part berstatus fast moving / selalu tersedia (always available) di bengkel resmi Mitsubishi MMKSI.',
    catatan_penting: [
      'Untuk kendaraan DESTINATOR, XFORCE, dan XPANDER CROSS itu part sama dengan Xpander',
      'Untuk TRITON sama dengan Pajero Sport',
      'Harga belum termasuk pajak PPN (11%)',
      'Harga belum termasuk jasa servis',
      'Harga dapat berubah sewaktu-waktu tanpa pemberitahuan'
    ],
    mata_uang: 'IDR (Rupiah)',
    status_ketersediaan_default: 'always_available'
  })
  const [spareParts, setSpareParts] = useState([])
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [updatedBy, setUpdatedBy] = useState('')

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedModelFilter, setSelectedModelFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  // Modals state
  const [partModalConfig, setPartModalConfig] = useState(null) // { mode: 'add'|'edit', index?: number, part: { nomor_part, nama, harga_satuan, kategori, status, digunakan_pada } }
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState(null) // { index, part, onConfirm }
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [tempNotes, setTempNotes] = useState([])
  const [newNoteInput, setNewNoteInput] = useState('')

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

  // Fetch initial knowledge data from API
  const fetchSparepartKnowledge = useCallback(async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/sparepart`, {
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data sparepart`)

      const json = await res.json()
      if (json.success && json.data) {
        const payload = json.data
        if (payload.metadata) {
          setMetadata(payload.metadata)
        }
        setSpareParts(payload.spare_parts || [])
        setLastUpdatedAt(json.updated_at || '')
        setUpdatedBy(json.updated_by || 'System')
        setHasUnsavedChanges(false)
      } else {
        throw new Error(json.message || 'Payload data tidak valid.')
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
    fetchSparepartKnowledge()
  }, [fetchSparepartKnowledge])

  // Extract all unique categories and models from current spareParts
  const availableCategories = useMemo(() => {
    const set = new Set()
    spareParts.forEach((p) => {
      if (p.kategori) set.add(p.kategori.trim())
    })
    return Array.from(set).sort()
  }, [spareParts])

  const availableModels = useMemo(() => {
    const set = new Set()
    spareParts.forEach((p) => {
      if (Array.isArray(p.digunakan_pada)) {
        p.digunakan_pada.forEach((m) => {
          if (m) set.add(m.trim())
        })
      }
    })
    return Array.from(set).sort()
  }, [spareParts])

  // Statistics
  const stats = useMemo(() => {
    const total = spareParts.length
    const alwaysAvailable = spareParts.filter((p) => p.status === 'always_available').length
    const totalCategories = availableCategories.length
    const totalModels = availableModels.length
    return { total, alwaysAvailable, totalCategories, totalModels }
  }, [spareParts, availableCategories, availableModels])

  // Filtered spare parts list
  const filteredSpareParts = useMemo(() => {
    return spareParts.filter((part) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchPartNo = part.nomor_part?.toLowerCase().includes(q)
        const matchName = part.nama?.toLowerCase().includes(q)
        const matchCat = part.kategori?.toLowerCase().includes(q)
        const matchModel = part.digunakan_pada?.some((m) => m.toLowerCase().includes(q))
        if (!matchPartNo && !matchName && !matchCat && !matchModel) {
          return false
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (part.kategori !== selectedCategory) return false
      }

      // 3. Model Filter
      if (selectedModelFilter !== 'all') {
        if (!part.digunakan_pada?.includes(selectedModelFilter)) return false
      }

      // 4. Status Filter
      if (selectedStatusFilter !== 'all') {
        if (part.status !== selectedStatusFilter) return false
      }

      return true
    })
  }, [spareParts, searchQuery, selectedCategory, selectedModelFilter, selectedStatusFilter])

  // Save changes to API
  const handleSaveAll = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const fullPayload = {
        metadata: {
          ...metadata,
          total_unique_part: spareParts.length,
          last_sync: new Date().toISOString()
        },
        spare_parts: spareParts
      }

      const res = await fetch(`${API_BASE_URL}/knowledge/sparepart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          data: fullPayload,
          updated_by: 'Staff Portal Margahayu'
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan perubahan ke server.')
      }

      setHasUnsavedChanges(false)
      setLastUpdatedAt(json.updated_at || new Date().toISOString())
      setUpdatedBy('Staff Portal Margahayu')
      setFeedback({
        type: 'success',
        message: 'Master data sparepart berhasil disimpan! Data pengetahuan Asisten Sunny AI langsung tersinkron.'
      })
      showToast('Data sparepart berhasil disimpan dan disinkronkan ke Sunny AI!', 'success')
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

  // Reset to default from file
  const handleConfirmReset = async () => {
    setIsResetConfirmModalOpen(false)
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/sparepart/reset`, {
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

      const payload = json.data
      if (payload) {
        if (payload.metadata) setMetadata(payload.metadata)
        setSpareParts(payload.spare_parts || [])
      }
      setHasUnsavedChanges(false)
      setFeedback({
        type: 'success',
        message: 'Master data sparepart berhasil dikembalikan ke pengaturan file default (knowledge/sparepart.json).'
      })
      showToast('Master data sparepart direset ke default!', 'info')
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

  // Delete part
  const handleDeletePart = (index, part) => {
    setDeleteConfirmConfig({
      index,
      part,
      title: 'Hapus Suku Cadang?',
      message: `Apakah Anda yakin ingin menghapus "${part.nama}" (Nomor Part: ${part.nomor_part}) dari master data sparepart?`,
      onConfirm: () => {
        const copy = [...spareParts]
        copy.splice(index, 1)
        setSpareParts(copy)
        setHasUnsavedChanges(true)
        setDeleteConfirmConfig(null)
        showToast(`Sparepart "${part.nomor_part}" berhasil dihapus`, 'info')
      }
    })
  }

  // Duplicate part
  const handleDuplicatePart = (index, part) => {
    const copy = [...spareParts]
    const duplicated = {
      ...part,
      nomor_part: `${part.nomor_part}-COPY`,
      nama: `${part.nama} (Salinan)`
    }
    copy.splice(index + 1, 0, duplicated)
    setSpareParts(copy)
    setHasUnsavedChanges(true)
    showToast(`Duplikat "${duplicated.nomor_part}" berhasil dibuat`, 'success')
  }

  // Save Add/Edit Modal
  const handleSavePartModal = (formData) => {
    const { mode, index, part } = formData
    const copy = [...spareParts]

    if (mode === 'edit' && typeof index === 'number') {
      copy[index] = part
      showToast(`Sparepart "${part.nomor_part}" berhasil diperbarui`, 'success')
    } else {
      copy.unshift(part)
      showToast(`Sparepart baru "${part.nomor_part}" berhasil ditambahkan!`, 'success')
    }

    setSpareParts(copy)
    setHasUnsavedChanges(true)
    setPartModalConfig(null)
  }

  // Copy Part Number to Clipboard
  const handleCopyPartNumber = (partNumber) => {
    navigator.clipboard.writeText(partNumber)
    showToast(`Nomor part "${partNumber}" disalin ke clipboard!`, 'info', 2000)
  }

  // Notes Modal Handlers
  const handleOpenNotesModal = () => {
    setTempNotes(metadata.catatan_penting ? [...metadata.catatan_penting] : [])
    setNewNoteInput('')
    setIsNotesModalOpen(true)
  }

  const handleSaveNotesModal = () => {
    setMetadata((prev) => ({
      ...prev,
      catatan_penting: tempNotes
    }))
    setHasUnsavedChanges(true)
    setIsNotesModalOpen(false)
    showToast('Pedoman & catatan kompatibilitas diperbarui!', 'success')
  }

  if (loading) {
    return (
      <div className="portal-sp-page">
        <div className="sp-loading-state">
          <HiOutlineArrowPath size={36} className="spin-slow" />
          <p>Memuat Master Data Sparepart MMKSI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-sp-page">
      {/* Toast Alert Notifications */}
      {toasts.length > 0 && (
        <div className="sp-toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`sp-toast-item sp-toast-${toast.type}`}>
              <div className="sp-toast-icon">
                {toast.type === 'success' && <HiOutlineCheck size={18} />}
                {toast.type === 'error' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'warning' && <HiOutlineExclamationTriangle size={18} />}
                {toast.type === 'info' && <HiOutlineInformationCircle size={18} />}
              </div>
              <div className="sp-toast-message">{toast.message}</div>
              <button
                type="button"
                className="sp-toast-close"
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
      <div className="sp-header-row">
        <div className="sp-title-group">
          <div className="sp-title-badge">
            <HiOutlineWrenchScrewdriver size={16} />
            <span>Public Knowledge — Sparepart Resmi</span>
          </div>
          <h1>Manajemen Suku Cadang Mitsubishi Motors</h1>
          <p>
            Kelola data resmi suku cadang fast moving Mitsubishi Motors MMKSI, nomor part, harga satuan, dan kompatibilitas model.
            Perubahan langsung tersinkronisasi ke basis pengetahuan <strong>Sunny AI</strong> dan bengkel resmi.
          </p>
        </div>

        <div className="sp-header-actions">
          <button
            type="button"
            className="sp-btn-notes"
            onClick={handleOpenNotesModal}
            title="Lihat atau edit catatan kompatibilitas & aturan harga"
          >
            <HiOutlineInformationCircle size={16} />
            <span>Pedoman Kompatibilitas ({metadata.catatan_penting?.length || 0})</span>
          </button>

          <button
            type="button"
            className="sp-btn-reset"
            onClick={() => setIsResetConfirmModalOpen(true)}
            disabled={saving}
            title="Kembalikan semua data suku cadang ke file default (knowledge/sparepart.json)"
          >
            <HiOutlineArrowPath size={16} className={saving ? 'spin-slow' : ''} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            className="sp-btn-save"
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
                <span>Simpan Perubahan Sparepart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning Alert Banner */}
      {hasUnsavedChanges && (
        <div className="sp-unsaved-banner">
          <div className="sp-unsaved-content">
            <HiOutlineExclamationTriangle size={22} className="sp-unsaved-icon" />
            <div>
              <strong>Ada perubahan yang belum disimpan!</strong>
              <p>
                Perubahan pada data sparepart hanya ada di sesi lokal ini. Klik tombol merah "Simpan Perubahan Sparepart" di atas untuk memperbarui basis data dan knowledge Sunny AI.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sp-btn-quick-save"
            onClick={handleSaveAll}
            disabled={saving}
          >
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`sp-feedback-banner sp-feedback-${feedback.type}`}>
          <div className="sp-feedback-icon">
            {feedback.type === 'success' ? <HiOutlineCheck size={20} /> : <HiOutlineExclamationTriangle size={20} />}
          </div>
          <div className="sp-feedback-text">{feedback.message}</div>
          <button type="button" className="sp-feedback-close" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Statistics Overview Cards */}
      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <div className="sp-stat-icon red">
            <HiOutlineCube size={24} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-label">Total Suku Cadang</span>
            <strong className="sp-stat-value">{stats.total} Part</strong>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon emerald">
            <HiOutlineCheckBadge size={24} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-label">Status Fast Moving</span>
            <strong className="sp-stat-value">{stats.alwaysAvailable} Always Ready</strong>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon blue">
            <HiOutlineTag size={24} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-label">Kategori Komponen</span>
            <strong className="sp-stat-value">{stats.totalCategories} Kategori</strong>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon purple">
            <RiCarLine size={24} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-label">Model Tercover</span>
            <strong className="sp-stat-value">{stats.totalModels} Seri Mobil</strong>
          </div>
        </div>
      </div>

      {/* Highlights / Compatibility Info Ribbon */}
      <div className="sp-info-ribbon">
        <div className="sp-ribbon-left">
          <HiOutlineInformationCircle size={20} className="sp-ribbon-icon" />
          <div className="sp-ribbon-text">
            <strong>Pedoman Kompatibilitas MMKSI:</strong>
            <span>
              DESTINATOR, XFORCE, dan XPANDER CROSS menggunakan part yang sama dengan <strong>Xpander</strong>.
              Sedangkan TRITON menggunakan part yang sama dengan <strong>Pajero Sport</strong>.
            </span>
          </div>
        </div>
        <button
          type="button"
          className="sp-btn-ribbon-edit"
          onClick={handleOpenNotesModal}
        >
          Kelola Aturan ({metadata.catatan_penting?.length || 0})
        </button>
      </div>

      {/* Main Content Card: Filter, Search, and Data Table */}
      <div className="sp-content-card">
        {/* Filter & Search Header */}
        <div className="sp-toolbar">
          <div className="sp-search-box">
            <HiOutlineMagnifyingGlass size={18} className="sp-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor part, nama komponen, kategori, atau model..."
              className="sp-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="sp-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <HiOutlineXMark size={15} />
              </button>
            )}
          </div>

          <div className="sp-filter-controls">
            {/* Filter Model Dropdown */}
            <div className="sp-filter-select-wrap">
              <label>Model:</label>
              <select
                value={selectedModelFilter}
                onChange={(e) => setSelectedModelFilter(e.target.value)}
                className="sp-select"
              >
                <option value="all">Semua Model ({stats.totalModels})</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status Dropdown */}
            <div className="sp-filter-select-wrap">
              <label>Status:</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="sp-select"
              >
                <option value="all">Semua Status</option>
                <option value="always_available">Selalu Tersedia (Fast Moving)</option>
                <option value="indent">Indent / Khusus</option>
                <option value="available">Stok Terbatas</option>
              </select>
            </div>

            {/* Add Part Button */}
            <button
              type="button"
              className="sp-btn-add-primary"
              onClick={() =>
                setPartModalConfig({
                  mode: 'add',
                  part: {
                    nomor_part: '',
                    nama: '',
                    harga_satuan: 0,
                    kategori: selectedCategory !== 'all' ? selectedCategory : 'Filter',
                    status: 'always_available',
                    digunakan_pada: ['Xpander']
                  }
                })
              }
            >
              <HiOutlinePlus size={18} />
              <span>Tambah Sparepart</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="sp-category-pills-bar">
          <button
            type="button"
            className={`sp-category-pill ${selectedCategory === 'all' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Semua ({spareParts.length})
          </button>
          {availableCategories.map((cat) => {
            const count = spareParts.filter((p) => p.kategori === cat).length
            return (
              <button
                key={cat}
                type="button"
                className={`sp-category-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Active Filter Info & Table Header Info */}
        <div className="sp-table-info-row">
          <div className="sp-table-count">
            Menampilkan <strong>{filteredSpareParts.length}</strong> dari {spareParts.length} suku cadang
            {(selectedCategory !== 'all' || selectedModelFilter !== 'all' || selectedStatusFilter !== 'all' || searchQuery) && (
              <span className="sp-filter-active-tag">
                (Filter Aktif)
                <button
                  type="button"
                  className="sp-btn-clear-filters"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedModelFilter('all')
                    setSelectedStatusFilter('all')
                    setSearchQuery('')
                  }}
                >
                  Reset Filter
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Spareparts Data Table */}
        {filteredSpareParts.length === 0 ? (
          <div className="sp-empty-table">
            <HiOutlineWrenchScrewdriver size={40} className="sp-empty-icon" />
            <h3>Tidak ada suku cadang yang cocok</h3>
            <p>Cobalah mengatur kata kunci pencarian atau reset filter kategori.</p>
            <button
              type="button"
              className="sp-btn-empty-reset"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedModelFilter('all')
                setSelectedStatusFilter('all')
                setSearchQuery('')
              }}
            >
              Tampilkan Semua Suku Cadang
            </button>
          </div>
        ) : (
          <div className="sp-table-container">
            <table className="sp-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th style={{ width: '160px' }}>Nomor Part</th>
                  <th>Nama Suku Cadang</th>
                  <th style={{ width: '150px' }}>Kategori</th>
                  <th>Kompatibilitas Model</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Harga Satuan</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpareParts.map((part, index) => {
                  const originalIndex = spareParts.indexOf(part)
                  const isAlwaysAvailable = part.status === 'always_available'

                  return (
                    <tr key={`${part.nomor_part}-${index}`} className="sp-table-row">
                      <td className="sp-td-num">{index + 1}</td>
                      <td className="sp-td-partno">
                        <div className="sp-partno-badge-wrap">
                          <span className="sp-partno-code">{part.nomor_part}</span>
                          <button
                            type="button"
                            className="sp-btn-copy-part"
                            onClick={() => handleCopyPartNumber(part.nomor_part)}
                            title="Salin Nomor Part"
                          >
                            <HiOutlineClipboardDocument size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="sp-td-name">
                        <strong>{part.nama}</strong>
                      </td>
                      <td className="sp-td-cat">
                        <span className={`sp-cat-chip cat-${part.kategori?.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'general'}`}>
                          {part.kategori}
                        </span>
                      </td>
                      <td className="sp-td-models">
                        <div className="sp-models-wrap">
                          {Array.isArray(part.digunakan_pada) && part.digunakan_pada.length > 0 ? (
                            part.digunakan_pada.map((model, mIdx) => (
                              <span key={mIdx} className="sp-model-chip">
                                {model}
                              </span>
                            ))
                          ) : (
                            <span className="sp-no-model">-</span>
                          )}
                        </div>
                      </td>
                      <td className="sp-td-status">
                        <span className={`sp-status-chip ${isAlwaysAvailable ? 'always-ready' : 'indent'}`}>
                          <span className="sp-status-dot" />
                          {isAlwaysAvailable ? 'Always Ready' : (part.status || 'Tersedia')}
                        </span>
                      </td>
                      <td className="sp-td-price">
                        <strong className="sp-price-text">{formatIDR(part.harga_satuan)}</strong>
                        <span className="sp-tax-note">Ekskl. PPN 11%</span>
                      </td>
                      <td className="sp-td-actions">
                        <div className="sp-action-buttons">
                          <button
                            type="button"
                            className="sp-btn-action edit"
                            onClick={() =>
                              setPartModalConfig({
                                mode: 'edit',
                                index: originalIndex,
                                part: { ...part }
                              })
                            }
                            title="Edit Komponen"
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>
                          <button
                            type="button"
                            className="sp-btn-action duplicate"
                            onClick={() => handleDuplicatePart(originalIndex, part)}
                            title="Duplikasi Part"
                          >
                            <HiOutlineDocumentDuplicate size={16} />
                          </button>
                          <button
                            type="button"
                            className="sp-btn-action delete"
                            onClick={() => handleDeletePart(originalIndex, part)}
                            title="Hapus Part"
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
          MODAL 1: FORM TAMBAH / EDIT SUKU CADANG (PROPER FORM)
          ========================================================================== */}
      {partModalConfig && (
        <PartFormModal
          config={partModalConfig}
          onClose={() => setPartModalConfig(null)}
          onSave={handleSavePartModal}
          availableCategories={availableCategories}
          availableModels={availableModels}
        />
      )}

      {/* ==========================================================================
          MODAL 2: KONFIRMASI HAPUS SUKU CADANG (PROPER MODAL DIALOG)
          ========================================================================== */}
      {deleteConfirmConfig && (
        <div className="sp-modal-overlay" onClick={() => setDeleteConfirmConfig(null)}>
          <div className="sp-modal-card sp-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-delete-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="sp-delete-modal-title">{deleteConfirmConfig.title}</h3>
            <p className="sp-delete-modal-desc">{deleteConfirmConfig.message}</p>
            <div className="sp-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>
                Item ini akan dihapus dari data bengkel dan asisten Sunny AI setelah perubahan disimpan.
              </span>
            </div>
            <div className="sp-delete-modal-actions">
              <button
                type="button"
                className="sp-btn-delete-cancel"
                onClick={() => setDeleteConfirmConfig(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="sp-btn-delete-confirm"
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
          MODAL 3: KONFIRMASI RESET DEFAULT (PROPER MODAL DIALOG)
          ========================================================================== */}
      {isResetConfirmModalOpen && (
        <div className="sp-modal-overlay" onClick={() => setIsResetConfirmModalOpen(false)}>
          <div className="sp-modal-card sp-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-delete-icon-wrap warning-yellow">
              <HiOutlineArrowPath size={32} />
            </div>
            <h3 className="sp-delete-modal-title">Reset ke Data Default?</h3>
            <p className="sp-delete-modal-desc">
              Tindakan ini akan mengembalikan seluruh master data sparepart ke file bawaan awal repository (<strong>knowledge/sparepart.json</strong>).
            </p>
            <div className="sp-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>Semua penambahan suku cadang dan pembaruan harga yang belum tersimpan permanen akan digantikan data default.</span>
            </div>
            <div className="sp-delete-modal-actions">
              <button
                type="button"
                className="sp-btn-delete-cancel"
                onClick={() => setIsResetConfirmModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="sp-btn-reset-confirm"
                onClick={handleConfirmReset}
              >
                <HiOutlineArrowPath size={16} />
                <span>Ya, Reset Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL 4: KELOLA PEDOMAN KOMPATIBILITAS & CATATAN
          ========================================================================== */}
      {isNotesModalOpen && (
        <div className="sp-modal-overlay" onClick={() => setIsNotesModalOpen(false)}>
          <div className="sp-modal-card sp-notes-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <div className="sp-modal-title-wrap">
                <HiOutlineInformationCircle size={24} className="sp-modal-icon-header" />
                <div>
                  <h3 className="sp-modal-title">Pedoman & Catatan Kompatibilitas</h3>
                  <p className="sp-modal-subtitle">Aturan kecocokan suku cadang yang dibaca langsung oleh Sunny AI</p>
                </div>
              </div>
              <button
                type="button"
                className="sp-modal-close-btn"
                onClick={() => setIsNotesModalOpen(false)}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div className="sp-notes-list">
                {tempNotes.map((note, idx) => (
                  <div key={idx} className="sp-note-item-row">
                    <span className="sp-note-bullet">•</span>
                    <span className="sp-note-text">{note}</span>
                    <button
                      type="button"
                      className="sp-btn-remove-note"
                      onClick={() => setTempNotes(tempNotes.filter((_, i) => i !== idx))}
                      title="Hapus catatan ini"
                    >
                      <HiOutlineXMark size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="sp-add-note-row">
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (newNoteInput.trim()) {
                        setTempNotes([...tempNotes, newNoteInput.trim()])
                        setNewNoteInput('')
                      }
                    }
                  }}
                  placeholder="Ketik catatan / aturan kecocokan baru..."
                  className="sp-modal-input"
                />
                <button
                  type="button"
                  className="sp-btn-add-note"
                  onClick={() => {
                    if (newNoteInput.trim()) {
                      setTempNotes([...tempNotes, newNoteInput.trim()])
                      setNewNoteInput('')
                    }
                  }}
                >
                  <HiOutlinePlus size={16} />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            <div className="sp-modal-footer">
              <button
                type="button"
                className="sp-btn-modal-cancel"
                onClick={() => setIsNotesModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="sp-btn-modal-submit"
                onClick={handleSaveNotesModal}
              >
                <HiOutlineCheck size={18} />
                <span>Simpan Pedoman</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Subcomponent: Form Tambah / Edit Sparepart
function PartFormModal({ config, onClose, onSave, availableCategories, availableModels }) {
  const { mode, index, part } = config

  const [partNo, setPartNo] = useState(part?.nomor_part || '')
  const [name, setName] = useState(part?.nama || '')
  const [price, setPrice] = useState(part?.harga_satuan || 0)
  const [category, setCategory] = useState(part?.kategori || 'Filter')
  const [customCategory, setCustomCategory] = useState('')
  const [status, setStatus] = useState(part?.status || 'always_available')
  const [models, setModels] = useState(Array.isArray(part?.digunakan_pada) ? [...part.digunakan_pada] : ['Xpander'])
  const [customModelInput, setCustomModelInput] = useState('')

  // Toggle model selection
  const handleToggleModel = (m) => {
    if (models.includes(m)) {
      setModels(models.filter((item) => item !== m))
    } else {
      setModels([...models, m])
    }
  }

  // Add custom model
  const handleAddCustomModel = () => {
    const trimmed = customModelInput.trim()
    if (!trimmed) return
    if (!models.includes(trimmed)) {
      setModels([...models, trimmed])
    }
    setCustomModelInput('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!partNo.trim() || !name.trim()) return

    const finalCategory = category === '__custom__' ? customCategory.trim() || 'Lain-lain' : category

    onSave({
      mode,
      index,
      part: {
        nomor_part: partNo.trim().toUpperCase(),
        nama: name.trim(),
        harga_satuan: Number(price) || 0,
        kategori: finalCategory,
        status: status || 'always_available',
        digunakan_pada: models.length > 0 ? models : ['Semua Model']
      }
    })
  }

  const allCategoryOptions = useMemo(() => {
    const merged = Array.from(new Set([...PRESET_CATEGORIES, ...availableCategories]))
    return merged.sort()
  }, [availableCategories])

  const allModelOptions = useMemo(() => {
    const merged = Array.from(new Set([...PRESET_MODELS, ...availableModels]))
    return merged.sort()
  }, [availableModels])

  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div className="sp-modal-card sp-form-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sp-modal-header">
          <div className="sp-modal-title-wrap">
            <HiOutlineWrenchScrewdriver size={24} className="sp-modal-icon-header" />
            <div>
              <h3 className="sp-modal-title">
                {mode === 'edit' ? 'Edit Suku Cadang' : 'Tambah Suku Cadang Baru'}
              </h3>
              <p className="sp-modal-subtitle">Master Data Mitsubishi Motors Genuine Parts</p>
            </div>
          </div>
          <button type="button" className="sp-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sp-modal-form">
          <div className="sp-form-row">
            <div className="sp-form-group">
              <label className="sp-form-label">
                Nomor Part OEM <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={partNo}
                onChange={(e) => setPartNo(e.target.value.toUpperCase())}
                placeholder="Contoh: 1145A019 atau MZ690115"
                className="sp-modal-input font-mono"
              />
              <span className="sp-form-hint">Nomor katalog resmi MMKSI (otomatis huruf besar).</span>
            </div>

            <div className="sp-form-group">
              <label className="sp-form-label">
                Harga Satuan: <strong>{formatIDR(price)}</strong> <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                  setPrice(val)
                }}
                placeholder="Contoh: 509000"
                className="sp-modal-input"
              />
              <span className="sp-form-hint">Harga belum termasuk PPN 11% & jasa servis.</span>
            </div>
          </div>

          <div className="sp-form-group">
            <label className="sp-form-label">
              Nama Suku Cadang <span className="req">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Belt Timing, Filter Oli, Busi Iridium, Kampas Rem Depan"
              className="sp-modal-input"
            />
          </div>

          <div className="sp-form-row">
            <div className="sp-form-group">
              <label className="sp-form-label">Kategori Komponen</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="sp-modal-select"
              >
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Kategori Kustom Baru...</option>
              </select>

              {category === '__custom__' && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ketik nama kategori baru..."
                  className="sp-modal-input mt-2"
                />
              )}
            </div>

            <div className="sp-form-group">
              <label className="sp-form-label">Status Ketersediaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="sp-modal-select"
              >
                <option value="always_available">Selalu Tersedia (Fast Moving Ready)</option>
                <option value="indent">Pemesanan Khusus (Indent MMKSI)</option>
                <option value="available">Stok Terbatas / Menyesuaikan</option>
              </select>
            </div>
          </div>

          <div className="sp-form-divider">
            <span>Model Mobil yang Menggunakan ({models.length} Terpilih)</span>
          </div>

          <div className="sp-model-selector-wrap">
            <div className="sp-model-chips-container">
              {allModelOptions.map((m) => {
                const isSelected = models.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    className={`sp-model-toggle-chip ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleToggleModel(m)}
                  >
                    <span className="chip-indicator">{isSelected ? '✓' : '+'}</span>
                    <span>{m}</span>
                  </button>
                )
              })}
            </div>

            <div className="sp-add-custom-model-row">
              <input
                type="text"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomModel()
                  }
                }}
                placeholder="Tambah model mobil lain..."
                className="sp-modal-input-compact"
              />
              <button
                type="button"
                className="sp-btn-add-model-chip"
                onClick={handleAddCustomModel}
              >
                <HiOutlinePlus size={15} />
                <span>Tambah Model</span>
              </button>
            </div>
          </div>

          <div className="sp-modal-footer">
            <button type="button" className="sp-btn-modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="sp-btn-modal-submit">
              <HiOutlineCheck size={18} />
              <span>{mode === 'edit' ? 'Perbarui Suku Cadang' : 'Tambahkan Suku Cadang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
