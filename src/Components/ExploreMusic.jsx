import { useEffect, useRef, useState } from "react";
import {
  Play,
  TrendingUp,
  Globe2,
  Music2,
  Video,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import MediaCard from "./MediaCard";
import TrackRow from "./TrackRow";
import { SkeletonCard } from "./Skeleton";
import { API, getThumb, normalizeSong } from "../lib/utils";
import { cachedFetch } from "../lib/apiCache";
import DiscoverLibrary from "./DiscoverLibrary";

export default function ExploreMusic({
  onSongClick,
  onArtistClick,
  onAlbumClick,
  onBrowseMoods,
}) {
  const [explore, setExplore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    setLoading(true);

    cachedFetch("explore", `${API}/api/explore`, {
      ttlMs: 60_000,
      signal: controller.signal,
    })
      .then((data) => {
        if (alive) setExplore(data);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        console.error("Explore error:", e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  const topSongs = (explore?.top_songs || []).map(normalizeSong);
  const popularArtists = (explore?.popular_artists || []).map((artist) => ({
    artistId: artist.artistId,
    name: artist.name,
    image: artist.image || artist.thumbnail,
  }));
  const newReleases = (explore?.new_releases || []).map((a) => ({
    title: a.title,
    subtitle:
      a.artist ||
      a.artists?.map((x) => x.name).join(", ") ||
      "",
    image: getThumb(a.thumbnails),
    albumId: a.browseId,
    menuSong: null,
  }));

  const newVideos = (explore?.new_videos || []).map((v) => ({
    title: v.title || v.name,
    subtitle:
      v.artist?.name ||
      v.artists?.map((x) => x.name).join(", ") ||
      "",
    image: getThumb(v.thumbnails),
    videoId: v.videoId || v.browseId,
    menuSong: null,
  }));

  const charts =
    explore?.indonesia_charts || explore?.global_charts;

  const chartSongs = (
    charts?.tracks ||
    charts?.songs ||
    []
  )
    .slice(0, 8)
    .map(normalizeSong);

  const featuredSong = topSongs[0];
  const featuredArtist = featuredSong?.artist || "Your next favorite";
  const quickPicks = topSongs.slice(1, 4);

  return (
    <div className="space-y-12">
      {/* ---------------- HERO ---------------- */}
      <section className="explore-hero reveal relative isolate overflow-hidden rounded-[28px] px-6 py-7 shadow-2xl sm:px-10 sm:py-10 lg:min-h-[390px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,.26),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(236,72,153,.20),transparent_34%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full border border-white/5 bg-white/[0.025] blur-sm" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="explore-hero-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-lg shadow-violet-950/20">
              <Sparkles size={13} className="text-fuchsia-300" />
              ALGMusic / Discover
            </span>

            <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-[var(--text)] sm:text-6xl">
              Find the sound that fits <span className="text-gradient">your mood.</span>
            </h1>

            <p className="explore-hero-copy mt-5 max-w-lg text-sm leading-relaxed sm:text-base">
              A daily mix of global favorites, fresh releases, and the songs people are playing right now.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                disabled={!featuredSong}
                onClick={() => featuredSong && onSongClick(featuredSong, topSongs)}
                className="btn-accent flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
              >
                <Play size={17} fill="currentColor" />
                Play discovery mix
              </button>
              <button
                onClick={onBrowseMoods}
                className="explore-hero-secondary flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
              >
                <Search size={17} />
                Explore more
              </button>
            </div>

            <div className="explore-hero-meta mt-8 flex items-center gap-6 text-xs">
              <span><strong>{topSongs.length || "—"}</strong> trending tracks</span>
              <span className="h-1 w-1 rounded-full bg-fuchsia-400" />
              <span><strong>{popularArtists.length || "—"}</strong> artists to discover</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!featuredSong}
            onClick={() => featuredSong && onSongClick(featuredSong, topSongs)}
            className="group relative mx-auto w-full max-w-[290px] text-left lg:mx-0 lg:w-[290px]"
          >
            <div className="absolute -inset-5 rounded-[34px] bg-fuchsia-500/15 blur-3xl transition duration-500 group-hover:bg-violet-500/25" />
            <div className="explore-feature-card relative overflow-hidden rounded-[24px] p-3 shadow-2xl backdrop-blur-xl transition duration-500 group-hover:-translate-y-1">
              <div className="relative aspect-square overflow-hidden rounded-[18px] bg-white/5">
                {featuredSong?.thumbnail ? (
                  <img src={featuredSong.thumbnail} alt={featuredSong.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Music2 size={48} className="text-white/20" /></div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur">Now trending</span>
                <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl transition group-hover:scale-105"><Play size={18} fill="currentColor" /></span>
              </div>
              <div className="px-1 pb-1 pt-3">
                <p className="explore-feature-title truncate text-sm font-bold">{featuredSong?.title || "Loading your mix"}</p>
                <p className="explore-feature-copy mt-1 truncate text-xs">{featuredArtist}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ---------------- QUICK PICKS ---------------- */}
      <section className="reveal grid gap-3 sm:grid-cols-3" style={{ animationDelay: "100ms" }}>
        {quickPicks.map((song, index) => (
          <button
            key={song.videoId + index}
            type="button"
            onClick={() => onSongClick(song, topSongs)}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5">
              {song.thumbnail ? <img src={song.thumbnail} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /> : <Music2 className="m-3 text-white/30" size={24} />}
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100"><Play size={15} fill="currentColor" /></span>
            </div>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white/90">{song.title}</span>
              <span className="mt-0.5 block truncate text-xs text-white/40">{song.artist}</span>
            </span>
            <span className="ml-auto text-xs font-bold text-white/20">0{index + 1}</span>
          </button>
        ))}
      </section>

      <DiscoverLibrary onSongClick={onSongClick} />

      {/* ---------------- TOP SONGS ---------------- */}
      <section className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5">
        <SectionTitle
          icon={TrendingUp}
          title="Trending Now"
          action={
            topSongs.length > 5 && (
              <button
                onClick={() =>
                  onSongClick(topSongs[0], topSongs)
                }
                className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                Play all
                <Play size={14} fill="currentColor" />
              </button>
            )
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2"
              >
                <div className="skeleton h-12 w-12 rounded-xl" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-2/3" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-x-4">
            {topSongs.slice(0, 8).map((s, i) => (
              <TrackRow
                key={s.videoId + i}
                song={s}
                index={i}
                onPlay={() =>
                  onSongClick(s, topSongs)
                }
                onArtist={(song) =>
                  song.artistId &&
                  onArtistClick(song.artistId)
                }
                delay={i * 35}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- POPULAR ARTISTS ---------------- */}
      <section className="rounded-[26px] border border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-transparent p-4 sm:p-6">
        <Carousel
          title="Popular Artists"
          icon={Sparkles}
          loading={loading}
          items={popularArtists}
          render={(artist) => (
            <ArtistCard artist={artist} onClick={onArtistClick} />
          )}
        />
      </section>

      {/* ---------------- NEW RELEASES ---------------- */}
      <section className="explore-releases rounded-[26px] p-4 sm:p-6">
        <Carousel
          title="New Releases"
          icon={Music2}
          loading={loading}
          items={newReleases}
          render={(item) => (
            <MediaCard
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
              kind="album"
              onClick={() => item.albumId && onAlbumClick(item.albumId)}
              onPlay={() => item.albumId && onAlbumClick(item.albumId)}
            />
          )}
        />
      </section>

      {/* ---------------- CHARTS ---------------- */}
      {chartSongs.length > 0 && (
        <section className="rounded-[26px] border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.05] p-4 sm:p-6">
          <SectionTitle
            icon={Globe2}
            title="Top Charts · Indonesia"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {chartSongs.map((s, i) => (
              <TrackRow
                key={s.videoId + i}
                song={s}
                index={i}
                onPlay={() =>
                  onSongClick(s, chartSongs)
                }
                onArtist={(song) =>
                  song.artistId &&
                  onArtistClick(song.artistId)
                }
                delay={i * 35}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- NEW VIDEOS ---------------- */}
      <section className="rounded-[26px] border border-white/[0.06] bg-white/[0.015] p-4 sm:p-6">
        <Carousel
          title="New Videos"
          icon={Video}
          loading={loading}
          items={newVideos}
          render={(item) => (
            <MediaCard
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
              kind="album"
              badge="Video"
              onClick={() => item.videoId && onSongClick({ videoId: item.videoId, title: item.title, artist: item.subtitle, thumbnail: item.image }, [])}
              onPlay={() => item.videoId && onSongClick({ videoId: item.videoId, title: item.title, artist: item.subtitle, thumbnail: item.image }, [])}
            />
          )}
        />
      </section>
    </div>
  );
}

/* ---------------- Section title ---------------- */

function SectionTitle({
  icon: Icon,
  title,
  action,
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold text-[var(--text)]">
        <Icon
          size={22}
          className="text-[var(--accent)]"
        />
        {title}
      </h2>

      {action}
    </div>
  );
}

/* ---------------- Carousel / Grid ---------------- */

function Carousel({
  title,
  icon: Icon,
  items,
  render,
  loading,
  grid = false,
}) {
  const ref = useRef(null);

  const scrollBy = (dir) => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({
      left: dir * (el.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold text-[var(--text)]">
          <Icon
            size={22}
            className="text-[var(--accent)]"
          />
          {title}
        </h2>

        {/* Tombol panah hanya untuk carousel horizontal */}
        {!grid && (
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />
            </button>

            <button
              onClick={() => scrollBy(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={ref}
        className={
          grid
            ? "grid grid-cols-5 justify-items-start gap-x-3 gap-y-6"
            : "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        }
      >
        {loading
          ? Array.from({
            length: grid ? 8 : 6,
          }).map((_, i) => (
            <div
              key={i}
              className={
                grid
                  ? "flex flex-wrap gap-x-3 gap-y-6"
                  : "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              }
            >
              <SkeletonCard />
            </div>
          ))
          : items.slice(0, 10).map((item, i) => (
            <div
              key={(item.title || "") + i}
              className={
                grid
                  ? "w-40 shrink-0"
                  : "w-40 shrink-0 snap-start sm:w-44"
              }
            >
              {render(item)}
            </div>
          ))}
      </div>
    </section>
  );
}

function ArtistCard({ artist, onClick }) {
  return (
    <button
      type="button"
      onClick={() => artist.artistId && onClick(artist.artistId)}
      // 1. Ubah wrapper menjadi lebar penuh (w-full) dan teks di tengah (text-center)
      className="group flex w-full flex-col items-center text-center"
    >
      <div
        className="
          relative aspect-square w-full max-w-[160px] overflow-hidden rounded-full
          bg-[var(--bg-elevated)]
          shadow-lg shadow-black/20
          ring-1 ring-white/5
          transition-all duration-300
          group-hover:-translate-y-1
          group-hover:shadow-xl
          group-hover:shadow-[var(--accent)]/10
        "
      >
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-110
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 size={40} className="text-white/20" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="
            absolute inset-0
            flex items-center justify-center
            bg-black/0
            transition-all duration-300
            group-hover:bg-black/30
          "
        >
          <span
            className="
              flex h-12 w-12 translate-y-2 items-center justify-center
              rounded-full bg-white text-black
              shadow-2xl
              opacity-0
              transition-all duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </span>
        </div>
      </div>

      <h3 className="mt-4 w-full truncate px-1 text-base font-semibold text-[var(--text)]">
        {artist.name}
      </h3>

      <p className="mt-1 w-full truncate text-sm text-white/45">
        Artist
      </p>
    </button>
  );
}