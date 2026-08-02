import { authFetch } from "../../../shared/auth";
import { parseError } from "../../../shared/apiError";
import { API } from "../../../shared/api";

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
  const res = await authFetch(API.reservations.list);
  if (!res.ok) {
    const err = await parseError(res);
    throw new Error(err.message);
  }
  return res.json();
}
