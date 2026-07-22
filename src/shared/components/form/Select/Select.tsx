import React from 'react'
import type { SelectProps } from '../../types'
import styles from './Select.module.css'

export const Select: React.FC<SelectProps> = ({ value, onChange, className, children }) => {
  return (
    <select
      className={`${styles.select}${className ? ' ' + className : ''}`}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  )
}