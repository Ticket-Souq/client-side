import React from 'react'
import type { QRCodeProps } from '../../types'
import styles from './QRCode.module.css'

export const QRCode: React.FC<QRCodeProps> = ({ code }) => {
  return (
    <div className={styles.qr} title={code} />
  )
}