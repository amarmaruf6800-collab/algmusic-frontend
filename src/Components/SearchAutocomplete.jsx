import { useEffect, useRef, useState } from "react";
import { Search, Music2, UserRound, Disc3, Loader2 } from "lucide-react";
import { API } from "../lib/utils";
import { cachedFetch } from "../lib/apiCache";
import Thumbnail from "./Media";

function SearchAutocomplete({
  value,
  onChange,
  onSearchSubmit,
  onSongClick,
  onArtistClick,
  onAlbumClick,
}) {
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults({ songs: [], artists: [], albums: [] });
      setSearchedQuery("");
      setLoading(false);
      setShowSuggestions(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }
    setShowSuggestions(true);
    setResults({ songs: [], artists: [], albums: [] });
    const timer = setTimeout(async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      try {
        const data = await cachedFetch(
          `search:${query}`,
          `${API}/api/search?q=${encodeURIComponent(query)}`,
          { ttlMs: 120_000, signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setResults({
          songs: data.songs || [],
          artists: data.artists || [],
          albums: data.albums || [],
        });
        setSearchedQuery(query);
      } catch (err) {
        if (err.name !== "AbortError") {
          setResults({ songs: [], artists: [], albums: [] });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" || e.key === "Enter") setShowSuggestions(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const hasResults =
    results.songs.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0;

  function handleSongClick(song) {
    setShowSuggestions(false);
    if (onSongClick) {
      if (searchedQuery !== value.trim()) return;
      onSongClick(song, results);
    }
  }

  function handleArtistClick(artist) {
    setShowSuggestions(false);
    if (onArtistClick) onArtistClick(artist.artistId || artist.browseId);
  }

  function handleAlbumClick(album) {
    setShowSuggestions(false);
    if (onAlbumClick) onAlbumClick(album.albumId || album.browseId);
  }

  function handleSubmitAll() {
    setShowSuggestions(false);
    const cached =
      searchedQuery === value.trim()
        ? { songs: results.songs, artists: results.artists, albums: results.albums }
        : null;
    if (onSearchSubmit) onSearchSubmit(value, cached);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Suggestions dropdown */}
      {showSuggestions && hasResults && searchedQuery === value.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-scale-in overflow-hidden rounded-2xl border border-[var(--border)] glass shadow-2xl">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {results.songs.slice(0, 5).map((song) => (
              <button
                key={song.videoId}
                type="button"
                onClick={() => handleSongClick(song)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
              >
                <Thumbnail src={song.thumbnail} alt={song.title} rounded="rounded-lg" className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                  <p className="truncate text-xs text-white/50">{song.artist}</p>
                </div>
                <Music2 size={16} className="text-white/30" />
              </button>
            ))}

            {results.artists.slice(0, 3).map((artist) => (
              <button
                key={artist.artistId || artist.browseId}
                type="button"
                onClick={() => handleArtistClick(artist)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
              >
                <Thumbnail src={artist.thumbnail} alt={artist.name} rounded="rounded-full" className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{artist.name}</p>
                  <p className="text-xs text-white/50">Artist</p>
                </div>
                <UserRound size={16} className="text-white/30" />
              </button>
            ))}

            {results.albums.slice(0, 3).map((album) => (
              <button
                key={album.albumId || album.browseId || album.title}
                type="button"
                onClick={() => handleAlbumClick(album)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
              >
                <Thumbnail src={album.thumbnail} alt={album.title} rounded="rounded-lg" className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{album.title}</p>
                  <p className="truncate text-xs text-white/50">{album.artist || "Album"}</p>
                </div>
                <Disc3 size={16} className="text-white/30" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmitAll}
            className="flex w-full items-center justify-center gap-2 border-t border-[var(--border)] bg-white/[0.03] py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-white/[0.06]"
          >
            <Search size={15} /> See all results for “{value.trim()}”
          </button>
        </div>
      )}

      {showSuggestions && loading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 flex items-center gap-2 rounded-2xl border border-[var(--border)] glass px-4 py-4 text-sm text-white/50 shadow-2xl">
          <Loader2 size={16} className="animate-spin" /> Searching…
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
