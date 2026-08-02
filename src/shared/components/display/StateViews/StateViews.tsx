import type { CSSProperties } from 'react'
import styles from './StateViews.module.css'

interface StateViewProps {
  message?: string
  style?: CSSProperties
}

export function LoadingState({ message = 'Loading…', style }: StateViewProps) {
  return <p className={styles.base} style={style}>{message}</p>
}

export function ErrorState({ message, style }: { message: string; style?: CSSProperties }) {
  return <p className={`${styles.base} ${styles.error}`} style={style}>{message}</p>
}

export function EmptyState({ message, style }: StateViewProps) {
  return <p className={styles.base} style={style}>{message}</p>
}
