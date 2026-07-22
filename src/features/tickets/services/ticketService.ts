import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'
import { parseError } from '../../../shared/apiError'
import { mockReservations } from '../data/mockTickets'
import type { Reservation } from '../types/ticket.types'

export async function getReservations(): Promise<Reservation[]> {
  try {
    const res = await authFetch(API.reservations.list)
    if (!res.ok) {
      const err = await parseError(res)
      console.warn('API error fetching reservations, using mock data:', err.message)
      return mockReservations
    }
    return res.json()
  } catch {
    console.warn('Network error fetching reservations, using mock data')
    return mockReservations
  }
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  try {
    const res = await authFetch(`${API.reservations.list}/${id}`)
    if (!res.ok) {
      const err = await parseError(res)
      console.warn('API error fetching reservation detail, using mock data:', err.message)
      return mockReservations.find(r => r.id === id) ?? null
    }
    return res.json()
  } catch {
    console.warn('Network error fetching reservation detail, using mock data')
    return mockReservations.find(r => r.id === id) ?? null
  }
}
