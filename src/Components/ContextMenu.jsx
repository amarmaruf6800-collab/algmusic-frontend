import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

/**
 * Premium context / action menu.
 *
 * Props:
 *  - open, onClose
 *  - x, y           anchor position (clientX/clientY)
 *  - title          optional header
 *  - items: [{ label, icon, onClick, danger, disabled, separatorBefore }]
 */
export default function ContextMenu({ open, onClose, x = 0, y = 0, title, items = [] }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    if (!open) return;
    // Keep the menu on-screen.
    const w = 240;
    const h = items.length * 44 + 40;
    const px = Math.min(x, window.innerWidth - w - 12);
    const py = Math.min(y, window.innerHeight - h - 12);
    setPos({ x: Math.max(12, px), y: Math.max(12, py) });

    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [open, x, y, items.length, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="glass fixed z-[130] w-60 animate-scale-in overflow-hidden rounded-2xl p-1.5 shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        boxShadow: "0 30px 80px -12px rgba(0,0,0,0.7)",
      }}
    >
      {title && (
        <p className="truncate px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          {title}
        </p>
      )}
      {items.map((item, i) => {
        if (item.hidden) return null;
        const node = item.header ? (
          <p className="truncate px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
            {item.label}
          </p>
        ) : (
          <button
            key={item.label + i}
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
              item.disabled
                ? "cursor-not-allowed text-white/30"
                : item.danger
                ? "text-rose-400 hover:bg-rose-500/10"
                : "text-white/85 hover:bg-white/10"
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </button>
        );
        return item.separatorBefore ? (
          <div key={`sep-${i}`}>
            <div className="my-1 h-px bg-white/10" />
            {node}
          </div>
        ) : (
          <div key={`item-${i}`}>{node}</div>
        );
      })}
    </div>
  );
}
