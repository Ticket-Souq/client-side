import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import type { Venue, CreateVenueRequest, VenueTemplate, PaginatedResponse } from '../components/types'

const BASE = API.venues.list

export function createVenue(data: CreateVenueRequest): Promise<Venue> {
  return request<Venue>(API.venues.create, { method: 'POST', body: data })
}

export function getVenueById(id: string): Promise<Venue> {
  return request<Venue>(API.venues.byId(id))
}

export function listVenues(page: number, size: number): Promise<PaginatedResponse<Venue>> {
  return request<PaginatedResponse<Venue>>(BASE, { query: { page, size } })
}

export function deleteVenue(id: string): Promise<void> {
  return request<void>(API.venues.delete(id), { method: 'DELETE' })
}

export function listVenueTemplates(venueId: string): Promise<VenueTemplate[]> {
  return request<VenueTemplate[]>(API.venues.templates(venueId))
}

export function createVenueTemplate(venueId: string, layout: string): Promise<VenueTemplate> {
  return request<VenueTemplate>(API.venues.templates(venueId), { method: 'POST', body: { layout } })
}

export function getVenueTemplate(venueId: string, templateId: string): Promise<VenueTemplate> {
  return request<VenueTemplate>(API.venues.templateById(venueId, templateId))
}

export function deleteVenueTemplate(venueId: string, templateId: string): Promise<void> {
  return request<void>(API.venues.templateById(venueId, templateId), { method: 'DELETE' })
}

export function getTemplateById(templateId: string): Promise<VenueTemplate> {
  return request<VenueTemplate>(API.venues.templateById('venues', templateId))
}
