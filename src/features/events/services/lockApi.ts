import { request } from '../../../shared/http'
import { API } from '../../../shared/api'

export interface LockSeatsResponse {
  reservationId: string
  status: string
  expiresAt: string
  lockedSeats: string[]
}

export interface LockZoneResponse {
  reservationId: string
  status: string
  expiresAt: string
  zoneId: string
  quantity: number
}

export interface ReservationTicketInput {
  seatId?: string
  sectionId?: string
  holderName: string
  label?: string
}

export interface ReservationRequest {
  eventId: string
  reservationId: string
  tickets: ReservationTicketInput[]
}

export function acquireSeatLocks(eventId: string, seatIds: string[]): Promise<LockSeatsResponse> {
  return request<LockSeatsResponse>(API.locks.acquireSeats(eventId), { method: 'POST', body: { seatIds } })
}

export function acquireZoneLock(eventId: string, zoneId: string, quantity: number): Promise<LockZoneResponse> {
  return request<LockZoneResponse>(API.locks.acquireZone(eventId), { method: 'POST', body: { zoneId, quantity } })
}

export function releaseLocks(reservationId: string): Promise<void> {
  return request<void>(API.locks.release, { method: 'POST', body: { reservationId } })
}

export function beginReservation(req: ReservationRequest): Promise<void> {
  return request<void>(API.locks.reserve, { method: 'POST', body: req })
}
