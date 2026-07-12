export type CellType = "seat" | "space";
export type SeatStatus = "available" | "reserved" | "blocked" | "sold";

export interface Cell {
  id: string;
  type: CellType;
  number?: string;
  numberOverridden?: boolean;
  status?: SeatStatus;
  categoryId?: string;
}

export interface Row {
  id: string;
  label: string;
  labelOverridden?: boolean;
  cells: Cell[];
  /** numbering direction */
  reversed?: boolean;
  /** treat entire row as an aisle (no seats, small gap) */
  aisle?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface Stage {
  label: string;
  color: string;
  position: "top" | "bottom";
}

export interface VerticalAisle {
  id: string;
  columnIndex: number;       // 0-based cell position, aisle renders AFTER this cell
  startRowId: string | null; // null = from first row
  endRowId: string | null;   // null = to last row
}

export interface SeatMap {
  id: string;
  name: string;
  mode: MapMode;
  stage: Stage;
  categories: Category[];
  rows: Row[];
  verticalAisles: VerticalAisle[];
}


type MapMode = "SEAT_BASED" | "ZONE_BASED";

/* ---------- Venue metadata API types ---------- */

export type VenueType = "SEAT_BASED" | "ZONE_BASED";

export interface Venue {
  id: string;
  orgId: string;
  name: string;
  address: string;
  type: VenueType;
}

export interface CreateVenueRequest {
  orgId: string;
  name: string;
  address: string;
  type: VenueType;
}

export interface UpdateVenueRequest {
  name?: string;
  address?: string;
  type?: VenueType;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

export interface VenueTemplate {
  id: string;
  layout: string; // JSON-serialized SeatMap
}