import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  HiOutlineSparkles,
  HiOutlineCheckBadge,
  HiOutlineStar,
  HiStar,
  HiOutlineArrowPath,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineDocumentDuplicate,
  HiOutlineInformationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlinePencilSquare
} from 'react-icons/hi2'
import { RiCarLine, RiSteering2Line, RiTruckLine } from 'react-icons/ri'
import './PortalPriceList.css'

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

// Meta labels for passenger cars
const PASSENGER_META = {
  new_xforce: { name: 'New XFORCE', category: 'Compact SUV' },
  destinator: { name: 'Destinator', category: 'Premium MPV' },
  new_xpander: { name: 'New Xpander', category: 'Family MPV' },
  new_xpander_cross: { name: 'New Xpander Cross', category: 'Crossover MPV' },
  new_pajero_sport: { name: 'New Pajero Sport', category: 'Prestige SUV 4x4' },
  triton: { name: 'All New Triton', category: 'Double & Single Cabin' },
  l300: { name: 'Colt L300', category: 'Niaga Legendaris' }
}

const COMMERCIAL_META = {
  canter: { name: 'Canter Euro 4', category: 'Light Duty Truck' },
  fighter_x: { name: 'Fighter X Euro 4', category: 'Medium Duty Truck' },
  tractor_head: { name: 'Tractor Head Euro 4', category: 'Heavy Duty Puller' }
}

export default function PortalPriceList() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Knowledge payload state
  const [periode, setPeriode] = useState('Oktober 2026')
  const [featuredModels, setFeaturedModels] = useState(['new_xforce', 'destinator', 'new_xpander_cross'])
  const [passengerCars, setPassengerCars] = useState({})
  const [commercialCars, setCommercialCars] = useState({})
  const [metaInfo, setMetaInfo] = useState({})
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [updatedBy, setUpdatedBy] = useState('')

  // View state
  const [activeMainTab, setActiveMainTab] = useState('passenger') // 'passenger' | 'commercial'
  const [selectedPassengerKey, setSelectedPassengerKey] = useState('new_xforce')
  const [selectedCommercialKey, setSelectedCommercialKey] = useState('canter')

  // Model name editing state & handlers
  const [isEditingModelName, setIsEditingModelName] = useState(false)
  const [tempModelName, setTempModelName] = useState('')

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

  useEffect(() => {
    setIsEditingModelName(false)
    setTempModelName('')
  }, [selectedPassengerKey])

  const currentModelDisplayName = passengerCars[selectedPassengerKey]?.name || PASSENGER_META[selectedPassengerKey]?.name || selectedPassengerKey

  const handleStartEditModelName = () => {
    setTempModelName(currentModelDisplayName)
    setIsEditingModelName(true)
  }

  const handleSaveModelName = () => {
    const trimmed = tempModelName.trim()
    const defaultName = PASSENGER_META[selectedPassengerKey]?.name || selectedPassengerKey
    const finalName = trimmed || defaultName
    if (finalName !== currentModelDisplayName) {
      setHasUnsavedChanges(true)
      setPassengerCars((prev) => ({
        ...prev,
        [selectedPassengerKey]: {
          ...prev[selectedPassengerKey],
          name: finalName
        }
      }))
      showToast(`Nama model diperbarui menjadi "${finalName}"`, 'success')
    }
    setIsEditingModelName(false)
  }

  const handleCancelEditModelName = () => {
    setIsEditingModelName(false)
    setTempModelName('')
  }

  // Add New Model Modal state & handlers
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false)
  const [newModelForm, setNewModelForm] = useState({
    name: '',
    category: 'Compact SUV',
    tagline: '',
    image: '',
    variantType: 'Ultimate CVT',
    price: 350000000
  })

  const handleOpenAddModelModal = () => {
    setNewModelForm({
      name: '',
      category: 'Compact SUV',
      tagline: '',
      image: '',
      variantType: 'Ultimate CVT',
      price: 350000000
    })
    setIsAddModelModalOpen(true)
  }

  const handleCreateNewModel = (e) => {
    e.preventDefault()
    const nameTrimmed = newModelForm.name.trim()
    if (!nameTrimmed) {
      showToast('Nama model wajib diisi!', 'warning')
      return
    }

    // Generate unique slug key
    let baseSlug = nameTrimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || `model_${Date.now()}`

    let uniqueSlug = baseSlug
    let counter = 1
    while (passengerCars[uniqueSlug]) {
      uniqueSlug = `${baseSlug}_${counter}`
      counter++
    }

    const priceNum = parseInt(String(newModelForm.price).replace(/[^0-9]/g, ''), 10) || 300000000
    const fallbackImage = 'https://csdwindo.com/wp-content/uploads/newxforcetr.png'

    const newCarData = {
      name: nameTrimmed,
      category: newModelForm.category.trim() || 'Compact SUV',
      tagline: newModelForm.tagline.trim() || 'Inovasi Kenyamanan & Performa Mitsubishi',
      image: newModelForm.image.trim() || fallbackImage,
      items: [
        {
          type: newModelForm.variantType.trim() || 'Ultimate CVT',
          price: priceNum
        }
      ],
      additional_cost: {
        warna_putih: 1500000
      }
    }

    setHasUnsavedChanges(true)
    setPassengerCars((prev) => ({
      ...prev,
      [uniqueSlug]: newCarData
    }))

    setSelectedPassengerKey(uniqueSlug)
    setIsAddModelModalOpen(false)
    showToast(`Model baru "${nameTrimmed}" berhasil ditambahkan! Lengkapi varian lalu simpan.`, 'success', 5000)
  }

  // Delete Model Modal State & handlers
  const [isDeleteModelModalOpen, setIsDeleteModelModalOpen] = useState(false)

  const handleDeleteCurrentModel = () => {
    const modelKeys = Object.keys(passengerCars)
    if (modelKeys.length <= 1) {
      showToast('Tidak dapat menghapus model terakhir!', 'warning')
      return
    }

    if (featuredModels.includes(selectedPassengerKey)) {
      showToast(`Model "${currentModelDisplayName}" adalah Model Favorit! Lepas status favorit sebelum menghapus.`, 'warning', 4500)
      return
    }

    setIsDeleteModelModalOpen(true)
  }

  const handleConfirmDeleteModel = () => {
    const modelKeys = Object.keys(passengerCars)
    const nextKey = modelKeys.find((k) => k !== selectedPassengerKey) || ''
    const deletedName = currentModelDisplayName

    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      delete copy[selectedPassengerKey]
      return copy
    })

    if (nextKey) {
      setSelectedPassengerKey(nextKey)
    }

    setIsDeleteModelModalOpen(false)
    showToast(`Model "${deletedName}" berhasil dihapus`, 'info')
  }

  // Fetch Knowledge Price List from API
  const fetchPriceList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/price-list`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        const pCars = d.passenger_car || {}
        const cCars = d.commercial_car || {}
        const pMeta = d.meta || {}
        const fModels = Array.isArray(d.featured_models) && d.featured_models.length === 3
          ? d.featured_models
          : (pMeta.featured_models || ['new_xforce', 'destinator', 'new_xpander_cross'])

        setPassengerCars(pCars)
        setCommercialCars(cCars)
        setMetaInfo(pMeta)
        setPeriode(pMeta.periode || 'Oktober 2026')
        setFeaturedModels(fModels)
        setLastUpdatedAt(json.updated_at || '')
        setUpdatedBy(json.updated_by || 'System')
        setHasUnsavedChanges(false)

        // Ensure selected model keys are valid
        const pKeys = Object.keys(pCars)
        if (pKeys.length && !pKeys.includes(selectedPassengerKey)) {
          setSelectedPassengerKey(pKeys[0])
        }
      } else {
        setFeedback({ type: 'error', text: json.message || 'Gagal memuat data price list.' })
      }
    } catch (err) {
      console.error('Error fetching price list:', err)
      setFeedback({ type: 'error', text: 'Gagal terhubung ke API server database knowledge.' })
    } finally {
      setLoading(false)
    }
  }, [selectedPassengerKey])

  useEffect(() => {
    fetchPriceList()
  }, [])

  // Auto-dismiss success feedback
  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Handle toggling featured model (STRICTLY 3)
  const handleToggleFeatured = (modelKey) => {
    const meta = PASSENGER_META[modelKey] || { name: modelKey }
    const modelDisplayName = passengerCars[modelKey]?.name || meta.name

    setHasUnsavedChanges(true)
    if (featuredModels.includes(modelKey)) {
      if (featuredModels.length <= 1) {
        showToast('Minimal harus ada 1 model yang dipilih sebagai favorit.', 'warning')
        setFeedback({ type: 'warning', text: 'Minimal harus ada model yang dipilih sebagai favorit.' })
        return
      }
      const updated = featuredModels.filter((k) => k !== modelKey)
      setFeaturedModels(updated)
      showToast(`"${modelDisplayName}" dilepas dari Model Favorit (${updated.length}/3)`, 'info')
      setFeedback(null)
    } else {
      if (featuredModels.length >= 3) {
        showToast('Khusus model favorit harus dipilih tepat 3 model!', 'warning')
        setFeedback({
          type: 'warning',
          text: 'Khusus model favorit harus dipilih tepat 3 model. Silakan batalkan centang salah satu model terlebih dahulu sebelum memilih model baru.'
        })
        return
      }
      const updated = [...featuredModels, modelKey]
      setFeaturedModels(updated)
      showToast(`"${modelDisplayName}" dipilih sebagai Model Favorit (${updated.length}/3)`, 'success')
      setFeedback(null)
    }
  }

  // Active Passenger Car Data
  const currentPassengerCar = useMemo(() => {
    return passengerCars[selectedPassengerKey] || { items: [], image: '', additional_cost: {} }
  }, [passengerCars, selectedPassengerKey])

  // Update item field in passenger car
  const handlePassengerVariantChange = (index, field, value) => {
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const items = [...(model.items || [])]

      if (field === 'price') {
        const numVal = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
        items[index] = { ...items[index], price: numVal }
      } else {
        items[index] = { ...items[index], [field]: value }
      }

      model.items = items
      copy[selectedPassengerKey] = model
      return copy
    })
  }

  // Add new variant to passenger car
  const handleAddPassengerVariant = () => {
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const items = [...(model.items || [])]

      const lastPrice = items.length ? items[items.length - 1].price : 300000000
      items.push({
        type: 'Varian Baru Tipe MT/CVT',
        price: lastPrice
      })

      model.items = items
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast(`Varian baru berhasil ditambahkan ke ${currentModelDisplayName}`, 'success')
  }

  // Delete variant from passenger car
  const handleDeletePassengerVariant = (index) => {
    const targetItem = (currentPassengerCar.items || [])[index]
    const typeName = targetItem?.type || `Varian #${index + 1}`
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const items = (model.items || []).filter((_, i) => i !== index)
      model.items = items
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast(`Varian "${typeName}" berhasil dihapus`, 'info')
  }

  // Move variant order up/down
  const handleMovePassengerVariant = (index, direction) => {
    const targetIdx = index + direction
    const items = currentPassengerCar.items || []
    if (targetIdx < 0 || targetIdx >= items.length) return

    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const newItems = [...model.items]
      const temp = newItems[index]
      newItems[index] = newItems[targetIdx]
      newItems[targetIdx] = temp

      model.items = newItems
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast(`Urutan varian dipindahkan ke ${direction === -1 ? 'atas' : 'bawah'}`, 'info')
  }

  // Update Image URL of current passenger car
  const handlePassengerImageChange = (newUrl) => {
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => ({
      ...prev,
      [selectedPassengerKey]: {
        ...prev[selectedPassengerKey],
        image: newUrl
      }
    }))
  }

  // Update Additional Cost price of current passenger car
  const handleAdditionalCostChange = (costKey, value) => {
    setHasUnsavedChanges(true)
    const numVal = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const addCost = { ...(model.additional_cost || {}) }
      addCost[costKey] = numVal
      model.additional_cost = addCost
      copy[selectedPassengerKey] = model
      return copy
    })
  }

  // Add new Additional Cost item
  const handleAddAdditionalCost = () => {
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const addCost = { ...(model.additional_cost || {}) }

      let baseKey = 'warna_khusus'
      let uniqueKey = baseKey
      let counter = 1
      while (addCost[uniqueKey] !== undefined) {
        uniqueKey = `${baseKey}_${counter}`
        counter++
      }

      addCost[uniqueKey] = 1500000
      model.additional_cost = addCost
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast('Item biaya tambahan baru berhasil ditambahkan', 'success')
  }

  // Delete Additional Cost item
  const handleDeleteAdditionalCost = (costKey) => {
    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const addCost = { ...(model.additional_cost || {}) }
      delete addCost[costKey]
      model.additional_cost = addCost
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast(`Biaya tambahan "${costKey.replace(/_/g, ' ')}" berhasil dihapus`, 'info')
  }

  // Rename Additional Cost key
  const handleRenameAdditionalCostKey = (oldKey, newName) => {
    const cleanName = newName.trim()
    if (!cleanName) return
    const sanitizedKey = cleanName.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || `biaya_${Date.now()}`
    if (sanitizedKey === oldKey) return

    setHasUnsavedChanges(true)
    setPassengerCars((prev) => {
      const copy = { ...prev }
      const model = { ...copy[selectedPassengerKey] }
      const oldCost = model.additional_cost || {}
      const newCost = {}

      Object.keys(oldCost).forEach((k) => {
        if (k === oldKey) {
          newCost[sanitizedKey] = oldCost[oldKey]
        } else {
          newCost[k] = oldCost[k]
        }
      })

      model.additional_cost = newCost
      copy[selectedPassengerKey] = model
      return copy
    })
    showToast(`Keterangan biaya tambahan diubah menjadi "${cleanName}"`, 'info')
  }

  // Commercial truck variant change
  const handleCommercialPriceChange = (truckKey, catKey, itemIndex, value) => {
    setHasUnsavedChanges(true)
    const numVal = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
    setCommercialCars((prev) => {
      const copy = { ...prev }
      const truck = { ...copy[truckKey] }
      const categories = { ...truck.categories }
      const items = [...(categories[catKey] || [])]

      items[itemIndex] = {
        ...items[itemIndex],
        price: numVal
      }

      categories[catKey] = items
      truck.categories = categories
      copy[truckKey] = truck
      return copy
    })
  }

  // Save All Changes to Backend MySQL KnowledgeItem & Sync Files
  const handleSave = async () => {
    // Strict Validation: Model favorit harus tepat 3
    if (featuredModels.length !== 3) {
      showToast(`Khusus model favorit harus dipilih tepat 3 model. (Saat ini: ${featuredModels.length})`, 'error', 4500)
      setFeedback({
        type: 'error',
        text: `Khusus model favorit harus dipilih tepat 3 model. Saat ini terpilih: ${featuredModels.length} model.`
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSaving(true)
    setFeedback(null)

    const fullPayload = {
      meta: {
        ...metaInfo,
        brand: 'Mitsubishi',
        periode: periode.trim() || 'Oktober 2026',
        currency: 'IDR',
        featured_models: featuredModels
      },
      featured_models: featuredModels,
      passenger_car: passengerCars,
      commercial_car: commercialCars
    }

    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/price-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: fullPayload,
          featured_models: featuredModels,
          updated_by: 'Staff Portal Margahayu'
        })
      })

      const json = await response.json()
      if (response.ok && json.success) {
        showToast('✓ Data Price List OTR & Model Favorit berhasil disimpan ke server!', 'success', 4500)
        setFeedback({
          type: 'success',
          text: '✓ Data Price List OTR & Model Favorit berhasil diperbarui! Perubahan telah tersinkronisasi ke Website & Asisten AI Sunny.'
        })
        setHasUnsavedChanges(false)
        setLastUpdatedAt(json.updated_at || new Date().toISOString())
        setUpdatedBy(json.updated_by || 'Staff Portal Margahayu')
      } else {
        showToast(json.message || 'Gagal menyimpan perubahan ke database.', 'error', 4500)
        setFeedback({
          type: 'error',
          text: json.message || 'Gagal menyimpan perubahan ke database knowledge.'
        })
      }
    } catch (err) {
      console.error('Error saving knowledge price list:', err)
      showToast('Terjadi kendala jaringan saat menghubungi server backend.', 'error', 4500)
      setFeedback({
        type: 'error',
        text: 'Terjadi kendala jaringan saat menghubungi server backend.'
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset to initial file defaults
  const handleResetToDefault = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset seluruh data harga OTR ke pengaturan default awal?')) {
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/price-list/reset`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      })
      const json = await res.json()
      if (json.success) {
        await fetchPriceList()
        showToast('Data harga OTR berhasil dikembalikan ke pengaturan default awal.', 'info', 4500)
        setFeedback({
          type: 'success',
          text: 'Data harga OTR berhasil dikembalikan ke pengaturan default awal.'
        })
      } else {
        showToast(json.message || 'Gagal mereset data.', 'error', 4500)
        setFeedback({ type: 'error', text: json.message || 'Gagal mereset data.' })
      }
    } catch (err) {
      showToast('Gagal terhubung ke API server saat mereset.', 'error', 4500)
      setFeedback({ type: 'error', text: 'Gagal terhubung ke API server saat mereset.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="portal-pricelist-page">
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <HiOutlineArrowPath className="spin-icon" size={32} style={{ margin: '0 auto 1rem', display: 'block', color: '#E3000C' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Memuat Data Price List Knowledge...</h3>
          <p style={{ fontSize: '0.85rem' }}>Mengambil data harga OTR dan konfigurasi model dari database.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-pricelist-page">
      {/* Toast Alert Notifications Container */}
      <div className="pl-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pl-toast-item ${toast.type}`}>
            <div className="pl-toast-icon">
              {toast.type === 'success' && <HiOutlineCheckBadge size={20} />}
              {toast.type === 'info' && <HiOutlineInformationCircle size={20} />}
              {toast.type === 'warning' && <HiOutlineExclamationTriangle size={20} />}
              {toast.type === 'error' && <HiOutlineExclamationTriangle size={20} />}
            </div>
            <div className="pl-toast-content">
              <span className="pl-toast-message">{toast.message}</span>
            </div>
            <button
              type="button"
              className="pl-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Tutup pemberitahuan"
            >
              <HiOutlineXMark size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Header Row */}
      <div className="pl-header-row">
        <div className="pl-title-group">
          <h1>Manajemen Price List & OTR Kendaraan</h1>
          <p>
            Atur harga OTR berkala, varian tipe, dan <strong>3 model favorit showroom</strong> secara dinamis.
            Perubahan otomatis tersinkron ke halaman <strong>Kendaraan</strong>, <strong>Pilihan Favorit Homepage</strong>, dan <strong>Knowledge AI Sunny</strong>.
          </p>
        </div>

        <div className="pl-header-actions">
          <button
            type="button"
            className="pl-btn-reset"
            onClick={handleResetToDefault}
            disabled={saving}
            title="Kembalikan data ke awal (default vehicle-list.json)"
          >
            <HiOutlineArrowPath size={16} />
            <span>Reset Awal</span>
          </button>

          <button
            type="button"
            className="pl-btn-save"
            onClick={handleSave}
            disabled={saving || featuredModels.length !== 3}
          >
            {saving ? (
              <>
                <HiOutlineArrowPath className="spin-icon" size={16} />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <HiOutlineCheck size={18} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div className="pl-unsaved-banner">
          <div className="pl-unsaved-content">
            <HiOutlineExclamationTriangle size={22} className="pl-unsaved-icon" />
            <div>
              <strong>Ada perubahan yang belum disimpan!</strong>
              <p>Perubahan yang Anda lakukan hanya tersimpan di sesi lokal ini. Klik tombol merah "Simpan Perubahan" di atas untuk memperbarui harga OTR dan konfigurasi model di website serta Sunny AI.</p>
            </div>
          </div>
          <button
            type="button"
            className="pl-btn-quick-save"
            onClick={handleSave}
            disabled={saving || featuredModels.length !== 3}
          >
            {saving ? (
              <>
                <HiOutlineArrowPath className="spin-icon" size={15} />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Sekarang</span>
            )}
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`pl-alert-box ${feedback.type}`}>
          {feedback.type === 'success' && <HiOutlineCheckBadge size={20} />}
          {feedback.type === 'error' && <HiOutlineExclamationTriangle size={20} />}
          {feedback.type === 'warning' && <HiOutlineInformationCircle size={20} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Meta Cards Row */}
      <div className="pl-meta-banner">
        <div className="pl-meta-card">
          <div className="pl-meta-icon red">
            <HiOutlineCalendar size={22} />
          </div>
          <div className="pl-meta-text">
            <span className="pl-meta-label">Periode Harga OTR</span>
            <div className="pl-meta-value">
              <input
                type="text"
                value={periode}
                onChange={(e) => {
                  setPeriode(e.target.value)
                  setHasUnsavedChanges(true)
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    showToast(`Periode harga OTR diset ke "${e.target.value.trim()}"`, 'info')
                  }
                }}
                className="pl-periode-input"
                placeholder="Contoh: Oktober 2026"
              />
            </div>
          </div>
        </div>

        <div className="pl-meta-card">
          <div className="pl-meta-icon emerald">
            <HiOutlineSparkles size={22} />
          </div>
          <div className="pl-meta-text">
            <span className="pl-meta-label">Status Sinkronisasi AI & Web</span>
            <div className="pl-meta-value">
              <span className="pl-sync-dot" />
              <span>Live Terhubung</span>
            </div>
          </div>
        </div>

        <div className="pl-meta-card">
          <div className="pl-meta-icon">
            <RiCarLine size={24} />
          </div>
          <div className="pl-meta-text">
            <span className="pl-meta-label">Total Unit Kendaraan</span>
            <div className="pl-meta-value">
              <span>{Object.keys(passengerCars).length} Penumpang • {Object.keys(commercialCars).length} Niaga</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          SECTION: MODEL FAVORIT (FEATURED ON HOMEPAGE) - STRICTLY 3 SELECTED
          ========================================================================== */}
      <section className="pl-featured-section">
        <div className="pl-featured-header">
          <div>
            <div className="pl-featured-title-wrap">
              <HiOutlineStar size={22} color="#E3000C" />
              <h2>Model Favorit (Featured di Homepage)</h2>
            </div>
            <p className="pl-featured-subtitle">
              Pilih <strong>tepat 3 model kendaraan</strong> untuk ditampilkan secara eksklusif pada grid "Pilihan Favorit" di Homepage utama.
            </p>
          </div>

          <div className={`pl-counter-badge ${featuredModels.length === 3 ? 'valid' : 'invalid'}`}>
            <span>Terpilih: {featuredModels.length} / 3 Model</span>
          </div>
        </div>

        {featuredModels.length !== 3 && (
          <div className="pl-alert-box warning" style={{ marginBottom: '1.25rem' }}>
            <HiOutlineInformationCircle size={18} />
            <span>
              Perhatian: Sesuai regulasi tampilan showroom, <strong>khusus model favorit harus dipilih tepat 3 model</strong>.
              Saat ini terpilih {featuredModels.length} model.
            </span>
          </div>
        )}

        <div className="pl-featured-grid">
          {Object.entries(passengerCars).map(([key, data]) => {
            const isSelected = featuredModels.includes(key)
            const rankIndex = featuredModels.indexOf(key)
            const meta = PASSENGER_META[key] || { name: key, category: 'Passenger' }
            const items = data.items || []
            const prices = items.map((i) => i.price).filter(Boolean)
            const minPrice = prices.length ? Math.min(...prices) : 0

            return (
              <div
                key={key}
                className={`pl-featured-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleToggleFeatured(key)}
              >
                {isSelected && (
                  <span className="pl-featured-rank-badge">
                    Favorit #{rankIndex + 1}
                  </span>
                )}
                <div className="pl-featured-check-icon">
                  <HiOutlineCheck size={14} />
                </div>

                <div className="pl-featured-img-wrap">
                  <img src={data.image} alt={meta.name} className="pl-featured-img" />
                </div>

                <h4 className="pl-featured-name">{data.name || meta.name}</h4>
                <p className="pl-featured-price">Mulai {formatIDR(minPrice)}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ==========================================================================
          TABS: MOBIL PENUMPANG VS TRUK NIAGA
          ========================================================================== */}
      <div className="pl-nav-tabs-bar">
        <button
          type="button"
          className={`pl-tab-btn ${activeMainTab === 'passenger' ? 'is-active' : ''}`}
          onClick={() => setActiveMainTab('passenger')}
        >
          <RiCarLine size={18} />
          <span>Mobil Penumpang ({Object.keys(passengerCars).length} Model)</span>
        </button>

        <button
          type="button"
          className={`pl-tab-btn ${activeMainTab === 'commercial' ? 'is-active' : ''}`}
          onClick={() => setActiveMainTab('commercial')}
        >
          <RiTruckLine size={18} />
          <span>Kendaraan Niaga & Truk FUSO ({Object.keys(commercialCars).length} Seri)</span>
        </button>
      </div>

      {/* ==========================================================================
          TAB CONTENT: MOBIL PENUMPANG
          ========================================================================== */}
      {activeMainTab === 'passenger' && (
        <div className="pl-models-container">
          {/* Left Model Selector Navigation */}
          <div className="pl-models-sidebar">
            <div className="pl-sidebar-header-row">
              <span className="pl-sidebar-header">Pilih Model:</span>
            </div>
            {Object.keys(passengerCars).map((key) => {
              const meta = PASSENGER_META[key] || { name: key, category: 'Passenger' }
              const isFav = featuredModels.includes(key)
              const count = passengerCars[key]?.items?.length || 0

              return (
                <button
                  key={key}
                  type="button"
                  className={`pl-model-nav-item ${selectedPassengerKey === key ? 'is-active' : ''}`}
                  onClick={() => setSelectedPassengerKey(key)}
                >
                  <div className="pl-model-nav-left">
                    {isFav ? <HiStar size={16} color="#E3000C" /> : <RiCarLine size={16} />}
                    <span className="pl-model-nav-name">{passengerCars[key]?.name || meta.name}</span>
                  </div>
                  <span className="pl-model-nav-badge">{count}</span>
                </button>
              )
            })}
            <button
              type="button"
              className="pl-btn-add-model-sidebar"
              onClick={handleOpenAddModelModal}
            >
              <HiOutlinePlus size={15} />
              <span>Tambah Model Baru</span>
            </button>
          </div>

          {/* Right Active Model Editor */}
          <div className="pl-model-editor-card">
            <div className="pl-editor-top-bar">
              <div className="pl-editor-model-info">
                <div className="pl-editor-preview-thumb">
                  <img
                    src={currentPassengerCar.image}
                    alt={currentModelDisplayName}
                  />
                </div>
                <div>
                  {isEditingModelName ? (
                    <div className="pl-model-name-edit-box">
                      <input
                        type="text"
                        className="pl-model-name-edit-input"
                        value={tempModelName}
                        onChange={(e) => setTempModelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveModelName()
                          if (e.key === 'Escape') handleCancelEditModelName()
                        }}
                        autoFocus
                        placeholder="Nama Model..."
                      />
                      <button
                        type="button"
                        className="pl-btn-name-confirm"
                        onClick={handleSaveModelName}
                        title="Simpan Nama Model"
                        aria-label="Simpan Nama Model"
                      >
                        <HiOutlineCheck size={16} />
                      </button>
                      <button
                        type="button"
                        className="pl-btn-name-cancel"
                        onClick={handleCancelEditModelName}
                        title="Batal"
                        aria-label="Batal"
                      >
                        <HiOutlineXMark size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="pl-model-name-hover-wrap"
                      onClick={handleStartEditModelName}
                      title="Klik untuk edit nama model"
                    >
                      <h3 className="pl-editor-model-name">
                        {currentModelDisplayName}
                      </h3>
                      <button
                        type="button"
                        className="pl-btn-edit-model-name"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEditModelName()
                        }}
                        title="Edit Nama Model"
                        aria-label="Edit Nama Model"
                      >
                        <HiOutlinePencilSquare size={17} />
                      </button>
                    </div>
                  )}
                  <p className="pl-editor-model-sub">
                    Kategori: <strong>{currentPassengerCar.category || PASSENGER_META[selectedPassengerKey]?.category || 'Passenger'}</strong> • {currentPassengerCar.items?.length || 0} Varian Terdaftar
                    {featuredModels.includes(selectedPassengerKey) && (
                      <span style={{ marginLeft: '0.5rem', color: '#E3000C', fontWeight: 800 }}>
                        ★ Terpilih sebagai Model Favorit Homepage
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pl-editor-actions-group">
                <button
                  type="button"
                  className="pl-btn-add-variant"
                  onClick={handleAddPassengerVariant}
                >
                  <HiOutlinePlus size={16} />
                  <span>Tambah Varian Baru</span>
                </button>

                <button
                  type="button"
                  className="pl-btn-delete-model"
                  onClick={handleDeleteCurrentModel}
                  title="Hapus Model Ini dari Price List"
                >
                  <HiOutlineTrash size={15} />
                  <span>Hapus Model</span>
                </button>
              </div>
            </div>

            {/* Image URL Setting */}
            <div className="pl-image-url-group">
              <label className="pl-input-label">URL Foto Kendaraan Resmi (Transparan PNG/WebP):</label>
              <input
                type="url"
                value={currentPassengerCar.image || ''}
                onChange={(e) => handlePassengerImageChange(e.target.value)}
                onBlur={() => {
                  showToast(`Foto unit ${currentModelDisplayName} diperbarui`, 'info')
                }}
                className="pl-text-input"
                placeholder="https://..."
              />
            </div>

            {/* Additional Cost Editor (Biaya Tambahan Warna Khusus / Paket) */}
            <div className="pl-addcost-section">
              <div className="pl-addcost-header">
                <h4 className="pl-addcost-title">
                  <HiOutlineCurrencyDollar size={18} color="#E3000C" />
                  <span>Biaya Tambahan OTR (Warna Khusus / Paket Tambahan):</span>
                </h4>
                <button
                  type="button"
                  className="pl-btn-add-cost"
                  onClick={handleAddAdditionalCost}
                >
                  <HiOutlinePlus size={15} />
                  <span>Tambah Biaya Tambahan</span>
                </button>
              </div>

              {!currentPassengerCar.additional_cost || Object.keys(currentPassengerCar.additional_cost).length === 0 ? (
                <div className="pl-addcost-empty">
                  Belum ada biaya tambahan untuk model ini. Klik <strong>"+ Tambah Biaya Tambahan"</strong> untuk menambahkan (contoh: Warna Putih, Two Tone, Paket Aksesori).
                </div>
              ) : (
                <div className="pl-addcost-grid">
                  {Object.entries(currentPassengerCar.additional_cost).map(([cKey, val]) => (
                    <div key={cKey} className="pl-addcost-card">
                      <div className="pl-addcost-card-header">
                        <input
                          type="text"
                          defaultValue={cKey.replace(/_/g, ' ').toUpperCase()}
                          onBlur={(e) => handleRenameAdditionalCostKey(cKey, e.target.value)}
                          className="pl-addcost-name-input"
                          title="Klik untuk mengubah keterangan nama biaya tambahan"
                          placeholder="NAMA BIAYA"
                        />
                        <button
                          type="button"
                          className="pl-btn-delete-cost"
                          onClick={() => handleDeleteAdditionalCost(cKey)}
                          title="Hapus Biaya Tambahan Ini"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                      <div className="pl-addcost-card-body">
                        <span className="pl-addcost-label-sub">Nominal Tambahan (IDR):</span>
                        <div className="pl-variant-price-group">
                          <span className="pl-variant-currency">Rp</span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleAdditionalCostChange(cKey, e.target.value)}
                            onBlur={() => {
                              showToast(`Biaya tambahan ${cKey.replace(/_/g, ' ')} diset ke +${formatIDR(val)}`, 'info')
                            }}
                            className="pl-text-input pl-addcost-price-input"
                            placeholder="1500000"
                          />
                        </div>
                        <span className="pl-addcost-formatted">
                          +{formatIDR(val)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants & OTR Prices Table */}
            <div className="pl-variants-header-bar">
              <h4 className="pl-variants-title">Daftar Tipe Varian & Harga OTR (On The Road):</h4>
            </div>

            <div className="pl-variants-table-wrap">
              <table className="pl-variants-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>No</th>
                    <th>Nama Tipe / Varian</th>
                    <th style={{ width: '220px' }}>Harga OTR (IDR)</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentPassengerCar.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="pl-variant-idx">{idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={item.type || ''}
                          onChange={(e) => handlePassengerVariantChange(idx, 'type', e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              showToast(`Nama varian #${idx + 1} diset ke "${e.target.value.trim()}"`, 'info')
                            }
                          }}
                          className="pl-variant-input-type"
                          placeholder="Nama Tipe Varian"
                        />
                      </td>
                      <td>
                        <div className="pl-variant-price-group">
                          <span className="pl-variant-currency">Rp</span>
                          <input
                            type="text"
                            value={item.price || 0}
                            onChange={(e) => handlePassengerVariantChange(idx, 'price', e.target.value)}
                            onBlur={() => {
                              showToast(`Harga OTR ${item.type || 'varian'} diset ke ${formatIDR(item.price)}`, 'info')
                            }}
                            className="pl-variant-input-price"
                          />
                        </div>
                        <div className="pl-variant-formatted">
                          {formatIDR(item.price)}
                        </div>
                      </td>
                      <td>
                        <div className="pl-variant-actions">
                          <button
                            type="button"
                            className="pl-btn-icon-action"
                            onClick={() => handleMovePassengerVariant(idx, -1)}
                            disabled={idx === 0}
                            title="Pindah ke Atas"
                          >
                            <HiOutlineChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="pl-btn-icon-action"
                            onClick={() => handleMovePassengerVariant(idx, 1)}
                            disabled={idx === (currentPassengerCar.items || []).length - 1}
                            title="Pindah ke Bawah"
                          >
                            <HiOutlineChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="pl-btn-icon-action delete"
                            onClick={() => handleDeletePassengerVariant(idx)}
                            title="Hapus Varian"
                          >
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!currentPassengerCar.items || currentPassengerCar.items.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Belum ada varian tipe untuk model ini. Klik "Tambah Varian Baru" di atas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="pl-btn-save"
                onClick={handleSave}
                disabled={saving || featuredModels.length !== 3}
              >
                <HiOutlineCheck size={18} />
                <span>Simpan Perubahan OTR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          TAB CONTENT: KENDARAAN NIAGA & TRUK FUSO
          ========================================================================== */}
      {activeMainTab === 'commercial' && (
        <div className="pl-commercial-grid">
          {Object.entries(commercialCars).map(([truckKey, truckData]) => {
            const meta = COMMERCIAL_META[truckKey] || { name: truckKey, category: 'Commercial' }
            const categories = truckData.categories || {}

            return (
              <div key={truckKey} className="pl-commercial-card">
                <div className="pl-commercial-header">
                  <div className="pl-commercial-title-wrap">
                    <div className="pl-commercial-thumb">
                      <img src={truckData.image} alt={meta.name} />
                    </div>
                    <div>
                      <h3 className="pl-commercial-title">{meta.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Kategori: <strong>{meta.category}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {Object.entries(categories).map(([catKey, items]) => (
                  <div key={catKey} className="pl-commercial-category-group">
                    <span className="pl-category-badge-title">Kategori: {catKey}</span>
                    <div className="pl-variants-table-wrap">
                      <table className="pl-variants-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>No</th>
                            <th>Tipe Truk</th>
                            <th>Spesifikasi</th>
                            <th style={{ width: '220px' }}>Harga OTR (IDR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, iIdx) => (
                            <tr key={iIdx}>
                              <td className="pl-variant-idx">{iIdx + 1}</td>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.type}</td>
                              <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{item.spec}</td>
                              <td>
                                <div className="pl-variant-price-group">
                                  <span className="pl-variant-currency">Rp</span>
                                  <input
                                    type="text"
                                    value={item.price || 0}
                                    onChange={(e) => handleCommercialPriceChange(truckKey, catKey, iIdx, e.target.value)}
                                    onBlur={() => {
                                      showToast(`Harga OTR ${item.type} diset ke ${formatIDR(item.price)}`, 'info')
                                    }}
                                    className="pl-variant-input-price"
                                  />
                                </div>
                                <div className="pl-variant-formatted">
                                  {formatIDR(item.price)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="pl-btn-save"
              onClick={handleSave}
              disabled={saving || featuredModels.length !== 3}
            >
              <HiOutlineCheck size={18} />
              <span>Simpan Perubahan OTR</span>
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL: TAMBAH MODEL KENDARAAN BARU
          ========================================================================== */}
      {isAddModelModalOpen && (
        <div className="pl-modal-overlay" onClick={() => setIsAddModelModalOpen(false)}>
          <div className="pl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div className="pl-modal-title-wrap">
                <div className="pl-modal-icon-badge">
                  <RiCarLine size={24} color="#E3000C" />
                </div>
                <div>
                  <h3 className="pl-modal-title">Tambah Model Kendaraan Baru</h3>
                  <p className="pl-modal-sub">
                    Daftarkan lini model mobil baru ke katalog OTR dan Knowledge AI.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="pl-modal-close-btn"
                onClick={() => setIsAddModelModalOpen(false)}
                aria-label="Tutup Modal"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewModel} className="pl-modal-form">
              <div className="pl-form-group">
                <label className="pl-form-label">
                  Nama Model Kendaraan <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newModelForm.name}
                  onChange={(e) => setNewModelForm({ ...newModelForm, name: e.target.value })}
                  placeholder="Contoh: Mitsubishi Outlander PHEV"
                  className="pl-modal-input"
                />
              </div>

              <div className="pl-form-row">
                <div className="pl-form-group">
                  <label className="pl-form-label">Kategori Kendaraan</label>
                  <select
                    value={newModelForm.category}
                    onChange={(e) => setNewModelForm({ ...newModelForm, category: e.target.value })}
                    className="pl-modal-select"
                  >
                    <option value="Compact SUV">Compact SUV</option>
                    <option value="Family MPV">Family MPV</option>
                    <option value="Crossover MPV">Crossover MPV</option>
                    <option value="Prestige SUV 4x4">Prestige SUV 4x4</option>
                    <option value="Electric Vehicle / PHEV">Electric Vehicle / PHEV</option>
                    <option value="Double & Single Cabin">Double & Single Cabin</option>
                    <option value="Sedan / Hatchback">Sedan / Hatchback</option>
                    <option value="Niaga Legendaris">Niaga Legendaris</option>
                    <option value="Kendaraan Penumpang">Kendaraan Penumpang</option>
                  </select>
                </div>

                <div className="pl-form-group">
                  <label className="pl-form-label">Tagline / Slogan Ringkas</label>
                  <input
                    type="text"
                    value={newModelForm.tagline}
                    onChange={(e) => setNewModelForm({ ...newModelForm, tagline: e.target.value })}
                    placeholder="Contoh: The New Era of Electrification"
                    className="pl-modal-input"
                  />
                </div>
              </div>

              <div className="pl-form-group">
                <label className="pl-form-label">URL Foto Mobil (Transparan PNG/WebP)</label>
                <input
                  type="url"
                  value={newModelForm.image}
                  onChange={(e) => setNewModelForm({ ...newModelForm, image: e.target.value })}
                  placeholder="https://... (kosongkan untuk foto default)"
                  className="pl-modal-input"
                />
                <span className="pl-form-hint">
                  Disarankan gambar PNG berlatar transparan agar serasi dengan kartu katalog & homepage.
                </span>
              </div>

              <div className="pl-form-divider">
                <span>Varian Pertama (Tipe & Harga OTR Perdana)</span>
              </div>

              <div className="pl-form-row">
                <div className="pl-form-group">
                  <label className="pl-form-label">
                    Tipe Varian Perdana <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newModelForm.variantType}
                    onChange={(e) => setNewModelForm({ ...newModelForm, variantType: e.target.value })}
                    placeholder="Contoh: Ultimate CVT"
                    className="pl-modal-input"
                  />
                </div>

                <div className="pl-form-group">
                  <label className="pl-form-label">
                    Estimasi Harga OTR: <strong>{formatIDR(newModelForm.price)}</strong>
                  </label>
                  <input
                    type="text"
                    required
                    value={newModelForm.price}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                      setNewModelForm({ ...newModelForm, price: num })
                    }}
                    placeholder="350000000"
                    className="pl-modal-input"
                  />
                </div>
              </div>

              <div className="pl-modal-footer">
                <button
                  type="button"
                  className="pl-btn-modal-cancel"
                  onClick={() => setIsAddModelModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pl-btn-modal-submit"
                >
                  <HiOutlinePlus size={18} />
                  <span>Tambahkan Model Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL: KONFIRMASI HAPUS MODEL KENDARAAN (PROPER DIALOG)
          ========================================================================== */}
      {isDeleteModelModalOpen && (
        <div className="pl-modal-overlay" onClick={() => setIsDeleteModelModalOpen(false)}>
          <div className="pl-modal-card pl-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pl-delete-icon-wrap">
              <HiOutlineTrash size={32} />
            </div>
            <h3 className="pl-delete-modal-title">Hapus Model Kendaraan?</h3>
            <p className="pl-delete-modal-desc">
              Apakah Anda yakin ingin menghapus model <strong>"{currentModelDisplayName}"</strong> beserta <strong>{currentPassengerCar.items?.length || 0} varian tipe</strong> dan rincian biaya tambahannya dari Price List?
            </p>
            <div className="pl-delete-modal-warning-note">
              <HiOutlineExclamationTriangle size={18} />
              <span>Tindakan ini akan menghapus model dari katalog OTR setelah perubahan disimpan.</span>
            </div>
            <div className="pl-delete-modal-actions">
              <button
                type="button"
                className="pl-btn-delete-cancel"
                onClick={() => setIsDeleteModelModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="pl-btn-delete-confirm"
                onClick={handleConfirmDeleteModel}
              >
                <HiOutlineTrash size={16} />
                <span>Ya, Hapus Model Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
