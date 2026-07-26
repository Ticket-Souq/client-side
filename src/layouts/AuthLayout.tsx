import { Outlet, Link } from 'react-router-dom';
import '../features/auth/styles/auth.css';

function AuthHeader() {
  return (
    <header className="auth-header-bar">
      <div className="wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 36px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="auth-logo">
          <span className="dot" />
          <span className="auth-logo-text">TICKET SOUQ</span>
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
