import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'
import News from './pages/News.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

const currentYear = new Date().getFullYear()

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {currentYear} OldSunny. React + React Router DOM Starter.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
