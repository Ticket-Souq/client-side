import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'info'

export interface ToastInstance {
  message: string
  type: ToastType
}

let _show: ((message: string, type?: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'error') {
  _show?.(message, type)
}

export const ToastContainer: React.FC = () => {
  const [current, setCurrent] = useState<ToastInstance | null>(null)

  const show = useCallback((message: string, type: ToastType = 'error') => {
    setCurrent({ message, type })
  }, [])

  useEffect(() => {
    _show = show
    return () => { _show = null }
  }, [show])

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => setCurrent(null), 3500)
    return () => clearTimeout(timer)
  }, [current])

  if (!current) return null

  return createPortal(
    <div className={`${styles.toast} ${styles[current.type]}`}>
      {current.message}
    </div>,
    document.body,
  )
}
