import { NavLink, Outlet } from 'react-router-dom'

export default function OrganizerLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-light bg-white nav-bar-shadow px-4">
        <NavLink to="/org" className="navbar-brand fw-bold" style={{ color: '#E2A30F' }}>
          TicketSouq
        </NavLink>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <NavLink to="/org/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/org/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Events
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/org/venues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Venues
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/org/validate" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Validate
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className="nav-link btn btn-outline-accent btn-sm px-3">
              Switch to Customer
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
