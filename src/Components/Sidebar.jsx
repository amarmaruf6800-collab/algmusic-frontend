import { Home, Search, Library, Heart, Music2, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

const NAV = [
  { key: "home", label: "Home", icon: Home },
  { key: "search", label: "Search", icon: Search },
  { key: "library", label: "Your Library", icon: Library },
  { key: "liked", label: "Liked Songs", icon: Heart },
];

export default function Sidebar({
  currentPage,
  setCurrentPage,
  theme,
  toggleTheme,
  isAuthenticated,
  userName,
  onLogin,
  onLogout,
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)]/80 px-5 py-6 backdrop-blur-xl lg:flex lg:w-80">
      {/* Brand */}
      <div className="mb-10 flex items-center justify-between px-1">
        <button
          onClick={() => setCurrentPage("home")}
          className="group flex items-center gap-3 text-left"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl btn-accent shadow-lg">
            <Music2 size={22} className="text-white" />
          </span>
          <span>
            <span className="block font-display text-xl font-extrabold leading-none text-[var(--text)]">
              ALG<span className="text-[var(--accent)]">Music</span>
            </span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
              Premium Sound
            </span>
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="space-y-1.5">
        {NAV.map((item) => {
          const active =
            currentPage === item.key ||
            (item.key === "library" && currentPage === "playlist");
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={cn(
                "group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-all duration-300",
                active
                  ? "bg-white/[0.07] text-[var(--text)]"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)]" />
              )}
              <Icon
                size={20}
                className={cn(
                  "transition-transform duration-300",
                  active && "scale-110"
                )}
                fill={active && item.key === "liked" ? "currentColor" : "none"}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="my-6 h-px bg-[var(--border)]" />

      <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
        Curation
      </p>

      <div className="mt-3 space-y-1.5">
        <button
          onClick={() => setCurrentPage("library")}
          className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-500/10 px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:from-violet-600/30"
        >
          <Library size={18} />
          Create Playlist
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      {/* Footer */}
      <div className="mb-16 mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-white/70">
            U
          </span>
          <div className="min-w-0 leading-tight">
            <p className="max-w-36 truncate text-sm font-semibold text-white/80">
              {isAuthenticated ? (userName || "Member") : "Listener"}
            </p>
            <p className="text-[11px] text-white/35">
              {isAuthenticated ? "Premium sound space" : "Free forever"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isAuthenticated ? onLogout : onLogin}
            aria-label={isAuthenticated ? "Log out" : "Log in"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {isAuthenticated ? <LogOut size={16} /> : <LogIn size={16} />}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
