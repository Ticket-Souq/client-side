import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "../data/mockEvents";
import { SeatPicker } from "../../venues/components/SeatPicker";
import type { SeatObject } from "../../venues/components/SeatPicker";

export default function EventSelect() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const event = useMemo(
    () => mockEvents.find((e) => e.id === eventId),
    [eventId],
  );

  const [selectedSeats, setSelectedSeats] = useState<SeatObject[]>([]);

  const handleSeatClick = useCallback((seat: SeatObject) => {
    setSelectedSeats((prev) => {
      const already = prev.find((s) => s.id === seat.id);
      if (already) return prev.filter((s) => s.id !== seat.id);
      return [...prev, seat];
    });
  }, []);

  if (!event) {
    return (
      <div className="container py-5 text-center text-secondary-custom">
        <h2>Event not found</h2>
        <button className="btn btn-accent mt-3" onClick={() => navigate("/events")}>
          ← Back to events
        </button>
      </div>
    );
  }

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <div className="hero-strip bg-noise py-4 text-white">
        <div className="container d-flex align-items-center gap-3">
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "13px",
            }}
            onClick={() => navigate(`/events/${event.id}`)}
          >
            ← Back
          </button>
          <div>
            <h1
              className="h4 fw-bold mb-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {event.title}
            </h1>
            <p className="mb-0" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              {event.venueName} — Select your seat
            </p>
          </div>
        </div>
      </div>

      <div className="container py-5 flex-grow-1 d-flex flex-column align-items-center">
        <SeatPicker venueId={event.venueId} onSeatClick={handleSeatClick} />

        {selectedSeats.length > 0 && (
          <div
            className="p-4 mt-4 w-100 shadow-card"
            style={{
              maxWidth: "500px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold" style={{ fontSize: "14px" }}>
                {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
              </span>
              <span className="fw-bold" style={{ fontSize: "18px", color: "var(--color-accent)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="text-secondary-custom" style={{ fontSize: "12px" }}>
              {selectedSeats.map((s) => `${s.rowLabel}${s.colNumber}`).join(", ")}
            </div>
            <button
              className="btn btn-accent w-100 mt-3 py-2 fw-semibold"
              style={{ fontSize: "15px" }}
              onClick={() =>
                navigate("/booking/checkout", {
                  state: {
                    seats: selectedSeats,
                    eventId: event.id,
                  },
                })
              }
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
