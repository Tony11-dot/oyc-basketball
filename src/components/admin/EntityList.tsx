"use client";

import { cn } from "@/lib/cn";

export type ViewMode = "grid" | "list";

/** Segmented grid/list switch used at the top of the roster pages. */
export function ViewToggle({
  mode,
  onChange,
  labels,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  labels: { grid: string; list: string };
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
      {(["grid", "list"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
            mode === m ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          <span aria-hidden>{m === "grid" ? "▦" : "≣"}</span>
          {labels[m]}
        </button>
      ))}
    </div>
  );
}

/** A photo avatar that falls back to an initial (or emoji) when there's no image. */
export function Thumb({
  src,
  position,
  fallback,
  className,
}: {
  src?: string;
  position?: string;
  fallback: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{ objectPosition: position ?? "center" }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-brand-50 text-lg font-black text-brand-dark">
          {fallback}
        </div>
      )}
    </div>
  );
}

/** Small chevron shown on tappable rows/cards to signal "opens a detail view". */
export function TapChevron({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("text-muted transition group-hover:translate-x-0.5 group-hover:text-brand rtl:rotate-180", className)}>
      ›
    </span>
  );
}
