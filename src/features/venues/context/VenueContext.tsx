import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type { Category, Cell, Row, SeatMap, SeatStatus, Stage, VerticalAisle } from "../components/types";

export { renumber, makeSeat, makeSpace, makeSeatedRow, makeEmptyRow, makeAisleRow, makeDefaultMap };

const alpha = (i: number): string => {
  let n = i;
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
};

function renumber(map: SeatMap): SeatMap {
  const rows = map.rows.map((r, ri) => {
    const label = r.labelOverridden ? r.label : alpha(ri);
    const seatCells = r.cells.filter((c) => c.type === "seat");
    const order = r.reversed ? [...seatCells].reverse() : seatCells;
    const numbered = new Map<string, string>();
    order.forEach((c, i) => numbered.set(c.id, String(i + 1)));
    const cells = r.cells.map((c) =>
      c.type === "seat"
        ? { ...c, number: c.numberOverridden ? c.number : numbered.get(c.id) }
        : c,
    );
    return { ...r, label, cells };
  });
  return { ...map, rows };
}

const defaultCategories = (): Category[] => [
  { id: uuid(), name: "Standard", color: "#3b82f6", price: 25 },
  { id: uuid(), name: "Premium", color: "#a855f7", price: 45 },
  { id: uuid(), name: "VIP", color: "#f59e0b", price: 80 },
];

function makeSeat(categoryId?: string): Cell {
  return { id: uuid(), type: "seat", status: "available", categoryId };
}

function makeSpace(): Cell {
  return { id: uuid(), type: "space" };
}

function makeSeatedRow(count = 12, categoryId?: string): Row {
  return {
    id: uuid(),
    label: "",
    cells: Array.from({ length: count }, () => makeSeat(categoryId)),
  };
}

function makeEmptyRow(): Row {
  return { id: uuid(), label: "", cells: [] };
}

function makeAisleRow(): Row {
  return { id: uuid(), label: "", cells: [], aisle: true };
}

function makeDefaultMap(): SeatMap {
  const cats = defaultCategories();
  const rows: Row[] = [];
  for (let i = 0; i < 5; i++) rows.push(makeSeatedRow(14, cats[0].id));
  rows.push(makeAisleRow());
  for (let i = 0; i < 5; i++) rows.push(makeSeatedRow(14, cats[1].id));
  return renumber({
    id: uuid(),
    name: "New venue",
    mode: "seat",
    stage: { label: "STAGE", color: "#7f1d1d", position: "top" },
    categories: cats,
    rows,
    verticalAisles: [],
  });
}

/* ---------- State ---------- */

export interface VenueState {
  map: SeatMap;
  selection: Set<string>;
  mode: "edit" | "preview";
  zoom: number;
  history: { past: SeatMap[]; future: SeatMap[] };
}

const initialState: VenueState = {
  map: makeDefaultMap(),
  selection: new Set(),
  mode: "edit",
  zoom: 1,
  history: { past: [], future: [] },
};

const clone = (m: SeatMap): SeatMap => JSON.parse(JSON.stringify(m));
const COLORS = ["#ef4444", "#10b981", "#06b6d4", "#f97316", "#ec4899", "#8b5cf6"];

/* ---------- Actions ---------- */

export type VenueAction =
  | { type: "SET_MAP"; map: SeatMap }
  | { type: "LOAD_MAP"; map: SeatMap }
  | { type: "SET_MODE"; mode: "edit" | "preview" }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "RESET" }
  | { type: "PUSH_HISTORY" }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_STAGE"; patch: Partial<Stage> }
  | { type: "ADD_CATEGORY" }
  | { type: "UPDATE_CATEGORY"; id: string; patch: Partial<Category> }
  | { type: "REMOVE_CATEGORY"; id: string }
  | { type: "ADD_ROW"; kind: "seated" | "empty" | "aisle"; opts?: { count?: number; categoryId?: string } }
  | { type: "REMOVE_ROW"; rowId: string }
  | { type: "DUPLICATE_ROW"; rowId: string }
  | { type: "RENAME_ROW"; rowId: string; label: string }
  | { type: "TOGGLE_ROW_REVERSED"; rowId: string }
  | { type: "MOVE_ROW"; from: number; to: number }
  | { type: "INSERT_SEAT"; rowId: string; atCellId: string; side: "left" | "right"; cellType: "seat" | "space" }
  | { type: "APPEND_SEAT"; rowId: string; cellType: "seat" | "space" }
  | { type: "REMOVE_CELL"; rowId: string; cellId: string }
  | { type: "SET_SEAT_STATUS"; ids: string[]; status: SeatStatus }
  | { type: "ASSIGN_CATEGORY"; ids: string[]; categoryId: string }
  | { type: "RENUMBER_SEAT"; rowId: string; cellId: string; number: string }
  | { type: "SELECT_SEAT"; id: string; additive?: boolean }
  | { type: "CLEAR_SELECTION" }
  | { type: "SELECT_ALL_IN_ROW"; rowId: string }
  | { type: "ADD_VERTICAL_AISLE"; columnIndex: number; startRowId?: string; endRowId?: string }
  | { type: "REMOVE_VERTICAL_AISLE"; id: string }
  | { type: "MOVE_VERTICAL_AISLE"; id: string; columnIndex: number }
  | { type: "UNDO" }
  | { type: "REDO" };

/* ---------- Reducer ---------- */

export function venueReducer(state: VenueState, action: VenueAction): VenueState {
  switch (action.type) {
    case "SET_MAP":
      return { ...state, map: renumber(action.map) };

    case "LOAD_MAP":
      return { ...state, map: renumber(action.map), selection: new Set(), history: { past: [], future: [] } };

    case "SET_MODE":
      return { ...state, mode: action.mode, selection: new Set() };

    case "SET_ZOOM":
      return { ...state, zoom: Math.max(0.4, Math.min(2.5, action.zoom)) };

    case "RESET":
      return { ...state, map: makeDefaultMap(), selection: new Set(), history: { past: [], future: [] } };

    case "PUSH_HISTORY":
      return {
        ...state,
        history: { past: [...state.history.past.slice(-49), clone(state.map)], future: [] },
      };

    case "SET_NAME":
      return { ...state, map: { ...state.map, name: action.name }, history: push(state) };

    case "SET_STAGE":
      return {
        ...state,
        map: { ...state.map, stage: { ...state.map.stage, ...action.patch } },
        history: push(state),
      };

    case "ADD_CATEGORY": {
      const cat: Category = {
        id: uuid(),
        name: `Category ${state.map.categories.length + 1}`,
        color: COLORS[state.map.categories.length % COLORS.length],
        price: 30,
      };
      return {
        ...state,
        map: { ...state.map, categories: [...state.map.categories, cat] },
        history: push(state),
      };
    }

    case "UPDATE_CATEGORY":
      return {
        ...state,
        map: {
          ...state.map,
          categories: state.map.categories.map((c) =>
            c.id === action.id ? { ...c, ...action.patch } : c,
          ),
        },
        history: push(state),
      };

    case "REMOVE_CATEGORY":
      return {
        ...state,
        map: {
          ...state.map,
          categories: state.map.categories.filter((c) => c.id !== action.id),
          rows: state.map.rows.map((r) => ({
            ...r,
            cells: r.cells.map((c) =>
              c.categoryId === action.id ? { ...c, categoryId: undefined } : c,
            ),
          })),
        },
        history: push(state),
      };

    case "ADD_ROW": {
      const row =
        action.kind === "seated"
          ? makeSeatedRow(action.opts?.count ?? 12, action.opts?.categoryId ?? state.map.categories[0]?.id)
          : action.kind === "aisle"
            ? makeAisleRow()
            : makeEmptyRow();
      return {
        ...state,
        map: renumber({ ...state.map, rows: [...state.map.rows, row] }),
        history: push(state),
      };
    }

    case "REMOVE_ROW":
      return {
        ...state,
        map: renumber({ ...state.map, rows: state.map.rows.filter((r) => r.id !== action.rowId) }),
        history: push(state),
      };

    case "DUPLICATE_ROW": {
      const idx = state.map.rows.findIndex((r) => r.id === action.rowId);
      if (idx < 0) return state;
      const src = state.map.rows[idx];
      const copy: Row = {
        ...src,
        id: uuid(),
        labelOverridden: false,
        cells: src.cells.map((c) => ({ ...c, id: uuid(), numberOverridden: false })),
      };
      const rows = [...state.map.rows.slice(0, idx + 1), copy, ...state.map.rows.slice(idx + 1)];
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "RENAME_ROW":
      return {
        ...state,
        map: {
          ...state.map,
          rows: state.map.rows.map((r) =>
            r.id === action.rowId ? { ...r, label: action.label, labelOverridden: true } : r,
          ),
        },
        history: push(state),
      };

    case "TOGGLE_ROW_REVERSED": {
      const rows = state.map.rows.map((r) =>
        r.id === action.rowId ? { ...r, reversed: !r.reversed } : r,
      );
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "MOVE_ROW": {
      if (action.from === action.to) return state;
      const rows = [...state.map.rows];
      const [item] = rows.splice(action.from, 1);
      rows.splice(action.to, 0, item);
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "INSERT_SEAT": {
      const rows = state.map.rows.map((r) => {
        if (r.id !== action.rowId) return r;
        const idx = r.cells.findIndex((c) => c.id === action.atCellId);
        if (idx < 0) return r;
        const insertAt = action.side === "left" ? idx : idx + 1;
        const cell = action.cellType === "seat" ? makeSeat(state.map.categories[0]?.id) : makeSpace();
        const cells = [...r.cells.slice(0, insertAt), cell, ...r.cells.slice(insertAt)];
        return { ...r, cells };
      });
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "APPEND_SEAT": {
      const rows = state.map.rows.map((r) => {
        if (r.id !== action.rowId) return r;
        const cell = action.cellType === "seat" ? makeSeat(state.map.categories[0]?.id) : makeSpace();
        return { ...r, cells: [...r.cells, cell] };
      });
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "REMOVE_CELL": {
      const rows = state.map.rows.map((r) =>
        r.id !== action.rowId ? r : { ...r, cells: r.cells.filter((c) => c.id !== action.cellId) },
      );
      return { ...state, map: renumber({ ...state.map, rows }), history: push(state) };
    }

    case "SET_SEAT_STATUS": {
      const set = new Set(action.ids);
      return {
        ...state,
        map: {
          ...state.map,
          rows: state.map.rows.map((r) => ({
            ...r,
            cells: r.cells.map((c) =>
              set.has(c.id) && c.type === "seat" ? { ...c, status: action.status } : c,
            ),
          })),
        },
        history: push(state),
      };
    }

    case "ASSIGN_CATEGORY": {
      const s = new Set(action.ids);
      return {
        ...state,
        map: {
          ...state.map,
          rows: state.map.rows.map((r) => ({
            ...r,
            cells: r.cells.map((c) =>
              s.has(c.id) && c.type === "seat" ? { ...c, categoryId: action.categoryId } : c,
            ),
          })),
        },
        history: push(state),
      };
    }

    case "RENUMBER_SEAT": {
      return {
        ...state,
        map: {
          ...state.map,
          rows: state.map.rows.map((r) =>
            r.id !== action.rowId
              ? r
              : {
                  ...r,
                  cells: r.cells.map((c) =>
                    c.id === action.cellId ? { ...c, number: action.number, numberOverridden: true } : c,
                  ),
                },
          ),
        },
        history: push(state),
      };
    }

    case "SELECT_SEAT": {
      const cur = new Set(state.selection);
      if (action.additive) {
        if (cur.has(action.id)) cur.delete(action.id);
        else cur.add(action.id);
      } else {
        cur.clear();
        cur.add(action.id);
      }
      return { ...state, selection: cur };
    }

    case "CLEAR_SELECTION":
      return { ...state, selection: new Set() };

    case "SELECT_ALL_IN_ROW": {
      const row = state.map.rows.find((r) => r.id === action.rowId);
      if (!row) return state;
      const cur = new Set(state.selection);
      row.cells.forEach((c) => c.type === "seat" && cur.add(c.id));
      return { ...state, selection: cur };
    }

    case "ADD_VERTICAL_AISLE": {
      const va: VerticalAisle = {
        id: uuid(),
        columnIndex: action.columnIndex,
        startRowId: action.startRowId ?? null,
        endRowId: action.endRowId ?? null,
      };
      return {
        ...state,
        map: {
          ...state.map,
          verticalAisles: [...state.map.verticalAisles, va],
        },
        history: push(state),
      };
    }

    case "REMOVE_VERTICAL_AISLE":
      return {
        ...state,
        map: {
          ...state.map,
          verticalAisles: state.map.verticalAisles.filter((va) => va.id !== action.id),
        },
        history: push(state),
      };

    case "MOVE_VERTICAL_AISLE":
      return {
        ...state,
        map: {
          ...state.map,
          verticalAisles: state.map.verticalAisles.map((va) =>
            va.id === action.id ? { ...va, columnIndex: action.columnIndex } : va,
          ),
        },
        history: push(state),
      };

    case "UNDO": {
      if (!state.history.past.length) return state;
      const prev = state.history.past[state.history.past.length - 1];
      return {
        ...state,
        map: prev,
        history: {
          past: state.history.past.slice(0, -1),
          future: [clone(state.map), ...state.history.future],
        },
      };
    }

    case "REDO": {
      if (!state.history.future.length) return state;
      const next = state.history.future[0];
      return {
        ...state,
        map: next,
        history: {
          past: [...state.history.past, clone(state.map)],
          future: state.history.future.slice(1),
        },
      };
    }

    default:
      return state;
  }
}

function push(state: VenueState): { past: SeatMap[]; future: SeatMap[] } {
  return { past: [...state.history.past.slice(-49), clone(state.map)], future: [] };
}

/* ---------- Context ---------- */

interface VenueContextValue {
  state: VenueState;
  dispatch: Dispatch<VenueAction>;
}

const VenueContext = createContext<VenueContextValue | null>(null);

export function VenueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(venueReducer, initialState);
  return (
    <VenueContext.Provider value={{ state, dispatch }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue(): VenueContextValue {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error("useVenue must be used inside VenueProvider");
  return ctx;
}
