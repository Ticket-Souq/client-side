import { request } from '../../../shared/http'
import { API } from '../../../shared/api'

export type ReservationStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface ReservationResponse {
  id: string;
  userId: string;
  eventId: string;
  status: ReservationStatus;
  createdAt: string;
  completedAt: string | null;
}

export async function getMyReservations(): Promise<ReservationResponse[]> {
  return request<ReservationResponse[]>(API.reservations.list)
}
