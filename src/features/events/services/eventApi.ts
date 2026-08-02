import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import type { EventFilters, CreateEventRequest, PaginatedResponse, EventCardResponse, EventFullResponse } from '../types/event.types'

export const EventApi = {
  async search(filters: EventFilters): Promise<PaginatedResponse<EventCardResponse>> {
    return request<PaginatedResponse<EventCardResponse>>(API.events.search, {
      auth: false,
      query: {
        title: filters.title,
        organization: filters.organization,
        category: filters.category,
        status: filters.status,
        page: filters.page,
        size: filters.size,
      },
    })
  },

  async list(page: number = 0, size: number = 12): Promise<PaginatedResponse<EventCardResponse>> {
    return request<PaginatedResponse<EventCardResponse>>(API.events.list, { auth: false, query: { page, size } })
  },

  async getManagement(page: number = 0, size: number = 20): Promise<PaginatedResponse<EventFullResponse>> {
    return request<PaginatedResponse<EventFullResponse>>(API.events.management, { query: { page, size } })
  },

  async getById(id: string): Promise<EventFullResponse> {
    return request<EventFullResponse>(API.events.byId(id), { auth: false })
  },

  async getCategories(): Promise<string[]> {
    return request<string[]>(API.events.categories, { auth: false })
  },

  async create(data: CreateEventRequest, posterFile: File | null, bannerFile: File | null): Promise<void> {
    const formData = new FormData()
    formData.append('event', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (posterFile) formData.append('poster', posterFile)
    if (bannerFile) formData.append('banner', bannerFile)
    return request<void>(API.events.create, { method: 'POST', body: formData })
  },

  async cancel(id: string): Promise<void> {
    return request<void>(API.events.cancel(id), { method: 'DELETE' })
  },
}
