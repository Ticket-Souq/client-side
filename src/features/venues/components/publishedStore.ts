import type { SeatMap } from "./types";

/**
 * Shared local storage bridge between Publisher and Customer.
 * You can swap this out for a real backend later — the interface
 * is intentionally tiny: publish / list / get / book.
 */

const MAPS_KEY = "seatmap.published.v1";
const BOOKINGS_KEY = "seatmap.bookings.v1";

export interface PublishedMap {
  map: SeatMap;
  publisherId: string;
  publishedAt: number;
}

export interface Booking {
  id: string;
  mapId: string;
  customerId: string;
  seatIds: string[];
  total: number;
  createdAt: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function emit() {
  listeners.forEach((l) => l());
  // cross-tab
  try {
    window.dispatchEvent(new Event("seatmap:changed"));
  } catch {}
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export function listPublished(): PublishedMap[] {
  return read<PublishedMap[]>(MAPS_KEY, []);
}
export function getPublished(mapId: string): PublishedMap | undefined {
  return listPublished().find((p) => p.map.id === mapId);
}
export function publishMap(map: SeatMap, publisherId: string) {
  const all = listPublished();
  const idx = all.findIndex((p) => p.map.id === map.id);
  const entry: PublishedMap = { map, publisherId, publishedAt: Date.now() };
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  write(MAPS_KEY, all);
}
export function unpublishMap(mapId: string) {
  write(
    MAPS_KEY,
    listPublished().filter((p) => p.map.id !== mapId),
  );
}

export function listBookings(): Booking[] {
  return read<Booking[]>(BOOKINGS_KEY, []);
}
export function bookingsForMap(mapId: string): Booking[] {
  return listBookings().filter((b) => b.mapId === mapId);
}
export function bookedSeatIds(mapId: string): Set<string> {
  const s = new Set<string>();
  for (const b of bookingsForMap(mapId)) b.seatIds.forEach((id) => s.add(id));
  return s;
}
export function addBooking(b: Omit<Booking, "id" | "createdAt">): Booking {
  const full: Booking = { ...b, id: crypto.randomUUID(), createdAt: Date.now() };
  write(BOOKINGS_KEY, [...listBookings(), full]);
  return full;
}
