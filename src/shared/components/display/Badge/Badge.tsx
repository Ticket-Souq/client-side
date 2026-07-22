import React from 'react'
import type { BadgeProps } from '../../types'
import type { BadgeVariant } from '../../tokens'
import styles from './Badge.module.css'

const variantMap: Record<BadgeVariant, string> = {
  yellow: styles.yellow,
  ink: styles.ink,
  soft: styles.soft,
  green: styles.green,
  red: styles.red,
  orange: styles.orange,
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'ink', children, className }) => {
  return (
    <span className={`${styles.badge} ${variantMap[variant]}${className ? ' ' + className : ''}`}>
      {children}
    </span>
  )
}