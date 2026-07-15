import { useMemo } from "react";
import { mockEvents } from "../data/mockEvents";
import EventCard from "../components/EventCard";

export default function EventList() {
  const sorted = useMemo(
    () => [...mockEvents].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [],
  );

  return (
    <div className="min-vh-100 d-flex flex-column">
      <div
        className="py-5 text-white"
        style={{
          background: "linear-gradient(135deg, var(--color-accent), var(--color-hero-blue))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container">
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "32px" }}>
            Events
          </h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
            Find something you'll love
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          {sorted.map((event) => (
            <div key={event.id} className="col-12 col-sm-6 col-lg-4">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
