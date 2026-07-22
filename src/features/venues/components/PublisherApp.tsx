import { useState, useEffect, useCallback } from "react";
import { PanelLeft, X, Plus, Trash2, LogOut } from "lucide-react";
import "./seat-map.css";
import { SeatMapCreator } from "./SeatMapCreator";
import { useVenue, VenueProvider, makeDefaultMap } from "../context/VenueContext";
import {
  createVenue,
  getVenueById,
  listVenuesByOrg,
  deleteVenue,
  listVenueTemplates,
  createVenueTemplate,
  getVenueTemplate,
  deleteVenueTemplate,
} from "../api/venueApi";
import type { Venue, VenueTemplate, VenueType, SeatMap } from "../components/types";

const ORG_ID = "550e8400-e29b-41d4-a716-446655440000";

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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<VenueTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [venueMeta, setVenueMeta] = useState({
    name: "",
    address: "",
    type: "SEAT_BASED" as VenueType,
  });
  const [venuesOpen, setVenuesOpen] = useState(true);
  const [showVenueModal, setShowVenueModal] = useState(false);

  const fetchVenues = useCallback(async () => {
    try {
      const res = await listVenuesByOrg(ORG_ID, 0, 50);
      setVenues(res.content);
    } catch {
      setVenues([]);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleLoadVenue = useCallback(
    async (id: string) => {
      try {
        const venue = await getVenueById(id);
        setVenueMeta({
          name: venue.name,
          address: venue.address,
          type: venue.type,
        });
        setEditingId(id);

        const list = await listVenueTemplates(id);
        setTemplates(list);
        if (list.length > 0) {
          const parsed = JSON.parse(list[0].layout) as SeatMap;
          dispatch({ type: "LOAD_MAP", map: parsed });
          setSelectedTemplateId(list[0].id);
        } else {
          dispatch({ type: "LOAD_MAP", map: makeDefaultMap() });
          setSelectedTemplateId(null);
        }
      } catch (e) {
        alert("Failed to load venue: " + (e as Error).message);
      }
    },
    [dispatch],
  );

  const handleNewVenue = useCallback(() => {
    setVenueMeta({ name: "", address: "", type: "SEAT_BASED" });
    setEditingId(null);
    setTemplates([]);
    setSelectedTemplateId(null);
    setShowVenueModal(true);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!editingId) return;
    setPublishing(true);
    try {
      const layoutMap = { ...map, id: crypto.randomUUID() };
      const template = await createVenueTemplate(
        editingId,
        JSON.stringify(layoutMap),
      );
      setSelectedTemplateId(template.id);

      const list = await listVenueTemplates(editingId);
      setTemplates(list);
      await fetchVenues();
      alert(`Saved "${venueMeta.name || map.name}"`);
    } catch (e) {
      alert("Failed to publish: " + (e as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [map, fetchVenues, editingId, venueMeta]);

  const handleUnpublish = useCallback(
    async (id: string) => {
      try {
        await deleteVenue(id);
        if (editingId === id) {
          setEditingId(null);
          setTemplates([]);
          setSelectedTemplateId(null);
        }
        await fetchVenues();
      } catch (e) {
        alert("Failed to unpublish: " + (e as Error).message);
      }
    },
    [fetchVenues, editingId],
  );

  const handleLoadTemplate = useCallback(
    async (templateId: string) => {
      if (!editingId) return;
      try {
        const template = await getVenueTemplate(editingId, templateId);
        const parsed = JSON.parse(template.layout) as SeatMap;
        dispatch({ type: "LOAD_MAP", map: parsed });
        setSelectedTemplateId(templateId);
      } catch (e) {
        alert("Failed to load template: " + (e as Error).message);
      }
    },
    [editingId, dispatch],
  );

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      if (!editingId) return;
      if (!confirm("Delete this template?")) return;
      try {
        await deleteVenueTemplate(editingId, templateId);
        const list = await listVenueTemplates(editingId);
        setTemplates(list);
        if (list.length > 0) {
          if (selectedTemplateId === templateId) {
            const parsed = JSON.parse(list[0].layout) as SeatMap;
            dispatch({ type: "LOAD_MAP", map: parsed });
            setSelectedTemplateId(list[0].id);
          }
        } else {
          dispatch({ type: "LOAD_MAP", map: makeDefaultMap() });
          setSelectedTemplateId(null);
        }
      } catch (e) {
        alert("Failed to delete template: " + (e as Error).message);
      }
    },
    [editingId, selectedTemplateId, dispatch],
  );

  return (
    <div className="venue-app flex-grow-1 w-100 d-flex flex-column bg-venue-950 text-venue-100">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b border-venue-800 bg-venue-900/80 backdrop-blur shadow-sm">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Publisher
        </span>
        <span className="text-sm text-venue-400">
          {publisher.name ?? publisher.id}
        </span>
        <button
          className="venue-btn venue-btn-ghost"
          onClick={() => setVenuesOpen((v) => !v)}
          title={venuesOpen ? "Hide venues" : "Show venues"}
        >
          <PanelLeft size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={handlePublish}
          disabled={publishing || !editingId}
          className="venue-btn venue-btn-primary"
        >
          {publishing ? "Saving…" : templates.length === 0 ? "Publish layout" : "Save new version"}
        </button>
        {editingId && (
          <button
            onClick={() => handleUnpublish(editingId)}
            disabled={publishing}
            className="venue-btn venue-btn-danger"
          >
            <Trash2 size={14} /> Delete venue
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

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <SeatMapCreator />
        </div>

        {venuesOpen && (
          <aside className="w-60 border-l border-venue-800 bg-venue-900 p-4 overflow-auto shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-venue-800">
              <h3 className="text-xs uppercase tracking-widest text-venue-500">
                My venues
              </h3>
              <button
                onClick={handleNewVenue}
                className="venue-btn venue-btn-primary"
              >
                <Plus size={14} /> New venue
              </button>
            </div>
            {venues.length === 0 && (
              <div className="rounded-lg border border-dashed border-venue-700 p-6 text-center">
                <p className="text-sm text-venue-300 mb-2">
                  No venues yet
                </p>
                <button
                  onClick={handleNewVenue}
                  className="venue-btn venue-btn-primary"
                >
                  Create your first venue
                </button>
              </div>
            )}
            <ul className="space-y-2">
              {venues.map((v) => (
                <li
                  key={v.id}
                  onClick={() => handleLoadVenue(v.id)}
                  className={`venue-card ${editingId === v.id ? "active" : ""}`}
                >
                  <div className="font-medium truncate">{v.name}</div>
                  <div className="text-xs text-venue-400 mt-1 flex gap-2">
                    <span className="capitalize">{v.type === "SEAT_BASED" ? "Seat map" : "Zone map"}</span>
                    {v.address && (
                      <>
                        <span className="text-venue-500">·</span>
                        <span className="truncate">{v.address}</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {editingId !== null && (
          <aside className="w-72 border-l border-venue-800 bg-venue-900 p-4 overflow-auto shadow-lg">
            <div className="mb-4 pb-3 border-b border-venue-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-widest text-venue-500">
                  Templates
                </h3>
                <span className="text-[10px] text-venue-500">
                  {templates.length}
                </span>
              </div>
              {templates.length === 0 && (
                <p className="text-xs text-venue-400">
                  No templates yet. Publish your first layout.
                </p>
              )}
              <ul className="space-y-1">
                {templates.map((t, i) => (
                  <li
                    key={t.id}
                    className={`flex items-center gap-1 rounded px-2 py-1.5 text-xs cursor-pointer transition-all ${
                      selectedTemplateId === t.id
                        ? "bg-accent-dim border-l-2 border-accent"
                        : "hover:bg-venue-800"
                    }`}
                  >
                    <span
                      className="flex-1 truncate"
                      onClick={() => handleLoadTemplate(t.id)}
                      title="Load this template"
                    >
                      Template {i + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(t.id);
                      }}
                      className="text-venue-500 hover:text-danger px-1 flex items-center justify-center"
                      title="Delete template"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {showVenueModal && (
        <VenueFormModal
          initial={venueMeta}
          onSave={async (meta) => {
            setShowVenueModal(false);
            setPublishing(true);
            try {
              const venue = await createVenue({ orgId: ORG_ID, ...meta });
              setVenueMeta(meta);
              setEditingId(venue.id);
              dispatch({ type: "LOAD_MAP", map: makeDefaultMap() });
              setTemplates([]);
              setSelectedTemplateId(null);
              await fetchVenues();
            } catch (e) {
              alert("Failed to create venue: " + (e as Error).message);
            } finally {
              setPublishing(false);
            }
          }}
          onCancel={() => setShowVenueModal(false)}
        />
      )}
    </div>
  );
}

function VenueFormModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: { name: string; address: string; type: VenueType };
  onSave: (data: { name: string; address: string; type: VenueType }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [type, setType] = useState(initial.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-venue-900 border border-venue-700 rounded-lg p-8 w-[440px] shadow-2xl">
        <h2 className="text-lg font-semibold text-venue-100 mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Create venue
        </h2>
        <input
          className="w-full px-3 py-2 rounded bg-venue-800 border border-venue-700 text-sm text-venue-100 placeholder-venue-500 mb-3"
          placeholder="Venue name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-2 rounded bg-venue-800 border border-venue-700 text-sm text-venue-100 placeholder-venue-500 mb-3"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select
          className="w-full px-3 py-2 rounded bg-venue-800 border border-venue-700 text-sm text-venue-100 mb-5"
          value={type}
          onChange={(e) => setType(e.target.value as VenueType)}
        >
          <option value="SEAT_BASED">Seat Based</option>
          <option value="ZONE_BASED">Zone Based</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="venue-btn venue-btn-default"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, address, type })}
            className="venue-btn venue-btn-primary"
          >
            Create venue
          </button>
        </div>
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
    <div className="venue-app flex-grow-1 w-100 d-flex align-items-center justify-content-center bg-venue-950 text-venue-100">
      <div className="max-w-sm text-center px-6">
        <div className="text-xs uppercase tracking-widest text-venue-500 mb-2">
          {title}
        </div>
        <p className="text-sm text-venue-300">{message}</p>
        <p className="text-xs text-venue-500 mt-4">
          Wire your own auth guard and pass the user into this component.
        </p>
      </div>
    </div>
  );
}
