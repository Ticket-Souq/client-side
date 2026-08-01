import { authFetch } from '../../../shared/auth'
import { parseError } from '../../../shared/apiError'
import { API } from '../../../shared/api'

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

async function getJson<T>(url: string): Promise<T> {
  const res = await authFetch(url)
  if (!res.ok) {
    const err = await parseError(res)
    throw new Error(err.message)
  }
  return res.json()
}

export async function getOverviewKpis(): Promise<OverviewKpiResponse> {
  return getJson<OverviewKpiResponse>(API.analytics.overviewKpis())
}

export async function getSalesPace(eventId?: string): Promise<SalesPaceResponse> {
  return getJson<SalesPaceResponse>(API.analytics.overviewSalesPace(eventId))
}

export async function getEvents(sort: string, page: number, size: number): Promise<EventComparisonResponse> {
  return getJson<EventComparisonResponse>(API.analytics.overviewEvents(sort, page, size))
}

export async function getEventSummary(eventId: string): Promise<EventSummaryResponse> {
  return getJson<EventSummaryResponse>(API.analytics.eventSummary(eventId))
}

export async function getEventSalesTimeline(eventId: string, granularity: string): Promise<EventSalesTimelineResponse> {
  return getJson<EventSalesTimelineResponse>(API.analytics.eventSalesTimeline(eventId, granularity))
}
