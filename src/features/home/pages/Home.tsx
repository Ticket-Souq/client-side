import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../../shared/auth";
import { API } from "../../../shared/api";
import { mockEvents, type Event } from "../../events/data/mockEvents";

interface EventCardResponse {
  id: string;
  title: string;
  posterUrl: string;
  status: string;
  startDate: string;
}

function toEvent(r: EventCardResponse): Event {
  return {
    id: r.id,
    title: r.title,
    dateTime: r.startDate,
    venueId: "",
    venueName: "",
    description: "",
    category: "",
    mode: "seat",
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchResults = useCallback(async (t: string, o: string, c: string) => {
    if (!t && !o && !c) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (t) params.set("title", t);
      if (o) params.set("organization", o);
      if (c) params.set("category", c);
      const res = await authFetch(`${API.events.search}?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const body = await res.json();
      const content: EventCardResponse[] = body.content ?? [];
      setResults(content.map(toEvent));
    } catch {
      const filtered = mockEvents.filter((e) => {
        const matchTitle = !t || e.title.toLowerCase().includes(t.toLowerCase());
        const matchOrg = !o || e.venueName.toLowerCase().includes(o.toLowerCase());
        const matchCat = !c || e.category.toLowerCase().includes(c.toLowerCase());
        return matchTitle && matchOrg && matchCat;
      });
      setResults(filtered);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(title, organization, category);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, organization, category, fetchResults]);

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
            Explore Events
          </h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
            Find something you'll love
          </p>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Title
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: "14px" }}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Organization
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by organization…"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              style={{ fontSize: "14px" }}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Category
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by category…"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border" style={{ color: "var(--color-accent)" }} role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-5">
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
              No events found for your search.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <h5 className="fw-semibold mb-3" style={{ color: "var(--color-text)", fontSize: "16px" }}>
              Search Results
            </h5>
            <div className="row g-4">
              {results.map((event) => (
                <div key={event.id} className="col-12 col-sm-6 col-lg-4">
                  <EventCard event={event} onClick={() => navigate(`/customer/events/${event.id}`)} />
                </div>
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="row g-4">
            {sorted.map((event) => (
              <div key={event.id} className="col-12 col-sm-6 col-lg-4">
                <EventCard event={event} onClick={() => navigate(`/customer/events/${event.id}`)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      onClick={onClick}
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
        {event.category && (
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
        )}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {new Date(event.dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        {event.venueName && (
          <div
            className="d-flex align-items-center gap-2 text-secondary-custom"
            style={{ fontSize: "13px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.venueName}
          </div>
        )}
        {event.description && (
          <p
            className="mt-1 mb-0 text-secondary-custom"
            style={{ fontSize: "13px", lineHeight: 1.6 }}
          >
            {event.description.length > 100
              ? event.description.slice(0, 100) + "…"
              : event.description}
          </p>
        )}
      </div>
    </div>
  );
}
