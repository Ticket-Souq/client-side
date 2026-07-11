import { useEffect, useMemo, useState, Fragment } from "react";
import "./seat-map.css";
import { useVenue } from "../context/VenueContext";
import type { Category, Cell, Row, SeatMap, VerticalAisle } from "./types";
import { ContextMenu, type MenuItem } from "./ContextMenu";

function useKeys() {
  const { state, dispatch } = useVenue();
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) dispatch({ type: "REDO" });
        else dispatch({ type: "UNDO" });
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selection.size === 0) return;
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        for (const row of state.map.rows) {
          for (const c of row.cells) {
            if (state.selection.has(c.id)) dispatch({ type: "REMOVE_CELL", rowId: row.id, cellId: c.id });
          }
        }
        dispatch({ type: "CLEAR_SELECTION" });
      } else if (e.key === "Escape") {
        dispatch({ type: "CLEAR_SELECTION" });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [state, dispatch]);
}

export function SeatMapCreator() {
  const { state } = useVenue();
  const { map, mode, zoom } = state;
  useKeys();

  return (
    <div className="h-100 w-100 flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      <TopBar />
      <div className="flex-1 min-h-0 flex">
        <LeftPanel />
        <main className="flex-1 min-w-0 min-h-0 overflow-auto bg-neutral-950">
          <div
            className="min-w-max px-8 py-6"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {map.stage.position === "top" && <StageBar />}
            <div className="mt-4 space-y-1.5">
              {map.rows.map((r, i) => (
                <RowView key={r.id} row={r} index={i} />
              ))}
              {mode === "edit" && <AddRowInline />}
            </div>
            {map.stage.position === "bottom" && (
              <div className="mt-4">
                <StageBar />
              </div>
            )}
            <StatsBar />
          </div>
        </main>
        <RightPanel />
      </div>
      {mode === "preview" && <BookingSummary />}
    </div>
  );
}

/* -------------------- Top bar -------------------- */

function TopBar() {
  const { state, dispatch } = useVenue();
  const { map, mode, zoom, history } = state;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const btn = "px-2.5 py-1.5 text-xs rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 border border-neutral-700 whitespace-nowrap";
  const btnPrimary = "px-3 py-1.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap";

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${map.name.replace(/\s+/g, "_") || "seatmap"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2">
      <input
        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm w-56"
        value={map.name}
        onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
      />
      <div className="w-px h-6 bg-neutral-800" />
      <button className={btn} onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>↶ Undo</button>
      <button className={btn} onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>↷ Redo</button>
      <div className="w-px h-6 bg-neutral-800" />
      <div className="inline-flex rounded-md overflow-hidden border border-neutral-700">
        <button
          className={`px-3 py-1.5 text-xs ${mode === "edit" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`}
          onClick={() => dispatch({ type: "SET_MODE", mode: "edit" })}
        >
          ✎ Edit
        </button>
        <button
          className={`px-3 py-1.5 text-xs ${mode === "preview" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`}
          onClick={() => dispatch({ type: "SET_MODE", mode: "preview" })}
        >
          ▶ Preview
        </button>
      </div>
      <div className="w-px h-6 bg-neutral-800" />
      <button className={btn} onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom - 0.1 })}>−</button>
      <span className="text-xs text-neutral-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
      <button className={btn} onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom + 0.1 })}>+</button>
      <button className={btn} onClick={() => dispatch({ type: "SET_ZOOM", zoom: 1 })}>Fit</button>

      <div className="flex-1" />
      <button className={btnPrimary} onClick={exportJson}>Export JSON</button>
      <button className={btn} onClick={() => confirm("Reset to a fresh map?") && dispatch({ type: "RESET" })}>
        Reset
      </button>
    </header>
  );
}

/* -------------------- Stage -------------------- */

function StageBar() {
  const { state, dispatch } = useVenue();
  const { stage } = state.map;
  const mode = state.mode;
  const [editing, setEditing] = useState(false);
  return (
    <div
      className="rounded-md flex items-center justify-center gap-3 py-4 text-white shadow-lg"
      style={{ background: stage.color, minWidth: 640 }}
    >
      {editing ? (
        <input
          autoFocus
          className="bg-black/30 rounded px-2 py-1 text-center tracking-[0.4em] font-bold"
          value={stage.label}
          onChange={(e) => dispatch({ type: "SET_STAGE", patch: { label: e.target.value.toUpperCase() } })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
        />
      ) : (
        <div className="tracking-[0.4em] font-bold text-lg select-none">{stage.label}</div>
      )}
      {mode === "edit" && (
        <>
          <button
            className="ml-4 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            onClick={() => setEditing((v) => !v)}
          >
            Edit
          </button>
          <input
            type="color"
            value={stage.color}
            onChange={(e) => dispatch({ type: "SET_STAGE", patch: { color: e.target.value } })}
            className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
            title="Stage color"
          />
          <button
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            onClick={() => dispatch({ type: "SET_STAGE", patch: { position: stage.position === "top" ? "bottom" : "top" } })}
          >
            ↕ Move
          </button>
        </>
      )}
    </div>
  );
}

/* -------------------- Row -------------------- */

function verticalAislesForRow(
  rowIndex: number,
  rows: Row[],
  verticalAisles: VerticalAisle[],
): VerticalAisle[] {
  return verticalAisles.filter((va) => {
    if (va.startRowId) {
      const si = rows.findIndex((r) => r.id === va.startRowId);
      if (si === -1 || rowIndex < si) return false;
    }
    if (va.endRowId) {
      const ei = rows.findIndex((r) => r.id === va.endRowId);
      if (ei === -1 || rowIndex > ei) return false;
    }
    return true;
  });
}

function RowView({ row, index }: { row: Row; index: number }) {
  const { state, dispatch } = useVenue();
  const mode = state.mode;
  const rowsLen = state.map.rows.length;
  const rowAisles = verticalAislesForRow(index, state.map.rows, state.map.verticalAisles);

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [tempLabel, setTempLabel] = useState(row.label);

  const d = dispatch;

  if (row.aisle) {
    return (
      <div className="group flex items-center gap-2 py-2">
        <div className="w-8 text-xs text-neutral-500 text-center">→</div>
        <div className="flex-1 border-t border-dashed border-neutral-700" />
        {mode === "edit" && (
          <button
            className="opacity-0 group-hover:opacity-100 text-xs text-neutral-400 hover:text-red-400"
            onClick={() => d({ type: "REMOVE_ROW", rowId: row.id })}
          >
            ✕ aisle
          </button>
        )}
      </div>
    );
  }

  const rowMenu: MenuItem[] = [
    { label: "Rename row", onClick: () => setRenaming(true) },
    { label: "Select all seats", onClick: () => d({ type: "SELECT_ALL_IN_ROW", rowId: row.id }) },
    { label: row.reversed ? "Number left→right" : "Reverse numbering", onClick: () => d({ type: "TOGGLE_ROW_REVERSED", rowId: row.id }) },
    { label: "Add seat at end", onClick: () => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "seat" }) },
    { label: "Add space at end", onClick: () => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "space" }) },
    { label: "Duplicate row", onClick: () => d({ type: "DUPLICATE_ROW", rowId: row.id }) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Move up", onClick: () => d({ type: "MOVE_ROW", from: index, to: Math.max(0, index - 1) }) },
    { label: "Move down", onClick: () => d({ type: "MOVE_ROW", from: index, to: Math.min(rowsLen - 1, index + 1) }) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Delete row", danger: true, onClick: () => d({ type: "REMOVE_ROW", rowId: row.id }) },
  ];

  return (
    <div
      className="flex items-center gap-2"
      draggable={mode === "edit"}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/row-index", String(index));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (mode !== "edit") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        const from = Number(e.dataTransfer.getData("text/row-index"));
        if (!Number.isNaN(from)) d({ type: "MOVE_ROW", from, to: index });
      }}
      onContextMenu={(e) => {
        if (mode !== "edit") return;
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <div className="w-8 text-center text-sm font-semibold text-neutral-300 select-none">
        {renaming ? (
          <input
            autoFocus
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={() => {
              d({ type: "RENAME_ROW", rowId: row.id, label: tempLabel || row.label });
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                d({ type: "RENAME_ROW", rowId: row.id, label: tempLabel || row.label });
                setRenaming(false);
              }
            }}
            className="w-8 bg-neutral-800 border border-neutral-700 rounded text-center text-xs"
          />
        ) : (
          <span onDoubleClick={() => mode === "edit" && setRenaming(true)}>{row.label}</span>
        )}
      </div>

      {mode === "edit" && (
        <div className="flex items-center gap-1">
          <button
            title="Rename"
            className="text-xs w-6 h-6 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
            onClick={() => setRenaming(true)}
          >
            ✎
          </button>
          <button
            title="Row menu"
            className="text-xs w-6 h-6 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
            onClick={(e) => setMenu({ x: e.clientX, y: e.clientY })}
          >
            ≡
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 flex-wrap">
        {row.cells.length === 0 && mode === "edit" && (
          <button
            className="text-xs px-2 py-1 rounded border border-dashed border-neutral-700 text-neutral-500 hover:text-neutral-200"
            onClick={() => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "seat" })}
          >
            + first seat
          </button>
        )}
        {row.cells.map((c, i) => (
          <Fragment key={c.id}>
            <SeatCell row={row} cell={c} cellIndex={i} />
            {rowAisles.filter((va) => va.columnIndex === i).map((va) => (
              <VerticalAisleGap key={va.id} aisle={va} />
            ))}
          </Fragment>
        ))}
        {mode === "edit" && row.cells.length > 0 && (
          <button
            title="Add seat"
            className="ml-1 w-6 h-6 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm"
            onClick={() => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "seat" })}
          >
            +
          </button>
        )}
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={rowMenu} onClose={() => setMenu(null)} />}
    </div>
  );
}

/* -------------------- Cell -------------------- */

function SeatCell({ row, cell, cellIndex }: { row: Row; cell: Cell; cellIndex: number }) {
  const { state, dispatch } = useVenue();
  const mode = state.mode;
  const categories = state.map.categories;
  const selection = state.selection;
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const d = dispatch;

  if (cell.type === "space") {
    return (
      <div className="relative group">
        <div className="w-6 h-7" />
        {mode === "edit" && (
          <button
            className="absolute inset-0 opacity-0 group-hover:opacity-100 text-[10px] text-neutral-500 hover:text-red-400"
            onClick={() => d({ type: "REMOVE_CELL", rowId: row.id, cellId: cell.id })}
            title="Remove space"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  const cat = categories.find((c) => c.id === cell.categoryId);
  const selected = selection.has(cell.id);
  const status = cell.status ?? "available";

  const bg =
    status === "blocked"
      ? "#374151"
      : status === "reserved"
        ? "#6b7280"
        : status === "sold"
          ? "#111827"
          : cat?.color ?? "#334155";

  const border = selected
    ? "0 0 0 2px #ffffff"
    : status === "blocked"
      ? "inset 0 0 0 1px #4b5563"
      : "inset 0 0 0 1px rgba(0,0,0,0.35)";

  const clickable = mode === "preview" ? status === "available" : true;

  const menuItems: MenuItem[] = [
    { label: "Insert seat left", onClick: () => d({ type: "INSERT_SEAT", rowId: row.id, atCellId: cell.id, side: "left", cellType: "seat" }) },
    { label: "Insert seat right", onClick: () => d({ type: "INSERT_SEAT", rowId: row.id, atCellId: cell.id, side: "right", cellType: "seat" }) },
    { label: "Insert space left", onClick: () => d({ type: "INSERT_SEAT", rowId: row.id, atCellId: cell.id, side: "left", cellType: "space" }) },
    { label: "Insert space right", onClick: () => d({ type: "INSERT_SEAT", rowId: row.id, atCellId: cell.id, side: "right", cellType: "space" }) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Insert vertical aisle left", onClick: () => d({ type: "ADD_VERTICAL_AISLE", columnIndex: Math.max(0, cellIndex - 1) }) },
    { label: "Insert vertical aisle right", onClick: () => d({ type: "ADD_VERTICAL_AISLE", columnIndex: cellIndex }) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Set number…", onClick: () => {
        const n = prompt("Seat number", cell.number ?? "");
        if (n != null) d({ type: "RENUMBER_SEAT", rowId: row.id, cellId: cell.id, number: n });
      } },
    { separator: true, label: "", onClick: () => {} },
    ...categories.map<MenuItem>((c) => ({
      label: `Category → ${c.name}`,
      onClick: () => d({ type: "ASSIGN_CATEGORY", ids: [cell.id], categoryId: c.id }),
    })),
    { separator: true, label: "", onClick: () => {} },
    { label: "Mark available", onClick: () => d({ type: "SET_SEAT_STATUS", ids: [cell.id], status: "available" }) },
    { label: "Mark reserved", onClick: () => d({ type: "SET_SEAT_STATUS", ids: [cell.id], status: "reserved" }) },
    { label: "Mark blocked", onClick: () => d({ type: "SET_SEAT_STATUS", ids: [cell.id], status: "blocked" }) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Delete seat", danger: true, onClick: () => d({ type: "REMOVE_CELL", rowId: row.id, cellId: cell.id }) },
  ];

  return (
    <>
      <button
        disabled={!clickable}
        onClick={(e) => {
          if (mode === "preview") {
            d({ type: "SET_SEAT_STATUS", ids: [cell.id], status: status === "available" ? "sold" : "available" });
            d({ type: "SELECT_SEAT", id: cell.id, additive: true });
          } else {
            d({ type: "SELECT_SEAT", id: cell.id, additive: e.shiftKey || e.metaKey || e.ctrlKey });
          }
        }}
        onContextMenu={(e) => {
          if (mode !== "edit") return;
          e.preventDefault();
          e.stopPropagation();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        className="w-6 h-7 rounded text-[10px] font-semibold text-white/95 flex items-center justify-center transition-transform hover:scale-110 disabled:cursor-not-allowed"
        style={{ background: bg, boxShadow: border }}
        title={`${row.label}${cell.number ?? ""}${cat ? " · " + cat.name + " $" + cat.price : ""}`}
      >
        {cell.number}
      </button>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </>
  );
}

/* -------------------- Vertical aisle gap -------------------- */

function VerticalAisleGap({ aisle }: { aisle: VerticalAisle }) {
  const { state, dispatch } = useVenue();
  const mode = state.mode;
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const d = dispatch;

  const menuItems: MenuItem[] = [
    { label: "Remove aisle", danger: true, onClick: () => d({ type: "REMOVE_VERTICAL_AISLE", id: aisle.id }) },
  ];

  return (
    <div className="relative group">
      <div className="w-8 h-7" />
      {mode === "edit" && (
        <button
          className="absolute inset-0 opacity-0 group-hover:opacity-100 text-[10px] text-neutral-500 hover:text-red-400"
          onClick={() => d({ type: "REMOVE_VERTICAL_AISLE", id: aisle.id })}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenu({ x: e.clientX, y: e.clientY });
          }}
          title="Remove vertical aisle"
        >
          ✕
        </button>
      )}
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </div>
  );
}

/* -------------------- Add row inline -------------------- */

function AddRowInline() {
  const { state, dispatch } = useVenue();
  const cats = state.map.categories;
  const [count, setCount] = useState(14);
  const [catId, setCatId] = useState<string>(cats[0]?.id ?? "");
  useEffect(() => {
    if (!cats.find((c) => c.id === catId)) setCatId(cats[0]?.id ?? "");
  }, [cats, catId]);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-800 mt-4">
      <span className="text-xs text-neutral-400">Add row:</span>
      <input
        type="number"
        min={1}
        max={60}
        value={count}
        onChange={(e) => setCount(Number(e.target.value) || 1)}
        className="w-16 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
      />
      <select
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
      >
        {cats.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        className="px-2.5 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "seated", opts: { count, categoryId: catId } })}
      >
        + Seated row
      </button>
      <button
        className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "empty" })}
      >
        + Empty row
      </button>
      <button
        className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "aisle" })}
      >
        + Aisle
      </button>
    </div>
  );
}

/* -------------------- Panels -------------------- */

function LeftPanel() {
  const { state, dispatch } = useVenue();
  const { map, selection } = state;

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-neutral-400">Categories</h2>
          <button
            className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            onClick={() => dispatch({ type: "ADD_CATEGORY" })}
          >
            + Add
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {map.categories.map((c) => (
            <div key={c.id} className="rounded border border-neutral-800 p-2">
              <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.color}
                    onChange={(e) => dispatch({ type: "UPDATE_CATEGORY", id: c.id, patch: { color: e.target.value } })}
                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                  />
                  <input
                    value={c.name}
                    onChange={(e) => dispatch({ type: "UPDATE_CATEGORY", id: c.id, patch: { name: e.target.value } })}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                  />
                  <button
                    className="text-xs text-neutral-500 hover:text-red-400"
                    onClick={() => dispatch({ type: "REMOVE_CATEGORY", id: c.id })}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-neutral-500">Price $</span>
                  <input
                    type="number"
                    min={0}
                    value={c.price}
                    onChange={(e) => dispatch({ type: "UPDATE_CATEGORY", id: c.id, patch: { price: Number(e.target.value) || 0 } })}
                    className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-0.5 text-xs"
                  />
                  <button
                    className="ml-auto text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-40"
                    disabled={selection.size === 0}
                    onClick={() => dispatch({ type: "ASSIGN_CATEGORY", ids: Array.from(selection), categoryId: c.id })}
                  >
                    Assign ({selection.size})
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Legend />
      <Tips />
    </aside>
  );
}

function Legend() {
  const Item = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2 text-xs text-neutral-300">
      <span className="inline-block w-4 h-4 rounded" style={{ background: color }} />
      {label}
    </div>
  );
  return (
    <div className="px-3 py-3 border-b border-neutral-800 space-y-1">
      <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-1">Status</h3>
      <Item color="#6b7280" label="Reserved" />
      <Item color="#374151" label="Blocked" />
      <Item color="#111827" label="Sold" />
    </div>
  );
}

function Tips() {
  return (
    <div className="px-3 py-3 text-[11px] text-neutral-500 space-y-1">
      <div className="font-semibold text-neutral-400 uppercase">Tips</div>
      <div>• Right-click a seat or row for actions</div>
      <div>• Shift-click seats to multi-select</div>
      <div>• Drag row label to reorder</div>
      <div>• Delete key removes selected seats</div>
      <div>• Ctrl/Cmd+Z to undo</div>
    </div>
  );
}

function RightPanel() {
  const { state, dispatch } = useVenue();
  const { selection, map, mode } = state;

  const seatIndex = useMemo(() => {
    const idx = new Map<string, { row: Row; cell: Cell }>();
    for (const r of map.rows) for (const c of r.cells) idx.set(c.id, { row: r, cell: c });
    return idx;
  }, [map]);
  const selectedList = Array.from(selection).map((id) => seatIndex.get(id)).filter(Boolean) as { row: Row; cell: Cell }[];

  return (
    <aside className="w-72 border-l border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-800">
        <h2 className="text-xs font-semibold uppercase text-neutral-400">Selection</h2>
        <div className="mt-2 text-xs text-neutral-300">
          {selectedList.length === 0 ? (
            <div className="text-neutral-500">Nothing selected.</div>
          ) : (
            <>
              <div>{selectedList.length} seat(s) selected</div>
              <div className="mt-1 max-h-32 overflow-auto text-[11px] text-neutral-400 border border-neutral-800 rounded p-1.5">
                {selectedList.slice(0, 40).map(({ row, cell }) => (
                  <div key={cell.id}>
                    {row.label}
                    {cell.number}
                  </div>
                ))}
                {selectedList.length > 40 && <div>…</div>}
              </div>
              {mode === "edit" && (
                <div className="mt-2 space-y-2">
                  <div className="text-[11px] text-neutral-400">Set status</div>
                  <div className="flex flex-wrap gap-1">
                    {(["available", "reserved", "blocked"] as const).map((s) => (
                      <button
                        key={s}
                        className="px-2 py-1 text-[11px] rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 capitalize"
                        onClick={() => dispatch({ type: "SET_SEAT_STATUS", ids: Array.from(selection), status: s })}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">Assign category</div>
                  <div className="flex flex-wrap gap-1">
                    {map.categories.map((c) => (
                      <button
                        key={c.id}
                        className="px-2 py-1 text-[11px] rounded border border-neutral-700"
                        style={{ background: c.color + "33", color: c.color }}
                        onClick={() => dispatch({ type: "ASSIGN_CATEGORY", ids: Array.from(selection), categoryId: c.id })}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <TemplatesPanel />
    </aside>
  );
}

function TemplatesPanel() {
  const { dispatch } = useVenue();
  return (
    <div className="px-3 py-3 border-b border-neutral-800">
      <h2 className="text-xs font-semibold uppercase text-neutral-400 mb-2">Templates</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => dispatch({ type: "LOAD_MAP", map: buildTheater() })}
        >
          Theater
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => dispatch({ type: "LOAD_MAP", map: buildArena() })}
        >
          Arena
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => dispatch({ type: "LOAD_MAP", map: buildClassroom() })}
        >
          Classroom
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => dispatch({ type: "LOAD_MAP", map: buildEmpty() })}
        >
          Blank
        </button>
      </div>
    </div>
  );
}

/* -------------------- Stats -------------------- */

function StatsBar() {
  const { state } = useVenue();
  const map = state.map;
  const stats = useMemo(() => {
    let total = 0;
    let available = 0;
    let sold = 0;
    let reserved = 0;
    let blocked = 0;
    const perCat: Record<string, number> = {};
    let potential = 0;
    for (const r of map.rows) {
      for (const c of r.cells) {
        if (c.type !== "seat") continue;
        total++;
        if (c.status === "sold") sold++;
        else if (c.status === "reserved") reserved++;
        else if (c.status === "blocked") blocked++;
        else available++;
        if (c.categoryId) {
          perCat[c.categoryId] = (perCat[c.categoryId] ?? 0) + 1;
          const cat = map.categories.find((x) => x.id === c.categoryId);
          if (cat) potential += cat.price;
        }
      }
    }
    return { total, available, sold, reserved, blocked, perCat, potential };
  }, [map]);
  return (
    <div className="mt-6 flex flex-wrap gap-3 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
      <span>Total: <b className="text-neutral-200">{stats.total}</b></span>
      <span>Available: <b className="text-emerald-400">{stats.available}</b></span>
      <span>Sold: <b className="text-neutral-100">{stats.sold}</b></span>
      <span>Reserved: <b className="text-amber-300">{stats.reserved}</b></span>
      <span>Blocked: <b className="text-neutral-500">{stats.blocked}</b></span>
      <span className="ml-auto">Potential revenue: <b className="text-emerald-300">${stats.potential.toFixed(2)}</b></span>
    </div>
  );
}

function BookingSummary() {
  const { state, dispatch } = useVenue();
  const map = state.map;
  const sold = useMemo(() => {
    const arr: { row: Row; cell: Cell; cat?: Category }[] = [];
    for (const r of map.rows) {
      for (const c of r.cells) {
        if (c.type === "seat" && c.status === "sold") {
          arr.push({ row: r, cell: c, cat: map.categories.find((x) => x.id === c.categoryId) });
        }
      }
    }
    return arr;
  }, [map]);
  const total = sold.reduce((s, x) => s + (x.cat?.price ?? 0), 0);
  if (!sold.length) return null;
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 min-w-[420px] max-w-[600px] rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur px-4 py-3 shadow-2xl">
      <div className="text-xs text-neutral-400 mb-1">Cart · {sold.length} seat(s)</div>
      <div className="max-h-24 overflow-auto text-xs text-neutral-200">
        {sold.map(({ row, cell, cat }) => (
          <div key={cell.id} className="flex items-center justify-between py-0.5">
            <span>
              Seat <b>{row.label}{cell.number}</b> {cat && <span className="text-neutral-400">· {cat.name}</span>}
            </span>
            <span className="flex items-center gap-2">
              <span>${cat?.price?.toFixed(2) ?? "0.00"}</span>
              <button
                className="text-neutral-500 hover:text-red-400"
                onClick={() => dispatch({ type: "SET_SEAT_STATUS", ids: [cell.id], status: "available" })}
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between text-sm">
        <span className="text-neutral-400">Total</span>
        <span className="font-bold text-emerald-300">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* -------------------- Templates -------------------- */

import { renumber, makeSeatedRow, makeAisleRow, makeEmptyRow } from "../context/VenueContext";
import { v4 as uuid } from "uuid";
import type { Stage } from "./types";

const makeSeatTemplate = (id: string, name: string, stage: Stage, cats: Category[], rows: Row[]): SeatMap =>
  renumber({ id, name, mode: "seat", stage, categories: cats, rows, verticalAisles: [] });

function baseCats(): Category[] {
  return [
    { id: uuid(), name: "Standard", color: "#3b82f6", price: 25 },
    { id: uuid(), name: "Premium", color: "#a855f7", price: 45 },
    { id: uuid(), name: "VIP", color: "#f59e0b", price: 80 },
  ];
}
function buildTheater(): SeatMap {
  const cats = baseCats();
  const rows: Row[] = [];
  for (let i = 0; i < 3; i++) rows.push(makeSeatedRow(16, cats[2].id));
  rows.push(makeAisleRow());
  for (let i = 0; i < 6; i++) rows.push(makeSeatedRow(20, cats[1].id));
  rows.push(makeAisleRow());
  for (let i = 0; i < 6; i++) rows.push(makeSeatedRow(24, cats[0].id));
  return makeSeatTemplate(uuid(), "Theater", { label: "STAGE", color: "#7f1d1d", position: "top" }, cats, rows);
}
function buildArena(): SeatMap {
  const cats = baseCats();
  const rows: Row[] = [];
  for (let i = 0; i < 12; i++) rows.push(makeSeatedRow(30 + (i % 3), cats[i < 3 ? 2 : i < 8 ? 1 : 0].id));
  return makeSeatTemplate(uuid(), "Arena", { label: "FLOOR", color: "#1e3a8a", position: "top" }, cats, rows);
}
function buildClassroom(): SeatMap {
  const cats = baseCats();
  const rows: Row[] = [];
  for (let i = 0; i < 6; i++) rows.push(makeSeatedRow(10, cats[0].id));
  return makeSeatTemplate(uuid(), "Classroom", { label: "BOARD", color: "#065f46", position: "top" }, cats, rows);
}
function buildEmpty(): SeatMap {
  return makeSeatTemplate(uuid(), "Blank", { label: "STAGE", color: "#7f1d1d", position: "top" }, baseCats(), [makeEmptyRow()]);
}
