"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { SaveState } from "@/lib/useAutosave";

export type ViewMode = "grid" | "list";

/** Autosave status + Undo — replaces the old Save button on admin pages. */
export function AutosaveBar({ saveState, onUndo, canUndo }: { saveState: SaveState; onUndo: () => void; canUndo: boolean }) {
  const { pick } = useI18n();
  const label =
    saveState === "saving" ? pick({ ar: "جارٍ الحفظ…", he: "שומר…", en: "Saving…" })
    : saveState === "saved" ? pick({ ar: "تم الحفظ", he: "נשמר", en: "Saved" })
    : saveState === "error" ? pick({ ar: "فشل الحفظ", he: "השמירה נכשלה", en: "Save failed" })
    : pick({ ar: "حفظ تلقائي", he: "שמירה אוטומטית", en: "Auto-saves" });
  const tone =
    saveState === "error" ? "bg-rose-50 text-rose-600"
    : saveState === "saved" ? "bg-emerald-50 text-emerald-700"
    : "bg-surface text-muted";
  return (
    <div className="flex items-center gap-2">
      {canUndo && (
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          <span aria-hidden className="rtl:-scale-x-100">↶</span> {pick({ ar: "تراجع", he: "ביטול", en: "Undo" })}
        </button>
      )}
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", tone)}>
        {saveState === "saving" && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {saveState === "saved" && <span aria-hidden>✓</span>}
        {label}
      </span>
    </div>
  );
}

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

/** Inline detail editor — expands in place instead of a floating modal, so
 * nothing overlaps and there's room to breathe. Shows a back button + title,
 * then the fields (already spaced by `space-y-4`). */
export function DetailPanel({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const { pick } = useI18n();
  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3 border-b border-line pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          <span aria-hidden className="rtl:-scale-x-100">←</span> {pick({ ar: "رجوع", he: "חזרה", en: "Back" })}
        </button>
        <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-ink">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
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
