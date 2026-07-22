export type TicketStatus = 'confirmed' | 'pending' | 'used' | 'expired' | 'cancelled'
export type TicketType = 'seat' | 'zone'

export interface TicketData {
  id: string
  type: TicketType
  tier: string
  tierVariant: 'yellow' | 'soft' | 'ink'
  row: string
  seat: string
  price: string
  ticketCode: string
}

export interface Reservation {
  id: string
  eventTitle: string
  date: string
  venue: string
  ticketCount: number
  totalPrice: string
  status: TicketStatus
  tickets: TicketData[]
}
