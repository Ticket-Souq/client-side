import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import type { EventFullResponse, PaginatedResponse } from '../../events/types/event.types'

export interface OverviewKpiResponse {
  revenue: { value: number; currency: string; deltaPct: number }
  ticketsSold: { value: number; capacity: number }
  checkInRate: { valuePct: number | null; noShowPct: number | null }
  avgTicketPrice: { value: number; currency: string }
}

export interface SalesPaceResponse {
  granularity: string
  series: { date: string; ticketsCumulative: number }[]
}

export interface EventComparisonResponse {
  events: EventComparisonRow[]
  page: number
  totalPages: number
}

export interface EventComparisonRow {
  eventId: string
  name: string
  date: string
  sold: number
  capacity: number
  revenue: number
  noShowPct: number | null
}

export interface EventSummaryResponse {
  eventId: string
  name: string
  date: string
  venue: { name: string; city: string }
  capacity: number
  kpis: {
    revenue: { value: number; deltaPctVsProjection: number }
    sold: { value: number; capacity: number }
    checkInRate: { valuePct: number | null; noShowPct: number | null }
    refundRate: { valuePct: number | null; deltaPtVsLastEvent: number | null }
  }
}

export interface EventSalesTimelineResponse {
  granularity: string
  series: { period: string; ticketsCumulative: number }[]
}

export function getOverviewKpis(): Promise<OverviewKpiResponse> {
  return request<OverviewKpiResponse>(API.analytics.overviewKpis())
}

export function getSalesPace(eventId?: string): Promise<SalesPaceResponse> {
  return request<SalesPaceResponse>(API.analytics.overviewSalesPace(eventId))
}

export function getEvents(sort: string, page: number, size: number): Promise<EventComparisonResponse> {
  return request<EventComparisonResponse>(API.analytics.overviewEvents(sort, page, size))
}

export function getEventSummary(eventId: string): Promise<EventSummaryResponse> {
  return request<EventSummaryResponse>(API.analytics.eventSummary(eventId))
}

export function getEventSalesTimeline(eventId: string, granularity: string): Promise<EventSalesTimelineResponse> {
  return request<EventSalesTimelineResponse>(API.analytics.eventSalesTimeline(eventId, granularity))
}

export type EventCapacityMap = Record<string, number>

function totalCapacity(event: EventFullResponse | undefined): number {
  if (!event) return 0
  return (event.sections ?? []).reduce((sum, sec) => sum + (sec?.capacity ?? 0), 0)
}

export async function getEventCapacities(page = 0, size = 100): Promise<EventCapacityMap> {
  try {
    const events = await request<PaginatedResponse<EventFullResponse>>(API.events.management, { query: { page, size } })
    const map: EventCapacityMap = {}
    for (const ev of events.content ?? []) {
      map[ev.id] = totalCapacity(ev)
    }
    return map
  } catch {
    return {}
  }
}

export async function getEventCapacity(eventId: string): Promise<number> {
  try {
    const event = await request<EventFullResponse>(API.events.byId(eventId), { auth: false })
    return totalCapacity(event)
  } catch {
    return 0
  }
}
