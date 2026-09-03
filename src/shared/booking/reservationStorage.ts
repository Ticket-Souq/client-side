export const RESERVATION_STORAGE_KEY = 'reservation'
export const RESERVATION_CHANGED_EVENT = 'ticketsouq:reservation-changed'

export interface StoredReservationTicket {
  key: string
  label: string
  sectionName: string
  price: number
  sectionId: string
}

export interface StoredReservation {
  reservationId: string
  eventId: string
  bookingModel: string
  seatIds: string[]
  expiresAt: string
  tickets: StoredReservationTicket[]
  holderNames: Record<string, string>
}

/**
 * The backend serializes lock `expiresAt` as a timezone-less ISO string in
 * UTC wall-clock time. `new Date("...")` would otherwise treat it as local
 * browser time, skewing the countdown by the timezone offset. Normalize it
 * to an absolute instant by assuming UTC when no offset is present.
 */
export function parseExpiresAt(expiresAt: string): number {
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(expiresAt)
    ? expiresAt
    : `${expiresAt}Z`
  return new Date(normalized).getTime()
}

function notifyReservationChanged() {
  try { window.dispatchEvent(new Event(RESERVATION_CHANGED_EVENT)) } catch { /* ignore */ }
}

export function loadReservation(): StoredReservation | null {
  try {
    const raw = localStorage.getItem(RESERVATION_STORAGE_KEY)
    return raw ? JSON.parse(raw) as StoredReservation : null
  } catch { return null }
}

export function saveReservation(data: StoredReservation) {
  try { localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
  notifyReservationChanged()
}

export function clearReservation() {
  try { localStorage.removeItem(RESERVATION_STORAGE_KEY) } catch { /* ignore */ }
  notifyReservationChanged()
}

export function getHasActiveReservation(): boolean {
  const stored = loadReservation()
  if (!stored) return false
  const expiresMs = parseExpiresAt(stored.expiresAt)
  if (expiresMs <= Date.now()) return false
  return true
}
