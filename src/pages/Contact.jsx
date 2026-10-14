import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      setSubmitted(true)
    }
  }

  return (
    <main className="page-container">
      <section className="content-card">
        <span className="badge-pill">Kontak</span>
        <h1 className="page-title">Hubungi Kami</h1>
        <p className="page-intro">
          Kirimkan pesan atau pertanyaan seputar proyek dan integrasi sistem.
        </p>

        {submitted ? (
          <div className="alert-success">
            <h3>Pesan Terkirim!</h3>
            <p>Terima kasih, <strong>{formData.name}</strong>. Tim kami akan segera menindaklanjuti pesan Anda.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false)
                setFormData({ name: '', email: '', message: '' })
              }}
            >
              Kirim Pesan Lain
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name-input">Nama Lengkap</label>
              <input
                id="name-input"
                type="text"
                required
                className="form-input"
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email-input">Alamat Email</label>
              <input
                id="email-input"
                type="email"
                required
                className="form-input"
                placeholder="nama@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message-input">Pesan</label>
              <textarea
                id="message-input"
                rows="4"
                required
                className="form-input"
                placeholder="Tuliskan pesan atau kebutuhan Anda di sini..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Kirim Sekarang
              </button>
              <Link to="/" className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
