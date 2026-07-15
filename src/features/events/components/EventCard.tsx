import { useNavigate } from "react-router-dom";
import type { Event } from "../data/mockEvents";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="card h-100 border-0 shadow"
      style={{ cursor: "pointer" }}
    >
      <div
        className="px-4 pt-4 pb-3"
        style={{
          minHeight: "110px",
          background:
            "linear-gradient(135deg, var(--color-accent), var(--color-hero-blue))",
        }}
      >
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
        <h2
          className="h5 fw-bold mb-0 text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {event.title}
        </h2>
      </div>
      <div className="card-body d-flex flex-column gap-2 p-4">
        <div
          className="d-flex align-items-center gap-2 text-secondary-custom"
          style={{ fontSize: "13px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {new Date(event.dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div
          className="d-flex align-items-center gap-2 text-secondary-custom"
          style={{ fontSize: "13px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {new Date(event.dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div
          className="d-flex align-items-center gap-2 text-secondary-custom"
          style={{ fontSize: "13px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {event.venueName}
        </div>
        <p
          className="mt-1 mb-0 text-secondary-custom"
          style={{ fontSize: "13px", lineHeight: 1.6 }}
        >
          {event.description.length > 100
            ? event.description.slice(0, 100) + "…"
            : event.description}
        </p>
      </div>
    </div>
  );
}
