import { useEffect, useMemo, useState, Fragment } from "react";
import {
  Undo2,
  Redo2,
  Pencil,
  ZoomOut,
  ZoomIn,
  PanelLeft,
  ArrowRight,
  X,
  MoreHorizontal,
  Plus,
  Check,
} from "lucide-react";
import "./seat-map.css";
import { useVenue } from "../context/VenueContext";
import type { Cell, Row, SeatMap, VenueTemplate, VerticalAisle } from "./types";
import { ContextMenu, type MenuItem } from "./ContextMenu";
import { useConfirm } from "../../../shared/hooks/useConfirm";

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

export function SeatMapCreator({
  onPublish,
  venuesOpen,
  onToggleVenues,
  editingId,
  templates,
  onLoadTemplate,
  onDeleteTemplate,
}: {
  onPublish?: () => void;
  venuesOpen?: boolean;
  onToggleVenues?: () => void;
  editingId?: string | null;
  templates?: VenueTemplate[];
  onLoadTemplate?: (venueId: string, templateId: string) => void;
  onDeleteTemplate?: (venueId: string, templateId: string) => void;
}) {
  const { state } = useVenue();
  const { map, mode, zoom } = state;
  useKeys();

  const stageWidth = useMemo(() => {
    const LABEL = 32;
    const GAP_AFTER_LABEL = 8;
    const EDIT_BTN_AREA = mode === "edit" ? 24 + 4 + 24 : 0;
    const GAP_AFTER_EDIT = mode === "edit" ? 8 : 0;
    const OFFSET = LABEL + GAP_AFTER_LABEL + EDIT_BTN_AREA + GAP_AFTER_EDIT;

    let maxRowWidth = 0;
    for (const row of map.rows) {
      if (row.aisle) continue;
      const ri = map.rows.indexOf(row);
      const rowAisles = verticalAislesForRow(ri, map.rows, map.verticalAisles);
      const cellCount = row.cells.length;
      const aisleCount = rowAisles.length;
      const totalItems = cellCount + aisleCount;
      const itemsWidth = cellCount * 24 + aisleCount * 32;
      const gapsWidth = Math.max(0, totalItems - 1) * 4;
      const rowWidth = itemsWidth + gapsWidth;
      if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;
    }
    return { seatsWidth: maxRowWidth || 640, offsetLeft: OFFSET };
  }, [map, mode]);

  return (
    <div className="venue-app h-100 w-100 flex flex-col bg-venue-950 text-venue-100 overflow-hidden">
      <TopBar
        onPublish={onPublish}
        venuesOpen={venuesOpen}
        onToggleVenues={onToggleVenues}
      />
      <div className="flex-1 min-h-0 flex">
        <LeftPanel />
        <main className="flex-1 min-w-0 min-h-0 overflow-auto bg-venue-950">
          <div
            className="min-w-max px-8 py-6"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {map.stage.position === "top" && <StageBar width={stageWidth.seatsWidth} marginLeft={stageWidth.offsetLeft} />}
            <div className="mt-4 space-y-1.5">
              {map.rows.map((r, i) => (
                <RowView key={r.id} row={r} index={i} />
              ))}
              {mode === "edit" && <AddRowInline />}
            </div>
            {map.stage.position === "bottom" && (
              <div className="mt-4">
                <StageBar width={stageWidth.seatsWidth} marginLeft={stageWidth.offsetLeft} />
              </div>
            )}
          </div>
        </main>
        {venuesOpen && (
          <aside className="w-56 shrink-0 border-l border-venue-800 bg-venue-900 p-3 overflow-auto flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-widest text-venue-500 mb-1">
              {editingId ? "Templates" : "Select a venue"}
            </div>
            {!editingId ? (
              <p className="text-xs text-venue-400">Go to Venues and click "Manage Templates" to start editing.</p>
            ) : !templates || templates.length === 0 ? (
              <p className="text-xs text-venue-400">No templates yet. Click "Publish layout" to save.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {templates.map((t, i) => (
                  <li
                    key={t.id}
                    onClick={() => onLoadTemplate?.(editingId, t.id)}
                    className="rounded border border-venue-700 bg-venue-800 hover:border-venue-500 px-2.5 py-1.5 text-xs text-venue-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>{(() => { try { return (JSON.parse(t.layout) as SeatMap).name || `Template ${i + 1}`; } catch { return `Template ${i + 1}`; } })()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate?.(editingId, t.id);
                      }}
                      className="text-venue-500 hover:text-red-400"
                      title="Delete"
                    >
                      <X size={10} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* -------------------- Top bar -------------------- */

function TopBar({
  onPublish,
  onToggleVenues,
}: {
  onPublish?: () => void;
  venuesOpen?: boolean;
  onToggleVenues?: () => void;
}) {
  const { state, dispatch } = useVenue();
  const { map, zoom, history } = state;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const { confirm, dialog } = useConfirm();

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-venue-800 bg-venue-900 px-3 py-2">
      <input
        className="bg-venue-800 border border-venue-700 rounded px-2 py-1 text-sm w-56"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
        value={map.name}
        onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
      />
      <div className="w-px h-6 bg-venue-800" />
      <button className="venue-btn venue-btn-default" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}><Undo2 size={14} /> Undo</button>
      <button className="venue-btn venue-btn-default" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}><Redo2 size={14} /> Redo</button>
      <div className="w-px h-6 bg-venue-800" />
      <button className="venue-btn venue-btn-default" onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom - 0.1 })}><ZoomOut size={14} /></button>
      <span className="text-xs text-venue-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
      <button className="venue-btn venue-btn-default" onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom + 0.1 })}><ZoomIn size={14} /></button>
      <button className="venue-btn venue-btn-default" onClick={() => dispatch({ type: "SET_ZOOM", zoom: 1 })}>Reset zoom</button>

      <div className="flex-1" />
      <button className="venue-btn venue-btn-primary" onClick={onPublish}>Publish layout</button>
      <button className="venue-btn venue-btn-danger" onClick={async () => { if (await confirm("Reset to a fresh map?")) dispatch({ type: "RESET" }); }}>
        Reset layout
      </button>
      {onToggleVenues && (
        <button
          className="venue-btn venue-btn-default"
          onClick={onToggleVenues}
        >
          <PanelLeft size={14} /> Templates
        </button>
      )}
      {dialog}
    </header>
  );
}

/* -------------------- Stage -------------------- */

function StageBar({ width, marginLeft }: { width: number; marginLeft: number }) {
  return (
    <div
      className="venue-stage"
      style={{ background: "#7f1d1d", width, marginLeft }}
    >
      <div className="tracking-[0.4em] font-bold text-lg select-none">STAGE</div>
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
        <div className="w-8 text-xs text-venue-500 text-center"><ArrowRight size={12} /></div>
        <div className="flex-1 border-t border-dashed border-venue-700" />
        {mode === "edit" && (
          <button
            className="opacity-0 group-hover:opacity-100 text-xs text-venue-400 hover:text-danger flex items-center gap-1"
            onClick={() => d({ type: "REMOVE_ROW", rowId: row.id })}
          >
            <X size={12} /> aisle
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
      <div className="w-8 text-center text-sm font-semibold text-venue-300 select-none">
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
            className="w-8 bg-venue-800 border border-venue-700 rounded text-center text-xs"
          />
        ) : (
          <span onDoubleClick={() => mode === "edit" && setRenaming(true)}>{row.label}</span>
        )}
      </div>

      {mode === "edit" && (
        <div className="flex items-center gap-1">
          <button
            title="Rename"
            className="text-xs w-6 h-6 rounded border border-venue-700 bg-venue-800 hover:bg-venue-700 flex items-center justify-center"
            onClick={() => setRenaming(true)}
          >
            <Pencil size={12} />
          </button>
          <button
            title="Row menu"
            className="text-xs w-6 h-6 rounded border border-venue-700 bg-venue-800 hover:bg-venue-700 flex items-center justify-center"
            onClick={(e) => setMenu({ x: e.clientX, y: e.clientY })}
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 flex-wrap">
        {row.cells.length === 0 && mode === "edit" && (
          <button
            className="text-xs px-2 py-1 rounded border border-dashed border-venue-700 text-venue-500 hover:text-venue-200 flex items-center gap-1"
            onClick={() => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "seat" })}
          >
            <Plus size={12} /> Add first seat
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
            className="ml-1 w-6 h-6 rounded border border-venue-700 bg-venue-800 hover:bg-venue-700 text-venue-300 flex items-center justify-center"
            onClick={() => d({ type: "APPEND_SEAT", rowId: row.id, cellType: "seat" })}
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={rowMenu} onClose={() => setMenu(null)} onAction={() => d({ type: "CLEAR_SELECTION" })} />}
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
            className="absolute inset-0 opacity-0 group-hover:opacity-100 text-venue-500 hover:text-danger flex items-center justify-center"
            onClick={() => d({ type: "REMOVE_CELL", rowId: row.id, cellId: cell.id })}
            title="Remove space"
          >
            <X size={10} />
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
      ? "var(--venue-seat-blocked)"
      : status === "reserved"
        ? "var(--venue-seat-reserved)"
        : status === "sold"
          ? "var(--venue-seat-sold)"
          : cat?.color ?? "var(--venue-seat-default)";

  const border = selected
    ? "0 0 0 2.5px #ffffff, 0 0 8px 2px rgba(255,255,255,0.35)"
    : status === "blocked"
      ? "inset 0 0 0 1px #4b5563"
      : "inset 0 0 0 1px rgba(0,0,0,0.35)";

  const clickable = mode === "preview" ? status === "available" : true;

  const multiSelect = selection.size > 1;

  const menuItems: MenuItem[] = multiSelect
    ? [
        { label: `${selection.size} seats selected`, onClick: () => {} },
        { separator: true, label: "", onClick: () => {} },
        ...categories.map<MenuItem>((c) => ({
          label: `Category → ${c.name}`,
          onClick: () => d({ type: "ASSIGN_CATEGORY", ids: Array.from(selection), categoryId: c.id }),
        })),
        { separator: true, label: "", onClick: () => {} },
        { label: "Delete selected seats", danger: true, onClick: () => d({ type: "DELETE_CELLS", ids: Array.from(selection) }) },
      ]
    : [
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
            const additive = e.shiftKey || e.metaKey || e.ctrlKey;
            if (!additive && selected) {
              d({ type: "SELECT_SEAT", id: cell.id, additive: true });
            } else {
              d({ type: "SELECT_SEAT", id: cell.id, additive });
            }
          }
        }}
        onContextMenu={(e) => {
          if (mode !== "edit") return;
          e.preventDefault();
          e.stopPropagation();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        className={`w-6 h-7 rounded text-[10px] font-semibold flex items-center justify-center transition-transform hover:scale-110 disabled:cursor-not-allowed ${selected ? "text-white" : "text-white/95"}`}
        style={{ background: bg, boxShadow: border }}
        title={`${row.label}${cell.number ?? ""}${cat ? " · " + cat.name : ""}${selected ? " · selected" : ""}`}
      >
        {selected ? <Check size={11} strokeWidth={3} /> : cell.number}
      </button>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} onAction={() => d({ type: "CLEAR_SELECTION" })} />}
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
            className="absolute inset-0 opacity-0 group-hover:opacity-100 text-venue-500 hover:text-danger flex items-center justify-center"
            onClick={() => d({ type: "REMOVE_VERTICAL_AISLE", id: aisle.id })}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenu({ x: e.clientX, y: e.clientY });
            }}
            title="Remove vertical aisle"
          >
            <X size={10} />
          </button>
      )}
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} onAction={() => d({ type: "CLEAR_SELECTION" })} />}
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
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-venue-800 mt-4">
      <span className="text-xs text-venue-400">Add row:</span>
      <input
        type="number"
        min={1}
        max={60}
        value={count}
        onChange={(e) => setCount(Number(e.target.value) || 1)}
        className="w-16 bg-venue-800 border border-venue-700 rounded px-2 py-1 text-xs"
      />
      <select
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        className="bg-venue-800 border border-venue-700 rounded px-2 py-1 text-xs"
      >
        {cats.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        className="venue-btn venue-btn-primary"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "seated", opts: { count, categoryId: catId } })}
      >
        <Plus size={14} /> Add seated row
      </button>
      <button
        className="venue-btn venue-btn-default"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "empty" })}
      >
        <Plus size={14} /> Add empty row
      </button>
      <button
        className="venue-btn venue-btn-default"
        onClick={() => dispatch({ type: "ADD_ROW", kind: "aisle" })}
      >
        <Plus size={14} /> Add aisle
      </button>
    </div>
  );
}

/* -------------------- Panels -------------------- */

function LeftPanel() {
  const { state, dispatch } = useVenue();
  const { map } = state;

  return (
    <aside className="w-64 border-r border-venue-800 bg-venue-900 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-venue-800">
        <div className="flex items-center justify-between">
          <h2 className="venue-section-title">Categories</h2>
          <button
            className="venue-btn venue-btn-default"
            onClick={() => dispatch({ type: "ADD_CATEGORY" })}
          >
            <Plus size={14} /> Add category
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {map.categories.map((c) => (
            <div key={c.id} className="rounded border border-venue-800 p-2">
              <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.color}
                    onChange={(e) => dispatch({ type: "UPDATE_CATEGORY", id: c.id, patch: { color: e.target.value } })}
                    className="w-6 h-10 rounded bg-transparent border-none cursor-pointer"
                  />
                  <input
                    value={c.name}
                    onChange={(e) => dispatch({ type: "UPDATE_CATEGORY", id: c.id, patch: { name: e.target.value } })}
                    className="w-75 bg-venue-800 border border-venue-700 rounded px-2 py-1 text-xs"
                  />
                  <button
                    className="text-venue-500 hover:text-danger flex items-center justify-center"
                    onClick={() => dispatch({ type: "REMOVE_CATEGORY", id: c.id })}
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}


