/**
 * Client-side session storage utility for Sunny AI Assistant customer chat history.
 * Manages tracking of all chat sessions initiated on the user's browser device.
 */

const CUSTOMER_SESSIONS_KEY = 'sunny_customer_sessions'
const ACTIVE_SESSION_KEY = 'sunny_ai_session_id'

export const getActiveSessionId = () => {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(ACTIVE_SESSION_KEY) || ''
}

export const getCustomerSessions = () => {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSIONS_KEY)
    let list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) list = []

    // Ensure active session is included if valid
    const active = getActiveSessionId()
    if (active && !list.some(s => (s.sessionId || s) === active)) {
      list.unshift({
        sessionId: active,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        lastSnippet: 'Percakapan aktif saat ini',
        messageCount: 1
      })
      localStorage.setItem(CUSTOMER_SESSIONS_KEY, JSON.stringify(list))
    }

    return list.map(item => {
      if (typeof item === 'string') {
        return {
          sessionId: item,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          lastSnippet: 'Sesi obrolan',
          messageCount: 1
        }
      }
      return item
    })
  } catch (e) {
    console.error('Failed to parse customer sessions:', e)
    return []
  }
}

export const recordCustomerSession = ({ sessionId, snippet = '', messageCount = 0 }) => {
  if (typeof localStorage === 'undefined' || !sessionId) return
  try {
    const list = getCustomerSessions()
    const now = new Date().toISOString()
    const existingIndex = list.findIndex(s => s.sessionId === sessionId)

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        lastActivity: now,
        lastSnippet: snippet || list[existingIndex].lastSnippet || 'Sesi obrolan',
        messageCount: messageCount || list[existingIndex].messageCount || 1
      }
    } else {
      list.unshift({
        sessionId,
        createdAt: now,
        lastActivity: now,
        lastSnippet: snippet || 'Percakapan baru dengan Sunny',
        messageCount: messageCount || 1
      })
    }

    localStorage.setItem(CUSTOMER_SESSIONS_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('sunny_session_updated', { detail: { sessionId } }))
  } catch (e) {
    console.error('Failed to record customer session:', e)
  }
}

export const deleteCustomerSession = (sessionId) => {
  if (typeof localStorage === 'undefined' || !sessionId) return
  try {
    let list = getCustomerSessions()
    list = list.filter(s => s.sessionId !== sessionId)
    localStorage.setItem(CUSTOMER_SESSIONS_KEY, JSON.stringify(list))

    // If deleted session was the active one, clear active session
    if (getActiveSessionId() === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
      localStorage.removeItem('sunny_chat_history')
    }

    window.dispatchEvent(new CustomEvent('sunny_session_updated', { detail: { sessionId, deleted: true } }))
  } catch (e) {
    console.error('Failed to delete customer session:', e)
  }
}

export const switchCustomerActiveSession = (sessionId) => {
  if (typeof localStorage === 'undefined' || !sessionId) return
  localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
  window.dispatchEvent(new CustomEvent('sunny_switch_session', { detail: { sessionId } }))
}

export const openChatHistoryModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open_sunny_chat_history'))
  }
}
