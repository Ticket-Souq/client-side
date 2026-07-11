import { useState, useEffect, useCallback } from "react";
import "./seat-map.css";
import { SeatMapCreator } from "./SeatMapCreator";
import { useVenue, VenueProvider, makeDefaultMap } from "../context/VenueContext";
import {
  createVenue,
  listVenues,
  deleteVenue,
  getVenue,
  updateVenue,
  type VenueResponse,
} from "../api/venueApi";

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
  const { state, dispatch } = useVenue();
  const map = state.map;
  const [publishing, setPublishing] = useState(false);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleLoadVenue = useCallback(
    async (id: string) => {
      try {
        const venue = await getVenue(id);
        if (venue.layout) {
          dispatch({ type: "LOAD_MAP", map: venue.layout });
          setEditingId(id);
        } else {
          alert("Venue has no layout data");
        }
      } catch (e) {
        alert("Failed to load venue: " + (e as Error).message);
      }
    },
    [dispatch],
  );

  const handleNewVenue = useCallback(() => {
    dispatch({ type: "LOAD_MAP", map: makeDefaultMap() });
    setEditingId(null);
  }, [dispatch]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      if (editingId) {
        await updateVenue(editingId, map);
        alert(`Updated "${map.name}"`);
      } else {
        const venue = await createVenue(map, publisher.id);
        alert(`Published "${venue.name}"`);
      }
      await fetchVenues();
    } catch (e) {
      alert("Failed to publish: " + (e as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [map, publisher.id, fetchVenues, editingId]);

  const handleUnpublish = useCallback(
    async (id: string) => {
      try {
        await deleteVenue(id);
        if (editingId === id) {
          setEditingId(null);
        }
        await fetchVenues();
      } catch (e) {
        alert("Failed to unpublish: " + (e as Error).message);
      }
    },
    [fetchVenues, editingId],
  );

  return (
    <div className="flex-grow-1 w-100 d-flex flex-column bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur shadow-sm">
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
          {publishing ? "Saving…" : editingId ? "Update" : "Publish"}
        </button>
        {editingId && (
          <button
            onClick={() => handleUnpublish(editingId)}
            disabled={publishing}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm disabled:opacity-50"
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

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <SeatMapCreator />
        </div>
        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900 p-4 overflow-auto shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500">
              My venues
            </h3>
            <button
              onClick={handleNewVenue}
              className="text-xs px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-all"
            >
              + New
            </button>
          </div>
          {venues.length === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
              <p className="text-xs text-neutral-500">Nothing published yet.</p>
              <p className="text-xs text-neutral-600 mt-1">Edit a map and click Publish.</p>
            </div>
          )}
          <ul className="space-y-2">
            {venues.map((v) => (
              <li
                key={v.id}
                onClick={() => handleLoadVenue(v.id)}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition-all ${
                  editingId === v.id
                    ? "border-amber-500/30 bg-amber-900/15 border-l-2 border-amber-500 shadow-sm"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/50"
                }`}
              >
                <div className="font-medium truncate">{v.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
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
