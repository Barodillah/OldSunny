import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineDevicePhoneMobile,
  HiOutlineComputerDesktop,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlinePhone
} from 'react-icons/hi2'
import './PortalChatHistory.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export default function PortalChatHistory() {
  const [searchParams] = useSearchParams()
  const querySessionId = searchParams.get('session_id')

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // '' (all), 'active', 'closed'
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    mobile: 0,
    desktop: 0,
    totalMessages: 0
  })

  // Selected session for Right-Side Drawer
  const [selectedSession, setSelectedSession] = useState(null)
  const [drawerMessages, setDrawerMessages] = useState([])
  const [loadingDrawer, setLoadingDrawer] = useState(false)

  // Fetch session list
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const res = await fetch(`${API_BASE_URL}/ai/sessions?${params.toString()}`)
      const json = await res.json()

      if (json.success && json.data) {
        const list = json.data.data || []
        setSessions(list)

        // Compute summary metrics
        let activeCount = 0
        let mobileCount = 0
        let desktopCount = 0
        let msgSum = 0

        list.forEach(s => {
          if (s.status === 'active') activeCount++
          if ((s.device_type || '').toLowerCase() === 'mobile') mobileCount++
          else desktopCount++
          msgSum += (s.messages_count || 0)
        })

        setStats({
          total: json.data.total || list.length,
          active: activeCount,
          mobile: mobileCount,
          desktop: desktopCount,
          totalMessages: msgSum
        })
      }
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Open right-side drawer and fetch chat messages
  const handleOpenDrawer = async (session) => {
    setSelectedSession(session)
    setLoadingDrawer(true)
    setDrawerMessages([])

    try {
      const res = await fetch(`${API_BASE_URL}/ai/history?session_id=${encodeURIComponent(session.session_id)}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.messages)) {
        setDrawerMessages(json.messages)
      }

      // If session doesn't have telemetry properties yet, fetch it
      if (!session.city && !session.ip_address) {
        const sessRes = await fetch(`${API_BASE_URL}/ai/sessions?search=${encodeURIComponent(session.session_id)}`)
        const sessJson = await sessRes.json()
        if (sessJson.success && sessJson.data && Array.isArray(sessJson.data.data)) {
          const found = sessJson.data.data.find(s => s.session_id === session.session_id)
          if (found) {
            setSelectedSession(prev => ({ ...prev, ...found }))
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat messages for drawer:', err)
    } finally {
      setLoadingDrawer(false)
    }
  }

  // Automatically open session drawer if session_id is in query param
  useEffect(() => {
    if (querySessionId) {
      handleOpenDrawer({ session_id: querySessionId })
    }
  }, [querySessionId])

  const handleCloseDrawer = () => {
    setSelectedSession(null)
    setDrawerMessages([])
  }

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedSession) {
        handleCloseDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSession])

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

    // Markdown Bold: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Markdown Italic: *text*
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')

    // Markdown Inline Code: `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="drawer-code-span">$1</code>')

    // Markdown Links: [label](url)
    formatted = formatted.replace(
      /\[(.*?)\]\(((?:https?:\/\/|tel:|mailto:|wa\.me).*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="drawer-chat-link">$1</a>'
    )

    return formatted
  }

  // Render markdown blocks (paragraphs, bullet lists, numbered lists)
  const renderDrawerMarkdown = (rawText) => {
    if (!rawText) return null

    // Split text by multiple consecutive newlines
    const rawBlocks = String(rawText).split(/\n{2,}/)

    return rawBlocks.map((block, blockIdx) => {
      const rawLines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (rawLines.length === 0) return null

      // Group lines into paragraphs or lists
      const segments = []
      let currentList = null
      let listKind = null // 'ul' or 'ol'

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
                className="drawer-msg-p"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(seg.text) }}
              />
            )
          })}
        </div>
      )
    })
  }

  return (
    <div className="portal-chat-history-page">
      {/* Header Row */}
      <div className="chat-history-header-row">
        <div>
          <h2 className="chat-history-title">Riwayat Chat (Chat History)</h2>
          <p className="chat-history-desc">
            Pantau interaksi asisten pintar Sunny AI dengan pengunjung, rincian perangkat, alamat IP, dan lokasi real-time.
          </p>
        </div>

        <button
          type="button"
          className="btn-refresh-history"
          onClick={fetchSessions}
          disabled={loading}
          title="Segarkan Data"
        >
          <HiOutlineArrowPath size={16} className={loading ? 'spin-icon' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Minimalist Summary Stat Strip */}
      <div className="chat-stat-strip">
        <div className="chat-stat-card">
          <div className="chat-stat-icon stat-icon-total">
            <HiOutlineChatBubbleLeftRight size={20} />
          </div>
          <div className="chat-stat-info">
            <span className="chat-stat-value">{stats.total}</span>
            <span className="chat-stat-label">Total Sesi Obrolan</span>
          </div>
        </div>

        <div className="chat-stat-card">
          <div className="chat-stat-icon stat-icon-active">
            <HiOutlineCheckCircle size={20} />
          </div>
          <div className="chat-stat-info">
            <span className="chat-stat-value">{stats.active}</span>
            <span className="chat-stat-label">Sesi Aktif</span>
          </div>
        </div>

        <div className="chat-stat-card">
          <div className="chat-stat-icon stat-icon-mobile">
            <HiOutlineDevicePhoneMobile size={20} />
          </div>
          <div className="chat-stat-info">
            <span className="chat-stat-value">{stats.mobile}</span>
            <span className="chat-stat-label">Pengguna Ponsel (Mobile)</span>
          </div>
        </div>

        <div className="chat-stat-card">
          <div className="chat-stat-icon stat-icon-msg">
            <HiOutlineSparkles size={20} />
          </div>
          <div className="chat-stat-info">
            <span className="chat-stat-value">{stats.totalMessages}</span>
            <span className="chat-stat-label">Pesan Masuk & Dijawab</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="chat-filter-bar">
        <div className="chat-status-chips">
          <button
            type="button"
            className={`filter-chip ${statusFilter === '' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Semua Sesi ({stats.total})
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'active' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Sesi Aktif
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'closed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('closed')}
          >
            Sesi Selesai
          </button>
        </div>

        <div className="chat-search-wrap">
          <HiOutlineMagnifyingGlass size={16} color="#94a3b8" />
          <input
            type="text"
            className="chat-search-input"
            placeholder="Cari ID sesi, nama, no hp, kota, atau IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Session Table Container */}
      <div className="chat-table-card">
        <div className="table-responsive-wrapper">
          <table className="portal-chat-table">
            <thead>
              <tr>
                <th>Sesi & Konsumen</th>
                <th>Lokasi & Jaringan</th>
                <th>Perangkat & Browser</th>
                <th>Status</th>
                <th>Pesan</th>
                <th>Aktivitas Terakhir</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && sessions.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Memuat data sesi percakapan dari database...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>Tidak ada sesi percakapan yang sesuai dengan filter.</td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} onClick={() => handleOpenDrawer(sess)}>
                    <td>
                      <div>
                        <span className="session-id-pill">{sess.session_id}</span>
                        {sess.customer_name ? (
                          <span className="customer-name-text">
                            {sess.customer_name} {sess.customer_phone && `(${sess.customer_phone})`}
                          </span>
                        ) : (
                          <span className="customer-sub-text">Pengunjung Web</span>
                        )}
                        {sess.customer_nopol && (
                          <span className="customer-sub-text">Nopol: {sess.customer_nopol}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="location-cell-col">
                        <span className="location-city-text">
                          <HiOutlineMapPin size={13} style={{ display: 'inline', marginRight: 3, color: '#e3000c' }} />
                          {sess.city || 'Bekasi Timur'}, {sess.country_code || 'ID'}
                        </span>
                        <span className="location-ip-text">
                          IP: {sess.ip_address || '-'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="device-badge-row">
                        {sess.device_type === 'mobile' ? (
                          <HiOutlineDevicePhoneMobile size={15} color="#2563eb" />
                        ) : (
                          <HiOutlineComputerDesktop size={15} color="#475569" />
                        )}
                        <span>
                          {sess.os || 'OS'} • {sess.browser || 'Browser'}
                        </span>
                      </div>
                      <span className="customer-sub-text">
                        {sess.screen_resolution || '1920x1080'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge-chip ${sess.status || 'active'}`}>
                        {sess.status === 'active' && <span className="status-dot-pulse" />}
                        <span>{sess.status === 'active' ? 'Aktif' : 'Selesai'}</span>
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {sess.messages_count || 0}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 4 }}>
                        pesan
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: '0.8rem' }}>
                        <HiOutlineClock size={13} color="#94a3b8" />
                        <span>{formatDateTime(sess.last_activity_at || sess.created_at)}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-open-drawer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDrawer(sess)
                        }}
                      >
                        <HiOutlineChatBubbleLeftRight size={13} />
                        <span>Lihat Chat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          SLIDE-OUT RIGHT DRAWER UNTUK DETAIL CHAT MESSAGE
          ==================================================================== */}
      {selectedSession && (
        <>
          {/* Backdrop */}
          <div
            className="chat-drawer-backdrop"
            onClick={handleCloseDrawer}
            role="button"
            tabIndex={0}
            aria-label="Tutup Panel Obrolan"
          />

          {/* Drawer Panel */}
          <div className="chat-drawer-panel">
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-header-meta">
                <div className="drawer-title-row">
                  <h3 className="drawer-title">Riwayat Percakapan</h3>
                  <span className={`status-badge-chip ${selectedSession.status || 'active'}`}>
                    <span>{selectedSession.status === 'active' ? 'Sesi Aktif' : 'Sesi Selesai'}</span>
                  </span>
                </div>
                <span className="drawer-session-sub">{selectedSession.session_id}</span>
              </div>

              <button
                type="button"
                className="drawer-close-btn"
                onClick={handleCloseDrawer}
                aria-label="Tutup Panel Obrolan"
                title="Tutup Panel (Esc)"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>

            {/* Telemetry Information Strip */}
            <div className="drawer-telemetry-strip">
              <div className="telemetry-item">
                <span className="telemetry-label">Lokasi & IP</span>
                <span className="telemetry-value">
                  {selectedSession.city || 'Bekasi Timur'}, {selectedSession.region || 'Jawa Barat'}, {selectedSession.country || 'ID'}
                  <br />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {selectedSession.ip_address}
                  </span>
                </span>
              </div>

              <div className="telemetry-item">
                <span className="telemetry-label">Perangkat & OS</span>
                <span className="telemetry-value">
                  {selectedSession.device_type === 'mobile' ? 'Ponsel' : 'Desktop'} ({selectedSession.os || 'Windows'})
                  <br />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {selectedSession.browser || 'Browser'} • {selectedSession.screen_resolution || '-'}
                  </span>
                </span>
              </div>
            </div>

            {/* Customer Data Highlight if identified */}
            {(selectedSession.customer_name || selectedSession.customer_phone || selectedSession.customer_nopol) && (
              <div className="drawer-customer-card">
                <HiOutlineUser size={18} color="#ca8a04" />
                <div className="customer-card-text">
                  <strong>Identitas Pelanggan:</strong> {selectedSession.customer_name || 'Tanpa Nama'}
                  {selectedSession.customer_phone && ` • WA: ${selectedSession.customer_phone}`}
                  {selectedSession.customer_nopol && ` • Nopol: ${selectedSession.customer_nopol}`}
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="drawer-messages-stream">
              {loadingDrawer ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <HiOutlineArrowPath size={24} className="spin-icon" style={{ display: 'inline-block', marginBottom: 8 }} />
                  <p>Memuat seluruh riwayat pesan dari database...</p>
                </div>
              ) : drawerMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <p>Belum ada pesan yang tersimpan pada sesi ini.</p>
                </div>
              ) : (
                drawerMessages.map((msg) => {
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
                Total {drawerMessages.length} pesan tersimpan
              </span>
              <button
                type="button"
                className="btn-close-drawer-bottom"
                onClick={handleCloseDrawer}
              >
                <HiOutlineXMark size={16} />
                <span>Tutup Panel (Esc)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
