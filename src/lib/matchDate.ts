import type { Locale, Match } from "./types";

const INTL_LOCALE: Record<Locale, string> = { ar: "ar", he: "he", en: "en-GB" };

export interface MatchDateParts {
  /** Localized weekday name, e.g. "السبت". */
  weekday: string;
  /** All-numeric date, DD/MM/YYYY (no month names). */
  date: string;
  /** 24-hour time, HH:MM. */
  time: string;
}

/** The club plays in Israel; pinning the zone keeps the server render and every
 * visitor's browser showing the same local tip-off time. */
const TIME_ZONE = "Asia/Jerusalem";

const NUMERIC = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Splits a match's date-time into display parts — numeric DD/MM/YYYY date and
 * 24-hour HH:MM time (Latin digits in every locale so they read the same
 * everywhere) plus the localized weekday — or null when the match has no
 * valid date. */
export function matchDateParts(match: Pick<Match, "date">, locale: Locale): MatchDateParts | null {
  if (!match.date) return null;
  const d = new Date(match.date);
  if (isNaN(+d)) return null;
  const part = Object.fromEntries(NUMERIC.formatToParts(d).map((p) => [p.type, p.value]));
  let weekday = "";
  try {
    weekday = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "long", timeZone: TIME_ZONE }).format(d);
  } catch {}
  return {
    weekday,
    date: `${part.day}/${part.month}/${part.year}`,
    time: `${part.hour}:${part.minute}`,
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
