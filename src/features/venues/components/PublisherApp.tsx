import { useState, useEffect, useCallback } from "react";
import "./seat-map.css";
import { SeatMapCreator } from "./SeatMapCreator";
import { useVenue, VenueProvider } from "../context/VenueContext";
import { createVenue, listVenues, deleteVenue, type VenueResponse } from "../api/venueApi";

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
  return (
    <VenueProvider>
      <PublisherInner publisher={publisher} onSignOut={onSignOut} />
    </VenueProvider>
  );
}

function PublisherInner({
  publisher,
  onSignOut,
}: {
  publisher: Publisher;
  onSignOut?: () => void;
}) {
  const { state } = useVenue();
  const map = state.map;
  const [publishing, setPublishing] = useState(false);
  const [venues, setVenues] = useState<VenueResponse[]>([]);

  const fetchVenues = useCallback(async () => {
    try {
      const list = await listVenues(publisher.id);
      setVenues(list);
    } catch {
      setVenues([]);
    }
  }, [publisher.id]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      const venue = await createVenue(map, publisher.id);
      alert(`Published "${venue.name}"`);
      await fetchVenues();
    } catch (e) {
      alert("Failed to publish: " + (e as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [map, publisher.id, fetchVenues]);

  const handleUnpublish = useCallback(async (id: string) => {
    try {
      await deleteVenue(id);
      await fetchVenues();
    } catch (e) {
      alert("Failed to unpublish: " + (e as Error).message);
    }
  }, [fetchVenues]);

  const isPublished = venues.some((v) => v.id === map.id);

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
          onClick={handlePublish}
          disabled={publishing}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-50"
        >
          {publishing ? "Publishing…" : isPublished ? "Update published" : "Publish map"}
        </button>
        {isPublished && (
          <button
            onClick={() => handleUnpublish(map.id)}
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
            My venues
          </h3>
          {venues.length === 0 && (
            <p className="text-xs text-neutral-500">Nothing published yet.</p>
          )}
          <ul className="space-y-2">
            {venues.map((v) => (
              <li key={v.id} className="rounded border border-neutral-800 bg-neutral-950 p-2 text-sm">
                <div className="font-medium truncate">{v.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {v.mode} · {new Date(v.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
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
