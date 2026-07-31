import { authFetch } from '../../../shared/auth'
import { parseError } from '../../../shared/apiError'
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

export async function acquireSeatLocks(eventId: string, seatIds: string[]): Promise<LockSeatsResponse> {
  const res = await authFetch(API.locks.acquireSeats(eventId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  })
  if (!res.ok) {
    const err = await parseError(res)
    throw new Error(err.message)
  }
  return res.json()
}

export async function acquireZoneLock(eventId: string, zoneId: string, quantity: number): Promise<LockZoneResponse> {
  const res = await authFetch(API.locks.acquireZone(eventId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, quantity }),
  })
  if (!res.ok) {
    const err = await parseError(res)
    throw new Error(err.message)
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
    const err = await parseError(res)
    throw new Error(err.message)
  }
}