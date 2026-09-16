import { useEffect, useState } from "react";
import { Check, Heart, X, AlertTriangle, Music2 } from "lucide-react";
import { subscribeToast, dismissToast } from "../lib/toast";
import { cn } from "../lib/utils";

/**
 * Premium toast layer. Mount once near the app root.
 */
export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeToast(setToasts), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[120] flex flex-col items-center gap-2 px-4 sm:bottom-24">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const config = {
    default: { color: "text-white", Icon: Music2 },
    success: { color: "text-emerald-400", Icon: Check },
    error: { color: "text-rose-400", Icon: AlertTriangle },
    liked: { color: "text-pink-400", Icon: Heart },
  }[toast.type] || { color: "text-white", Icon: Music2 };

  return (
    <div
      className="glass pointer-events-auto flex animate-scale-in items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
      style={{ boxShadow: "0 20px 50px -12px rgba(0,0,0,0.6)" }}
    >
      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10", config.color)}>
        <config.Icon size={16} fill={toast.type === "liked" ? "currentColor" : "none"} />
      </span>
      <span className="max-w-[70vw] truncate text-sm font-medium text-white/90">
        {toast.message}
      </span>
      <button
        onClick={() => dismissToast(toast.id)}
        className="ml-1 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}
