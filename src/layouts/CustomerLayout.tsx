import { NavLink, Outlet } from 'react-router-dom'

export default function CustomerLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
        <NavLink to="/" className="navbar-brand fw-bold" style={{ color: '#e94560' }}>
          TicketSouq
        </NavLink>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Events
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Tickets
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/org" className="nav-link btn btn-outline-light btn-sm px-3">
              Switch to Organizer
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="flex-grow-1 d-flex flex-column">
        <Outlet />
      </main>
    </div>
  )
}
