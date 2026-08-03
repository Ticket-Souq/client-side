import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EventApi } from "../../events/services/eventApi";
import { formatDateTime, formatPrice } from "../../../shared/format";
import { releaseLocks } from "../../events/services/lockApi";
import { getMyReservations, type ReservationResponse } from "../../booking/services/reservationApi";
import { Modal } from "../../../shared/components";
import { loadReservation, clearReservation } from "../../../shared/booking/reservationStorage";
import styles from "../styles/tickets.module.css";
import { StatusBadge, type StatusBadgeOption } from "../../../shared/components/display/StatusBadge/StatusBadge";

const RESERVATION_STATUS_OPTIONS: Record<string, StatusBadgeOption> = {
  PENDING: { label: "Pending Payment", variant: "orange" },
  COMPLETED: { label: "Completed", variant: "green" },
  CANCELLED: { label: "Cancelled", variant: "soft" },
  FAILED: { label: "Failed", variant: "red" },
};

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelledId, setCancelledId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const knownTitlesRef = useRef<Record<string, string>>({});
  const stored = loadReservation();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const active = stored && now > 0 && new Date(stored.expiresAt).getTime() > now ? stored : null;

  const enrichTitles = async (list: ReservationResponse[]) => {
    const missing = [...new Set(list.map((r) => r.eventId))].filter((id) => !knownTitlesRef.current[id]);
    if (missing.length === 0) return;
    const titles: Record<string, string> = {};
    await Promise.all(
      missing.map(async (id) => {
        try {
          const ev = await EventApi.getById(id);
          titles[id] = ev.title;
        } catch {
          titles[id] = "Event";
        }
      })
    );
    knownTitlesRef.current = { ...knownTitlesRef.current, ...titles };
    setEventTitles((prev) => ({ ...prev, ...titles }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getMyReservations();
        if (cancelled) return;
        await enrichTitles(list);
        if (cancelled) return;
        setReservations(list);
      } catch { /* backend unavailable; still show the active reservation */ }
      finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasPending = reservations.some((r) => r.status === "PENDING");

  useEffect(() => {
    if (!hasPending) return;
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const list = await getMyReservations();
        if (cancelled) return;
        await enrichTitles(list);
        if (cancelled) return;
        setReservations(list);
      } catch { /* keep polling until the reservation settles */ }
    }, 1500);
    return () => { cancelled = true; clearInterval(id); };
  }, [hasPending]);

  const handleCancelReservation = async () => {
    if (!active) return;
    setCancelling(true);
    try { await releaseLocks(active.reservationId); } catch { /* ignore */ }
    clearReservation();
    setCancelledId(active.reservationId);
    setCancelling(false);
    setShowCancelModal(false);
  };

  const visibleReservations = cancelledId
    ? reservations.filter((r) => r.id !== cancelledId)
    : reservations;

  const activeReservation = reservations.find((r) => r.id === active?.reservationId);

  const expiresMs = active ? new Date(active.expiresAt).getTime() : 0;
  const timeLeftSec = active ? Math.max(0, Math.floor((expiresMs - now) / 1000)) : 0;
  const timeLeftMin = Math.ceil(timeLeftSec / 60);
  const total = active ? active.tickets.reduce((s, t) => s + t.price, 0) : 0;

  if (loading) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!active && visibleReservations.length === 0) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No reservations yet</h2>
          <p>Reserve tickets for an event and they will show up here.</p>
          <button className="btn btn-accent mt-3" onClick={() => navigate("/customer/events")}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <section className={styles.pageHead}>
        <h1 className={styles.pageTitle}>My Reservations</h1>
      </section>

      {cancelledId && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 24,
            borderRadius: 8,
            background: "var(--success-soft)",
            border: "1px solid var(--success-bright)",
            fontSize: 14,
            color: "var(--success)",
          }}
        >
          Reservation cancelled. Your ticket locks have been released.
        </div>
      )}

      {active && (
        <div className={styles.resCard} style={{ marginBottom: 24 }}>
          <div className={styles.resCardBody}>
            <div className={styles.resInfo}>
              <h2 className={styles.resEvent}>
                {eventTitles[active.eventId] ?? "Event"}
                {activeReservation && (
                  <span style={{ marginLeft: 12, verticalAlign: "middle" }}>
                    <StatusBadge status={activeReservation.status} options={RESERVATION_STATUS_OPTIONS} />
                  </span>
                )}
              </h2>
              <div className={styles.resMeta}>
                <span>{active.tickets.length} ticket{active.tickets.length > 1 ? "s" : ""}</span>
                {total > 0 && <span>{formatPrice(total)}</span>}
                <span style={{ color: timeLeftSec <= 300 ? "#dc2626" : "#059669" }}>
                  Expires in {timeLeftMin} min{timeLeftMin !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className={styles.resAction} style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-accent" onClick={() => navigate("/customer/booking/checkout")}>
                Continue to Checkout
              </button>
              <button
                className="btn btn-ghost"
                disabled={cancelling}
                style={{ border: "1px solid var(--color-border)", cursor: cancelling ? "not-allowed" : "pointer" }}
                onClick={() => setShowCancelModal(true)}
              >
                {cancelling ? "Cancelling..." : "Cancel Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleReservations.length > 0 && (
        <div className={styles.reservationList}>
          {visibleReservations.map((r) => (
            <div key={r.id} className={styles.resCard}>
              <div className={styles.resCardBody}>
                <div className={styles.resInfo}>
                  <h2 className={styles.resEvent}>{eventTitles[r.eventId] ?? "Event"}</h2>
                  <div className={styles.resMeta}>
                    <span>Reserved {r.createdAt ? formatDateTime(r.createdAt) : ""}</span>
                    {r.completedAt && <span>Completed {formatDateTime(r.completedAt)}</span>}
                  </div>
                </div>
                <div className={styles.resSummary}>
                  <StatusBadge status={r.status} options={RESERVATION_STATUS_OPTIONS} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel reservation"
        actions={
          <>
            <button
              className="btn btn-ghost"
              style={{ border: "1px solid var(--color-border)", cursor: "pointer" }}
              onClick={() => setShowCancelModal(false)}
            >
              Keep reservation
            </button>
            <button
              className="btn btn-accent"
              style={{ cursor: cancelling ? "not-allowed" : "pointer" }}
              disabled={cancelling}
              onClick={handleCancelReservation}
            >
              {cancelling ? "Cancelling..." : "Cancel Reservation"}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Cancel this reservation and release your ticket locks?
        </p>
      </Modal>
    </div>
  );
}
