# ALGMusic — Premium Redesign

Website telah ditingkatkan ke level premium (setara Apple Music / Spotify) dengan
arsitektur yang lebih profesional, responsif, dan banyak fitur baru.

## Cara menjalankan

1. Backend (FastAPI, butuh Python + venv):
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn main:app --reload --port 8000
   ```
2. Frontend (Vite):
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Buka http://localhost:5173

> Frontend memanggil backend lewat proxy Vite (`/api` -> http://127.0.0.1:8000),
> jadi tidak perlu CORS manual.

## Yang baru / ditingkatkan

### Desain "Premium"
- Design system lengkap: token warna (CSS variables), tipografi (Space Grotesk +
  Inter), glassmorphism, gradient accent, shadow glow.
- Tema **Dark / Light** yang bisa di-switch (disimpan di localStorage).
- Animasi halus (fade-up reveal, scale-in, slide, equalizer, shimmer skeleton,
  marquee judul).
- Background ambient gradient di belakang semua konten.

### Fungsi profesional
- **Player bar** di bawah: kontrol play/pause, prev/next, shuffle, repeat
  (off/all/one), volume, progress bar yang bisa diklik, like.
- **Fullscreen Now Playing**: cover besar dengan glow, kontrol besar, toggle
  lyrics / cover, equalizer saat diputar.
- **Lyrics** sinkron dengan timestamp (dari backend).
- **Queue panel** slide-in di kanan.
- **Context menu** (⋯) pada tiap lagu: Add to Liked, Go to artist, Add to
  playlist (pilih/buat playlist).
- **Toast** notifikasi premium (added to playlist, liked, dll).
- **Search** dengan autocomplete dropdown + halaman hasil lengkap (songs /
  artists / albums tabs).
- Halaman **Home/Explore** dengan hero, moods, trending, new releases (carousel),
  charts, new videos.
- Halaman **Artist** & **Album** dengan header gradien dan discography.
- **Library** dengan tabs, recently played, create playlist modal.
- **Playlist detail** dengan add-songs modal (cari & tambah).
- **Responsif** penuh: sidebar collapsible di mobile, grid adaptif, touch-friendly.

### Struktur kode
- `src/lib/utils.js` — helper (format, normalize song, gradient fallback).
- `src/lib/toast.js` — toast store.
- `src/context/AppContext.js` — context global (theme, playlists, add-to-menu).
- `src/Components/Media.jsx` — Thumbnail cerdas (fallback gradien + inisial).
- `src/Components/MediaCard.jsx` / `TrackRow.jsx` — kartu & baris lagu reusable.
- `src/Components/Player.jsx` — player + now playing + queue.
- `src/Components/ContextMenu.jsx`, `Toaster.jsx`, `Skeleton.jsx`.
