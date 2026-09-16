import { useState } from "react";
import {
  ArrowLeft,
  Play,
  Plus,
  Search,
  X,
  Music2,
  Check,
  Loader2,
} from "lucide-react";
import Thumbnail from "./Media";
import TrackRow from "./TrackRow";
import { API, cn } from "../lib/utils";

function PlaylistDetail({ playlist, onBack, onSongClick, onPlayAll, onAddSong }) {
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const songs = playlist.songs || [];

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.songs || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const headerColor = playlist.color || "#3b1d6e";

  return (
    <div className="pb-10">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[28px] border border-[var(--border)] p-7 sm:p-10"
        style={{ background: `linear-gradient(180deg, ${headerColor}55, var(--bg-elevated))` }}
      >
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl shadow-2xl sm:h-52 sm:w-52">
            {songs[0]?.thumbnail ? (
              <img src={songs[0].thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/50 to-pink-500/30">
                <Music2 size={56} className="text-white/70" />
              </div>
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Playlist
            </p>
            <h1 className="mt-2 break-words font-display text-4xl font-extrabold text-white sm:text-5xl">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="mt-3 max-w-xl text-sm text-white/55">{playlist.description}</p>
            )}
            <p className="mt-3 text-sm text-white/45">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            disabled={!songs.length}
            onClick={() => onPlayAll(songs)}
            className="btn-accent flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 disabled:opacity-40"
          >
            <Play size={24} fill="currentColor" className="ml-0.5" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Plus size={18} /> Add Songs
          </button>
        </div>
      </section>

      {/* Songs */}
      <section className="mt-8">
        {songs.length > 0 ? (
          <div className="space-y-0.5">
            {songs.map((song, i) => (
              <TrackRow
                key={song.videoId + i}
                song={song}
                index={i}
                onPlay={() => onSongClick(song, songs)}
                onArtist={() => {}}
                delay={i * 25}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-white/[0.02] py-16 transition hover:border-[var(--accent)]/40 hover:bg-white/[0.04]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
              <Plus size={24} className="text-white/60" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white/80">Add your first song</p>
            <p className="mt-1 text-xs text-white/45">
              Build this playlist with your favorite music.
            </p>
          </button>
        )}
      </section>

      {/* Add songs modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="glass flex max-h-[80vh] w-full max-w-lg animate-scale-in flex-col rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Add Songs</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search songs…"
                className="w-full rounded-2xl border border-[var(--border)] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--accent)]/60"
              />
            </div>

            <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto">
              {loading && (
                <p className="flex items-center gap-2 py-6 text-sm text-white/50">
                  <Loader2 size={16} className="animate-spin" /> Searching…
                </p>
              )}
              {!loading && results.length === 0 && (
                <p className="py-10 text-center text-sm text-white/40">
                  Search to find music for this playlist.
                </p>
              )}
              {results.map((song) => {
                const inList = songs.some((s) => s.videoId === song.videoId);
                return (
                  <div
                    key={song.videoId}
                    className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.04]"
                  >
                    <Thumbnail src={song.thumbnail} alt={song.title} rounded="rounded-xl" className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{song.title}</p>
                      <p className="truncate text-xs text-white/45">{song.artist}</p>
                    </div>
                    <button
                      disabled={inList}
                      onClick={() => onAddSong(song)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition",
                        inList
                          ? "cursor-not-allowed bg-white/5 text-white/40"
                          : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                      )}
                    >
                      {inList ? <Check size={14} /> : <Plus size={14} />}
                      {inList ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail;
