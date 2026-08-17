import { request } from '../../../shared/http'
import { API } from '../../../shared/api'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentResponse {
  clientSecret: string | null;
  paymentID: string;
  paymentStatus: PaymentStatus;
  msg: string;
}

export function getPaymentForReservation(reservationId: string): Promise<PaymentResponse> {
  return request<PaymentResponse>(API.payment.byReservation(reservationId))
}