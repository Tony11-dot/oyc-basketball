import type { Locale, Match } from "./types";

const INTL_LOCALE: Record<Locale, string> = { ar: "ar", he: "he", en: "en-GB" };

/** Formats a match's date-time for display (weekday, day, month, time), or ""
 * when the match has no valid date. Shared by every place a fixture is listed
 * (public Games section, team detail sheet, the game detail modal) so the
 * three never drift. */
export function formatMatchDateTime(match: Pick<Match, "date">, locale: Locale): string {
  if (!match.date) return "";
  const d = new Date(match.date);
  if (isNaN(+d)) return "";
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}
