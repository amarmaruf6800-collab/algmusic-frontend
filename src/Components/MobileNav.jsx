import { Home, Search, Library, Heart } from "lucide-react";
import { cn } from "../lib/utils";

export default function MobileNav({ currentPage, setCurrentPage }) {
    const NAV = [
        { key: "home", label: "Home", icon: Home },
        { key: "search", label: "Search", icon: Search },
        { key: "library", label: "Library", icon: Library },
        { key: "liked", label: "Liked", icon: Heart },
    ];

    return (
        <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--border)] pb-3 pt-2 lg:hidden">
            {NAV.map((item) => {
                const active = currentPage === item.key;
                const Icon = item.icon;
                return (
                    <button
                        key={item.key}
                        onClick={() => setCurrentPage(item.key)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-all",
                            active ? "text-[var(--text)]" : "text-white/40"
                        )}
                    >
                        <Icon
                            size={24}
                            fill={active && item.key === "liked" ? "currentColor" : "none"}
                            className={cn("transition-transform", active && "scale-110 text-[var(--accent)]")}
                        />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}