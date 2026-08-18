import { EventApi } from '../services/eventApi'
import type { EventFullResponse } from '../types/event.types'
import { useFetch } from '../../../shared/hooks/useFetch'

interface UseEventResult {
  event: EventFullResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEvent(id: string | null): UseEventResult {
  const { data, loading, error, refresh } = useFetch<EventFullResponse | null>(
    async () => (id ? EventApi.getById(id) : null),
    'Event not found',
    [id],
  )

  return { event: data, loading, error, refetch: refresh }
}
