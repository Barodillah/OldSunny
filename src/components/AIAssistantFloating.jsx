import { useState, useEffect, useRef } from 'react'
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineXMark,
  HiOutlineCalendar,
  HiOutlineCalculator,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineArrowsPointingOut,
  HiOutlineArrowsPointingIn
} from 'react-icons/hi2'
import { RiCustomerService2Line } from 'react-icons/ri'

export default function AIAssistantFloating({ prefilledAction, onClosePrefill }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Halo, saya Sunny AI Assistant. Ada yang dapat kami bantu seputar reservasi servis berkala, simulasi kredit transparan, atau layanan darurat 24 jam?',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [bubbleNote, setBubbleNote] = useState('Butuh bantuan? Tanyakan asisten 24/7 kami')
  const streamEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (isOpen) {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // ESC key to exit fullscreen or close chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false)
        } else if (isOpen) {
          setIsOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullScreen, isOpen])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY
      if (scrollPos < 350) {
        setBubbleNote('Pilih menu cepat atau ajukan pertanyaan')
      } else if (scrollPos >= 350 && scrollPos < 1100) {
        setBubbleNote('Siap bantu kalkulasi cicilan atau booking servis')
      } else {
        setBubbleNote('Layanan konsultasi online 24 jam siap siaga')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleOpenChat = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsFullScreen(true)
    }
    setIsOpen(true)
  }

  useEffect(() => {
    if (!prefilledAction) return

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        setIsFullScreen(true)
      }
      setIsOpen(true)
      const userMsg = `Saya ingin konsultasi mengenai: ${prefilledAction.title || prefilledAction}`
      let aiReply = `Baik, mengenai ${prefilledAction.title || prefilledAction}, sistem kami terintegrasi langsung dengan database bengkel dan inventaris dealer Sunny. Anda ingin kami bantu periksa jadwal terdekat atau estimasi biayanya?`

      if (prefilledAction.id === 'emergency') {
        aiReply = `PERINGATAN LAYANAN DARURAT: Tim teknisi darurat dan armada derek kami siaga 24 jam. Pastikan kendaraan Anda berada di area aman. Silakan ketik lokasi terkini Anda atau hubungi nomor darurat kami segera.`
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: userMsg },
        { sender: 'ai', text: aiReply },
      ])

      if (onClosePrefill) onClosePrefill()
    }, 0)

    return () => clearTimeout(timer)
  }, [prefilledAction, onClosePrefill])

  // Direct sending function for instant quick questions and standard input
  const sendQuery = (rawText) => {
    if (!rawText || !rawText.trim()) return
    const query = rawText.trim()
    setInputText('')
    setMessages((prev) => [...prev, { sender: 'user', text: query }])

    setTimeout(() => {
      let reply = `Terima kasih telah menanyakan tentang "${query}". Tim Sunny siap melayani kebutuhan Anda secara transparan.`
      const lower = query.toLowerCase()
      if (
        lower.includes('servis') ||
        lower.includes('bengkel') ||
        lower.includes('booking') ||
        lower.includes('jadwal')
      ) {
        reply = `Jadwal servis terdekat yang tersedia hari ini di Bengkel Resmi Sunny berada pada pukul 13:30 dan 15:00 WIB. Mekanik bersertifikasi kami siap melayani servis berkala, ganti oli resmi, dan tune-up tanpa antre.`
      } else if (
        lower.includes('kredit') ||
        lower.includes('cicilan') ||
        lower.includes('angsuran') ||
        lower.includes('harga') ||
        lower.includes('simulasi')
      ) {
        reply = `Simulasi kredit di Sunny 100% transparan: suku bunga resmi lembaga pembiayaan terdaftar OJK tanpa mark-up provisi tersembunyi. DP mulai 15% dengan tenor hingga 60 bulan. Silakan sebutkan model mobil yang ingin Anda simulasikan.`
      } else if (
        lower.includes('darurat') ||
        lower.includes('derek') ||
        lower.includes('mogok') ||
        lower.includes('bantuan')
      ) {
        reply = `PERINGATAN SIAGA DARURAT 24 JAM: Armada derek towing dan teknisi darurat kami langsung diterjunkan ke lokasi Anda. Hubungi Hotline Darurat di (021) 8899-SUNNY atau cantumkan nomor telepon & titik lokasi Anda saat ini.`
      } else if (
        lower.includes('suku cadang') ||
        lower.includes('sparepart') ||
        lower.includes('oli')
      ) {
        reply = `Semua suku cadang dan pelumas di Bengkel Sunny dijamin 100% Original Equipment Manufacturer (OEM) berbarcode resmi dengan garansi penggantian hingga 1 tahun.`
      } else if (
        lower.includes('rekening') ||
        lower.includes('legalitas') ||
        lower.includes('oknum') ||
        lower.includes('transparansi')
      ) {
        reply = `Jaminan Bebas Oknum: Seluruh transaksi pembayaran Sunny HANYA sah jika ditujukan ke Rekening Escrow / Virtual Account Resmi atas nama PT Dealer Sunny Indonesia. Dilarang keras mentransfer ke rekening pribadi staf manapun.`
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }])
    }, 400)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    sendQuery(inputText)
  }

  return (
    <div className={`floating-assistant-container ${isFullScreen ? 'container-fullscreen' : ''}`}>
      {/* Speech Hint Bubble */}
      {!isOpen && (
        <div className="assistant-bubble" onClick={handleOpenChat}>
          <span className="bubble-text">{bubbleNote}</span>
          <span className="bubble-arrow"></span>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="assistant-trigger-btn"
          aria-label="Buka Asisten Virtual Sunny"
          onClick={handleOpenChat}
        >
          <RiCustomerService2Line size={24} className="assistant-trigger-icon" />
          <span className="assistant-beacon"></span>
        </button>
      )}

      {/* Chat Window: Floating Popover or Fullscreen */}
      {isOpen && (
        <div className={`chat-flyout ${isFullScreen ? 'is-fullscreen' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-profile">
              <div className="chat-avatar">
                <RiCustomerService2Line size={20} />
              </div>
              <div className="chat-info-col">
                <h4 className="chat-name">Sunny AI Assistant</h4>
                <div className="chat-status-row">
                  <span className="chat-status-dot"></span>
                  <span className="chat-status-text">Siaga 24 Jam Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
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
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`stream-item ${m.sender === 'ai' ? 'item-ai' : 'item-user'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="item-label">
                      <HiOutlineSparkles size={13} />
                      <span>Sunny Assistant</span>
                    </div>
                  )}
                  <p className="item-text">{m.text}</p>
                </div>
              ))}
              <div ref={streamEndRef} />
            </div>
          </div>

          {/* Quick Questions Shortcut Bar */}
          <div className="chat-shortcut-bar">
            <div className="chat-shortcut-inner">
              <button
                type="button"
                className="shortcut-chip"
                onClick={() => sendQuery('Cek slot jadwal servis terdekat')}
              >
                <HiOutlineCalendar size={13} />
                <span>Booking Servis</span>
              </button>
              <button
                type="button"
                className="shortcut-chip"
                onClick={() => sendQuery('Simulasi angsuran kredit mobil baru')}
              >
                <HiOutlineCalculator size={13} />
                <span>Simulasi Kredit</span>
              </button>
              <button
                type="button"
                className="shortcut-chip shortcut-chip-emergency"
                onClick={() => sendQuery('Bantuan darurat mobil mogok & derek')}
              >
                <HiOutlinePhone size={13} />
                <span>Bantuan Darurat</span>
              </button>
              <button
                type="button"
                className="shortcut-chip"
                onClick={() => sendQuery('Info rekening resmi & legalitas transaksi')}
              >
                <HiOutlineShieldCheck size={13} />
                <span>Rekening Resmi</span>
              </button>
            </div>
          </div>

          {/* Message Input Row */}
          <form className="chat-input-row" onSubmit={handleSendMessage}>
            <div className="chat-input-inner">
              <input
                ref={inputRef}
                type="text"
                className="chat-input-field"
                placeholder="Tuliskan pertanyaan atau kendala Anda di sini..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                aria-label="Kirim pesan"
                title="Kirim pesan"
                disabled={!inputText.trim()}
              >
                <HiOutlinePaperAirplane size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
