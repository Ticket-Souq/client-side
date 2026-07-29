import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { HeaderProps } from '../../types'
import { Avatar } from '../../display/Avatar/Avatar'
import { NotificationService } from '../../../../features/notifications/services/notificationService'
import { useNotifications } from '../../../../features/notifications/hooks/useNotifications'
import { clearTokens, getUserRoles, hasUserRole, isAuthenticated } from '../../../auth'
import { BRAND_NAME } from '../../../constants'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { AuthService } from '../../../../features/auth/services/auth.service'
import styles from './Header.module.css'
import notifStyles from '../../../../features/notifications/notifications.module.css'

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    const local = email.split('@')[0];
    if (!local) return '?';
    const p = local.split(/[._-]/);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return local.slice(0, 2).toUpperCase();
  }
  return '?';
}

function normaliseRole(raw: string): string {
  return raw.replace(/^ROLE_/, "").toUpperCase();
}

function roleDisplay(raw: string): string {
  return normaliseRole(raw).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const PUBLIC_LINKS = [
  { label: 'Events', href: '/customer/events' },
]

const ROLE_LINKS: Record<string, { label: string; href: string }[]> = {
  CUSTOMER: [
    { label: 'Events', href: '/customer/events' },
    { label: 'My Tickets', href: '/customer/tickets' },
  ],
  ADMIN: [
    { label: 'Organizations', href: '/admin/organizations' },
    { label: 'Monitoring', href: '/admin/monitoring' },
    { label: 'Audit Logs', href: '/admin/logs' },
  ],
  ORG_HEAD: [
    { label: 'Events', href: '/org/events' },
    { label: 'Venues', href: '/org/venues' },
    { label: 'Team', href: '/org/team' },
    { label: 'Analytics', href: '/org/analytics' },
  ],
  ORG_AGENT: [
    { label: 'Events', href: '/org/events' },
    { label: 'QR Validate', href: '/org/validate' },
  ],
  ORG_CONSUMER: [
    { label: 'QR Validate', href: '/org/validate' },
  ],
}

export const Header: React.FC<HeaderProps> = ({ links }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const authed = isAuthenticated()
  const { profile } = useUserProfile()
  const email = profile?.email ?? ''
  const name = profile?.name ?? ''
  const initials = getInitials(name, email)
  const roles = getUserRoles()
  const primaryRole = roles.length > 0 ? normaliseRole(roles[0]) : 'CUSTOMER'
  const navLinks = links.length > 0 ? links : (authed ? (ROLE_LINKS[primaryRole] || ROLE_LINKS.CUSTOMER) : PUBLIC_LINKS)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const { notifications, loading, markRead, markAllRead } = useNotifications()

  useEffect(() => {
    NotificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  const refreshCount = useCallback(() => {
    NotificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  useEffect(() => {
    if (!notifOpen && !profileOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen, profileOpen])

  const handleMarkRead = useCallback((id: string) => {
    markRead(id)
    setTimeout(refreshCount, 300)
  }, [markRead, refreshCount])

  const handleMarkAllRead = useCallback(() => {
    markAllRead()
    setTimeout(refreshCount, 300)
  }, [markAllRead, refreshCount])

  const handleLogout = useCallback(async () => {
    try { await AuthService.logout() } catch { /* ignore */ }
    clearTokens()
    navigate('/auth/login')
  }, [navigate])

  const handleDeactivate = useCallback(async () => {
    if (!confirm('Are you sure you want to deactivate your account? This action requires contacting support to reactivate.')) return
    setDeactivateLoading(true)
    try {
      await AuthService.deactivateAccount()
      clearTokens()
      navigate('/auth/login')
    } catch { /* ignore */ }
    setDeactivateLoading(false)
  }, [navigate])

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <img src="/Logo.png" alt="" style={{ height: 28, width: 'auto' }} />
          {BRAND_NAME.toUpperCase()}
        </Link>
        <nav className={styles.links}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={location.pathname === link.href ? styles.active : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          {authed ? (
            <>
              {/* Notifications bell */}
              <div className={styles.bellWrapper} ref={notifRef}>
                <button
                  className={styles.bellBtn}
                  onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false) }}
                  aria-label="Notifications"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && <span className={notifStyles.badge}>{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>Notifications</span>
                      {unreadCount > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className={styles.dropdownList}>
                      {loading && <div className={styles.dropdownEmpty}>Loading...</div>}
                      {!loading && notifications.length === 0 && (
                        <div className={styles.dropdownEmpty}>No notifications</div>
                      )}
                      {!loading && notifications.map((n) => (
                        <div key={n.id} className={styles.dropdownItem}>
                          <span className={`${notifStyles.dot} ${n.read ? notifStyles.dotRead : notifStyles.dotUnread}`} />
                          <div className={styles.dropdownContent}>
                            <p className={styles.dropdownItemTitle}>{n.title}</p>
                            <p className={styles.dropdownItemPreview}>{n.preview}</p>
                            <span className={styles.dropdownItemTime}>{n.timeAgo}</span>
                          </div>
                          {!n.read && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(n.id)}>
                              Read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className={styles.profileWrapper} ref={profileRef}>
                <button
                  className={styles.profileBtn}
                  onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false) }}
                  aria-label="Profile"
                >
                  <Avatar initials={initials} size="sm" />
                </button>
                {profileOpen && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownHeader}>
                      <Avatar initials={initials} size="md" />
                      <div className={styles.profileDropdownInfo}>
                        <span className={styles.profileDropdownName}>{name || email.split('@')[0]}</span>
                        <span className={styles.profileDropdownEmail}>{email}</span>
                        {roles.length > 0 && (
                          <div className={styles.profileDropdownRoles}>
                            {roles.map(r => (
                              <span key={r} className={styles.profileDropdownRole}>{roleDisplay(r)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.profileDropdownActions}>
                      <a href="/auth/change-password" className={styles.profileDropdownItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Change password
                      </a>
                      <button className={styles.profileDropdownItem} onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                      </button>
                      {!hasUserRole('ORG_AGENT') && !hasUserRole('ORG_CONSUMER') && (
                        <button
                          className={`${styles.profileDropdownItem} ${styles.profileDropdownDanger}`}
                          onClick={handleDeactivate}
                          disabled={deactivateLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          {deactivateLoading ? 'Deactivating...' : 'Deactivate account'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth/login')}
              className="btn btn-primary btn-sm fw-semibold px-3 border-0"
              style={{ fontSize: '13px', background: '#ffc629', color: '#15150f', borderRadius: '999px', height: '36px', cursor: 'pointer' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
