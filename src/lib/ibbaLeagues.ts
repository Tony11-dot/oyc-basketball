import type { Team } from "./types";

// The IBBA season the site currently follows. League pages live at
// https://ibasketball.co.il/league/{season start year}-{league code}/ and a
// league usually keeps its code from season to season — only the year changes.
export const IBBA_SEASON = 2026; // 2026-27

/** League links that were set automatically but don't exist / aren't ours. */
const WRONG_LINKS = new Set([
  "https://ibasketball.co.il/league/2026-112/",
  "https://ibasketball.co.il/league/2026-161/",
]);

/** Each club team's IBBA league code (or a full page URL), by team id. */
const LEAGUE_CODES: Record<string, number | string> = {
  "83088a4d-2ae6-48b2-92f5-ed654d328c02": 11, // בוגרים — ליגה ב צפון
  "26b03405-a470-4fc4-8da1-ab443dd0dcaa": 54, // ארצית נשים צפון
  "b75ca6d0-891a-4a1b-a310-b2ca47f3e375": 113, // נוער מחוזית
  "e80437c3-3ee7-47ea-83b8-d64b0a249624": 163, // נערים א מחוזית
  "591f5115-d04f-4a82-a001-3051a5e042d8": 452, // נערות א לאומית צפון
  "2b9b6341-f106-42b5-b9da-642d07f546d7": 503, // נערות ב לאומית צפון
  "db4677c8-6101-46eb-8077-01adb8ccbb32": 754, // ילדות א עמקים
  "5344a659-13d8-4bee-826b-ef49f4ebbfa1": 782, // ילדות ב עמקים
  "f1286d01-685b-4b3a-9e50-f4cc9a073e52": 263, // ילדים א
  "7955db88-27bd-4d02-9680-f731a325ad68": 553, // קט סל א
};

const leagueUrl = (code: number | string) =>
  typeof code === "string" ? code : `https://ibasketball.co.il/league/${IBBA_SEASON}-${code}/`;

/** True for an empty link or an IBBA league page from an earlier season. */
function isStale(link: string | undefined): boolean {
  if (!link?.trim() || WRONG_LINKS.has(link.trim())) return true;
  const m = link.match(/ibasketball\.co\.il\/league\/(\d{4})-/);
  return !!m && +m[1] < IBBA_SEASON;
}

/** The team's IBBA link for the current season. A link the admin set for this
 * season (or any non-league link) is kept; an empty or last-season league link
 * is replaced with the team's current league page. */
export function currentIbbaLink(team: Pick<Team, "id" | "ibbaLink">): string | undefined {
  const code = LEAGUE_CODES[team.id];
  return code && isStale(team.ibbaLink) ? leagueUrl(code) : team.ibbaLink;
}
