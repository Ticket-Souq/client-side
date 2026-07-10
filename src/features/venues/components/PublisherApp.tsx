import { useEffect, useState } from "react";
import "./seat-map.css";
import { SeatMapCreator } from "./SeatMapCreator";
import { useSeatMap } from "./store";
import {
  listPublished,
  publishMap,
  unpublishMap,
  subscribe,
  bookingsForMap,
  type PublishedMap,
} from "./publishedStore";

/**
 * Publisher-facing app.
 *
 * Auth: expects a `publisher` prop supplied by YOUR auth layer.
 * Render this component only after your publisher-role guard passes.
 * If no publisher is provided it renders a locked placeholder — plug
 * your own login flow in place of it.
 */
export interface Publisher {
  id: string;
  name?: string;
}

interface Props {
  publisher?: Publisher | null;
  onSignOut?: () => void;
}

export function PublisherApp({ publisher, onSignOut }: Props) {
  if (!publisher) {
    return (
      <LockedShell
        title="Publisher area"
        message="Sign in as a publisher to create and publish seat maps."
      />
    );
  }
  return <PublisherInner publisher={publisher} onSignOut={onSignOut} />;
}

function PublisherInner({
  publisher,
  onSignOut,
}: {
  publisher: Publisher;
  onSignOut?: () => void;
}) {
  const map = useSeatMap((s) => s.map);
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const mine = listPublished().filter((p) => p.publisherId === publisher.id);
  const isPublished = mine.some((p) => p.map.id === map.id);

  return (
    <div className="flex-grow-1 w-100 d-flex flex-column bg-neutral-950 text-neutral-100">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
          Publisher
        </span>
        <span className="text-sm text-neutral-400">
          {publisher.name ?? publisher.id}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => publishMap(map, publisher.id)}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
        >
          {isPublished ? "Update published" : "Publish map"}
        </button>
        {isPublished && (
          <button
            onClick={() => unpublishMap(map.id)}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            Unpublish
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

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0">
          <SeatMapCreator />
        </div>
        <aside className="w-72 border-l border-neutral-800 bg-neutral-900 p-3 overflow-auto">
          <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
            My published maps
          </h3>
          {mine.length === 0 && (
            <p className="text-xs text-neutral-500">Nothing published yet.</p>
          )}
          <ul className="space-y-2">
            {mine.map((p) => (
              <PublishedRow key={p.map.id} entry={p} />
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function PublishedRow({ entry }: { entry: PublishedMap }) {
  const bookings = bookingsForMap(entry.map.id);
  const seatsBooked = bookings.reduce((n, b) => n + b.seatIds.length, 0);
  const revenue = bookings.reduce((n, b) => n + b.total, 0);
  return (
    <li className="rounded border border-neutral-800 bg-neutral-950 p-2 text-sm">
      <div className="font-medium truncate">{entry.map.name}</div>
      <div className="text-xs text-neutral-500 mt-0.5">
        {seatsBooked} seat{seatsBooked === 1 ? "" : "s"} booked · $
        {revenue.toFixed(2)} revenue
      </div>
    </li>
  );
}

export function LockedShell({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex-grow-1 w-100 d-flex align-items-center justify-content-center bg-neutral-950 text-neutral-100">
      <div className="max-w-sm text-center px-6">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
          {title}
        </div>
        <p className="text-sm text-neutral-300">{message}</p>
        <p className="text-xs text-neutral-500 mt-4">
          Wire your own auth guard and pass the user into this component.
        </p>
      </div>
    </div>
  );
}
