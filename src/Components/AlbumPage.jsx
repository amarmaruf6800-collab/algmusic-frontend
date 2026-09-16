import { ArrowLeft, Play, MoreHorizontal, Clock3 } from "lucide-react";
import Thumbnail from "./Media";
import TrackRow from "./TrackRow";
import { getThumb, normalizeSong, formatTime } from "../lib/utils";

function AlbumPage({ album, onBack, onSongClick }) {
  if (!album) return null;

  const cover =
    getThumb(album.thumbnails) ||
    album.thumbnails?.[3]?.url ||
    album.thumbnails?.[2]?.url ||
    album.thumbnails?.[0]?.url;

  const tracks = (album.tracks || []).map(normalizeSong);
  const totalSec = tracks.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0);

  const headerColor = album.backgroundColor || "#3b1d6e";

  return (
    <div className="pb-10">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[28px] border border-[var(--border)] p-7 sm:p-10"
        style={{
          background: `linear-gradient(180deg, ${headerColor}55, var(--bg-elevated))`,
        }}
      >
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <Thumbnail
            src={cover}
            alt={album.title}
            rounded="rounded-2xl"
            className="h-44 w-44 shadow-2xl sm:h-56 sm:w-56"
            size="lg"
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Album
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white sm:text-6xl">
              {album.title}
            </h1>
            <p className="mt-3 text-sm text-white/60">
              {album.artist || album.artists?.map((a) => a.name).join(", ")} ·{" "}
              {album.year || ""} · {tracks.length} songs · {formatTime(totalSec)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <button
            disabled={!tracks.length}
            onClick={() => tracks[0] && onSongClick(tracks[0], tracks)}
            className="btn-accent flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 disabled:opacity-40"
          >
            <Play size={24} fill="currentColor" className="ml-0.5" />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white/70 transition hover:bg-white/10">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </section>

      {/* Tracks */}
      <section className="mt-8">
        <div className="mb-2 hidden grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[var(--border)] px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40 sm:grid">
          <span>#</span>
          <span>Title</span>
          <span><Clock3 size={14} /></span>
        </div>
        <div className="space-y-0.5">
          {tracks.map((s, i) => (
            <TrackRow
              key={s.videoId + i}
              song={s}
              index={i}
              onPlay={() => onSongClick(s, tracks)}
              onArtist={() => {}}
              delay={i * 25}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AlbumPage;
