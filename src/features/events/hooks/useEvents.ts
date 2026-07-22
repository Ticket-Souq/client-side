import { useState, useEffect, useCallback, useRef } from 'react'
import { EventApi } from '../services/eventApi'
import { MOCK_CARDS } from '../data/mockEvents'
import type { EventFilters, EventCardResponse } from '../types/event.types'

interface UseEventsOptions {
  filters?: EventFilters
  page?: number
  size?: number
  autoFetch?: boolean
}

interface UseEventsResult {
  events: EventCardResponse[]
  totalElements: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => void
}

function useStableFilters(filters: EventFilters): string {
  const ref = useRef(JSON.stringify(filters))
  const stable = useRef(filters)
  const serialized = JSON.stringify(filters)
  if (serialized !== ref.current) {
    ref.current = serialized
    stable.current = filters
  }
  return ref.current
}

export function useEvents({ filters = {}, page = 0, size = 12, autoFetch = true }: UseEventsOptions = {}): UseEventsResult {
  const [events, setEvents] = useState<EventCardResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const filtersKey = useStableFilters(filters)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await EventApi.search({ ...filters, page, size })
      setEvents(result.content)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.warn('Events API unavailable, using mock data:', err)
      let filtered = [...MOCK_CARDS]
      if (filters.title) {
        const q = filters.title.toLowerCase()
        filtered = filtered.filter((e) => e.title.toLowerCase().includes(q))
      }
      if (filters.category) {
        filtered = filtered.filter((e) => e.category === filters.category)
      }
      if (filters.status) {
        filtered = filtered.filter((e) => e.status === filters.status)
      }
      setEvents(filtered)
      setTotalElements(filtered.length)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page, size])

  useEffect(() => {
    if (autoFetch) fetchEvents()
  }, [fetchEvents, autoFetch])

  return { events, totalElements, totalPages, loading, error, refetch: fetchEvents }
}
