import React from 'react'
import type { InputProps } from '../../types'
import styles from './Input.module.css'

export const Input: React.FC<InputProps> = ({
  type = 'text', placeholder, value, onChange, className, style,
}) => {
  const isTextarea = type === 'textarea'
  const cls = `${isTextarea ? styles.textarea : styles.input}${className ? ' ' + className : ''}`

  if (isTextarea) {
    return (
      <textarea
        className={cls}
        placeholder={placeholder}
        value={value}
        onChange={onChange as any}
        style={style}
        rows={6}
      />
    )
  }

  return (
    <input
      type={type}
      className={cls}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={style}
    />
  )
}