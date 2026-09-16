import { ArrowLeft, Play, Shuffle, MoreHorizontal } from "lucide-react";
import Thumbnail from "./Media";
import TrackRow from "./TrackRow";
import MediaCard from "./MediaCard";
import { getThumb, normalizeSong } from "../lib/utils";

function ArtistPage({ artist, onBack, onSongClick, onAlbumClick }) {
  if (!artist) return null;

  const artistImage =
    getThumb(artist.thumbnails, artist.thumbnails?.[0]?.url) ||
    artist.thumbnails?.[2]?.url ||
    artist.thumbnails?.[0]?.url;

  const songs = (artist.songs?.results || []).map(normalizeSong);
  const albums = artist.albums?.results || [];
  const singles = artist.singles?.results || [];

  const allReleases = [...albums, ...singles].map((a) => ({
    title: a.title,
    subtitle: a.year || a.type || "Album",
    image: getThumb(a.thumbnails),
    albumId: a.browseId,
  }));

  const headerColor = artist.backgroundColor || "#3b1d6e";

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
            src={artistImage}
            alt={artist.name}
            rounded="rounded-full"
            className="h-36 w-36 shadow-2xl sm:h-48 sm:w-48"
            size="lg"
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Artist
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white sm:text-6xl">
              {artist.name}
            </h1>
            <p className="mt-3 text-sm text-white/60">
              {(artist.subscribers || "").toString()} listeners
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <button
            disabled={!songs.length}
            onClick={() => songs[0] && onSongClick(songs[0], songs)}
            className="btn-accent flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 disabled:opacity-40"
          >
            <Play size={24} fill="currentColor" className="ml-0.5" />
          </button>
          <button
            onClick={() => songs[0] && onSongClick(songs[0], shuffleArr(songs))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition hover:bg-white/10"
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white/70 transition hover:bg-white/10">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </section>

      {/* Songs */}
      {songs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-bold">Popular</h2>
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {songs.map((s, i) => (
              <TrackRow
                key={s.videoId + i}
                song={s}
                index={i}
                onPlay={() => onSongClick(s, songs)}
                onArtist={() => {}}
                delay={i * 25}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {allReleases.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-bold">Discography</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {allReleases.map((al, i) => (
              <MediaCard
                key={al.albumId + i}
                title={al.title}
                subtitle={al.subtitle}
                image={al.image}
                kind="album"
                delay={i * 40}
                onClick={() => al.albumId && onAlbumClick(al.albumId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default ArtistPage;
