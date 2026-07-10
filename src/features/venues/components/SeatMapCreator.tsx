import { useEffect, useMemo, useState } from "react";
import "./seat-map.css";
import { useSeatMap } from "./store";
import type { Category, Cell, Row, SeatMap } from "./types";
import { ContextMenu, type MenuItem } from "./ContextMenu";

function useKeys() {
  const undo = useSeatMap((s) => s.undo);
  const redo = useSeatMap((s) => s.redo);
  const removeCellStore = useSeatMap((s) => s.removeCell);
  const selection = useSeatMap((s) => s.selection);
  const map = useSeatMap((s) => s.map);
  const clear = useSeatMap((s) => s.clearSelection);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.size === 0) return;
        // avoid when typing in input
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        for (const row of map.rows) {
          for (const c of row.cells) {
            if (selection.has(c.id)) removeCellStore(row.id, c.id);
          }
        }
        clear();
      } else if (e.key === "Escape") {
        clear();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo, removeCellStore, selection, map, clear]);
}

export function SeatMapCreator() {
  const map = useSeatMap((s) => s.map);
  const mode = useSeatMap((s) => s.mode);
  const zoom = useSeatMap((s) => s.zoom);
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
  const map = useSeatMap((s) => s.map);
  const setName = useSeatMap((s) => s.setName);
  const mode = useSeatMap((s) => s.mode);
  const setMode = useSeatMap((s) => s.setMode);
  const undo = useSeatMap((s) => s.undo);
  const redo = useSeatMap((s) => s.redo);
  const zoom = useSeatMap((s) => s.zoom);
  const setZoom = useSeatMap((s) => s.setZoom);
  const loadMap = useSeatMap((s) => s.loadMap);
  const reset = useSeatMap((s) => s.reset);
  const canUndo = useSeatMap((s) => s.history.past.length > 0);
  const canRedo = useSeatMap((s) => s.history.future.length > 0);

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
  const importJson = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "application/json";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      try {
        const parsed: SeatMap = JSON.parse(await f.text());
        loadMap(parsed);
      } catch (e) {
        alert("Invalid JSON: " + (e as Error).message);
      }
    };
    inp.click();
  };
  const saveLocal = () => {
    localStorage.setItem(`seatmap:${map.name}`, JSON.stringify(map));
    alert(`Saved locally as "seatmap:${map.name}"`);
  };
  const loadLocal = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("seatmap:"));
    if (!keys.length) return alert("Nothing saved yet.");
    const pick = prompt("Load which map?\n" + keys.join("\n"), keys[0]);
    if (!pick) return;
    const raw = localStorage.getItem(pick);
    if (!raw) return;
    try {
      loadMap(JSON.parse(raw));
    } catch (e) {
      alert("Corrupt entry: " + (e as Error).message);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2">
      <input
        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm w-56"
        value={map.name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="w-px h-6 bg-neutral-800" />
      <button className={btn} onClick={undo} disabled={!canUndo}>↶ Undo</button>
      <button className={btn} onClick={redo} disabled={!canRedo}>↷ Redo</button>
      <div className="w-px h-6 bg-neutral-800" />
      <div className="inline-flex rounded-md overflow-hidden border border-neutral-700">
        <button
          className={`px-3 py-1.5 text-xs ${mode === "edit" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`}
          onClick={() => setMode("edit")}
        >
          ✎ Edit
        </button>
        <button
          className={`px-3 py-1.5 text-xs ${mode === "preview" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`}
          onClick={() => setMode("preview")}
        >
          ▶ Preview
        </button>
      </div>
      <div className="w-px h-6 bg-neutral-800" />
      <button className={btn} onClick={() => setZoom(zoom - 0.1)}>−</button>
      <span className="text-xs text-neutral-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
      <button className={btn} onClick={() => setZoom(zoom + 0.1)}>+</button>
      <button className={btn} onClick={() => setZoom(1)}>Fit</button>

      <div className="flex-1" />
      <button className={btn} onClick={loadLocal}>Load</button>
      <button className={btn} onClick={saveLocal}>Save</button>
      <button className={btn} onClick={importJson}>Import</button>
      <button className={btnPrimary} onClick={exportJson}>Export JSON</button>
      <button className={btn} onClick={() => confirm("Reset to a fresh map?") && reset()}>
        Reset
      </button>
    </header>
  );
}

/* -------------------- Stage -------------------- */

function StageBar() {
  const stage = useSeatMap((s) => s.map.stage);
  const setStage = useSeatMap((s) => s.setStage);
  const mode = useSeatMap((s) => s.mode);
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
          onChange={(e) => setStage({ label: e.target.value.toUpperCase() })}
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
            onChange={(e) => setStage({ color: e.target.value })}
            className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
            title="Stage color"
          />
          <button
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            onClick={() => setStage({ position: stage.position === "top" ? "bottom" : "top" })}
          >
            ↕ Move
          </button>
        </>
      )}
    </div>
  );
}

/* -------------------- Row -------------------- */

function RowView({ row, index }: { row: Row; index: number }) {
  const mode = useSeatMap((s) => s.mode);
  const removeRow = useSeatMap((s) => s.removeRow);
  const duplicateRow = useSeatMap((s) => s.duplicateRow);
  const renameRow = useSeatMap((s) => s.renameRow);
  const toggleRev = useSeatMap((s) => s.toggleRowReversed);
  const appendSeat = useSeatMap((s) => s.appendSeat);
  const selectAllInRow = useSeatMap((s) => s.selectAllInRow);
  const moveRow = useSeatMap((s) => s.moveRow);
  const rowsLen = useSeatMap((s) => s.map.rows.length);

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [tempLabel, setTempLabel] = useState(row.label);

  if (row.aisle) {
    return (
      <div className="group flex items-center gap-2 py-2">
        <div className="w-8 text-xs text-neutral-500 text-center">→</div>
        <div className="flex-1 border-t border-dashed border-neutral-700" />
        {mode === "edit" && (
          <button
            className="opacity-0 group-hover:opacity-100 text-xs text-neutral-400 hover:text-red-400"
            onClick={() => removeRow(row.id)}
          >
            ✕ aisle
          </button>
        )}
      </div>
    );
  }

  const rowMenu: MenuItem[] = [
    { label: "Rename row", onClick: () => setRenaming(true) },
    { label: "Select all seats", onClick: () => selectAllInRow(row.id) },
    { label: row.reversed ? "Number left→right" : "Reverse numbering", onClick: () => toggleRev(row.id) },
    { label: "Add seat at end", onClick: () => appendSeat(row.id, "seat") },
    { label: "Add space at end", onClick: () => appendSeat(row.id, "space") },
    { label: "Duplicate row", onClick: () => duplicateRow(row.id) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Move up", onClick: () => moveRow(index, Math.max(0, index - 1)) },
    { label: "Move down", onClick: () => moveRow(index, Math.min(rowsLen - 1, index + 1)) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Delete row", danger: true, onClick: () => removeRow(row.id) },
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
        if (!Number.isNaN(from)) moveRow(from, index);
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
              renameRow(row.id, tempLabel || row.label);
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                renameRow(row.id, tempLabel || row.label);
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
            onClick={() => appendSeat(row.id, "seat")}
          >
            + first seat
          </button>
        )}
        {row.cells.map((c) => (
          <SeatCell key={c.id} row={row} cell={c} />
        ))}
        {mode === "edit" && row.cells.length > 0 && (
          <button
            title="Add seat"
            className="ml-1 w-6 h-6 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm"
            onClick={() => appendSeat(row.id, "seat")}
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

function SeatCell({ row, cell }: { row: Row; cell: Cell }) {
  const mode = useSeatMap((s) => s.mode);
  const categories = useSeatMap((s) => s.map.categories);
  const selection = useSeatMap((s) => s.selection);
  const selectSeat = useSeatMap((s) => s.selectSeat);
  const insertSeat = useSeatMap((s) => s.insertSeat);
  const removeCell = useSeatMap((s) => s.removeCell);
  const setStatus = useSeatMap((s) => s.setSeatStatus);
  const assignCategory = useSeatMap((s) => s.assignCategory);
  const renumberSeat = useSeatMap((s) => s.renumberSeat);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  if (cell.type === "space") {
    return (
      <div className="relative group">
        <div className="w-6 h-7" />
        {mode === "edit" && (
          <button
            className="absolute inset-0 opacity-0 group-hover:opacity-100 text-[10px] text-neutral-500 hover:text-red-400"
            onClick={() => removeCell(row.id, cell.id)}
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
    { label: "Insert seat left", onClick: () => insertSeat(row.id, cell.id, "left", "seat") },
    { label: "Insert seat right", onClick: () => insertSeat(row.id, cell.id, "right", "seat") },
    { label: "Insert space left", onClick: () => insertSeat(row.id, cell.id, "left", "space") },
    { label: "Insert space right", onClick: () => insertSeat(row.id, cell.id, "right", "space") },
    { separator: true, label: "", onClick: () => {} },
    { label: "Set number…", onClick: () => {
        const n = prompt("Seat number", cell.number ?? "");
        if (n != null) renumberSeat(row.id, cell.id, n);
      } },
    { separator: true, label: "", onClick: () => {} },
    ...categories.map<MenuItem>((c) => ({
      label: `Category → ${c.name}`,
      onClick: () => assignCategory([cell.id], c.id),
    })),
    { separator: true, label: "", onClick: () => {} },
    { label: "Mark available", onClick: () => setStatus([cell.id], "available") },
    { label: "Mark reserved", onClick: () => setStatus([cell.id], "reserved") },
    { label: "Mark blocked", onClick: () => setStatus([cell.id], "blocked") },
    { separator: true, label: "", onClick: () => {} },
    { label: "Delete seat", danger: true, onClick: () => removeCell(row.id, cell.id) },
  ];

  return (
    <>
      <button
        disabled={!clickable}
        onClick={(e) => {
          if (mode === "preview") {
            // toggle "sold" for booking
            setStatus([cell.id], status === "available" ? "sold" : "available");
            selectSeat(cell.id, true);
          } else {
            selectSeat(cell.id, e.shiftKey || e.metaKey || e.ctrlKey);
          }
        }}
        onContextMenu={(e) => {
          if (mode !== "edit") return;
          e.preventDefault();
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

/* -------------------- Add row inline -------------------- */

function AddRowInline() {
  const addRow = useSeatMap((s) => s.addRow);
  const cats = useSeatMap((s) => s.map.categories);
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
        onClick={() => addRow("seated", { count, categoryId: catId })}
      >
        + Seated row
      </button>
      <button
        className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
        onClick={() => addRow("empty")}
      >
        + Empty row
      </button>
      <button
        className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
        onClick={() => addRow("aisle")}
      >
        + Aisle
      </button>
    </div>
  );
}

/* -------------------- Panels -------------------- */

function LeftPanel() {
  const map = useSeatMap((s) => s.map);
  const addCategory = useSeatMap((s) => s.addCategory);
  const updateCategory = useSeatMap((s) => s.updateCategory);
  const removeCategory = useSeatMap((s) => s.removeCategory);
  const selection = useSeatMap((s) => s.selection);
  const assignCategory = useSeatMap((s) => s.assignCategory);

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-neutral-400">Categories</h2>
          <button
            className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            onClick={addCategory}
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
                  onChange={(e) => updateCategory(c.id, { color: e.target.value })}
                  className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                />
                <input
                  value={c.name}
                  onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                />
                <button
                  className="text-xs text-neutral-500 hover:text-red-400"
                  onClick={() => removeCategory(c.id)}
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
                  onChange={(e) => updateCategory(c.id, { price: Number(e.target.value) || 0 })}
                  className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-0.5 text-xs"
                />
                <button
                  className="ml-auto text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-40"
                  disabled={selection.size === 0}
                  onClick={() => assignCategory(Array.from(selection), c.id)}
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
  const selection = useSeatMap((s) => s.selection);
  const map = useSeatMap((s) => s.map);
  const setStatus = useSeatMap((s) => s.setSeatStatus);
  const assignCategory = useSeatMap((s) => s.assignCategory);
  const mode = useSeatMap((s) => s.mode);

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
                        onClick={() => setStatus(Array.from(selection), s)}
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
                        onClick={() => assignCategory(Array.from(selection), c.id)}
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
  const loadMap = useSeatMap((s) => s.loadMap);
  return (
    <div className="px-3 py-3 border-b border-neutral-800">
      <h2 className="text-xs font-semibold uppercase text-neutral-400 mb-2">Templates</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => loadMap(buildTheater())}
        >
          Theater
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => loadMap(buildArena())}
        >
          Arena
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => loadMap(buildClassroom())}
        >
          Classroom
        </button>
        <button
          className="text-xs px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => loadMap(buildEmpty())}
        >
          Blank
        </button>
      </div>
    </div>
  );
}

/* -------------------- Stats -------------------- */

function StatsBar() {
  const map = useSeatMap((s) => s.map);
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
  const map = useSeatMap((s) => s.map);
  const setStatus = useSeatMap((s) => s.setSeatStatus);
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
                onClick={() => setStatus([cell.id], "available")}
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

import { renumber, makeSeatedRow, makeAisleRow, makeEmptyRow } from "./store";
import { v4 as uuid } from "uuid";

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
  return renumber({
    id: uuid(),
    name: "Theater",
    stage: { label: "STAGE", color: "#7f1d1d", position: "top" },
    categories: cats,
    rows,
  });
}
function buildArena(): SeatMap {
  const cats = baseCats();
  const rows: Row[] = [];
  for (let i = 0; i < 12; i++) rows.push(makeSeatedRow(30 + (i % 3), cats[i < 3 ? 2 : i < 8 ? 1 : 0].id));
  return renumber({
    id: uuid(),
    name: "Arena",
    stage: { label: "FLOOR", color: "#1e3a8a", position: "top" },
    categories: cats,
    rows,
  });
}
function buildClassroom(): SeatMap {
  const cats = baseCats();
  const rows: Row[] = [];
  for (let i = 0; i < 6; i++) rows.push(makeSeatedRow(10, cats[0].id));
  return renumber({
    id: uuid(),
    name: "Classroom",
    stage: { label: "BOARD", color: "#065f46", position: "top" },
    categories: cats,
    rows,
  });
}
function buildEmpty(): SeatMap {
  return renumber({
    id: uuid(),
    name: "Blank",
    stage: { label: "STAGE", color: "#7f1d1d", position: "top" },
    categories: baseCats(),
    rows: [makeEmptyRow()],
  });
}
