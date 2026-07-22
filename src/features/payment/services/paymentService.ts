import type { PaymentRequest, PaymentResponse } from "../types/paymentTypes";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081") +
  "/api/v1/payment";                     // ← Bug 1: path was missing

export async function createPaymentIntent(
  req: PaymentRequest,
): Promise<PaymentResponse> {

  const token = localStorage.getItem("auth_access_token");

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  const token = localStorage.getItem("auth_access_token");

  const res = await fetch(`${BASE_URL}/${paymentId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Get payment failed (${res.status})`);
  }

  return res.json();
}