import React from 'react'
import type { FooterProps } from '../../types'
import { BRAND_NAME } from '../../../constants'
import styles from './Footer.module.css'

export const Footer: React.FC<FooterProps> = ({ tagline }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.logo}><img src="/Logo.png" alt="" style={{ height: 28, width: 'auto' }} />{BRAND_NAME.toUpperCase()}</div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; 2026 {BRAND_NAME}</span>
        <span>{tagline || 'Made for events across Egypt'}</span>
      </div>
    </footer>
  )
}