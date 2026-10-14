import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page-container">
      <section className="not-found-card">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Halaman Tidak Ditemukan</h1>
        <p className="not-found-desc">
          Rute yang Anda akses tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/" className="btn btn-primary">
          &larr; Kembali ke Beranda
        </Link>
      </section>
    </main>
  )
}
