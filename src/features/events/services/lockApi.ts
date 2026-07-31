import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'

export interface LockSeatsResponse {
  reservationId: string
  status: string
  expiresAt: string
  lockedSeats: string[]
}

export interface LockZonesResponse {
  reservationId: string
  status: string
  expiresAt: string
  zones: { zoneId: string; quantity: number }[]
}

export interface ZoneLockItem {
  zoneId: string
  quantity: number
}

export async function acquireSeatLocks(eventId: string, seatIds: string[]): Promise<LockSeatsResponse> {
  const res = await authFetch(API.locks.acquireSeats(eventId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Lock seats failed (${res.status})`)
  }
  return res.json()
}

export async function acquireZoneLocks(eventId: string, zones: ZoneLockItem[]): Promise<LockZonesResponse> {
  const res = await authFetch(API.locks.acquireZones(eventId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zones }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Lock zones failed (${res.status})`)
  }
  return res.json()
}

export async function releaseLocks(reservationId: string): Promise<void> {
  const res = await authFetch(API.locks.release, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservationId }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Release locks failed (${res.status})`)
  }
}