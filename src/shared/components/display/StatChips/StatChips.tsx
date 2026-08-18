import type { CSSProperties, ReactNode } from 'react'
import styles from './StatChips.module.css'

export interface StatChipItem {
  label: string
  value: ReactNode
  tone?: 'default' | 'pending' | 'flagged'
  style?: CSSProperties
}

interface StatChipsProps {
  items: StatChipItem[]
  className?: string
  style?: CSSProperties
}

export function StatChips({ items, className, style }: StatChipsProps) {
  return (
    <div className={`${styles.chips}${className ? ` ${className}` : ''}`} style={style}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`${styles.chip}${item.tone === 'pending' ? ` ${styles.pending}` : ''}${item.tone === 'flagged' ? ` ${styles.flagged}` : ''}`}
          style={item.style}
        >
          <span className={styles.num}>{item.value}</span> {item.label}
        </div>
      ))}
    </div>
  )
}
