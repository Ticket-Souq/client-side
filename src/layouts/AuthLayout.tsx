import { Outlet, Link } from 'react-router-dom';
import { BRAND_NAME } from '../shared/constants';
import '../features/auth/styles/auth.css';

function AuthHeader() {
  return (
    <header className="auth-header-bar">
      <div className="wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 36px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="auth-logo">
          <img src="/Logo.png" alt="" style={{ height: 28, width: 'auto' }} />
          <span className="auth-logo-text">{BRAND_NAME.toUpperCase()}</span>
        </Link>
      </div>
    </header>
  );
}

function AuthFooter() {
  return (
    <footer className="auth-site-footer">
      <div className="auth-foot-grid">
        <Link to="/" className="auth-logo" style={{ alignSelf: 'flex-start' }}>
          <img src="/Logo.png" alt="" style={{ height: 28, width: 'auto' }} />
          <span className="auth-logo-text">{BRAND_NAME.toUpperCase()}</span>
        </Link>
      </div>
      <div className="auth-foot-bottom">
        <span>&copy; 2026 {BRAND_NAME}</span>
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
