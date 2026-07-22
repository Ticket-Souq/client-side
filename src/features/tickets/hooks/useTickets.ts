import { useState, useEffect, useMemo } from 'react'
import { getMyTickets, getTicketById } from '../services/ticketService'
import type { TicketResponse, TicketGroup } from '../types/ticket.types'

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
  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = () => {
    setLoading(true)
    setError(null)
    getMyTickets()
      .then(setTickets)
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const groups = useMemo(() => groupTickets(tickets), [tickets])

  return { tickets, groups, loading, error, retry: fetch }
}

export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    getTicketById(id)
      .then((t) => {
        if (!t) setError('Ticket not found')
        else setTicket(t)
      })
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [id])

  return { ticket, loading, error, retry: fetch }
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
