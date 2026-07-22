import React from 'react'
import type { HeaderProps } from '../../types'
import { Avatar } from '../../display/Avatar/Avatar'
import styles from './Header.module.css'

export const Header: React.FC<HeaderProps> = ({ links, avatarInitials = 'AN' }) => {
  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <a href="/" className={styles.logo}>
          <span className={styles.dot}></span>TICKET SOUQ
        </a>
        <nav className={styles.links}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.active ? styles.active : ''}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <a href="notifications.html" className="btn btn-ghost">Notifications</a>
          <a href="settings.html" className="btn btn-ghost">Settings</a>
          <a href="profile.html"><Avatar initials={avatarInitials} size="sm" /></a>
        </div>
      </div>
    </header>
  )
}