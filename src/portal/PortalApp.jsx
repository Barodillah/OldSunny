import { Routes, Route, Navigate } from 'react-router-dom'
import { PortalAuthProvider } from './context/PortalAuthContext.jsx'
import PortalLayout from './PortalLayout.jsx'
import PortalDashboard from './pages/PortalDashboard.jsx'
import PortalUsers from './pages/PortalUsers.jsx'
import PortalChatHistory from './pages/PortalChatHistory.jsx'
import PortalLeads from './pages/PortalLeads.jsx'
import PortalLogin from './pages/PortalLogin.jsx'
import PortalOrganization from './pages/PortalOrganization.jsx'
import PortalSales from './pages/PortalSales.jsx'
import PortalInactive from './pages/PortalInactive.jsx'
import PortalSalesRate from './pages/PortalSalesRate.jsx'
import PortalPriceList from './pages/PortalPriceList.jsx'
import PortalAccessories from './pages/PortalAccessories.jsx'
import PortalSparepart from './pages/PortalSparepart.jsx'
import PortalPromoEvent from './pages/PortalPromoEvent.jsx'
import PortalExtendedPackage from './pages/PortalExtendedPackage.jsx'
import PortalServiceData from './pages/PortalServiceData.jsx'
import PortalArticles from './pages/PortalArticles.jsx'
import PortalArticleEditor from './pages/PortalArticleEditor.jsx'
import PortalProfile from './pages/PortalProfile.jsx'
import Forbidden from '../pages/Forbidden.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function PortalApp() {
  return (
    <PortalAuthProvider>
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
          <Route path="knowledge/price-list" element={<PortalPriceList />} />
          <Route path="knowledge/accessories" element={<PortalAccessories />} />
          <Route path="knowledge/sparepart" element={<PortalSparepart />} />
          <Route path="knowledge/promo-event" element={<PortalPromoEvent />} />
          <Route path="knowledge/extended-package" element={<PortalExtendedPackage />} />
          <Route path="knowledge/service-data" element={<PortalServiceData />} />
          <Route path="articles" element={<PortalArticles />} />
          <Route path="articles/create" element={<PortalArticleEditor />} />
          <Route path="articles/edit/:id" element={<PortalArticleEditor />} />
          <Route path="sales-rate" element={<PortalSalesRate />} />
          <Route path="users" element={<PortalUsers />} />
          <Route path="profile" element={<PortalProfile />} />
        </Route>
        <Route path="/portal/*" element={<NotFound />} />
      </Routes>
    </PortalAuthProvider>
  )
}

