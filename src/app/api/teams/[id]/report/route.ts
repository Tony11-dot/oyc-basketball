import { getPlayers, getTeams } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { buildTeamReportPdf } from "@/lib/teamReportPdf";

// GET — generate + stream the team finances report PDF (admin only).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [teams, players] = await Promise.all([getTeams(), getPlayers()]);
  const team = teams.find((t) => t.id === id);
  if (!team) return Response.json({ error: "Not found" }, { status: 404 });

  const roster = team.playerIds
    .map((pid) => players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => p != null);

  const baseUrl = new URL(request.url).origin;
  const bytes = await buildTeamReportPdf(baseUrl, team, roster);

  // HTTP headers are Latin-1 only: ASCII fallback + RFC 5987 UTF-8 filename so
  // Arabic/Hebrew team names download with their real name where supported.
  const name = (team.name.ar || team.name.he || team.name.en || "team").replace(/[^\p{L}\p{N}_-]+/gu, "_");
  const ascii = name.replace(/[^A-Za-z0-9_-]+/g, "").slice(0, 60) || "team";
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="report-${ascii}.pdf"; filename*=UTF-8''${encodeURIComponent(`report-${name}.pdf`)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
