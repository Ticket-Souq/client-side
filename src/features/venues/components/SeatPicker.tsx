import { useCallback, useEffect, useMemo, useState } from "react";
import { getTemplateById } from "../api/venueApi";
import type { SeatMap, Category } from "./types";

interface SeatPickerProps {
  venueId: string;
  onSeatClick: (seat: SeatObject) => void;
  sections?: { seats: { id: string; templateSeatId: string | null; status: string }[] }[];
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

export function SeatPicker({ venueId, onSeatClick, sections }: SeatPickerProps) {
  const [map, setMap] = useState<SeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!venueId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const template = await getTemplateById(venueId);
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

  const takenTemplateIds: Set<string> = useMemo(() => {
    if (!sections) return new Set()
    const ids = new Set<string>()
    for (const sec of sections) {
      for (const seat of sec.seats) {
        if (seat.status !== 'AVAILABLE' && seat.templateSeatId) {
          ids.add(seat.templateSeatId)
        }
      }
    }
    return ids
  }, [sections])

  const seats: SeatObject[] = useMemo(() => {
    if (!map) return [];
    const catById = new Map(map.categories.map((c) => [c.id, c]));
    const result: SeatObject[] = [];
    for (const row of map.rows) {
      if (row.aisle) continue;
      row.cells.forEach((cell, ci) => {
        if (cell.type !== "seat") return;
        const cat = cell.categoryId ? catById.get(cell.categoryId) : undefined;
        const isTaken = takenTemplateIds.has(cell.id) || cell.status !== "available";
        result.push({
          id: cell.id,
          rowLabel: row.label,
          colNumber: Number(cell.number ?? (ci + 1)),
          status: isTaken ? "taken" : "available",
          categoryId: cat?.id ?? "",
          categoryColor: cat?.color ?? "#3b82f6",
        });
      });
    }
    return result;
  }, [map, takenTemplateIds]);

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

  const toggleSeat = useCallback((seat: SeatObject) => {
    if (seat.status === "taken") return;
    const isSelected = selectedIds.has(seat.id);
    if (isSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(seat.id);
        return next;
      });
      onSeatClick(seat);
    } else if (selectedIds.size >= MAX_SELECTION) {
      setRejectedId(seat.id);
      setTimeout(() => setRejectedId(null), 400);
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.add(seat.id);
        return next;
      });
      onSeatClick(seat);
    }
  }, [selectedIds, onSeatClick]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#726f63', fontSize: 14 }}>
        Loading seats...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#726f63', fontSize: 14 }}>
        No seats available
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 12 }}>
        {categories.map((c) => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c.color, display: 'inline-block' }} />
            {c.name}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#726f63' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: TAKEN_COLOR, display: 'inline-block' }} />
          Taken
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: SEL_COLOR, display: 'inline-block' }} />
          Selected
        </span>
      </div>

      <div style={{
        borderRadius: 8,
        background: '#1a1a1a',
        border: '1px solid #333',
        padding: 24,
        overflow: 'auto',
        maxWidth: '100%',
      }}>
        {rows.map(([label, rowSeats]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 24, fontSize: 11, color: '#9ca3af', textAlign: 'right', flexShrink: 0 }}>
              {label}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
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
                    onClick={() => toggleSeat(seat)}
                    disabled={isTaken}
                    title={isTaken ? "Taken" : `${seat.rowLabel}${seat.colNumber}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 600,
                      border: isRejected ? '2px solid #dc2626' : 'none',
                      color: '#fff',
                      backgroundColor: bgColor,
                      cursor: isTaken ? 'not-allowed' : 'pointer',
                      opacity: isTaken ? 0.6 : 1,
                      transition: 'transform 0.12s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: isSelected ? '2px solid #fff' : 'none',
                      outlineOffset: 1,
                    }}
                    onMouseEnter={(e) => { if (!isTaken) e.currentTarget.style.transform = 'scale(1.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
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