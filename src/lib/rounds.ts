import type { Match, Team } from "./types";

/** Round label for every match of a team, keyed by match id. A round typed in
 * admin wins; otherwise the round is the game's position in the team's season
 * schedule (dated games in date order — a league plays one game per round).
 * Dates are zone-less ISO strings, so they sort correctly as plain text. */
export function teamRounds(team: Pick<Team, "matches">): Map<string, string> {
  const out = new Map<string, string>();
  const dated = team.matches.filter((m) => m.date).sort((a, b) => a.date.localeCompare(b.date));
  dated.forEach((m, i) => out.set(m.id, String(i + 1)));
  for (const m of team.matches) if (m.round?.trim()) out.set(m.id, m.round.trim());
  return out;
}

/** The round label of one match within its team ("" when there is none). */
export function matchRound(team: Pick<Team, "matches">, match: Pick<Match, "id">): string {
  return teamRounds(team).get(match.id) ?? "";
}
