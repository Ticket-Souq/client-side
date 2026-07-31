export type BookingModel = 'SEAT' | 'ZONE' | 'MIXED'

export type EventStatus = 'PUBLISHED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED'

export type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'BOOKED_ORGANIZER'

export type DateRange = 'this_week' | 'this_month' | 'next_month' | 'all'

export interface CreateSectionRequest {
  id: string | null
  name: string
  capacity: number | null
  color: string
  price: number | null
  seats: CreateSeatRequest[]
}

export interface CreateSeatRequest {
  id: string | null
  lable: string
  status: SeatStatus
}

export interface CreateEventRequest {
  title: string
  description: string
  location: string
  venueTemplateId: string | null
  eventCategoryName: string
  bookingModel: BookingModel
  startDate: string
  finishDate: string
  sections: CreateSectionRequest[]
  reservations: EventReservation[]
}

export interface EventReservation {
  price: number
  label: string
  sectionName: string
  holderName: string
}

export interface SeatFullResponse {
  id: string
  templateSeatId: string | null
  status: SeatStatus
}

export interface SectionFullResponse {
  id: string
  templateSectionId: string | null
  name: string
  capacity: number
  remainingCapacity: number
  color: string
  price: number
  seats: SeatFullResponse[]
}

export interface EventFullResponse {
  id: string
  title: string
  description: string
  location: string
  venueTemplateId: string | null
  eventCategoryName: string
  organization: string
  PosterUrl: string
  bannerUrl: string | null
  status: EventStatus
  bookingModel: BookingModel
  startDate: string
  finishDate: string
  sections: SectionFullResponse[]
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
  bannerUrl?: string | null
  location?: string
  categoryName?: string
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
}
