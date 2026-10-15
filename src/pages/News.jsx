import { Link } from 'react-router-dom'
import { HiOutlineCalendar, HiOutlineSparkles, HiOutlineArrowLeft } from 'react-icons/hi2'

export default function News() {
  const articles = [
    {
      id: 1,
      title: 'Peluncuran Standar Layanan H.O.M.E: Babak Baru Kepuasan Pelanggan Sunny',
      category: 'Standar Layanan',
      date: '14 Oktober 2026',
      readTime: '3 mnt baca',
      summary: 'Mitsubishi Sun Bekasi secara resmi mengadopsi filosofi H.O.M.E (Hospitality, One Service Standard, Memorable Experience, dan Empathy) demi menjamin keterbukaan transaksi dan kepuasan pemilik kendaraan.',
      tag: 'Pengumuman Resmi',
    },
    {
      id: 2,
      title: 'Tips Memastikan Keaslian Suku Cadang dan Rekening Resmi Dealer',
      category: 'Edukasi Konsumen',
      date: '10 Oktober 2026',
      readTime: '4 mnt baca',
      summary: 'Lindungi diri Anda dari oknum transaksi dengan selalu memverifikasi rekening virtual account resmi dan memastikan barcode suku cadang asli bergaransi pabrik.',
      tag: 'Panduan Keamanan',
    },
    {
      id: 3,
      title: 'Kesiapan Armada Derek 24 Jam Sunny Menghadapi Musim Hujan',
      category: 'Bengkel & Darurat',
      date: '02 Oktober 2026',
      readTime: '2 mnt baca',
      summary: 'Tim mekanik dan unit derek siaga kami memperluas radius jangkauan tanggap darurat 24/7 untuk memastikan perjalanan Anda tetap aman di segala kondisi cuaca.',
      tag: 'Layanan Darurat',
    },
  ]

  return (
    <main className="page-container">
      <section className="content-card">
        <div className="section-category-pill">
          <HiOutlineSparkles size={13} />
          <span>Memoriable Experience</span>
        </div>
        <h1 className="page-title">News & Update Sunny</h1>
        <p className="page-intro">
          Informasi terkini, pengumuman transparansi dealer, dan cerita pengalaman terbaik bersama komunitas Sunny.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
          {articles.map((item) => (
            <article
              key={item.id}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-sunset)', backgroundColor: 'var(--accent-sunset-subtle)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <HiOutlineCalendar size={13} />
                  {item.date}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                {item.summary}
              </p>
            </article>
          ))}
        </div>

        <div className="action-row" style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <HiOutlineArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
