import React from 'react'
import type { ModalProps } from '../../types'
import styles from './Modal.module.css'

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions }) => {
  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>{title}</h2>
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  )
}