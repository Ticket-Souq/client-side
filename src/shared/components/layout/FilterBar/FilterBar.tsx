import React from 'react'
import type { FilterBarProps } from '../../types'
import styles from './FilterBar.module.css'

export const FilterBar: React.FC<FilterBarProps> = ({ children }) => {
  return <div className={styles.bar}>{children}</div>
}