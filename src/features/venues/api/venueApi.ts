import type {
  Venue,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueTemplate,
  PaginatedResponse,
} from "../components/types";

const BASE = "http://localhost:8081/api/v1/venue";

/* ---------- Venue CRUD ---------- */

export async function createVenue(data: CreateVenueRequest): Promise<Venue> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${BASE} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getVenueById(id: string): Promise<Venue> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${BASE}/${id} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listVenuesByOrg(
  orgId: string,
  page: number,
  size: number,
): Promise<PaginatedResponse<Venue>> {
  const params = new URLSearchParams({
    orgId,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${BASE} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateVenue(
  id: string,
  data: UpdateVenueRequest,
): Promise<Venue> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${BASE}/${id} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVenue(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${BASE}/${id} ${res.status}: ${text}`);
  }
}

/* ---------- Venue Template CRUD ---------- */

function templateUrl(venueId: string, templateId?: string): string {
  let url = `${BASE}/${encodeURIComponent(venueId)}/templates`;
  if (templateId) url += `/${encodeURIComponent(templateId)}`;
  return url;
}

export async function listVenueTemplates(
  venueId: string,
): Promise<VenueTemplate[]> {
  const url = templateUrl(venueId);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createVenueTemplate(
  venueId: string,
  layout: string,
): Promise<VenueTemplate> {
  const url = templateUrl(venueId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${url} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getVenueTemplate(
  venueId: string,
  templateId: string,
): Promise<VenueTemplate> {
  const url = templateUrl(venueId, templateId);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVenueTemplate(
  venueId: string,
  templateId: string,
): Promise<void> {
  const url = templateUrl(venueId, templateId);
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${url} ${res.status}: ${text}`);
  }
}
