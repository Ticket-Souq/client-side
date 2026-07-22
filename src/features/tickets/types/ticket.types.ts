export type TicketType = 'SEAT' | 'ZONE'
export type ReservationStatus = 'ACTIVE' | 'REFUNDED' | 'CANCELLED'
export type DisplayStatus = 'confirmed' | 'used' | 'expired' | 'cancelled'

export interface TicketResponse {
  id: string
  ticketType: TicketType
  eventTitle: string
  eventStartDate: string
  eventFinishDate: string
  eventPosterUrl: string
  eventStatus: string
  price: number
  reservationStatus: ReservationStatus
  consumed: boolean
  zoneCategory: string | null
  row: number | null
  seatNumber: number | null
  seatCategory: string | null
  createdAt: string
}

export interface TicketGroup {
  eventTitle: string
  eventStartDate: string
  eventFinishDate: string
  eventPosterUrl: string
  eventStatus: string
  tickets: TicketResponse[]
}

export function deriveDisplayStatus(ticket: TicketResponse): DisplayStatus {
  if (ticket.consumed) return 'used'
  if (ticket.reservationStatus === 'REFUNDED' || ticket.reservationStatus === 'CANCELLED') return 'cancelled'
  const now = new Date()
  const finish = new Date(ticket.eventFinishDate)
  return finish < now ? 'expired' : 'confirmed'
}

export function deriveGroupDisplayStatus(tickets: TicketResponse[]): DisplayStatus {
  const statuses = tickets.map(deriveDisplayStatus)
  if (statuses.every(s => s === 'cancelled')) return 'cancelled'
  if (statuses.includes('cancelled')) return 'cancelled'
  if (statuses.every(s => s === 'used')) return 'used'
  if (statuses.includes('used')) return 'used'
  if (statuses.every(s => s === 'expired')) return 'expired'
  return 'confirmed'
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getUTCMonth()]
  const day = d.getUTCDate()
  const year = d.getUTCFullYear()
  const hours = d.getUTCHours()
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  return `${month} ${day}, ${year} · ${h12}:${minutes} ${ampm}`
}

export function formatPrice(price: number): string {
  return `EGP ${price.toFixed(2)}`
}
