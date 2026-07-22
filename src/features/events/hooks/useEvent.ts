import { useState, useEffect, useCallback } from 'react'
import { EventApi } from '../services/eventApi'
import { MOCK_EVENTS_DETAIL } from '../data/mockEvents'
import type { EventDetail } from '../types/event.types'

interface UseEventResult {
  event: EventDetail | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEvent(id: string | null): UseEventResult {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await EventApi.getById(id)
      setEvent(result)
    } catch {
      const mock = MOCK_EVENTS_DETAIL.find((e) => e.id === id)
      if (mock) {
        setEvent(mock)
      } else {
        setError('Event not found')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  return { event, loading, error, refetch: fetchEvent }
}
