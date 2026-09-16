import {
    Play,
    MoreHorizontal,
} from "lucide-react";

function SongCard({ song, index, onClick, onArtistClick }) {
    return (
        <div
            onClick={() => onClick(song)}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white/[0.03] p-3 transition hover:border-white/10 hover:bg-white/[0.07]"
        >

            <div className="flex w-8 justify-center">
                <span className="text-sm text-zinc-600 group-hover:hidden">
                    {index + 1}
                </span>

                <Play
                    size={17}
                    fill="currentColor"
                    className="hidden text-violet-400 group-hover:block"
                />
            </div>

            <img
                src={song.thumbnail}
                alt={song.title}
                className="h-16 w-16 rounded-xl object-cover"
            />

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">
                    {song.title}
                </h3>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onArtistClick(song.artistId);
                    }}
                    className="mt-1 block truncate text-left text-sm text-zinc-500 hover:text-violet-400"
                >
                    {song.artist}
                </button>
            </div>

            <div className="hidden w-56 truncate text-sm text-zinc-600 lg:block">
                {song.album || "Unknown album"}
            </div>

            <span className="w-12 text-right text-sm text-zinc-500">
                {song.duration}
            </span>

            <button
                onClick={(e) => e.stopPropagation()}
                className="hidden rounded-full p-2 text-zinc-600 hover:bg-white/10 hover:text-white sm:block"
            >
                <MoreHorizontal size={19} />
            </button>

        </div>
    );
}

export default SongCard;