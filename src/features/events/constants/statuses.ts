import type { EventStatus } from '../types/event.types'

interface StatusConfig {
  label: string
  variant: 'green' | 'yellow' | 'red' | 'soft' | 'ink' | 'orange'
}

export const STATUS_MAP: Record<EventStatus, StatusConfig> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  DRAFT: { label: 'Draft', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  REJECTED: { label: 'Rejected', variant: 'red' },
}

export const STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const
