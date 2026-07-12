import { useCallback, useEffect, useMemo, useState } from "react";
import "./seat-map.css";
import { listVenueTemplates, getVenueTemplate } from "../api/venueApi";
import type { SeatMap, Category } from "./types";

interface SeatPickerProps {
  venueId: string;
  onSeatClick: (seat: SeatObject) => void;
}

export interface SeatObject {
  id: string;
  rowLabel: string;
  colNumber: number;
  status: "available" | "taken";
  categoryId: string;
  categoryColor: string;
}

const MAX_SELECTION = 5;
const SEL_COLOR = "#0d6efd";
const TAKEN_COLOR = "#6c757d";

export function SeatPicker({ venueId, onSeatClick }: SeatPickerProps) {
  const [map, setMap] = useState<SeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const templates = await listVenueTemplates(venueId);
        if (cancelled) return;
        if (templates.length === 0) {
          setError("No templates available for this venue");
          setLoading(false);
          return;
        }
        const template = await getVenueTemplate(venueId, templates[0].id);
        if (cancelled) return;
        const parsed = JSON.parse(template.layout) as SeatMap;
        if (parsed && parsed.rows) {
          setMap(parsed);
        } else {
          setError("Invalid template layout");
        }
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load venue");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [venueId]);

  const seats: SeatObject[] = useMemo(() => {
    if (!map) return [];
    const catById = new Map(map.categories.map((c) => [c.id, c]));
    const result: SeatObject[] = [];
    for (const row of map.rows) {
      if (row.aisle) continue;
      row.cells.forEach((cell, ci) => {
        if (cell.type !== "seat") return;
        const cat = cell.categoryId ? catById.get(cell.categoryId) : undefined;
        result.push({
          id: cell.id,
          rowLabel: row.label,
          colNumber: Number(cell.number ?? (ci + 1)),
          status: cell.status === "available" ? "available" : "taken",
          categoryId: cat?.id ?? "",
          categoryColor: cat?.color ?? "#3b82f6",
        });
      });
    }
    return result;
  }, [map]);

  const categories: Category[] = useMemo(() => map?.categories ?? [], [map]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectedId, setRejectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const m = new Map<string, SeatObject[]>();
    for (const seat of seats) {
      const list = m.get(seat.rowLabel);
      if (list) list.push(seat);
      else m.set(seat.rowLabel, [seat]);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const select = useCallback((seat: SeatObject) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(seat.id);
      return next;
    });
    onSeatClick(seat);
  }, [onSeatClick]);

  const deselect = useCallback((seat: SeatObject) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(seat.id);
      return next;
    });
    onSeatClick(seat);
  }, [onSeatClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent, seat: SeatObject) => {
    e.preventDefault();
    if (seat.status === "taken") return;
    const isSelected = selectedIds.has(seat.id);
    if (isSelected) {
      deselect(seat);
      return;
    }
    if (selectedIds.size >= MAX_SELECTION) {
      setRejectedId(seat.id);
      setTimeout(() => setRejectedId(null), 400);
      return;
    }
    select(seat);
  }, [selectedIds, select, deselect]);

  const handleClick = useCallback((seat: SeatObject) => {
    if (seat.status === "taken") return;
    if (!selectedIds.has(seat.id)) return;
    deselect(seat);
  }, [selectedIds, deselect]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <span className="text-sm text-neutral-400">Loading seats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10">
        <span className="text-sm text-red-400">{error}</span>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <span className="text-sm text-neutral-500">No seats available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4" style={{ fontFamily: "var(--font-body)" }}>
      <div className="flex gap-3 flex-wrap text-xs justify-center">
        {categories.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: c.color }}
            />
            {c.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-neutral-500">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TAKEN_COLOR }} />
          Taken
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: SEL_COLOR }} />
          Selected
        </span>
      </div>

      <div
        className="rounded-lg bg-neutral-900 border border-neutral-800 p-6 overflow-auto"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {rows.map(([label, rowSeats]) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <span className="w-6 text-xs text-neutral-500 text-right flex-shrink-0">
              {label}
            </span>
            <div className="flex gap-1.5">
              {rowSeats.map((seat) => {
                const isSelected = selectedIds.has(seat.id);
                const isTaken = seat.status === "taken";
                const isRejected = rejectedId === seat.id;
                let bgColor = seat.categoryColor;
                if (isTaken) bgColor = TAKEN_COLOR;
                if (isSelected) bgColor = SEL_COLOR;

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleClick(seat)}
                    onContextMenu={(e) => handleContextMenu(e, seat)}
                    disabled={isTaken}
                    title={
                      isTaken
                        ? "Taken"
                        : `${seat.rowLabel}${seat.colNumber}`
                    }
                    className={`w-7 h-7 rounded text-[9px] font-medium flex items-center justify-center transition select-none ${
                      isTaken
                        ? "cursor-not-allowed text-white"
                        : isSelected
                          ? "ring-2 ring-white text-white cursor-pointer"
                          : "hover:brightness-125 text-white cursor-pointer"
                    } ${isRejected ? "shake" : ""}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {seat.colNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
