import { NavLink, Outlet } from 'react-router-dom'

export default function CustomerLayout() {

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-light bg-white nav-bar-shadow px-4">
        <NavLink to="/" className="navbar-brand fw-bold" style={{ color: '#E2A30F' }}>
          TicketSouq
        </NavLink>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <NavLink to="/events" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Events
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Tickets
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/org" className="nav-link btn btn-outline-accent btn-sm px-3">
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
