import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineXMark,
  HiOutlineCalendar,
  HiOutlineCalculator,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineArrowsPointingOut,
  HiOutlineArrowsPointingIn,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineMapPin,
  HiOutlineClock
} from 'react-icons/hi2'
import { RiWhatsappLine, RiCarLine, RiPaintBrushLine } from 'react-icons/ri'
import { recordCustomerSession } from '../utils/sunnySessionStorage.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

const MASCOT_EXPRESSIONS = [
  {
    id: 'senang',
    label: 'Konsultasi Ramah',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad09424ada3f7.54954850.png',
    bubbleNote: 'Halo! Sampaikan kebutuhan mobil & nomor WhatsApp Anda, Sunny bantu tuntas!',
    badge: 'Konsultasi 24 Jam'
  },
  {
    id: 'berfikir',
    label: 'Hitung Kredit',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad09424acedb0.44157863.png',
    bubbleNote: 'Mau promo OTR & simulasi DP? Sebutkan tipe unit & tinggalkan no WhatsApp Anda!',
    badge: 'Kalkulator Kredit'
  },
  {
    id: 'kaget',
    label: 'Proteksi Transaksi',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad09424ad6a97.03373791.png',
    bubbleNote: 'Ingat ya, transaksi resmi HANYA ke PT Sun Star Prima Motor (BCA: 3425419999)!',
    badge: 'Anti-Penipuan'
  },
  {
    id: 'berempati',
    label: 'Bantuan Darurat',
    imageUrl: 'https://bewhy.id/wp-content/uploads/asset_6ad09424ad3533.63395686.png',
    bubbleNote: 'Kendaraan kendala di jalan? Tuliskan lokasi & no WhatsApp untuk bantuan darurat!',
    badge: 'Service on Road 24 Jam'
  }
]

const DEFAULT_QUICK_REPLIES = [
  { label: 'Booking Servis', query: 'Saya ingin booking jadwal servis berkala di bengkel resmi Sun Margahayu' },
  { label: 'Simulasi Kredit', query: 'Berapa simulasi angsuran & DP kredit mobil baru Mitsubishi?' },
  { label: 'Fasilitas Body Paint', query: 'Tolong jelaskan fasilitas oven dan rekanan asuransi body paint' },
  { label: 'Bantuan Darurat 24H', query: 'Kendaraan saya mengalami kendala darurat di jalan dan butuh Service on Road' },
  { label: 'Share Loc Darurat', query: 'Saya butuh bantuan Service on Road darurat, tolong pandu kirim titik lokasi GPS saya' },
  { label: 'Rekening Resmi BCA', query: 'Info rekening resmi transaksi PT Sun Star Prima Motor' },
  { label: 'Lokasi & Jam Buka', query: 'Dimana alamat showroom dan bengkel resmi serta jam operasionalnya?' }
]

const LOADING_STATUSES = [
  'Sunny sedang mengetik...',
  'Mengecek basis data bengkel & stok...',
  'Memproses rincian harga & simulasi...',
  'Menyiapkan rekomendasi terbaik...'
]

// Extract comprehensive client hardware, browser, screen, and location telemetry
const getClientTelemetry = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  let deviceType = 'desktop'
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile'
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet'

  let browser = 'Unknown'
  if (ua.includes('Edg/')) browser = 'Microsoft Edge'
  else if (ua.includes('Chrome/')) browser = 'Google Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari'
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox'
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'

  let os = 'Unknown'
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  const screenResolution = typeof window !== 'undefined'
    ? `${window.screen?.width || 0}x${window.screen?.height || 0}`
    : '1920x1080'

  let timezone = 'Asia/Jakarta'
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta'
  } catch {
    // fallback
  }

  const language = typeof navigator !== 'undefined' ? navigator.language : 'id-ID'
  const savedPhone = typeof localStorage !== 'undefined' ? (localStorage.getItem('sunny_customer_phone') || '') : ''
  const savedName = typeof localStorage !== 'undefined' ? (localStorage.getItem('sunny_customer_name') || '') : ''

  return {
    user_agent: ua,
    device_type: deviceType,
    browser,
    os,
    screen_resolution: screenResolution,
    timezone,
    language,
    customer_phone: savedPhone,
    customer_name: savedName
  }
}

export default function AIAssistantFloating({ prefilledAction, onClosePrefill }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [expressionIndex, setExpressionIndex] = useState(0)
  const [isBubbleVisible, setIsBubbleVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0)

  // Default showroom coordinates: Margahayu Bekasi Timur
  const DEFAULT_CENTER = { lat: -6.2508468, lng: 107.0245155 }

  // Map & Location State for Emergency Service on Road Share Loc
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [tempCoords, setTempCoords] = useState(DEFAULT_CENTER)
  const [tempAddress, setTempAddress] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const initialCoordsRef = useRef(DEFAULT_CENTER)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('sunny_ai_session_id') || `sunny_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  })

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('sunny_chat_history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        // Fallback to initial
      }
    }
    return [
      {
        id: 'init-1',
        sender: 'ai',
        text: 'Halo! Saya **Sunny**, asisten pintar 24 jam resmi dari **PT Sun Star Prima Motor - Margahayu** (Bekasi Timur).\n\nSilakan sampaikan **kebutuhan spesifik Anda** (misal: tipe unit impian, jadwal booking servis, keluhan bodi & cat, atau kendala darurat) serta **nomor WhatsApp aktif**, agar Sunny dan konsultan resmi kami dapat segera memberikan rincian promo, simulasi kredit, atau konfirmasi tercepat untuk Anda!',
        quickReplies: ['Pemesanan Mobil Baru', 'Booking Servis Berkala', 'Simulasi Kredit & DP', 'Fasilitas Body & Paint', 'Bantuan Darurat 24 Jam']
      }
    ]
  })

  const [currentQuickReplies, setCurrentQuickReplies] = useState(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && lastMsg.sender === 'ai' && Array.isArray(lastMsg.quickReplies) && lastMsg.quickReplies.length > 0) {
      return lastMsg.quickReplies
    }
    return DEFAULT_QUICK_REPLIES.map(q => q.label)
  })

  const [inputText, setInputText] = useState('')
  const streamEndRef = useRef(null)
  const inputRef = useRef(null)

  // Save session ID and local backup of chat history & record to customer history
  useEffect(() => {
    localStorage.setItem('sunny_ai_session_id', sessionId)
    localStorage.setItem('sunny_chat_history', JSON.stringify(messages))

    const lastMsg = messages[messages.length - 1]
    const snippet = lastMsg ? (lastMsg.text?.slice(0, 70) || '') : 'Percakapan dengan Sunny'
    recordCustomerSession({
      sessionId,
      snippet,
      messageCount: messages.length
    })
  }, [sessionId, messages])

  // Listen for customer selecting a past session from history modal
  useEffect(() => {
    const handleSwitchSession = (e) => {
      const newSessId = e.detail?.sessionId
      if (!newSessId) return

      setSessionId(newSessId)
      setIsLoading(true)
      fetch(`${API_BASE_URL}/ai/history?session_id=${newSessId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            const mapped = data.messages.map(m => ({
              id: `db-${m.id}`,
              sender: m.sender_type === 'user' ? 'user' : 'ai',
              text: m.message,
              quickReplies: m.quick_replies || [],
              actionTags: m.action_tags || {},
              savedLead: m.metadata?.saved_lead_id ? { id: m.metadata.saved_lead_id } : null
            }))
            setMessages(mapped)
            localStorage.setItem('sunny_chat_history', JSON.stringify(mapped))
          }
        })
        .catch(err => console.error('Error switching session:', err))
        .finally(() => {
          setIsLoading(false)
          setIsOpen(true)
        })
    }

    window.addEventListener('sunny_switch_session', handleSwitchSession)
    return () => window.removeEventListener('sunny_switch_session', handleSwitchSession)
  }, [])

  // Try restoring chat messages from database if session exists
  useEffect(() => {
    const existingSession = localStorage.getItem('sunny_ai_session_id')
    if (!existingSession) return

    fetch(`${API_BASE_URL}/ai/history?session_id=${existingSession}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          const mappedMessages = data.messages.map(m => ({
            id: `db-${m.id}`,
            sender: m.sender_type === 'user' ? 'user' : 'ai',
            text: m.message,
            quickReplies: m.quick_replies || [],
            actionTags: m.action_tags || {},
            savedLead: m.metadata?.saved_lead_id ? { id: m.metadata.saved_lead_id } : null
          }))

          setMessages(mappedMessages)
          const lastMsg = mappedMessages[mappedMessages.length - 1]
          if (lastMsg && lastMsg.quickReplies && lastMsg.quickReplies.length > 0) {
            setCurrentQuickReplies(lastMsg.quickReplies)
          }
        }
      })
      .catch(err => {
        // Silently use localStorage fallback
      })
  }, [])

  // Preload mascot avatar images
  useEffect(() => {
    MASCOT_EXPRESSIONS.forEach((expr) => {
      const img = new Image()
      img.src = expr.imageUrl
    })
  }, [])

  // Rotate mascot expression every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setExpressionIndex((prev) => (prev + 1) % MASCOT_EXPRESSIONS.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  // Rotate loading indicator status
  useEffect(() => {
    if (!isLoading) {
      setLoadingStatusIndex(0)
      return
    }
    const timer = setInterval(() => {
      setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [isLoading])

  const currentMascot = MASCOT_EXPRESSIONS[expressionIndex]

  // Check if emergency location has already been shared in the current session
  const hasSharedLocation = messages.some(
    (m) => !!m.locationData || (m.sender === 'user' && (m.text.includes('📍') || m.text.includes('GPS:') || m.text.includes('Service on Road darurat di titik')))
  )

  // Auto-scroll chat stream
  useEffect(() => {
    if (isOpen) {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  // ESC key to close/exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreen) setIsFullScreen(false)
        else if (isOpen) setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullScreen, isOpen])

  const handleOpenChat = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsFullScreen(true)
    }
    setIsOpen(true)
  }

  // Handle prefilled actions from other components/pages
  useEffect(() => {
    if (!prefilledAction) return

    const timer = setTimeout(() => {
      handleOpenChat()
      let promptQuery = ''
      if (typeof prefilledAction === 'string') {
        promptQuery = prefilledAction
      } else if (prefilledAction.id === 'emergency') {
        promptQuery = 'Halo Sunny, kendaraan saya mengalami kendala darurat di jalan dan membutuhkan bantuan Service on Road / Derek 24 jam.'
      } else if (prefilledAction.id === 'service_on_road') {
        promptQuery = 'Halo Sunny, tolong bantu informasi teknisi Service on Road untuk kendaraan saya.'
      } else if (prefilledAction.title) {
        promptQuery = `Halo Sunny, saya ingin konsultasi mengenai ${prefilledAction.title}`
      }

      if (promptQuery) {
        sendQueryToBackend(promptQuery)
      }

      if (onClosePrefill) onClosePrefill()
    }, 100)

    return () => clearTimeout(timer)
  }, [prefilledAction])

  // Clear chat conversation & close current session in DB
  const handleResetChat = () => {
    // Notify backend to close old session
    if (sessionId) {
      fetch(`${API_BASE_URL}/ai/session/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      }).catch(() => { })
    }

    const newSess = `sunny_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    setSessionId(newSess)
    const initial = [
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: 'Halo kembali! Percakapan baru telah dimulai.\n\nSampaikan **tujuan / kebutuhan Anda** (tipe kendaraan, tanggal booking servis, sparepart, atau kendala darurat) beserta **nomor WhatsApp aktif**, agar Sunny dapat segera mencocokkan solusi terbaik & menghubungkan Anda dengan konsultan resmi.',
        quickReplies: ['Pemesanan Mobil Baru', 'Booking Servis Berkala', 'Simulasi Kredit & DP', 'Fasilitas Body & Paint', 'Bantuan Darurat 24 Jam']
      }
    ]
    setMessages(initial)
    setCurrentQuickReplies(DEFAULT_QUICK_REPLIES.map(q => q.label))
    localStorage.setItem('sunny_ai_session_id', newSess)
    localStorage.setItem('sunny_chat_history', JSON.stringify(initial))
  }

  // Reverse geocoding helper using Nominatim
  const fetchAddress = async (lat, lng) => {
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      )
      if (res.ok) {
        const data = await res.json()
        const display = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setTempAddress(display)
        return display
      }
    } catch {
      const fallback = `Titik Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setTempAddress(fallback)
      return fallback
    } finally {
      setIsGeocoding(false)
    }
    return ''
  }

  // Handle Request Current Geolocation for Emergency Share Loc
  const handleRequestShareLocation = () => {
    setIsLocating(true)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Browser Anda belum mengizinkan deteksi GPS otomatis. Silakan tentukan titik langsung di peta.')
      initialCoordsRef.current = DEFAULT_CENTER
      setTempCoords(DEFAULT_CENTER)
      fetchAddress(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
      setIsMapModalOpen(true)
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        initialCoordsRef.current = coords
        setTempCoords(coords)
        fetchAddress(coords.lat, coords.lng)
        setIsLocating(false)
        setIsMapModalOpen(true)
      },
      () => {
        initialCoordsRef.current = DEFAULT_CENTER
        setTempCoords(DEFAULT_CENTER)
        fetchAddress(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
        setIsLocating(false)
        setIsMapModalOpen(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Initialize Leaflet Map inside Modal
  useEffect(() => {
    if (!isMapModalOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return

      const pinIcon = L.divIcon({
        className: 'sor-custom-marker',
        html: `
          <div class="marker-pin-outer">
            <div class="marker-pin-dot"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      })

      const startLat = initialCoordsRef.current.lat
      const startLng = initialCoordsRef.current.lng

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 16,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      const marker = L.marker([startLat, startLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map)

      marker.bindPopup('<b>Geser pin merah</b> ke posisi mobil Anda mogok/berada.').openPopup()

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setTempCoords({ lat: pos.lat, lng: pos.lng })
        fetchAddress(pos.lat, pos.lng)
      })

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setTempCoords({ lat, lng })
        fetchAddress(lat, lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [isMapModalOpen])

  // Send query to Laravel Backend OpenRouter integration with full client telemetry & optional location
  const sendQueryToBackend = useCallback(async (userText, locationData = null) => {
    if (!userText || !userText.trim() || isLoading) return
    const textToSend = userText.trim()
    setInputText('')

    // If query is explicitly asking to trigger share loc
    const lower = textToSend.toLowerCase()
    if (lower === 'share loc darurat' || lower === 'kirim titik lokasi' || lower.includes('pandu kirim titik lokasi')) {
      handleRequestShareLocation()
      return
    }

    // If user text contains a WhatsApp/phone number, save it immediately
    const phoneMatch = textToSend.match(/(?:\+?62|0)8[1-9][0-9]{7,11}/)
    if (phoneMatch) {
      try {
        localStorage.setItem('sunny_customer_phone', phoneMatch[0])
      } catch { }
    }

    const newUserMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      locationData: locationData || null
    }

    const updatedMessages = [...messages, newUserMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    // Build history payload for the backend
    const apiHistory = updatedMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    // Collect complete client telemetry (device, browser, screen, timezone, saved phone, etc.)
    const clientInfo = getClientTelemetry()

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          messages: apiHistory,
          client_info: clientInfo
        })
      })

      const data = await response.json()

      if (data.success && data.reply) {
        if (data.saved_lead) {
          try {
            if (data.saved_lead.phone) localStorage.setItem('sunny_customer_phone', data.saved_lead.phone)
            if (data.saved_lead.name) localStorage.setItem('sunny_customer_name', data.saved_lead.name)
          } catch { }
        }

        const newAiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          quickReplies: data.quick_replies || [],
          actionTags: data.action_tags || {},
          savedLead: data.saved_lead || null
        }
        setMessages(prev => [...prev, newAiMsg])
        if (data.quick_replies && data.quick_replies.length > 0) {
          setCurrentQuickReplies(data.quick_replies)
        }
      } else {
        const errorReply = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: data.message || 'Mohon maaf, sistem asisten kami sedang melakukan pembaruan data berkala. Anda dapat menghubungi CS Sales di **0813-1874-7300** atau Layanan Servis di **0822-1092-8822** untuk bantuan cepat.',
          actionTags: { whatsapp: true }
        }
        setMessages(prev => [...prev, errorReply])
      }
    } catch (err) {
      console.error('AI chat request failed:', err)
      const offlineReply = {
        id: `ai-off-${Date.now()}`,
        sender: 'ai',
        text: 'Koneksi ke server bantuan mengalami kendala sesaat. Jangan khawatir, tim siaga Mitsubishi Sun Margahayu selalu dapat dihubungi melalui CS Sales di **0813-1874-7300**, Layanan Servis di **0822-1092-8822**, atau telepon showroom **(021) 8834 7777**.',
        actionTags: { whatsapp: true, emergency: true }
      }
      setMessages(prev => [...prev, offlineReply])
    } finally {
      setIsLoading(false)
    }
  }, [messages, sessionId, isLoading])

  // Confirm Location Share: Send to chat & generate Dispatcher WA link
  const handleConfirmLocationShare = () => {
    const lat = tempCoords.lat.toFixed(6)
    const lng = tempCoords.lng.toFixed(6)
    const displayAddr = tempAddress || `${lat}, ${lng}`
    const gmapsUrl = `https://maps.google.com/?q=${lat},${lng}`

    const waMessage = [
      `*PERMINTAAN SERVICE ON ROAD - MITSUBISHI SUN MARGAHAYU*`,
      ``,
      `Halo Dispatcher Bengkel Resmi Mitsubishi Sun Star Prima Motor Margahayu, saya membutuhkan kedatangan teknisi darurat Service On Road untuk kendaraan mogok:`,
      ``,
      `• *Titik Koordinat:* ${lat}, ${lng}`,
      `• *Alamat / Patokan:* ${displayAddr}`,
      `• *Link Google Maps:* ${gmapsUrl}`,
      ``,
      `Mohon bantuan armada teknisi darurat ke lokasi saya. Terima kasih.`
    ].join('\n')
    const waUrl = `https://wa.me/6282210928822?text=${encodeURIComponent(waMessage)}`

    setIsMapModalOpen(false)

    const textMsg = `📍 Permintaan Service on Road darurat di titik: ${displayAddr} (GPS: ${lat}, ${lng}) - Peta: ${gmapsUrl}`

    sendQueryToBackend(textMsg, {
      lat,
      lng,
      address: displayAddr,
      gmapsUrl,
      waUrl
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    sendQueryToBackend(inputText)
  }

  // Format inline markdown (bold, italic, links)
  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-inline-link">$1</a>')
  }

  // Render markdown text blocks
  const renderMessageContent = (text) => {
    if (!text) return null
    const blocks = text.split('\n\n')

    return blocks.map((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      const isBulletList = lines.length > 0 && lines.every(l => l.startsWith('•') || l.startsWith('-') || /^\d+\./.test(l))

      if (isBulletList) {
        return (
          <ul key={idx} className="chat-msg-list">
            {lines.map((item, lIdx) => {
              const cleanItem = item.replace(/^[•\-\d+\.]\s*/, '')
              return (
                <li
                  key={lIdx}
                  dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }}
                />
              )
            })}
          </ul>
        )
      }

      return (
        <p
          key={idx}
          className="chat-msg-p"
          dangerouslySetInnerHTML={{ __html: formatInline(block.replace(/\n/g, '<br />')) }}
        />
      )
    })
  }

  return (
    <div className={`floating-assistant-container ${isOpen ? 'is-chat-open' : ''} ${isFullScreen ? 'container-fullscreen' : ''}`}>
      {/* Speech Hint Bubble with Mascot Expression & Close Button */}
      {!isOpen && isBubbleVisible && (
        <div
          className="assistant-bubble"
          onClick={handleOpenChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenChat()
          }}
        >
          <button
            type="button"
            className="bubble-close-btn"
            aria-label="Sembunyikan pesan bantuan"
            title="Sembunyikan pesan"
            onClick={(e) => {
              e.stopPropagation()
              setIsBubbleVisible(false)
            }}
          >
            <HiOutlineXMark size={14} />
          </button>
          <span className="bubble-text" key={currentMascot.id}>
            {currentMascot.bubbleNote}
          </span>
          <span className="bubble-arrow"></span>
        </div>
      )}

      {/* Floating Trigger Button with Mascot Avatar */}
      {!isOpen && (
        <button
          type="button"
          className="assistant-trigger-btn assistant-trigger-avatar"
          aria-label="Buka Asisten Virtual Sunny"
          onClick={handleOpenChat}
        >
          <div className="assistant-avatar-inner">
            <img
              src={currentMascot.imageUrl}
              alt={`Asisten Sunny - ${currentMascot.label}`}
              className="assistant-avatar-img"
              onError={(e) => {
                e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad09424ada3f7.54954850.png'
              }}
            />
          </div>
          <span className="assistant-beacon" title="Online 24 Jam Siaga"></span>
        </button>
      )}

      {/* Chat Flyout / Fullscreen Window */}
      {isOpen && (
        <div className={`chat-flyout ${isFullScreen ? 'is-fullscreen' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-profile">
              <div className="chat-avatar chat-avatar-mascot">
                <img
                  src={currentMascot.imageUrl}
                  alt={`Sunny Asisten - ${currentMascot.label}`}
                  className="chat-avatar-mascot-img"
                  onError={(e) => {
                    e.currentTarget.src = 'https://bewhy.id/wp-content/uploads/asset_6ad09424ada3f7.54954850.png'
                  }}
                />
              </div>
              <div className="chat-info-col">
                <h4 className="chat-name">Sunny AI Assistant</h4>
                <div className="chat-status-row">
                  <span className="chat-status-dot"></span>
                  <span className="chat-status-text">Siaga 24 Jam</span>
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-header-btn"
                title="Lihat riwayat obrolan Anda"
                aria-label="Riwayat chat saya"
                onClick={() => window.dispatchEvent(new CustomEvent('open_sunny_chat_history'))}
              >
                <HiOutlineClock size={17} />
              </button>
              <button
                type="button"
                className="chat-header-btn"
                title="Mulai percakapan baru"
                aria-label="Mulai percakapan baru"
                onClick={handleResetChat}
              >
                <HiOutlineArrowPath size={17} />
              </button>
              <button
                type="button"
                className="chat-header-btn chat-expand-btn"
                title={isFullScreen ? 'Perkecil jendela' : 'Perbesar ke layar penuh'}
                aria-label={isFullScreen ? 'Perkecil jendela' : 'Perbesar ke layar penuh'}
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? (
                  <HiOutlineArrowsPointingIn size={18} />
                ) : (
                  <HiOutlineArrowsPointingOut size={18} />
                )}
              </button>
              <button
                type="button"
                className="chat-header-btn"
                aria-label="Tutup percakapan"
                title="Tutup percakapan"
                onClick={() => {
                  setIsOpen(false)
                  setIsFullScreen(false)
                }}
              >
                <HiOutlineXMark size={19} />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="chat-stream">
            <div className="chat-stream-inner">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`stream-item ${m.sender === 'ai' ? 'item-ai' : 'item-user'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="item-label">
                      <HiOutlineSparkles size={13} />
                      <span>Sunny Asisten Resmi</span>
                    </div>
                  )}

                  <div className="item-text">
                    {renderMessageContent(m.text)}
                  </div>

                  {/* Location Pin Card if user shared location */}
                  {m.locationData && (
                    <div className="chat-location-preview-card">
                      <div className="location-card-header">
                        <HiOutlineMapPin size={16} />
                        <span>Titik Darurat Kendaraan (GPS)</span>
                      </div>
                      <div className="location-card-body">
                        <p className="location-card-address">{m.locationData.address}</p>
                        <span className="location-card-coords">
                          Koordinat: {m.locationData.lat}, {m.locationData.lng}
                        </span>
                      </div>
                      <div className="location-card-actions">
                        <a
                          href={m.locationData.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-act-btn btn-wa-dispatch"
                        >
                          <RiWhatsappLine size={15} />
                          <span>Kirim ke Dispatcher WA</span>
                        </a>
                        <a
                          href={m.locationData.gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-act-btn btn-maps-link"
                        >
                          <span>Buka Google Maps</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Lead Saved Badge if recorded */}
                  {m.savedLead && (
                    <div className="chat-lead-badge">
                      <HiOutlineCheckCircle size={15} />
                      <span>Data {m.savedLead.type || 'permintaan'} berhasil dicatat ke sistem dealer!</span>
                    </div>
                  )}

                  {/* Interactive Action Banners */}
                  {m.actionTags && (
                    <div className="chat-actions-container">
                      {(m.actionTags.emergency || (m.sender === 'ai' && (m.text.toLowerCase().includes('service on road') || m.text.toLowerCase().includes('darurat') || m.text.toLowerCase().includes('mogok')))) && (
                        <>
                          {!hasSharedLocation && (
                            <button
                              type="button"
                              className="chat-action-btn action-btn-shareloc"
                              onClick={handleRequestShareLocation}
                              disabled={isLocating}
                              title="Buka peta GPS & kirim titik lokasi darurat"
                            >
                              <HiOutlineMapPin size={16} />
                              <span>{isLocating ? 'Mencari Titik GPS...' : 'Share Loc Titik Darurat'}</span>
                            </button>
                          )}

                          <a
                            href="tel:082210928822"
                            className="chat-action-btn action-btn-emergency"
                          >
                            <HiOutlinePhone size={15} />
                            <span>Hotline Servis (0822-1092-8822)</span>
                          </a>
                        </>
                      )}

                      {m.actionTags.whatsapp && (
                        <a
                          href="https://wa.me/6281318747300?text=Halo%20Sunny%20Dealer%20Mitsubishi%20Sun%20Margahayu,%20saya%20ingin%20konsultasi%20langsung."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chat-action-btn action-btn-whatsapp"
                        >
                          <RiWhatsappLine size={16} />
                          <span>Chat WA CS Sales (0813-1874-7300)</span>
                        </a>
                      )}

                      {m.actionTags.simulasi_kredit && (
                        <button
                          type="button"
                          className="chat-action-btn action-btn-booking"
                          onClick={() => sendQueryToBackend('Tolong hitungkan simulasi kredit dengan DP 20% untuk unit terlaris')}
                        >
                          <HiOutlineCalculator size={15} />
                          <span>Minta Rincian Simulasi Kredit</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="chat-typing-bubble">
                  <div className="typing-dots">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <span className="typing-status-text">
                    {LOADING_STATUSES[loadingStatusIndex]}
                  </span>
                </div>
              )}

              <div ref={streamEndRef} />
            </div>
          </div>

          {/* Quick Reply Chips Bar */}
          <div className="chat-shortcut-bar">
            <div className="chat-shortcut-inner">
              {currentQuickReplies
                .filter(q => !hasSharedLocation || (!q.toLowerCase().includes('share loc') && !q.toLowerCase().includes('titik lokasi')))
                .map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`shortcut-chip ${q.toLowerCase().includes('darurat') || q.toLowerCase().includes('mogok') || q.toLowerCase().includes('share loc') ? 'shortcut-chip-emergency' : ''}`}
                    onClick={() => sendQueryToBackend(q)}
                    disabled={isLoading}
                  >
                    {q.toLowerCase().includes('share loc') || q.toLowerCase().includes('titik lokasi') ? (
                      <HiOutlineMapPin size={13} />
                    ) : q.toLowerCase().includes('servis') || q.toLowerCase().includes('booking') ? (
                      <HiOutlineCalendar size={13} />
                    ) : q.toLowerCase().includes('kredit') || q.toLowerCase().includes('dp') ? (
                      <HiOutlineCalculator size={13} />
                    ) : q.toLowerCase().includes('body') || q.toLowerCase().includes('cat') ? (
                      <RiPaintBrushLine size={13} />
                    ) : q.toLowerCase().includes('darurat') ? (
                      <HiOutlinePhone size={13} />
                    ) : (
                      <RiCarLine size={13} />
                    )}
                    <span>{q}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Chat Input Field */}
          <form className="chat-input-row" onSubmit={handleSendMessage}>
            <div className="chat-input-inner">
              {!hasSharedLocation && (
                <button
                  type="button"
                  className="chat-location-quick-btn"
                  title="Bagikan Titik Lokasi GPS Darurat (Service on Road)"
                  aria-label="Bagikan Lokasi GPS"
                  onClick={handleRequestShareLocation}
                  disabled={isLocating}
                >
                  <HiOutlineMapPin size={18} />
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                className="chat-input-field"
                placeholder="Tulis kebutuhan mobil & no WhatsApp (misal: Mau Pajero 0812xxx)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                aria-label="Kirim pesan"
                title="Kirim pesan"
                disabled={!inputText.trim() || isLoading}
              >
                <HiOutlinePaperAirplane size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Leaflet Map: Pilih & Konfirmasi Titik Koordinat Darurat */}
      {isMapModalOpen && (
        <div
          className="sor-modal-backdrop"
          onClick={() => setIsMapModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sor-map-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="map-modal-header">
              <div className="modal-title-col">
                <h3 className="modal-title">Bagikan Titik Lokasi Kendaraan</h3>
                <p className="modal-subtitle">
                  Klik pada peta atau geser pin merah ke posisi tepat mobil Anda mogok atau butuh bantuan darurat.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMapModalOpen(false)}
                aria-label="Tutup Peta"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="sor-map-container" ref={mapContainerRef} />

            <div className="map-modal-footer">
              <div className="footer-coords-info">
                <span className="coords-label">
                  {isGeocoding ? 'Mengambil nama jalan...' : 'Posisi Terpilih:'}
                </span>
                <p className="coords-address">
                  {tempAddress || `${tempCoords.lat.toFixed(5)}, ${tempCoords.lng.toFixed(5)}`}
                </p>
              </div>

              <div className="footer-btns-row">
                <button
                  type="button"
                  className="btn-map-cancel"
                  onClick={() => setIsMapModalOpen(false)}
                  aria-label="Batal memilih lokasi"
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-map-confirm"
                  onClick={handleConfirmLocationShare}
                >
                  <HiOutlineCheckCircle size={18} className="btn-confirm-icon" />
                  <span className="btn-confirm-text-full">Kirim Titik Lokasi ke Asisten</span>
                  <span className="btn-confirm-text-short">Kirim Titik Lokasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
