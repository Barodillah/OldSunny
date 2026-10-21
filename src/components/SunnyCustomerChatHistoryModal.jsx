import { useState, useEffect, useMemo } from 'react'
import {
  HiOutlineXMark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
  HiOutlineMapPin,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import {
  getCustomerSessions,
  deleteCustomerSession,
  switchCustomerActiveSession,
  getActiveSessionId
} from '../utils/sunnySessionStorage.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import './SunnyCustomerChatHistoryModal.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

// Simple safe markdown formatter for chat detail preview
const renderMarkdown = (content) => {
  if (!content) return ''
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')

  const lines = html.split('\n')
  const processed = []
  let inList = false

  for (let line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processed.push('<ul class="cust-chat-ul">')
        inList = true
      }
      processed.push(`<li>${trimmed.substring(2)}</li>`)
    } else {
      if (inList) {
        processed.push('</ul>')
        inList = false
      }
      if (trimmed === '') {
        processed.push('<div class="cust-chat-spacer"></div>')
      } else {
        processed.push(`<p class="cust-chat-p">${line}</p>`)
      }
    }
  }
  if (inList) processed.push('</ul>')
  return processed.join('')
}

export default function SunnyCustomerChatHistoryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState([])
  const [serverSessions, setServerSessions] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [selectedSessionData, setSelectedSessionData] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState('')
  const [sessionToDelete, setSessionToDelete] = useState(null)

  // Listen to open_sunny_chat_history and sunny_session_updated events
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      loadSessions()
    }

    const handleUpdate = () => {
      loadSessions()
    }

    window.addEventListener('open_sunny_chat_history', handleOpen)
    window.addEventListener('sunny_session_updated', handleUpdate)

    return () => {
      window.removeEventListener('open_sunny_chat_history', handleOpen)
      window.removeEventListener('sunny_session_updated', handleUpdate)
    }
  }, [])

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (sessionToDelete) {
          setSessionToDelete(null)
        } else if (selectedSessionId) {
          setSelectedSessionId(null)
        } else {
          setIsOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedSessionId, sessionToDelete])

  const loadSessions = async () => {
    setIsLoadingList(true)
    const local = getCustomerSessions()
    setSessions(local)
    setActiveSessionId(getActiveSessionId())

    if (local.length === 0) {
      setIsLoadingList(false)
      return
    }

    const ids = local.map(s => s.sessionId).filter(Boolean)
    if (ids.length === 0) {
      setIsLoadingList(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ai/customer/sessions?session_ids=${encodeURIComponent(ids.join(','))}`, {
        headers: { 'Accept': 'application/json' }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.sessions)) {
        const map = {}
        data.sessions.forEach(s => {
          map[s.session_id] = s
        })
        setServerSessions(map)
      }
    } catch (e) {
      console.warn('Could not sync with server customer sessions:', e)
    } finally {
      setIsLoadingList(false)
    }
  }

  // Load chat detail when session is selected
  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedSessionData(null)
      return
    }

    setIsLoadingDetail(true)
    fetch(`${API_BASE_URL}/ai/history?session_id=${selectedSessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSelectedSessionData(data)
        } else {
          // If server doesn't find it, look for local active chat
          const localHistory = localStorage.getItem('sunny_chat_history')
          if (localHistory && selectedSessionId === getActiveSessionId()) {
            try {
              const msgs = JSON.parse(localHistory)
              setSelectedSessionData({
                session: { session_id: selectedSessionId, status: 'active' },
                messages: msgs.map(m => ({
                  id: m.id,
                  sender_type: m.sender === 'user' ? 'user' : 'ai',
                  message: m.text,
                  created_at: new Date().toISOString()
                }))
              })
            } catch {
              setSelectedSessionData(null)
            }
          }
        }
      })
      .catch(err => {
        console.error('Failed to load session detail:', err)
      })
      .finally(() => {
        setIsLoadingDetail(false)
      })
  }, [selectedSessionId])

  // Handle continuing chat in floating widget
  const handleContinueChat = (sessionId) => {
    switchCustomerActiveSession(sessionId)
    setIsOpen(false)
    setSelectedSessionId(null)

    // Trigger open assistant floating window
    setTimeout(() => {
      const triggerBtn = document.querySelector('.assistant-trigger-btn')
      if (triggerBtn) triggerBtn.click()
    }, 150)
  }

  // Handle delete session via custom public dialog modal
  const handleDeleteSession = (e, sessionId, snippet) => {
    e.stopPropagation()
    setSessionToDelete({
      sessionId,
      snippet: snippet || sessionId
    })
  }

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return
    const id = sessionToDelete.sessionId
    deleteCustomerSession(id)
    if (selectedSessionId === id) {
      setSelectedSessionId(null)
    }
    setSessionToDelete(null)
    loadSessions()
  }

  const handleCancelDelete = () => {
    setSessionToDelete(null)
  }

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return sessions.filter(s => {
      const idMatch = s.sessionId?.toLowerCase().includes(q)
      const snippetMatch = s.lastSnippet?.toLowerCase().includes(q)
      const serverMatch = serverSessions[s.sessionId]?.customer_name?.toLowerCase().includes(q) ||
        serverSessions[s.sessionId]?.customer_phone?.toLowerCase().includes(q)
      return idMatch || snippetMatch || serverMatch
    })
  }, [sessions, searchQuery, serverSessions])

  if (!isOpen) return null

  return (
    <>
      <div className="cust-history-backdrop" onClick={() => setIsOpen(false)}>
      <div className="cust-history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cust-history-header">
          <div className="cust-history-header-left">
            <div className="cust-history-avatar-badge">
              <img
                src="https://bewhy.id/wp-content/uploads/asset_6ad09424ada3f7.54954850.png"
                alt="Sunny Mascot"
                className="cust-history-avatar-img"
              />
            </div>
            <div>
              <h3 className="cust-history-title">Riwayat Chat Sunny</h3>
              <p className="cust-history-subtitle">
                Percakapan Anda yang tersimpan di perangkat ini dengan Asisten Pintar Dealer
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cust-history-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup riwayat percakapan"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Modal Body: Split / Switch View */}
        <div className="cust-history-body">
          {selectedSessionId ? (
            /* DETAIL VIEW */
            <div className="cust-history-detail-view">
              <div className="cust-detail-nav">
                <button
                  type="button"
                  className="cust-back-btn"
                  onClick={() => setSelectedSessionId(null)}
                >
                  <HiOutlineArrowLeft size={16} />
                  <span>Kembali ke Daftar</span>
                </button>

                <div className="cust-detail-actions">
                  <button
                    type="button"
                    className="cust-detail-delete-btn"
                    title="Hapus sesi ini dari riwayat"
                    onClick={(e) => handleDeleteSession(e, selectedSessionId, 'Sesi ini')}
                  >
                    <HiOutlineTrash size={15} />
                    <span>Hapus Sesi</span>
                  </button>
                  <button
                    type="button"
                    className="cust-continue-chat-btn"
                    onClick={() => handleContinueChat(selectedSessionId)}
                  >
                    <HiOutlineChatBubbleLeftRight size={17} />
                    <span>Lanjutkan Chat</span>
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              {isLoadingDetail ? (
                <div className="cust-detail-loading">
                  <HiOutlineArrowPath className="cust-spin-icon" size={24} />
                  <p>Memuat isi obrolan...</p>
                </div>
              ) : selectedSessionData && selectedSessionData.messages && selectedSessionData.messages.length > 0 ? (
                <div className="cust-detail-stream">
                  <div className="cust-session-info-pill">
                    <span className="info-item">{selectedSessionData.messages.length} pesan</span>
                    {selectedSessionId === activeSessionId && (
                      <span className="cust-status-badge is-active">Sesi Aktif</span>
                    )}
                  </div>

                  {selectedSessionData.messages.map((m, idx) => {
                    const isAi = m.sender_type === 'assistant' || m.sender_type === 'ai'
                    return (
                      <div
                        key={idx}
                        className={`cust-stream-item ${isAi ? 'cust-item-ai' : 'cust-item-user'}`}
                      >
                        <div className="cust-item-header">
                          <span className="cust-sender-name">
                            {isAi ? 'Sunny AI Assistant' : 'Anda'}
                          </span>
                          {m.created_at && (
                            <span className="cust-msg-time">
                              {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div
                          className="cust-msg-content"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.message) }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="cust-detail-empty">
                  <p>Tidak ada pesan yang terekam pada sesi ini.</p>
                </div>
              )}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="cust-history-list-view">
              {/* Search Bar & Refresh */}
              <div className="cust-list-toolbar">
                <div className="cust-search-input-wrap">
                  <HiOutlineMagnifyingGlass size={16} className="cust-search-icon" />
                  <input
                    type="text"
                    className="cust-search-input"
                    placeholder="Cari topik obrolan, tanggal, atau nomor WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="cust-clear-search-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      <HiOutlineXMark size={14} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="cust-refresh-btn"
                  title="Perbarui daftar"
                  onClick={loadSessions}
                  disabled={isLoadingList}
                >
                  <HiOutlineArrowPath className={isLoadingList ? 'cust-spin-icon' : ''} size={16} />
                </button>
              </div>

              {/* Sessions List Items */}
              {filteredSessions.length > 0 ? (
                <div className="cust-sessions-scroll">
                  {filteredSessions.map((session) => {
                    const id = session.sessionId
                    const server = serverSessions[id] || {}
                    const isCurrent = id === activeSessionId
                    const dateStr = session.lastActivity || session.createdAt || server.last_activity_at
                    const formattedDate = dateStr
                      ? new Date(dateStr).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Tanggal tidak diketahui'

                    const snippet = session.lastSnippet || 'Sesi obrolan dengan Sunny'
                    const msgCount = server.messages_count || session.messageCount || 1

                    return (
                      <div
                        key={id}
                        className={`cust-session-card ${isCurrent ? 'is-active-session' : ''}`}
                        onClick={() => setSelectedSessionId(id)}
                      >
                        <div className="cust-session-main">
                          <div className="cust-session-meta-row">
                            <div className="cust-session-time">
                              <HiOutlineCalendar size={13} />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="cust-session-badges">
                              {isCurrent && (
                                <span className="cust-status-badge is-active">Sesi Saat Ini</span>
                              )}
                              <span className="cust-msg-count-pill">{msgCount} pesan</span>
                            </div>
                          </div>

                          <p className="cust-session-snippet">{snippet}</p>

                          {server.customer_phone && (
                            <div className="cust-session-customer-tag">
                              <span>Kontak WhatsApp: <strong>{server.customer_phone}</strong></span>
                            </div>
                          )}
                        </div>

                        <div className="cust-session-actions">
                          <button
                            type="button"
                            className="cust-card-action-btn cust-view-btn"
                            title="Buka rincian obrolan"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSessionId(id)
                            }}
                          >
                            <HiOutlineChevronRight size={16} />
                          </button>
                          <button
                            type="button"
                            className="cust-card-action-btn cust-delete-btn"
                            title="Hapus sesi dari perangkat"
                            onClick={(e) => handleDeleteSession(e, id, snippet)}
                          >
                            <HiOutlineTrash size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="cust-history-empty">
                  <div className="cust-empty-icon-wrap">
                    <HiOutlineClock size={36} />
                  </div>
                  <h4 className="cust-empty-title">
                    {searchQuery ? 'Tidak Ada Sesi yang Cocok' : 'Belum Ada Riwayat Percakapan'}
                  </h4>
                  <p className="cust-empty-desc">
                    {searchQuery
                      ? `Tidak ditemukan riwayat yang mengandung kata kunci "${searchQuery}".`
                      : 'Percakapan Anda dengan Sunny seputar info mobil baru, simulasi kredit, booking bengkel, atau body paint akan tersimpan di sini.'}
                  </p>
                  <button
                    type="button"
                    className="cust-empty-start-btn"
                    onClick={() => {
                      setIsOpen(false)
                      setTimeout(() => {
                        const triggerBtn = document.querySelector('.assistant-trigger-btn')
                        if (triggerBtn) triggerBtn.click()
                      }, 150)
                    }}
                  >
                    <HiOutlineChatBubbleLeftRight size={18} />
                    <span>Mulai Percakapan dengan Sunny</span>
                    <HiOutlineArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Reusable Public Confirm Dialog */}
    <ConfirmDialog
      isOpen={Boolean(sessionToDelete)}
      onClose={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      title="Hapus Sesi Percakapan?"
      message="Sesi percakapan ini akan dihapus secara permanen dari penyimpanan riwayat di perangkat Anda. Tindakan ini tidak dapat dibatalkan."
      confirmText="Ya, Hapus Sesi"
      cancelText="Batal"
      variant="danger"
      itemIdentifier={sessionToDelete?.snippet}
    />
  </>
)
}
