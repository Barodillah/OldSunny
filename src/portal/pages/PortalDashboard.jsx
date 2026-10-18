import { Link } from 'react-router-dom'
import {
  HiOutlineDocumentText,
  HiOutlineCheckBadge,
  HiOutlineWrenchScrewdriver,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2'
import './PortalDashboard.css'

const RECENT_TRANSACTIONS = [
  {
    id: 'TRX-101',
    customer: 'Bpk. Rizky Pratama',
    type: 'SPK Baru',
    vehicle: 'New XFORCE Ultimate',
    consultant: 'Agnes (SNY-SLS-0412)',
    status: 'Disetujui',
    statusClass: 'status-approved',
    time: '35 menit yang lalu'
  },
  {
    id: 'TRX-102',
    customer: 'Ibu Maria Ulfah',
    type: 'Penyerahan (PKT)',
    vehicle: 'New Xpander Cross',
    consultant: 'Amin (SNY-SLS-0588)',
    status: 'Selesai',
    statusClass: 'status-done',
    time: '2 jam yang lalu'
  },
  {
    id: 'TRX-103',
    customer: 'Bpk. Dedi Kurniawan',
    type: 'Booking Servis',
    vehicle: 'Pajero Sport Dakar 4x4',
    consultant: 'Bengkel Resmi Stall 03',
    status: 'Pengerjaan',
    statusClass: 'status-progress',
    time: '3 jam yang lalu'
  },
  {
    id: 'TRX-104',
    customer: 'PT Cahaya Logistik',
    type: 'SPK Fleet',
    vehicle: 'New Triton 4x4 & L300',
    consultant: 'Siti Rahmawati (SNY-SLS-0335)',
    status: 'Proses Leasing',
    statusClass: 'status-pending',
    time: '5 jam yang lalu'
  },
  {
    id: 'TRX-105',
    customer: 'Bpk. Tri Wicaksono',
    type: 'Service on Road',
    vehicle: 'Destinator Hybrid',
    consultant: 'Tim Teknisi Siaga Margahayu',
    status: 'Selesai',
    statusClass: 'status-done',
    time: 'Hari ini, 09:15 WIB'
  }
]

export default function PortalDashboard() {
  return (
    <div className="portal-dashboard">
      {/* Top Greeting Banner */}
      <div className="dashboard-welcome-card">
        <div className="welcome-text-col">
          <span className="welcome-kicker">RINGKASAN OPERASIONAL</span>
          <h2 className="welcome-title">Selamat Datang di Portal Sunny</h2>
          <p className="welcome-desc">
            Pantau performa penjualan SPK, ketepatan waktu penyerahan kendaraan (PKT), dan reservasi bengkel resmi Mitsubishi Sun Margahayu.
          </p>
        </div>

        <div className="welcome-meta-col">
          <div className="meta-badge-box">
            <HiOutlineBuildingOffice2 size={16} />
            <span>Cabang Sun Margahayu</span>
          </div>
          <div className="meta-badge-box meta-badge-open">
            <span className="dot-green" />
            <span>Showroom &amp; Bengkel Buka Hari Ini</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics Grid */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">SPK Aktif Bulan Ini</span>
            <div className="metric-icon-wrap icon-red">
              <HiOutlineDocumentText size={18} />
            </div>
          </div>
          <div className="metric-val">48 <span className="metric-unit">Unit</span></div>
          <div className="metric-sub text-green">
            <span>↑ +12% dari bulan sebelumnya</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Penyerahan (PKT)</span>
            <div className="metric-icon-wrap icon-green">
              <HiOutlineCheckBadge size={18} />
            </div>
          </div>
          <div className="metric-val">42 <span className="metric-unit">Unit</span></div>
          <div className="metric-sub">
            <span>Rata-rata proses: <strong>2.8 Hari</strong></span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Booking Servis Hari Ini</span>
            <div className="metric-icon-wrap icon-blue">
              <HiOutlineWrenchScrewdriver size={18} />
            </div>
          </div>
          <div className="metric-val">18 <span className="metric-unit">Mobil</span></div>
          <div className="metric-sub">
            <span>14 Selesai • 4 Dalam Proses</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Indeks Kepuasan (CSI)</span>
            <div className="metric-icon-wrap icon-yellow">
              <HiOutlineSparkles size={18} />
            </div>
          </div>
          <div className="metric-val">99.2%</div>
          <div className="metric-sub text-green">
            <span>Standar audit pabrikan terpenuhi</span>
          </div>
        </div>
      </div>

      {/* 2 Main Columns */}
      <div className="dashboard-content-split">
        {/* Left Column: Recent Activities */}
        <div className="dashboard-panel panel-left">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Aktivitas Operasional Terkini</h3>
              <p className="panel-subtitle">Daftar transaksi, SPK baru, dan penyelesaian servis hari ini.</p>
            </div>
            <span className="panel-count-pill">{RECENT_TRANSACTIONS.length} Transaksi</span>
          </div>

          <div className="panel-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Kategori</th>
                  <th>Model Kendaraan</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TRANSACTIONS.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{item.customer}</span>
                        <span className="customer-id">{item.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-type">{item.type}</span>
                    </td>
                    <td>
                      <span className="cell-vehicle">{item.vehicle}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span className="cell-time">
                        <HiOutlineClock size={13} />
                        <span>{item.time}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Facility Readiness & Quick Links */}
        <div className="dashboard-panel panel-right">
          <div className="panel-header">
            <h3 className="panel-title">Kesiapan Dealer Resmi</h3>
          </div>

          <div className="readiness-list">
            <div className="readiness-item">
              <div className="readiness-info">
                <span className="readiness-dot dot-green" />
                <div>
                  <span className="readiness-title">Stall Bengkel Resmi</span>
                  <span className="readiness-sub">6 Stall beroperasi penuh &amp; siap servis</span>
                </div>
              </div>
              <span className="readiness-badge">Optimal</span>
            </div>

            <div className="readiness-item">
              <div className="readiness-info">
                <span className="readiness-dot dot-green" />
                <div>
                  <span className="readiness-title">Service on Road</span>
                  <span className="readiness-sub">2 Unit armada reaksi darurat siaga</span>
                </div>
              </div>
              <span className="readiness-badge">Siaga</span>
            </div>

            <div className="readiness-item">
              <div className="readiness-info">
                <span className="readiness-dot dot-green" />
                <div>
                  <span className="readiness-title">Shuttle Service Antar Jemput</span>
                  <span className="readiness-sub">Driver siaga untuk pelanggan bengkel</span>
                </div>
              </div>
              <span className="readiness-badge">Aktif</span>
            </div>

            <div className="readiness-item">
              <div className="readiness-info">
                <span className="readiness-dot dot-green" />
                <div>
                  <span className="readiness-title">Rekening Bank Resmi</span>
                  <span className="readiness-sub">BCA: 3425419999 (PT Sun Star Prima Motor)</span>
                </div>
              </div>
              <span className="readiness-badge">Terverifikasi</span>
            </div>
          </div>

          {/* Quick Nav Box */}
          <div className="panel-quick-box">
            <span className="quick-box-label">NAVIGASI PENGGUNA</span>
            <Link to="/portal/users" className="quick-box-link">
              <span>Kelola Daftar Staf &amp; Pengguna</span>
              <HiOutlineArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
