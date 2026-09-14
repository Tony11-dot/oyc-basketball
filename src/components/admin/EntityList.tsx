"use client";

import { useState } from "react";
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

/** Tracks "selection mode" for a list: whether it's on, and which ids are
 * checked. Shared by every admin list (players, teams, coaches, games,
 * receipts, registrations) so bulk actions behave identically everywhere. */
export function useSelection() {
  const [active, setActive] = useState(false);
  const [ids, setIds] = useState<Set<string>>(new Set());

  const toggleActive = () => {
    setActive((a) => !a);
    setIds(new Set());
  };
  const exit = () => {
    setActive(false);
    setIds(new Set());
  };
  const toggle = (id: string) =>
    setIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const setAll = (allIds: string[]) =>
    setIds((s) => (s.size === allIds.length ? new Set() : new Set(allIds)));

  return { active, ids, toggleActive, exit, toggle, setAll, isSelected: (id: string) => ids.has(id) };
}

/** Button that turns selection mode on/off — put beside ViewToggle. */
export function SelectModeToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const { pick } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
        active ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:text-ink",
      )}
    >
      {active ? "✕" : "☑"} {active ? pick({ ar: "إلغاء التحديد", he: "בטל בחירה", en: "Cancel select" }) : pick({ ar: "تحديد", he: "בחירה", en: "Select" })}
    </button>
  );
}

/** Sticky bar shown while in selection mode: count, select-all, and whatever
 * bulk actions the page passes in as children (e.g. a delete button). */
export function SelectionBar({
  count,
  total,
  onSelectAll,
  onExit,
  children,
}: {
  count: number;
  total: number;
  onSelectAll: () => void;
  onExit: () => void;
  children?: React.ReactNode;
}) {
  const { pick } = useI18n();
  return (
    <div className="sticky top-2 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand-50 px-3.5 py-2.5 shadow-sm">
      <span className="text-xs font-bold text-brand-dark">{count} {pick({ ar: "محدد", he: "נבחרו", en: "selected" })}</span>
      <button type="button" onClick={onSelectAll} className="text-xs font-semibold text-brand-dark hover:underline">
        {count >= total && total > 0 ? pick({ ar: "إلغاء التحديد", he: "נקה בחירה", en: "Clear all" }) : pick({ ar: "تحديد الكل", he: "בחר הכול", en: "Select all" })}
      </button>
      <div className="ms-auto flex flex-wrap items-center gap-2">{children}</div>
      <button type="button" onClick={onExit} className="text-xs font-semibold text-muted hover:text-ink">
        {pick({ ar: "إغلاق", he: "סגירה", en: "Close" })}
      </button>
    </div>
  );
}

/** A bulk-action button for a SelectionBar — disabled at zero, confirms once
 * for the whole batch with a page-supplied message (so the wording always
 * matches what will actually happen — delete vs. detach, plural count, etc). */
export function BulkActionButton({
  count,
  onRun,
  confirmText,
  label,
  tone = "danger",
}: {
  count: number;
  onRun: () => void;
  confirmText: string;
  label: string;
  tone?: "danger" | "neutral";
}) {
  return (
    <button
      type="button"
      disabled={count === 0}
      onClick={() => { if (confirm(confirmText)) onRun(); }}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger" ? "bg-rose-600 text-white hover:bg-rose-700" : "border border-line bg-white text-ink hover:border-ink/40 hover:bg-surface",
      )}
    >
      {label}
    </button>
  );
}

/** Checkbox overlay for a selectable card/row. Stops the parent's onClick from
 * also firing (selection and "open detail" share the same clickable element). */
export function SelectDot({ checked, onClick, className }: { checked: boolean; onClick: () => void; className?: string }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md border-2 bg-white/90 text-xs font-bold backdrop-blur transition",
        checked ? "border-brand bg-brand text-white" : "border-line text-transparent hover:border-brand/50",
        className,
      )}
    >
      ✓
    </span>
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
