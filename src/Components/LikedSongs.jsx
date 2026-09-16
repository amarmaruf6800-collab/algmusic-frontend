import { Heart, Play } from "lucide-react";
import TrackRow from "./TrackRow";

function LikedSongs({ songs, onSongClick, onPlayAll }) {
  const totalSeconds = songs.reduce(
    (acc, s) => acc + (Number(s.duration_seconds) || 0),
    0
  );
  const mins = Math.round(totalSeconds / 60);

  return (
    <div className="pb-10">
      {/* Header */}
      <section className="relative mb-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-pink-600/30 via-violet-700/20 to-[var(--bg-elevated)] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-2xl sm:h-40 sm:w-40">
            <Heart size={56} fill="white" className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Playlist
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Liked Songs
            </h1>
            <p className="mt-3 text-sm text-white/60">
              {songs.length} songs · {mins} min
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex items-center gap-3">
          <button
            disabled={!songs.length}
            onClick={onPlayAll}
            className="btn-accent flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 disabled:opacity-40"
          >
            <Play size={24} fill="currentColor" className="ml-0.5" />
          </button>
          <span className="text-sm text-white/55">
            {songs.length ? "Press play to enjoy your favorites" : "No songs yet"}
          </span>
        </div>
      </section>

      {/* List */}
      {songs.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-white/[0.02] py-20 text-center">
          <Heart size={42} className="mx-auto text-white/20" />
          <h2 className="mt-5 text-lg font-bold">Your liked songs will appear here</h2>
          <p className="mt-2 text-sm text-white/45">
            Start liking songs to build your collection.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {songs.map((song, i) => (
            <TrackRow
              key={song.videoId + i}
              song={song}
              index={i}
              onPlay={() => onSongClick(song)}
              onArtist={() => { }}
              delay={i * 25}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LikedSongs;
