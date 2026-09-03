import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { releaseLocks, beginReservation } from "../../events/services/lockApi";
import { formatPrice } from "../../../shared/format";
import { getPaymentForReservation } from "../services/paymentApi";
import { getStripe, hasStripeKey } from "../../../shared/stripe";
import { loadReservation, clearReservation, parseExpiresAt } from "../../../shared/booking/reservationStorage";
import { createPortal } from "react-dom";

interface TicketState {
  key: string;
  label: string;
  sectionName: string;
  price: number;
  sectionId: string;
}

interface LocationState {
  reservationId?: string;
  tickets: TicketState[];
  eventId: string;
  bookingModel: string;
  holderNames: Record<string, string>;
}

function formatTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollPayment(
  reservationId: string,
  timeoutMs = 20000,
  intervalMs = 1500
): Promise<Awaited<ReturnType<typeof getPaymentForReservation>> | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return await getPaymentForReservation(reservationId);
    } catch {
      // payment row is created asynchronously by the saga; keep polling
    }
    await sleep(intervalMs);
  }
  return null;
}

async function waitForPaymentSuccess(reservationId: string, timeoutMs = 20000, intervalMs = 1500): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const payment = await getPaymentForReservation(reservationId);
      if (payment.paymentStatus === "SUCCESS") return true;
      if (payment.paymentStatus === "FAILED") return false;
    } catch {
      // ignore transient errors and keep polling
    }
    await sleep(intervalMs);
  }
  return false;
}

function TimerBanner({ timeLeft }: { timeLeft: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "10px 16px", marginBottom: 24, borderRadius: 8,
        background: timeLeft <= 120 ? "var(--danger-soft)" : timeLeft <= 300 ? "var(--warning-soft)" : "var(--success-soft)",
        border: `1px solid ${timeLeft <= 120 ? "var(--danger-border)" : timeLeft <= 300 ? "var(--warning-bright)" : "var(--success-bright)"}`,
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Reservation lock</span>
      <span
        style={{
          fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: 1,
          color: timeLeft <= 120 ? "var(--danger)" : timeLeft <= 300 ? "var(--warning)" : "var(--success)",
        }}
      >
        {formatTimer(timeLeft)}
      </span>
    </div>
  );
}

interface StripeCheckoutFormProps {
  reservationId: string;
  total: number;
  ticketCount: number;
  onPaid: () => void;
  onFailed: (message: string) => void;
  onCancel: () => void;
}

function StripeCheckoutForm({
  reservationId,
  total,
  ticketCount,
  onPaid,
  onFailed,
  onCancel,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const completedRef = useRef(false);

  const handlePay = async () => {
    if (!stripe || !elements || submitting || completedRef.current) return;
    setSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/customer/booking/success",
      },
      redirect: "if_required",
    });

    if (result.error) {
      setSubmitting(false);
      onFailed(result.error.message ?? "Payment failed. Please try again.");
      return;
    }

    if ((result.paymentIntent as PaymentIntent | undefined)?.status === "succeeded") {
      completedRef.current = true;
      const confirmed = await waitForPaymentSuccess(reservationId);
      if (!confirmed) {
        setSubmitting(false);
        onFailed("Payment was received but could not be confirmed. Please check your reservations shortly.");
        return;
      }
      onPaid();
      return;
    }

    setSubmitting(false);
    onFailed("Payment is still processing. Please check your reservations shortly.");
  };

  return (
    <>
      {!stripe && (
        <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>
          Payment form failed to load. Please refresh and try again, or cancel this reservation.
        </div>
      )}
      <PaymentElement options={{ layout: "tabs" }} />
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        You are paying for {ticketCount} ticket{ticketCount !== 1 ? "s" : ""} totalling{" "}
        <strong style={{ color: "var(--color-accent)" }}>{formatPrice(total)}</strong>.
      </div>
      {submitting && (
        <div className="alert alert-info py-2 mt-3" style={{ fontSize: "13px" }}>
          Processing your payment… please don&apos;t close this page.
        </div>
      )}
      <button
        type="button"
        className="btn btn-accent w-100 py-2 fw-semibold"
        disabled={!stripe || submitting}
        onClick={handlePay}
        style={{ fontSize: "15px", marginTop: 16 }}
      >
        {submitting ? "Processing payment…" : `Pay ${formatPrice(total)}`}
      </button>
      <button
        type="button"
        className="btn btn-danger w-100 py-2 mt-2"
        disabled={submitting}
        onClick={onCancel}
        style={{ fontSize: "14px" }}
      >
        Cancel reservation
      </button>
    </>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };

  // Prefer location state, fall back to stored reservation
  const saved = loadReservation();
  const tickets = state?.tickets?.length ? state.tickets : (saved?.tickets ?? []);
  const eventId = state?.eventId ?? saved?.eventId ?? "";
  const bookingModel = state?.bookingModel ?? saved?.bookingModel ?? "";
  const holderNames = state?.holderNames ?? saved?.holderNames ?? {};
  const total = tickets.reduce((sum, t) => sum + t.price, 0);

  const [reservation] = useState<{ reservationId: string; initialSec: number } | null>(() => {
    const seatIds = tickets.map((t) => t.key);
    if (!tickets.length || !eventId || !bookingModel) return null;
    const stored = loadReservation();
    if (stored && stored.eventId === eventId && JSON.stringify(stored.seatIds) === JSON.stringify(seatIds)) {
      const expiresMs = parseExpiresAt(stored.expiresAt);
      const initialSec = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      if (initialSec > 0) return { reservationId: stored.reservationId, initialSec };
    }
    return null;
  });

  const reservationId = state?.reservationId ?? reservation?.reservationId ?? null;
  const [timeLeft, setTimeLeft] = useState(reservation?.initialSec ?? 600);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmKind, setConfirmKind] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const releasedRef = useRef(false);
  const completedRef = useRef(false);
  const expired = timeLeft <= 0;

  const releaseOnce = useCallback((resId: string) => {
    if (releasedRef.current) return false;
    releasedRef.current = true;
    clearReservation();
    releaseLocks(resId).catch(() => {});
    return true;
  }, []);

  useEffect(() => {
    if (!reservationId || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 1 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [reservationId, timeLeft]);

  useEffect(() => {
    if (!reservationId || timeLeft > 0) return;
    releaseOnce(reservationId);
  }, [reservationId, timeLeft, releaseOnce]);

  const goToSuccess = () => {
    completedRef.current = true;
    clearReservation();
    navigate("/customer/booking/success", {
      state: {
        reservationId,
        tickets: tickets.map((t) => ({ label: t.label, sectionName: t.sectionName, price: t.price })),
        total,
        eventId,
      },
    });
  };

  const handlePaid = () => {
    goToSuccess();
  };

  const handlePay = () => {
    if (processing || expired || !reservationId || completedRef.current) return;
    setConfirmKind("pay");
  };

  const confirmPay = async () => {
    if (processing || expired || !reservationId || completedRef.current) return;
    setConfirmKind(null);
    setProcessing(true);
    setError(null);

    const ticketInputs = tickets.map((t) => ({
      ...(bookingModel === "ZONE" ? { sectionId: t.sectionId } : { seatId: t.key }),
      holderName: holderNames[t.key] ?? "",
      label: t.label,
    }));

    try {
      await beginReservation({ eventId, reservationId, tickets: ticketInputs });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start reservation");
      setProcessing(false);
      releaseOnce(reservationId);
      return;
    }

    const payment = await pollPayment(reservationId);
    if (!payment) {
      setError("Payment could not be initiated. Please try again or cancel this reservation.");
      setProcessing(false);
      return;
    }

    if (payment.paymentStatus === "SUCCESS") {
      setProcessing(false);
      goToSuccess();
      return;
    }

    if (payment.paymentStatus === "FAILED") {
      setError("Payment failed. Please try again or cancel this reservation.");
      setProcessing(false);
      return;
    }

    if (payment.paymentStatus === "PENDING" && payment.clientSecret) {
      if (!hasStripeKey()) {
        setError("Stripe payments are not configured. Please try again later or cancel this reservation.");
        setProcessing(false);
        return;
      }
      setStripeClientSecret(payment.clientSecret);
      setProcessing(false);
      return;
    }

    setError("Payment is still processing but no payment method was created yet. Please try again in a moment or cancel this reservation.");
    setProcessing(false);
  };

  const handleCancelReservation = () => {
    if (!reservationId || processing || cancelling || completedRef.current) return;
    setConfirmKind("cancel");
  };

  const confirmCancelReservation = () => {
    if (!reservationId) return;
    setConfirmKind(null);
    setCancelling(true);
    releaseOnce(reservationId);
    navigate(`/events/${eventId}`);
  };

  if (!tickets.length || !eventId || !bookingModel || !reservationId) {
    return (
      <div className="container py-5 text-center">
        <h2>No reservation data found</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Please select your tickets again.</p>
        <button className="btn btn-accent mt-3" onClick={() => navigate("/")}>
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <main className="wrap zone-page" style={{ paddingTop: 24 }}>
      <TimerBanner timeLeft={timeLeft} />

      {expired ? (
        <div style={{ textAlign: "center", padding: 40, background: "var(--danger-soft)", borderRadius: 12, border: "1px solid var(--danger-border)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--danger)", margin: "0 0 8px" }}>Session expired</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px" }}>Your reservation time has expired. Please go back and try again.</p>
          <button className="btn btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => navigate(`/events/${eventId}`)}>
            Back to event
          </button>
        </div>
      ) : (
        <div className="container-fluid px-0">
          <div className="row justify-content-center g-4">
            <div className="col-lg-5">
              <div
                className="p-4 shadow-card"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h5 className="fw-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Order Summary
                </h5>
                <p className="fw-semibold mb-2" style={{ fontSize: "13px" }}>
                  Tickets ({tickets.length})
                </p>
                <div className="mb-3" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {tickets.map((t) => (
                      <li key={t.key}>
                        {t.label}{t.sectionName ? ` (${t.sectionName})` : ""}
                        {t.price > 0 && ` — ${formatPrice(t.price)}`}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="d-flex justify-content-between fw-bold" style={{ fontSize: "15px" }}>
                  <span>Total</span>
                  <span style={{ color: "var(--color-accent)" }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div
                className="p-4 shadow-card"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h5 className="fw-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Payment
                </h5>
                {error && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>
                    {error}
                  </div>
                )}

                {stripeClientSecret ? (
                  <Elements stripe={getStripe()} options={{ clientSecret: stripeClientSecret }}>
                    <StripeCheckoutForm
                      reservationId={reservationId}
                      total={total}
                      ticketCount={tickets.length}
                      onPaid={handlePaid}
                      onFailed={(msg) => setError(msg)}
                      onCancel={confirmCancelReservation}
                    />
                  </Elements>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                      Confirm your reservation to complete payment. Your tickets will be issued once payment succeeds.
                    </p>
                    <button
                      type="button"
                      className="btn btn-accent w-100 py-2 fw-semibold"
                      disabled={processing}
                      onClick={handlePay}
                      style={{ fontSize: "15px" }}
                    >
                      {processing ? "Processing payment…" : `Pay ${formatPrice(total)}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger w-100 py-2 mt-2"
                      disabled={processing || cancelling}
                      onClick={handleCancelReservation}
                      style={{ fontSize: "14px" }}
                    >
                      {cancelling ? "Cancelling…" : "Cancel reservation"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!stripeClientSecret && confirmKind && createPortal(
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setConfirmKind(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--white)", borderRadius: 16, padding: 28, maxWidth: 460, width: "100%", boxSizing: "border-box", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}
          >
            {confirmKind === "pay" ? (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Confirm payment</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                  You are about to pay <strong>{formatPrice(total)}</strong> for {tickets.length} ticket{tickets.length > 1 ? "s" : ""}.{" "}
                  <strong>You will not be able to refund these tickets</strong> once the payment is completed.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmKind(null)}>
                    Go back
                  </button>
                  <button type="button" className="btn btn-accent btn-sm" onClick={confirmPay}>
                    {processing ? "Processing…" : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Cancel reservation</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                  Cancel this reservation? Your selected seats will be released so you can make a new selection.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmKind(null)}>
                    Keep reservation
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={confirmCancelReservation}>
                    Cancel reservation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </main>
  );
}