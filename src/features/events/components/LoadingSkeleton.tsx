interface Props {
  variant?: 'card' | 'row' | 'table'
  count?: number
}

export function LoadingSkeleton({ variant = 'card', count = 6 }: Props) {
  if (variant === 'table') {
    return (
      <div>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="events-skeleton events-skeleton-row" style={{ height: 56, marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  if (variant === 'row') {
    return (
      <div style={{ display: 'flex', gap: 22, overflow: 'hidden' }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="events-skeleton events-skeleton-card" style={{ flex: '0 0 340px' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="events-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="events-skeleton events-skeleton-card" />
      ))}
    </div>
  )
}
