import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  HiOutlineClipboardDocumentList,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXMark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineSparkles,
  HiOutlineUser
} from 'react-icons/hi2'
import { RiWhatsappLine } from 'react-icons/ri'
import './PortalLeads.css'
import './PortalChatHistory.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export const LEAD_TYPES = [
  { id: 'all', label: 'Semua Lead', color: '#475569', bg: '#f1f5f9' },
  { id: 'booking', label: 'Booking Servis', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'test_drive', label: 'Test Drive', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'prospect', label: 'Pemesanan Unit / SPK', color: '#059669', bg: '#d1fae5' },
  { id: 'emergency', label: 'Emergency SOS (SOR)', color: '#dc2626', bg: '#fee2e2' },
  { id: 'sparepart', label: 'Sparepart & Aksesoris', color: '#d97706', bg: '#fef3c7' },
  { id: 'complaint', label: 'Keluhan & Pertanyaan', color: '#e11d48', bg: '#ffe4e6' },
]

export const LEAD_STATUSES = [
  { id: 'all', label: 'Semua Status' },
  { id: 'new', label: 'Baru Masuk', badgeClass: 'status-new' },
  { id: 'contacted', label: 'Sudah Dihubungi', badgeClass: 'status-contacted' },
  { id: 'in_progress', label: 'Sedang Diproses', badgeClass: 'status-progress' },
  { id: 'completed', label: 'Selesai / Deal', badgeClass: 'status-completed' },
  { id: 'cancelled', label: 'Dibatalkan', badgeClass: 'status-cancelled' },
]

export default function PortalLeads() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'all'
  const initialStatus = searchParams.get('status') || 'all'
  const isFromAllLeads = !searchParams.get('type') || searchParams.get('type') === 'all'

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState(initialType)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [typeCounts, setTypeCounts] = useState({
    all: 0,
    booking: 0,
    test_drive: 0,
    prospect: 0,
    emergency: 0,
    sparepart: 0,
    complaint: 0
  })

  // Drawer detail state
  const [selectedLead, setSelectedLead] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [drawerNotes, setDrawerNotes] = useState('')
  const [drawerStatus, setDrawerStatus] = useState('new')
  const [updateFeedback, setUpdateFeedback] = useState(null)

  // Lead Type change dropdown & confirmation modal states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [pendingTypeChange, setPendingTypeChange] = useState(null)
  const [isUpdatingType, setIsUpdatingType] = useState(false)
  const typeDropdownRef = useRef(null)

  // Direct Chat Drawer state inside Leads
  const [activeChatSessionId, setActiveChatSessionId] = useState(null)
  const [activeChatSessionMeta, setActiveChatSessionMeta] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [loadingChatMessages, setLoadingChatMessages] = useState(false)

  // Format date helper in Indonesian
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB'
  }

  // Format payload key into human-readable Title Case with spaces
  const formatPayloadKey = (key) => {
    if (!key) return ''
    return String(key)
      .replace(/_/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Escape HTML entities to prevent XSS in drawer markdown
  const escapeHtml = (str) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // Format inline markdown (bold, italic, code, links)
  const formatInlineMarkdown = (text) => {
    if (!text) return ''
    let formatted = escapeHtml(text)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="drawer-code-span">$1</code>')
    formatted = formatted.replace(
      /\[(.*?)\]\(((?:https?:\/\/|tel:|mailto:|wa\.me).*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="drawer-chat-link">$1</a>'
    )
    return formatted
  }

  // Render markdown blocks (paragraphs, bullet lists, numbered lists)
  const renderDrawerMarkdown = (rawText) => {
    if (!rawText) return null
    const rawBlocks = String(rawText).split(/\n{2,}/)

    return rawBlocks.map((block, blockIdx) => {
      const rawLines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (rawLines.length === 0) return null

      const segments = []
      let currentList = null
      let listKind = null

      rawLines.forEach((line) => {
        const isBullet = /^[•\-\*]\s+/.test(line)
        const isNumbered = /^\d+[\.\)]\s+/.test(line)

        if (isBullet) {
          if (currentList && listKind !== 'ul') {
            segments.push({ kind: listKind, items: currentList })
            currentList = null
          }
          if (!currentList) {
            currentList = []
            listKind = 'ul'
          }
          currentList.push(line.replace(/^[•\-\*]\s+/, ''))
        } else if (isNumbered) {
          if (currentList && listKind !== 'ol') {
            segments.push({ kind: listKind, items: currentList })
            currentList = null
          }
          if (!currentList) {
            currentList = []
            listKind = 'ol'
          }
          currentList.push(line.replace(/^\d+[\.\)]\s+/, ''))
        } else {
          if (currentList) {
            segments.push({ kind: listKind, items: currentList })
            currentList = null
            listKind = null
          }
          segments.push({ kind: 'p', text: line })
        }
      })

      if (currentList) {
        segments.push({ kind: listKind, items: currentList })
      }

      return (
        <div key={blockIdx} className="drawer-msg-block">
          {segments.map((seg, sIdx) => {
            if (seg.kind === 'ul') {
              return (
                <ul key={sIdx} className="drawer-msg-list">
                  {seg.items.map((item, iIdx) => (
                    <li
                      key={iIdx}
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }}
                    />
                  ))}
                </ul>
              )
            }
            if (seg.kind === 'ol') {
              return (
                <ol key={sIdx} className="drawer-msg-ol">
                  {seg.items.map((item, iIdx) => (
                    <li
                      key={iIdx}
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }}
                    />
                  ))}
                </ol>
              )
            }
            return (
              <p
                key={sIdx}
                className="drawer-msg-paragraph"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(seg.text) }}
              />
            )
          })}
        </div>
      )
    })
  }

  // Open direct chat history drawer
  const handleOpenChatDrawer = async (sessionId, lead) => {
    if (!sessionId) return
    setActiveChatSessionId(sessionId)
    setLoadingChatMessages(true)
    setChatMessages([])
    setActiveChatSessionMeta({
      session_id: sessionId,
      customer_name: lead?.customer_name,
      customer_phone: lead?.customer_phone,
      customer_nopol: lead?.customer_nopol,
      vehicle_model: lead?.vehicle_model,
      source: lead?.source
    })

    try {
      const res = await fetch(`${API_BASE_URL}/ai/history?session_id=${encodeURIComponent(sessionId)}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.messages)) {
        setChatMessages(json.messages)
      }

      // Fetch session telemetry details
      const sessRes = await fetch(`${API_BASE_URL}/ai/sessions?search=${encodeURIComponent(sessionId)}`)
      const sessJson = await sessRes.json()
      if (sessJson.success && sessJson.data && Array.isArray(sessJson.data.data)) {
        const found = sessJson.data.data.find(s => s.session_id === sessionId)
        if (found) {
          setActiveChatSessionMeta(prev => ({ ...prev, ...found }))
        }
      }
    } catch (err) {
      console.error('Failed to load chat history in leads:', err)
    } finally {
      setLoadingChatMessages(false)
    }
  }

  const handleCloseChatDrawer = () => {
    setActiveChatSessionId(null)
    setChatMessages([])
    setActiveChatSessionMeta(null)
  }

  // Close type dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false)
      }
    }
    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTypeDropdownOpen])

  // Close drawer or modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (pendingTypeChange) {
          if (!isUpdatingType) setPendingTypeChange(null)
        } else if (isTypeDropdownOpen) {
          setIsTypeDropdownOpen(false)
        } else if (activeChatSessionId) {
          handleCloseChatDrawer()
        } else if (selectedLead) {
          setSelectedLead(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pendingTypeChange, isUpdatingType, isTypeDropdownOpen, activeChatSessionId, selectedLead])

  // Sync state if URL query changes
  useEffect(() => {
    const qType = searchParams.get('type') || 'all'
    const qStatus = searchParams.get('status') || 'all'
    setSelectedType(qType)
    setSelectedStatus(qStatus)
  }, [searchParams])

  // Fetch leads from database
  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType && selectedType !== 'all') params.append('type', selectedType)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const res = await fetch(`${API_BASE_URL}/ai/leads?${params.toString()}`)
      const json = await res.json()

      if (json.success && json.data) {
        setLeads(json.data.data || [])
        if (json.type_counts) {
          setTypeCounts(json.type_counts)
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedType, selectedStatus, searchTerm])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Handle filter changes
  const handleTypeChange = (newType) => {
    setSelectedType(newType)
  }

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus)
    const newParams = new URLSearchParams(searchParams)
    if (newStatus === 'all') {
      newParams.delete('status')
    } else {
      newParams.set('status', newStatus)
    }
    setSearchParams(newParams)
  }

  // Open drawer
  const handleOpenDrawer = (lead) => {
    setSelectedLead(lead)
    setDrawerStatus(lead.status || 'new')
    setDrawerNotes(lead.notes || '')
    setUpdateFeedback(null)
  }

  // Save updated status & notes
  const handleSaveLeadUpdate = async () => {
    if (!selectedLead) return
    setIsUpdatingStatus(true)
    setUpdateFeedback(null)

    try {
      const res = await fetch(`${API_BASE_URL}/ai/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: drawerStatus,
          notes: drawerNotes
        })
      })

      const json = await res.json()
      if (json.success && json.data) {
        setSelectedLead(json.data)
        setLeads(prev => prev.map(l => (l.id === json.data.id ? json.data : l)))
        setUpdateFeedback({ type: 'success', message: 'Status dan catatan lead berhasil diperbarui!' })
        window.dispatchEvent(new CustomEvent('leads_updated'))
      } else {
        setUpdateFeedback({ type: 'error', message: json.message || 'Gagal memperbarui lead.' })
      }
    } catch (err) {
      setUpdateFeedback({ type: 'error', message: 'Terjadi kendala jaringan saat menyimpan status.' })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle selecting new lead type from dropdown
  const handleSelectLeadType = (typeId) => {
    setIsTypeDropdownOpen(false)
    if (!selectedLead || typeId === selectedLead.type) return
    setPendingTypeChange(typeId)
  }

  // Execute type change and save immediately to backend
  const handleConfirmTypeChange = async () => {
    if (!selectedLead || !pendingTypeChange) return
    setIsUpdatingType(true)

    try {
      const res = await fetch(`${API_BASE_URL}/ai/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type: pendingTypeChange
        })
      })

      const json = await res.json()
      if (json.success && json.data) {
        setSelectedLead(json.data)
        setLeads(prev => prev.map(l => (l.id === json.data.id ? json.data : l)))
        setUpdateFeedback({
          type: 'success',
          message: `Kategori lead berhasil diubah menjadi "${getTypeMeta(json.data.type).label}".`
        })
        window.dispatchEvent(new CustomEvent('leads_updated'))
        setPendingTypeChange(null)
        // Refresh leads list to keep badge counts synchronized
        fetchLeads()
      } else {
        alert(json.message || 'Gagal mengubah tipe lead.')
      }
    } catch (err) {
      console.error('Error changing lead type:', err)
      alert('Terjadi kendala jaringan saat memperbarui tipe lead.')
    } finally {
      setIsUpdatingType(false)
    }
  }

  // Format WhatsApp Link
  const formatWaLink = (rawPhone, customerName = '', vehicleModel = '', leadType = '') => {
    if (!rawPhone) return '#'
    let clean = rawPhone.replace(/[^0-9]/g, '')
    if (clean.startsWith('08')) {
      clean = '62' + clean.substring(1)
    } else if (clean.startsWith('8')) {
      clean = '62' + clean
    }

    const typeLabel = LEAD_TYPES.find(t => t.id === leadType)?.label || 'layanan'
    const text = encodeURIComponent(
      `Halo Bapak/Ibu ${customerName || ''}, terima kasih telah menghubungi PT Sun Star Prima Motor Margahayu melalui Asisten Sunny perihal ${typeLabel}${vehicleModel ? ` untuk unit ${vehicleModel}` : ''}. Apakah ada yang bisa kami bantu konfirmasi lebih lanjut?`
    )
    return `https://wa.me/${clean}?text=${text}`
  }

  const getTypeMeta = (typeKey) => {
    return LEAD_TYPES.find(t => t.id === typeKey) || {
      id: typeKey,
      label: typeKey || 'Lainnya',
      color: '#475569',
      bg: '#f1f5f9'
    }
  }

  const getStatusMeta = (statusKey) => {
    return LEAD_STATUSES.find(s => s.id === statusKey) || {
      id: statusKey,
      label: statusKey || 'Baru',
      badgeClass: 'status-new'
    }
  }

  return (
    <div className="portal-leads-page">
      {/* Page Header */}
      <div className="leads-page-header">
        <div>
          <h2 className="leads-page-title">Manajemen Leads (Sunny AI)</h2>
          <p className="leads-page-subtitle">
            Daftar prospek, reservasi bengkel, dan panggilan darurat yang diperoleh dari percakapan cerdas Sunny AI.
          </p>
        </div>

        <button
          type="button"
          className="leads-refresh-btn"
          onClick={fetchLeads}
          disabled={loading}
          title="Segarkan data leads"
        >
          <HiOutlineArrowPath size={16} className={loading ? 'spin-icon' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter and Toolbar (Above Table) */}
      <div className="leads-toolbar-card">
        <div className="leads-toolbar-row">

          {/* Search Input Box */}
          <div className="toolbar-search-col">
            <div className="leads-search-input-wrap">
              <HiOutlineMagnifyingGlass size={16} className="leads-search-icon" />
              <input
                type="text"
                className="leads-search-input"
                placeholder="Cari nama konsumen, no WhatsApp, tipe mobil, plat nopol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="leads-search-clear-btn"
                  onClick={() => setSearchTerm('')}
                >
                  <HiOutlineXMark size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Dropdown Status Lead */}
          <div className="toolbar-field-col">
            <div className="custom-select-wrap">
              <select
                className="toolbar-select"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <HiOutlineChevronDown className="select-chevron-icon" size={14} />
            </div>
          </div>
        </div>

        {/* Quick Filter Chips (Pills) - hanya ada jika membuka page melalui link semua lead */}
        {isFromAllLeads && (
          <div className="leads-type-pills-row">
            {LEAD_TYPES.map((t) => {
              const count = t.id === 'all' ? typeCounts.all : (typeCounts[t.id] || 0)
              const isActive = selectedType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`type-filter-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleTypeChange(t.id)}
                >
                  <span>{t.label}</span>
                  <span className="pill-count-badge">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Leads Table Container (Strict overflow-x containment) */}
      <div className="leads-table-container">
        <div className="leads-table-scroll-wrapper">
          <table className="leads-data-table">
            <thead>
              <tr>
                <th>PELANGGAN & WHATSAPP</th>
                <th>TIPE LEAD</th>
                <th>KENDARAAN & NOPOL</th>
                <th>DETAIL KEBUTUHAN</th>
                <th>STATUS</th>
                <th>WAKTU MASUK</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && leads.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Memuat data leads dari basis data...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Tidak ada data lead yang cocok dengan filter saat ini.</td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const typeMeta = getTypeMeta(lead.type)
                  const statusMeta = getStatusMeta(lead.status)
                  const waLink = formatWaLink(lead.customer_phone, lead.customer_name, lead.vehicle_model, lead.type)
                  const formattedDate = lead.created_at
                    ? new Date(lead.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : '-'

                  return (
                    <tr key={lead.id} onClick={() => handleOpenDrawer(lead)}>
                      {/* Customer Name & WhatsApp */}
                      <td>
                        <div className="cell-customer-col">
                          <span className="customer-name-strong">
                            {lead.customer_name && lead.customer_name !== '...'
                              ? lead.customer_name
                              : 'Pengunjung Web'}
                          </span>
                          {lead.customer_phone && lead.customer_phone !== '...' && lead.customer_phone !== '(Menunggu Konfirmasi)' ? (
                            <div className="customer-phone-row">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-direct-btn"
                                onClick={(e) => e.stopPropagation()}
                                title="Chat langsung via WhatsApp"
                              >
                                <RiWhatsappLine size={14} />
                                <span>{lead.customer_phone}</span>
                              </a>
                            </div>
                          ) : (
                            <span className="customer-phone-muted">Belum ada no WhatsApp</span>
                          )}
                        </div>
                      </td>

                      {/* Lead Type */}
                      <td>
                        <span
                          className="lead-type-badge"
                          style={{ color: typeMeta.color, backgroundColor: typeMeta.bg }}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      {/* Vehicle Model & Nopol */}
                      <td>
                        <div className="cell-vehicle-col">
                          <span className="vehicle-model-text">
                            {lead.vehicle_model && lead.vehicle_model !== '...' ? lead.vehicle_model : '-'}
                          </span>
                          {lead.customer_nopol && lead.customer_nopol !== '...' && (
                            <span className="customer-nopol-badge">{lead.customer_nopol}</span>
                          )}
                        </div>
                      </td>

                      {/* Structured Details Summary */}
                      <td>
                        <div className="cell-data-summary">
                          {lead.data ? (
                            typeof lead.data === 'object' ? (
                              Object.entries(lead.data).slice(0, 2).map(([key, val], idx) => (
                                <span key={idx} className="data-summary-item">
                                  <strong>{key}:</strong> {String(val)}
                                </span>
                              ))
                            ) : (
                              <span>{String(lead.data)}</span>
                            )
                          ) : lead.notes ? (
                            <span className="data-summary-notes">{lead.notes}</span>
                          ) : (
                            <span className="data-summary-empty">-</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`lead-status-chip ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="cell-date-col">
                          <HiOutlineClock size={13} color="#94a3b8" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="leads-action-open-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDrawer(lead)
                          }}
                          title="Buka rincian lengkap lead"
                        >
                          <span>Detail</span>
                          <HiOutlineChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER (Slide in from Right) */}
      {selectedLead && (
        <div className="leads-drawer-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="leads-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="leads-drawer-header">
              <div className="drawer-header-left">
                <div className="lead-type-dropdown-container" ref={typeDropdownRef}>
                  <button
                    type="button"
                    className="lead-type-badge-large is-clickable"
                    style={{
                      color: getTypeMeta(selectedLead.type).color,
                      backgroundColor: getTypeMeta(selectedLead.type).bg
                    }}
                    onClick={() => setIsTypeDropdownOpen(prev => !prev)}
                    title="Klik untuk mengubah kategori lead"
                  >
                    <span>{getTypeMeta(selectedLead.type).label}</span>
                    <HiOutlineChevronDown
                      size={13}
                      className={`type-badge-chevron ${isTypeDropdownOpen ? 'is-open' : ''}`}
                    />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="lead-type-dropdown-menu">
                      <div className="type-dropdown-header">Ubah Kategori Lead:</div>
                      {LEAD_TYPES.filter(t => t.id !== 'all').map((t) => {
                        const isCurrent = t.id === selectedLead.type
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`type-dropdown-item ${isCurrent ? 'is-selected' : ''}`}
                            onClick={() => handleSelectLeadType(t.id)}
                          >
                            <span className="type-dot" style={{ backgroundColor: t.color }} />
                            <span className="type-name">{t.label}</span>
                            {isCurrent && (
                              <HiOutlineCheckCircle size={15} className="type-check-icon" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <h3 className="drawer-lead-title">Rincian Permintaan Konsumen</h3>
                <span className="drawer-lead-meta-id">Lead #{selectedLead.id} • Sumber: {selectedLead.source}</span>
              </div>

              <button
                type="button"
                className="leads-drawer-close-btn"
                onClick={() => setSelectedLead(null)}
                aria-label="Tutup Rincian"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="leads-drawer-body">
              {/* Feedback Alert */}
              {updateFeedback && (
                <div className={`drawer-alert ${updateFeedback.type}`}>
                  <span>{updateFeedback.message}</span>
                </div>
              )}

              {/* Customer Profile Card */}
              <div className="drawer-section-card">
                <h4 className="drawer-card-title">Informasi Kontak Konsumen</h4>
                <div className="drawer-profile-grid">
                  <div className="drawer-field-row">
                    <span className="drawer-field-label">Nama Pelanggan</span>
                    <span className="drawer-field-value strong">
                      {selectedLead.customer_name || 'Tidak Disebutkan'}
                    </span>
                  </div>

                  <div className="drawer-field-row">
                    <span className="drawer-field-label">Nomor WhatsApp</span>
                    {selectedLead.customer_phone ? (
                      <a
                        href={formatWaLink(
                          selectedLead.customer_phone,
                          selectedLead.customer_name,
                          selectedLead.vehicle_model,
                          selectedLead.type
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="drawer-wa-btn"
                      >
                        <RiWhatsappLine size={16} />
                        <span>{selectedLead.customer_phone}</span>
                        <HiOutlineArrowTopRightOnSquare size={13} />
                      </a>
                    ) : (
                      <span className="drawer-field-value text-muted">-</span>
                    )}
                  </div>

                  <div className="drawer-field-row">
                    <span className="drawer-field-label">Model Kendaraan</span>
                    <span className="drawer-field-value">
                      {selectedLead.vehicle_model || '-'}
                    </span>
                  </div>

                  <div className="drawer-field-row">
                    <span className="drawer-field-label">Plat Nomor (Nopol)</span>
                    <span className="drawer-field-value">
                      {selectedLead.customer_nopol || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Structured Payload / Specific Details */}
              <div className="drawer-section-card">
                <h4 className="drawer-card-title">Data Rincian Kebutuhan</h4>
                {selectedLead.data && typeof selectedLead.data === 'object' ? (
                  <div className="drawer-payload-list">
                    {Object.entries(selectedLead.data).map(([k, v], i) => (
                      <div key={i} className="payload-item-row">
                        <span className="payload-key">{formatPayloadKey(k)}</span>
                        <span className="payload-val">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="drawer-empty-text">Tidak ada data terstruktur tambahan.</p>
                )}
              </div>

              {/* Associated Chat Session */}
              {selectedLead.session_id && (
                <div className="drawer-section-card">
                  <h4 className="drawer-card-title">Sesi Percakapan Asal</h4>
                  <div className="drawer-session-row">
                    <div className="session-tag-col">
                      <span className="session-id-text">{selectedLead.session_id}</span>
                      <span className="session-desc">Obrolan Sunny AI yang menghasilkan lead ini</span>
                    </div>
                    <button
                      type="button"
                      className="btn-view-chat-session"
                      onClick={() => handleOpenChatDrawer(selectedLead.session_id, selectedLead)}
                      title="Buka seluruh riwayat chat sesi ini"
                    >
                      <HiOutlineChatBubbleLeftRight size={15} />
                      <span>Lihat Riwayat Chat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Update & Internal Notes Form */}
              <div className="drawer-section-card">
                <h4 className="drawer-card-title">Tindak Lanjut Sales / Bengkel</h4>

                <div className="drawer-form-group">
                  <label className="drawer-form-label">Ubah Status Tindak Lanjut:</label>
                  <select
                    className="drawer-form-select"
                    value={drawerStatus}
                    onChange={(e) => setDrawerStatus(e.target.value)}
                  >
                    <option value="new">Baru Masuk (New)</option>
                    <option value="contacted">Sudah Dihubungi Konsultan</option>
                    <option value="in_progress">Sedang Diproses (Follow Up)</option>
                    <option value="completed">Selesai / Deal / SPK</option>
                    <option value="cancelled">Dibatalkan / Tidak Valid</option>
                  </select>
                </div>

                <div className="drawer-form-group">
                  <label className="drawer-form-label">Catatan Internal Dealer:</label>
                  <textarea
                    className="drawer-form-textarea"
                    rows={4}
                    placeholder="Tuliskan perkembangan follow up, sales in-charge, atau rincian janji temu..."
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn-save-lead-update"
                  onClick={handleSaveLeadUpdate}
                  disabled={isUpdatingStatus}
                >
                  <HiOutlineCheckCircle size={17} />
                  <span>{isUpdatingStatus ? 'Menyimpan...' : 'Simpan Pembaruan Lead'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CHAT DETAIL DRAWER (Slide in from Right) */}
      {activeChatSessionId && (
        <>
          <div
            className="chat-drawer-backdrop"
            onClick={handleCloseChatDrawer}
            role="button"
            tabIndex={0}
            aria-label="Tutup Panel Obrolan"
          />

          <div className="chat-drawer-panel">
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-header-meta">
                <div className="drawer-title-row">
                  <h3 className="drawer-title">Riwayat Percakapan Konsumen</h3>
                  <span className={`status-badge-chip ${activeChatSessionMeta?.status || 'active'}`}>
                    <span>{activeChatSessionMeta?.status === 'active' ? 'Sesi Aktif' : 'Sesi Selesai'}</span>
                  </span>
                </div>
                <span className="drawer-session-sub">{activeChatSessionId}</span>
              </div>

              <button
                type="button"
                className="drawer-close-btn"
                onClick={handleCloseChatDrawer}
                aria-label="Tutup Panel Obrolan"
                title="Tutup Panel (Esc)"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>

            {/* Telemetry Information Strip */}
            {activeChatSessionMeta && (
              <div className="drawer-telemetry-strip">
                <div className="telemetry-item">
                  <span className="telemetry-label">Lokasi & IP</span>
                  <span className="telemetry-value">
                    {activeChatSessionMeta.city || 'Bekasi'}, {activeChatSessionMeta.region || 'Jawa Barat'}, {activeChatSessionMeta.country || 'ID'}
                    <br />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {activeChatSessionMeta.ip_address || '-'}
                    </span>
                  </span>
                </div>

                <div className="telemetry-item">
                  <span className="telemetry-label">Perangkat & OS</span>
                  <span className="telemetry-value">
                    {activeChatSessionMeta.device_type === 'mobile' ? 'Ponsel' : 'Desktop'} ({activeChatSessionMeta.os || 'Windows'})
                    <br />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {activeChatSessionMeta.browser || 'Browser'} • {activeChatSessionMeta.screen_resolution || '-'}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Customer Data Highlight */}
            {activeChatSessionMeta && (activeChatSessionMeta.customer_name || activeChatSessionMeta.customer_phone || activeChatSessionMeta.customer_nopol) && (
              <div className="drawer-customer-card">
                <HiOutlineUser size={18} color="#ca8a04" />
                <div className="customer-card-text">
                  <strong>Identitas Pelanggan:</strong> {activeChatSessionMeta.customer_name || 'Tanpa Nama'}
                  {activeChatSessionMeta.customer_phone && ` • WA: ${activeChatSessionMeta.customer_phone}`}
                  {activeChatSessionMeta.customer_nopol && ` • Nopol: ${activeChatSessionMeta.customer_nopol}`}
                  {activeChatSessionMeta.vehicle_model && ` • Unit: ${activeChatSessionMeta.vehicle_model}`}
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="drawer-messages-stream">
              {loadingChatMessages ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <HiOutlineArrowPath size={24} className="spin-icon" style={{ display: 'inline-block', marginBottom: 8 }} />
                  <p>Memuat seluruh riwayat pesan dari database...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <p>Belum ada pesan yang tersimpan pada sesi percakapan ini.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isUser = msg.sender_type === 'user'
                  return (
                    <div
                      key={msg.id}
                      className={`drawer-msg-item ${isUser ? 'drawer-msg-user' : 'drawer-msg-ai'}`}
                    >
                      <span className="drawer-msg-sender-tag">
                        {isUser ? (
                          <>
                            <span>Pengunjung</span>
                            <HiOutlineUser size={12} />
                          </>
                        ) : (
                          <>
                            <HiOutlineSparkles size={12} color="#e3000c" />
                            <span>Sunny AI Assistant</span>
                          </>
                        )}
                      </span>

                      <div className="drawer-bubble">
                        <div className="drawer-bubble-content">
                          {renderDrawerMarkdown(msg.message)}
                        </div>

                        {/* Quick Replies Tags */}
                        {Array.isArray(msg.quick_replies) && msg.quick_replies.length > 0 && (
                          <div className="drawer-chips-wrap">
                            {msg.quick_replies.map((qr, qIdx) => (
                              <span key={qIdx} className="drawer-chip-tag">
                                💬 {qr}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="drawer-msg-time">
                        {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <span className="drawer-footer-count">
                Total {chatMessages.length} pesan tersimpan
              </span>
              <button
                type="button"
                className="btn-close-drawer-bottom"
                onClick={handleCloseChatDrawer}
              >
                <HiOutlineXMark size={16} />
                <span>Tutup Panel (Esc)</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Dialog Konfirmasi Ubah Tipe Lead */}
      {pendingTypeChange && selectedLead && (
        <div
          className="confirm-lead-type-backdrop"
          onClick={() => !isUpdatingType && setPendingTypeChange(null)}
          aria-modal="true"
          role="dialog"
        >
          <div className="portal-modal-window confirm-type-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-header-title-box">
                <HiOutlineArrowPath className="text-red" size={22} />
                <h3 className="modal-title">Konfirmasi Ubah Tipe Lead</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isUpdatingType && setPendingTypeChange(null)}
                disabled={isUpdatingType}
                aria-label="Tutup"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="confirm-modal-body">
              <p className="confirm-modal-desc">
                Apakah Anda yakin ingin memindahkan kategori untuk <strong>Lead #{selectedLead.id}</strong> ({selectedLead.customer_name || 'Pelanggan'})?
              </p>

              <div className="type-change-compare-box">
                <div className="type-compare-col">
                  <span className="type-compare-tag">Kategori Saat Ini</span>
                  <span
                    className="lead-type-badge-large"
                    style={{
                      color: getTypeMeta(selectedLead.type).color,
                      backgroundColor: getTypeMeta(selectedLead.type).bg
                    }}
                  >
                    {getTypeMeta(selectedLead.type).label}
                  </span>
                </div>

                <div className="type-compare-arrow">
                  <HiOutlineChevronRight size={18} />
                </div>

                <div className="type-compare-col">
                  <span className="type-compare-tag">Kategori Baru</span>
                  <span
                    className="lead-type-badge-large"
                    style={{
                      color: getTypeMeta(pendingTypeChange).color,
                      backgroundColor: getTypeMeta(pendingTypeChange).bg
                    }}
                  >
                    {getTypeMeta(pendingTypeChange).label}
                  </span>
                </div>
              </div>

              <p className="confirm-modal-hint">
                Perubahan kategori ini akan langsung tersimpan ke sistem dan otomatis memperbarui penghitungan badge lead di seluruh portal.
              </p>
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setPendingTypeChange(null)}
                disabled={isUpdatingType}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-confirm-type-save"
                onClick={handleConfirmTypeChange}
                disabled={isUpdatingType}
              >
                {isUpdatingType ? (
                  <>
                    <HiOutlineArrowPath className="animate-spin" size={15} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Ya, Ubah Kategori Lead</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
