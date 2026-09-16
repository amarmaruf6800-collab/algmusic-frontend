import { History, Play } from "lucide-react";
import Thumbnail from "./Media";

export default function SearchRecent({ recentlyPlayed, onSongClick }) {
  if (!recentlyPlayed || recentlyPlayed.length === 0) return null;

  return (
    <section className="mb-8 animate-fade-in">
      <h2 className="mb-5 flex items-center gap-2.5 font-display text-2xl font-bold text-[var(--text)]">
        <History size={22} className="text-[var(--accent)]" />
        Recent Searches
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {recentlyPlayed.slice(0, 10).map((song, i) => (
          <button
            key={song.videoId + i}
            onClick={() => onSongClick(song)}
            className="group card p-3 text-left transition hover:bg-white/[0.06]"
          >
            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl shadow-md">
              <Thumbnail
                src={song.thumbnail}
                alt={song.title}
                className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                rounded="rounded-xl"
                size="lg"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <span className="flex h-12 w-12 items-center justify-center rounded-full btn-accent shadow-2xl">
                  <Play size={20} fill="currentColor" className="ml-0.5 text-white" />
                </span>
              </div>
            </div>

            <h3 className="truncate text-[15px] font-bold text-[var(--text)]">
              {song.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-white/45">
              {song.artist}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}