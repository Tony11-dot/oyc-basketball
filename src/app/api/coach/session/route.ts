import { getCurrentCoach } from "@/lib/coachAuth";
import { getPlayers, getTeams } from "@/lib/db";

// GET — the signed-in coach plus the teams they coach and the players on them.
export async function GET() {
  const coach = await getCurrentCoach();
  if (!coach) return Response.json({ coach: null });

  const [teams, players] = await Promise.all([getTeams(), getPlayers()]);
  const myTeams = teams
    .filter((t) => (t.coachIds ?? []).includes(coach.id))
    .sort((a, b) => a.order - b.order);

  // Only the players that appear on the coach's teams.
  const myPlayerIds = new Set(myTeams.flatMap((t) => t.playerIds));
  const myPlayers = players.filter((p) => myPlayerIds.has(p.id));

  return Response.json({ coach, teams: myTeams, players: myPlayers });
}
