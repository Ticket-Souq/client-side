import type { SeatMap } from "../components/types";

const BASE = "/api/v1/venue";

export interface VenueResponse {
  id: string;
  name: string;
  mode: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  layout?: SeatMap;
}

export async function createVenue(map: SeatMap, orgId: string): Promise<VenueResponse> {
  const body = JSON.stringify({ name: map.name, mode: map.mode, layout: map, orgId });
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${BASE} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listVenues(orgId: string): Promise<VenueResponse[]> {
  const res = await fetch(`${BASE}?orgId=${encodeURIComponent(orgId)}&size=100`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${BASE} ${res.status}: ${text}`);
  }
  const page = await res.json();
  return page.content ?? page;
}

export async function getVenue(id: string): Promise<VenueResponse> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${BASE}/${id} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateVenue(id: string, map: SeatMap): Promise<VenueResponse> {
  const body = JSON.stringify({ name: map.name, mode: map.mode, layout: map });
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${BASE}/${id} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVenue(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${BASE}/${id} ${res.status}: ${text}`);
  }
}
