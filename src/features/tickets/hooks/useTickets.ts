import { useMemo } from 'react'
import { getMyTickets, getTicketById } from '../services/ticketService'
import type { TicketResponse, TicketGroup } from '../types/ticket.types'
import { useFetch } from '../../../shared/hooks/useFetch'

function groupTickets(tickets: TicketResponse[]): TicketGroup[] {
  const map = new Map<string, TicketResponse[]>()
  for (const t of tickets) {
    const key = t.eventTitle
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return Array.from(map.entries()).map(([title, ts]) => ({
    eventTitle: title,
    eventStartDate: ts[0].eventStartDate,
    eventFinishDate: ts[0].eventFinishDate,
    eventPosterUrl: ts[0].eventPosterUrl,
    eventStatus: ts[0].eventStatus,
    tickets: ts,
  }))
}

export function useTickets() {
  const { data, loading, error, refresh } = useFetch(getMyTickets, 'Something went wrong')
  const tickets = data ?? []
  const groups = useMemo(() => groupTickets(tickets), [tickets])

  return { tickets, groups, loading, error, retry: refresh }
}

export function useTicket(id: string | undefined) {
  const { data, loading, error, refresh } = useFetch<TicketResponse | null>(
    async () => (id ? getTicketById(id) : null),
    'Something went wrong',
    [id],
  )
  const ticket = data ?? null
  const notFound = !loading && !error && !!id && data == null
  return { ticket, loading, error: notFound ? 'Ticket not found' : error, retry: refresh }
}

export function useGroupFromTickets(tickets: TicketResponse[], id: string | undefined) {
  return useMemo(() => {
    if (!id || tickets.length === 0) return null
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return null
    const group = {
      eventTitle: ticket.eventTitle,
      eventStartDate: ticket.eventStartDate,
      eventFinishDate: ticket.eventFinishDate,
      eventPosterUrl: ticket.eventPosterUrl,
      eventStatus: ticket.eventStatus,
      tickets: tickets.filter(t => t.eventTitle === ticket.eventTitle),
    }
    return { group, ticket }
  }, [tickets, id])
}
