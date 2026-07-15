import { NavLink, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-dark bg-hero-brown bg-noise px-4">
        <NavLink to="/" className="navbar-brand fw-bold" style={{ color: '#E2A30F' }}>
          TicketSouq
        </NavLink>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <NavLink to="/auth/login" className="nav-link">Login</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/auth/register" className="nav-link">Register</NavLink>
          </li>
        </ul>
      </nav>
      <main className="flex-grow-1 d-flex flex-column">
        <Outlet />
      </main>
    </div>
  )
}
