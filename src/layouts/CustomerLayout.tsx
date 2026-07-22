import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../shared/auth'
import SideDrawer from '../features/home/components/SideDrawer'

export default function CustomerLayout() {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isAuth = !!getAccessToken();


  return (
    <div className="min-vh-100 d-flex flex-column">
      {isAuth && <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      <nav className="navbar navbar-expand navbar-light bg-white nav-bar-shadow px-4">
        {isAuth ? (
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn p-0 border-0 me-3"
            style={{ fontSize: '22px', lineHeight: 1, color: 'var(--color-text)' }}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        ) : (
          <div className="me-3" style={{ width: '22px' }} />
        )}
        <Link to="/" className="navbar-brand fw-bold" style={{ color: '#E2A30F' }}>
          TicketSouq
        </Link>
        {!isAuth && (
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <button
                onClick={() => navigate('/auth/login')}
                className="btn btn-accent btn-sm fw-semibold px-3 border-0"
                style={{ fontSize: '13px' }}
              >
                Sign In
              </button>
            </li>
          </ul>
        )}
      </nav>
      <main className="flex-grow-1 d-flex flex-column">
        <Outlet />
      </main>
    </div>
  )
}
