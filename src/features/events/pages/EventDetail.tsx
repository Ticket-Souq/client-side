import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "../data/mockEvents";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const event = useMemo(
    () => mockEvents.find((e) => e.id === eventId),
    [eventId],
  );

  if (!event) {
    return (
      <div className="container py-5 text-center text-secondary-custom">
        <h2>Event not found</h2>
        <p className="mt-2">This event doesn't exist or has been removed.</p>
        <button className="btn btn-accent mt-3" onClick={() => navigate("/events")}>
          ← Back to events
        </button>
      </div>
    );
  }

  const dateStr = new Date(event.dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(event.dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-vh-100 d-flex flex-column">
      <div className="hero-strip bg-noise py-5 text-white">
        <div className="container">
          <span
            className="badge mb-2 px-2 py-1"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-text)",
              fontWeight: 600,
              fontSize: "11px",
              borderRadius: "4px",
            }}
          >
            {event.category}
          </span>
          <h1
            className="fw-bold mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "34px" }}
          >
            {event.title}
          </h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
            {event.venueName}
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-12 col-lg-7">
            <div
              className="p-4 shadow-card"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <h5
                className="fw-semibold mb-3"
                style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}
              >
                About this event
              </h5>
              <p className="text-secondary-custom" style={{ lineHeight: 1.7, fontSize: "14px" }}>
                {event.description}
              </p>
            </div>

            <div
              className="p-4 mt-4 shadow-card"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <h5
                className="fw-semibold mb-3"
                style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}
              >
                Date & Time
              </h5>
              <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>{dateStr}</span>
              </div>
              <div className="d-flex align-items-center gap-3" style={{ fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div
              className="p-4 shadow-card"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                position: "sticky",
                top: "24px",
              }}
            >
              <h5
                className="fw-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}
              >
                {event.title}
              </h5>
              <p className="mb-3 text-secondary-custom" style={{ fontSize: "13px" }}>
                {event.venueName}
              </p>
              <hr style={{ borderColor: "var(--color-border)", margin: "16px 0" }} />
              <button
                className="btn btn-accent w-100 py-2 fw-semibold"
                style={{ fontSize: "15px" }}
                onClick={() => navigate(`/events/${event.id}/select`)}
              >
                Select Seats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
