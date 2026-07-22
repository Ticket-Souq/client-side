import { Button } from '../../../shared/components/form/Button/Button'

interface Props {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: string
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '🎫' }: Props) {
  return (
    <div className="events-empty">
      <div className="events-empty-icon">{icon}</div>
      <h3 className="events-empty-title">{title}</h3>
      {description && <p className="events-empty-desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
