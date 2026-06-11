import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleGuard } from './components/shared/Guards';
import Layout from './components/Layout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Traveler
import TravelerHome from './pages/traveler/TravelerHome';
import SearchResults from './pages/traveler/SearchResults';
import BookingPage from './pages/traveler/BookingPage';
import FlightBookingPage from './pages/traveler/FlightBookingPage';
import HotelBookingPage from './pages/traveler/HotelBookingPage';
import BusBookingPage from './pages/traveler/BusBookingPage';
import MyTrips from './pages/traveler/MyTrips';
import Notifications from './pages/traveler/Notifications';
import Profile from './pages/traveler/Profile';
import ItinerariesListPage from './pages/traveler/ItinerariesListPage';
import ItineraryDetailPage from './pages/traveler/ItineraryDetailPage';
import CreateItineraryPage from './pages/traveler/CreateItineraryPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminPartnersPage from './pages/admin/PartnersPage';
import AdminInventoryPage from './pages/admin/InventoryPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

// Agent
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentCustomersPage from './pages/agent/CustomersPage';
import AgentBookingsPage from './pages/agent/BookingsPage';
import AgentCommissionsPage from './pages/agent/CommissionsPage';
import AgentGroupBookingPage from './pages/agent/GroupBookingPage';
import AgentCustomerDetailPage from './pages/agent/CustomerDetailPage';

// Corporate
import CorpDashboard from './pages/corp/CorpDashboard';
import CorpEmployeesPage from './pages/corp/EmployeesPage';
import CorpApprovalsPage from './pages/corp/ApprovalsPage';
import CorpBudgetPage from './pages/corp/BudgetPage';
import CorpReportsPage from './pages/corp/ReportsPage';

// Finance
import FinanceDashboard from './pages/finance/FinanceDashboard';
import FinanceInvoicesPage from './pages/finance/InvoicesPage';
import FinancePaymentsPage from './pages/finance/PaymentsPage';
import FinanceReportsPage from './pages/finance/ReportsPage';
import FinanceKpiReportsPage from './pages/finance/KpiReportsPage';
import FinanceSettlementsPage from './pages/finance/SettlementsPage';

// Compliance
import ComplianceDashboard from './pages/compliance/ComplianceDashboard';
import ComplianceAuditLogsPage from './pages/compliance/AuditLogsPage';
import ComplianceReportsPage from './pages/compliance/ReportsPage';
import ComplianceViolationsPage from './pages/compliance/ViolationsPage';

function App() {
  const { isAuthenticated, getHomePath } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getHomePath()} /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<div className="text-center py-5"><h3>Access Denied</h3></div>} />

      {/* Protected with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Traveler */}
        <Route path="/traveler/home" element={<TravelerHome />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/traveler/book/:inventoryId" element={<BookingPage />} />
        <Route path="/book/flight/:id" element={<FlightBookingPage />} />
        <Route path="/book/hotel/:id" element={<HotelBookingPage />} />
        <Route path="/book/bus/:id" element={<BusBookingPage />} />
        <Route path="/traveler/trips" element={<MyTrips />} />
        <Route path="/traveler/itineraries" element={<ItinerariesListPage />} />
        <Route path="/traveler/itinerary/new" element={<CreateItineraryPage />} />
        <Route path="/traveler/itinerary/:id" element={<ItineraryDetailPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<RoleGuard allowed={['ADMIN']}><AdminDashboard /></RoleGuard>} />
        <Route path="/admin/users" element={<RoleGuard allowed={['ADMIN']}><AdminUsersPage /></RoleGuard>} />
        <Route path="/admin/partners" element={<RoleGuard allowed={['ADMIN']}><AdminPartnersPage /></RoleGuard>} />
        <Route path="/admin/inventory" element={<RoleGuard allowed={['ADMIN']}><AdminInventoryPage /></RoleGuard>} />
        <Route path="/admin/settings" element={<RoleGuard allowed={['ADMIN']}><AdminSettingsPage /></RoleGuard>} />

        {/* Agent */}
        <Route path="/agent/dashboard" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentDashboard /></RoleGuard>} />
        <Route path="/agent/customers" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentCustomersPage /></RoleGuard>} />
        <Route path="/agent/group-booking" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentGroupBookingPage /></RoleGuard>} />
        <Route path="/agent/bookings" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentBookingsPage /></RoleGuard>} />
        <Route path="/agent/commissions" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentCommissionsPage /></RoleGuard>} />
        <Route path="/agent/customer/:id" element={<RoleGuard allowed={['TRAVEL_AGENT','ADMIN']}><AgentCustomerDetailPage /></RoleGuard>} />

        {/* Corporate */}
        <Route path="/corp/dashboard" element={<RoleGuard allowed={['CORPORATE_MANAGER','ADMIN']}><CorpDashboard /></RoleGuard>} />
        <Route path="/corp/employees" element={<RoleGuard allowed={['CORPORATE_MANAGER','ADMIN']}><CorpEmployeesPage /></RoleGuard>} />
        <Route path="/corp/approvals" element={<RoleGuard allowed={['CORPORATE_MANAGER','ADMIN']}><CorpApprovalsPage /></RoleGuard>} />
        <Route path="/corp/budget" element={<RoleGuard allowed={['CORPORATE_MANAGER','ADMIN']}><CorpBudgetPage /></RoleGuard>} />
        <Route path="/corp/reports" element={<RoleGuard allowed={['CORPORATE_MANAGER','ADMIN']}><CorpReportsPage /></RoleGuard>} />

        {/* Finance */}
        <Route path="/finance/dashboard" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinanceDashboard /></RoleGuard>} />
        <Route path="/finance/invoices" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinanceInvoicesPage /></RoleGuard>} />
        <Route path="/finance/payments" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinancePaymentsPage /></RoleGuard>} />
        <Route path="/finance/revenue" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinanceReportsPage /></RoleGuard>} />
        <Route path="/finance/kpi-reports" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinanceKpiReportsPage /></RoleGuard>} />
        <Route path="/finance/settlements" element={<RoleGuard allowed={['FINANCE_OFFICER','ADMIN']}><FinanceSettlementsPage /></RoleGuard>} />

        {/* Compliance */}
        <Route path="/compliance/dashboard" element={<RoleGuard allowed={['COMPLIANCE_OFFICER','ADMIN']}><ComplianceDashboard /></RoleGuard>} />
        <Route path="/compliance/audit-logs" element={<RoleGuard allowed={['COMPLIANCE_OFFICER','ADMIN']}><ComplianceAuditLogsPage /></RoleGuard>} />
        <Route path="/compliance/reports" element={<RoleGuard allowed={['COMPLIANCE_OFFICER','ADMIN']}><ComplianceReportsPage /></RoleGuard>} />
        <Route path="/compliance/violations" element={<RoleGuard allowed={['COMPLIANCE_OFFICER','ADMIN']}><ComplianceViolationsPage /></RoleGuard>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isAuthenticated ? getHomePath() : '/login'} />} />
    </Routes>
  );
}

export default App;
