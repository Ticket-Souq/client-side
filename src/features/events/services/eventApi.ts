import { fetchWithTimeout } from '../../../shared/fetchWithTimeout'
import { API } from '../../../shared/api'
import type { EventFilters, CreateEventRequest, PaginatedResponse, EventCardResponse, EventDetail } from '../types/event.types'

function toQueryParams(filters: EventFilters): string {
  const params = new URLSearchParams()
  if (filters.title) params.set('title', filters.title)
  if (filters.organization) params.set('organization', filters.organization)
  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.size !== undefined) params.set('size', String(filters.size))
  return params.toString()
}

export const EventApi = {
  async search(filters: EventFilters): Promise<PaginatedResponse<EventCardResponse>> {
    const qs = toQueryParams(filters)
    const url = qs ? `${API.events.search}?${qs}` : API.events.list
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`Search failed: ${res.status}`)
    return res.json()
  },

  async list(page: number = 0, size: number = 12): Promise<PaginatedResponse<EventCardResponse>> {
    const res = await fetchWithTimeout(`${API.events.list}?page=${page}&size=${size}`)
    if (!res.ok) throw new Error(`List failed: ${res.status}`)
    return res.json()
  },

  async getById(id: string): Promise<EventDetail> {
    const res = await fetchWithTimeout(API.events.byId(id))
    if (!res.ok) throw new Error(`Fetch event failed: ${res.status}`)
    return res.json()
  },

  async create(data: CreateEventRequest): Promise<EventDetail> {
    const { authFetch } = await import('../../../shared/auth')
    const res = await authFetch(API.events.create, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Create event failed: ${res.status}`)
    return res.json()
  },

  async cancel(id: string): Promise<void> {
    const { authFetch } = await import('../../../shared/auth')
    const res = await authFetch(API.events.cancel(id), { method: 'DELETE' })
    if (!res.ok) throw new Error(`Cancel event failed: ${res.status}`)
  },
}
