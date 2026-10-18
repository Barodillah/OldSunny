import React, { useState, useMemo, useEffect } from 'react'
import {
  HiOutlineUserGroup,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineArrowPath
} from 'react-icons/hi2'
import { MOCK_SPV_DATA } from '../data/mockSalesRate.js'
import './PortalSalesRate.css'

// ============================================================================
// COMPONENT 1: NPS STACKED BAR CHART
// ============================================================================
const SummaryNPSChart = ({ data }) => {
  const targetNPS = 84

  return (
    <div className="psr-nps-chart-card">
      <div className="psr-chart-header">
        <div>
          <h3 className="psr-card-title">
            <span className="psr-card-title-dot" />
            NPS Semua Tim
          </h3>
          <p className="psr-subtitle" style={{ marginTop: '0.2rem' }}>
            Perbandingan Nilai Net Promoter Score (NPS) berdasarkan SPV
          </p>
        </div>

        <div className="psr-chart-legend">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="psr-legend-target-line" />
            <span>Target Nasional ({targetNPS})</span>
          </div>
        </div>
      </div>

      <div className="psr-chart-stage">
        {/* Horizontal Gridlines */}
        <div className="psr-gridlines">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="psr-gridline">
              <span className="psr-gridline-text">{val}%</span>
              <div className="psr-gridline-rule" />
            </div>
          ))}
        </div>

        {/* National Target Dashed Line */}
        <div className="psr-target-line" style={{ bottom: `calc(3.5rem + (100% - 5.5rem) * (${targetNPS} / 100))` }}>
          <span className="psr-target-label">
            Target {targetNPS}
          </span>
        </div>

        {/* Stacked Pillars */}
        <div className="psr-bars-wrapper">
          {data.map((item, idx) => {
            const total = item.promoters + item.passives + item.detractors
            const pPct = total > 0 ? Math.round((item.promoters / total) * 100) : 0
            const aPct = total > 0 ? Math.round((item.passives / total) * 100) : 0
            const dPct = total > 0 ? (100 - pPct - aPct) : 0
            const npsScore = total > 0 ? Math.round(((item.promoters - item.detractors) / total) * 100) : 0

            return (
              <div key={item.label} className={`psr-bar-col ${idx === 0 ? 'is-first' : ''}`}>
                <div className="psr-bar-pillar">
                  <div
                    className="psr-pillar-seg seg-detractor"
                    style={{ height: `${dPct}%` }}
                    title={`Detractor: ${dPct}%`}
                  >
                    {dPct > 6 && `${dPct}%`}
                  </div>
                  <div
                    className="psr-pillar-seg seg-passive"
                    style={{ height: `${aPct}%` }}
                    title={`Passive: ${aPct}%`}
                  >
                    {aPct > 6 && `${aPct}%`}
                  </div>
                  <div
                    className="psr-pillar-seg seg-promoter"
                    style={{ height: `${pPct}%` }}
                    title={`Promoter: ${pPct}%`}
                  >
                    {pPct > 6 && `${pPct}%`}
                  </div>
                </div>

                {/* Floating Pin & NPS Tooltip */}
                <div
                  className="psr-nps-pin"
                  style={{ bottom: `calc(3.5rem + (100% - 5.5rem) * (${Math.max(0, npsScore)} / 100) - 6px)` }}
                >
                  <div className="psr-nps-badge-floating">
                    {npsScore}%
                  </div>
                </div>

                {/* Bar Label */}
                <div className="psr-bar-label" title={item.label}>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENT 2: SUMMARY TAB (OVERVIEW & COMPOSITION)
// ============================================================================
const SummaryTab = ({ spvData }) => {
  let totalData = 0
  let potensialSurvey = 0
  let masukNPS = 0
  const semuaStatusTally = {}
  let totalPromotor = 0
  let totalPassive = 0
  let totalDetractor = 0

  const chartData = []

  spvData.forEach((spvRow) => {
    totalData += spvRow.total || 0
    totalPromotor += spvRow.promotor || 0
    totalPassive += spvRow.passiver || 0
    totalDetractor += spvRow.detraktor || 0

    if (spvRow.sales_list) {
      spvRow.sales_list.forEach((sale) => {
        masukNPS += sale.detail_nps ? sale.detail_nps.length : 0

        if (sale.detail_survey) {
          sale.detail_survey.forEach((survey) => {
            const status = survey.status_detail ? survey.status_detail.toUpperCase() : 'BLANK'
            if (!['NOMOR SALAH', 'PKT', 'SALAH SAMBUNG'].includes(status)) {
              potensialSurvey += 1
            }
            semuaStatusTally[status] = (semuaStatusTally[status] || 0) + 1
          })
        }
      })
    }

    chartData.push({
      label: spvRow.spv,
      promoters: spvRow.promotor || 0,
      passives: spvRow.passiver || 0,
      detractors: spvRow.detraktor || 0
    })
  })

  // Insert "Total Semua" as the first pillar
  chartData.unshift({
    label: 'Total Semua',
    promoters: totalPromotor,
    passives: totalPassive,
    detractors: totalDetractor
  })

  // Donut chart calculations
  const donutLabels = Object.keys(semuaStatusTally).sort(
    (a, b) => semuaStatusTally[b] - semuaStatusTally[a]
  )
  const donutValues = donutLabels.map((l) => semuaStatusTally[l])
  const totalDonut = donutValues.reduce((a, b) => a + b, 0)

  let currentPct = 0
  const colors = ['#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4']
  const gradientStops = donutValues
    .map((val, idx) => {
      const pct = (val / totalDonut) * 100
      const color = colors[idx % colors.length]
      const stop = `${color} ${currentPct}% ${currentPct + pct}%`
      currentPct += pct
      return stop
    })
    .join(', ')

  const conicBackground =
    totalDonut > 0 ? `conic-gradient(${gradientStops})` : 'conic-gradient(#e2e8f0 0% 100%)'

  const selisihNps = potensialSurvey - masukNPS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="psr-summary-grid">
        {/* Card 1: Ringkasan Data Survey */}
        <div className="psr-card">
          <div className="psr-card-header">
            <h4 className="psr-card-title">
              <span className="psr-card-title-dot" />
              Ringkasan Data Survey
            </h4>
          </div>

          <div className="psr-progress-list">
            {/* Total Data */}
            <div className="psr-progress-item">
              <div className="psr-progress-labels">
                <span className="psr-progress-title">Total Data (Filter Tanggal)</span>
                <span className="psr-progress-val">{totalData}</span>
              </div>
              <div className="psr-progress-track">
                <div className="psr-progress-bar bar-blue" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Potensial Survey */}
            <div className="psr-progress-item">
              <div className="psr-progress-labels">
                <span className="psr-progress-title">Potensial Survey</span>
                <div>
                  <span className="psr-progress-val">{potensialSurvey}</span>
                  <span className="psr-progress-pct">
                    ({totalData > 0 ? Math.round((potensialSurvey / totalData) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="psr-progress-track">
                <div
                  className="psr-progress-bar bar-amber"
                  style={{ width: `${totalData > 0 ? (potensialSurvey / totalData) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Tersurvey (NPS) */}
            <div className="psr-progress-item">
              <div className="psr-progress-labels">
                <span className="psr-progress-title">Tersurvey (NPS)</span>
                <div>
                  <span className="psr-progress-val">{masukNPS}</span>
                  <span className="psr-progress-pct">
                    ({totalData > 0 ? Math.round((masukNPS / totalData) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="psr-progress-track">
                <div
                  className="psr-progress-bar bar-green"
                  style={{ width: `${totalData > 0 ? (masukNPS / totalData) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Alert Selisih */}
            {selisihNps > 0 ? (
              <div className="psr-alert psr-alert-warning">
                <HiOutlineExclamationCircle size={19} className="psr-alert-icon" />
                <div>
                  <div className="psr-alert-title">Potensial Survey</div>
                  <div>
                    Terdapat selisih <strong>{selisihNps}</strong> konsumen (
                    <strong>{potensialSurvey > 0 ? Math.round((selisihNps / potensialSurvey) * 100) : 0}%</strong>) yang
                    belum Tersurvey (NPS).
                  </div>
                </div>
              </div>
            ) : (
              <div className="psr-alert psr-alert-success">
                <HiOutlineCheckCircle size={19} className="psr-alert-icon" />
                <div>
                  <div className="psr-alert-title">Potensial Survey Lengkap</div>
                  <div>Seluruh data Potensial Survey telah berhasil Tersurvey (NPS).</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Komposisi Semua Status */}
        <div className="psr-card">
          <div className="psr-card-header">
            <h4 className="psr-card-title">
              <span className="psr-card-title-dot" />
              Komposisi Semua Status
            </h4>
          </div>

          <div className="psr-donut-layout">
            {totalDonut === 0 ? (
              <div className="psr-empty-state">Tidak ada data status survey</div>
            ) : (
              <>
                <div className="psr-donut-chart" style={{ background: conicBackground }}>
                  <div className="psr-donut-hole">
                    <span className="psr-donut-hole-number">{totalDonut}</span>
                    <span className="psr-donut-hole-label">Total</span>
                  </div>
                </div>

                <div className="psr-donut-legend">
                  {donutLabels.map((label, idx) => {
                    const color = colors[idx % colors.length]
                    const val = semuaStatusTally[label]
                    const pct = Math.round((val / totalDonut) * 100)
                    return (
                      <div key={label} className="psr-legend-row">
                        <div className="psr-legend-left">
                          <span className="psr-legend-color" style={{ backgroundColor: color }} />
                          <span className="psr-legend-name" title={label}>
                            {label}
                          </span>
                        </div>
                        <div className="psr-legend-val">
                          {val} <span className="psr-legend-pct">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* NPS Stacked Bar Chart */}
      <SummaryNPSChart data={chartData} />
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT: PortalSalesRate
// ============================================================================
export default function PortalSalesRate() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Filter States
  const [startDate, setStartDate] = useState(formatDate(firstDay))
  const [endDate, setEndDate] = useState(formatDate(today))
  const [minData, setMinData] = useState(0) // 0 means show all
  const [loading, setLoading] = useState(false)
  const [spvData, setSpvData] = useState(MOCK_SPV_DATA)

  // Navigation Tabs: 'summary' | 'spv' | 'sales' | 'warranty'
  const [activeTab, setActiveTab] = useState('summary')

  // Warranty sub-tab: 'spv' | 'sales'
  const [warrantyTab, setWarrantyTab] = useState('spv')

  // Modals & Expansion
  const [expandedSpv, setExpandedSpv] = useState(null)
  const [showAllSpvModal, setShowAllSpvModal] = useState(false)
  const [selectedSurveyDetails, setSelectedSurveyDetails] = useState(null)
  const [selectedNpsDetails, setSelectedNpsDetails] = useState(null)
  const [selectedWarrantyDetails, setSelectedWarrantyDetails] = useState(null)

  // Flattened sales list
  const allSales = useMemo(() => {
    const combined = []
    spvData.forEach((spvGroup) => {
      if (spvGroup.sales_list) {
        spvGroup.sales_list.forEach((sale) => {
          combined.push({
            ...sale,
            spvName: spvGroup.spv
          })
        })
      }
    })
    combined.sort((a, b) => b.skor - a.skor)
    return combined
  }, [spvData])

  // Simulate refresh or filter updates
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setSpvData(MOCK_SPV_DATA)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="portal-sales-rate">
      {/* --------------------------------------------------------------------
          TOP HEADER & CONTROLS
          -------------------------------------------------------------------- */}
      <div className="psr-header">
        <div className="psr-title-group">
          <div className="psr-title-badge">
            <HiOutlineChartBarSquare size={14} />
            <span>Kinerja Sales & SPV</span>
          </div>
          <h1 className="psr-title">Sales Rate</h1>
          <p className="psr-subtitle">
            Analisis Rasio Kinerja, Net Promoter Score (NPS), dan Waktu Warranty per Tim
          </p>
        </div>

        <div className="psr-toolbar">
          {/* Button Semua Tim */}
          <button
            type="button"
            onClick={() => setShowAllSpvModal(true)}
            className="psr-btn-teams"
          >
            <HiOutlineUserGroup size={16} />
            <span>Semua Tim</span>
          </button>

          {/* Stepper Filter Min Data */}
          <div className="psr-min-data-box" title="Filter ambang minimal data per tim/sales">
            <span className="psr-min-data-label">Min. Data</span>
            <button
              type="button"
              className="psr-step-btn"
              onClick={() => setMinData((prev) => Math.max(0, prev - 1))}
              aria-label="Kurangi minimal data"
            >
              <HiOutlineMinus size={12} />
            </button>
            <input
              type="number"
              min="0"
              value={minData}
              onChange={(e) => setMinData(Math.max(0, parseInt(e.target.value) || 0))}
              className="psr-step-input"
            />
            <button
              type="button"
              className="psr-step-btn"
              onClick={() => setMinData((prev) => prev + 1)}
              aria-label="Tambah minimal data"
            >
              <HiOutlinePlus size={12} />
            </button>
          </div>

          {/* Date Range Picker */}
          <div className="psr-date-pill">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="psr-date-input"
              title="Tanggal Awal"
            />
            <span className="psr-date-sep">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="psr-date-input"
              title="Tanggal Akhir"
            />
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            className="psr-step-btn"
            style={{ border: '1px solid #e2e8f0', borderRadius: '10px', height: '36px', width: '36px' }}
            onClick={handleRefresh}
            title="Muat ulang data"
          >
            <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          NAVIGATION TABS
          -------------------------------------------------------------------- */}
      <div className="psr-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`psr-tab-btn ${activeTab === 'summary' ? 'is-active' : ''}`}
        >
          <HiOutlineChartBarSquare size={17} />
          <span>Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spv')}
          className={`psr-tab-btn ${activeTab === 'spv' ? 'is-active' : ''}`}
        >
          <HiOutlineUserGroup size={17} />
          <span>Berdasarkan SPV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`psr-tab-btn ${activeTab === 'sales' ? 'is-active' : ''}`}
        >
          <HiOutlineInformationCircle size={17} />
          <span>Semua Sales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warranty')}
          className={`psr-tab-btn ${activeTab === 'warranty' ? 'is-active' : ''}`}
        >
          <HiOutlineClock size={17} />
          <span>Warranty Time</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          TAB CONTENT 1: SUMMARY
          -------------------------------------------------------------------- */}
      {activeTab === 'summary' && <SummaryTab spvData={spvData} />}

      {/* --------------------------------------------------------------------
          TAB CONTENT 2: BERDASARKAN SPV
          -------------------------------------------------------------------- */}
      {activeTab === 'spv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Table SPV Qualified */}
          <div className="psr-table-card">
            <div className="psr-table-header-bar">
              <h3 className="psr-table-title">
                <span className="psr-card-title-dot" />
                <span>
                  {minData > 0
                    ? `SPV Memenuhi Syarat (Min. ${minData} Data)`
                    : 'Peringkat Kinerja Supervisor (SPV)'}
                </span>
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Klik baris SPV untuk melihat rincian sales
              </span>
            </div>

            <div className="psr-table-responsive">
              <table className="psr-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px', textAlign: 'center' }}>Rank</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Skor Akhir</th>
                    <th style={{ minWidth: '180px' }}>Supervisor (SPV)</th>
                    <th style={{ minWidth: '180px' }}>Rasio Survey Tim</th>
                    <th style={{ minWidth: '180px', textAlign: 'center' }}>Distribusi NPS Tim</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Skor NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {spvData.filter((d) => d.total >= minData).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="psr-empty-state">
                        Tidak ada data SPV yang memenuhi kriteria min. data.
                      </td>
                    </tr>
                  ) : (
                    spvData
                      .filter((d) => d.total >= minData)
                      .map((row, idx) => {
                        const isExpanded = expandedSpv === row.spv
                        const rankClass =
                          idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'rank-default'
                        const scoreClass =
                          row.skor >= 80 ? 'score-green' : row.skor >= 60 ? 'score-blue' : 'score-amber'
                        const npsClass = row.nps >= 50 ? 'nps-high' : row.nps >= 0 ? 'nps-mid' : 'nps-low'

                        return (
                          <React.Fragment key={row.spv}>
                            <tr
                              className={`is-clickable ${isExpanded ? 'is-expanded' : ''}`}
                              onClick={() => setExpandedSpv(isExpanded ? null : row.spv)}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <span className={`psr-rank-badge ${rankClass}`}>{idx + 1}</span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`psr-score-text ${scoreClass}`}>{row.skor}</span>
                              </td>
                              <td>
                                <div className="psr-entity-name">{row.spv}</div>
                                <div className="psr-entity-sub">
                                  <HiOutlineUserGroup size={12} />
                                  <span>{row.sales_list?.length || 0} Sales di Tim</span>
                                </div>
                              </td>
                              <td>
                                <div className="psr-ratio-cell">
                                  <div className="psr-ratio-header">
                                    <span className="psr-ratio-pct">{row.ratio}%</span>
                                    <span className="psr-ratio-counts">
                                      {row.surveyed}/{row.total} Tersurvey
                                    </span>
                                  </div>
                                  <div className="psr-mini-track">
                                    <div
                                      className={`psr-progress-bar ${
                                        row.ratio >= 80 ? 'bar-green' : row.ratio >= 50 ? 'bar-amber' : 'bar-detractor'
                                      }`}
                                      style={{ width: `${row.ratio}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div className="psr-dist-pills">
                                  <div className="psr-mini-pill pill-prom" title="Promoter">
                                    <span className="psr-pill-key">Prom</span>
                                    <span className="psr-pill-val">{row.promotor}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-pass" title="Passive">
                                    <span className="psr-pill-key">Pass</span>
                                    <span className="psr-pill-val">{row.passiver}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-detr" title="Detractor">
                                    <span className="psr-pill-key">Detr</span>
                                    <span className="psr-pill-val">{row.detraktor}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`psr-nps-pill ${npsClass}`}>
                                  {row.nps > 0 ? `+${row.nps}` : row.nps}
                                </span>
                              </td>
                            </tr>

                            {/* Nested Sales List in Expanded SPV Row */}
                            {isExpanded && (
                              <tr className="psr-nested-row">
                                <td colSpan={6} style={{ padding: 0 }}>
                                  <div className="psr-nested-wrapper">
                                    <div className="psr-nested-header">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <span className="psr-red-bullet" />
                                        <span>Daftar Sales – Tim {row.spv}</span>
                                      </div>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                        Klik Rasio atau Distribusi untuk melihat rincian konsumen
                                      </span>
                                    </div>

                                    <table className="psr-table">
                                      <thead>
                                        <tr>
                                          <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                                          <th style={{ width: '60px', textAlign: 'center' }}>Skor</th>
                                          <th>Nama Sales</th>
                                          <th style={{ minWidth: '160px' }}>Rasio Survey</th>
                                          <th style={{ textAlign: 'center' }}>Distribusi NPS</th>
                                          <th style={{ width: '80px', textAlign: 'center' }}>NPS</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.sales_list && row.sales_list.length > 0 ? (
                                          row.sales_list.map((salesRow, sIdx) => (
                                            <tr key={sIdx}>
                                              <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                                                {sIdx + 1}
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <span
                                                  className={`psr-score-text ${
                                                    salesRow.skor >= 80
                                                      ? 'score-green'
                                                      : salesRow.skor >= 60
                                                      ? 'score-blue'
                                                      : 'score-amber'
                                                  }`}
                                                  style={{ fontSize: '0.95rem' }}
                                                >
                                                  {salesRow.skor}
                                                </span>
                                              </td>
                                              <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                {salesRow.sales}
                                              </td>
                                              <td>
                                                <div
                                                  className="psr-cell-interactive"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedSurveyDetails({
                                                      sales: salesRow.sales,
                                                      details: salesRow.detail_survey,
                                                      nps_details: salesRow.detail_nps
                                                    })
                                                  }}
                                                >
                                                  <div className="psr-ratio-header">
                                                    <span className="psr-ratio-pct">{salesRow.ratio}%</span>
                                                    <span className="psr-ratio-counts">
                                                      {salesRow.surveyed}/{salesRow.total}
                                                    </span>
                                                  </div>
                                                  <div className="psr-mini-track">
                                                    <div
                                                      className={`psr-progress-bar ${
                                                        salesRow.ratio >= 80
                                                          ? 'bar-green'
                                                          : salesRow.ratio >= 50
                                                          ? 'bar-amber'
                                                          : 'bar-detractor'
                                                      }`}
                                                      style={{ width: `${salesRow.ratio}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <div
                                                  className="psr-cell-interactive"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedNpsDetails({
                                                      sales: salesRow.sales,
                                                      details: salesRow.detail_nps
                                                    })
                                                  }}
                                                >
                                                  <div className="psr-dist-pills">
                                                    <div className="psr-mini-pill pill-prom">
                                                      <span className="psr-pill-key">P:</span>
                                                      <span className="psr-pill-val">{salesRow.promotor}</span>
                                                    </div>
                                                    <div className="psr-mini-pill pill-pass">
                                                      <span className="psr-pill-key">A:</span>
                                                      <span className="psr-pill-val">{salesRow.passiver}</span>
                                                    </div>
                                                    <div className="psr-mini-pill pill-detr">
                                                      <span className="psr-pill-key">D:</span>
                                                      <span className="psr-pill-val">{salesRow.detraktor}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <span
                                                  className={`psr-nps-pill ${
                                                    salesRow.nps >= 50
                                                      ? 'nps-high'
                                                      : salesRow.nps >= 0
                                                      ? 'nps-mid'
                                                      : 'nps-low'
                                                  }`}
                                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                                                >
                                                  {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                                                </span>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan={6} className="psr-empty-state">
                                              Belum ada data sales di tim ini.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table SPV Unqualified (Below minData) */}
          {minData > 0 && spvData.filter((d) => d.total < minData).length > 0 && (
            <div className="psr-table-card" style={{ opacity: 0.85 }}>
              <div className="psr-table-header-bar">
                <h3 className="psr-table-title is-unqualified">
                  <span>SPV Kurang dari {minData} Data</span>
                </h3>
              </div>

              <div className="psr-table-responsive">
                <table className="psr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Skor Akhir</th>
                      <th>Supervisor (SPV)</th>
                      <th>Rasio Survey Tim</th>
                      <th style={{ textAlign: 'center' }}>Distribusi NPS Tim</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Skor NPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spvData
                      .filter((d) => d.total < minData)
                      .map((row, idx) => {
                        const isExpanded = expandedSpv === 'unq_' + row.spv
                        return (
                          <React.Fragment key={idx}>
                            <tr
                              className={`is-clickable ${isExpanded ? 'is-expanded' : ''}`}
                              onClick={() => setExpandedSpv(isExpanded ? null : 'unq_' + row.spv)}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <span className="psr-score-text score-amber">{row.skor}</span>
                              </td>
                              <td>
                                <div className="psr-entity-name">{row.spv}</div>
                                <div className="psr-entity-sub">
                                  <span>{row.sales_list?.length || 0} Sales</span>
                                </div>
                              </td>
                              <td>
                                <div className="psr-ratio-cell">
                                  <div className="psr-ratio-header">
                                    <span className="psr-ratio-pct">{row.ratio}%</span>
                                    <span className="psr-ratio-counts">
                                      {row.surveyed}/{row.total}
                                    </span>
                                  </div>
                                  <div className="psr-mini-track">
                                    <div
                                      className="psr-progress-bar bar-amber"
                                      style={{ width: `${row.ratio}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div className="psr-dist-pills">
                                  <div className="psr-mini-pill pill-prom">
                                    <span className="psr-pill-key">P:</span>
                                    <span className="psr-pill-val">{row.promotor}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-pass">
                                    <span className="psr-pill-key">A:</span>
                                    <span className="psr-pill-val">{row.passiver}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-detr">
                                    <span className="psr-pill-key">D:</span>
                                    <span className="psr-pill-val">{row.detraktor}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="psr-nps-pill nps-mid">
                                  {row.nps > 0 ? `+${row.nps}` : row.nps}
                                </span>
                              </td>
                            </tr>

                            {/* Nested Sales List */}
                            {isExpanded && (
                              <tr className="psr-nested-row">
                                <td colSpan={5} style={{ padding: 0 }}>
                                  <div className="psr-nested-wrapper">
                                    <div className="psr-nested-header">
                                      <span>Daftar Sales – Tim {row.spv}</span>
                                    </div>
                                    <table className="psr-table">
                                      <thead>
                                        <tr>
                                          <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                                          <th style={{ width: '60px', textAlign: 'center' }}>Skor</th>
                                          <th>Nama Sales</th>
                                          <th>Rasio Survey</th>
                                          <th style={{ textAlign: 'center' }}>Distribusi NPS</th>
                                          <th style={{ width: '80px', textAlign: 'center' }}>NPS</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.sales_list?.map((sRow, sIdx) => (
                                          <tr key={sIdx}>
                                            <td style={{ textAlign: 'center', color: '#94a3b8' }}>{sIdx + 1}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 800 }}>{sRow.skor}</td>
                                            <td style={{ fontWeight: 700 }}>{sRow.sales}</td>
                                            <td>
                                              {sRow.ratio}% ({sRow.surveyed}/{sRow.total})
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              P:{sRow.promotor} / A:{sRow.passiver} / D:{sRow.detraktor}
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 800 }}>
                                              {sRow.nps > 0 ? `+${sRow.nps}` : sRow.nps}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------
          TAB CONTENT 3: SEMUA SALES
          -------------------------------------------------------------------- */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="psr-table-card">
            <div className="psr-table-header-bar">
              <h3 className="psr-table-title">
                <span className="psr-card-title-dot" />
                <span>
                  {minData > 0
                    ? `Sales Memenuhi Syarat (Min. ${minData} Data)`
                    : 'Peringkat Kinerja Semua Sales'}
                </span>
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Klik kolom Rasio Survey atau Distribusi NPS untuk melihat daftar konsumen
              </span>
            </div>

            <div className="psr-table-responsive">
              <table className="psr-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px', textAlign: 'center' }}>Rank</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Skor Akhir</th>
                    <th style={{ minWidth: '180px' }}>Nama Sales</th>
                    <th style={{ minWidth: '180px' }}>Rasio Survey</th>
                    <th style={{ minWidth: '180px', textAlign: 'center' }}>Distribusi NPS</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Skor NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {allSales.filter((d) => d.total >= minData).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="psr-empty-state">
                        Tidak ada data sales yang memenuhi kriteria min. data.
                      </td>
                    </tr>
                  ) : (
                    allSales
                      .filter((d) => d.total >= minData)
                      .map((salesRow, idx) => {
                        const rankClass =
                          idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'rank-default'
                        const scoreClass =
                          salesRow.skor >= 80 ? 'score-green' : salesRow.skor >= 60 ? 'score-blue' : 'score-amber'
                        const npsClass = salesRow.nps >= 50 ? 'nps-high' : salesRow.nps >= 0 ? 'nps-mid' : 'nps-low'

                        return (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`psr-rank-badge ${rankClass}`}>{idx + 1}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`psr-score-text ${scoreClass}`}>{salesRow.skor}</span>
                            </td>
                            <td>
                              <div className="psr-entity-name">{salesRow.sales}</div>
                              <div className="psr-entity-sub">
                                <span className="psr-red-bullet" />
                                <span>SPV: {salesRow.spvName}</span>
                              </div>
                            </td>
                            <td>
                              <div
                                className="psr-cell-interactive"
                                onClick={() =>
                                  setSelectedSurveyDetails({
                                    sales: salesRow.sales,
                                    details: salesRow.detail_survey,
                                    nps_details: salesRow.detail_nps
                                  })
                                }
                              >
                                <div className="psr-ratio-header">
                                  <span className="psr-ratio-pct">{salesRow.ratio}%</span>
                                  <span className="psr-ratio-counts">
                                    {salesRow.surveyed}/{salesRow.total} Tersurvey
                                  </span>
                                </div>
                                <div className="psr-mini-track">
                                  <div
                                    className={`psr-progress-bar ${
                                      salesRow.ratio >= 80
                                        ? 'bar-green'
                                        : salesRow.ratio >= 50
                                        ? 'bar-amber'
                                        : 'bar-detractor'
                                    }`}
                                    style={{ width: `${salesRow.ratio}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div
                                className="psr-cell-interactive"
                                onClick={() =>
                                  setSelectedNpsDetails({
                                    sales: salesRow.sales,
                                    details: salesRow.detail_nps
                                  })
                                }
                              >
                                <div className="psr-dist-pills">
                                  <div className="psr-mini-pill pill-prom">
                                    <span className="psr-pill-key">Prom</span>
                                    <span className="psr-pill-val">{salesRow.promotor}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-pass">
                                    <span className="psr-pill-key">Pass</span>
                                    <span className="psr-pill-val">{salesRow.passiver}</span>
                                  </div>
                                  <div className="psr-mini-pill pill-detr">
                                    <span className="psr-pill-key">Detr</span>
                                    <span className="psr-pill-val">{salesRow.detraktor}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`psr-nps-pill ${npsClass}`}>
                                {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unqualified Sales Table */}
          {minData > 0 && allSales.filter((d) => d.total < minData).length > 0 && (
            <div className="psr-table-card" style={{ opacity: 0.85 }}>
              <div className="psr-table-header-bar">
                <h3 className="psr-table-title is-unqualified">
                  <span>Sales Kurang dari {minData} Data</span>
                </h3>
              </div>

              <div className="psr-table-responsive">
                <table className="psr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Skor</th>
                      <th>Nama Sales</th>
                      <th>Rasio Survey</th>
                      <th style={{ textAlign: 'center' }}>Distribusi NPS</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Skor NPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSales
                      .filter((d) => d.total < minData)
                      .map((salesRow, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center' }}>
                            <span className="psr-score-text score-amber">{salesRow.skor}</span>
                          </td>
                          <td>
                            <div className="psr-entity-name">{salesRow.sales}</div>
                            <div className="psr-entity-sub">
                              <span>SPV: {salesRow.spvName}</span>
                            </div>
                          </td>
                          <td>
                            {salesRow.ratio}% ({salesRow.surveyed}/{salesRow.total})
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            P:{salesRow.promotor} / A:{salesRow.passiver} / D:{salesRow.detraktor}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="psr-nps-pill nps-mid">
                              {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------
          TAB CONTENT 4: WARRANTY TIME
          -------------------------------------------------------------------- */}
      {activeTab === 'warranty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="psr-table-card">
            <div className="psr-table-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 className="psr-table-title">
                  <span className="psr-card-title-dot" />
                  <span>
                    Rata-rata Waktu Warranty {warrantyTab === 'spv' ? 'per Tim' : 'Semua Sales'}
                  </span>
                </h3>
              </div>

              {/* Toggle Sub-tab */}
              <div className="psr-warranty-toggle-box">
                <button
                  type="button"
                  className={`psr-warranty-toggle-btn ${warrantyTab === 'spv' ? 'is-active' : ''}`}
                  onClick={() => setWarrantyTab('spv')}
                >
                  Per Tim (SPV)
                </button>
                <button
                  type="button"
                  className={`psr-warranty-toggle-btn ${warrantyTab === 'sales' ? 'is-active' : ''}`}
                  onClick={() => setWarrantyTab('sales')}
                >
                  Semua Sales
                </button>
              </div>
            </div>

            {warrantyTab === 'spv' ? (
              /* VIEW WARRANTY: PER TIM */
              <div className="psr-table-responsive">
                <table className="psr-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Supervisor (SPV)</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Rata-rata Waktu</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Status Konsumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spvData.filter((d) => d.warranty_count >= minData).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="psr-empty-state">
                          Tidak ada data tim yang memenuhi kriteria.
                        </td>
                      </tr>
                    ) : (
                      spvData
                        .filter((d) => d.warranty_count >= minData)
                        .sort((a, b) => a.avg_warranty - b.avg_warranty)
                        .map((row, idx) => {
                          const isExpanded = expandedSpv === 'wq_' + row.spv
                          const daysClass =
                            row.avg_warranty <= 3 ? 'score-green' : row.avg_warranty <= 7 ? 'score-amber' : 'score-red'

                          return (
                            <React.Fragment key={idx}>
                              <tr
                                className={`is-clickable ${isExpanded ? 'is-expanded' : ''}`}
                                onClick={() => setExpandedSpv(isExpanded ? null : 'wq_' + row.spv)}
                              >
                                <td>
                                  <div className="psr-entity-name">{row.spv}</div>
                                  <div className="psr-entity-sub">
                                    <HiOutlineUserGroup size={12} />
                                    <span>{row.sales_list?.length || 0} Sales</span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className={`psr-warranty-days ${daysClass}`}>
                                    {row.avg_warranty}{' '}
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                      Hari
                                    </span>
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div
                                    className="psr-cell-interactive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedWarrantyDetails({
                                        title: `Tim ${row.spv}`,
                                        details: row.detail_warranty
                                      })
                                    }}
                                  >
                                    <div className="psr-warranty-badge-pair">
                                      <div
                                        className={`psr-w-box ${
                                          row.pdi_count === 0 ? 'w-box-success' : 'w-box-danger'
                                        }`}
                                      >
                                        <span className="psr-pill-key">Belum</span>
                                        <span className="psr-pill-val">{row.pdi_count}</span>
                                      </div>
                                      <span style={{ color: '#cbd5e1', fontWeight: 800 }}>/</span>
                                      <div className="psr-w-box w-box-total">
                                        <span className="psr-pill-key">Total</span>
                                        <span className="psr-pill-val">{row.warranty_count}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>

                              {/* Nested Sales in Warranty */}
                              {isExpanded && (
                                <tr className="psr-nested-row">
                                  <td colSpan={3} style={{ padding: 0 }}>
                                    <div className="psr-nested-wrapper">
                                      <div className="psr-nested-header">
                                        <span>Rata-rata Waktu Warranty – Tim {row.spv}</span>
                                      </div>
                                      <table className="psr-table">
                                        <thead>
                                          <tr>
                                            <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                                            <th>Nama Sales</th>
                                            <th style={{ width: '140px', textAlign: 'center' }}>Rata-rata Waktu</th>
                                            <th style={{ width: '160px', textAlign: 'center' }}>Status Konsumen</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {[...row.sales_list]
                                            .sort((a, b) => a.avg_warranty - b.avg_warranty)
                                            .map((sRow, sIdx) => (
                                              <tr key={sIdx}>
                                                <td style={{ textAlign: 'center', color: '#94a3b8' }}>{sIdx + 1}</td>
                                                <td style={{ fontWeight: 700 }}>{sRow.sales}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                  <span
                                                    className={`psr-warranty-days ${
                                                      sRow.avg_warranty <= 3
                                                        ? 'score-green'
                                                        : sRow.avg_warranty <= 7
                                                        ? 'score-amber'
                                                        : 'score-red'
                                                    }`}
                                                    style={{ fontSize: '0.95rem' }}
                                                  >
                                                    {sRow.avg_warranty} Hari
                                                  </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  <div
                                                    className="psr-cell-interactive"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      setSelectedWarrantyDetails({
                                                        title: `Sales ${sRow.sales}`,
                                                        details: sRow.detail_warranty
                                                      })
                                                    }}
                                                  >
                                                    <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                                                      {sRow.pdi_count} / {sRow.warranty_count}
                                                    </span>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VIEW WARRANTY: SEMUA SALES */
              <div className="psr-table-responsive">
                <table className="psr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '48px', textAlign: 'center' }}>No</th>
                      <th>Nama Sales</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Rata-rata Waktu</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Status Konsumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allSales]
                      .filter((d) => d.warranty_count >= minData)
                      .sort((a, b) => a.avg_warranty - b.avg_warranty)
                      .map((salesRow, idx) => {
                        const daysClass =
                          salesRow.avg_warranty <= 3
                            ? 'score-green'
                            : salesRow.avg_warranty <= 7
                            ? 'score-amber'
                            : 'score-red'

                        return (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                              {idx + 1}
                            </td>
                            <td>
                              <div className="psr-entity-name">{salesRow.sales}</div>
                              <div className="psr-entity-sub">
                                <span className="psr-red-bullet" />
                                <span>SPV: {salesRow.spvName}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`psr-warranty-days ${daysClass}`}>
                                {salesRow.avg_warranty}{' '}
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hari</span>
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div
                                className="psr-cell-interactive"
                                onClick={() =>
                                  setSelectedWarrantyDetails({
                                    title: `Sales ${salesRow.sales}`,
                                    details: salesRow.detail_warranty
                                  })
                                }
                              >
                                <div className="psr-warranty-badge-pair">
                                  <div
                                    className={`psr-w-box ${
                                      salesRow.pdi_count === 0 ? 'w-box-success' : 'w-box-danger'
                                    }`}
                                  >
                                    <span className="psr-pill-key">Belum</span>
                                    <span className="psr-pill-val">{salesRow.pdi_count}</span>
                                  </div>
                                  <span style={{ color: '#cbd5e1', fontWeight: 800 }}>/</span>
                                  <div className="psr-w-box w-box-total">
                                    <span className="psr-pill-key">Total</span>
                                    <span className="psr-pill-val">{salesRow.warranty_count}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL 1: DAFTAR SEMUA TIM & SALES (showAllSpvModal)
          -------------------------------------------------------------------- */}
      {showAllSpvModal && (
        <div className="psr-modal-backdrop" onClick={() => setShowAllSpvModal(false)}>
          <div
            className="psr-modal-panel is-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="psr-modal-header">
              <div>
                <h3 className="psr-modal-title">Daftar Semua Tim & Sales</h3>
                <p className="psr-modal-subtitle">
                  Struktur seluruh Supervisor dan Sales di bawah naungan Dealer Sunny
                </p>
              </div>
              <button
                type="button"
                className="psr-modal-close-btn"
                onClick={() => setShowAllSpvModal(false)}
                aria-label="Tutup modal"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="psr-modal-body">
              <div className="psr-spv-modal-grid">
                {spvData.map((spv, idx) => (
                  <div key={idx} className="psr-spv-card">
                    <div className="psr-spv-card-top">
                      <div className="psr-spv-card-name">
                        <span className="psr-red-bullet" />
                        <span>SPV: {spv.spv}</span>
                      </div>
                      <span className="psr-spv-sales-badge">
                        {spv.sales_list?.length || 0} Sales
                      </span>
                    </div>

                    <div className="psr-spv-sales-list">
                      {spv.sales_list?.map((sRow, sIdx) => (
                        <div key={sIdx} className="psr-spv-sales-row">
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {sIdx + 1}. {sRow.sales}
                          </span>
                          <span
                            className={`psr-score-text ${
                              sRow.skor >= 80 ? 'score-green' : sRow.skor >= 60 ? 'score-blue' : 'score-amber'
                            }`}
                            style={{ fontSize: '0.85rem' }}
                          >
                            Skor: {sRow.skor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL 2: DETAIL STATUS SURVEY (selectedSurveyDetails)
          -------------------------------------------------------------------- */}
      {selectedSurveyDetails && (
        <div className="psr-modal-backdrop" onClick={() => setSelectedSurveyDetails(null)}>
          <div
            className="psr-modal-panel is-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="psr-modal-header">
              <div>
                <h3 className="psr-modal-title">Detail Status Survey Konsumen</h3>
                <p className="psr-modal-subtitle">
                  Sales: <strong>{selectedSurveyDetails.sales}</strong>
                </p>
              </div>
              <button
                type="button"
                className="psr-modal-close-btn"
                onClick={() => setSelectedSurveyDetails(null)}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="psr-modal-body">
              <table className="psr-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th>Nama Konsumen</th>
                    <th>Kendaraan & Rangka</th>
                    <th style={{ textAlign: 'center' }}>Status Survey</th>
                    <th style={{ textAlign: 'center' }}>NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSurveyDetails.details && selectedSurveyDetails.details.length > 0 ? (
                    selectedSurveyDetails.details.map((item, idx) => {
                      const npsItem = selectedSurveyDetails.nps_details?.find((n) => n.rangka === item.rangka)
                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#334155' }}>{item.kendaraan}</div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#94a3b8' }}>
                              {item.rangka}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span
                                className={`psr-nps-pill ${
                                  item.status_survey === 'Sudah' ? 'nps-high' : 'nps-mid'
                                }`}
                                style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginBottom: '0.2rem' }}
                              >
                                {item.status_survey}
                              </span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>
                                {item.status_detail}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {npsItem ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span
                                  className={`psr-nps-pill ${
                                    npsItem.kategori === 'promotor'
                                      ? 'nps-high'
                                      : npsItem.kategori === 'passive'
                                      ? 'nps-mid'
                                      : 'nps-low'
                                  }`}
                                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', textTransform: 'capitalize' }}
                                >
                                  {npsItem.kategori}
                                </span>
                                {npsItem.score !== null && (
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                    Skor: {npsItem.score}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>–</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="psr-empty-state">
                        Belum ada detail data survey untuk sales ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL 3: DETAIL SIMPLE NPS (selectedNpsDetails)
          -------------------------------------------------------------------- */}
      {selectedNpsDetails && (
        <div className="psr-modal-backdrop" onClick={() => setSelectedNpsDetails(null)}>
          <div
            className="psr-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="psr-modal-header">
              <div>
                <h3 className="psr-modal-title">Detail Simple Net Promoter Score (NPS)</h3>
                <p className="psr-modal-subtitle">
                  Sales: <strong>{selectedNpsDetails.sales}</strong>
                </p>
              </div>
              <button
                type="button"
                className="psr-modal-close-btn"
                onClick={() => setSelectedNpsDetails(null)}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="psr-modal-body">
              <table className="psr-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th>Nama Konsumen</th>
                    <th>Kendaraan & Rangka</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Skor</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNpsDetails.details && selectedNpsDetails.details.length > 0 ? (
                    selectedNpsDetails.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{item.kendaraan}</div>
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#94a3b8' }}>
                            {item.rangka}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.score !== null ? (
                            <div className="psr-tooltip-container">
                              <span
                                style={{
                                  fontFamily: 'JetBrains Mono',
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  borderBottom: item.note ? '1px dashed #94a3b8' : 'none'
                                }}
                              >
                                {item.score}
                              </span>
                              {item.note && (
                                <div className="psr-tooltip-box">
                                  <div className="psr-tooltip-header">Catatan Survey</div>
                                  <div>"{item.note}"</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            '–'
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`psr-nps-pill ${
                              item.kategori === 'promotor'
                                ? 'nps-high'
                                : item.kategori === 'passive'
                                ? 'nps-mid'
                                : 'nps-low'
                            }`}
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', textTransform: 'capitalize' }}
                          >
                            {item.kategori}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="psr-empty-state">
                        Belum ada data NPS konsumen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL 4: DETAIL WARRANTY CONSUMER (selectedWarrantyDetails)
          -------------------------------------------------------------------- */}
      {selectedWarrantyDetails && (
        <div className="psr-modal-backdrop" onClick={() => setSelectedWarrantyDetails(null)}>
          <div
            className="psr-modal-panel is-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="psr-modal-header">
              <div>
                <h3 className="psr-modal-title">Detail Konsumen & Waktu Warranty</h3>
                <p className="psr-modal-subtitle">{selectedWarrantyDetails.title}</p>
              </div>
              <button
                type="button"
                className="psr-modal-close-btn"
                onClick={() => setSelectedWarrantyDetails(null)}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="psr-modal-body">
              <table className="psr-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th>Nama Konsumen</th>
                    <th>Kendaraan & Rangka</th>
                    <th style={{ textAlign: 'center' }}>Tgl PDI</th>
                    <th style={{ textAlign: 'center' }}>Tgl WA / Update</th>
                    <th style={{ textAlign: 'center' }}>Selisih Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWarrantyDetails.details && selectedWarrantyDetails.details.length > 0 ? (
                    selectedWarrantyDetails.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{item.kendaraan}</div>
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#94a3b8' }}>
                            {item.rangka}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                          {item.pdi_date && item.pdi_date !== '0000-00-00'
                            ? item.pdi_date.substring(0, 10)
                            : '–'}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                          {item.status === 'PDI' ? (
                            <span style={{ color: '#E3000C', fontWeight: 700 }}>Belum Warranty</span>
                          ) : item.wa_date && item.wa_date !== '0000-00-00' ? (
                            <span style={{ color: '#334155' }}>{item.wa_date.substring(0, 10)}</span>
                          ) : (
                            '–'
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`psr-nps-pill ${
                              item.status === 'PDI'
                                ? 'nps-low'
                                : item.days <= 3
                                ? 'nps-high'
                                : item.days <= 7
                                ? 'nps-mid'
                                : 'nps-low'
                            }`}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                          >
                            {item.days} Hari
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="psr-empty-state">
                        Belum ada data detail konsumen warranty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
