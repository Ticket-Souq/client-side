import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { HeaderProps } from '../../types'
import { Avatar } from '../../display/Avatar/Avatar'
import { NotificationService } from '../../../../features/notifications/services/notificationService'
import { useNotifications } from '../../../../features/notifications/hooks/useNotifications'
import { useActiveReservation } from '../../../hooks/useActiveReservation'
import { clearTokens, getUserRoles, hasUserRole, isAuthenticated } from '../../../auth'
import { BRAND_NAME } from '../../../constants'
import { useUserProfile } from '../../../hooks/useUserProfileContext'
import { useConfirm } from '../../../hooks/useConfirm'
import { AuthService } from '../../../../features/auth/services/auth.service'
import { EventApi } from '../../../../features/events/services/eventApi'
import { API } from '../../../api'
import type { EventCardResponse } from '../../../../features/events/types/event.types'
import styles from './Header.module.css'
import notifStyles from '../../../../features/notifications/notifications.module.css'
import { TicketIcon } from './TicketIcon'

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

const PUBLIC_LINKS: { label: string; href: string }[] = [
]

const ROLE_LINKS: Record<string, { label: string; href: string }[]> = {
  CUSTOMER: [
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EventCardResponse[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchDone, setSearchDone] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const { confirm, dialog } = useConfirm()
  const { notifications, loading, markRead, markAllRead } = useNotifications()
  const hasActiveReservation = useActiveReservation()

  useEffect(() => {
    NotificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  const refreshCount = useCallback(() => {
    NotificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchOpen(false); setSearchLoading(false); setSearchDone(false); return }
    clearTimeout(debounceRef.current)
    setSearchLoading(true)
    setSearchOpen(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await EventApi.search({ title: searchQuery.trim(), size: 8 })
        setSearchResults(res.content)
      } catch { setSearchResults([]) }
      setSearchLoading(false)
      setSearchDone(true)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  useEffect(() => {
    if (!notifOpen && !profileOpen && !searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen, profileOpen, searchOpen])

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
    if (!(await confirm('Are you sure you want to deactivate your account? This action requires contacting support to reactivate.', { confirmLabel: 'Deactivate', danger: true }))) return
    setDeactivateLoading(true)
    try {
      await AuthService.deactivateAccount()
      clearTokens()
      navigate('/auth/login')
    } catch { /* ignore */ }
    setDeactivateLoading(false)
  }, [navigate, confirm])

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
        {(!authed || primaryRole === 'CUSTOMER') && (
        <div className={styles.searchWrap} ref={searchRef}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search events…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setSearchOpen(true) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchOpen && searchResults.length > 0) {
                  navigate(`/events/${searchResults[0].id}`)
                } else if (searchQuery.trim()) {
                  const params = new URLSearchParams()
                  params.set('q', searchQuery.trim())
                  navigate(`/?${params.toString()}`)
                }
                setSearchQuery('')
                setSearchOpen(false)
              }
            }}
          />
          {searchOpen && searchResults.length > 0 && (
            <div className={styles.searchDropdown}>
              {searchResults.map((ev) => (
                <div key={ev.id} className={styles.searchItem} onClick={() => { navigate(`/events/${ev.id}`); setSearchQuery(''); setSearchOpen(false) }}>
                  <img
                    src={ev.posterUrl ? `${API.base}${ev.posterUrl}` : ''}
                    alt=""
                    className={styles.searchThumb}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className={styles.searchInfo}>
                    <span className={styles.searchTitle}>{ev.title}</span>
                    <span className={styles.searchMeta}>{ev.categoryName || ev.category || ''}{ev.location ? ` · ${ev.location}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchOpen && searchLoading && (
            <div className={styles.searchDropdown}>
              <div className={styles.searchLoading}>Searching…</div>
            </div>
          )}
          {searchOpen && searchDone && !searchLoading && searchResults.length === 0 && (
            <div className={styles.searchDropdown}>
              <div className={styles.searchEmpty}>No events found</div>
            </div>
          )}
        </div>
        )}
        <div className={styles.actions}>
          {primaryRole === 'CUSTOMER' && (
            <>
                <Link
                  to="/customer/tickets"
                  className={styles.myTickets}
                  aria-label="My Tickets"
                  title="My Tickets"
                >
                  <TicketIcon width={39} height={39} />
                </Link>
                <Link
                to="/customer/reservations"
                className={`${styles.reservationsLink}${hasActiveReservation ? ` ${styles.activeReservation}` : ''}`}
                aria-label="My Reservations"
                title="My Reservations"
              >
                <svg width="49" height="49" viewBox="-5.0 -18.0 110.0 135.0" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="m51.938 82.961h-44.039c-2.4141 0-4.3711-1.9766-4.3711-4.3906v-48.906h81.152v22.812c0 0.96875 0.79297 1.7617 1.7617 1.7617s1.7617-0.79297 1.7617-1.7617l0.003906-36.281c0-4.3711-3.543-7.918-7.918-7.918h-7.4219v-2.4844c0-3.1562-2.5742-5.7305-5.7305-5.7305s-5.7305 2.5742-5.7305 5.7305v2.4844h-34.309v-2.4844c0-3.1562-2.5742-5.7305-5.7305-5.7305s-5.7305 2.5742-5.7305 5.7305v2.4844h-7.7383c-4.3555 0-7.8984 3.543-7.8984 7.918v11.652 0.035156 0.035157 50.633c0 4.3711 3.543 7.918 7.8984 7.918h44.039c0.96875 0 1.7617-0.79297 1.7617-1.7617s-0.79297-1.7617-1.7617-1.7617zm12.996-77.168c0-1.2148 0.98828-2.2031 2.2031-2.2031 1.2148 0 2.2031 0.98828 2.2031 2.2031v8.9727c0 0.58203-0.23047 1.1445-0.65234 1.5508-0.42188 0.42188-0.96875 0.65234-1.5508 0.65234-1.2148 0-2.2031-0.98828-2.2031-2.2031zm-45.77 0c0-1.2148 0.98828-2.2031 2.2031-2.2031 1.2148 0 2.2031 0.98828 2.2031 2.2031v8.9727c0 0.58203-0.23047 1.1445-0.65234 1.5508-0.42188 0.42188-0.96875 0.65234-1.5508 0.65234-1.2148 0-2.2031-0.98828-2.2031-2.2031zm-11.266 6.0117h7.7383v2.9609c0 3.1562 2.5742 5.7305 5.7305 5.7305 1.5352 0 2.9609-0.59766 4.0547-1.6758 1.0938-1.0742 1.6758-2.5195 1.6758-4.0547v-2.9609h34.309v2.9609c0 3.1562 2.5742 5.7305 5.7305 5.7305 1.5352 0 2.9609-0.59766 4.0547-1.6758 1.0938-1.0742 1.6758-2.5195 1.6758-4.0547v-2.9609h7.4219c2.4141 0 4.3906 1.9766 4.3906 4.3906v9.9453l-81.152-0.003906v-9.9453c0-2.4141 1.957-4.3906 4.3711-4.3906z" />
                  <path d="m22.391 54.594c0-2.1523-1.7461-3.8945-3.8945-3.8945h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945zm-3.5273 4.25c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m18.496 66.281h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945v-4.25c0-2.1523-1.7461-3.8945-3.8945-3.8945zm0.37109 8.1445c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m41.008 39.027c0-2.1523-1.7461-3.8945-3.8945-3.8945h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945zm-3.5273 4.25c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m41.008 54.594c0-2.1523-1.7461-3.8945-3.8945-3.8945h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945zm-3.5273 4.25c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m37.113 66.281h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945v-4.25c0-2.1523-1.7461-3.8945-3.8945-3.8945zm0.37109 8.1445c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m49.77 35.129c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945v-4.25c0-2.1523-1.7461-3.8945-3.8945-3.8945zm6.3477 3.8945v4.25c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m59.645 58.859v-4.25c0-2.1523-1.7461-3.8945-3.8945-3.8945h-5.9766c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945zm-3.5273 0c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m68.387 35.129c-2.1523 0-3.8945 1.7461-3.8945 3.8945v4.25c0 2.1523 1.7461 3.8945 3.8945 3.8945h5.9766c2.1523 0 3.8945-1.7461 3.8945-3.8945v-4.25c0-2.1523-1.7461-3.8945-3.8945-3.8945zm6.3477 3.8945v4.25c0 0.19531-0.16016 0.37109-0.37109 0.37109h-5.9766c-0.19531 0-0.37109-0.16016-0.37109-0.37109v-4.25c0-0.19531 0.16016-0.37109 0.37109-0.37109h5.9766c0.19531 0 0.37109 0.16016 0.37109 0.37109z" />
                  <path d="m77.875 55.703c-12.199 0-22.109 9.9258-22.109 22.109s9.9258 22.109 22.109 22.109 22.109-9.9258 22.109-22.109-9.9258-22.109-22.109-22.109zm0 40.707c-10.242 0-18.582-8.3398-18.582-18.582s8.3398-18.582 18.582-18.582 18.582 8.3398 18.582 18.582-8.3398 18.582-18.582 18.582z" />
                  <path d="m87.887 76.066h-8.2344v-9.7305c0-0.96875-0.79297-1.7617-1.7617-1.7617s-1.7617 0.79297-1.7617 1.7617v11.496c0 0.96875 0.79297 1.7617 1.7617 1.7617h9.9961c0.96875 0 1.7617-0.79297 1.7617-1.7617s-0.79297-1.7617-1.7617-1.7617z" />
                </svg>
              </Link>
            </>
          )}
          {authed ? (
            <>
              {/* Notifications bell */}
              <div className={styles.bellWrapper} ref={notifRef}>
                <button
                  className={styles.bellBtn}
                  onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false) }}
                  aria-label="Notifications"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      {dialog}
    </header>
  )
}
