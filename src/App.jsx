import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AIAssistantFloating from './components/AIAssistantFloating.jsx'
import Home from './pages/Home.jsx'
import Organization from './pages/Organization.jsx'
import Vehicles from './pages/Vehicles.jsx'
import SalesList from './pages/SalesList.jsx'
import Contact from './pages/Contact.jsx'
import News from './pages/News.jsx'
import ArticleDetail from './pages/ArticleDetail.jsx'
import Facilities from './pages/Facilities.jsx'
import Accessories from './pages/Accessories.jsx'
import Promo from './pages/Promo.jsx'
import ServiceOnRoad from './pages/ServiceOnRoad.jsx'
import BookingService from './pages/BookingService.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

// Portal Management Imports
import { PortalAuthProvider } from './portal/context/PortalAuthContext.jsx'
import PortalLayout from './portal/PortalLayout.jsx'
import PortalDashboard from './portal/pages/PortalDashboard.jsx'
import PortalUsers from './portal/pages/PortalUsers.jsx'
import PortalLogin from './portal/pages/PortalLogin.jsx'

function App() {
  const [selectedAiService, setSelectedAiService] = useState(null)
  const location = useLocation()
  const isPortalRoute = location.pathname.startsWith('/portal')

  const handleOpenEmergency = () => {
    setSelectedAiService({
      id: 'emergency',
      title: 'Bantuan Darurat 24/7 (SOS)',
    })
  }

  return (
    <PortalAuthProvider>
      {isPortalRoute ? (
        <Routes>
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="dashboard" element={<PortalDashboard />} />
            <Route path="users" element={<PortalUsers />} />
          </Route>
          <Route path="/portal/*" element={<NotFound />} />
        </Routes>
      ) : (
        <div className="app-shell">
          <Navbar onOpenEmergency={handleOpenEmergency} />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/booking" element={<BookingService />} />
              <Route path="/booking-service" element={<BookingService />} />
              <Route path="/service-on-road" element={<ServiceOnRoad />} />
              <Route path="/service-on-the-road" element={<ServiceOnRoad />} />
              <Route path="/facilities" element={<Facilities onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/fasilitas" element={<Facilities onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/accessories" element={<Accessories onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/aksesoris" element={<Accessories onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/promo" element={<Promo onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/promo-event" element={<Promo onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicle-list" element={<Vehicles />} />
              <Route path="/sales" element={<SalesList />} />
              <Route path="/sales-list" element={<SalesList />} />
              <Route path="/organization" element={<Organization />} />
              <Route path="/struktur-organisasi" element={<Organization />} />
              <Route path="/about" element={<Organization />} />
              <Route path="/services" element={<Facilities onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<ArticleDetail />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/contact" element={<Contact onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />

          {/* Floating Retro AI Companion (Sunny) - Active on public pages */}
          <AIAssistantFloating
            prefilledAction={selectedAiService}
            onClosePrefill={() => setSelectedAiService(null)}
          />
        </div>
      )}
    </PortalAuthProvider>
  )
}

export default App
