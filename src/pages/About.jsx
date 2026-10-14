import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="page-container">
      <section className="content-card">
        <span className="badge-pill">Tentang Proyek</span>
        <h1 className="page-title">Tentang Aplikasi</h1>
        <p className="page-intro">
          Aplikasi frontend ini dibangun dengan stack modern: React 19, Vite, dan
          React Router DOM untuk routing Client-Side Rendering (CSR) yang mulus.
        </p>

        <div className="info-list">
          <div className="info-item">
            <strong>Framework:</strong> React 19 (JSX)
          </div>
          <div className="info-item">
            <strong>Bundler & Dev Server:</strong> Vite 8
          </div>
          <div className="info-item">
            <strong>Routing Library:</strong> React Router DOM v7
          </div>
          <div className="info-item">
            <strong>Arsitektur:</strong> Single Page Application (SPA)
          </div>
        </div>

        <div className="action-row">
          <Link to="/" className="btn btn-secondary">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  )
}
