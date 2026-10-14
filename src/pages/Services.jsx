import { Link } from 'react-router-dom'

export default function Services() {
  const serviceList = [
    {
      id: 1,
      title: 'Integrasi Komponen Interaktif',
      desc: 'Pengembangan komponen UI modular berbasis React hooks dan state management modern.',
    },
    {
      id: 2,
      title: 'Routing Dinamis & Proteksi Rute',
      desc: 'Konfigurasi navigasi nested route, URL parameters, query string, dan redirection.',
    },
    {
      id: 3,
      title: 'Desain Responsif & Aksesibilitas',
      desc: 'Tata letak yang adaptif di layar ponsel hingga monitor desktop sesuai standar WCAG AA.',
    },
  ]

  return (
    <main className="page-container">
      <section className="content-card">
        <span className="badge-pill">Layanan</span>
        <h1 className="page-title">Fitur & Layanan</h1>
        <p className="page-intro">
          Modul-modul dasar siap disambungkan ke API backend atau disesuaikan dengan kebutuhan alur bisnis.
        </p>

        <div className="cards-stack">
          {serviceList.map((service) => (
            <div key={service.id} className="service-row-card">
              <div className="service-number">0{service.id}</div>
              <div>
                <h3 className="service-heading">{service.title}</h3>
                <p className="service-text">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="action-row">
          <Link to="/contact" className="btn btn-primary">
            Hubungi Kami
          </Link>
          <Link to="/" className="btn btn-secondary">
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  )
}
