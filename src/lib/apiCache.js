// ============================================================
// ALGMUSIC · Tiny client-side API cache
// Keeps Explore/Search snappy across navigation by caching
// responses in memory (session) with a short TTL.
// ============================================================

const store = new Map(); // key -> { value, expires }

export function cacheGet(key, ttlMs) {
  const hit = store.get(key);
  if (!hit) return null;
  if (ttlMs != null && Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function cacheSet(key, value, ttlMs = 30_000) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export async function cachedFetch(key, url, { ttlMs = 30_000, signal } = {}) {
  const cached = cacheGet(key, ttlMs);
  if (cached !== null) return cached;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  cacheSet(key, data, ttlMs);
  return data;
}
