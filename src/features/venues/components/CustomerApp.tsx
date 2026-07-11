import { useEffect, useMemo, useState, Fragment } from "react";
import "./seat-map.css";
import { listVenues, getVenue, type VenueResponse } from "../api/venueApi";
import type { Category, SeatMap, VerticalAisle } from "./types";
import { LockedShell } from "./PublisherApp";

export interface Customer {
  id: string;
  name?: string;
}

interface Props {
  customer?: Customer | null;
  onSignOut?: () => void;
}

export function CustomerApp({ customer, onSignOut }: Props) {
  if (!customer) {
    return (
      <LockedShell
        title="Customer area"
        message="Sign in as a customer to browse events and book seats."
      />
    );
  }
  return <CustomerInner customer={customer} onSignOut={onSignOut} />;
}

function CustomerInner({
  customer,
  onSignOut,
}: {
  customer: Customer;
  onSignOut?: () => void;
}) {
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [openVenue, setOpenVenue] = useState<SeatMap | null>(null);

  useEffect(() => {
    listVenues(customer.id)
      .then(setVenues)
      .catch(() => setVenues([]));
  }, [customer.id]);

  const openMap = async (id: string) => {
    try {
      const venue = await getVenue(id);
      if (venue.layout && venue.layout.rows) {
        setOpenVenue(venue.layout);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-grow-1 w-100 d-flex flex-column">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
          Customer
        </span>
        <span className="text-sm text-neutral-400">
          {customer.name ?? customer.id}
        </span>
        <div className="flex-1" />
        {openVenue && (
          <button
            onClick={() => setOpenVenue(null)}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            ← All events
          </button>
        )}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            Sign out
          </button>
        )}
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        {!openVenue ? (
          <BrowseList venues={venues} onOpen={openMap} />
        ) : (
          <BookingView map={openVenue} customerId={customer.id} />
        )}
      </main>
    </div>
  );
}

function BrowseList({
  venues,
  onOpen,
}: {
  venues: VenueResponse[];
  onOpen: (id: string) => void;
}) {
  if (venues.length === 0) {
    return (
      <div className="p-10 text-center text-neutral-500 text-sm">
        No events available yet.
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Available events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((v) => {
          const seats = v.layout?.rows?.reduce(
            (n, r) => n + r.cells.filter((c) => c.type === "seat").length,
            0,
          ) ?? 0;
          return (
            <button
              key={v.id}
              onClick={() => onOpen(v.id)}
              className="text-left rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-600 p-4 transition"
            >
              <div className="font-semibold">{v.name}</div>
              <div className="text-xs text-neutral-500 mt-1">
                {seats} seats
              </div>
              <div className="mt-3 flex gap-1 flex-wrap">
                {v.layout?.categories?.slice(0, 4).map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: c.color + "33", color: c.color }}
                  >
                    {c.name} ${c.price}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingView({
  map,
  customerId: _customerId,
}: {
  map: SeatMap;
  customerId: string;
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

  const total = useMemo(() => {
    let t = 0;
    for (const row of map.rows) {
      for (const c of row.cells) {
        if (c.type === "seat" && selected.has(c.id)) {
          t += catById.get(c.categoryId ?? "")?.price ?? 0;
        }
      }
    }
    return t;
  }, [selected, map, catById]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold">{map.name}</h2>
        <span className="text-xs text-neutral-500">
          Click available seats to book
        </span>
      </div>

      <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-6 overflow-auto">
        {map.stage.position === "top" && <StagePill stage={map.stage.label} />}
        <div className="flex flex-col gap-1.5 items-center my-4">
          {map.rows.map((row, ri) => {
            const rowAisles = aislesByRowIndex[ri] ?? [];
            return (
              <div key={row.id} className="flex items-center gap-2">
                <span className="w-6 text-xs text-neutral-500 text-right">
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
                            title={`${catById.get(c.categoryId ?? "")?.name ?? "Seat"} — $${catById.get(c.categoryId ?? "")?.price ?? 0}`}
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
              {c.name} · ${c.price}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="text-sm">
          <span className="text-neutral-400">
            {selected.size} seat{selected.size === 1 ? "" : "s"}
          </span>{" "}
          <span className="font-semibold ml-2">${total.toFixed(2)}</span>
        </div>
        <div className="text-xs text-neutral-500 italic">
          Booking API not yet available
        </div>
      </div>
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  return (
    <div className="mx-auto w-fit px-8 py-1.5 rounded bg-neutral-800 text-xs tracking-widest text-neutral-300">
      {stage}
    </div>
  );
}
