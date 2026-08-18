import styles from './EventStatusRibbon.module.css'

interface StatusOption {
  label: string
  tone: 'green' | 'blue' | 'red' | 'gray' | 'yellow'
}

const STATUS_OPTIONS: Record<string, StatusOption> = {
  PUBLISHED: { label: 'Published', tone: 'green' },
  ACTIVE: { label: 'Active', tone: 'blue' },
  COMPLETED: { label: 'Completed', tone: 'gray' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
}

const TONE_CLASS: Record<StatusOption['tone'], string> = {
  green: styles.green,
  blue: styles.blue,
  red: styles.red,
  gray: styles.gray,
  yellow: styles.yellow,
}

interface EventStatusRibbonProps {
  status: string
  side?: 'left' | 'right'
}

export function EventStatusRibbon({ status, side = 'left' }: EventStatusRibbonProps) {
  const option = STATUS_OPTIONS[status] ?? { label: status, tone: 'gray' as const }
  const sideClass = side === 'right' ? styles.right : styles.left
  return (
    <span className={`${styles.ribbon} ${TONE_CLASS[option.tone]} ${sideClass}`}>
      {option.label}
    </span>
  )
}
