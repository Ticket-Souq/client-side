import React from 'react'
import type { FooterProps } from '../../types'
import styles from './Footer.module.css'

export const Footer: React.FC<FooterProps> = ({ columns, tagline }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.logo}><span className={styles.dot}></span>TICKET SOUQ</div>
        <div className={styles.cols}>
          {columns.map((col, i) => (
            <div className={styles.col} key={i}>
              <h4>{col.title}</h4>
              {col.links.map((link, j) => (
                <a key={j} href={link.href}>{link.label}</a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; 2026 Ticket Souq</span>
        <span>{tagline || 'Made for events across Egypt'}</span>
      </div>
    </footer>
  )
}