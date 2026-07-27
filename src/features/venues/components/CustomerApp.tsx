import { useEffect, useMemo, useState, Fragment } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import "./seat-map.css";
import { listVenues, listVenueTemplates, getVenueTemplate } from "../api/venueApi";
import { authFetch } from "../../../shared/auth";
import { API } from "../../../shared/api";
import type { Venue, Category, SeatMap, VerticalAisle } from "./types";
import { LockedShell } from "./PublisherApp";

interface Props {
  onSignOut?: () => void;
}

export function CustomerApp({ onSignOut }: Props) {
  return <CustomerInner onSignOut={onSignOut} />;
}

function CustomerInner({
  onSignOut,
}: {
  onSignOut?: () => void;
}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [openVenue, setOpenVenue] = useState<SeatMap | null>(null);
  const [userName, setUserName] = useState("Customer");

  useEffect(() => {
    authFetch(API.users.profile)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setUserName(data.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    listVenues(0, 100)
      .then((res) => setVenues(res.content))
      .catch(() => setVenues([]));
  }, []);

  const openMap = async (id: string) => {
    try {
      const templates = await listVenueTemplates(id);
      if (templates.length === 0) return;
      const template = await getVenueTemplate(id, templates[0].id);
      const parsed = JSON.parse(template.layout) as SeatMap;
      if (parsed && parsed.rows) {
        setOpenVenue(parsed);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="venue-app flex-grow-1 w-100 d-flex flex-column">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-venue-800 bg-venue-900">
        <span className="text-xs uppercase tracking-widest text-sky font-semibold">
          Customer
        </span>
        <span className="text-sm text-venue-400">
          {userName}
        </span>
        <div className="flex-1" />
        {openVenue && (
          <button
            onClick={() => setOpenVenue(null)}
            className="venue-btn venue-btn-default"
          >
            <ArrowLeft size={14} /> All events
          </button>
        )}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="venue-btn venue-btn-default"
          >
            <LogOut size={14} /> Sign out
          </button>
        )}
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        {!openVenue ? (
          <BrowseList venues={venues} onOpen={openMap} />
        ) : (
          <BookingView map={openVenue} />
        )}
      </main>
    </div>
  );
}

function BrowseList({
  venues,
  onOpen,
}: {
  venues: Venue[];
  onOpen: (id: string) => void;
}) {
  if (venues.length === 0) {
    return (
      <div className="p-10 text-center text-venue-500 text-sm">
        No events available yet.
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Available events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((v) => (
          <button
            key={v.id}
            onClick={() => onOpen(v.id)}
            className="text-left rounded-lg border border-venue-800 bg-venue-900 hover:border-venue-600 p-4 transition"
          >
            <div className="font-semibold">{v.name}</div>
            <div className="text-xs text-venue-500 mt-1">
              {v.type}
            </div>
            {v.address && (
              <div className="text-xs text-venue-500 mt-1 truncate">
                {v.address}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingView({
  map,
}: {
  map: SeatMap;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const aislesByRowIndex = useMemo(() => {
    const result: VerticalAisle[][] = [];
    for (let ri = 0; ri < map.rows.length; ri++) {
      const aisles = map.verticalAisles.filter((va) => {
        if (va.startRowId) {
          const si = map.rows.findIndex((r) => r.id === va.startRowId);
          if (si === -1 || ri < si) return false;
        }
        if (va.endRowId) {
          const ei = map.rows.findIndex((r) => r.id === va.endRowId);
          if (ei === -1 || ri > ei) return false;
        }
        return true;
      });
      result.push(aisles);
    }
    return result;
  }, [map]);

  const catById = useMemo(() => {
    const m = new Map<string, Category>();
    map.categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [map]);

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold">{map.name}</h2>
        <span className="text-xs text-venue-500">
          Click available seats to book
        </span>
      </div>

      <div className="rounded-lg bg-venue-900 border border-venue-800 p-6 overflow-auto">
        {map.stage.position === "top" && <StagePill stage={map.stage.label} />}
        <div className="flex flex-col gap-1.5 items-center my-4">
          {map.rows.map((row, ri) => {
            const rowAisles = aislesByRowIndex[ri] ?? [];
            return (
              <div key={row.id} className="flex items-center gap-2">
                <span className="w-6 text-xs text-venue-500 text-right">
                  {row.aisle ? "" : row.label}
                </span>
                <div className={row.aisle ? "h-3" : "flex gap-1.5"}>
                  {!row.aisle &&
                    row.cells.map((c, i) => (
                      <Fragment key={c.id}>
                        {c.type === "space" ? (
                          <div className="w-6 h-6" />
                        ) : (
                          <button
                            onClick={() => toggle(c.id, false)}
                            title={`${catById.get(c.categoryId ?? "")?.name ?? "Seat"}`}
                            className={`w-6 h-6 rounded text-[9px] font-medium flex items-center justify-center transition ${
                              selected.has(c.id) ? "ring-2 ring-white text-white" : "hover:brightness-125"
                            }`}
                            style={{ backgroundColor: catById.get(c.categoryId ?? "")?.color ?? "#3b82f6" }}
                          >
                            {c.number}
                          </button>
                        )}
                        {rowAisles.filter((va) => va.columnIndex === i).map((va) => (
                          <div key={va.id} className="w-8 h-6" />
                        ))}
                      </Fragment>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
        {map.stage.position === "bottom" && (
          <StagePill stage={map.stage.label} />
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex gap-3 flex-wrap text-xs">
          {map.categories.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="text-sm">
          <span className="text-venue-400">
            {selected.size} seat{selected.size === 1 ? "" : "s"}
          </span>
        </div>
        <div className="text-xs text-venue-500 italic">
          Booking API not yet available
        </div>
      </div>
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  return (
    <div className="mx-auto w-fit px-8 py-1.5 rounded bg-venue-800 text-xs tracking-widest text-neutral-300">
      {stage}
    </div>
  );
}
