import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import Thumbnail from "./Media";
import { cn } from "../lib/utils";
import { useApp } from "../context/AppContext";

/**
 * Premium square card for albums / playlists / artists.
 * Shows a play button overlay on hover and a context menu (…).
 */
export default function MediaCard({
  title,
  subtitle,
  image,
  onClick,
  onPlay,
  isPlaying = false,
  menuSong = null,
  footer,
  badge,
  delay = 0,
}) {
  const { openAddMenu } = useApp();

  return (
    <div
      className="group card reveal relative cursor-pointer p-3"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl">
        <Thumbnail
          src={image}
          alt={title}
          rounded="rounded-2xl"
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          size="lg"
        />

        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {badge}
          </span>
        )}

        {/* Play / Pause FAB */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          className={cn(
            "absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full btn-accent opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
            isPlaying ? "translate-y-0 opacity-100" : "translate-y-2"
          )}
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[var(--text)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-[var(--text-dim)]">{subtitle}</p>
          )}
        </div>

        {menuSong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAddMenu(menuSong, e);
            }}
            className="shrink-0 rounded-full p-1.5 text-white/40 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {footer && <div className="mt-1 text-xs text-[var(--text-faint)]">{footer}</div>}
    </div>
  );
}
