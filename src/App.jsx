import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Sun, Moon, Music2, Heart, User, LogIn, LogOut, Plus, Check } from "lucide-react";

import { API, getThumb, normalizeSong } from "./lib/utils";
import { AppContext } from "./context/AppContext";
import { pushToast } from "./lib/toast";

import Sidebar from "./Components/Sidebar";
import Player from "./Components/Player";
import ContextMenu from "./Components/ContextMenu";
import Toaster from "./Components/Toaster";
import ExploreMusic from "./Components/ExploreMusic";
import SearchResults from "./Components/SearchResults";
import SearchRecent from "./Components/SearchRecent";
import SearchAutocomplete from "./Components/SearchAutocomplete";
import ArtistPage from "./Components/ArtistPage";
import AlbumPage from "./Components/AlbumPage";
import LikedSongs from "./Components/LikedSongs";
import PlaylistDetail from "./Components/PlaylistDetail";
import Library from "./Components/Library";
import AuthModal from "./Components/AuthModal";
import MobileNav from "./Components/MobileNav";

const STORE = {
  playlists: "algmusic-playlists",
  liked: "algmusic-liked-songs",
  recent: "algmusic-recently-played",
  theme: "algmusic-theme",
  token: "algmusic_token",
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORE.token));
  const [userName, setUserName] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const handleAuthSuccess = useCallback((nextToken) => {
    localStorage.setItem(STORE.token, nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORE.token);
    setToken(null);
    setUserName("");
    pushToast("You have been logged out");
  }, []);

  const authFetch = useCallback(
    (url, options = {}) => {
      const headers = new Headers(options.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  const readApiError = async (response, fallback) => {
    try {
      const data = await response.json();
      return data.detail || fallback;
    } catch {
      return fallback;
    }
  };

  /* ============================ SEARCH ============================ */
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    songs: [],
    artists: [],
    albums: [],
  });
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  /* ========================== NAVIGATION ========================== */
  const [currentPage, setCurrentPage] = useState("home");

  /* ============================ PLAYBACK ========================== */
  const [queue, setQueue] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackKey, setPlaybackKey] = useState(0);

  /* ===================== FULLSCREEN / QUEUE ====================== */
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  /* ========================= DATA STORES ========================= */
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const playlistRequests = useRef(new Map());

  useEffect(() => {
    if (!token) {
      setUserName("");
      return;
    }
    authFetch(`${API}/api/auth/me`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        const profile = await res.json();
        setUserName(profile.username);
      })
      .catch((error) => pushToast(error.message, { type: "error" }));
  }, [authFetch, token]);

  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      setLikedSongs([]);
      setRecentlyPlayed([]);
      return;
    }

    let active = true;
    Promise.allSettled([
      authFetch(`${API}/api/library/liked`),
      authFetch(`${API}/api/library/playlists`),
      authFetch(`${API}/api/library/recent`),
    ])
      .then(async (results) => {
        const labels = ["liked songs", "playlists", "recently played"];
        const errors = [];
        for (let index = 0; index < results.length; index += 1) {
          const result = results[index];
          if (result.status === "rejected") {
            errors.push(`${labels[index]}: ${result.reason.message}`);
            continue;
          }
          if (!result.value.ok) {
            errors.push(`${labels[index]}: ${await readApiError(result.value, "request failed")}`);
            continue;
          }
          const data = await result.value.json();
          if (index === 0) setLikedSongs(data);
          if (index === 1) setPlaylists(data);
          if (index === 2) setRecentlyPlayed(data);
        }
        if (active && errors.length) pushToast(`Library error: ${errors.join("; ")}`, { type: "error" });
      })
      .catch((error) => {
        if (active) pushToast(error.message, { type: "error" });
      });

    return () => {
      active = false;
    };
  }, [token, authFetch]);

  /* =========================== THEME ============================= */
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORE.theme) || "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORE.theme, theme);
  }, [theme]);
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  /* ====================== DETAIL PAGES =========================== */
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  /* ====================== CONTEXT MENU =========================== */
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, song: null });

  /* ========================= PLAYLIST =========================== */
  const createPlaylist = useCallback(async (name, description = "") => {
    if (!token) {
      setShowAuth(true);
      return null;
    }
    const newPlaylist = {
      id: (crypto.randomUUID && crypto.randomUUID()) || `pl_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      songs: [],
    };
    try {
      const res = await authFetch(`${API}/api/library/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newPlaylist.id,
          name: newPlaylist.name,
          description: newPlaylist.description,
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to create playlist"));
      const saved = await res.json();
      setPlaylists((current) => [...current, saved]);
      return saved;
    } catch (error) {
      pushToast(error.message, { type: "error" });
      return null;
    }
  }, [authFetch, token]);

  const addSongToPlaylist = useCallback((playlistId, song) => {
    const norm = normalizeSong(song);
    if (!norm) return;
    if (!token) {
      setShowAuth(true);
      return;
    }
    setPlaylists((current) => {
      const updated = current.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const songs = pl.songs || [];
        if (songs.some((s) => s.videoId === norm.videoId)) return pl;
        return { ...pl, songs: [...songs, norm] };
      });
      return updated;
    });
    const previousRequest = playlistRequests.current.get(playlistId) || Promise.resolve();
    const request = previousRequest
      .catch(() => { })
      .then(async () => {
        const res = await authFetch(`${API}/api/library/playlists/${playlistId}/songs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: norm.videoId,
            title: norm.title,
            artist: norm.artist,
            thumbnail: norm.thumbnail,
          }),
        });
        if (!res.ok) throw new Error(await readApiError(res, "Failed to save playlist song"));
        const saved = await res.json();
        setPlaylists((current) => current.map((item) => item.id === saved.id ? saved : item));
      })
      .catch((error) => pushToast(error.message, { type: "error" }));
    playlistRequests.current.set(playlistId, request);
    request.finally(() => {
      if (playlistRequests.current.get(playlistId) === request) {
        playlistRequests.current.delete(playlistId);
      }
    });
    return request;
  }, [authFetch, token]);

  /* =========================== SEARCH =========================== */
  const searchSongs = useCallback(async (searchQuery = query) => {
    const clean = searchQuery.trim();
    if (!clean) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/search?q=${encodeURIComponent(clean)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data);
      return data;
    } catch (e) {
      console.error("Search error:", e);
      setSearchResults({ songs: [], artists: [], albums: [] });
      return null;
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSearchSubmit = useCallback((searchQuery, cached = null) => {
    const clean = searchQuery.trim();
    if (!clean) return;
    setQuery(clean);
    setCurrentPage("search");
    setActiveTab("all");
    if (cached) {
      setSearchResults(cached);
      setCurrentPage("search");
      return;
    }
    searchSongs(clean);
  }, [searchSongs]);

  /* ========================= SELECT SONG ======================== */
  const selectSong = useCallback(async (song, queueOverride) => {
    if (!song?.videoId) return;
    try {
      const res = await fetch(`${API}/api/songs/${song.videoId}`);
      if (!res.ok) throw new Error("Failed to fetch song");
      const data = await res.json();
      const vd = data.videoDetails || {};
      const current = {
        videoId: vd.videoId || song.videoId,
        title: vd.title || song.title || "Unknown title",
        artist: vd.author || song.artist || "Unknown artist",
        thumbnail:
          getThumb(vd.thumbnail?.thumbnails) || song.thumbnail || null,
        duration_seconds:
          Number(vd.lengthSeconds) || song.duration_seconds || 0,
      };
      if (Array.isArray(queueOverride)) setQueue(queueOverride);
      setCurrentSong(current);
      setPlaybackKey((k) => k + 1);
      setIsPlaying(true);
      if (!Array.isArray(queueOverride)) {
        fetch(`${API}/api/watch-playlist?video_id=${encodeURIComponent(current.videoId)}&limit=25`)
          .then((response) => response.ok ? response.json() : null)
          .then((watchData) => {
            const watchTracks = (watchData?.tracks || watchData?.items || [])
              .map(normalizeSong)
              .filter((item) => item?.videoId);
            if (watchTracks.length > 1) setQueue(watchTracks);
          })
          .catch((error) => console.warn("Watch playlist unavailable:", error));
      }
      setRecentlyPlayed((prev) => {
        const filtered = prev.filter((i) => i.videoId !== song.videoId);
        const updated = [
          {
            videoId: song.videoId,
            title: current.title,
            artist: current.artist,
            thumbnail: current.thumbnail,
          },
          ...filtered,
        ].slice(0, 12);
        return updated;
      });
      if (token) {
        authFetch(`${API}/api/library/recent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: current.videoId,
            title: current.title,
            artist: current.artist,
            thumbnail: current.thumbnail,
          }),
        }).catch((error) => console.error("Recently played sync error:", error));
      }
    } catch (e) {
      console.error("Select song error:", e);
    }
  }, [authFetch, token]);

  const selectSearchSong = useCallback(
    (song, searchData = null) => {
      if (!song?.videoId) return;
      if (searchData && !Array.isArray(searchData)) {
        setSearchResults(searchData);
        setActiveTab("all");
        setQueue(searchData.songs || []);
      } else if (Array.isArray(searchData) && searchData.length) {
        setQueue(searchData);
      }
      setCurrentPage("search");
      selectSong(song);
    },
    [selectSong]
  );

  /* ============================ LIKE ============================ */
  const isCurrentLiked = currentSong
    ? likedSongs.some((s) => s.videoId === currentSong.videoId)
    : false;

  const toggleLike = useCallback(
    async (songArg) => {
      const target = songArg || currentSong;
      if (!target?.videoId) return;
      if (!token) {
        setShowAuth(true);
        return;
      }
      const songData = {
        videoId: target.videoId,
        title: target.title,
        artist: target.artist,
        thumbnail: target.thumbnail,
      };
      const already = likedSongs.some((s) => s.videoId === target.videoId);
      setLikedSongs((current) => already
        ? current.filter((s) => s.videoId !== target.videoId)
        : [songData, ...current]);
      try {
        const res = await authFetch(`${API}/api/library/liked/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(songData),
        });
        if (!res.ok) throw new Error(await readApiError(res, "Failed to update liked songs"));
        if (!songArg) pushToast(already ? "Removed from Liked Songs" : "Added to Liked Songs", { type: already ? "default" : "liked" });
      } catch (error) {
        setLikedSongs((current) => already ? [songData, ...current] : current.filter((s) => s.videoId !== target.videoId));
        pushToast(error.message, { type: "error" });
      }
    },
    [authFetch, currentSong, likedSongs, token]
  );

  const removeLikedSong = useCallback(async (videoId) => {
    if (!token) return;
    const previous = likedSongs;
    setLikedSongs((current) => current.filter((song) => song.videoId !== videoId));
    try {
      const res = await authFetch(`${API}/api/library/liked/${encodeURIComponent(videoId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to remove liked song"));
    } catch (error) {
      setLikedSongs(previous);
      pushToast(error.message, { type: "error" });
    }
  }, [authFetch, likedSongs, token]);

  /* ========================= ARTIST / ALBUM ===================== */
  const selectArtist = useCallback(async (artistId) => {
    if (!artistId) return;
    try {
      const res = await fetch(`${API}/api/artists/${artistId}`);
      if (!res.ok) throw new Error("Failed to fetch artist");
      const data = await res.json();
      setSelectedArtist(data);
      setSelectedAlbum(null);
      setCurrentPage("artist");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Artist error:", e);
    }
  }, []);

  const selectAlbum = useCallback(async (albumId) => {
    if (!albumId) return;
    try {
      const res = await fetch(`${API}/api/albums/${albumId}`);
      if (!res.ok) throw new Error("Failed to fetch album");
      const data = await res.json();
      setSelectedAlbum(data);
      setSelectedArtist(null);
      setCurrentPage("album");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Album error:", e);
    }
  }, []);

  /* ========================= PLAYLIST OPEN ====================== */
  const openPlaylist = useCallback((playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentPage("playlist");
  }, []);

  /* ===================== CONTEXT MENU LOGIC ===================== */
  const openAddMenu = useCallback((song, e) => {
    const x = e?.clientX ?? e?.touches?.[0]?.clientX ?? 0;
    const y = e?.clientY ?? e?.touches?.[0]?.clientY ?? 0;
    setMenu({ open: true, x, y, song });
  }, []);

  const closeMenu = useCallback(
    () => setMenu((m) => ({ ...m, open: false })),
    []
  );

  const menuItems = (() => {
    if (!menu.song) return [];
    const song = menu.song;
    const items = [
      {
        label:
          isCurrentLiked && currentSong?.videoId === song.videoId
            ? "Remove from Liked"
            : "Add to Liked",
        icon: <Heart size={16} />,
        onClick: () => toggleLike(song),
      },
      {
        label: "Go to artist",
        icon: <User size={16} />,
        onClick: () => {
          const id = song.artistId || song.artists?.[0]?.id;
          if (id) selectArtist(id);
          else pushToast("Artist info unavailable", { type: "error" });
        },
        separatorBefore: true,
      },
    ];
    if (playlists.length) {
      items.push({ separatorBefore: true, label: "Add to playlist", header: true });
      playlists.forEach((pl) => {
        const inIt = (pl.songs || []).some((s) => s.videoId === song.videoId);
        items.push({
          label: pl.name,
          icon: inIt ? <Check size={16} /> : <Plus size={16} />,
          onClick: () => {
            if (inIt) return;
            addSongToPlaylist(pl.id, song);
            pushToast(`Added to ${pl.name}`, { type: "success" });
          },
        });
      });
    }
    items.push({
      label: "Create new playlist",
      icon: <Plus size={16} />,
      onClick: () => {
        const name = window.prompt("New playlist name", `${song.title} Mix`);
        if (name && name.trim()) {
          createPlaylist(name.trim()).then((pl) => {
            if (!pl) return;
            addSongToPlaylist(pl.id, song);
            pushToast(`Created "${pl.name}"`, { type: "success" });
          });
        }
      },
    });
    return items;
  })();

  /* ============================ CONTEXT ========================== */
  const ctx = {
    token,
    isAuthenticated: Boolean(token),
    authFetch,
    openAuth: () => setShowAuth(true),
    logout,
    theme,
    toggleTheme,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    openAddMenu,
    openNowPlaying: () => setShowNowPlaying(true),
    queue,
    currentSong,
    isPlaying,
    togglePlay: () => setIsPlaying((p) => !p),
    likedSongs,
    toggleLike,
  };

  /* ============================ RENDER ========================== */
  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen text-[var(--text)]">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          theme={theme}
          toggleTheme={toggleTheme}
          isAuthenticated={Boolean(token)}
          userName={userName}
          onLogin={() => setShowAuth(true)}
          onLogout={logout}
        />
        <MobileNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <div className="md:ml-72 lg:ml-80">
          {/* ---------------- HEADER (RESPONSIVE) ---------------- */}
          <header className="sticky top-0 z-40 glass border-b border-[var(--border)]">

            {/* ROW 1: MOBILE BRANDING (Hanya tampil di HP) */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1 md:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-md">
                  <Music2 size={16} className="text-white" />
                </span>
                <span className="font-display text-xl font-extrabold text-[var(--text)]">
                  ALG<span className="text-[var(--accent)]">Music</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-white/80 transition hover:bg-white/10"
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                {token ? (
                  <button
                    onClick={logout}
                    aria-label={`Log out ${userName || "account"}`}
                    title={userName || "Account"}
                    className="flex h-8 max-w-28 items-center justify-center rounded-full btn-accent px-3 text-[10px] font-bold text-white shadow-md"
                  >
                    <span className="truncate">{userName || "VIP"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    aria-label="Log in"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-white/70"
                  >
                    U
                  </button>
                )}
              </div>
            </div>

            {/* ROW 2: SEARCH & DESKTOP ICONS */}
            <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 pb-3 pt-2 sm:px-6 md:gap-5 md:py-4">
              <div className="relative flex-1 md:max-w-xl">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit(query);
                  }}
                  placeholder="Search songs, artists, albums…"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--accent)]/60 focus:bg-white/[0.07]"
                />
                <SearchAutocomplete
                  value={query}
                  onChange={setQuery}
                  onSearchSubmit={handleSearchSubmit}
                  onSongClick={(song, q) => selectSearchSong(song, q)}
                  onArtistClick={selectArtist}
                  onAlbumClick={selectAlbum}
                />
              </div>

              {/* Ikon Tema dan Login di Desktop (Disembunyikan di HP) */}
              <div className="hidden items-center gap-3 md:flex">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/[0.04] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={token ? logout : () => setShowAuth(true)}
                  aria-label={token ? "Log out" : "Log in"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/[0.04] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {token ? <LogOut size={18} /> : <LogIn size={18} />}
                </button>
              </div>
            </div>
          </header>

          {/* ---------------- MAIN CONTENT ---------------- */}
          <main className="mx-auto max-w-[1600px] px-4 pb-44 pt-6 sm:px-6 md:pb-40">
            {currentPage === "home" && (
              <ExploreMusic
                onSongClick={(song, q) => selectSong(song, q)}
                onArtistClick={selectArtist}
                onAlbumClick={selectAlbum}
                onBrowseMoods={() => { setCurrentPage("search"); setSearchResults({ songs: [], artists: [], albums: [] }); setQuery(""); }}
              />
            )}

            {currentPage === "search" && (
              <>
                {!searchResults.songs.length &&
                  !searchResults.artists.length &&
                  !searchResults.albums.length && (
                    <SearchRecent
                      recentlyPlayed={recentlyPlayed}
                      onSongClick={(song) => selectSong(song)}
                    />
                  )}

                {searchResults.songs.length ||
                  searchResults.artists.length ||
                  searchResults.albums.length ? (
                  <div className="mt-2">
                    <SearchResults
                      songs={searchResults.songs}
                      artists={searchResults.artists}
                      albums={searchResults.albums}
                      onSongClick={(song) => selectSong(song, searchResults.songs)}
                      onArtistClick={selectArtist}
                      onAlbumClick={selectAlbum}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      loading={loading}
                    />
                  </div>
                ) : (
                  recentlyPlayed.length === 0 && (
                    <div className="animate-fade-in py-24 text-center text-white/40">
                      <Search size={42} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-semibold">What do you want to listen to?</p>
                      <p className="mt-1 text-sm">
                        Search for songs, artists, or albums.
                      </p>
                    </div>
                  )
                )}
              </>
            )}

            {currentPage === "artist" && selectedArtist && (
              <ArtistPage
                artist={selectedArtist}
                onBack={() => setCurrentPage("home")}
                onSongClick={(song, q) => selectSong(song, q)}
                onAlbumClick={selectAlbum}
              />
            )}

            {currentPage === "album" && selectedAlbum && (
              <AlbumPage
                album={selectedAlbum}
                onBack={() => setCurrentPage("home")}
                onSongClick={(song, q) => selectSong(song, q)}
              />
            )}

            {currentPage === "liked" && (
              <LikedSongs
                songs={likedSongs}
                onSongClick={(song) => selectSong(song)}
                onRemove={removeLikedSong}
                onPlayAll={() => {
                  if (likedSongs.length) selectSong(likedSongs[0], likedSongs);
                }}
              />
            )}

            {currentPage === "library" && (
              <Library
                likedSongs={likedSongs}
                recentlyPlayed={recentlyPlayed}
                playlists={playlists}
                onSongClick={(song) => selectSong(song)}
                onOpenLiked={() => setCurrentPage("liked")}
                onCreatePlaylist={createPlaylist}
                onOpenPlaylist={openPlaylist}
              />
            )}

            {currentPage === "playlist" && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                onBack={() => {
                  setSelectedPlaylist(null);
                  setCurrentPage("library");
                }}
                onSongClick={(song, q) => selectSong(song, q)}
                onPlayAll={(songs) => {
                  if (songs?.length) selectSong(songs[0], songs);
                }}
                onAddSong={(song) => {
                  addSongToPlaylist(selectedPlaylist.id, song);
                  pushToast(`Added to ${selectedPlaylist.name}`, { type: "success" });
                }}
              />
            )}
          </main>
        </div>

        {/* ---------------- PLAYER ---------------- */}
        <Player
          song={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isLiked={isCurrentLiked}
          onLike={toggleLike}
          queue={queue}
          onSongChange={(song) => selectSong(song)}
          playbackKey={playbackKey}
          showNowPlaying={showNowPlaying}
          setShowNowPlaying={setShowNowPlaying}
          showQueue={showQueue}
          setShowQueue={setShowQueue}
        />

        {/* ---------------- OVERLAYS ---------------- */}
        <ContextMenu
          open={menu.open}
          onClose={closeMenu}
          x={menu.x}
          y={menu.y}
          title="Song options"
          items={menuItems}
        />
        <Toaster />
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </AppContext.Provider>
  );
}

export default App;