import { authFetch } from "../../../shared/auth";
import type { PaymentRequest, PaymentResponse } from "../types/paymentTypes";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081") +
  "/api/v1/payment";

export async function createPaymentIntent(
  req: PaymentRequest,
): Promise<PaymentResponse> {
  const res = await authFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Payment request failed (${res.status})`);
  }

  return res.json();
}

export async function getPaymentDetails(
  paymentId: string,
): Promise<PaymentResponse> {
  const res = await authFetch(`${BASE_URL}/${paymentId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Get payment failed (${res.status})`);
  }

  return res.json();
}
