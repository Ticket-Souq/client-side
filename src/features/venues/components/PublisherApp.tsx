import { useState, useEffect, useCallback } from "react";

import "./seat-map.css";
import { SeatMapCreator } from "./SeatMapCreator";
import { useVenue, VenueProvider, makeDefaultMap } from "../context/VenueContext";
import { ToastContainer, toast } from "../../../shared/components/display/Toast/Toast";
import {
  getVenueById,
  listVenues,
  deleteVenue,
  listVenueTemplates,
  getVenueTemplate,
  createVenueTemplate,
  deleteVenueTemplate,
} from "../api/venueApi";
import type { Venue, VenueType, VenueTemplate, SeatMap } from "../components/types";

interface Props {
  initialVenueId?: string;
}

export function PublisherApp({ initialVenueId }: Props) {
  return (
    <VenueProvider>
      <PublisherInner initialVenueId={initialVenueId} />
      <ToastContainer />
    </VenueProvider>
  );
}

function PublisherInner({
  initialVenueId,
}: {
  initialVenueId?: string;
}) {
  const { state, dispatch } = useVenue();
  const map = state.map;
  const [publishing, setPublishing] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [templates, setTemplates] = useState<VenueTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [venueMeta, setVenueMeta] = useState({
    name: "",
    address: "",
    type: "SEAT_BASED" as VenueType,
  });
  const [venuesOpen, setVenuesOpen] = useState(true);

  const fetchVenues = useCallback(async () => {
    try {
      const res = await listVenues(0, 50);
      setVenues(res.content);
    } catch {
      setVenues([]);
    }
  }, []);

  const fetchTemplates = useCallback(async (venueId: string) => {
    try {
      const list = await listVenueTemplates(venueId);
      setTemplates(list);
    } catch {
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  useEffect(() => {
    if (initialVenueId) {
      handleLoadVenue(initialVenueId);
    }
  }, [initialVenueId]);

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
        } else {
          dispatch({ type: "LOAD_MAP", map: makeDefaultMap() });
        }
      } catch (e) {
        toast("Failed to load venue: " + (e as Error).message);
      }
    },
    [dispatch],
  );

  const handleLoadTemplate = useCallback(
    async (venueId: string, templateId: string) => {
      try {
        const template = await getVenueTemplate(venueId, templateId);
        const parsed = JSON.parse(template.layout) as SeatMap;
        dispatch({ type: "LOAD_MAP", map: parsed });
      } catch (e) {
        toast("Failed to load template: " + (e as Error).message);
      }
    },
    [dispatch],
  );

  const handleDeleteTemplate = useCallback(
    async (venueId: string, templateId: string) => {
      if (!confirm("Delete this template?")) return;
      try {
        await deleteVenueTemplate(venueId, templateId);
        await fetchTemplates(venueId);
      } catch (e) {
        toast("Failed to delete template: " + (e as Error).message);
      }
    },
    [fetchTemplates],
  );

  const handlePublish = useCallback(async () => {
    if (!editingId) return;
    const trimmedName = map.name.trim();
    if (!trimmedName) {
      toast("Template name cannot be empty.");
      return;
    }
    const existingNames = templates.map(
      (t) => (JSON.parse(t.layout) as SeatMap).name.trim().toLowerCase(),
    );
    if (existingNames.includes(trimmedName.toLowerCase())) {
      toast(`A template named "${trimmedName}" already exists.`);
      return;
    }
    setPublishing(true);
    try {
      const layoutMap = { ...map, id: crypto.randomUUID(), name: trimmedName };
      await createVenueTemplate(
        editingId,
        JSON.stringify(layoutMap),
      );

      await fetchTemplates(editingId);
      toast(`Saved "${trimmedName}"`, "success");
    } catch (e) {
      toast("Failed to publish: " + (e as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [map, fetchTemplates, editingId, venueMeta, templates]);

  const handleUnpublish = useCallback(
    async (id: string) => {
      try {
        await deleteVenue(id);
        if (editingId === id) {
          setEditingId(null);
          setTemplates([]);
        }
        await fetchVenues();
      } catch (e) {
        toast("Failed to unpublish: " + (e as Error).message);
      }
    },
    [fetchVenues, editingId],
  );

  return (
    <div className="venue-app flex-grow-1 w-100 d-flex flex-column bg-venue-950 text-venue-100">
      <SeatMapCreator
        onPublish={editingId ? handlePublish : undefined}
        venuesOpen={venuesOpen}
        onToggleVenues={() => setVenuesOpen((v) => !v)}
        editingId={editingId}
        templates={templates}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
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
