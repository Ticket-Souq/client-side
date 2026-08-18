import { Badge } from '../Badge/Badge'
import type { BadgeVariant } from '../../tokens'

export interface StatusBadgeOption {
  label: string
  variant: BadgeVariant
}

interface StatusBadgeProps {
  status: string
  options: Record<string, StatusBadgeOption>
  fallback?: StatusBadgeOption
}

export function StatusBadge({ status, options, fallback }: StatusBadgeProps) {
  const option = options[status] ?? fallback
  if (!option) return null
  return <Badge variant={option.variant}>{option.label}</Badge>
}
