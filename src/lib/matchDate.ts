import type { Locale, Match } from "./types";

// Weekday names are spelled out here rather than taken from Intl: Node (server)
// and Safari/Chrome (client) ship different ICU data, and any difference in the
// rendered text breaks hydration.
const DAYS: Record<Locale, string[]> = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  he: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export interface MatchDateParts {
  /** Localized weekday name, e.g. "السبت". */
  weekday: string;
  /** All-numeric date, DD/MM/YYYY (no month names). */
  date: string;
  /** 24-hour time, HH:MM ("" when the match has no time). */
  time: string;
}

/** Splits a match's date-time into display parts — numeric DD/MM/YYYY date and
 * 24-hour HH:MM time (Latin digits in every locale so they read the same
 * everywhere) plus the localized weekday — or null when the match has no
 * valid date.
 *
 * Dates are stored as zone-less local wall time ("2026-10-28T20:30"). The
 * fields are read straight from that string, never through `new Date()`, which
 * would interpret it in the runtime's zone (UTC on the server) and shift it. */
export function matchDateParts(match: Pick<Match, "date">, locale: Locale): MatchDateParts | null {
  const m = match.date?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const day = new Date(Date.UTC(+y, +mo - 1, +d));
  if (isNaN(+day)) return null;
  return {
    weekday: DAYS[locale][day.getUTCDay()],
    date: `${d}/${mo}/${y}`,
    time: hh ? `${hh}:${mm}` : "",
  };
}

/** One-line date-time label ("weekday · DD/MM/YYYY · HH:MM"), or "" when the
 * match has no valid date. Shared by every place a fixture is listed (public
 * Games section, team detail sheet, the game detail modal) so they never drift. */
export function formatMatchDateTime(match: Pick<Match, "date">, locale: Locale): string {
  const p = matchDateParts(match, locale);
  if (!p) return "";
  return [p.weekday, p.date, p.time].filter(Boolean).join(" · ");
}
