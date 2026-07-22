import React from 'react'
import type { CardProps } from '../../types'
import styles from './Card.module.css'

export const Card: React.FC<CardProps> = ({ className, children, style }) => {
  return (
    <div className={`${styles.card}${className ? ' ' + className : ''}`} style={style}>
      {children}
    </div>
  )
}