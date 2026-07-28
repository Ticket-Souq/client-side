import { authFetch } from "../../../shared/auth";
import { API } from "../../../shared/api";
import type {
  Venue,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueTemplate,
  PaginatedResponse,
} from "../components/types";

const BASE = API.venues.list;

/* ---------- Venue CRUD ---------- */

export async function createVenue(data: CreateVenueRequest): Promise<Venue> {
  const res = await authFetch(API.venues.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST venues ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getVenueById(id: string): Promise<Venue> {
  const res = await authFetch(API.venues.byId(id));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET venue ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listVenues(
  page: number,
  size: number,
): Promise<PaginatedResponse<Venue>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const res = await authFetch(`${BASE}?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET venues ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateVenue(
  id: string,
  data: UpdateVenueRequest,
): Promise<Venue> {
  const res = await authFetch(API.venues.update(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT venue ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVenue(id: string): Promise<void> {
  const res = await authFetch(API.venues.delete(id), { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE venue ${res.status}: ${text}`);
  }
}

/* ---------- Venue Template CRUD ---------- */

export async function listVenueTemplates(
  venueId: string,
): Promise<VenueTemplate[]> {
  const url = API.venues.templates(venueId);
  const res = await authFetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET templates ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createVenueTemplate(
  venueId: string,
  layout: string,
): Promise<VenueTemplate> {
  const url = API.venues.templates(venueId);
  const res = await authFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST template ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getVenueTemplate(
  venueId: string,
  templateId: string,
): Promise<VenueTemplate> {
  const url = API.venues.templateById(venueId, templateId);
  const res = await authFetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET template ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVenueTemplate(
  venueId: string,
  templateId: string,
): Promise<void> {
  const url = API.venues.templateById(venueId, templateId);
  const res = await authFetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE template ${res.status}: ${text}`);
  }
}

export async function getTemplateById(
  templateId: string,
): Promise<VenueTemplate> {
  const url = API.venues.templateById("venues",templateId);
  const res = await authFetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET template by id ${res.status}: ${text}`);
  }
  return res.json();
}
