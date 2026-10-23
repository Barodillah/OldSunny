import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  HiOutlineCalculator,
  HiOutlineChevronDown,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiSparkles
} from 'react-icons/hi2'
import { RiCarLine } from 'react-icons/ri'
import defaultPriceListData from '../../knowledge/price_list.json'
import './SimulasiKreditModal.css'

const formatCurrency = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  const num = Number(val)
  if (isNaN(num)) return 'Rp 0'
  return `Rp ${num.toLocaleString('id-ID')}`
}

export default function SimulasiKreditModal({ isOpen, onClose }) {
  const [priceList, setPriceList] = useState(defaultPriceListData)
  const [model, setModel] = useState('destinator')
  const [varian, setVarian] = useState('1.5L Ultimate Premium (4x2) A/T')
  const [dpType, setDpType] = useState('persentase') // 'persentase' | 'nominal'
  const [dpValue, setDpValue] = useState('20')
  const [tenor, setTenor] = useState('60')
  const [skema, setSkema] = useState('ADDM')
  const [asuransi, setAsuransi] = useState('All Risk')
  const [errorMsg, setErrorMsg] = useState('')

  // Build modelsData & allModels safely from priceList and defaultPriceListData
  const modelsData = {}
  const allModels = []

  const sources = [priceList?.passenger_car, defaultPriceListData?.passenger_car]
  sources.forEach((src) => {
    if (src && typeof src === 'object') {
      Object.entries(src).forEach(([key, val]) => {
        if (!modelsData[key] && val?.items && Array.isArray(val.items)) {
          allModels.push(key)
          modelsData[key] = val.items
        }
      })
    }
  })

  // Fetch updated pricelist if available
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      fetch('https://csdwindo.com/api/pricelist/index.php')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status && data.data) {
            setPriceList(data.data)
          }
        })
        .catch(() => {
          // Seamless fallback to local json
        })
    }
  }, [isOpen])

  // Ensure default model and variant are populated whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (!model || !modelsData[model]) {
        const defaultMod = allModels[0] || 'destinator'
        setModel(defaultMod)
        const defaultVar = modelsData[defaultMod]?.[0]?.type || ''
        setVarian(defaultVar)
      } else if (!varian && modelsData[model]?.length > 0) {
        setVarian(modelsData[model][0].type)
      }
    }
  }, [isOpen, allModels.length])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleModelChange = (e) => {
    const selected = e.target.value
    setModel(selected)
    const availableVariants = modelsData[selected] || []
    if (availableVariants.length > 0) {
      setVarian(availableVariants[0].type)
    } else {
      setVarian('')
    }
  }

  // Find selected variant data and determine harga OTR
  const currentVariants = (model && modelsData[model]) || []
  const selectedVariantData =
    currentVariants.find((v) => v.type === varian) || currentVariants[0] || null
  const activeVariantName = selectedVariantData ? selectedVariantData.type : varian
  const hargaOtr = selectedVariantData ? Number(selectedVariantData.price) : 0

  // Calculate equivalent DP
  let dpEquivalentText = ''
  if (hargaOtr > 0 && dpValue) {
    const num = Number(dpValue)
    if (!isNaN(num) && num > 0) {
      if (dpType === 'persentase') {
        const nominalVal = (hargaOtr * num) / 100
        dpEquivalentText = `Estimasi Uang Muka: ${formatCurrency(nominalVal)}`
      } else {
        const percentVal = ((num / hargaOtr) * 100).toFixed(1)
        dpEquivalentText = `Setara ${percentVal}% dari OTR`
      }
    }
  }

  const handleHitung = () => {
    if (!model || !activeVariantName || !dpValue) {
      setErrorMsg('Mohon lengkapi pilihan Model, Tipe Varian, dan Nilai Uang Muka (DP).')
      return
    }

    const modelName = model.replace(/_/g, ' ').toUpperCase()
    const dpLabel =
      dpType === 'persentase'
        ? `${dpValue}% (${formatCurrency((hargaOtr * Number(dpValue)) / 100)})`
        : `${formatCurrency(dpValue)}${hargaOtr > 0 ? ` (${((Number(dpValue) / hargaOtr) * 100).toFixed(1)}%)` : ''
        }`
    const tenorTahun = Math.floor(Number(tenor) / 12)
    const tenorLabel = `${tenor} bulan (${tenorTahun} tahun)`

    const message = `Saya ingin simulasi kredit dengan data berikut:
• Model: ${modelName}
• Tipe: ${activeVariantName}
• Harga OTR: ${formatCurrency(hargaOtr)}
• DP: ${dpLabel}
• Tenor: ${tenorLabel}
• Skema: ${skema}
• Asuransi: ${asuransi}

Tolong hitung rincian plafon kredit, cicilan bulanan, rincian TDP (Total Down Payment), dan rekomendasikan leasing terbaik.`

    onClose()
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('sunny_ask_question', {
          detail: {
            query: message,
            message: message,
            source: 'simulasi_kredit_modal'
          }
        })
      )
    }, 180)
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="simulasi-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulasi-modal-title"
    >
      <div
        className="simulasi-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="simulasi-modal-header">
          <div className="simulasi-header-left">
            <div className="simulasi-header-icon">
              <HiOutlineCalculator size={22} />
            </div>
            <div>
              <h3 id="simulasi-modal-title" className="simulasi-header-title">
                Simulasi Kredit Terbuka
              </h3>
              <p className="simulasi-header-sub">
                Hitung estimasi cicilan & uang muka transparan resmi OJK
              </p>
            </div>
          </div>
          <button
            type="button"
            className="simulasi-modal-close"
            onClick={onClose}
            aria-label="Tutup Dialog Simulasi"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="simulasi-modal-body">
          {/* Model & Varian Group */}
          <div className="simulasi-card-group">
            <div className="simulasi-field">
              <label className="simulasi-label" htmlFor="simulasi-model-select">
                <RiCarLine size={17} className="simulasi-label-icon" />
                <span>Pilih Model Kendaraan</span>
              </label>
              <div className="simulasi-select-wrap">
                <select
                  id="simulasi-model-select"
                  className="simulasi-select"
                  value={model}
                  onChange={handleModelChange}
                >
                  <option value="">-- Pilih Model Mitsubishi --</option>
                  {allModels.map((m) => (
                    <option key={m} value={m}>
                      {m.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <HiOutlineChevronDown size={16} className="simulasi-select-chevron" />
              </div>
            </div>

            {model && currentVariants.length > 0 && (
              <div className="simulasi-field">
                <label className="simulasi-label" htmlFor="simulasi-varian-select">
                  <span>Varian / Tipe Kendaraan</span>
                </label>
                <div className="simulasi-select-wrap">
                  <select
                    id="simulasi-varian-select"
                    className="simulasi-select"
                    value={activeVariantName}
                    onChange={(e) => setVarian(e.target.value)}
                  >
                    {currentVariants.map((v) => (
                      <option key={v.type} value={v.type}>
                        {v.type}
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown size={16} className="simulasi-select-chevron" />
                </div>
              </div>
            )}
          </div>

          {/* OTR Card Highlight Banner */}
          <div
            className="simulasi-otr-card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '14px',
              padding: '1.25rem 1.4rem',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.3)',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-15px',
                opacity: 0.1,
                pointerEvents: 'none',
                color: '#ffffff'
              }}
            >
              <RiCarLine size={110} />
            </div>

            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#94a3b8',
                margin: '0 0 0.35rem 0'
              }}
            >
              Harga OTR Resmi Jabodetabek
            </p>

            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '0.2rem 0'
              }}
            >
              {hargaOtr > 0 ? formatCurrency(hargaOtr) : 'Pilih varian untuk melihat harga OTR'}
            </div>

            {activeVariantName && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  margin: '0.25rem 0 0 0'
                }}
              >
                {activeVariantName}
              </p>
            )}
          </div>

          {/* Kalkulasi Parameters */}
          <div className="simulasi-card-group">
            <div className="simulasi-grid-2">
              {/* DP */}
              <div className="simulasi-field">
                <label className="simulasi-label">
                  <HiOutlineCreditCard size={17} className="simulasi-label-icon" />
                  <span>Uang Muka (DP)</span>
                </label>
                <div className="simulasi-dp-group">
                  <select
                    className="simulasi-dp-type"
                    value={dpType}
                    onChange={(e) => {
                      setDpType(e.target.value)
                      if (e.target.value === 'persentase' && !dpValue) setDpValue('20')
                    }}
                    aria-label="Satuan Uang Muka"
                  >
                    <option value="persentase">%</option>
                    <option value="nominal">Rp</option>
                  </select>
                  <input
                    type="number"
                    className="simulasi-dp-input"
                    value={dpValue}
                    onChange={(e) => setDpValue(e.target.value)}
                    placeholder={dpType === 'persentase' ? 'Min. 15' : 'Nominal DP'}
                  />
                </div>
                {dpEquivalentText && (
                  <span className="simulasi-dp-nominal-hint">{dpEquivalentText}</span>
                )}
              </div>

              {/* Tenor */}
              <div className="simulasi-field">
                <label className="simulasi-label" htmlFor="simulasi-tenor-select">
                  <HiOutlineCalendarDays size={17} className="simulasi-label-icon" />
                  <span>Jangka Tenor</span>
                </label>
                <div className="simulasi-select-wrap">
                  <select
                    id="simulasi-tenor-select"
                    className="simulasi-select"
                    value={tenor}
                    onChange={(e) => setTenor(e.target.value)}
                  >
                    {[12, 24, 36, 48, 60, 72, 84].map((t) => (
                      <option key={t} value={t}>
                        {t} Bulan ({Math.floor(t / 12)} Tahun)
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown size={16} className="simulasi-select-chevron" />
                </div>
              </div>
            </div>

            <div className="simulasi-grid-2">
              {/* Skema */}
              <div className="simulasi-field">
                <label className="simulasi-label">
                  <span>Skema Pembayaran</span>
                </label>
                <div className="simulasi-skema-switch">
                  <button
                    type="button"
                    className={`simulasi-skema-btn ${skema === 'ADDM' ? 'is-active' : ''}`}
                    onClick={() => setSkema('ADDM')}
                  >
                    ADDM
                  </button>
                  <button
                    type="button"
                    className={`simulasi-skema-btn ${skema === 'ADDB' ? 'is-active' : ''}`}
                    onClick={() => setSkema('ADDB')}
                  >
                    ADDB
                  </button>
                </div>
              </div>

              {/* Asuransi */}
              <div className="simulasi-field">
                <label className="simulasi-label" htmlFor="simulasi-asuransi-select">
                  <HiOutlineShieldCheck size={17} className="simulasi-label-icon" />
                  <span>Proteksi Asuransi</span>
                </label>
                <div className="simulasi-select-wrap">
                  <select
                    id="simulasi-asuransi-select"
                    className="simulasi-select"
                    value={asuransi}
                    onChange={(e) => setAsuransi(e.target.value)}
                  >
                    <option value="All Risk">All Risk (Komprehensif)</option>
                    <option value="TLO">Total Loss Only (TLO)</option>
                    <option value="Kombinasi">Kombinasi (All Risk + TLO)</option>
                  </select>
                  <HiOutlineChevronDown size={16} className="simulasi-select-chevron" />
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: '#E3000C', fontSize: '0.85rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="simulasi-modal-footer">
          <button
            type="button"
            className="btn-simulasi-cancel"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-simulasi-submit"
            onClick={handleHitung}
          >
            <HiSparkles size={16} />
            <span>Hitung Simulasi via Sunny AI</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
