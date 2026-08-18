import { Link } from 'react-router-dom'

interface ErrorPageProps {
  code?: string
  title?: string
  message?: string
  actionLabel?: string
  actionTo?: string
}

export function ErrorPage({
  code = '404',
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist.",
  actionLabel = 'Go Home',
  actionTo = '/',
}: ErrorPageProps) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '72px', color: 'var(--ink)', margin: '0 0 8px' }}>{code}</h1>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{title}</p>
      <p style={{ fontSize: '15px', color: 'var(--ink-soft)', margin: '16px 0 32px' }}>{message}</p>
      <Link
        to={actionTo}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '50px', padding: '0 32px', borderRadius: '999px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--yellow)', color: 'var(--ink-black)', textDecoration: 'none' }}
      >
        {actionLabel}
      </Link>
    </div>
  )
}
