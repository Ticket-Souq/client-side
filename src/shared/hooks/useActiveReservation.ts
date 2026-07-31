import { useSyncExternalStore } from 'react'
import { getHasActiveReservation, RESERVATION_CHANGED_EVENT } from '../booking/reservationStorage'

function subscribe(callback: () => void) {
  window.addEventListener(RESERVATION_CHANGED_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(RESERVATION_CHANGED_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useActiveReservation(): boolean {
  return useSyncExternalStore(subscribe, getHasActiveReservation)
}
