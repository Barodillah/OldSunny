import { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import NotFound from './pages/NotFound.jsx'
import Forbidden from './pages/Forbidden.jsx'
import BadRequest from './pages/BadRequest.jsx'
import TooManyRequests from './pages/TooManyRequests.jsx'
import ServerError from './pages/ServerError.jsx'
import ServiceUnavailable from './pages/ServiceUnavailable.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import './App.css'

// Portal Management Imports
import { PortalAuthProvider } from './portal/context/PortalAuthContext.jsx'
import PortalLayout from './portal/PortalLayout.jsx'
import PortalDashboard from './portal/pages/PortalDashboard.jsx'
import PortalUsers from './portal/pages/PortalUsers.jsx'
import PortalChatHistory from './portal/pages/PortalChatHistory.jsx'
import PortalLeads from './portal/pages/PortalLeads.jsx'
import PortalLogin from './portal/pages/PortalLogin.jsx'
import PortalOrganization from './portal/pages/PortalOrganization.jsx'
import PortalSales from './portal/pages/PortalSales.jsx'
import PortalInactive from './portal/pages/PortalInactive.jsx'
import PortalSalesRate from './portal/pages/PortalSalesRate.jsx'
import PortalKnowledgePlaceholder from './portal/pages/PortalKnowledgePlaceholder.jsx'
import PortalArticles from './portal/pages/PortalArticles.jsx'
import PortalArticleEditor from './portal/pages/PortalArticleEditor.jsx'

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
          <Route path="/portal/403" element={<Forbidden />} />
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="dashboard" element={<PortalDashboard />} />
            <Route path="leads" element={<PortalLeads />} />
            <Route path="chat-history" element={<PortalChatHistory />} />
            <Route path="employees" element={<Navigate to="/portal/employees/organization" replace />} />
            <Route path="employees/organization" element={<PortalOrganization />} />
            <Route path="employees/sales" element={<PortalSales />} />
            <Route path="employees/inactive" element={<PortalInactive />} />
            <Route path="knowledge" element={<Navigate to="/portal/knowledge/price-list" replace />} />
            <Route path="knowledge/price-list" element={<PortalKnowledgePlaceholder title="Price List" />} />
            <Route path="knowledge/accessories" element={<PortalKnowledgePlaceholder title="Aksesoris" />} />
            <Route path="knowledge/sparepart" element={<PortalKnowledgePlaceholder title="Sparepart" />} />
            <Route path="knowledge/promo-event" element={<PortalKnowledgePlaceholder title="Promo & Event" />} />
            <Route path="articles" element={<PortalArticles />} />
            <Route path="articles/create" element={<PortalArticleEditor />} />
            <Route path="articles/edit/:id" element={<PortalArticleEditor />} />
            <Route path="sales-rate" element={<PortalSalesRate />} />
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
              <Route path="/news/:slug" element={<ArticleDetail />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/contact" element={<Contact onOpenAiChat={(topic) => setSelectedAiService(topic)} />} />

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
    </PortalAuthProvider>
  )
}

export default App
