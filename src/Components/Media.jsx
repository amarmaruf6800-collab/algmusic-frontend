import { useState } from "react";
import { cn, getThumb, gradientFromString, initials } from "../lib/utils";

/**
 * Premium image with deterministic gradient + initials fallback.
 * Shows a subtle shimmer while loading and a branded placeholder on error.
 */
export default function Thumbnail({
  src,
  alt = "",
  className,
  rounded = "rounded-2xl",
  text,
  icon,
  size = "md",
}) {
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const url = getThumb(src) || null;

  const showFallback = status === "error" || !url;

  const sizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.04]",
        rounded,
        className
      )}
    >
      {url && status !== "error" && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            status === "ok" ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {status === "loading" && url && (
        <div className="skeleton absolute inset-0" />
      )}

      {showFallback && (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center text-white/90",
            sizes[size],
            rounded
          )}
          style={{
            background: gradientFromString(alt || text || "ALGMusic"),
          }}
        >
          {icon ? icon : <span className="font-bold">{initials(alt || text || "AL")}</span>}
        </div>
      )}
    </div>
  );
}
