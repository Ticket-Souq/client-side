import React from 'react'
import type { ButtonProps } from '../../types'
import type { ButtonVariant } from '../../tokens'
import styles from './Button.module.css'

const variantMap: Record<ButtonVariant, string> = {
  primary: styles.primary,
  ghost: styles.ghost,
  danger: styles.danger,
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost', size = 'default', href,
  className, style, children, onClick, disabled, title, type = 'button',
}) => {
  const cls = `${styles.btn} ${variantMap[variant]}${size === 'sm' ? ' ' + styles.sm : ''}${className ? ' ' + className : ''}`

  if (href) {
    return <a href={href} className={cls} style={style} onClick={onClick} title={title}>{children}</a>
  }

  return (
    <button type={type} className={cls} style={style} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  )
}