"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

// ---- date helpers (all local-time, no UTC/toISOString surprises) ------------
const pad = (n: number) => String(n).padStart(2, "0");
/** m is 0-indexed. → "YYYY-MM-DD". */
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parseYMD(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}
function todayYMD(): string {
  const t = new Date();
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
}

/**
 * A big, brand-styled month calendar — the single calendar used across the site.
 * `isMarked` lights a day up (e.g. days that already have attendance) and
 * `dayBadge` renders a tiny label beneath the number (e.g. a present count).
 */
export function Calendar({
  selected,
  onSelect,
  isMarked,
  dayBadge,
  min,
  max,
  className,
}: {
  selected?: string;
  onSelect: (date: string) => void;
  isMarked?: (date: string) => boolean;
  dayBadge?: (date: string) => React.ReactNode;
  min?: string;
  max?: string;
  className?: string;
}) {
  const { locale } = useI18n();
  const today = todayYMD();
  const start = parseYMD(selected) ?? parseYMD(today)!;
  const [view, setView] = useState<{ y: number; m: number }>({ y: start.y, m: start.m });

  const weekdayLabels = useMemo(() => {
    // 2023-01-01 was a Sunday — build seven short weekday names in the locale.
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  }, [locale]);

  const monthName = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(view.y, view.m, 1)),
    [locale, view],
  );

  // Year options for the quick jump — spans min/max when given, else a wide
  // range so distant dates (e.g. birthdays) stay reachable. Newest first.
  const years = useMemo(() => {
    const cy = new Date().getFullYear();
    const lo = min ? Number(min.slice(0, 4)) : cy - 100;
    const hi = max ? Number(max.slice(0, 4)) : cy + 5;
    return Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
  }, [min, max]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const dayNum = i - firstWeekday + 1;
      const date = new Date(view.y, view.m, dayNum);
      return {
        date: ymd(date.getFullYear(), date.getMonth(), date.getDate()),
        num: date.getDate(),
        inMonth: dayNum >= 1 && dayNum <= daysInMonth,
      };
    });
  }, [view]);

  const shift = (dir: -1 | 1) =>
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });

  const navBtn =
    "grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-brand hover:text-brand rtl:rotate-180";

  return (
    <div className={cn("select-none", className)}>
      {/* Month header */}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className={navBtn}>‹</button>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold capitalize text-ink">{monthName}</span>
          <select
            value={view.y}
            onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
            aria-label="Year"
            className="rounded-lg border border-line bg-white px-1.5 py-1 text-sm font-bold text-ink outline-none transition hover:border-brand focus:border-brand"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { const t = parseYMD(today)!; setView({ y: t.y, m: t.m }); }}
            className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-dark transition hover:bg-brand-100"
          >
            {locale === "ar" ? "اليوم" : locale === "he" ? "היום" : "Today"}
          </button>
        </div>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className={navBtn}>›</button>
      </div>

      {/* Weekday row */}
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
        {weekdayLabels.map((w, i) => (
          <span key={i} className="text-xs font-bold uppercase tracking-wide text-muted">{w}</span>
        ))}
      </div>

      {/* Days */}
      <div className="mt-1.5 grid grid-cols-7 gap-1.5" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
        {cells.map((c) => {
          const isSel = c.date === selected;
          const isToday = c.date === today;
          const marked = !!isMarked?.(c.date) && c.inMonth;
          const disabled = (min && c.date < min) || (max && c.date > max);
          return (
            <button
              key={c.date}
              type="button"
              disabled={!!disabled}
              onClick={() => onSelect(c.date)}
              aria-pressed={isSel}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-xl border-2 px-1 py-1.5 text-center transition sm:min-h-16",
                isSel
                  ? "border-brand bg-brand text-white shadow-md"
                  : disabled
                    ? "cursor-not-allowed border-transparent text-ink/25"
                    : marked
                      ? "border-brand-200 bg-brand-50 text-brand-dark hover:border-brand"
                      : c.inMonth
                        ? "border-transparent text-ink hover:border-brand-200 hover:bg-surface"
                        : "border-transparent text-ink/30 hover:bg-surface",
                isToday && !isSel && "ring-2 ring-brand/30",
              )}
            >
              <span className="text-lg font-extrabold leading-none">{c.num}</span>
              {c.inMonth && dayBadge ? <span className="mt-0.5 leading-none">{dayBadge(c.date)}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- DateField: a labeled field that opens the big Calendar in a modal -------

function formatDisplay(value: string | undefined, withTime: boolean, locale: string): string {
  const p = parseYMD(value);
  if (!p) return "";
  const dateStr = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(p.y, p.m, p.d),
  );
  if (!withTime) return dateStr;
  const time = value && value.length >= 16 ? value.slice(11, 16) : "";
  return time ? `${dateStr} · ${time}` : dateStr;
}

/**
 * A tap-to-open date (or date-time) picker that reuses {@link Calendar}. Stores
 * "YYYY-MM-DD" (date only) or "YYYY-MM-DDTHH:mm" (withTime) — the same naive
 * local string the old datetime-local input produced.
 */
export function DateField({
  label,
  value,
  onChange,
  withTime = false,
  min,
  max,
  placeholder,
}: {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);

  const datePart = value ? value.slice(0, 10) : "";
  const timePart = withTime && value && value.length >= 16 ? value.slice(11, 16) : "";
  const display = formatDisplay(value, withTime, locale);

  const pickDate = (d: string) => {
    if (withTime) {
      onChange(`${d}T${timePart || "00:00"}`);
    } else {
      onChange(d);
      setOpen(false);
    }
  };
  const pickTime = (t: string) => {
    const d = datePart || todayYMD();
    onChange(`${d}T${t}`);
  };

  const chooseLabel = locale === "ar" ? "اختر التاريخ" : locale === "he" ? "בחרו תאריך" : "Choose date";
  const clearLabel = locale === "ar" ? "مسح" : locale === "he" ? "ניקוי" : "Clear";
  const doneLabel = locale === "ar" ? "تم" : locale === "he" ? "סיום" : "Done";

  return (
    <div className="block">
      {label ? <span className="mb-1 block text-xs font-semibold text-ink">{label}</span> : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-start text-sm outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
      >
        <span aria-hidden className="text-base">🗓</span>
        <span className={cn("flex-1 truncate", display ? "text-ink" : "text-muted")} dir={display ? "auto" : undefined}>
          {display || placeholder || chooseLabel}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={label || chooseLabel} className="max-w-md">
        <Calendar selected={datePart || undefined} onSelect={pickDate} min={min} max={max} />
        {withTime && (
          <label className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <span className="text-sm font-semibold text-ink">🕐</span>
            <input
              type="time"
              value={timePart}
              onChange={(e) => pickTime(e.target.value)}
              dir="ltr"
              className="h-10 flex-1 rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-sm font-semibold text-rose-600 hover:underline">
            {clearLabel}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
            {doneLabel}
          </button>
        </div>
      </Modal>
    </div>
  );
}
