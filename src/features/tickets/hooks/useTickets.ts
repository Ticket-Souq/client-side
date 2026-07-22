import { useState, useEffect } from 'react'
import { getReservations, getReservationById } from '../services/ticketService'
import type { Reservation } from '../types/ticket.types'

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = () => {
    setLoading(true)
    setError(null)
    getReservations()
      .then(setReservations)
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  return { reservations, loading, error, retry: fetch }
}

export function useReservation(id: string | undefined) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    getReservationById(id)
      .then((r) => {
        if (!r) setError('Ticket not found')
        else setReservation(r)
      })
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [id])

  return { reservation, loading, error, retry: fetch }
}
