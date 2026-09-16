import { cn } from "../lib/utils";

export function SkeletonCard({ className }) {
  return (
    <div className="space-y-3">
      <div className={cn("skeleton aspect-square w-full", className)} />
      <div className="skeleton h-3.5 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-2 py-2">
      <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>
      <div className="skeleton h-3 w-10" />
    </div>
  );
}

export function SkeletonGrid({ count = 8, card = true }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        card
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid-cols-1"
      )}
    >
      {Array.from({ length: count }).map((_, i) =>
        card ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />
      )}
    </div>
  );
}
