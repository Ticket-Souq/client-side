import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { Category, Cell, Row, SeatMap, SeatStatus, Stage } from "./types";

const alpha = (i: number): string => {
  let n = i;
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
};

export function renumber(map: SeatMap): SeatMap {
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

export function makeSeat(categoryId?: string): Cell {
  return { id: uuid(), type: "seat", status: "available", categoryId };
}
export function makeSpace(): Cell {
  return { id: uuid(), type: "space" };
}

export function makeSeatedRow(count = 12, categoryId?: string): Row {
  return {
    id: uuid(),
    label: "",
    cells: Array.from({ length: count }, () => makeSeat(categoryId)),
  };
}
export function makeEmptyRow(): Row {
  return { id: uuid(), label: "", cells: [] };
}
export function makeAisleRow(): Row {
  return { id: uuid(), label: "", cells: [], aisle: true };
}

export function makeDefaultMap(): SeatMap {
  const cats = defaultCategories();
  const rows: Row[] = [];
  for (let i = 0; i < 5; i++) rows.push(makeSeatedRow(14, cats[0].id));
  rows.push(makeAisleRow());
  for (let i = 0; i < 5; i++) rows.push(makeSeatedRow(14, cats[1].id));
  return renumber({
    id: uuid(),
    name: "New venue",
    stage: { label: "STAGE", color: "#7f1d1d", position: "top" },
    categories: cats,
    rows,
  });
}

interface HistoryState {
  past: SeatMap[];
  future: SeatMap[];
}

interface StoreState {
  map: SeatMap;
  selection: Set<string>; // seat ids
  mode: "edit" | "preview";
  zoom: number;
  history: HistoryState;
  // basic
  setMap: (m: SeatMap) => void;
  loadMap: (m: SeatMap) => void;
  setMode: (m: "edit" | "preview") => void;
  setZoom: (z: number) => void;
  reset: () => void;
  // meta
  setName: (n: string) => void;
  setStage: (patch: Partial<Stage>) => void;
  // categories
  addCategory: () => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  // rows
  addRow: (kind: "seated" | "empty" | "aisle", opts?: { count?: number; categoryId?: string }) => void;
  removeRow: (rowId: string) => void;
  duplicateRow: (rowId: string) => void;
  renameRow: (rowId: string, label: string) => void;
  toggleRowReversed: (rowId: string) => void;
  moveRow: (fromIdx: number, toIdx: number) => void;
  // seats
  insertSeat: (rowId: string, atCellId: string, side: "left" | "right", type: "seat" | "space") => void;
  appendSeat: (rowId: string, type: "seat" | "space") => void;
  removeCell: (rowId: string, cellId: string) => void;
  setSeatStatus: (ids: string[], status: SeatStatus) => void;
  assignCategory: (ids: string[], categoryId: string) => void;
  renumberSeat: (rowId: string, cellId: string, number: string) => void;
  // selection
  selectSeat: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  selectAllInRow: (rowId: string) => void;
  // undo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const clone = (m: SeatMap): SeatMap => JSON.parse(JSON.stringify(m));

export const useSeatMap = create<StoreState>((set, get) => ({
  map: makeDefaultMap(),
  selection: new Set(),
  mode: "edit",
  zoom: 1,
  history: { past: [], future: [] },

  setMap: (map) => set({ map: renumber(map) }),
  loadMap: (map) => set({ map: renumber(map), selection: new Set(), history: { past: [], future: [] } }),
  setMode: (mode) => set({ mode, selection: new Set() }),
  setZoom: (zoom) => set({ zoom: Math.max(0.4, Math.min(2.5, zoom)) }),
  reset: () => set({ map: makeDefaultMap(), selection: new Set(), history: { past: [], future: [] } }),

  pushHistory: () => {
    const { map, history } = get();
    set({ history: { past: [...history.past.slice(-49), clone(map)], future: [] } });
  },

  setName: (name) => {
    get().pushHistory();
    set({ map: { ...get().map, name } });
  },
  setStage: (patch) => {
    get().pushHistory();
    set({ map: { ...get().map, stage: { ...get().map.stage, ...patch } } });
  },

  addCategory: () => {
    get().pushHistory();
    const colors = ["#ef4444", "#10b981", "#06b6d4", "#f97316", "#ec4899", "#8b5cf6"];
    const cat: Category = {
      id: uuid(),
      name: `Category ${get().map.categories.length + 1}`,
      color: colors[get().map.categories.length % colors.length],
      price: 30,
    };
    set({ map: { ...get().map, categories: [...get().map.categories, cat] } });
  },
  updateCategory: (id, patch) => {
    get().pushHistory();
    set({
      map: {
        ...get().map,
        categories: get().map.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    });
  },
  removeCategory: (id) => {
    get().pushHistory();
    const map = get().map;
    set({
      map: {
        ...map,
        categories: map.categories.filter((c) => c.id !== id),
        rows: map.rows.map((r) => ({
          ...r,
          cells: r.cells.map((c) => (c.categoryId === id ? { ...c, categoryId: undefined } : c)),
        })),
      },
    });
  },

  addRow: (kind, opts) => {
    get().pushHistory();
    const map = get().map;
    const row =
      kind === "seated"
        ? makeSeatedRow(opts?.count ?? 12, opts?.categoryId ?? map.categories[0]?.id)
        : kind === "aisle"
          ? makeAisleRow()
          : makeEmptyRow();
    set({ map: renumber({ ...map, rows: [...map.rows, row] }) });
  },
  removeRow: (rowId) => {
    get().pushHistory();
    const map = get().map;
    set({ map: renumber({ ...map, rows: map.rows.filter((r) => r.id !== rowId) }) });
  },
  duplicateRow: (rowId) => {
    get().pushHistory();
    const map = get().map;
    const idx = map.rows.findIndex((r) => r.id === rowId);
    if (idx < 0) return;
    const src = map.rows[idx];
    const copy: Row = {
      ...src,
      id: uuid(),
      labelOverridden: false,
      cells: src.cells.map((c) => ({ ...c, id: uuid(), numberOverridden: false })),
    };
    const rows = [...map.rows.slice(0, idx + 1), copy, ...map.rows.slice(idx + 1)];
    set({ map: renumber({ ...map, rows }) });
  },
  renameRow: (rowId, label) => {
    get().pushHistory();
    const map = get().map;
    set({
      map: {
        ...map,
        rows: map.rows.map((r) => (r.id === rowId ? { ...r, label, labelOverridden: true } : r)),
      },
    });
  },
  toggleRowReversed: (rowId) => {
    get().pushHistory();
    const map = get().map;
    set({
      map: renumber({
        ...map,
        rows: map.rows.map((r) => (r.id === rowId ? { ...r, reversed: !r.reversed } : r)),
      }),
    });
  },
  moveRow: (from, to) => {
    if (from === to) return;
    get().pushHistory();
    const map = get().map;
    const rows = [...map.rows];
    const [item] = rows.splice(from, 1);
    rows.splice(to, 0, item);
    set({ map: renumber({ ...map, rows }) });
  },

  insertSeat: (rowId, atCellId, side, type) => {
    get().pushHistory();
    const map = get().map;
    const rows = map.rows.map((r) => {
      if (r.id !== rowId) return r;
      const idx = r.cells.findIndex((c) => c.id === atCellId);
      if (idx < 0) return r;
      const insertAt = side === "left" ? idx : idx + 1;
      const cell = type === "seat" ? makeSeat(map.categories[0]?.id) : makeSpace();
      const cells = [...r.cells.slice(0, insertAt), cell, ...r.cells.slice(insertAt)];
      return { ...r, cells };
    });
    set({ map: renumber({ ...map, rows }) });
  },
  appendSeat: (rowId, type) => {
    get().pushHistory();
    const map = get().map;
    const rows = map.rows.map((r) => {
      if (r.id !== rowId) return r;
      const cell = type === "seat" ? makeSeat(map.categories[0]?.id) : makeSpace();
      return { ...r, cells: [...r.cells, cell] };
    });
    set({ map: renumber({ ...map, rows }) });
  },
  removeCell: (rowId, cellId) => {
    get().pushHistory();
    const map = get().map;
    const rows = map.rows.map((r) =>
      r.id !== rowId ? r : { ...r, cells: r.cells.filter((c) => c.id !== cellId) },
    );
    set({ map: renumber({ ...map, rows }) });
  },
  setSeatStatus: (ids, status) => {
    get().pushHistory();
    const set2 = new Set(ids);
    const map = get().map;
    set({
      map: {
        ...map,
        rows: map.rows.map((r) => ({
          ...r,
          cells: r.cells.map((c) => (set2.has(c.id) && c.type === "seat" ? { ...c, status } : c)),
        })),
      },
    });
  },
  assignCategory: (ids, categoryId) => {
    get().pushHistory();
    const s = new Set(ids);
    const map = get().map;
    set({
      map: {
        ...map,
        rows: map.rows.map((r) => ({
          ...r,
          cells: r.cells.map((c) => (s.has(c.id) && c.type === "seat" ? { ...c, categoryId } : c)),
        })),
      },
    });
  },
  renumberSeat: (rowId, cellId, number) => {
    get().pushHistory();
    const map = get().map;
    set({
      map: {
        ...map,
        rows: map.rows.map((r) =>
          r.id !== rowId
            ? r
            : {
                ...r,
                cells: r.cells.map((c) =>
                  c.id === cellId ? { ...c, number, numberOverridden: true } : c,
                ),
              },
        ),
      },
    });
  },

  selectSeat: (id, additive) => {
    const cur = new Set(get().selection);
    if (additive) {
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
    } else {
      cur.clear();
      cur.add(id);
    }
    set({ selection: cur });
  },
  clearSelection: () => set({ selection: new Set() }),
  selectAllInRow: (rowId) => {
    const row = get().map.rows.find((r) => r.id === rowId);
    if (!row) return;
    const cur = new Set(get().selection);
    row.cells.forEach((c) => c.type === "seat" && cur.add(c.id));
    set({ selection: cur });
  },

  undo: () => {
    const { history, map } = get();
    if (!history.past.length) return;
    const prev = history.past[history.past.length - 1];
    set({
      map: prev,
      history: { past: history.past.slice(0, -1), future: [clone(map), ...history.future] },
    });
  },
  redo: () => {
    const { history, map } = get();
    if (!history.future.length) return;
    const next = history.future[0];
    set({
      map: next,
      history: { past: [...history.past, clone(map)], future: history.future.slice(1) },
    });
  },
}));
