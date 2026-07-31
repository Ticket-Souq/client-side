import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../../payment/services/paymentService";
import { releaseLocks } from "../../events/services/lockApi";
import { formatPrice } from "../../events/utils/eventFormatters";
import { loadReservation, clearReservation } from "../../../shared/booking/reservationStorage";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "pk_test_xxxxxxxxx",
);

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

function TimerBanner({ timeLeft }: { timeLeft: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "10px 16px", marginBottom: 24, borderRadius: 8,
        background: timeLeft <= 120 ? "#fef2f2" : timeLeft <= 300 ? "#fffbeb" : "#f0fdf4",
        border: `1px solid ${timeLeft <= 120 ? "#fecaca" : timeLeft <= 300 ? "#fde68a" : "#bbf7d0"}`,
      }}
    >
      <span style={{ fontSize: 13, color: "#726f63" }}>Reservation lock</span>
      <span
        style={{
          fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: 1,
          color: timeLeft <= 120 ? "#dc2626" : timeLeft <= 300 ? "#d97706" : "#059669",
        }}
      >
        {formatTimer(timeLeft)}
      </span>
    </div>
  );
}

function CheckoutForm({
  reservationId, tickets, eventId, total, timedOut, setTimedOut,
}: {
  reservationId: string;
  tickets: TicketState[];
  eventId: string;
  total: number;
  timedOut: boolean;
  setTimedOut: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || timedOut) return;
    setLoading(true);
    setError(null);

    try {
      const payment = await createPaymentIntent({
        reservationID: reservationId,
        customerID: reservationId,
        eventID: eventId,
        amount: total,
        currency: "USD",
      });

      const submitResult = await elements.submit();
      if (submitResult.error) {
        setError(submitResult.error.message ?? "Payment validation failed");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret: payment.clientSecret,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/customer/booking/success`,
          },
        });

      if (confirmError) {
        setError(confirmError.message ?? "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        clearReservation();
        navigate("/customer/booking/success", {
          state: { paymentID: payment.paymentID, tickets, total },
        });
      } else {
        clearReservation();
        await releaseLocks(reservationId).catch(() => {});
        setTimedOut(true);
      }
    } catch (err) {
      clearReservation();
      await releaseLocks(reservationId).catch(() => {});
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (timedOut) {
    return (
      <div style={{ textAlign: "center", padding: 40, background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>Session expired</h2>
        <p style={{ fontSize: 14, color: "#726f63", margin: "0 0 16px" }}>Your reservation time has expired. Please go back and try again.</p>
        <button className="btn btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => navigate(`/events/${eventId}`)}>
          Back to event
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="container py-5">
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
                  {tickets.map((t, i) => (
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
                  EGP {total.toFixed(2)}
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
              <PaymentElement />
              {error && (
                <div className="alert alert-danger py-2 mt-3" style={{ fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-accent w-100 mt-3 py-2 fw-semibold"
                disabled={!stripe || loading || timedOut}
                style={{ fontSize: "15px" }}
              >
                {loading ? "Processing…" : `Pay EGP ${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
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
  const total = tickets.reduce((sum, t) => sum + t.price, 0);

  const [reservation] = useState<{ reservationId: string; initialSec: number } | null>(() => {
    const seatIds = tickets.map((t) => t.key);
    if (!tickets.length || !eventId || !bookingModel) return null;
    const saved = loadReservation();
    if (saved && saved.eventId === eventId && JSON.stringify(saved.seatIds) === JSON.stringify(seatIds)) {
      const expiresMs = new Date(saved.expiresAt).getTime();
      const initialSec = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      if (initialSec > 0) return { reservationId: saved.reservationId, initialSec };
    }
    return null;
  });

  const reservationId = state?.reservationId ?? reservation?.reservationId ?? null;
  const [timeLeft, setTimeLeft] = useState(reservation?.initialSec ?? 600);
  const [timedOut, setTimedOut] = useState(false);
  const releasedRef = useRef(false);

  const doRelease = useCallback(async (resId: string) => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    clearReservation();
    try { await releaseLocks(resId); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (timedOut || !reservationId) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      doRelease(reservationId);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, timedOut, reservationId, doRelease]);

  if (!tickets.length || !eventId || !bookingModel || !reservationId) {
    return (
      <div className="container py-5 text-center">
        <h2>No reservation data found</h2>
        <p style={{ color: "#726f63", fontSize: 14 }}>Please select your tickets again.</p>
        <button className="btn btn-accent mt-3" onClick={() => navigate("/")}>
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <main className="wrap zone-page" style={{ paddingTop: 24 }}>
      <TimerBanner timeLeft={timeLeft} />
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: Math.round(total * 100),
          currency: "usd",
        }}
      >
        <CheckoutForm
          reservationId={reservationId!}
          tickets={tickets}
          eventId={eventId}
          total={total}
          timedOut={timedOut}
          setTimedOut={setTimedOut}
        />
      </Elements>
    </main>
  );
}