import { useEffect, useMemo, useState } from "react";
import "./seat-map.css";
import {
  listPublished,
  bookedSeatIds,
  addBooking,
  subscribe,
  getPublished,
  listBookings,
} from "./publishedStore";
import type { Category, SeatMap } from "./types";
import { LockedShell } from "./PublisherApp";

/**
 * Customer-facing app.
 *
 * Auth: expects a `customer` prop supplied by YOUR auth layer.
 * Render only after your customer-role guard passes.
 */
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
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  const [openId, setOpenId] = useState<string | null>(null);

  const published = listPublished();
  const open = openId ? getPublished(openId) : undefined;

  return (
    <div className="flex-grow-1 w-100 d-flex flex-column bg-neutral-950 text-neutral-100">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
          Customer
        </span>
        <span className="text-sm text-neutral-400">
          {customer.name ?? customer.id}
        </span>
        <div className="flex-1" />
        {open && (
          <button
            onClick={() => setOpenId(null)}
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
        {!open ? (
          <BrowseList
            maps={published.map((p) => p.map)}
            onOpen={(id) => setOpenId(id)}
            customerId={customer.id}
          />
        ) : (
          <BookingView
            key={open.map.id}
            map={open.map}
            customerId={customer.id}
          />
        )}
      </main>
    </div>
  );
}

function BrowseList({
  maps,
  onOpen,
  customerId,
}: {
  maps: SeatMap[];
  onOpen: (id: string) => void;
  customerId: string;
}) {
  const myBookings = listBookings().filter((b) => b.customerId === customerId);
  if (maps.length === 0) {
    return (
      <div className="p-10 text-center text-neutral-500 text-sm">
        No events available yet. Come back once a publisher releases a seat map.
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Available events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {maps.map((m) => {
          const seats = m.rows.reduce(
            (n, r) => n + r.cells.filter((c) => c.type === "seat").length,
            0,
          );
          const taken = bookedSeatIds(m.id).size;
          return (
            <button
              key={m.id}
              onClick={() => onOpen(m.id)}
              className="text-left rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-600 p-4 transition"
            >
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-neutral-500 mt-1">
                {seats - taken} / {seats} seats available
              </div>
              <div className="mt-3 flex gap-1 flex-wrap">
                {m.categories.slice(0, 4).map((c) => (
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

      {myBookings.length > 0 && (
        <section className="mt-10">
          <h3 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">
            Your bookings
          </h3>
          <ul className="space-y-2">
            {myBookings.map((b) => {
              const p = getPublished(b.mapId);
              return (
                <li
                  key={b.id}
                  className="rounded border border-neutral-800 bg-neutral-900 p-3 text-sm flex justify-between"
                >
                  <span>{p?.map.name ?? "Removed event"}</span>
                  <span className="text-neutral-400">
                    {b.seatIds.length} seat
                    {b.seatIds.length === 1 ? "" : "s"} · ${b.total.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function BookingView({
  map,
  customerId,
}: {
  map: SeatMap;
  customerId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const taken = bookedSeatIds(map.id);
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

  const confirm = () => {
    if (selected.size === 0) return;
    addBooking({
      mapId: map.id,
      customerId,
      seatIds: [...selected],
      total,
    });
    setSelected(new Set());
  };

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
          {map.rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <span className="w-6 text-xs text-neutral-500 text-right">
                {row.aisle ? "" : row.label}
              </span>
              <div
                className={
                  row.aisle ? "h-3" : "flex gap-1.5"
                }
              >
                {!row.aisle &&
                  row.cells.map((c) => {
                    if (c.type === "space")
                      return <div key={c.id} className="w-6 h-6" />;
                    const isTaken = taken.has(c.id);
                    const isSel = selected.has(c.id);
                    const cat = catById.get(c.categoryId ?? "");
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggle(c.id, isTaken)}
                        disabled={isTaken}
                        title={
                          isTaken
                            ? "Taken"
                            : `${cat?.name ?? "Seat"} — $${cat?.price ?? 0}`
                        }
                        className={`w-6 h-6 rounded text-[9px] font-medium flex items-center justify-center transition ${
                          isTaken
                            ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                            : isSel
                              ? "ring-2 ring-white text-white"
                              : "hover:brightness-125 text-white/80"
                        }`}
                        style={{
                          backgroundColor: isTaken
                            ? undefined
                            : (cat?.color ?? "#3b82f6"),
                        }}
                      >
                        {c.number}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        {map.stage.position === "bottom" && (
          <StagePill stage={map.stage.label} />
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex gap-3 flex-wrap text-xs">
          {map.categories.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: c.color }}
              />
              {c.name} · ${c.price}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-neutral-500">
            <span className="w-3 h-3 rounded-sm bg-neutral-700" /> Taken
          </span>
        </div>
        <div className="flex-1" />
        <div className="text-sm">
          <span className="text-neutral-400">
            {selected.size} seat{selected.size === 1 ? "" : "s"}
          </span>{" "}
          <span className="font-semibold ml-2">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={confirm}
          disabled={selected.size === 0}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-sm font-medium"
        >
          Confirm booking
        </button>
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
