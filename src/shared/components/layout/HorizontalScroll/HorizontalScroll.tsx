import React from 'react'
import type { HorizontalScrollProps } from '../../types'
import styles from './HorizontalScroll.module.css'

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children }) => {
  return <div className={styles.scroll}>{children}</div>
}