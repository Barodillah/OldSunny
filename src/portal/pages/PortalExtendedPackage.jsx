import { useState, useEffect, useCallback } from 'react'
import {
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2'
import { RiCarLine, RiShieldStarLine } from 'react-icons/ri'
import './PortalExtendedPackage.css'

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

// Tier Duration Labels
const TIER_DURATIONS = {
  '1XPM': '6 Bulan (1 Kali Perawatan)',
  '2XPM': '12 Bulan / 1 Tahun (2 Kali Perawatan)',
  '4XPM': '24 Bulan / 2 Tahun (4 Kali Perawatan)',
  '6XPM': '36 Bulan / 3 Tahun (6 Kali Perawatan)'
}

export default function PortalExtendedPackage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Main Data State
  const [pkgData, setPkgData] = useState({
    benefits: {
      cost_saving: 'Hingga 25% dibandingkan tanpa paket',
      free_services: [
        'Gratis penggantian suku cadang (sesuai ketentuan)',
        'Gratis biaya jasa (sesuai ketentuan)'
      ],
      additional_benefits: [
        'Perpanjangan garansi (item terbatas) selama 1 tahun atau 30.000 km',
        'Diskon hingga 30% untuk pembelian ban',
        'Diskon Rp50.000 untuk pembelian baterai',
        'Layanan 24 Hours Emergency Support (24HES) selama 1 tahun'
      ]
    },
    xpander_series: {
      include_car_variant: ['Xpander', 'Xpander Cross', 'Xforce'],
      effective_date: '2026-07-01',
      prices_excluding_vat: [
        { type: '1XPM', before: 1250000, after: 1250000, increase: 0 },
        { type: '2XPM', before: 2150000, after: 2150000, increase: 0 },
        { type: '4XPM', before: 4100000, after: 4100000, increase: 0 },
        { type: '6XPM', before: 6000000, after: 6000000, increase: 0 }
      ],
      prices_including_vat: [
        { type: '1XPM', before: 1387500, after: 1387500, increase: 0 },
        { type: '2XPM', before: 2386500, after: 2386500, increase: 0 },
        { type: '4XPM', before: 4551000, after: 4551000, increase: 0 },
        { type: '6XPM', before: 6660000, after: 6660000, increase: 0 }
      ]
    },
    pajero_sport: {
      effective_date: '2026-07-01',
      prices_excluding_vat: [
        { type: '1XPM', price: 2250000 },
        { type: '2XPM', price: 4200000 },
        { type: '4XPM', price: 8200000 },
        { type: '6XPM', price: 12000000 }
      ],
      prices_including_vat: [
        { type: '1XPM', price: 2497500 },
        { type: '2XPM', price: 4662000 },
        { type: '4XPM', price: 9142000 },
        { type: '6XPM', price: 13320000 }
      ]
    }
  })

  // Metadata State
  const [metaInfo, setMetaInfo] = useState({
    updated_at: null,
    updated_by: 'System'
  })

  // Active Tab: 'xpander' | 'pajero' | 'benefits'
  const [activeTab, setActiveTab] = useState('xpander')

  // Modals
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState(null) // { modelKey, type, priceInc, priceExc }
  const [newVariantInput, setNewVariantInput] = useState('')
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false)
  const [newBenefitInput, setNewBenefitInput] = useState('')
  const [benefitCategory, setBenefitCategory] = useState('additional') // 'free' | 'additional'
  const [isAddBenefitModalOpen, setIsAddBenefitModalOpen] = useState(false)

  // Fetch from Knowledge API
  const fetchPackageData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/extended_smart`, {
        headers: { Accept: 'application/json' }
      })
      const json = await res.json()
      if (json.success && json.data) {
        const raw = json.data.extended_smart_package || json.data
        setPkgData({
          benefits: {
            cost_saving: raw.benefits?.cost_saving || 'Hingga 25% dibandingkan tanpa paket',
            free_services: Array.isArray(raw.benefits?.free_services) ? raw.benefits.free_services : [],
            additional_benefits: Array.isArray(raw.benefits?.additional_benefits) ? raw.benefits.additional_benefits : []
          },
          xpander_series: {
            include_car_variant: Array.isArray(raw.xpander_series?.include_car_variant) ? raw.xpander_series.include_car_variant : ['Xpander', 'Xpander Cross', 'Xforce'],
            effective_date: raw.xpander_series?.effective_date || '2026-07-01',
            prices_excluding_vat: Array.isArray(raw.xpander_series?.prices_excluding_vat) ? raw.xpander_series.prices_excluding_vat : [],
            prices_including_vat: Array.isArray(raw.xpander_series?.prices_including_vat) ? raw.xpander_series.prices_including_vat : []
          },
          pajero_sport: {
            effective_date: raw.pajero_sport?.effective_date || '2026-07-01',
            prices_excluding_vat: Array.isArray(raw.pajero_sport?.prices_excluding_vat) ? raw.pajero_sport.prices_excluding_vat : [],
            prices_including_vat: Array.isArray(raw.pajero_sport?.prices_including_vat) ? raw.pajero_sport.prices_including_vat : []
          }
        })
        setMetaInfo({
          updated_at: json.updated_at || null,
          updated_by: json.updated_by || 'System'
        })
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error('Error fetching extended smart package knowledge:', err)
      setFeedback({
        type: 'error',
        message: 'Gagal memuat data knowledge dari server. Menampilkan data fallback bawaan.'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackageData()
  }, [fetchPackageData])

  // Save changes to API & Knowledge Base
  const handleSaveAll = async () => {
    setSaving(true)
    setFeedback(null)

    const payload = {
      extended_smart_package: pkgData
    }

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/extended_smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          data: payload,
          title: 'Program Extended SMART Package Mitsubishi Motors',
          category: 'aftersales_service',
          updated_by: 'Admin Portal Margahayu'
        })
      })

      const json = await res.json()
      if (json.success) {
        setHasUnsavedChanges(false)
        setMetaInfo({
          updated_at: json.updated_at || new Date().toISOString(),
          updated_by: json.updated_by || 'Admin Portal Margahayu'
        })
        setFeedback({
          type: 'success',
          message: 'Berhasil menyimpan perubahan Extended SMART Package! Data telah aktif di Sunny AI & formulir Booking Service.'
        })
      } else {
        setFeedback({
          type: 'error',
          message: json.message || 'Gagal menyimpan data ke database server.'
        })
      }
    } catch (err) {
      console.error('Error saving extended smart package:', err)
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan koneksi saat menyimpan data ke API.'
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset to default
  const handleResetToDefault = async () => {
    setSaving(true)
    setIsResetConfirmModalOpen(false)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/extended_smart/reset`, {
        method: 'POST',
        headers: { Accept: 'application/json' }
      })
      const json = await res.json()
      if (json.success) {
        await fetchPackageData()
        setFeedback({
          type: 'success',
          message: 'Data Extended SMART Package berhasil dikembalikan ke file default bawaan dealer.'
        })
      } else {
        setFeedback({
          type: 'error',
          message: json.message || 'Gagal mereset data default.'
        })
      }
    } catch (err) {
      console.error('Error resetting:', err)
      setFeedback({
        type: 'error',
        message: 'Gagal mereset data default karena gangguan jaringan.'
      })
    } finally {
      setSaving(false)
    }
  }

  // Open Edit Modal for a Tier
  const handleOpenEditTier = (modelKey, type) => {
    const isXpander = modelKey === 'xpander_series'
    const targetModel = pkgData[modelKey] || {}
    const incList = targetModel.prices_including_vat || []
    const excList = targetModel.prices_excluding_vat || []

    const incItem = incList.find(t => t.type === type) || {}
    const excItem = excList.find(t => t.type === type) || {}

    const incPrice = incItem.after ?? (incItem.price ?? 0)
    const excPrice = excItem.after ?? (excItem.price ?? 0)

    setEditingTier({
      modelKey,
      type,
      duration: TIER_DURATIONS[type] || '',
      priceInc: incPrice,
      priceExc: excPrice,
      isXpander
    })
  }

  // Synchronized price input handlers (PPN 11% auto-sync)
  const handlePriceIncChange = (val) => {
    if (val === '') {
      setEditingTier(prev => ({ ...prev, priceInc: '', priceExc: '' }))
      return
    }
    const num = parseFloat(val)
    if (isNaN(num)) {
      setEditingTier(prev => ({ ...prev, priceInc: val }))
      return
    }
    const calcExc = Math.round(num / 1.11)
    setEditingTier(prev => ({
      ...prev,
      priceInc: val,
      priceExc: calcExc
    }))
  }

  const handlePriceExcChange = (val) => {
    if (val === '') {
      setEditingTier(prev => ({ ...prev, priceExc: '', priceInc: '' }))
      return
    }
    const num = parseFloat(val)
    if (isNaN(num)) {
      setEditingTier(prev => ({ ...prev, priceExc: val }))
      return
    }
    const calcInc = Math.round(num * 1.11)
    setEditingTier(prev => ({
      ...prev,
      priceExc: val,
      priceInc: calcInc
    }))
  }

  // Save Edited Tier
  const handleSaveTierModal = (e) => {
    e.preventDefault()
    if (!editingTier) return

    const { modelKey, type, priceInc, priceExc } = editingTier
    const parsedInc = parseInt(priceInc, 10) || 0
    const parsedExc = parseInt(priceExc, 10) || 0

    setPkgData(prev => {
      const model = { ...prev[modelKey] }

      // Update Including VAT
      const newInc = (model.prices_including_vat || []).map(item => {
        if (item.type === type) {
          if (item.after !== undefined) {
            return { ...item, after: parsedInc }
          }
          return { ...item, price: parsedInc }
        }
        return item
      })

      // Update Excluding VAT
      const newExc = (model.prices_excluding_vat || []).map(item => {
        if (item.type === type) {
          if (item.after !== undefined) {
            return { ...item, after: parsedExc }
          }
          return { ...item, price: parsedExc }
        }
        return item
      })

      return {
        ...prev,
        [modelKey]: {
          ...model,
          prices_including_vat: newInc,
          prices_excluding_vat: newExc
        }
      }
    })

    setHasUnsavedChanges(true)
    setEditingTier(null)
  }

  // Add Variant (e.g. to Xpander Series)
  const handleAddVariant = (e) => {
    e.preventDefault()
    const trimmed = newVariantInput.trim()
    if (!trimmed) return

    setPkgData(prev => {
      const current = prev.xpander_series.include_car_variant || []
      if (current.includes(trimmed)) return prev
      return {
        ...prev,
        xpander_series: {
          ...prev.xpander_series,
          include_car_variant: [...current, trimmed]
        }
      }
    })

    setNewVariantInput('')
    setIsAddVariantModalOpen(false)
    setHasUnsavedChanges(true)
  }

  // Remove Variant
  const handleRemoveVariant = (variantName) => {
    setPkgData(prev => ({
      ...prev,
      xpander_series: {
        ...prev.xpander_series,
        include_car_variant: (prev.xpander_series.include_car_variant || []).filter(v => v !== variantName)
      }
    }))
    setHasUnsavedChanges(true)
  }

  // Update Effective Date
  const handleEffectiveDateChange = (modelKey, value) => {
    setPkgData(prev => ({
      ...prev,
      [modelKey]: {
        ...prev[modelKey],
        effective_date: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  // Update Cost Saving
  const handleCostSavingChange = (value) => {
    setPkgData(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        cost_saving: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  // Add Benefit Item
  const handleAddBenefit = (e) => {
    e.preventDefault()
    const trimmed = newBenefitInput.trim()
    if (!trimmed) return

    setPkgData(prev => {
      const key = benefitCategory === 'free' ? 'free_services' : 'additional_benefits'
      const current = prev.benefits[key] || []
      return {
        ...prev,
        benefits: {
          ...prev.benefits,
          [key]: [...current, trimmed]
        }
      }
    })

    setNewBenefitInput('')
    setIsAddBenefitModalOpen(false)
    setHasUnsavedChanges(true)
  }

  // Remove Benefit Item
  const handleRemoveBenefit = (category, index) => {
    setPkgData(prev => {
      const key = category === 'free' ? 'free_services' : 'additional_benefits'
      const list = [...(prev.benefits[key] || [])]
      list.splice(index, 1)
      return {
        ...prev,
        benefits: {
          ...prev.benefits,
          [key]: list
        }
      }
    })
    setHasUnsavedChanges(true)
  }

  if (loading) {
    return (
      <div className="portal-ext-page">
        <div className="ext-loading-state">
          <HiOutlineArrowPath size={36} className="spin-slow text-red" />
          <p>Memuat basis data Extended SMART Package...</p>
        </div>
      </div>
    )
  }

  const xpanderIncList = pkgData.xpander_series?.prices_including_vat || []
  const pajeroIncList = pkgData.pajero_sport?.prices_including_vat || []

  return (
    <div className="portal-ext-page">
      {/* Header Bar */}
      <div className="ext-header-row">
        <div className="ext-title-group">
          <div className="ext-title-badge">
            <HiOutlineShieldCheck size={16} />
            <span>Public Knowledge — Extended SMART Package</span>
          </div>
          <h1>Manajemen Extended SMART Package Mitsubishi Motors</h1>
          <p>
            Kelola program perpanjangan paket servis berkala resmi Mitsubishi Motors untuk unit dengan KM &gt;= 50.000 (Xpander Series, Xforce &amp; Pajero Sport), rincian harga per tier (1XPM s/d 6XPM), benefit hemat s/d 25%, dan garansi tambahan. Data langsung tersinkronisasi ke basis pengetahuan <strong>Sunny AI</strong> dan formulir <strong>Booking Service</strong>.
          </p>
        </div>

        <div className="ext-header-actions">
          <a
            href="/booking-service"
            target="_blank"
            rel="noopener noreferrer"
            className="ext-btn-preview"
            title="Buka halaman publik Booking Service di tab baru"
          >
            <HiOutlineArrowTopRightOnSquare size={16} />
            <span>Lihat Form Booking</span>
          </a>

          <button
            type="button"
            className="ext-btn-reset"
            onClick={() => setIsResetConfirmModalOpen(true)}
            disabled={saving}
            title="Kembalikan semua data paket ke file default bawaan dealer"
          >
            <HiOutlineArrowPath size={16} className={saving ? 'spin-slow' : ''} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            className="ext-btn-save"
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
                <span>Simpan Perubahan Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="ext-unsaved-banner">
          <div className="ext-unsaved-content">
            <HiOutlineExclamationTriangle size={22} className="ext-unsaved-icon" />
            <div>
              <strong>Ada perubahan yang belum disimpan!</strong>
              <p>Perubahan yang Anda lakukan hanya tersimpan di sesi lokal ini. Klik tombol merah "Simpan Perubahan Package" di atas untuk memperbarui website publik dan basis pengetahuan Sunny AI.</p>
            </div>
          </div>
          <button type="button" className="ext-btn-quick-save" onClick={handleSaveAll} disabled={saving}>
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`ext-feedback-banner ext-feedback-${feedback.type}`}>
          <div className="ext-feedback-icon">
            {feedback.type === 'success' ? <HiOutlineCheck size={20} /> : <HiOutlineExclamationTriangle size={20} />}
          </div>
          <div className="ext-feedback-text">{feedback.message}</div>
          <button type="button" className="ext-feedback-close" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="ext-tabs-bar">
        <button
          type="button"
          className={`ext-tab-btn ${activeTab === 'xpander' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('xpander')}
        >
          <RiCarLine size={18} />
          <span>Xpander Series &amp; Xforce</span>
          <span className="ext-tab-badge">{pkgData.xpander_series?.include_car_variant?.length || 3} Model</span>
        </button>

        <button
          type="button"
          className={`ext-tab-btn ${activeTab === 'pajero' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('pajero')}
        >
          <RiShieldStarLine size={18} />
          <span>Pajero Sport</span>
          <span className="ext-tab-badge">4 Tiers</span>
        </button>

        <button
          type="button"
          className={`ext-tab-btn ${activeTab === 'benefits' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          <HiOutlineSparkles size={18} />
          <span>Benefit &amp; Keuntungan Paket</span>
          <span className="ext-tab-badge">
            {(pkgData.benefits?.free_services?.length || 0) + (pkgData.benefits?.additional_benefits?.length || 0)} Poin
          </span>
        </button>
      </div>

      {/* TAB 1: XPANDER SERIES & XFORCE */}
      {activeTab === 'xpander' && (
        <div className="ext-tab-content">
          {/* Settings Bar */}
          <div className="ext-card ext-meta-card">
            <div className="ext-meta-header">
              <div>
                <h3 className="ext-card-title">Ketentuan &amp; Kompatibilitas Xpander Series</h3>
                <p className="ext-card-desc">
                  Model kendaraan yang berhak mendapatkan penawaran Extended SMART Package saat servis berkala di atas 50.000 KM.
                </p>
              </div>

              <div className="ext-date-input-group">
                <label>
                  <HiOutlineCalendar size={15} />
                  <span>Tanggal Efektif:</span>
                </label>
                <input
                  type="date"
                  value={pkgData.xpander_series?.effective_date || '2026-07-01'}
                  onChange={(e) => handleEffectiveDateChange('xpander_series', e.target.value)}
                  className="ext-date-input"
                />
              </div>
            </div>

            {/* Model Variant Tags */}
            <div className="ext-variant-section">
              <span className="ext-variant-label">Varian Kendaraan Termasuk:</span>
              <div className="ext-variant-chips">
                {(pkgData.xpander_series?.include_car_variant || []).map((variant) => (
                  <span key={variant} className="ext-variant-chip">
                    <HiOutlineTag size={14} />
                    <span>{variant}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant)}
                      title={`Hapus varian ${variant}`}
                      className="ext-chip-remove"
                    >
                      <HiOutlineXMark size={13} />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddVariantModalOpen(true)}
                  className="ext-btn-add-chip"
                >
                  <HiOutlinePlus size={14} />
                  <span>Tambah Varian</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tiers Pricing Grid */}
          <div className="ext-tiers-header-row">
            <div>
              <h3 className="ext-section-heading">Daftar Paket &amp; Tarif Resmi Xpander Series</h3>
              <p className="ext-section-sub">Klik tombol "Edit Tarif" untuk mengubah harga satuan sebelum atau sesudah PPN.</p>
            </div>
            <span className="ext-vat-note">Tarif sudah termasuk PPN 11%</span>
          </div>

          <div className="ext-tiers-grid">
            {xpanderIncList.map((tier) => {
              const excItem = (pkgData.xpander_series?.prices_excluding_vat || []).find(x => x.type === tier.type) || {}
              const isRecommended = tier.type === '2XPM'
              const priceInc = tier.after ?? (tier.price ?? 0)
              const priceExc = excItem.after ?? (excItem.price ?? 0)

              return (
                <div key={tier.type} className={`ext-tier-card ${isRecommended ? 'is-recommended' : ''}`}>
                  {isRecommended && (
                    <div className="ext-tier-recommended-ribbon">
                      <HiOutlineSparkles size={13} />
                      <span>Rekomendasi</span>
                    </div>
                  )}

                  <div className="ext-tier-top">
                    <span className="ext-tier-code">{tier.type}</span>
                    <span className="ext-tier-duration">{TIER_DURATIONS[tier.type] || 'Periode Servis'}</span>
                  </div>

                  <div className="ext-tier-main-price">
                    <span className="ext-price-label">Tarif Termasuk PPN</span>
                    <div className="ext-price-val">{formatIDR(priceInc)}</div>
                  </div>

                  <div className="ext-tier-exc-price">
                    <span>Sebelum PPN:</span>
                    <strong>{formatIDR(priceExc)}</strong>
                  </div>

                  <div className="ext-tier-actions">
                    <button
                      type="button"
                      className="ext-btn-edit-tier"
                      onClick={() => handleOpenEditTier('xpander_series', tier.type)}
                    >
                      <HiOutlinePencilSquare size={15} />
                      <span>Edit Tarif</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Simulator Preview */}
          <div className="ext-card ext-simulator-card">
            <div className="ext-sim-header">
              <div className="ext-sim-title-group">
                <HiOutlineWrenchScrewdriver size={20} className="text-red" />
                <div>
                  <h4 className="ext-sim-title">Simulasi Tampilan di Formulir Booking Service</h4>
                  <p className="ext-sim-desc">Pratinjau langsung bagaimana kartu ini ditampilkan kepada konsumen di halaman /booking-service saat KM &gt;= 50.000.</p>
                </div>
              </div>
              <span className="ext-sim-badge">Live Preview</span>
            </div>

            <div className="ext-sim-box">
              <div className="ext-sim-card-inner">
                <div className="ext-sim-pkg-header">
                  <div className="ext-sim-icon-circle">
                    <HiOutlineShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="ext-sim-title-line">
                      <h5>Daftarkan Extended SMART Package Xpander</h5>
                      <span className="ext-sim-save-tag">{pkgData.benefits?.cost_saving || 'Hemat s/d 25%'}</span>
                    </div>
                    <p>Perpanjang paket service berkala resmi Mitsubishi setelah 50.000 KM agar bebas kenaikan harga suku cadang &amp; jasa.</p>
                  </div>
                </div>

                <div className="ext-sim-info-strip">
                  <span>⏱ 1XPM berlaku untuk 6 bulan</span>
                  <span>Tarif Resmi (Termasuk PPN)</span>
                </div>

                <div className="ext-sim-tiers-row">
                  {xpanderIncList.map((tier) => (
                    <div key={tier.type} className={`ext-sim-tier-pill ${tier.type === '2XPM' ? 'is-selected' : ''}`}>
                      {tier.type === '2XPM' && <span className="ext-sim-pill-rec">Rekomendasi</span>}
                      <span className="ext-sim-pill-label">{tier.type}</span>
                      <span className="ext-sim-pill-price">{formatIDR(tier.after ?? tier.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAJERO SPORT */}
      {activeTab === 'pajero' && (
        <div className="ext-tab-content">
          {/* Settings Bar */}
          <div className="ext-card ext-meta-card">
            <div className="ext-meta-header">
              <div>
                <h3 className="ext-card-title">Ketentuan &amp; Kompatibilitas Pajero Sport</h3>
                <p className="ext-card-desc">
                  Berlaku untuk seluruh lini varian Mitsubishi Pajero Sport (Dakar 4x4, Dakar 4x2, Exceed, GLX) dengan KM &gt;= 50.000.
                </p>
              </div>

              <div className="ext-date-input-group">
                <label>
                  <HiOutlineCalendar size={15} />
                  <span>Tanggal Efektif:</span>
                </label>
                <input
                  type="date"
                  value={pkgData.pajero_sport?.effective_date || '2026-07-01'}
                  onChange={(e) => handleEffectiveDateChange('pajero_sport', e.target.value)}
                  className="ext-date-input"
                />
              </div>
            </div>

            <div className="ext-variant-section">
              <span className="ext-variant-label">Kompatibilitas:</span>
              <div className="ext-variant-chips">
                <span className="ext-variant-chip permanent">
                  <HiOutlineTag size={14} />
                  <span>Pajero Sport Dakar Ultimate 4x4</span>
                </span>
                <span className="ext-variant-chip permanent">
                  <HiOutlineTag size={14} />
                  <span>Pajero Sport Dakar 4x2</span>
                </span>
                <span className="ext-variant-chip permanent">
                  <HiOutlineTag size={14} />
                  <span>Pajero Sport Exceed &amp; GLX</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tiers Pricing Grid */}
          <div className="ext-tiers-header-row">
            <div>
              <h3 className="ext-section-heading">Daftar Paket &amp; Tarif Resmi Pajero Sport</h3>
              <p className="ext-section-sub">Tarif resmi perawatan berkala mesin diesel MIVEC Turbo Pajero Sport.</p>
            </div>
            <span className="ext-vat-note">Tarif sudah termasuk PPN 11%</span>
          </div>

          <div className="ext-tiers-grid">
            {pajeroIncList.map((tier) => {
              const excItem = (pkgData.pajero_sport?.prices_excluding_vat || []).find(x => x.type === tier.type) || {}
              const isRecommended = tier.type === '2XPM'
              const priceInc = tier.price ?? (tier.after ?? 0)
              const priceExc = excItem.price ?? (excItem.after ?? 0)

              return (
                <div key={tier.type} className={`ext-tier-card ${isRecommended ? 'is-recommended' : ''}`}>
                  {isRecommended && (
                    <div className="ext-tier-recommended-ribbon">
                      <HiOutlineSparkles size={13} />
                      <span>Rekomendasi</span>
                    </div>
                  )}

                  <div className="ext-tier-top">
                    <span className="ext-tier-code">{tier.type}</span>
                    <span className="ext-tier-duration">{TIER_DURATIONS[tier.type] || 'Periode Servis'}</span>
                  </div>

                  <div className="ext-tier-main-price">
                    <span className="ext-price-label">Tarif Termasuk PPN</span>
                    <div className="ext-price-val">{formatIDR(priceInc)}</div>
                  </div>

                  <div className="ext-tier-exc-price">
                    <span>Sebelum PPN:</span>
                    <strong>{formatIDR(priceExc)}</strong>
                  </div>

                  <div className="ext-tier-actions">
                    <button
                      type="button"
                      className="ext-btn-edit-tier"
                      onClick={() => handleOpenEditTier('pajero_sport', tier.type)}
                    >
                      <HiOutlinePencilSquare size={15} />
                      <span>Edit Tarif</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Simulator Preview Pajero */}
          <div className="ext-card ext-simulator-card">
            <div className="ext-sim-header">
              <div className="ext-sim-title-group">
                <HiOutlineWrenchScrewdriver size={20} className="text-red" />
                <div>
                  <h4 className="ext-sim-title">Simulasi Tampilan Pajero Sport di Booking Service</h4>
                  <p className="ext-sim-desc">Pratinjau pilihan paket servis resmi saat konsumen memilih kendaraan Pajero Sport.</p>
                </div>
              </div>
              <span className="ext-sim-badge">Live Preview</span>
            </div>

            <div className="ext-sim-box">
              <div className="ext-sim-card-inner">
                <div className="ext-sim-pkg-header">
                  <div className="ext-sim-icon-circle">
                    <HiOutlineShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="ext-sim-title-line">
                      <h5>Daftarkan Extended SMART Package Pajero Sport</h5>
                      <span className="ext-sim-save-tag">{pkgData.benefits?.cost_saving || 'Hemat s/d 25%'}</span>
                    </div>
                    <p>Perpanjang paket service berkala resmi Mitsubishi setelah 50.000 KM agar bebas kenaikan harga suku cadang &amp; jasa.</p>
                  </div>
                </div>

                <div className="ext-sim-info-strip">
                  <span>⏱ 1XPM berlaku untuk 6 bulan</span>
                  <span>Tarif Resmi (Termasuk PPN)</span>
                </div>

                <div className="ext-sim-tiers-row">
                  {pajeroIncList.map((tier) => (
                    <div key={tier.type} className={`ext-sim-tier-pill ${tier.type === '2XPM' ? 'is-selected' : ''}`}>
                      {tier.type === '2XPM' && <span className="ext-sim-pill-rec">Rekomendasi</span>}
                      <span className="ext-sim-pill-label">{tier.type}</span>
                      <span className="ext-sim-pill-price">{formatIDR(tier.price ?? tier.after)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BENEFITS & VALUE PROPOSITION */}
      {activeTab === 'benefits' && (
        <div className="ext-tab-content">
          {/* Cost Saving Hero Card */}
          <div className="ext-card ext-cost-card">
            <div className="ext-cost-inner">
              <div className="ext-cost-icon-box">
                <HiOutlineCurrencyDollar size={28} />
              </div>
              <div className="ext-cost-text">
                <label className="ext-cost-label">Headline Penghematan Biaya (Cost Saving)</label>
                <input
                  type="text"
                  value={pkgData.benefits?.cost_saving || ''}
                  onChange={(e) => handleCostSavingChange(e.target.value)}
                  className="ext-cost-input"
                  placeholder="Contoh: Hingga 25% dibandingkan tanpa paket"
                />
                <span className="ext-cost-help">Teks ini akan dijadikan badge utama di formulir booking dan ditonjolkan oleh asisten AI Sunny.</span>
              </div>
            </div>
          </div>

          <div className="ext-benefits-grid">
            {/* Free Services Column */}
            <div className="ext-card ext-benefit-col-card">
              <div className="ext-benefit-col-header">
                <div>
                  <h4 className="ext-col-title">Gratis Layanan Servis (Free Services)</h4>
                  <p className="ext-col-desc">Komponen wajib yang dibebaskan dari biaya selama masa aktif paket.</p>
                </div>
                <button
                  type="button"
                  className="ext-btn-add-benefit"
                  onClick={() => {
                    setBenefitCategory('free')
                    setIsAddBenefitModalOpen(true)
                  }}
                >
                  <HiOutlinePlus size={15} />
                  <span>Tambah Poin</span>
                </button>
              </div>

              <div className="ext-benefit-items-list">
                {(pkgData.benefits?.free_services || []).map((item, idx) => (
                  <div key={idx} className="ext-benefit-item-row">
                    <div className="ext-benefit-check-circle">
                      <HiOutlineCheck size={14} />
                    </div>
                    <span className="ext-benefit-item-text">{item}</span>
                    <button
                      type="button"
                      className="ext-btn-remove-benefit"
                      onClick={() => handleRemoveBenefit('free', idx)}
                      title="Hapus poin ini"
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Benefits Column */}
            <div className="ext-card ext-benefit-col-card">
              <div className="ext-benefit-col-header">
                <div>
                  <h4 className="ext-col-title">Keuntungan &amp; Proteksi Tambahan</h4>
                  <p className="ext-col-desc">Nilai plus seperti garansi mesin/transmisi, diskon ban, aki, dan 24HES.</p>
                </div>
                <button
                  type="button"
                  className="ext-btn-add-benefit"
                  onClick={() => {
                    setBenefitCategory('additional')
                    setIsAddBenefitModalOpen(true)
                  }}
                >
                  <HiOutlinePlus size={15} />
                  <span>Tambah Poin</span>
                </button>
              </div>

              <div className="ext-benefit-items-list">
                {(pkgData.benefits?.additional_benefits || []).map((item, idx) => (
                  <div key={idx} className="ext-benefit-item-row">
                    <div className="ext-benefit-check-circle secondary">
                      <HiOutlineSparkles size={14} />
                    </div>
                    <span className="ext-benefit-item-text">{item}</span>
                    <button
                      type="button"
                      className="ext-btn-remove-benefit"
                      onClick={() => handleRemoveBenefit('additional', idx)}
                      title="Hapus poin ini"
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Sunny Integration Info Card */}
          <div className="ext-card ext-ai-info-card">
            <div className="ext-ai-info-header">
              <HiOutlineInformationCircle size={22} className="text-red" />
              <div>
                <h4>Koneksi Otomatis ke Basis Pengetahuan Sunny AI</h4>
                <p>
                  Setiap perubahan tarif, model varian, dan poin benefit di atas secara otomatis diolah oleh <code>SunnyAiService.php</code> sebagai referensi kecerdasan buatan. Sunny AI akan menjawab pertanyaan konsumen seputar biaya paket Extended SMART secara instan dan akurat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TIER PRICE */}
      {editingTier && (
        <div className="ext-modal-backdrop" onClick={() => setEditingTier(null)}>
          <div className="ext-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ext-modal-header">
              <div>
                <h3 className="ext-modal-title">Edit Tarif Tier {editingTier.type}</h3>
                <span className="ext-modal-sub">
                  {editingTier.modelKey === 'xpander_series' ? 'Xpander Series & Xforce' : 'Pajero Sport'} — {editingTier.duration}
                </span>
              </div>
              <button type="button" className="ext-modal-close" onClick={() => setEditingTier(null)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTierModal} className="ext-modal-form">
              <div className="ext-form-group">
                <label className="ext-form-label">
                  Tarif Termasuk PPN 11% (Rupiah): <span className="req">*</span>
                </label>
                <div className="ext-input-price-wrapper">
                  <span className="ext-currency-prefix">Rp</span>
                  <input
                    type="number"
                    value={editingTier.priceInc}
                    onChange={(e) => handlePriceIncChange(e.target.value)}
                    required
                    className="ext-modal-input"
                    placeholder="Contoh: 1387500"
                  />
                </div>
                <span className="ext-input-preview-idr">
                  Format: <strong>{formatIDR(editingTier.priceInc)}</strong>
                </span>
              </div>

              <div className="ext-form-group">
                <label className="ext-form-label">
                  Tarif Sebelum PPN (Rupiah):
                </label>
                <div className="ext-input-price-wrapper">
                  <span className="ext-currency-prefix">Rp</span>
                  <input
                    type="number"
                    value={editingTier.priceExc}
                    onChange={(e) => handlePriceExcChange(e.target.value)}
                    className="ext-modal-input"
                    placeholder="Contoh: 1250000"
                  />
                </div>
                <span className="ext-input-preview-idr">
                  Format: <strong>{formatIDR(editingTier.priceExc)}</strong>
                </span>
              </div>

              <div className="ext-modal-actions">
                <button type="button" className="ext-btn-cancel" onClick={() => setEditingTier(null)}>
                  Batal
                </button>
                <button type="submit" className="ext-btn-submit">
                  Terapkan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VARIANT */}
      {isAddVariantModalOpen && (
        <div className="ext-modal-backdrop" onClick={() => setIsAddVariantModalOpen(false)}>
          <div className="ext-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ext-modal-header">
              <h3 className="ext-modal-title">Tambah Varian Mobil</h3>
              <button type="button" className="ext-modal-close" onClick={() => setIsAddVariantModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="ext-modal-form">
              <div className="ext-form-group">
                <label className="ext-form-label">Nama Model / Varian Mobil:</label>
                <input
                  type="text"
                  value={newVariantInput}
                  onChange={(e) => setNewVariantInput(e.target.value)}
                  placeholder="Contoh: Xforce Exceed, Xpander Ultimate, dll."
                  required
                  autoFocus
                  className="ext-modal-input"
                />
              </div>

              <div className="ext-modal-actions">
                <button type="button" className="ext-btn-cancel" onClick={() => setIsAddVariantModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="ext-btn-submit">
                  Tambahkan Varian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BENEFIT POINT */}
      {isAddBenefitModalOpen && (
        <div className="ext-modal-backdrop" onClick={() => setIsAddBenefitModalOpen(false)}>
          <div className="ext-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ext-modal-header">
              <h3 className="ext-modal-title">
                {benefitCategory === 'free' ? 'Tambah Gratis Layanan Servis' : 'Tambah Keuntungan & Proteksi Tambahan'}
              </h3>
              <button type="button" className="ext-modal-close" onClick={() => setIsAddBenefitModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBenefit} className="ext-modal-form">
              <div className="ext-form-group">
                <label className="ext-form-label">Rincian Benefit:</label>
                <textarea
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  placeholder="Tuliskan keuntungan benefit secara jelas..."
                  required
                  rows={3}
                  autoFocus
                  className="ext-modal-textarea"
                />
              </div>

              <div className="ext-modal-actions">
                <button type="button" className="ext-btn-cancel" onClick={() => setIsAddBenefitModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="ext-btn-submit">
                  Tambahkan Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM RESET */}
      {isResetConfirmModalOpen && (
        <div className="ext-modal-backdrop" onClick={() => setIsResetConfirmModalOpen(false)}>
          <div className="ext-modal-card ext-modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="ext-modal-header">
              <div className="ext-danger-title-row">
                <HiOutlineExclamationTriangle size={22} className="text-red" />
                <h3 className="ext-modal-title">Konfirmasi Reset Default</h3>
              </div>
              <button type="button" className="ext-modal-close" onClick={() => setIsResetConfirmModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <p className="ext-modal-warning-text">
              Apakah Anda yakin ingin mengembalikan seluruh konfigurasi Extended SMART Package ke file bawaan awal dealer (<code>knowledge/extended_smart_package.json</code>)?
              <br /><br />
              Semua penyesuaian tarif lokal dan penambahan poin benefit akan ditimpa kembali.
            </p>

            <div className="ext-modal-actions">
              <button type="button" className="ext-btn-cancel" onClick={() => setIsResetConfirmModalOpen(false)}>
                Batal
              </button>
              <button type="button" className="ext-btn-danger" onClick={handleResetToDefault}>
                Ya, Reset ke Pengaturan Awal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

