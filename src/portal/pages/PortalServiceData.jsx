import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineInformationCircle
} from 'react-icons/hi2'
import { RiCarLine } from 'react-icons/ri'
import './PortalServiceData.css'

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

// KM Intervals
const INTERVAL_KEYS = ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '100000']

// Default Standard 10 Intervals Template Generator for New Vehicles
const generateDefaultIntervalsForModel = (modelName) => {
  const intervals = {}
  INTERVAL_KEYS.forEach((kmKey) => {
    const kmNum = parseInt(kmKey, 10)
    const isFree = kmNum <= 50000
    const jasa = isFree ? (kmNum % 20000 === 0 ? 800000 : 500000) : (kmNum % 20000 === 0 ? 1200000 : 800000)

    const spareParts = [
      { nomor_part: 'MZ320346', nama: 'Oil Mesin MMGO (4L)', qty: 4, harga_satuan: 129000, total: 516000 },
      { nomor_part: 'MD360935', nama: 'Oil Filter', qty: 1, harga_satuan: 55000, total: 55000 },
      { nomor_part: 'MD050317', nama: 'Gasket Drain Plug', qty: 1, harga_satuan: 15000, total: 15000 }
    ]

    if (kmNum % 20000 === 0) {
      spareParts.push({ nomor_part: '7850A002', nama: 'Filter AC Kabin', qty: 1, harga_satuan: 168000, total: 168000 })
      spareParts.push({ nomor_part: 'MZ100723', nama: 'E/G Flush Cleaner', qty: 1, harga_satuan: 140000, total: 140000 })
    }

    if (kmNum === 40000 || kmNum === 80000) {
      spareParts.push({ nomor_part: 'SPC98001', nama: 'Brake Cleaner & Fluid', qty: 1, harga_satuan: 95000, total: 95000 })
    }

    const subtotalParts = spareParts.reduce((acc, p) => acc + p.total, 0)
    const totalSebelumPpn = subtotalParts + jasa
    const ppn = Math.round(totalSebelumPpn * 0.11) // PPN 11%
    const grandTotal = totalSebelumPpn + ppn

    intervals[kmKey] = {
      km: kmNum,
      status_free_service: isFree,
      catatan_free_service: isFree
        ? 'FREE jasa dan suku cadang (program MMKSI), berlaku s.d. 4 tahun dari PKT'
        : 'Biaya Mandiri Konsumen (Setelah 50.000 KM atau melewati batas 4 tahun PKT)',
      jasa,
      spare_part: spareParts,
      subtotal_spare_part: subtotalParts,
      total_sebelum_ppn: totalSebelumPpn,
      ppn_11_persen: ppn,
      grand_total: grandTotal
    }
  })
  return intervals
}

export default function PortalServiceData() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Main Knowledge Data State
  const [serviceData, setServiceData] = useState({
    metadata: {
      judul: 'Knowledge Base Estimasi Perawatan Berkala Mitsubishi',
      versi: '1.0',
      pajak: 'PPN 11% sudah termasuk dalam Grand Total'
    },
    kebijakan_free_service: {
      nama_program: 'Program MMKSI Free Jasa dan Spare Part',
      penyelenggara: 'MMKSI (Mitsubishi Motors Krama Yudha Sales Indonesia)',
      cakupan_km: [10000, 20000, 30000, 40000, 50000],
      keterangan_cakupan: 'Service pada 10.000 km s.d. 50.000 km ditanggung sepenuhnya oleh Mitsubishi (FREE jasa dan spare part)',
      batas_waktu: {
        durasi: '4 tahun',
        acuan: 'PKT (Penyerahan Kendaraan ke Tangan konsumen / Tanggal Serah Terima Kendaraan)',
        keterangan: 'Free service berlaku untuk 10.000 km hingga 50.000 km DENGAN SYARAT masih dalam batas 4 tahun sejak PKT.'
      },
      catatan_penting: []
    },
    kendaraan: {},
    ringkasan_biaya: {}
  })

  // Selected Active Navigation
  const [selectedModelKey, setSelectedModelKey] = useState('xpander') // model key or 'policy'
  const [modelViewMode, setModelViewMode] = useState('interval') // 'interval' | 'special_service'
  const [selectedKm, setSelectedKm] = useState('10000')

  // Modals state
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false)
  const [editingPartModal, setEditingPartModal] = useState(null) // interval part modal
  const [newPolicyNoteInput, setNewPolicyNoteInput] = useState('')
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false)

  // NEW: Add Model Modal State
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false)
  const [newModelForm, setNewModelForm] = useState({
    nama_lengkap: '',
    key: '',
    generateIntervals: true
  })

  // NEW: Delete Vehicle Confirmation Modal State
  const [vehicleToDelete, setVehicleToDelete] = useState(null)

  // NEW: Rename Model Modal State
  const [vehicleToRename, setVehicleToRename] = useState(null) // { key, nama_lengkap }

  // NEW: Special Service Modal State (Ganti Oli Saja, Tune Up, Spooring, dll.)
  const [editingSpecialServiceModal, setEditingSpecialServiceModal] = useState(null)
  // { mode: 'add' | 'edit', index: number, service: { id, nama, kategori, estimasi_waktu, jasa, spare_part: [], keterangan } }

  // Fetch Knowledge from API
  const fetchServiceData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/service-data`, {
        headers: { Accept: 'application/json' }
      })
      const json = await res.json()
      if (json.success && json.data) {
        setServiceData(json.data)
        setHasUnsavedChanges(false)

        // Validate selectedModelKey exists
        const availableKeys = Object.keys(json.data.kendaraan || {})
        if (selectedModelKey !== 'policy' && !availableKeys.includes(selectedModelKey)) {
          if (availableKeys.length > 0) {
            setSelectedModelKey(availableKeys[0])
          } else {
            setSelectedModelKey('policy')
          }
        }
      }
    } catch (err) {
      console.error('Error fetching service data:', err)
      setFeedback({
        type: 'error',
        message: 'Gagal memuat data servis dari server. Silakan muat ulang halaman.'
      })
    } finally {
      setLoading(false)
    }
  }, [selectedModelKey])

  useEffect(() => {
    fetchServiceData()
  }, [fetchServiceData])

  // Current Model & Active KM object
  const currentModel = useMemo(() => {
    if (selectedModelKey === 'policy') return null
    return serviceData.kendaraan?.[selectedModelKey] || null
  }, [serviceData, selectedModelKey])

  const activeIntervalData = useMemo(() => {
    if (!currentModel) return null
    return currentModel.perawatan?.[selectedKm] || null
  }, [currentModel, selectedKm])

  // Recalculate totals for an interval (PPN 11%)
  const recalculateInterval = (intervalObj) => {
    const parts = intervalObj.spare_part || []
    const subtotalParts = parts.reduce((acc, p) => acc + ((parseInt(p.qty, 10) || 0) * (parseInt(p.harga_satuan, 10) || 0)), 0)
    const jasa = parseInt(intervalObj.jasa, 10) || 0
    const totalSebelumPpn = subtotalParts + jasa
    const ppn = Math.round(totalSebelumPpn * 0.11) // 11% PPN acuan
    const grandTotal = totalSebelumPpn + ppn

    return {
      ...intervalObj,
      jasa,
      subtotal_spare_part: subtotalParts,
      total_sebelum_ppn: totalSebelumPpn,
      ppn_11_persen: ppn,
      grand_total: grandTotal
    }
  }

  // Recalculate totals for a Special Service (PPN 11%)
  const recalculateSpecialService = (serviceObj) => {
    const parts = serviceObj.spare_part || []
    const subtotalParts = parts.reduce((acc, p) => acc + ((parseInt(p.qty, 10) || 0) * (parseInt(p.harga_satuan, 10) || 0)), 0)
    const jasa = parseInt(serviceObj.jasa, 10) || 0
    const totalSebelumPpn = subtotalParts + jasa
    const ppn = Math.round(totalSebelumPpn * 0.11)
    const grandTotal = totalSebelumPpn + ppn

    return {
      ...serviceObj,
      jasa,
      subtotal_spare_part: subtotalParts,
      total_sebelum_ppn: totalSebelumPpn,
      ppn_11_persen: ppn,
      grand_total: grandTotal
    }
  }

  // =========================================================================
  // MODEL MANAGEMENT (ADD, RENAME, DELETE)
  // =========================================================================
  const handleOpenAddModel = () => {
    setNewModelForm({
      nama_lengkap: '',
      key: '',
      generateIntervals: true
    })
    setIsAddModelModalOpen(true)
  }

  const handleNameInputChange = (val) => {
    const autoKey = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    setNewModelForm(prev => ({
      ...prev,
      nama_lengkap: val,
      key: autoKey
    }))
  }

  const handleSaveNewModel = (e) => {
    e.preventDefault()
    const name = newModelForm.nama_lengkap.trim()
    let key = newModelForm.key.trim().toLowerCase()
    if (!name || !key) return

    // Ensure uniqueness
    if (serviceData.kendaraan && serviceData.kendaraan[key]) {
      key = `${key}_${Date.now().toString().slice(-4)}`
    }

    const newVehicleObj = {
      nama_lengkap: name,
      sheet: key,
      perawatan: newModelForm.generateIntervals ? generateDefaultIntervalsForModel(name) : {},
      layanan_khusus: []
    }

    // Generate ringkasan_biaya for this new vehicle
    const newRingkasanModel = {}
    if (newModelForm.generateIntervals) {
      Object.entries(newVehicleObj.perawatan).forEach(([kmKey, interval]) => {
        newRingkasanModel[kmKey] = {
          grand_total: interval.grand_total,
          free_service: interval.status_free_service
        }
      })
    }

    setServiceData(prev => ({
      ...prev,
      kendaraan: {
        ...prev.kendaraan,
        [key]: newVehicleObj
      },
      ringkasan_biaya: {
        ...prev.ringkasan_biaya,
        [key]: newRingkasanModel
      }
    }))

    setSelectedModelKey(key)
    setSelectedKm('10000')
    setModelViewMode('interval')
    setIsAddModelModalOpen(false)
    setHasUnsavedChanges(true)

    setFeedback({
      type: 'success',
      message: `Model kendaraan "${name}" berhasil ditambahkan! Silakan atur rincian interval atau layanan servis khusus.`
    })
  }

  const handleSaveRenameModel = (e) => {
    e.preventDefault()
    if (!vehicleToRename || !vehicleToRename.nama_lengkap.trim()) return

    const key = vehicleToRename.key
    const newName = vehicleToRename.nama_lengkap.trim()

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[key], nama_lengkap: newName }
      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [key]: updatedModel
        }
      }
    })

    setVehicleToRename(null)
    setHasUnsavedChanges(true)
  }

  const handleConfirmDeleteModel = () => {
    if (!vehicleToDelete) return

    const key = vehicleToDelete
    const remainingModels = { ...serviceData.kendaraan }
    delete remainingModels[key]

    const remainingRingkasan = { ...serviceData.ringkasan_biaya }
    delete remainingRingkasan[key]

    setServiceData(prev => ({
      ...prev,
      kendaraan: remainingModels,
      ringkasan_biaya: remainingRingkasan
    }))

    const availableKeys = Object.keys(remainingModels)
    if (availableKeys.length > 0) {
      setSelectedModelKey(availableKeys[0])
    } else {
      setSelectedModelKey('policy')
    }

    setVehicleToDelete(null)
    setHasUnsavedChanges(true)
    setFeedback({
      type: 'success',
      message: `Model kendaraan berhasil dihapus dari basis data.`
    })
  }

  // =========================================================================
  // INTERVAL SERVICE LOGIC (UPDATE JASA, TOGGLE FREE, PART ADD/EDIT/DELETE)
  // =========================================================================
  const handleUpdateJasa = (newJasa) => {
    if (!currentModel || !activeIntervalData) return

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const updatedIntervals = { ...updatedModel.perawatan }
      const currentInterval = { ...updatedIntervals[selectedKm] }

      currentInterval.jasa = parseInt(newJasa, 10) || 0
      const recalculated = recalculateInterval(currentInterval)
      updatedIntervals[selectedKm] = recalculated
      updatedModel.perawatan = updatedIntervals

      const updatedRingkasan = { ...prev.ringkasan_biaya }
      if (updatedRingkasan[selectedModelKey]) {
        updatedRingkasan[selectedModelKey] = {
          ...updatedRingkasan[selectedModelKey],
          [selectedKm]: {
            grand_total: recalculated.grand_total,
            free_service: recalculated.status_free_service
          }
        }
      }

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        },
        ringkasan_biaya: updatedRingkasan
      }
    })

    setHasUnsavedChanges(true)
  }

  const handleToggleFreeService = () => {
    if (!currentModel || !activeIntervalData) return

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const updatedIntervals = { ...updatedModel.perawatan }
      const currentInterval = { ...updatedIntervals[selectedKm] }

      currentInterval.status_free_service = !currentInterval.status_free_service
      if (currentInterval.status_free_service) {
        currentInterval.catatan_free_service = 'FREE jasa dan spare part (program MMKSI), berlaku s.d. 4 tahun dari PKT'
      } else {
        currentInterval.catatan_free_service = 'Biaya Mandiri Konsumen (Setelah 50.000 KM atau melewati batas 4 tahun PKT)'
      }

      updatedIntervals[selectedKm] = currentInterval
      updatedModel.perawatan = updatedIntervals

      const updatedRingkasan = { ...prev.ringkasan_biaya }
      if (updatedRingkasan[selectedModelKey]) {
        updatedRingkasan[selectedModelKey] = {
          ...updatedRingkasan[selectedModelKey],
          [selectedKm]: {
            grand_total: currentInterval.grand_total,
            free_service: currentInterval.status_free_service
          }
        }
      }

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        },
        ringkasan_biaya: updatedRingkasan
      }
    })

    setHasUnsavedChanges(true)
  }

  const handleSavePartModal = (e) => {
    e.preventDefault()
    if (!editingPartModal || !currentModel || !activeIntervalData) return

    const { mode, index, part } = editingPartModal
    const qty = parseInt(part.qty, 10) || 1
    const harga_satuan = parseInt(part.harga_satuan, 10) || 0
    const total = qty * harga_satuan

    const formattedPart = {
      nomor_part: (part.nomor_part || '').trim(),
      nama: (part.nama || '').trim(),
      qty,
      harga_satuan,
      total
    }

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const updatedIntervals = { ...updatedModel.perawatan }
      const currentInterval = { ...updatedIntervals[selectedKm] }
      const parts = [...(currentInterval.spare_part || [])]

      if (mode === 'add') {
        parts.push(formattedPart)
      } else {
        parts[index] = formattedPart
      }

      currentInterval.spare_part = parts
      const recalculated = recalculateInterval(currentInterval)
      updatedIntervals[selectedKm] = recalculated
      updatedModel.perawatan = updatedIntervals

      const updatedRingkasan = { ...prev.ringkasan_biaya }
      if (updatedRingkasan[selectedModelKey]) {
        updatedRingkasan[selectedModelKey] = {
          ...updatedRingkasan[selectedModelKey],
          [selectedKm]: {
            grand_total: recalculated.grand_total,
            free_service: recalculated.status_free_service
          }
        }
      }

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        },
        ringkasan_biaya: updatedRingkasan
      }
    })

    setEditingPartModal(null)
    setHasUnsavedChanges(true)
  }

  const handleDeletePart = (partIdx) => {
    if (!currentModel || !activeIntervalData) return

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const updatedIntervals = { ...updatedModel.perawatan }
      const currentInterval = { ...updatedIntervals[selectedKm] }
      const parts = [...(currentInterval.spare_part || [])]

      parts.splice(partIdx, 1)
      currentInterval.spare_part = parts
      const recalculated = recalculateInterval(currentInterval)
      updatedIntervals[selectedKm] = recalculated
      updatedModel.perawatan = updatedIntervals

      const updatedRingkasan = { ...prev.ringkasan_biaya }
      if (updatedRingkasan[selectedModelKey]) {
        updatedRingkasan[selectedModelKey] = {
          ...updatedRingkasan[selectedModelKey],
          [selectedKm]: {
            grand_total: recalculated.grand_total,
            free_service: recalculated.status_free_service
          }
        }
      }

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        },
        ringkasan_biaya: updatedRingkasan
      }
    })

    setHasUnsavedChanges(true)
  }

  // =========================================================================
  // SPECIAL SERVICE LOGIC (GANTI OLI SAJA, TUNE UP, SPOORING, DLL.)
  // =========================================================================
  const handleOpenAddSpecialService = () => {
    setEditingSpecialServiceModal({
      mode: 'add',
      service: {
        id: `svc_${Date.now().toString().slice(-6)}`,
        nama: '',
        kategori: 'Quick Service / Pelumasan',
        estimasi_waktu: '30 - 45 Menit',
        jasa: 150000,
        spare_part: [
          { nomor_part: '', nama: '', qty: 1, harga_satuan: 0, total: 0 }
        ],
        keterangan: ''
      }
    })
  }

  const handleOpenEditSpecialService = (svc, idx) => {
    setEditingSpecialServiceModal({
      mode: 'edit',
      index: idx,
      service: JSON.parse(JSON.stringify(svc))
    })
  }

  const handleSpecialSubpartChange = (partIdx, field, val) => {
    if (!editingSpecialServiceModal) return
    const updatedParts = [...(editingSpecialServiceModal.service.spare_part || [])]
    const p = { ...updatedParts[partIdx], [field]: val }
    const qty = parseInt(field === 'qty' ? val : p.qty, 10) || 0
    const harga = parseInt(field === 'harga_satuan' ? val : p.harga_satuan, 10) || 0
    p.total = qty * harga
    updatedParts[partIdx] = p

    setEditingSpecialServiceModal(prev => ({
      ...prev,
      service: {
        ...prev.service,
        spare_part: updatedParts
      }
    }))
  }

  const handleAddSubpartRow = () => {
    if (!editingSpecialServiceModal) return
    const updatedParts = [
      ...(editingSpecialServiceModal.service.spare_part || []),
      { nomor_part: '', nama: '', qty: 1, harga_satuan: 0, total: 0 }
    ]
    setEditingSpecialServiceModal(prev => ({
      ...prev,
      service: {
        ...prev.service,
        spare_part: updatedParts
      }
    }))
  }

  const handleRemoveSubpartRow = (partIdx) => {
    if (!editingSpecialServiceModal) return
    const updatedParts = [...(editingSpecialServiceModal.service.spare_part || [])]
    updatedParts.splice(partIdx, 1)
    setEditingSpecialServiceModal(prev => ({
      ...prev,
      service: {
        ...prev.service,
        spare_part: updatedParts
      }
    }))
  }

  const handleSaveSpecialServiceModal = (e) => {
    e.preventDefault()
    if (!editingSpecialServiceModal || !currentModel) return

    const { mode, index, service } = editingSpecialServiceModal
    const cleanedParts = (service.spare_part || [])
      .filter(p => p.nama && p.nama.trim().length > 0)
      .map(p => ({
        nomor_part: (p.nomor_part || '').trim(),
        nama: p.nama.trim(),
        qty: parseInt(p.qty, 10) || 1,
        harga_satuan: parseInt(p.harga_satuan, 10) || 0,
        total: (parseInt(p.qty, 10) || 1) * (parseInt(p.harga_satuan, 10) || 0)
      }))

    const rawService = {
      ...service,
      nama: (service.nama || '').trim(),
      kategori: (service.kategori || 'Quick Service / Pelumasan').trim(),
      estimasi_waktu: (service.estimasi_waktu || '30 - 45 Menit').trim(),
      jasa: parseInt(service.jasa, 10) || 0,
      spare_part: cleanedParts,
      keterangan: (service.keterangan || '').trim()
    }

    const calculatedService = recalculateSpecialService(rawService)

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const currentSpecialList = [...(updatedModel.layanan_khusus || [])]

      if (mode === 'add') {
        currentSpecialList.push(calculatedService)
      } else {
        currentSpecialList[index] = calculatedService
      }

      updatedModel.layanan_khusus = currentSpecialList

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        }
      }
    })

    setEditingSpecialServiceModal(null)
    setHasUnsavedChanges(true)
  }

  const handleDeleteSpecialService = (idx) => {
    if (!currentModel) return

    setServiceData(prev => {
      const updatedModel = { ...prev.kendaraan[selectedModelKey] }
      const currentSpecialList = [...(updatedModel.layanan_khusus || [])]
      currentSpecialList.splice(idx, 1)
      updatedModel.layanan_khusus = currentSpecialList

      return {
        ...prev,
        kendaraan: {
          ...prev.kendaraan,
          [selectedModelKey]: updatedModel
        }
      }
    })

    setHasUnsavedChanges(true)
  }

  // =========================================================================
  // POLICY & WARRANTY RULES
  // =========================================================================
  const handleAddPolicyNote = (e) => {
    e.preventDefault()
    const trimmed = newPolicyNoteInput.trim()
    if (!trimmed) return

    setServiceData(prev => ({
      ...prev,
      kebijakan_free_service: {
        ...prev.kebijakan_free_service,
        catatan_penting: [...(prev.kebijakan_free_service.catatan_penting || []), trimmed]
      }
    }))

    setNewPolicyNoteInput('')
    setIsAddPolicyModalOpen(false)
    setHasUnsavedChanges(true)
  }

  const handleDeletePolicyNote = (index) => {
    setServiceData(prev => {
      const list = [...(prev.kebijakan_free_service.catatan_penting || [])]
      list.splice(index, 1)
      return {
        ...prev,
        kebijakan_free_service: {
          ...prev.kebijakan_free_service,
          catatan_penting: list
        }
      }
    })
    setHasUnsavedChanges(true)
  }

  // =========================================================================
  // SAVE ALL CHANGES TO API & KNOWLEDGE FILE
  // =========================================================================
  const handleSaveAll = async () => {
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/service-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          data: serviceData,
          title: 'Master Data Estimasi & Jadwal Perawatan Berkala Mitsubishi',
          category: 'aftersales_service',
          updated_by: 'Admin Portal Margahayu'
        })
      })

      const json = await res.json()
      if (json.success) {
        setHasUnsavedChanges(false)
        setFeedback({
          type: 'success',
          message: 'Berhasil menyimpan seluruh perubahan Data Servis! Pengetahuan Sunny AI telah terupdate secara instan.'
        })
      } else {
        setFeedback({
          type: 'error',
          message: json.message || 'Gagal menyimpan data servis ke server database.'
        })
      }
    } catch (err) {
      console.error('Error saving service data:', err)
      setFeedback({
        type: 'error',
        message: 'Terjadi gangguan jaringan saat menyimpan data ke API.'
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
      const res = await fetch(`${API_BASE_URL}/knowledge/service-data/reset`, {
        method: 'POST',
        headers: { Accept: 'application/json' }
      })
      const json = await res.json()
      if (json.success) {
        await fetchServiceData()
        setFeedback({
          type: 'success',
          message: 'Data perawatan berkala berhasil dikembalikan ke file default bawaan dealer.'
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

  if (loading) {
    return (
      <div className="portal-sv-page">
        <div className="sv-loading-state">
          <HiOutlineArrowPath size={36} className="spin-slow text-red" />
          <p>Memuat basis data Perawatan Berkala (Service Data)...</p>
        </div>
      </div>
    )
  }

  // Build model options dynamically from serviceData.kendaraan
  const vehicleList = Object.entries(serviceData.kendaraan || {}).map(([key, v]) => ({
    key,
    label: v.nama_lengkap || key,
    intervalCount: Object.keys(v.perawatan || {}).length,
    specialCount: (v.layanan_khusus || []).length
  }))

  return (
    <div className="portal-sv-page">
      {/* Header Bar (Full-Width) */}
      <div className="sv-header-row">
        <div className="sv-title-group">
          <div className="sv-title-badge">
            <HiOutlineWrenchScrewdriver size={16} />
            <span>Public Knowledge — Data Servis Berkala &amp; Layanan Khusus</span>
          </div>
          <h1>Manajemen Estimasi &amp; Paket Servis Dealer</h1>
          <p>
            Kelola model kendaraan Mitsubishi secara dinamis, jadwal perawatan berkala (10.000 s/d 100.000 KM), paket <strong>Layanan Servis Khusus (Ganti Oli Saja, Tune Up, Servis Rem, Spooring, dll.)</strong>, serta kebijakan garansi resmi. Perubahan data ini langsung aktif sebagai basis pengetahuan cerdas <strong>Sunny AI</strong>.
          </p>
        </div>

        <div className="sv-header-actions">
          <button
            type="button"
            className="sv-btn-add-model"
            onClick={handleOpenAddModel}
            title="Tambah model kendaraan baru (misal Destinator, Xforce, Triton, dll.)"
          >
            <HiOutlinePlus size={16} />
            <span>Tambah Model Kendaraan</span>
          </button>

          <button
            type="button"
            className="sv-btn-reset"
            onClick={() => setIsResetConfirmModalOpen(true)}
            disabled={saving}
            title="Kembalikan semua data ke file bawaan awal dealer"
          >
            <HiOutlineArrowPath size={16} className={saving ? 'spin-slow' : ''} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            className="sv-btn-save"
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
                <span>Simpan Perubahan Servis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="sv-unsaved-banner">
          <div className="sv-unsaved-content">
            <HiOutlineExclamationTriangle size={22} className="sv-unsaved-icon" />
            <div>
              <strong>Ada perubahan servis yang belum disimpan!</strong>
              <p>Perubahan yang Anda lakukan hanya tersimpan di sesi lokal ini. Klik tombol merah "Simpan Perubahan Servis" di atas untuk memperbarui basis pengetahuan Sunny AI dan sistem dealer.</p>
            </div>
          </div>
          <button type="button" className="sv-btn-quick-save" onClick={handleSaveAll} disabled={saving}>
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`sv-feedback-banner sv-feedback-${feedback.type}`}>
          <div className="sv-feedback-icon">
            {feedback.type === 'success' ? <HiOutlineCheck size={20} /> : <HiOutlineExclamationTriangle size={20} />}
          </div>
          <div className="sv-feedback-text">{feedback.message}</div>
          <button type="button" className="sv-feedback-close" onClick={() => setFeedback(null)}>
            <HiOutlineXMark size={16} />
          </button>
        </div>
      )}

      {/* Main Model Selector Bar (Dynamic Tabs) */}
      <div className="sv-model-selector-bar">
        {vehicleList.map((v) => (
          <button
            key={v.key}
            type="button"
            className={`sv-model-tab-btn ${selectedModelKey === v.key ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedModelKey(v.key)
              setSelectedKm('10000')
            }}
          >
            <RiCarLine size={18} />
            <span>{v.label}</span>
            <span className="sv-tab-counter">
              {v.intervalCount} KM | {v.specialCount} Khusus
            </span>
          </button>
        ))}

        <button
          type="button"
          className={`sv-model-tab-btn ${selectedModelKey === 'policy' ? 'is-active' : ''}`}
          onClick={() => setSelectedModelKey('policy')}
        >
          <HiOutlineShieldCheck size={18} />
          <span>Kebijakan Free Service &amp; Garansi</span>
          <span className="sv-tab-counter">Aturan Resmi</span>
        </button>
      </div>

      {/* VIEW: VEHICLE MODEL WORKSPACE */}
      {selectedModelKey !== 'policy' && currentModel && (
        <div className="sv-model-workspace">
          {/* Model Header Bar & View Mode Switcher */}
          <div className="sv-model-header-card">
            <div className="sv-model-info-col">
              <div className="sv-model-badge-row">
                <span className="sv-model-slug-tag">Kode: {selectedModelKey}</span>
                <span className="sv-model-tax-tag">PPN 11% Aktif</span>
              </div>
              <div className="sv-model-title-action-row">
                <h2 className="sv-model-main-title">{currentModel.nama_lengkap}</h2>
                <div className="sv-model-quick-actions">
                  <button
                    type="button"
                    className="sv-btn-action-ghost"
                    onClick={() => setVehicleToRename({ key: selectedModelKey, nama_lengkap: currentModel.nama_lengkap })}
                    title="Ubah nama tampilan model kendaraan ini"
                  >
                    <HiOutlinePencilSquare size={16} />
                    <span>Ubah Nama</span>
                  </button>
                  <button
                    type="button"
                    className="sv-btn-action-ghost delete"
                    onClick={() => setVehicleToDelete(selectedModelKey)}
                    title="Hapus model kendaraan ini dari sistem"
                  >
                    <HiOutlineTrash size={16} />
                    <span>Hapus Model</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-tabs / Switcher between Intervals vs Special Services */}
            <div className="sv-viewmode-switcher">
              <button
                type="button"
                className={`sv-viewmode-btn ${modelViewMode === 'interval' ? 'active' : ''}`}
                onClick={() => setModelViewMode('interval')}
              >
                <HiOutlineCalendarDays size={18} />
                <span>Jadwal Servis Berkala (Interval KM)</span>
                <span className="sv-viewmode-pill">{Object.keys(currentModel.perawatan || {}).length}</span>
              </button>

              <button
                type="button"
                className={`sv-viewmode-btn ${modelViewMode === 'special_service' ? 'active' : ''}`}
                onClick={() => setModelViewMode('special_service')}
              >
                <HiOutlineBolt size={18} />
                <span>Layanan Servis Khusus (Non-Interval)</span>
                <span className="sv-viewmode-pill highlight">{(currentModel.layanan_khusus || []).length}</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: JADWAL SERVIS BERKALA (INTERVAL KM) */}
          {modelViewMode === 'interval' && (
            <>
              {/* KM Interval Timeline Pills Bar */}
              <div className="sv-km-timeline-card">
                <div className="sv-km-timeline-header">
                  <div>
                    <h3 className="sv-timeline-title">Pilih Interval Jarak Tempuh (Kilometer)</h3>
                    <span className="sv-timeline-sub">Pilih kelipatan KM di bawah untuk melihat dan mengelola rincian jasa dan suku cadang terkait.</span>
                  </div>
                  <span className="sv-model-indicator">Model: <strong>{currentModel.nama_lengkap}</strong></span>
                </div>

                <div className="sv-km-pills-row">
                  {INTERVAL_KEYS.map((kmKey) => {
                    const interval = currentModel.perawatan?.[kmKey] || {}
                    const isSelected = selectedKm === kmKey
                    const isFree = !!interval.status_free_service
                    const kmNum = parseInt(kmKey, 10).toLocaleString('id-ID')

                    return (
                      <button
                        key={kmKey}
                        type="button"
                        className={`sv-km-pill-btn ${isSelected ? 'is-selected' : ''} ${isFree ? 'is-free' : 'is-paid'}`}
                        onClick={() => setSelectedKm(kmKey)}
                      >
                        <span className="sv-km-pill-num">{kmNum} KM</span>
                        <span className={`sv-km-pill-badge ${isFree ? 'badge-free' : 'badge-paid'}`}>
                          {isFree ? 'FREE SERVICE' : 'BIAYA MANDIRI'}
                        </span>
                        <span className="sv-km-pill-price">{formatIDR(interval.grand_total)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ACTIVE KM INTERVAL DETAILS */}
              {activeIntervalData ? (
                <div className="sv-interval-content-card">
                  {/* Header of Active Interval */}
                  <div className="sv-interval-header">
                    <div className="sv-interval-title-col">
                      <div className="sv-interval-badge-row">
                        <span className="sv-km-tag">{parseInt(selectedKm, 10).toLocaleString('id-ID')} KM</span>
                        <span className={`sv-free-status-tag ${activeIntervalData.status_free_service ? 'tag-free' : 'tag-paid'}`}>
                          {activeIntervalData.status_free_service ? '✓ Program Free Service MMKSI Aktif' : 'Biaya Mandiri Konsumen'}
                        </span>
                      </div>
                      <h3 className="sv-interval-heading">
                        Rincian Servis Berkala {currentModel.nama_lengkap} — {parseInt(selectedKm, 10).toLocaleString('id-ID')} KM
                      </h3>
                      <p className="sv-interval-note">{activeIntervalData.catatan_free_service}</p>
                    </div>

                    {/* Free Service Toggle */}
                    <div className="sv-free-toggle-box">
                      <label className="sv-switch-label">
                        <span>Status Bebas Biaya (Free Service):</span>
                        <div
                          className={`sv-toggle-switch ${activeIntervalData.status_free_service ? 'active' : ''}`}
                          onClick={handleToggleFreeService}
                          title="Klik untuk mengubah status Free Service"
                        >
                          <div className="sv-toggle-slider" />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Financial Calculation Cards Strip */}
                  <div className="sv-calculation-strip">
                    <div className="sv-calc-card">
                      <span className="sv-calc-label">Biaya Jasa Servis</span>
                      <div className="sv-calc-input-row">
                        <span className="sv-calc-prefix">Rp</span>
                        <input
                          type="number"
                          value={activeIntervalData.jasa || 0}
                          onChange={(e) => handleUpdateJasa(e.target.value)}
                          className="sv-calc-input"
                          title="Ubah tarif biaya jasa untuk KM ini"
                        />
                      </div>
                      <span className="sv-calc-sub">{formatIDR(activeIntervalData.jasa)}</span>
                    </div>

                    <div className="sv-calc-card">
                      <span className="sv-calc-label">Subtotal Suku Cadang</span>
                      <div className="sv-calc-val">{formatIDR(activeIntervalData.subtotal_spare_part)}</div>
                      <span className="sv-calc-sub">{activeIntervalData.spare_part?.length || 0} Item Part Terdaftar</span>
                    </div>

                    <div className="sv-calc-card">
                      <span className="sv-calc-label">PPN (11% Acuan)</span>
                      <div className="sv-calc-val">
                        {formatIDR(activeIntervalData.ppn_11_persen ?? activeIntervalData.ppn_10_persen)}
                      </div>
                      <span className="sv-calc-sub">Dari total jasa + part</span>
                    </div>

                    <div className="sv-calc-card highlight">
                      <span className="sv-calc-label">Grand Total Estimasi</span>
                      <div className="sv-calc-val text-red">{formatIDR(activeIntervalData.grand_total)}</div>
                      <span className="sv-calc-sub">
                        {activeIntervalData.status_free_service ? 'Gratis jika syarat 4 thn PKT terpenuhi' : 'Biaya acuan tagihan resmi'}
                      </span>
                    </div>
                  </div>

                  {/* Spare Parts Table */}
                  <div className="sv-parts-section">
                    <div className="sv-parts-header-row">
                      <div>
                        <h4 className="sv-parts-title">Daftar Suku Cadang &amp; Pelumas yang Diganti</h4>
                        <span className="sv-parts-sub">Item onderdil resmi MMGO yang wajib diperbarui pada interval kilometer ini.</span>
                      </div>

                      <button
                        type="button"
                        className="sv-btn-add-part"
                        onClick={() => setEditingPartModal({
                          mode: 'add',
                          part: { nomor_part: '', nama: '', qty: 1, harga_satuan: 0 }
                        })}
                      >
                        <HiOutlinePlus size={16} />
                        <span>Tambah Suku Cadang Baru</span>
                      </button>
                    </div>

                    <div className="sv-table-container">
                      <table className="sv-table">
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}>No</th>
                            <th style={{ width: '150px' }}>Nomor Part</th>
                            <th>Nama Suku Cadang / Pelumas</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
                            <th style={{ width: '160px', textAlign: 'right' }}>Harga Satuan</th>
                            <th style={{ width: '170px', textAlign: 'right' }}>Total</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!activeIntervalData.spare_part || activeIntervalData.spare_part.length === 0) ? (
                            <tr>
                              <td colSpan="7" className="sv-table-empty">
                                Belum ada suku cadang yang didaftarkan untuk interval servis ini.
                              </td>
                            </tr>
                          ) : (
                            activeIntervalData.spare_part.map((p, idx) => (
                              <tr key={idx}>
                                <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                                <td>
                                  <span className="sv-part-code">{p.nomor_part || '-'}</span>
                                </td>
                                <td>
                                  <strong className="sv-part-name">{p.nama}</strong>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.qty}</td>
                                <td style={{ textAlign: 'right' }}>{formatIDR(p.harga_satuan)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                  {formatIDR(p.total || ((p.qty || 1) * (p.harga_satuan || 0)))}
                                </td>
                                <td>
                                  <div className="sv-table-actions">
                                    <button
                                      type="button"
                                      className="sv-action-btn edit"
                                      onClick={() => setEditingPartModal({
                                        mode: 'edit',
                                        index: idx,
                                        part: { ...p }
                                      })}
                                      title="Edit suku cadang ini"
                                    >
                                      <HiOutlinePencilSquare size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      className="sv-action-btn delete"
                                      onClick={() => handleDeletePart(idx)}
                                      title="Hapus suku cadang dari servis ini"
                                    >
                                      <HiOutlineTrash size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sunny AI Knowledge Preview Box */}
                  <div className="sv-ai-preview-card">
                    <div className="sv-ai-preview-header">
                      <div className="sv-ai-preview-icon">
                        <HiOutlineSparkles size={20} />
                      </div>
                      <div>
                        <h4>Pratinjau Respon Sunny AI untuk Interval Ini</h4>
                        <p>Contoh jawaban cerdas yang akan diberikan Sunny AI jika konsumen bertanya tentang biaya dan rincian servis {selectedKm} KM {currentModel.nama_lengkap}.</p>
                      </div>
                    </div>

                    <div className="sv-ai-chat-bubble">
                      <p>
                        Halo! Untuk servis berkala <strong>{currentModel.nama_lengkap}</strong> pada <strong>{parseInt(selectedKm, 10).toLocaleString('id-ID')} KM</strong>:
                      </p>
                      <p>
                        {activeIntervalData.status_free_service ? (
                          <>
                            ✅ <strong>GRATIS (FREE SERVICE):</strong> Jasa dan suku cadang sepenuhnya ditanggung oleh program resmi MMKSI (syarat dalam batas 4 tahun sejak tanggal serah terima kendaraan/PKT). Nilai acuan servis ini adalah senilai <strong>{formatIDR(activeIntervalData.grand_total)}</strong>.
                          </>
                        ) : (
                          <>
                            💰 <strong>ESTIMASI BIAYA MANDIRI:</strong> Total estimasi adalah sekitar <strong>{formatIDR(activeIntervalData.grand_total)}</strong> (termasuk Jasa {formatIDR(activeIntervalData.jasa)} + Suku Cadang {formatIDR(activeIntervalData.subtotal_spare_part)} + PPN 11%).
                          </>
                        )}
                      </p>
                      <p>
                        Onderdil dan pelumas resmi yang diganti pada servis ini mencakup:
                      </p>
                      <ul>
                        {(activeIntervalData.spare_part || []).map((p, i) => (
                          <li key={i}>
                            {p.nama} ({p.qty}x) {p.nomor_part ? `— Part No: ${p.nomor_part}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sv-empty-interval-card">
                  <HiOutlineInformationCircle size={32} className="text-red" />
                  <h4>Interval {parseInt(selectedKm, 10).toLocaleString('id-ID')} KM Belum Dikonfigurasi</h4>
                  <p>Model ini belum memiliki data untuk interval kilometer ini. Anda dapat menambahkan interval atau mengaktifkan template otomatis.</p>
                </div>
              )}
            </>
          )}

          {/* SUB-VIEW 2: LAYANAN SERVIS KHUSUS & QUICK SERVICE (GANTI OLI SAJA, DLL.) */}
          {modelViewMode === 'special_service' && (
            <div className="sv-special-section">
              <div className="sv-special-header-row">
                <div>
                  <h3 className="sv-special-title">Paket Layanan Servis Khusus &amp; Quick Service — {currentModel.nama_lengkap}</h3>
                  <p className="sv-special-sub">
                    Kelola paket pekerjaan servis di luar jadwal kilometer berkala (contoh: <strong>Ganti Oli Saja</strong>, Tune Up &amp; Throttle Clean, Servis Rem 4 Roda, Spooring 3D &amp; Balancing, Kuras Minyak Rem, dll.). Konsumen dapat memesan paket ini secara mandiri kapan saja.
                  </p>
                </div>

                <button
                  type="button"
                  className="sv-btn-add-special"
                  onClick={handleOpenAddSpecialService}
                >
                  <HiOutlinePlus size={16} />
                  <span>Tambah Jenis Servis Khusus</span>
                </button>
              </div>

              {/* Grid of Special Service Cards */}
              {(!currentModel.layanan_khusus || currentModel.layanan_khusus.length === 0) ? (
                <div className="sv-empty-special-card">
                  <HiOutlineBolt size={40} className="text-red" />
                  <h4>Belum Ada Layanan Servis Khusus untuk {currentModel.nama_lengkap}</h4>
                  <p>Tambahkan layanan seperti <strong>"Ganti Oli Mesin Saja (Quick Lube)"</strong>, <strong>"Tune Up &amp; Carbon Clean"</strong>, atau <strong>"Spooring &amp; Balancing 3D"</strong> agar Sunny AI dapat merekomendasikannya kepada konsumen.</p>
                  <button type="button" className="sv-btn-add-special-empty" onClick={handleOpenAddSpecialService}>
                    <HiOutlinePlus size={16} />
                    <span>Tambah Layanan Servis Khusus Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="sv-special-grid">
                  {currentModel.layanan_khusus.map((svc, idx) => (
                    <div key={svc.id || idx} className="sv-special-card">
                      <div className="sv-special-card-top">
                        <div className="sv-special-badges">
                          <span className="sv-special-badge-cat">{svc.kategori || 'Quick Service'}</span>
                          {svc.estimasi_waktu && (
                            <span className="sv-special-badge-time">
                              <HiOutlineClock size={12} />
                              <span>{svc.estimasi_waktu}</span>
                            </span>
                          )}
                        </div>

                        <div className="sv-special-actions">
                          <button
                            type="button"
                            className="sv-action-btn edit"
                            onClick={() => handleOpenEditSpecialService(svc, idx)}
                            title="Edit paket servis khusus ini"
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>
                          <button
                            type="button"
                            className="sv-action-btn delete"
                            onClick={() => handleDeleteSpecialService(idx)}
                            title="Hapus paket servis khusus ini"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <h4 className="sv-special-card-title">{svc.nama}</h4>
                      {svc.keterangan && <p className="sv-special-card-desc">{svc.keterangan}</p>}

                      {/* Financial Pricing Strip */}
                      <div className="sv-special-pricing-grid">
                        <div className="sv-special-price-item">
                          <span className="sv-p-label">Jasa Mekanik</span>
                          <span className="sv-p-val">{formatIDR(svc.jasa)}</span>
                        </div>
                        <div className="sv-special-price-item">
                          <span className="sv-p-label">Suku Cadang</span>
                          <span className="sv-p-val">{formatIDR(svc.subtotal_spare_part)}</span>
                        </div>
                        <div className="sv-special-price-item">
                          <span className="sv-p-label">PPN 11%</span>
                          <span className="sv-p-val">{formatIDR(svc.ppn_11_persen)}</span>
                        </div>
                        <div className="sv-special-price-item grand">
                          <span className="sv-p-label">Grand Total Resmi</span>
                          <span className="sv-p-val text-red">{formatIDR(svc.grand_total)}</span>
                        </div>
                      </div>

                      {/* Spare Parts Breakdown List */}
                      <div className="sv-special-parts-container">
                        <span className="sv-parts-list-label">Suku Cadang / Pelumas yang Digunakan:</span>
                        {(!svc.spare_part || svc.spare_part.length === 0) ? (
                          <span className="sv-parts-none">Hanya jasa pengerjaan teknisi (tanpa penggantian spare part).</span>
                        ) : (
                          <div className="sv-special-parts-chips">
                            {svc.spare_part.map((sp, pIdx) => (
                              <span key={pIdx} className="sv-special-part-chip" title={`${formatIDR(sp.harga_satuan)} x ${sp.qty}`}>
                                <strong>{sp.nama}</strong> ({sp.qty}x)
                                {sp.nomor_part && <small> {sp.nomor_part}</small>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sunny AI Preview for Special Services */}
              <div className="sv-ai-preview-card" style={{ marginTop: '1.5rem' }}>
                <div className="sv-ai-preview-header">
                  <div className="sv-ai-preview-icon">
                    <HiOutlineSparkles size={20} />
                  </div>
                  <div>
                    <h4>Pratinjau Respon Sunny AI untuk Servis Khusus</h4>
                    <p>Contoh jawaban cerdas yang akan diberikan Sunny AI jika konsumen bertanya: <em>"Berapa biaya ganti oli saja untuk {currentModel.nama_lengkap}?"</em></p>
                  </div>
                </div>

                <div className="sv-ai-chat-bubble">
                  <p>
                    Halo! Untuk layanan <strong>Ganti Oli Mesin Saja (Quick Lube)</strong> {currentModel.nama_lengkap} di bengkel resmi kami:
                  </p>
                  <p>
                    💰 <strong>ESTIMASI BIAYA:</strong> Sekitar <strong>{formatIDR(currentModel.layanan_khusus?.[0]?.grand_total || 816960)}</strong> (sudah termasuk pelumas original MMGO pabrikan, filter oli asli, ring baut karter, jasa mekanik resmi, dan PPN 11%).
                  </p>
                  <p>
                    ⏱️ <strong>ESTIMASI WAKTU:</strong> Pengerjaan cepat sekitar <strong>{currentModel.layanan_khusus?.[0]?.estimasi_waktu || '30 - 45 Menit'}</strong> tanpa perlu antre panjang jika melakukan booking terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: POLICY & WARRANTY TAB */}
      {selectedModelKey === 'policy' && (
        <div className="sv-policy-workspace">
          {/* Policy Overview Card */}
          <div className="sv-card">
            <div className="sv-policy-header">
              <HiOutlineShieldCheck size={26} className="text-red" />
              <div>
                <h3 className="sv-card-title">{serviceData.kebijakan_free_service?.nama_program}</h3>
                <p className="sv-card-desc">
                  Penyelenggara: <strong>{serviceData.kebijakan_free_service?.penyelenggara}</strong> | Batas Waktu: <strong>{serviceData.kebijakan_free_service?.batas_waktu?.durasi}</strong> sejak {serviceData.kebijakan_free_service?.batas_waktu?.acuan}
                </p>
              </div>
            </div>

            <div className="sv-policy-body">
              <div className="sv-policy-km-strip">
                <span className="sv-policy-km-label">Cakupan Kilometer Gratis:</span>
                <div className="sv-policy-km-tags">
                  {(serviceData.kebijakan_free_service?.cakupan_km || []).map((km) => (
                    <span key={km} className="sv-policy-km-pill">
                      {km.toLocaleString('id-ID')} KM
                    </span>
                  ))}
                </div>
              </div>

              <div className="sv-policy-desc-box">
                <strong>Ketentuan Batas Waktu:</strong>
                <p>{serviceData.kebijakan_free_service?.batas_waktu?.keterangan}</p>
              </div>
            </div>
          </div>

          {/* Important Rules and Warranty Notes List */}
          <div className="sv-card">
            <div className="sv-policy-notes-header">
              <div>
                <h4 className="sv-notes-title">Catatan Penting, Syarat &amp; Ketentuan Garansi Resmi</h4>
                <p className="sv-notes-desc">
                  Kaidah acuan yang digunakan oleh Sunny AI saat menjawab pertanyaan garansi ban, aki/accu, Destinator, Xforce, dan model lainnya.
                </p>
              </div>

              <button
                type="button"
                className="sv-btn-add-note"
                onClick={() => setIsAddPolicyModalOpen(true)}
              >
                <HiOutlinePlus size={16} />
                <span>Tambah Catatan Garansi</span>
              </button>
            </div>

            <div className="sv-policy-notes-list">
              {(serviceData.kebijakan_free_service?.catatan_penting || []).map((note, idx) => (
                <div key={idx} className="sv-policy-note-item">
                  <div className="sv-note-number-badge">{idx + 1}</div>
                  <span className="sv-note-text">{note}</span>
                  <button
                    type="button"
                    className="sv-btn-remove-note"
                    onClick={() => handleDeletePolicyNote(idx)}
                    title="Hapus catatan ini"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* MODAL 1: TAMBAH MODEL KENDARAAN BARU */}
      {isAddModelModalOpen && (
        <div className="sv-modal-backdrop" onClick={() => setIsAddModelModalOpen(false)}>
          <div className="sv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">Tambah Model Kendaraan Baru</h3>
              <button type="button" className="sv-modal-close" onClick={() => setIsAddModelModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewModel} className="sv-modal-form">
              <div className="sv-modal-scroll-body">
                <div className="sv-form-group">
                <label className="sv-form-label">
                  Nama Lengkap Kendaraan: <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={newModelForm.nama_lengkap}
                  onChange={(e) => handleNameInputChange(e.target.value)}
                  placeholder="Contoh: Mitsubishi Destinator, Mitsubishi Xforce"
                  required
                  autoFocus
                  className="sv-modal-input"
                />
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">
                  Kode / Slug Kunci Sistem: <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={newModelForm.key}
                  onChange={(e) => setNewModelForm(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Contoh: destinator, xforce, triton"
                  required
                  className="sv-modal-input"
                />
                <span className="sv-form-preview-val">Digunakan sebagai pengenal unik di database sistem dan AI.</span>
              </div>

              <div className="sv-form-checkbox-box">
                <label className="sv-checkbox-label">
                  <input
                    type="checkbox"
                    checked={newModelForm.generateIntervals}
                    onChange={(e) => setNewModelForm(prev => ({ ...prev, generateIntervals: e.target.checked }))}
                  />
                  <span>Generate Otomatis Template 10 Interval Servis Berkala (10.000 s/d 100.000 KM)</span>
                </label>
                <span className="sv-checkbox-desc">
                  Secara cerdas mengisi tarif estimasi jasa &amp; onderdil awal (Oli Mesin, Filter Oli, Filter AC) dengan kalkulasi PPN 11% yang siap diedit kembali.
                </span>
              </div>

                            </div>

              <div className="sv-modal-actions">
                <button type="button" className="sv-btn-cancel" onClick={() => setIsAddModelModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="sv-btn-submit">
                  Tambahkan Model Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UBAH NAMA MODEL KENDARAAN */}
      {vehicleToRename && (
        <div className="sv-modal-backdrop" onClick={() => setVehicleToRename(null)}>
          <div className="sv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">Ubah Nama Model Kendaraan</h3>
              <button type="button" className="sv-modal-close" onClick={() => setVehicleToRename(null)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRenameModel} className="sv-modal-form">
              <div className="sv-form-group">
                <label className="sv-form-label">Nama Model Baru:</label>
                <input
                  type="text"
                  value={vehicleToRename.nama_lengkap}
                  onChange={(e) => setVehicleToRename(prev => ({ ...prev, nama_lengkap: e.target.value }))}
                  required
                  autoFocus
                  className="sv-modal-input"
                />
              </div>

              <div className="sv-modal-actions">
                <button type="button" className="sv-btn-cancel" onClick={() => setVehicleToRename(null)}>
                  Batal
                </button>
                <button type="submit" className="sv-btn-submit">
                  Simpan Nama Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS MODEL KENDARAAN */}
      {vehicleToDelete && (
        <div className="sv-modal-backdrop" onClick={() => setVehicleToDelete(null)}>
          <div className="sv-modal-card sv-modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <div className="sv-danger-title-row">
                <HiOutlineExclamationTriangle size={22} className="text-red" />
                <h3 className="sv-modal-title">Konfirmasi Hapus Model</h3>
              </div>
              <button type="button" className="sv-modal-close" onClick={() => setVehicleToDelete(null)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <div className="sv-modal-scroll-body">
              <p className="sv-modal-warning-text">
              Apakah Anda yakin ingin menghapus model kendaraan <strong>{serviceData.kendaraan?.[vehicleToDelete]?.nama_lengkap || vehicleToDelete}</strong>?
              <br /><br />
              Seluruh data jadwal servis berkala dan layanan khusus untuk model ini akan dihapus dari sistem.
            </p>
            </div>

            <div className="sv-modal-actions">
              <button type="button" className="sv-btn-cancel" onClick={() => setVehicleToDelete(null)}>
                Batal
              </button>
              <button type="button" className="sv-btn-danger" onClick={handleConfirmDeleteModel}>
                Ya, Hapus Model Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH / EDIT LAYANAN SERVIS KHUSUS */}
      {editingSpecialServiceModal && (
        <div className="sv-modal-backdrop" onClick={() => setEditingSpecialServiceModal(null)}>
          <div className="sv-modal-card sv-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {editingSpecialServiceModal.mode === 'add' ? 'Tambah Layanan Servis Khusus Baru' : 'Edit Layanan Servis Khusus'}
              </h3>
              <button type="button" className="sv-modal-close" onClick={() => setEditingSpecialServiceModal(null)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialServiceModal} className="sv-modal-form">
              <div className="sv-modal-scroll-body">
                <div className="sv-form-row-2">
                <div className="sv-form-group">
                  <label className="sv-form-label">
                    Nama Layanan Khusus: <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSpecialServiceModal.service.nama || ''}
                    onChange={(e) => setEditingSpecialServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, nama: e.target.value }
                    }))}
                    placeholder="Contoh: Ganti Oli Mesin Saja, Tune Up"
                    required
                    autoFocus
                    className="sv-modal-input"
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-form-label">
                    Kategori Layanan: <span className="req">*</span>
                  </label>
                  <select
                    value={editingSpecialServiceModal.service.kategori || 'Quick Service / Pelumasan'}
                    onChange={(e) => setEditingSpecialServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, kategori: e.target.value }
                    }))}
                    className="sv-modal-input"
                  >
                    <option value="Quick Service / Pelumasan">Quick Service / Pelumasan (Ganti Oli)</option>
                    <option value="Mesin & Performa">Mesin & Performa (Tune Up, Purging)</option>
                    <option value="Sistem Pengereman">Sistem Pengereman (Servis Rem, Minyak Rem)</option>
                    <option value="Roda & Kemudi">Roda & Kemudi (Spooring, Balancing)</option>
                    <option value="AC & Kelistrikan">AC & Kelistrikan (Filter, Evaporator)</option>
                    <option value="Transmisi & Fluida">Transmisi & Fluida (CVT, Gardan)</option>
                    <option value="Perawatan Lainnya">Perawatan Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="sv-form-row-2">
                <div className="sv-form-group">
                  <label className="sv-form-label">Estimasi Waktu Pengerjaan:</label>
                  <input
                    type="text"
                    value={editingSpecialServiceModal.service.estimasi_waktu || ''}
                    onChange={(e) => setEditingSpecialServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, estimasi_waktu: e.target.value }
                    }))}
                    placeholder="Contoh: 30 - 45 Menit, 1 Jam"
                    className="sv-modal-input"
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-form-label">
                    Biaya Jasa Mekanik (Rp): <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingSpecialServiceModal.service.jasa || 0}
                    onChange={(e) => setEditingSpecialServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, jasa: parseInt(e.target.value, 10) || 0 }
                    }))}
                    required
                    className="sv-modal-input"
                  />
                  <span className="sv-form-preview-val">Format Jasa: <strong>{formatIDR(editingSpecialServiceModal.service.jasa)}</strong></span>
                </div>
              </div>

              {/* Sub-Editor: Suku Cadang & Pelumas yang dibutuhkan */}
              <div className="sv-special-subparts-box">
                <div className="sv-special-subparts-header">
                  <div>
                    <strong className="sv-subparts-title">Suku Cadang &amp; Pelumas yang Dibutuhkan</strong>
                    <span className="sv-subparts-sub">Tambahkan komponen part yang wajib diganti dalam paket servis khusus ini.</span>
                  </div>
                  <button type="button" className="sv-btn-add-subpart" onClick={handleAddSubpartRow}>
                    <HiOutlinePlus size={14} />
                    <span>Tambah Item Part</span>
                  </button>
                </div>

                <div className="sv-subparts-list">
                  {(!editingSpecialServiceModal.service.spare_part || editingSpecialServiceModal.service.spare_part.length === 0) ? (
                    <div className="sv-subparts-empty">
                      Belum ada suku cadang ditambahkan (paket ini murni hanya jasa mekanik).
                    </div>
                  ) : (
                    editingSpecialServiceModal.service.spare_part.map((sp, pIdx) => (
                      <div key={pIdx} className="sv-subpart-row">
                        <div className="sv-subpart-col part-no">
                          <input
                            type="text"
                            value={sp.nomor_part || ''}
                            onChange={(e) => handleSpecialSubpartChange(pIdx, 'nomor_part', e.target.value)}
                            placeholder="Nomor Part"
                            className="sv-subpart-input"
                          />
                        </div>
                        <div className="sv-subpart-col part-name">
                          <input
                            type="text"
                            value={sp.nama || ''}
                            onChange={(e) => handleSpecialSubpartChange(pIdx, 'nama', e.target.value)}
                            placeholder="Nama Suku Cadang / Pelumas"
                            required
                            className="sv-subpart-input"
                          />
                        </div>
                        <div className="sv-subpart-col part-qty">
                          <input
                            type="number"
                            min="1"
                            value={sp.qty || 1}
                            onChange={(e) => handleSpecialSubpartChange(pIdx, 'qty', e.target.value)}
                            placeholder="Qty"
                            className="sv-subpart-input center"
                          />
                        </div>
                        <div className="sv-subpart-col part-price">
                          <input
                            type="number"
                            min="0"
                            value={sp.harga_satuan || 0}
                            onChange={(e) => handleSpecialSubpartChange(pIdx, 'harga_satuan', e.target.value)}
                            placeholder="Harga Satuan"
                            className="sv-subpart-input right"
                          />
                        </div>
                        <div className="sv-subpart-col part-total">
                          <span>{formatIDR((parseInt(sp.qty, 10) || 1) * (parseInt(sp.harga_satuan, 10) || 0))}</span>
                        </div>
                        <div className="sv-subpart-col part-action">
                          <button
                            type="button"
                            className="sv-subpart-del-btn"
                            onClick={() => handleRemoveSubpartRow(pIdx)}
                            title="Hapus item part ini"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic Calculation Summary Box inside Modal */}
              {(() => {
                const subParts = (editingSpecialServiceModal.service.spare_part || []).reduce(
                  (acc, p) => acc + ((parseInt(p.qty, 10) || 0) * (parseInt(p.harga_satuan, 10) || 0)), 0
                )
                const jasa = parseInt(editingSpecialServiceModal.service.jasa, 10) || 0
                const subTotal = subParts + jasa
                const ppn11 = Math.round(subTotal * 0.11)
                const grand = subTotal + ppn11

                return (
                  <div className="sv-modal-calc-box">
                    <div className="sv-m-calc-row">
                      <span>Jasa Mekanik: <strong>{formatIDR(jasa)}</strong></span>
                      <span>Subtotal Suku Cadang: <strong>{formatIDR(subParts)}</strong></span>
                      <span>PPN 11%: <strong>{formatIDR(ppn11)}</strong></span>
                    </div>
                    <div className="sv-m-calc-grand">
                      <span>Grand Total Resmi (Termasuk PPN 11%):</span>
                      <strong className="text-red">{formatIDR(grand)}</strong>
                    </div>
                  </div>
                )
              })()}

              <div className="sv-form-group">
                <label className="sv-form-label">Keterangan / Deskripsi Pekerjaan:</label>
                <textarea
                  value={editingSpecialServiceModal.service.keterangan || ''}
                  onChange={(e) => setEditingSpecialServiceModal(prev => ({
                    ...prev,
                    service: { ...prev.service, keterangan: e.target.value }
                  }))}
                  placeholder="Contoh: Penggantian oli mesin resmi MMGO + filter oli + ring baut karter, pengerjaan cepat tanpa inspeksi berkala."
                  rows={2}
                  className="sv-modal-textarea"
                />
              </div>
              </div>

              <div className="sv-modal-actions">
                <button type="button" className="sv-btn-cancel" onClick={() => setEditingSpecialServiceModal(null)}>
                  Batal
                </button>
                <button type="submit" className="sv-btn-submit">
                  {editingSpecialServiceModal.mode === 'add' ? 'Tambahkan Servis Khusus' : 'Simpan Perubahan Servis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT INTERVAL PART */}
      {editingPartModal && (
        <div className="sv-modal-backdrop" onClick={() => setEditingPartModal(null)}>
          <div className="sv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {editingPartModal.mode === 'add' ? 'Tambah Suku Cadang Interval' : 'Edit Suku Cadang Interval'}
              </h3>
              <button type="button" className="sv-modal-close" onClick={() => setEditingPartModal(null)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePartModal} className="sv-modal-form">
              <div className="sv-modal-scroll-body">
                <div className="sv-form-group">
                <label className="sv-form-label">Nomor Part (Part Number):</label>
                <input
                  type="text"
                  value={editingPartModal.part.nomor_part || ''}
                  onChange={(e) => setEditingPartModal({
                    ...editingPartModal,
                    part: { ...editingPartModal.part, nomor_part: e.target.value }
                  })}
                  placeholder="Contoh: MZ320346, MD360935"
                  className="sv-modal-input"
                  autoFocus
                />
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">
                  Nama Suku Cadang / Pelumas: <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={editingPartModal.part.nama || ''}
                  onChange={(e) => setEditingPartModal({
                    ...editingPartModal,
                    part: { ...editingPartModal.part, nama: e.target.value }
                  })}
                  placeholder="Contoh: Oil Mesin, Filter Oli, Filter AC"
                  required
                  className="sv-modal-input"
                />
              </div>

              <div className="sv-form-row-2">
                <div className="sv-form-group">
                  <label className="sv-form-label">
                    Jumlah (Qty): <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingPartModal.part.qty || 1}
                    onChange={(e) => setEditingPartModal({
                      ...editingPartModal,
                      part: { ...editingPartModal.part, qty: e.target.value }
                    })}
                    required
                    className="sv-modal-input"
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-form-label">
                    Harga Satuan (Rp): <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingPartModal.part.harga_satuan || 0}
                    onChange={(e) => setEditingPartModal({
                      ...editingPartModal,
                      part: { ...editingPartModal.part, harga_satuan: e.target.value }
                    })}
                    required
                    className="sv-modal-input"
                  />
                  <span className="sv-form-preview-val">Format: <strong>{formatIDR(editingPartModal.part.harga_satuan)}</strong></span>
                </div>
              </div>

                            </div>

              <div className="sv-modal-actions">
                <button type="button" className="sv-btn-cancel" onClick={() => setEditingPartModal(null)}>
                  Batal
                </button>
                <button type="submit" className="sv-btn-submit">
                  {editingPartModal.mode === 'add' ? 'Tambahkan Suku Cadang' : 'Simpan Perubahan Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD POLICY NOTE */}
      {isAddPolicyModalOpen && (
        <div className="sv-modal-backdrop" onClick={() => setIsAddPolicyModalOpen(false)}>
          <div className="sv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">Tambah Catatan Garansi / Syarat Servis</h3>
              <button type="button" className="sv-modal-close" onClick={() => setIsAddPolicyModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPolicyNote} className="sv-modal-form">
              <div className="sv-modal-scroll-body">
                <div className="sv-form-group">
                <label className="sv-form-label">Isi Catatan / Aturan:</label>
                <textarea
                  value={newPolicyNoteInput}
                  onChange={(e) => setNewPolicyNoteInput(e.target.value)}
                  placeholder="Tuliskan catatan penting atau syarat garansi servis..."
                  required
                  rows={4}
                  autoFocus
                  className="sv-modal-textarea"
                />
              </div>

                            </div>

              <div className="sv-modal-actions">
                <button type="button" className="sv-btn-cancel" onClick={() => setIsAddPolicyModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="sv-btn-submit">
                  Tambahkan ke Basis Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRM RESET */}
      {isResetConfirmModalOpen && (
        <div className="sv-modal-backdrop" onClick={() => setIsResetConfirmModalOpen(false)}>
          <div className="sv-modal-card sv-modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="sv-modal-header">
              <div className="sv-danger-title-row">
                <HiOutlineExclamationTriangle size={22} className="text-red" />
                <h3 className="sv-modal-title">Konfirmasi Reset Default</h3>
              </div>
              <button type="button" className="sv-modal-close" onClick={() => setIsResetConfirmModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <div className="sv-modal-scroll-body">
              <p className="sv-modal-warning-text">
              Apakah Anda yakin ingin mengembalikan seluruh data Perawatan Berkala (Service Data) ke file default bawaan dealer (<code>knowledge/mitsubishi_perawatan_berkala.json</code>)?
              <br /><br />
              Seluruh penyesuaian tarif jasa, harga suku cadang, dan catatan garansi akan ditimpa kembali.
            </p>
            </div>

            <div className="sv-modal-actions">
              <button type="button" className="sv-btn-cancel" onClick={() => setIsResetConfirmModalOpen(false)}>
                Batal
              </button>
              <button type="button" className="sv-btn-danger" onClick={handleResetToDefault}>
                Ya, Reset ke Pengaturan Awal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
