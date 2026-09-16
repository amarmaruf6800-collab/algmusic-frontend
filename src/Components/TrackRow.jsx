import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import Thumbnail from "./Media";
import { cn, formatTime } from "../lib/utils";
import { useApp } from "../context/AppContext";

/**
 * Premium song row with hover play, equalizer when active, like & menu.
 */
export default function TrackRow({
  song,
  index,
  isActive = false,
  isPlaying = false,
  onPlay,
  onArtist,
  showArtwork = true,
  showIndex = true,
  delay = 0,
}) {
  const { openAddMenu, toggleLike, likedSongs, currentSong, togglePlay } = useApp();
  const liked = likedSongs.some((s) => s.videoId === song.videoId);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 reveal",
        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Index / play */}
      {showIndex && (
        <div className="flex w-7 shrink-0 items-center justify-center">
          {isActive && isPlaying ? (
            <span className="eq text-[var(--accent)]">
              <span />
              <span />
              <span />
              <span />
            </span>
          ) : (
            <>
              <span className="text-sm tabular-nums text-white/40 group-hover:hidden">
                {index + 1}
              </span>
              <button
                onClick={onPlay}
                className="hidden text-[var(--accent)] group-hover:block"
                aria-label="Play"
              >
                <Play size={16} fill="currentColor" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Artwork */}
      {showArtwork && (
        <button onClick={onPlay} className="shrink-0">
          <Thumbnail
            src={song.thumbnail}
            alt={song.title}
            rounded="rounded-xl"
            className="h-12 w-12"
          />
        </button>
      )}

      {/* Meta */}
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={onPlay}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPlay();
          }
        }}
        aria-label={`Play ${song.title}`}
      >
        <p
          className={cn(
            "truncate text-[15px] font-semibold",
            isActive ? "text-[var(--accent)]" : "text-[var(--text)]"
          )}
        >
          {song.title}
        </p>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onArtist?.(song);
          }}
          className="truncate text-sm text-white/45 transition hover:text-white/80 hover:underline"
        >
          {song.artist}
        </button>
      </div>

      {/* Duration */}
      {song.duration && (
        <span className="hidden w-12 shrink-0 text-right text-sm tabular-nums text-white/40 sm:block">
          {formatTime(song.duration_seconds || 0) || song.duration}
        </span>
      )}

      {/* Like */}
      <button
        onClick={() => toggleLike(song)}
        className={cn(
          "shrink-0 rounded-full p-2 opacity-0 transition group-hover:opacity-100",
          liked ? "text-pink-400 opacity-100" : "text-white/45 hover:text-white"
        )}
        aria-label="Like"
      >
        <Heart size={17} fill={liked ? "currentColor" : "none"} />
      </button>

      {/* Menu */}
      <button
        onClick={(e) => openAddMenu(song, e)}
        className="shrink-0 rounded-full p-2 text-white/45 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label="More"
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
