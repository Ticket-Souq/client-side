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