import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AIAssistantFloating from './components/AIAssistantFloating.jsx'
import Home from './pages/Home.jsx'
import Organization from './pages/Organization.jsx'
import Services from './pages/Services.jsx'
import Vehicles from './pages/Vehicles.jsx'
import SalesList from './pages/SalesList.jsx'
import Contact from './pages/Contact.jsx'
import News from './pages/News.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  const [selectedAiService, setSelectedAiService] = useState(null)

  const handleOpenEmergency = () => {
    setSelectedAiService({
      id: 'emergency',
      title: 'Bantuan Darurat 24/7 (SOS)',
    })
  }

  return (
    <div className="app-shell">
      <Navbar onOpenEmergency={handleOpenEmergency} />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicle-list" element={<Vehicles />} />
          <Route path="/sales" element={<SalesList />} />
          <Route path="/sales-list" element={<SalesList />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/struktur-organisasi" element={<Organization />} />
          <Route path="/about" element={<Organization />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />

      {/* Floating Retro AI Companion (Sunny) - Active on all pages */}
      <AIAssistantFloating
        prefilledAction={selectedAiService}
        onClosePrefill={() => setSelectedAiService(null)}
      />
    </div>
  )
}

export default App

