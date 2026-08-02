import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { ToastContainer } from './shared/components/display/Toast/Toast'

import CustomerLayout from './layouts/CustomerLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import OrgRootRedirect from './features/organizations/pages/OrgRootRedirect'

import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import EmailVerification from './features/auth/pages/EmailVerification'
import ChangePassword from './features/auth/pages/ChangePassword'

import CustomerEventDetail from './features/events/pages/CustomerEventDetail'
import EventReserve from './features/events/pages/EventReserve'
import Checkout from './features/booking/pages/Checkout'
import PaymentSuccess from './features/booking/pages/PaymentSuccess'
import PaymentCancel from './features/booking/pages/PaymentCancel'

const MyTickets = lazy(() => import('./features/tickets/pages/MyTickets'))
const TicketDetail = lazy(() => import('./features/tickets/pages/TicketDetail'))
const MyReservations = lazy(() => import('./features/tickets/pages/MyReservations'))

import EventManagement from './features/organizations/pages/EventManagement'
import EventCreate from './features/organizations/pages/EventCreate'
import VenueTemplates from './features/organizations/pages/VenueTemplates'
import VenueManagement from './features/organizations/pages/VenueManagement'
import TeamManagement from './features/organizations/pages/TeamManagement'
import Analytics from './features/organizations/pages/Analytics'
import QRValidation from './features/organizations/pages/QRValidation'
import Logs from './features/admin/pages/Logs'
import OrganizationsManagement from './features/admin/pages/OrganizationsManagement'
import SystemMonitoring from './features/admin/pages/SystemMonitoring'

function App() {
    return (
        <>
        <Routes>
            {/* Landing (public, root) */}
            <Route path="/" element={<OrgRootRedirect/>}/>

            {/* Auth */}
            <Route path="auth" element={<AuthLayout/>}>
                <Route index element={<Navigate to="login" replace/>}/>
                <Route path="login" element={<Login/>}/>
                <Route path="register" element={<Register/>}/>
                <Route path="forgot-password" element={<ForgotPassword/>}/>
                <Route path="reset-password" element={<ResetPassword/>}/>
                <Route path="verify-email" element={<EmailVerification/>}/>
                <Route path="change-password" element={<ChangePassword/>}/>
            </Route>

            {/* Customer */}
            <Route path="customer" element={<CustomerLayout/>}>
                <Route index element={<Navigate to="events" replace/>}/>
                <Route path="events" element={<Navigate to="/" replace/>}/>
                <Route path="booking/checkout" element={<Checkout/>}/>
                <Route path="booking/success" element={<PaymentSuccess/>}/>
                <Route path="booking/cancel" element={<PaymentCancel/>}/>
                <Route path="reservations" element={<MyReservations/>}/>
                <Route path="tickets" element={<MyTickets/>}/>
                <Route path="tickets/:ticketId" element={<TicketDetail/>}/>
            </Route>

            {/* Public event detail & reservation */}
            <Route path="events">
                <Route index element={<Navigate to="/" replace/>}/>
                <Route path=":eventId" element={<CustomerEventDetail/>}/>
                <Route path=":eventId/reserve" element={<EventReserve/>}/>
            </Route>

            {/* Organization */}
            <Route path="org" element={<OrganizerLayout/>}>
                <Route index element={<Navigate to="events" replace/>}/>
                <Route path="events" element={<EventManagement/>}/>
                <Route path="events/create" element={<EventCreate/>}/>
                <Route path="venues" element={<VenueManagement/>}/>
                <Route path="venue-templates" element={<VenueTemplates/>}/>
                <Route path="team" element={<TeamManagement/>}/>
                <Route path="analytics" element={<Analytics/>}/>
                <Route path="validate" element={<QRValidation/>}/>
            </Route>

            {/* Admin */}
            <Route path="admin" element={<AdminLayout/>}>
                <Route index element={<Navigate to="organizations" replace/>}/>
                <Route path="monitoring" element={<SystemMonitoring/>}/>
                <Route path="logs" element={<Logs/>}/>
                <Route path="organizations" element={<OrganizationsManagement/>}/>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
        <ToastContainer />
    </>
    )
}

export default App
