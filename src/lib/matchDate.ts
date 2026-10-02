import type { Locale, Match } from "./types";

// Day and month names are spelled out here rather than taken from Intl: Node
// (server) and Safari/Chrome (client) ship different ICU data and join the same
// date differently ("…، 08:00 م" vs "… في 08:00 م"), which broke hydration.
const DAYS: Record<Locale, string[]> = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  he: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const MONTHS: Record<Locale, string[]> = {
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  he: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** Formats a match's date-time for display (weekday, day, month, time), or ""
 * when the match has no valid date. Shared by every place a fixture is listed
 * (public Games section, team detail sheet, the game detail modal) so the
 * three never drift.
 *
 * Dates are stored as zone-less local wall time ("2026-10-28T20:30"); the
 * fields are read straight from that string so the wall time shows unchanged
 * for every visitor, whatever their device's time zone. */
export function formatMatchDateTime(match: Pick<Match, "date">, locale: Locale): string {
  const m = match.date?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return "";
  const [, y, mo, d, hh, mm] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  if (isNaN(+date)) return "";
  const day = DAYS[locale][date.getUTCDay()];
  const month = MONTHS[locale][+mo - 1];
  const dateStr =
    locale === "ar" ? `${day}، ${+d} ${month}` : locale === "he" ? `${day}, ${+d} ב${month}` : `${day} ${+d} ${month}`;
  // A date saved without a time shows just the day, not a fake midnight.
  return hh ? `${dateStr} · ${hh}:${mm}` : dateStr;
}
