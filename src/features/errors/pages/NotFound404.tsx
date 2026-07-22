import { Link } from 'react-router-dom'

export default function NotFound404() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '72px', color: '#15150f', margin: '0 0 8px' }}>404</h1>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#726f63' }}>Page Not Found</p>
      <p style={{ fontSize: '15px', color: '#3c3b34', margin: '16px 0 32px' }}>The page you're looking for doesn't exist.</p>
      <Link to="/landing" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '50px', padding: '0 32px', borderRadius: '999px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', border: 'none', background: '#ffc629', color: '#15150f', textDecoration: 'none' }}>
        Go Home
      </Link>
    </div>
  )
}
