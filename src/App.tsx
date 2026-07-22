import { Routes, Route, Navigate } from 'react-router-dom'

import CustomerLayout from './layouts/CustomerLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import EmailVerification from './features/auth/pages/EmailVerification'
import ChangePassword from './features/auth/pages/ChangePassword'

import Home from './features/home/pages/Home'
import CustomerEvents from './features/events/pages/CustomerEvents'
import CustomerEventDetail from './features/events/pages/CustomerEventDetail'
import ZonePurchase from './features/events/pages/ZonePurchase'
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
import AdminEvents from './features/admin/pages/AdminEvents'
import Logs from './features/admin/pages/Logs'
import OrganizationsManagement from './features/admin/pages/OrganizationsManagement'
import OrganizationApproval from './features/admin/pages/OrganizationApproval'
import UserManagement from './features/admin/pages/UserManagement'

import Profile from './features/profile/pages/Profile'
import Notifications from './features/notifications/pages/Notifications'
import Reservations from './features/reservations/pages/Reservations'

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<EmailVerification />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Customer */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<CustomerEvents />} />
        <Route path="events/:eventId" element={<CustomerEventDetail />} />
        <Route path="events/:eventId/zone-purchase" element={<ZonePurchase />} />
        <Route path="events/:eventId/select" element={<EventSelect />} />
        <Route path="booking/checkout" element={<Checkout />} />
        <Route path="booking/success" element={<PaymentSuccess />} />
        <Route path="booking/cancel" element={<PaymentCancel />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/:ticketId" element={<TicketDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reservations" element={<Reservations />} />
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
        <Route path="events" element={<AdminEvents />} />
        <Route path="logs" element={<Logs />} />
        <Route path="organizations" element={<OrganizationsManagement />} />
        <Route path="approvals" element={<OrganizationApproval />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
