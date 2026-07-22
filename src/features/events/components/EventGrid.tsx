import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  columns?: 1 | 2 | 3
}

export function EventGrid({ children, columns = 3 }: Props) {
  const colClass = columns === 1 ? 'events-grid events-grid-1' : columns === 2 ? 'events-grid events-grid-2' : 'events-grid'
  return <div className={colClass}>{children}</div>
}
