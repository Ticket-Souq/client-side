import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'
import { parseError } from '../../../shared/apiError'
import { mockTickets } from '../data/mockTickets'
import type { TicketResponse } from '../types/ticket.types'

export async function getMyTickets(): Promise<TicketResponse[]> {
  try {
    const res = await authFetch(API.tickets.list)
    if (!res.ok) {
      const err = await parseError(res)
      console.warn('API error fetching tickets, using mock data:', err.message)
      return mockTickets
    }
    return res.json()
  } catch {
    console.warn('Network error fetching tickets, using mock data')
    return mockTickets
  }
}

export async function getTicketById(id: string): Promise<TicketResponse | null> {
  try {
    const res = await authFetch(API.tickets.byId(id))
    if (!res.ok) {
      const err = await parseError(res)
      console.warn('API error fetching ticket, falling back to mock:', err.message)
      return mockTickets.find(t => t.id === id) ?? null
    }
    return res.json()
  } catch {
    console.warn('Network error fetching ticket, falling back to mock')
    return mockTickets.find(t => t.id === id) ?? null
  }
}

export async function getTicketsByReservation(reservationId: string): Promise<TicketResponse[]> {
  try {
    const res = await authFetch(API.tickets.byReservation(reservationId))
    if (!res.ok) {
      const err = await parseError(res)
      console.warn('API error fetching reservation tickets, using mock data:', err.message)
      return mockTickets
    }
    return res.json()
  } catch {
    console.warn('Network error fetching reservation tickets, using mock data')
    return mockTickets
  }
}
