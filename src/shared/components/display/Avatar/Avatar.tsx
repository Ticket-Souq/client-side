import React from 'react'
import type { AvatarProps } from '../../types'
import styles from './Avatar.module.css'

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 'sm' }) => {
  return (
    <div className={`${styles.avatar} ${size === 'sm' ? styles.sm : styles.md}`}>
      {initials}
    </div>
  )
}