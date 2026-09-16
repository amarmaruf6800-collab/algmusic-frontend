import { useState } from "react";
import {
  Heart,
  Plus,
  Music2,
  X,
  ChevronRight,
  ListMusic,
  Play,
} from "lucide-react";
import Thumbnail from "./Media";
import { cn, getThumb } from "../lib/utils";

function Library({
  likedSongs,
  recentlyPlayed,
  playlists,
  onSongClick,
  onOpenLiked,
  onCreatePlaylist,
  onOpenPlaylist,
}) {
  const [tab, setTab] = useState("all"); // all | playlists | liked
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist(name.trim());
    setName("");
    setShowModal(false);
  }

  const filteredPlaylists = playlists;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Your Library</h1>
          <p className="mt-1 text-sm text-white/45">
            {playlists.length} playlists · {likedSongs.length} liked songs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-accent flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
        >
          <Plus size={18} /> New Playlist
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {[
          { k: "all", l: "All" },
          { k: "playlists", l: "Playlists" },
          { k: "liked", l: "Liked" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t.k
                ? "bg-white text-black"
                : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Liked shortcut */}
      {(tab === "all" || tab === "liked") && (
        <button
          onClick={onOpenLiked}
          className="card mb-5 flex w-full items-center gap-4 p-3 text-left transition hover:bg-white/[0.06]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg">
            <Heart size={28} fill="white" className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">Liked Songs</p>
            <p className="truncate text-sm text-white/45">
              {likedSongs.length} songs
            </p>
          </div>
          <ChevronRight size={20} className="text-white/40" />
        </button>
      )}

      {/* Recently played */}
      {tab === "all" && recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/45">
            Recently Played
          </h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {recentlyPlayed.map((s) => (
              <button
                key={s.videoId}
                onClick={() => onSongClick(s)}
                className="group w-[140px] shrink-0 rounded-2xl bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]"
              >
                <div className="relative mb-2 overflow-hidden rounded-xl">
                  <Thumbnail src={s.thumbnail} alt={s.title} rounded="rounded-xl" className="aspect-square w-full" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <Play size={22} fill="currentColor" className="text-white" />
                  </span>
                </div>
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="truncate text-xs text-white/45">{s.artist}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Playlists grid */}
      {(tab === "all" || tab === "playlists") && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/45">
            Playlists
          </h2>
          {filteredPlaylists.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-white/[0.02] py-16 text-center">
              <ListMusic size={40} className="mx-auto text-white/20" />
              <p className="mt-4 font-semibold">No playlists yet</p>
              <p className="mt-1 text-sm text-white/45">
                Create one to start collecting your favorites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredPlaylists.map((pl) => {
                const cover = pl.songs?.[0]?.thumbnail;
                return (
                  <button
                    key={pl.id}
                    onClick={() => onOpenPlaylist(pl)}
                    className="card group p-3 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl">
                      {cover ? (
                        <img src={cover} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 to-pink-500/30">
                          <Music2 size={36} className="text-white/70" />
                        </div>
                      )}
                    </div>
                    <p className="truncate font-bold">{pl.name}</p>
                    <p className="truncate text-xs text-white/45">
                      {pl.songs?.length || 0} songs
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ---- Create modal ---- */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-md animate-scale-in rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Create Playlist</h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-white/60 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="My awesome mix"
                className="mb-5 w-full rounded-xl border border-[var(--border)] bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--accent)]/60 focus:bg-white/[0.06]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-accent rounded-full px-6 py-2.5 text-sm font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
