// ============================================================
// ALGMUSIC · Shared utilities
// ============================================================

// Backend API base. Empty string = relative '/api' (Vite dev proxy).
// Override with VITE_API_BASE for production/preview builds.
export const API = import.meta.env.VITE_API_BASE || "";

/** Join conditional class names. */
export function cn(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string") out.push(a);
    else if (Array.isArray(a)) out.push(...a);
    else if (typeof a === "object")
      for (const k in a) if (a[k]) out.push(k);
  }
  return out.join(" ");
}

/** Seconds -> m:ss */
export function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "0:00";
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** 12345 -> "12.3K" */
export function formatCount(n) {
  if (n == null) return "";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Pull the best (largest) thumbnail url from YTMusic shapes. */
export function getThumb(thumbnails, fallback = null) {
  if (!thumbnails) return fallback;
  if (typeof thumbnails === "string") return thumbnails;
  if (Array.isArray(thumbnails)) {
    if (!thumbnails.length) return fallback;
    const last = thumbnails[thumbnails.length - 1];
    return last?.url || thumbnails[0]?.url || fallback;
  }
  return thumbnails.url || fallback;
}

/** Normalize the many song shapes in the app into one consistent object. */
export function normalizeSong(song) {
  if (!song) return null;
  const thumb =
    song.thumbnail ||
    getThumb(song.thumbnails) ||
    song.videoDetails?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
    null;

  const artist =
    song.artist ||
    (Array.isArray(song.artists) ? song.artists.map((a) => a.name).join(", ") : null) ||
    song.videoDetails?.author ||
    "Unknown artist";

  const title =
    song.title || song.videoDetails?.title || "Unknown title";

  const artistId =
    song.artistId ||
    (Array.isArray(song.artists) ? song.artists[0]?.id : null) ||
    song.artists?.[0]?.id ||
    null;

  return {
    videoId: song.videoId,
    title,
    artist,
    artistId,
    album: song.album || null,
    thumbnail: thumb,
    duration: song.duration || null,
    duration_seconds: song.duration_seconds || null,
  };
}

const GRADIENTS = [
  ["#8b5cf6", "#ec4899"],
  ["#6366f1", "#22d3ee"],
  ["#f43f5e", "#f59e0b"],
  ["#10b981", "#3b82f6"],
  ["#a855f7", "#6366f1"],
  ["#f472b6", "#8b5cf6"],
  ["#0ea5e9", "#6366f1"],
  ["#fb7185", "#c084fc"],
];

/** Deterministic premium gradient from a string (for image fallbacks). */
export function gradientFromString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  const [a, b] = GRADIENTS[hash % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
