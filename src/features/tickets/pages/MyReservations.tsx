import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EventApi } from "../../events/services/eventApi";
import { formatPrice } from "../../events/utils/eventFormatters";
import { releaseLocks } from "../../events/services/lockApi";
import { getMyReservations, type ReservationResponse } from "../../booking/services/reservationApi";
import { Modal } from "../../../shared/components";
import { loadReservation, clearReservation } from "../../../shared/booking/reservationStorage";
import styles from "../styles/tickets.module.css";

type StatusKey = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

const STATUS_LABELS: Record<StatusKey, string> = {
  PENDING: "Pending Payment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const STATUS_COLORS: Record<StatusKey, { text: string; bg: string; border: string }> = {
  PENDING: { text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  COMPLETED: { text: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  CANCELLED: { text: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
  FAILED: { text: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

function StatusBadge({ status }: { status: StatusKey }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.CANCELLED;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {status === "PENDING" && <span className={styles.dot} />}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${year} \u00B7 ${hours}:${minutes}`;
}

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
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 14,
            color: "#059669",
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
                    <StatusBadge status={activeReservation.status} />
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
                    <span>Reserved {formatDate(r.createdAt)}</span>
                    {r.completedAt && <span>Completed {formatDate(r.completedAt)}</span>}
                  </div>
                </div>
                <div className={styles.resSummary}>
                  <StatusBadge status={r.status} />
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
        <p style={{ fontSize: 14, color: "#726f63", margin: 0 }}>
          Cancel this reservation and release your ticket locks?
        </p>
      </Modal>
    </div>
  );
}
