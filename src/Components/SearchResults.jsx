import { Music2 } from "lucide-react";
import TrackRow from "./TrackRow";
import MediaCard from "./MediaCard";
import { cn, normalizeSong } from "../lib/utils";

function SearchResults({
  songs,
  artists,
  albums,
  onSongClick,
  onArtistClick,
  onAlbumClick,
  activeTab,
  setActiveTab,
  loading,
}) {
  const tabs = ["all", "songs", "artists", "albums"];
  const normSongs = songs.map(normalizeSong);
  const showSongs = activeTab === "all" || activeTab === "songs";
  const showArtists = activeTab === "all" || activeTab === "artists";
  const showAlbums = activeTab === "all" || activeTab === "albums";
  const artistList = artists || [];
  const albumList = albums || [];

  return (
    <div className="space-y-12">
      {/* Tabs */}
      <div className="sticky top-[68px] z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg)]/80 px-4 py-3 backdrop-blur-xl sm:top-[76px]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition",
              activeTab === tab
                ? "bg-white text-black"
                : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-white/50">
          Searching…
        </p>
      )}

      {/* Songs */}
      {showSongs && normSongs.length > 0 && (
        <section>
          {activeTab === "all" && (
            <h2 className="mb-4 font-display text-2xl font-bold">Songs</h2>
          )}
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {normSongs.map((s, i) => (
              <TrackRow
                key={s.videoId + i}
                song={s}
                index={i}
                onPlay={() => onSongClick(s)}
                onArtist={(song) => song.artistId && onArtistClick(song.artistId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {showArtists && artistList.length > 0 && (
        <section>
          {activeTab === "all" && (
            <h2 className="mb-4 font-display text-2xl font-bold">Artists</h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {artistList.map((a, i) => (
              <MediaCard
                key={a.artistId + i}
                title={a.name}
                subtitle="Artist"
                image={a.thumbnail}
                kind="artist"
                delay={i * 40}
                onClick={() => a.artistId && onArtistClick(a.artistId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {showAlbums && albumList.length > 0 && (
        <section>
          {activeTab === "all" && (
            <h2 className="mb-4 font-display text-2xl font-bold">Albums</h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {albumList.map((al, i) => (
              <MediaCard
                key={al.albumId + i}
                title={al.title}
                subtitle={al.artist || ""}
                image={al.thumbnail}
                kind="album"
                delay={i * 40}
                onClick={() => al.albumId && onAlbumClick(al.albumId)}
              />
            ))}
          </div>
        </section>
      )}

      {!loading &&
        !normSongs.length &&
        !artistList.length &&
        !albumList.length && (
          <div className="py-20 text-center text-white/40">
            <Music2 size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">Nothing found</p>
            <p className="text-sm">Try a different search.</p>
          </div>
        )}
    </div>
  );
}

export default SearchResults;
