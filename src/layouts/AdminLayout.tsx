import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
        <NavLink to="/admin" className="navbar-brand fw-bold" style={{ color: '#e94560' }}>
          TicketSouq — Admin
        </NavLink>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/organizations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Organizations
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Users
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className="nav-link btn btn-outline-light btn-sm px-3">
              Back to App
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
