import React from 'react'
import type { ToggleProps } from '../../types'
import styles from './Toggle.module.css'

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className={`${styles.toggle}${checked ? ' ' + styles.active : ''}`}>
      <div className={styles.track} onClick={() => onChange(!checked)} />
      {label && <span>{label}</span>}
    </label>
  )
}