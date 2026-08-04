import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { releaseLocks, beginReservation } from "../../events/services/lockApi";
import { formatPrice } from "../../../shared/format";
import { loadReservation, clearReservation } from "../../../shared/booking/reservationStorage";

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
      const expiresMs = new Date(stored.expiresAt).getTime();
      const initialSec = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      if (initialSec > 0) return { reservationId: stored.reservationId, initialSec };
    }
    return null;
  });

  const reservationId = state?.reservationId ?? reservation?.reservationId ?? null;
  const [timeLeft, setTimeLeft] = useState(reservation?.initialSec ?? 600);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handlePay = async () => {
    if (processing || expired || !reservationId || completedRef.current) return;
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

    completedRef.current = true;
    clearReservation();
    navigate("/customer/reservations");
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
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                  Confirm your reservation to complete payment. Your tickets will be issued once payment succeeds.
                </p>
                {error && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-accent w-100 py-2 fw-semibold"
                  disabled={processing}
                  onClick={handlePay}
                  style={{ fontSize: "15px" }}
                >
                  {processing ? "Processing payment…" : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
