import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'
import { parseError } from '../../../shared/apiError'
import type { TicketResponse } from '../types/ticket.types'

export async function getMyTickets(): Promise<TicketResponse[]> {
  const res = await authFetch(API.tickets.list)
  if (!res.ok) {
    const err = await parseError(res)
    throw err
  }
  return res.json()
}

export async function getTicketById(id: string): Promise<TicketResponse | null> {
  const res = await authFetch(API.tickets.byId(id))
  if (!res.ok) {
    const err = await parseError(res)
    throw err
  }
  return res.json()
}
