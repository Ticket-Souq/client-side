import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import type { TicketResponse } from '../types/ticket.types'

export async function getMyTickets(): Promise<TicketResponse[]> {
  return request<TicketResponse[]>(API.tickets.list)
}

export async function getTicketById(id: string): Promise<TicketResponse | null> {
  return request<TicketResponse>(API.tickets.byId(id))
}

export async function getTicketsByReservation(reservationId: string): Promise<TicketResponse[]> {
  return request<TicketResponse[]>(API.tickets.byReservation(reservationId))
}

export async function consumeTicket(id: string): Promise<TicketResponse> {
  return request<TicketResponse>(API.tickets.consume(id), { method: 'POST' })
}

export async function cancelTicket(id: string): Promise<TicketResponse> {
  return request<TicketResponse>(API.tickets.updateStatus(id), {
    method: 'PATCH',
    body: { reservationStatus: 'CANCELLED' },
  })
}
