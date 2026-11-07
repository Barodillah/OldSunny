import { useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AIAssistantFloating from './components/AIAssistantFloating.jsx'
import SunnyCustomerChatHistoryModal from './components/SunnyCustomerChatHistoryModal.jsx'
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
import FaqPage from './pages/FaqPage.jsx'
import SearchResults from './pages/SearchResults.jsx'
import NotFound from './pages/NotFound.jsx'
import Forbidden from './pages/Forbidden.jsx'
import BadRequest from './pages/BadRequest.jsx'
import TooManyRequests from './pages/TooManyRequests.jsx'
import ServerError from './pages/ServerError.jsx'
import ServiceUnavailable from './pages/ServiceUnavailable.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import './App.css'
import RouteSeoManager from './components/RouteSeoManager.jsx'
import DynamicFaqSection from './components/DynamicFaqSection.jsx'

const PortalApp = lazy(() => import('./portal/PortalApp.jsx'))

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
    <>
      <RouteSeoManager />
      {isPortalRoute ? (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0F172A' }} />}>
          <PortalApp />
        </Suspense>
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
              <Route path="/news/:slug" element={<ArticleDetail />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/contact" element={<Contact onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/faq" element={<FaqPage onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/faqs" element={<FaqPage onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />
              <Route path="/search" element={<SearchResults />} />

              {/* Explicit & Catch-All Error Pages */}
              <Route path="/404" element={<NotFound />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/400" element={<BadRequest />} />
              <Route path="/429" element={<TooManyRequests />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/503" element={<ServiceUnavailable />} />
              <Route path="/error/:code" element={<ErrorPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <DynamicFaqSection onOpenAiChat={(topic) => setSelectedAiService(topic)} />
          <Footer />

          {/* Floating Retro AI Companion (Sunny) - Active on public pages */}
          <AIAssistantFloating
            prefilledAction={selectedAiService}
            onClosePrefill={() => setSelectedAiService(null)}
          />

          {/* Customer Chat History Modal */}
          <SunnyCustomerChatHistoryModal />
        </div>
      )}
    </>
  )
}

export default App
