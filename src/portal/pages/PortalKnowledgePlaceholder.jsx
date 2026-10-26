export default function PortalKnowledgePlaceholder({ title }) {
  return (
    <div className="portal-page-container" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
      <div
        style={{
          maxWidth: '520px',
          margin: '3.5rem auto',
          padding: '2.5rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
            letterSpacing: '0.04em'
          }}
        >
          PUBLIC KNOWLEDGE
        </span>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          {title}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          Halaman data <strong>{title}</strong> siap diintegrasikan. Struktur menu dan rute telah aktif.
        </p>
      </div>
    </div>
  )
}
