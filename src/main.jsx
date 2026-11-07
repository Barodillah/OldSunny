import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Auto-recover from stale chunk/bundle cache after a new deployment
window.addEventListener('vite:preloadError', () => {
  const reloadKey = 'sunny_chunk_reload_ts'
  const lastReload = Number(sessionStorage.getItem(reloadKey) || 0)
  if (Date.now() - lastReload > 15000) {
    sessionStorage.setItem(reloadKey, String(Date.now()))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
