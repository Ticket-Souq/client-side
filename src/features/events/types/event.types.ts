export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'CANCELLED' | 'REJECTED'
export type EventMode = 'SEAT_BASED' | 'ZONE_BASED'
export type EventVisibility = 'PUBLIC' | 'PRIVATE'
export type DateRange = 'this_week' | 'this_month' | 'next_month' | 'all'

export interface EventSummary {
  id: string
  title: string
  posterUrl: string
  status: EventStatus
  startDate: string
  endDate: string
  category: string
  venueName: string
  priceFrom: number
  currency: string
  ticketsAvailable: number
  ticketsSold: number
  organizerName?: string
  organizerId?: string
}

export interface EventDetail extends EventSummary {
  description: string
  slug: string
  venueId: string
  venueAddress: string
  mode: EventMode
  tags: string[]
  imageUrl: string
  tiers: TicketTier[]
  zones?: Zone[]
  visibility: EventVisibility
  lineup?: { name: string; stage: string }[]
  duration?: string
  doorsOpen?: string
  capacity?: number
}

export interface TicketTier {
  id: string
  name: string
  price: number
  perks: string[]
  available: number
  total: number
  active: boolean
}

export interface Zone {
  id: string
  name: string
  price: number
  spotsAvailable: number
  spotsTotal: number
  status: 'available' | 'limited' | 'soldout'
  color: string
}

export interface EventFilters {
  title?: string
  organization?: string
  category?: string
  status?: string
  dateRange?: DateRange
  page?: number
  size?: number
}

export interface CreateEventRequest {
  name: string
  slug: string
  description: string
  mode: EventMode
  venueId: string
  venueTemplateId?: string
  category: string
  tags: string[]
  startDate: string
  endDate: string
  visibility: EventVisibility
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface EventCardResponse {
  id: string
  title: string
  posterUrl: string
  status: string
  startDate: string
  endDate?: string
  category?: string
  venueName?: string
  priceFrom?: number
  currency?: string
  ticketsAvailable?: number
  ticketsSold?: number
  description?: string
  organizerName?: string
  mode?: EventMode
}
