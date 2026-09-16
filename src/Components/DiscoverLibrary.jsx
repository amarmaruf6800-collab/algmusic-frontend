import { useEffect, useState } from "react";
import { BarChart3, Globe2, Loader2, Play, Sparkles, X } from "lucide-react";
import { API, getThumb, normalizeSong } from "../lib/utils";

export default function DiscoverLibrary({ onSongClick }) {
  const [selected, setSelected] = useState(null);
  const [chartCountry, setChartCountry] = useState("ZZ");
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API}/api/charts/${chartCountry}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Charts unavailable")))
      .then((data) => alive && setCharts(data))
      .catch((error) => console.error("Charts error:", error));
    return () => { alive = false; };
  }, [chartCountry]);

  async function openPlaylist(playlist) {
    if (!playlist.playlistId) return;
    setSelected({ ...playlist, loading: true });
    try {
      const res = await fetch(`${API}/api/playlists/${encodeURIComponent(playlist.playlistId)}?limit=30&suggestions_limit=8`);
      if (!res.ok) throw new Error("Playlist unavailable");
      setSelected(await res.json());
    } catch (error) {
      console.error("Playlist detail error:", error);
      setSelected(null);
    }
  }

  return (
    <section className="rounded-[26px] border border-white/[0.07] bg-gradient-to-br from-fuchsia-500/[0.06] via-transparent to-violet-500/[0.05] p-4 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/80"><BarChart3 size={14} /> Live charts</p>
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">What the world is playing</h2>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
          <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
            {[{ key: "ZZ", label: "Global" }, { key: "ID", label: "Indonesia" }].map((country) => (
              <button key={country.key} onClick={() => setChartCountry(country.key)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${chartCountry === country.key ? "bg-white text-black" : "text-white/45 hover:text-white"}`}>
                {country.label}
              </button>
            ))}
          </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(charts?.videos || charts?.daily || []).slice(0, 4).map((chart) => (
            <button key={chart.playlistId || chart.title} onClick={() => openPlaylist(chart)} className="group text-left">
              <div className="relative aspect-[1.15] overflow-hidden rounded-2xl bg-white/5">
                <img src={getThumb(chart.thumbnails)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent p-3 text-xs font-bold text-white"><Globe2 size={14} className="mr-1.5" /> Chart playlist</span>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-white/80">{chart.title}</p>
            </button>
          ))}
      </div>

      {selected && <PlaylistPreview playlist={selected} onClose={() => setSelected(null)} onSongClick={onSongClick} />}
    </section>
  );
}

function PlaylistPreview({ playlist, onClose, onSongClick }) {
  if (playlist.loading) return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60"><Loader2 className="animate-spin text-white" /></div>;
  const tracks = playlist.tracks || [];
  const suggestions = playlist.suggestions || [];
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="glass max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[28px] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-7">
          <div className="min-w-0"><p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia-300"><Sparkles size={14} /> Curated playlist</p><h3 className="truncate font-display text-2xl font-bold text-white">{playlist.title}</h3><p className="mt-1 text-sm text-white/45">{playlist.trackCount || tracks.length} tracks{suggestions.length ? ` · ${suggestions.length} suggestions` : ""}</p></div>
          <button onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6">
          {suggestions.length > 0 && <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/40"><Sparkles size={14} /> Suggested for this playlist</p>}
          {[...tracks.slice(0, 16), ...suggestions.slice(0, 8)].map((track, index) => {
            const song = normalizeSong(track);
            return <button key={`${song.videoId}-${index}`} onClick={() => onSongClick(song, tracks.map(normalizeSong))} className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/[0.06]"><span className="w-6 text-center text-xs text-white/25">{index + 1}</span><img src={song.thumbnail} alt="" className="h-11 w-11 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white/85">{song.title}</span><span className="block truncate text-xs text-white/40">{song.artist}</span></span><Play size={15} className="text-white/0 transition group-hover:text-fuchsia-300" fill="currentColor" /></button>;
          })}
        </div>
      </div>
    </div>
  );
}
