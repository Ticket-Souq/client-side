import { useState } from "react";

interface Reservation {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: string;
  ticketCount: number;
  createdAt: string;
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "res-1",
    eventTitle: "Jazz Night Under the Stars",
    eventDate: "2026-08-15T20:00:00",
    status: "CONFIRMED",
    ticketCount: 2,
    createdAt: "2026-07-10T14:30:00",
  },
  {
    id: "res-2",
    eventTitle: "Hamlet – A Modern Revival",
    eventDate: "2026-09-10T19:30:00",
    status: "PENDING",
    ticketCount: 1,
    createdAt: "2026-07-12T09:15:00",
  },
];

export default function Reservations() {
  const [reservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
        My Reservations
      </h2>
      <div style={{ position: "relative" }}>
        {reservations.map((r, i) => (
          <div key={r.id} className="d-flex gap-3 pb-4" style={{ position: "relative" }}>
            <div className="d-flex flex-column align-items-center" style={{ width: "20px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: r.status === "CONFIRMED" ? "var(--color-accent)" : "#ccc",
                  border: "3px solid #fff",
                  boxShadow: "0 0 0 2px var(--color-accent)",
                  zIndex: 1,
                }}
              />
              {i < reservations.length - 1 && (
                <div style={{ width: "2px", flexGrow: 1, backgroundColor: "#e0e0e0" }} />
              )}
            </div>
            <div className="flex-grow-1 pb-3">
              <div
                className="card border-0 shadow-sm p-3"
                style={{ borderRadius: "8px" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                      {r.eventTitle}
                    </h6>
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor:
                          r.status === "CONFIRMED" ? "#16A34A" : "#F59E0B",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "11px",
                        borderRadius: "4px",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
                  >
                    {r.ticketCount} ticket{r.ticketCount > 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className="mt-2"
                  style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
                >
                  {new Date(r.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
