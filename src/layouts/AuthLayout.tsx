import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../shared/auth';
import SideDrawer from '../features/home/components/SideDrawer';
import '../features/auth/styles/auth.css';

function AuthHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAuth = !!getAccessToken();
  const navigate = useNavigate();

  return (
    <>
      {isAuth && <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      <header className="auth-header-bar">
        <div className="wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 36px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="auth-logo">
            <span className="dot" />
            <span className="auth-logo-text">TICKET SOUQ</span>
          </Link>
          <div className="nav-actions">
            {isAuth ? (
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
            ) : (
              <button
                className="auth-btn-ghost"
                onClick={() => navigate('/')}
              >
                Back to site
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function AuthFooter() {
  return (
    <footer className="auth-site-footer">
      <div className="auth-foot-grid">
        <Link to="/" className="auth-logo" style={{ alignSelf: 'flex-start' }}>
          <span className="dot" />
          <span className="auth-logo-text">TICKET SOUQ</span>
        </Link>
        <div className="auth-foot-cols">
          <div className="auth-foot-col">
            <h4>Discover</h4>
            <Link to="/customer/events">Events</Link>
            <a href="#">Outlets</a>
            <a href="#">Categories</a>
          </div>
          <div className="auth-foot-col">
            <h4>Support</h4>
            <a href="#">Contact us</a>
            <a href="#">Refunds</a>
            <a href="#">FAQ</a>
          </div>
          <div className="auth-foot-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Terms &amp; privacy</a>
          </div>
        </div>
      </div>
      <div className="auth-foot-bottom">
        <span>&copy; 2026 Ticket Souq</span>
        <span>Made for events across Egypt</span>
      </div>
    </footer>
  );
}

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <AuthHeader />
      <main>
        <Outlet />
      </main>
      <AuthFooter />
    </div>
  );
}
