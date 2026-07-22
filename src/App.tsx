import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import CustomerLayout from './layouts/CustomerLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import Landing from './features/home/pages/Landing'

import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import EmailVerification from './features/auth/pages/EmailVerification'
import ChangePassword from './features/auth/pages/ChangePassword'

import CustomerDashboard from './features/home/pages/Dashboard'
import CustomerEvents from './features/events/pages/CustomerEvents'
import CustomerEventDetail from './features/events/pages/CustomerEventDetail'
import ZonePurchase from './features/events/pages/ZonePurchase'
import EventSelect from './features/events/pages/EventSelect'
import Outlets from './features/events/pages/Outlets'
import Contact from './features/events/pages/Contact'

import Checkout from './features/booking/pages/Checkout'
import PaymentSuccess from './features/booking/pages/PaymentSuccess'
import PaymentCancel from './features/booking/pages/PaymentCancel'

const MyTickets = lazy(() => import('./features/tickets/pages/MyTickets'))
const TicketDetail = lazy(() => import('./features/tickets/pages/TicketDetail'))

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
import VenueOversight from './features/admin/pages/VenueOversight'
import AdminRefunds from './features/admin/pages/AdminRefunds'
import Logs from './features/admin/pages/Logs'
import OrganizationsManagement from './features/admin/pages/OrganizationsManagement'
import OrganizationApproval from './features/admin/pages/OrganizationApproval'
import UserManagement from './features/admin/pages/UserManagement'
import SystemMonitoring from './features/admin/pages/SystemMonitoring'
import Profile from './features/profile/pages/Profile'
import Settings from './features/profile/pages/Settings'
import Notifications from './features/notifications/pages/Notifications'
import Reservations from './features/reservations/pages/Reservations'

import Unauthorized401 from './features/errors/pages/Unauthorized401'
import Forbidden403 from './features/errors/pages/Forbidden403'
import NotFound404 from './features/errors/pages/NotFound404'
import ServerError500 from './features/errors/pages/ServerError500'

function App() {
  return (
    <Routes>
      {/* Landing (public, root) */}
      <Route path="/" element={<Landing />} />

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

      {/* Error pages */}
      <Route path="401" element={<AuthLayout />}>
        <Route index element={<Unauthorized401 />} />
      </Route>
      <Route path="403" element={<AuthLayout />}>
        <Route index element={<Forbidden403 />} />
      </Route>
      <Route path="404" element={<AuthLayout />}>
        <Route index element={<NotFound404 />} />
      </Route>
      <Route path="500" element={<AuthLayout />}>
        <Route index element={<ServerError500 />} />
      </Route>

      {/* Customer */}
      <Route path="customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="events" element={<CustomerEvents />} />
        <Route path="events/:eventId" element={<CustomerEventDetail />} />
        <Route path="events/:eventId/zone-purchase" element={<ZonePurchase />} />
        <Route path="events/:eventId/select" element={<EventSelect />} />
        <Route path="outlets" element={<Outlets />} />
        <Route path="contact" element={<Contact />} />
        <Route path="settings" element={<Settings />} />
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
        <Route path="venues" element={<VenueOversight />} />
        <Route path="monitoring" element={<SystemMonitoring />} />
        <Route path="logs" element={<Logs />} />
        <Route path="organizations" element={<OrganizationsManagement />} />
        <Route path="approvals" element={<OrganizationApproval />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="refunds" element={<AdminRefunds />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
