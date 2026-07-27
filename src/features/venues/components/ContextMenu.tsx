import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./seat-map.css";

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}

export function ContextMenu({
  x,
  y,
  items,
  onClose,
  onAction,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
  onAction?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [onClose]);

  return createPortal(
    <div className="venue-app">
      <div
        ref={ref}
        className="fixed z-50 min-w-44 rounded-md border border-venue-700 bg-venue-900 shadow-xl py-1 text-sm text-venue-100"
        style={{ left: x, top: y }}
      >
        {items.map((it, i) =>
          it.separator ? (
            <div key={i} className="my-1 border-t border-venue-800" />
          ) : (
            <button
              key={i}
              className={`block w-full text-left px-3 py-1.5 hover:bg-venue-800 ${it.danger ? "text-danger" : ""}`}
              onClick={() => {
                it.onClick();
                onAction?.();
                onClose();
              }}
            >
              {it.label}
            </button>
          ),
        )}
      </div>
    </div>,
    document.body,
  );
}
