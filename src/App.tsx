import { Routes, Route, Navigate } from 'react-router-dom'

import CustomerLayout from './layouts/CustomerLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import OrganizationRegister from './features/auth/pages/OrganizationRegister'
import ForgotPassword from './features/auth/pages/ForgotPassword'

import EventList from './features/events/pages/EventList'
import EventDetail from './features/events/pages/EventDetail'
import EventSelect from './features/events/pages/EventSelect'

import Checkout from './features/booking/pages/Checkout'
import PaymentSuccess from './features/booking/pages/PaymentSuccess'
import PaymentCancel from './features/booking/pages/PaymentCancel'

import MyTickets from './features/tickets/pages/MyTickets'
import TicketDetail from './features/tickets/pages/TicketDetail'

import OrgDashboard from './features/organizations/pages/Dashboard'
import EventManagement from './features/organizations/pages/EventManagement'
import EventCreate from './features/organizations/pages/EventCreate'
import VenueTemplates from './features/organizations/pages/VenueTemplates'
import TeamManagement from './features/organizations/pages/TeamManagement'
import QRValidation from './features/organizations/pages/QRValidation'
import OrgSettings from './features/organizations/pages/OrgSettings'
import OrgNotifications from './features/organizations/pages/OrgNotifications'

import AdminDashboard from './features/admin/pages/Dashboard'
import OrganizationApproval from './features/admin/pages/OrganizationApproval'
import UserManagement from './features/admin/pages/UserManagement'

import Profile from './features/profile/pages/Profile'
import Notifications from './features/notifications/pages/Notifications'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route index element={<Navigate to="/events" replace />} />

      {/* Auth */}
      <Route path="auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="register/organization" element={<OrganizationRegister />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Customer */}
      <Route path="/" element={<CustomerLayout />}>
        <Route path="events" element={<EventList />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="events/:eventId/select" element={<EventSelect />} />
        <Route path="booking/checkout" element={<Checkout />} />
        <Route path="booking/success" element={<PaymentSuccess />} />
        <Route path="booking/cancel" element={<PaymentCancel />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/:ticketId" element={<TicketDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Organization */}
      <Route path="org" element={<OrganizerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrgDashboard />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="events/create" element={<EventCreate />} />
        <Route path="venues" element={<VenueTemplates />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="validate" element={<QRValidation />} />
        <Route path="settings" element={<OrgSettings />} />
        <Route path="notifications" element={<OrgNotifications />} />
      </Route>

      {/* Admin */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="organizations" element={<OrganizationApproval />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
