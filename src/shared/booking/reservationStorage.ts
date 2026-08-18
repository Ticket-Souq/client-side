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
  const expiresMs = new Date(stored.expiresAt).getTime()
  if (expiresMs <= Date.now()) return false
  return true
}
