// ============================================================
// ALGMUSIC · Lightweight toast store (framework-agnostic)
// ============================================================
const listeners = new Set();
let toasts = [];
let seq = 0;

function emit() {
  for (const fn of listeners) fn(toasts);
}

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function pushToast(message, opts = {}) {
  const id = ++seq;
  const toast = {
    id,
    message,
    type: opts.type || "default", // default | success | error | liked
    icon: opts.icon || null,
  };
  toasts = [...toasts, toast];
  emit();
  const duration = opts.duration ?? 2800;
  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    }, duration);
  }
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}
