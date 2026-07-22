export type PaymentStatus = "FAILED" | "PENDING" | "SUCCESS" | "REFUNDED";

export interface PaymentRequest {
  reservationID: string;
  customerID: string;
  eventID: string;
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentID: string;
  paymentStatus: PaymentStatus;
  msg: string;
}
