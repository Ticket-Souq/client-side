import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventApi } from "../../events/services/eventApi";
import { formatPrice } from "../../events/utils/eventFormatters";
import { releaseLocks } from "../../events/services/lockApi";
import { Modal } from "../../../shared/components";
import { loadReservation, clearReservation } from "../../../shared/booking/reservationStorage";
import type { EventFullResponse } from "../../events/types/event.types";
import styles from "../styles/tickets.module.css";

export default function MyReservations() {
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const stored = loadReservation();

  const expired = stored ? new Date(stored.expiresAt).getTime() <= Date.now() : false;

  useEffect(() => {
    if (!stored || expired) { setLoading(false); return; }

    EventApi.getById(stored.eventId)
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancelReservation = async () => {
    setCancelling(true);
    try { await releaseLocks(stored!.reservationId); } catch { /* ignore */ }
    clearReservation();
    setCancelled(true);
    setCancelling(false);
    setShowCancelModal(false);
  };

  if (!stored) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No active reservations</h2>
          <p>You don't have any reserved tickets waiting for payment.</p>
          <button className="btn btn-accent mt-3" onClick={() => navigate("/customer/events")}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (expired) {
    clearReservation();
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Reservation expired</h2>
          <p>Your reservation time has expired. Please select your tickets again.</p>
          <button className="btn btn-accent mt-3" onClick={() => navigate("/customer/events")}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Reservation cancelled</h2>
          <p>Your reservation has been released. You can make a new selection.</p>
          <button className="btn btn-accent mt-3" onClick={() => navigate("/customer/events")}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const expiresMs = new Date(stored.expiresAt).getTime();
  const timeLeftSec = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
  const timeLeftMin = Math.ceil(timeLeftSec / 60);
  const total = stored.tickets.reduce((s, t) => s + t.price, 0);

  return (
    <div className={`wrap ${styles.page}`}>
      <section className={styles.pageHead}>
        <h1 className={styles.pageTitle}>My Reservations</h1>
      </section>

      <div className={styles.group} style={{ padding: 20 }}>
        {event && <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{event.title}</h2>}

        <div style={{ fontSize: 14, color: "#726f63", marginBottom: 8 }}>
          {stored.tickets.length} ticket{stored.tickets.length > 1 ? "s" : ""}
          {total > 0 && ` \u00B7 ${formatPrice(total)}`}
        </div>

        <div style={{ fontSize: 13, color: timeLeftSec <= 300 ? "#dc2626" : "#059669", marginBottom: 20 }}>
          Expires in {timeLeftMin} min{timeLeftMin !== 1 ? "s" : ""}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn-accent"
            onClick={() => navigate("/customer/booking/checkout")}
          >
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
