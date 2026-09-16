import { useEffect, useRef, useState, useCallback } from "react";
import YouTube from "react-youtube";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Mic2,
  ListMusic,
  Maximize2,
  X,
  Timer,
  Check,
  Shuffle,
  Repeat,
  Repeat1,
  Music2,
} from "lucide-react";
import { cn, formatTime, getThumb, API } from "../lib/utils";
import { pushToast } from "../lib/toast";
import Thumbnail from "./Media";

export default function Player({
  song,
  isPlaying,
  setIsPlaying,
  isLiked,
  onLike,
  queue = [],
  onSongChange,
  playbackKey,
  showNowPlaying,
  setShowNowPlaying,
  showQueue,
  setShowQueue,
}) {
  const playerRef = useRef(null);
  const lyricRefs = useRef([]);
  const progressRef = useRef(null);
  const seekingRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [showLyrics, setShowLyrics] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsAvailable, setLyricsAvailable] = useState(true);
  const [activeLyric, setActiveLyric] = useState(-1);
  const [sleepMinutes, setSleepMinutes] = useState(0); // 0 = off
  const [sleepLeft, setSleepLeft] = useState(0);
  const sleepRef = useRef(null);
  const sleepTick = useRef(null);

  const videoId = song?.videoId;

  /* ---------------- YouTube events ---------------- */
  const handleReady = (e) => {
    playerRef.current = e.target;
    setDuration(e.target.getDuration());
    e.target.setVolume(muted ? 0 : volume);
    if (isPlaying) e.target.playVideo();
  };

  const handleState = (e) => {
    if (e.data === 1) setIsPlaying(true);
    if (e.data === 2) setIsPlaying(false);
  };

  const handleEnd = () => {
    if (repeat === "one") {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }
    nextSong();
  };

  /* ---------------- Progress ticker ---------------- */
  useEffect(() => {
    const id = setInterval(() => {
      if (!playerRef.current || seekingRef.current) return;
      setCurrentTime(playerRef.current.getCurrentTime());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------------- Lyric sync ---------------- */
  useEffect(() => {
    if (!lyrics.length) return;
    const idx = lyrics.findLastIndex(
      (l) => l.start_time != null && currentTime * 1000 >= l.start_time
    );
    const realIdx = idx === -1 ? -1 : idx;
    setActiveLyric(realIdx);
  }, [currentTime, lyrics]);

  useEffect(() => {
    const realIdx = activeLyric;
    if (showNowPlaying && showLyrics && realIdx >= 0 && lyricRefs.current[realIdx]) {
      lyricRefs.current[realIdx].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLyric, showNowPlaying, showLyrics]);

  /* ---------------- Load lyrics on song change ---------------- */
  useEffect(() => {
    if (!videoId) return;
    setLyrics([]);
    setActiveLyric(-1);
    const controller = new AbortController();
    (async () => {
      setLyricsLoading(true);
      setLyricsAvailable(true);
      try {
        const res = await fetch(`${API}/api/songs/${videoId}/lyrics`, { signal: controller.signal });
        if (!res.ok) throw new Error("lyrics failed");
        const data = await res.json();
        const raw = data.lyrics?.lyrics ?? data.lyrics;
        if (data.available !== false && (Array.isArray(raw) || typeof raw === "string")) {
          const lines = Array.isArray(raw) ? raw : raw.split("\n").filter(Boolean).map(text => ({ text }));
          setLyrics(lines);
          setLyricsAvailable(lines.length > 0);
        } else {
          setLyrics([]);
          setLyricsAvailable(false);
        }
      } catch {
        if (controller.signal.aborted) return;
        setLyrics([]);
        setLyricsAvailable(false);
      } finally {
        if (!controller.signal.aborted) setLyricsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [videoId]);

  /* ---------------- Sleep timer ---------------- */
  const setSleep = useCallback((mins) => {
    if (sleepRef.current) clearTimeout(sleepRef.current);
    if (sleepTick.current) clearInterval(sleepTick.current);
    if (!mins) {
      setSleepMinutes(0);
      setSleepLeft(0);
      return;
    }
    const total = mins * 60;
    setSleepMinutes(mins);
    setSleepLeft(total);
    const deadline = Date.now() + total * 1000;
    const finish = () => {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
      setSleepMinutes(0);
      setSleepLeft(0);
      clearInterval(sleepTick.current);
      clearTimeout(sleepRef.current);
      pushToast("Sleep timer finished. Playback paused.");
    };
    sleepTick.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSleepLeft(left);
      if (!left) finish();
    }, 1000);
    sleepRef.current = setTimeout(finish, total * 1000);
  }, [setIsPlaying]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (sleepRef.current) clearTimeout(sleepRef.current);
      if (sleepTick.current) clearInterval(sleepTick.current);
    };
  }, []);

  /* ---------------- Helpers ---------------- */
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (!queue.length) return;
    const idx = queue.findIndex((s) => s.videoId === videoId);
    let nextIdx;
    if (shuffle) {
      if (queue.length === 1) nextIdx = 0;
      else {
        do {
          nextIdx = Math.floor(Math.random() * queue.length);
        } while (queue[nextIdx].videoId === videoId);
      }
    } else {
      nextIdx = idx < 0 ? 0 : (idx + 1) % queue.length;
    }
    onSongChange(queue[nextIdx]);
  }, [queue, videoId, shuffle, onSongChange]);

  const prevSong = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.getCurrentTime() > 3 || !queue.length) {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
      return;
    }
    const idx = queue.findIndex((s) => s.videoId === videoId);
    const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
    onSongChange(queue[prevIdx]);
  }, [queue, videoId, onSongChange]);

  const onVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    setMuted(v === 0);
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(v);
      if (v === 0) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch { }
  };

  const seek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = cn_clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const t = ratio * duration;
    setCurrentTime(t);
    playerRef.current?.seekTo(t, true);
  };

  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  /* ---------------- Volume icon ---------------- */
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="fixed inset-x-0 bottom-[64px] z-50 glass border-t border-[var(--border)] px-4 py-3 lg:bottom-0">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-3 text-sm text-white/40">
          <MusicPulse />
          <span>Pick a song to start listening</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===================== MINI PLAYER BAR ===================== */}
      <div className="fixed inset-x-0 bottom-[64px] z-50 border-t border-[var(--border)] glass lg:bottom-0">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-6 sm:py-3">
          {/* Info */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-64 sm:flex-none sm:gap-3">
            <button
              onClick={() => setShowNowPlaying(true)}
              className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-lg sm:h-14 sm:w-14"
            >
              <Thumbnail src={song.thumbnail} alt={song.title} rounded="rounded-xl" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Maximize2 size={18} className="text-white" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="marquee truncate text-sm font-semibold text-white">
                <span>{song.title}</span>
              </p>
              <p className="truncate text-xs text-white/50">{song.artist}</p>
            </div>
            <button
              onClick={() => onLike(song)}
              className={cn(
                "ml-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:flex",
                isLiked ? "text-pink-400" : "text-white/45 hover:text-white"
              )}
            >
              <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Center controls */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={cn(
                  "hidden h-8 w-8 items-center justify-center rounded-full transition sm:flex",
                  shuffle ? "text-[var(--accent)]" : "text-white/45 hover:text-white"
                )}
                title="Shuffle"
              >
                <Shuffle size={16} />
              </button>

              <button
                onClick={prevSong}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:text-white"
                title="Previous"
              >
                <SkipBack size={19} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-xl transition hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:text-white"
                title="Next"
              >
                <SkipForward size={19} fill="currentColor" />
              </button>

              <button
                onClick={cycleRepeat}
                className={cn(
                  "relative hidden h-8 w-8 items-center justify-center rounded-full transition sm:flex",
                  repeat !== "off" ? "text-[var(--accent)]" : "text-white/45 hover:text-white"
                )}
                title="Repeat"
              >
                {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Progress */}
            <div className="hidden w-full max-w-md items-center gap-2 sm:flex">
              <span className="w-9 text-right text-[11px] tabular-nums text-white/40">
                {formatTime(currentTime)}
              </span>
              <div
                ref={progressRef}
                onClick={seek}
                className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/12"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition group-hover:opacity-100"
                  style={{ left: `calc(${progressPct}% - 6px)` }}
                />
              </div>
              <span className="w-9 text-[11px] tabular-nums text-white/40">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex w-auto items-center gap-1.5 sm:w-64 sm:justify-end sm:gap-2">
            <button
              onClick={() => { setShowNowPlaying(true); setShowTimerMenu(true); }}
              title="Sleep timer"
              aria-label="Sleep timer"
              className={cn("flex items-center gap-1 rounded-full p-2", sleepMinutes ? "text-[var(--accent)]" : "text-white/45 hover:text-white")}
            >
              <Timer size={17} />
              {sleepMinutes > 0 && <span className="text-xs tabular-nums">{formatTime(sleepLeft)}</span>}
            </button>
            <button
              onClick={() => { setShowLyrics(true); setShowNowPlaying(true); }}
              className={cn(
                "hidden h-9 w-9 items-center justify-center rounded-full transition md:flex",
                showLyrics ? "text-[var(--accent)]" : "text-white/45 hover:text-white"
              )}
              title="Lyrics"
            >
              <Mic2 size={17} />
            </button>
            <button
              onClick={() => setShowQueue((s) => !s)}
              className={cn(
                "hidden h-9 w-9 items-center justify-center rounded-full transition md:flex",
                showQueue ? "text-[var(--accent)]" : "text-white/45 hover:text-white"
              )}
              title="Queue"
            >
              <ListMusic size={17} />
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              <VolIcon
                size={18}
                className="text-white/55"
                onClick={() => setMuted((m) => !m)}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={onVolume}
                className="h-1 w-24 cursor-pointer rounded-full bg-white/15 accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        {/* YouTube hidden player */}
        <YouTube
          key={playbackKey}
          videoId={videoId}
          onReady={handleReady}
          onStateChange={handleState}
          onEnd={handleEnd}
          opts={{ height: "0", width: "0", playerVars: { autoplay: 1, controls: 0 } }}
          className="hidden"
        />
      </div>

      {/* ===================== NOW PLAYING (FULLSCREEN) ===================== */}
      {showNowPlaying && (
        <NowPlaying
          song={song}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nextSong={nextSong}
          prevSong={prevSong}
          isLiked={isLiked}
          onLike={onLike}
          shuffle={shuffle}
          setShuffle={setShuffle}
          repeat={repeat}
          cycleRepeat={cycleRepeat}
          currentTime={currentTime}
          duration={duration}
          progressPct={progressPct}
          seek={seek}
          volume={muted ? 0 : volume}
          onVolume={onVolume}
          muted={muted}
          setMuted={setMuted}
          showLyrics={showLyrics}
          setShowLyrics={setShowLyrics}
          lyrics={lyrics}
          lyricsLoading={lyricsLoading}
          lyricsAvailable={lyricsAvailable}
          activeLyric={activeLyric}
          lyricRefs={lyricRefs}
          sleepMinutes={sleepMinutes}
          sleepLeft={sleepLeft}
          setSleep={setSleep}
          showTimerMenu={showTimerMenu}
          setShowTimerMenu={setShowTimerMenu}
          onClose={() => setShowNowPlaying(false)}
        />
      )}

      {/* ===================== QUEUE PANEL ===================== */}
      <QueuePanel
        open={showQueue}
        onClose={() => setShowQueue(false)}
        queue={queue}
        currentVideoId={videoId}
        onSelect={onSongChange}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* NOW PLAYING FULLSCREEN (MOBILE & DESKTOP OPTIMIZED)                */
/* ------------------------------------------------------------------ */
function NowPlaying(props) {
  const barRef = useRef(null);
  const {
    song, isPlaying, togglePlay, nextSong, prevSong, isLiked, onLike,
    shuffle, setShuffle, repeat, cycleRepeat, currentTime, duration,
    seek, progressPct, volume, onVolume, muted, setMuted,
    showLyrics, setShowLyrics, lyrics, lyricsLoading, lyricsAvailable,
    activeLyric, lyricRefs, sleepMinutes, sleepLeft, setSleep,
    showTimerMenu, setShowTimerMenu, onClose,
  } = props;

  const VolIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in overflow-hidden bg-[var(--bg)]">
      {/* 1. AMBIENT GLOW */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-50 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.6), rgba(236,72,153,0.3) 40%, transparent 70%)",
        }}
      />

      {/* 2. BRANDING ALGMUSIC (KIRI ATAS) */}
      <div className="absolute left-5 top-5 z-20 flex items-center gap-2 md:left-6 md:top-6 md:gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-lg md:h-10 md:w-10 md:rounded-xl">
          <Music2 size={16} className="text-white md:h-5 md:w-5" />
        </span>
        <span className="hidden sm:block">
          <span className="block font-display text-lg font-extrabold leading-none text-[var(--text)] md:text-xl">
            ALG<span className="text-[var(--accent)]">Music</span>
          </span>
        </span>
      </div>

      {/* 3. CLOSE BUTTON (KANAN ATAS) */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-white/70 backdrop-blur transition hover:bg-white/10 hover:text-white md:right-6 md:top-6 md:h-11 md:w-11"
      >
        <X size={18} className="md:h-5 md:w-5" />
      </button>

      {/* 4. MAIN LAYOUT (FLEXIBLE HEIGHT) */}
      {/* Perubahan: Menggunakan justify-between agar elemen merata atas-bawah tanpa keluar layar */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-between px-6 pb-6 pt-20 md:flex-row md:justify-center md:gap-16 md:px-8 md:pb-12 md:pt-0">

        {/* Left Side: Cover / Lyrics (Bisa menyusut 'min-h-0' di HP) */}
        <div className="flex w-full flex-1 min-h-0 items-center justify-center md:justify-end">
          {showLyrics ? (
            <LyricsView
              lyrics={lyrics}
              loading={lyricsLoading}
              available={lyricsAvailable}
              active={activeLyric}
              refs={lyricRefs}
            />
          ) : (
            // Ukuran cover diperkecil di HP (max-w-[260px]) agar tombol bawah muat
            <div className="relative aspect-square w-full max-w-[260px] sm:max-w-[320px] md:max-w-[440px] animate-scale-in">
              <div className="glow-ring h-full w-full overflow-hidden rounded-[24px] shadow-2xl md:rounded-[32px]">
                <img
                  src={getThumb(song.thumbnail)}
                  alt={song.title}
                  className={cn(
                    "h-full w-full object-cover",
                    isPlaying && "animate-[float-y_6s_ease-in-out_infinite]"
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Meta + Controls */}
        <div className="flex w-full shrink-0 flex-col items-center text-center md:flex-1 md:items-start md:text-left">

          {/* TULISAN "SING ALONG" SUDAH DIHAPUS, DAN UKURAN JUDUL LAGU DIKECILKAN */}
          <h1 className="font-display text-xl font-extrabold leading-tight text-[var(--text)] sm:text-2xl md:text-3xl lg:text-4xl">
            {song.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-white/60 md:mt-2 md:text-lg">
            {song.artist}
          </p>

          <button
            onClick={() => setShowLyrics((s) => !s)}
            className="mt-3 rounded-full border border-[var(--border)] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 md:mt-6 md:px-5 md:py-2.5 md:text-sm"
          >
            {showLyrics ? "Show Cover" : "Show Lyrics"}
          </button>

          {/* Progress Bar (Margin diperkecil di HP: mt-5) */}
          <div className="mt-5 w-full max-w-md md:mt-10">
            <div
              ref={barRef}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek({ clientX: r.left + (progressPct / 100) * r.width });
              }}
              className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/12"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                style={{ width: `${progressPct}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition group-hover:scale-110"
                style={{ left: `calc(${progressPct}% - 7px)` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-medium tabular-nums text-white/45 md:mt-3 md:text-xs">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls (Margin dan ukuran ikon diperkecil di HP) */}
          <div className="mt-4 flex items-center gap-4 md:mt-8 md:gap-6">
            <button onClick={() => setShuffle((s) => !s)} className={cn("transition", shuffle ? "text-[var(--accent)]" : "text-white/50 hover:text-white")}>
              <Shuffle size={18} className="md:h-5 md:w-5" />
            </button>
            <button onClick={prevSong} className="text-white/85 transition hover:text-white">
              <SkipBack size={24} fill="currentColor" className="md:h-7 md:w-7" />
            </button>
            <button onClick={togglePlay} className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-2xl transition hover:scale-105 active:scale-95 md:h-16 md:w-16">
              {isPlaying ? <Pause size={24} fill="currentColor" className="md:h-7 md:w-7" /> : <Play size={24} fill="currentColor" className="ml-1 md:h-7 md:w-7" />}
            </button>
            <button onClick={nextSong} className="text-white/85 transition hover:text-white">
              <SkipForward size={24} fill="currentColor" className="md:h-7 md:w-7" />
            </button>
            <button onClick={cycleRepeat} className={cn("transition", repeat !== "off" ? "text-[var(--accent)]" : "text-white/50 hover:text-white")}>
              {repeat === "one" ? <Repeat1 size={18} className="md:h-5 md:w-5" /> : <Repeat size={18} className="md:h-5 md:w-5" />}
            </button>
          </div>

          {/* Bottom Utilities (Akan muat dan terlihat di HP sekarang) */}
          <div className="mt-5 flex w-full max-w-md items-center justify-between pb-2 md:mt-10 md:pb-0">
            <button onClick={() => onLike(song)} className="flex items-center gap-2 transition hover:scale-110">
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={cn("md:h-6 md:w-6", isLiked ? "text-pink-500" : "text-white/50")} />
            </button>

            {/* Volume disembunyikan di layar HP paling kecil untuk menghemat ruang, muncul di Tablet/Desktop */}
            <div className="hidden items-center gap-3 sm:flex">
              <VolIcon size={18} className="text-white/55 md:h-5 md:w-5" onClick={() => setMuted((m) => !m)} />
              <input type="range" min={0} max={100} value={volume} onChange={onVolume} className="h-1.5 w-20 cursor-pointer rounded-full bg-white/15 accent-[var(--accent)] md:w-28" />
            </div>

            <div className="relative">
              <button onClick={() => setShowTimerMenu((s) => !s)} className={cn("transition", sleepMinutes > 0 ? "text-[var(--accent)]" : "text-white/50 hover:text-white")}>
                <Timer size={20} className="md:h-5 md:w-5" />
              </button>
              {showTimerMenu && (
                <div className="absolute bottom-10 right-0 z-50 w-40 animate-scale-in rounded-2xl border border-[var(--border)] glass p-1.5 shadow-2xl md:bottom-12">
                  {[5, 15, 30, 45, 60].map((m) => (
                    <button key={m} onClick={() => { setSleep(sleepMinutes === m ? 0 : m); setShowTimerMenu(false); }} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition", sleepMinutes === m ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-white/85 hover:bg-white/10")}>
                      <span>{m} min</span>{sleepMinutes === m && <Check size={14} />}
                    </button>
                  ))}
                  {sleepMinutes > 0 && (
                    <button onClick={() => { setSleep(0); setShowTimerMenu(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10">
                      <span>Turn off</span><X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {sleepMinutes > 0 && <p role="status" className="mt-2 text-[10px] tabular-nums text-[var(--accent)] md:mt-4 md:text-sm">Playback stops in {formatTime(sleepLeft)}</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LYRICS (TINGGI DISESUAIKAN UNTUK HP)                               */
/* ------------------------------------------------------------------ */
function LyricsView({ lyrics, loading, available, active, refs }) {
  if (loading)
    return (
      <div className="w-full max-w-lg space-y-3 px-4 md:space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-6 rounded-lg md:h-8" style={{ width: `${60 + ((i * 13) % 40)}%` }} />
        ))}
      </div>
    );
  if (!available || !lyrics.length)
    return (
      <div className="text-center text-white/40 px-4">
        <Mic2 size={36} className="mx-auto mb-3 opacity-40 md:mb-4 md:h-12 md:w-12" />
        <p className="text-lg font-semibold md:text-xl">No lyrics available</p>
      </div>
    );
  return (
    // Perubahan Tinggi: h-[35vh] untuk HP (supaya muat), h-[60vh] untuk Desktop (md:)
    <div className="no-scrollbar h-[35vh] w-full max-w-xl space-y-4 overflow-y-auto px-4 pb-[15vh] text-center md:h-[60vh] md:space-y-5 md:pb-[25vh] md:text-left">
      {lyrics.map((line, i) => (
        <p
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={cn(
            "cursor-pointer font-display font-bold leading-snug transition-all duration-300 origin-center md:origin-left",
            i === active
              ? "scale-[1.03] text-xl text-white md:text-4xl"
              : "scale-100 text-lg text-white/30 hover:text-white/60 md:text-3xl"
          )}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QUEUE PANEL                                                         */
/* ------------------------------------------------------------------ */
function QueuePanel({ open, onClose, queue, currentVideoId, onSelect }) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[90] bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[95] flex h-full w-full max-w-sm flex-col border-l border-[var(--border)] glass transition-transform duration-300 ease-[var(--ease)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="font-display text-lg font-bold">Queue</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto p-3">
          {queue.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-white/40">
              Queue is empty.
            </p>
          ) : (
            queue.map((s, i) => (
              <button
                key={s.videoId + i}
                onClick={() => onSelect(s)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition",
                  s.videoId === currentVideoId
                    ? "bg-white/[0.08]"
                    : "hover:bg-white/[0.04]"
                )}
              >
                <Thumbnail src={s.thumbnail} alt={s.title} className="h-12 w-12" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      s.videoId === currentVideoId ? "text-[var(--accent)]" : "text-white/90"
                    )}
                  >
                    {s.title}
                  </p>
                  <p className="truncate text-xs text-white/45">{s.artist}</p>
                </div>
                {s.videoId === currentVideoId && (
                  <span className="eq text-[var(--accent)]">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* tiny helpers                                                        */
/* ------------------------------------------------------------------ */
function cn_clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function MusicPulse() {
  return (
    <span className="eq text-[var(--accent)]">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
