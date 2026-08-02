import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { mockTickets } from '../data/mockTickets'
import type { TicketResponse } from '../types/ticket.types'

async function withMockFallback<T>(fetchFn: () => Promise<T>, fallback: () => T, reason: string): Promise<T> {
  try {
    return await fetchFn()
  } catch (err) {
    console.warn(`${reason}:`, err instanceof Error ? err.message : err)
    return fallback()
  }
}

export async function getMyTickets(): Promise<TicketResponse[]> {
  return withMockFallback(
    () => request<TicketResponse[]>(API.tickets.list),
    () => mockTickets,
    'API error fetching tickets, using mock data',
  )
}

export async function getTicketById(id: string): Promise<TicketResponse | null> {
  return withMockFallback(
    () => request<TicketResponse>(API.tickets.byId(id)),
    () => mockTickets.find((t) => t.id === id) ?? null,
    'API error fetching ticket, falling back to mock',
  )
}

export async function getTicketsByReservation(reservationId: string): Promise<TicketResponse[]> {
  return withMockFallback(
    () => request<TicketResponse[]>(API.tickets.byReservation(reservationId)),
    () => mockTickets,
    'API error fetching reservation tickets, using mock data',
  )
}
