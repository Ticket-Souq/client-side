import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { HeaderProps } from '../../types'
import { Avatar } from '../../display/Avatar/Avatar'
import { NotificationService } from '../../../../features/notifications/services/notificationService'
import styles from './Header.module.css'
import badgeStyles from '../../../../features/notifications/notifications.module.css'

const ROLE_LINKS: Record<string, { label: string; href: string }[]> = {
  customer: [
    { label: 'Events', href: '/customer/events' },
    { label: 'Tickets', href: '/customer/tickets' },
    { label: 'Dashboard', href: '/customer' },
    { label: 'Profile', href: '/customer/profile' },
  ],
  organizer: [
    { label: 'Events', href: '/org/events' },
    { label: 'Venues', href: '/org/venues' },
    { label: 'Organization', href: '/org/team' },
    { label: 'Dashboard', href: '/org/dashboard' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Organizations', href: '/admin/organizations' },
    { label: 'Audit Logs', href: '/admin/logs' },
    { label: 'Users', href: '/admin/users' },
  ],
}

const NOTIFICATIONS_PATH: Record<string, string> = {
  customer: '/customer/notifications',
  organizer: '/org/notifications',
  admin: '/admin/notifications',
}

const SETTINGS_PATH: Record<string, string> = {
  customer: '/customer/settings',
  organizer: '/org/settings',
  admin: '/admin/settings',
}

export const Header: React.FC<HeaderProps> = ({ role, links, avatarInitials = 'AN' }) => {
  const location = useLocation()
  const navLinks = links.length > 0 ? links : (ROLE_LINKS[role] || ROLE_LINKS.customer)
  const notificationsPath = NOTIFICATIONS_PATH[role] || '/customer/notifications'
  const settingsPath = SETTINGS_PATH[role] || '/customer/settings'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    NotificationService.getUnreadCount(role).then(setUnreadCount).catch(() => {})
  }, [role])

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.dot} />
          TICKET SOUQ
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
          <Link to={notificationsPath} className="btn btn-ghost" style={{ position: 'relative' }}>
            Notifications
            {unreadCount > 0 && <span className={badgeStyles.badge}>{unreadCount}</span>}
          </Link>
          <Link to={settingsPath} className="btn btn-ghost">Settings</Link>
          <Link to="/customer/profile"><Avatar initials={avatarInitials} size="sm" /></Link>
        </div>
      </div>
    </header>
  )
}
