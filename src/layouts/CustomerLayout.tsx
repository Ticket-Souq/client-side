import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../shared/auth'
import SideDrawer from '../features/home/components/SideDrawer'
import { LayoutShell } from '../shared/components/layout/LayoutShell'
import type { NavLink } from '../shared/components/types'

const NAV_LINKS: NavLink[] = [
  { label: 'Events', href: '/customer/events' },
  { label: 'Tickets', href: '/customer/tickets' },
  { label: 'Dashboard', href: '/customer' },
]

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const isAuth = !!getAccessToken()

  return (
    <>
      {isAuth && (
        <>
          <div className="d-lg-none">
            <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </div>
          <div className="d-lg-none position-fixed" style={{ top: 22, left: 16, zIndex: 60 }}>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn p-0 border-0"
              style={{ fontSize: '22px', lineHeight: 1, color: 'var(--ink, #15150f)' }}
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </svg>
            </button>
          </div>
        </>
      )}
      {!isAuth && (
        <div className="d-lg-none position-fixed" style={{ top: 22, right: 16, zIndex: 60 }}>
          <button
            onClick={() => navigate('/auth/login')}
            className="btn btn-primary btn-sm fw-semibold px-3 border-0"
            style={{ fontSize: '13px', background: '#ffc629', color: '#15150f', borderRadius: '999px', height: '36px' }}
          >
            Sign In
          </button>
        </div>
      )}
      <LayoutShell role="customer" navLinks={isAuth ? NAV_LINKS : []}>
        <Outlet />
      </LayoutShell>
    </>
  )
}
