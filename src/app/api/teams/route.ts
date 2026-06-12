import { randomUUID } from "crypto";
import { getTeams, updateTeams } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localized, parseMatches, strList } from "@/lib/api";
import type { Team } from "@/lib/types";

// GET — list teams. Public callers get enabled ones sorted; admin passes ?all=1.
export async function GET(request: Request) {
  const all = new URL(request.url).searchParams.get("all") === "1";
  const teams = (await getTeams()).slice().sort((a, b) => a.order - b.order);
  const visible = all ? teams : teams.filter((t) => t.enabled);
  return Response.json({ teams: visible });
}

// POST — create a team (admin only).
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = localized(body.name);
  if (!name.ar && !name.he && !name.en) {
    return Response.json({ error: "name is required" }, { status: 422 });
  }

  const current = await getTeams();
  const maxOrder = current.reduce((m, t) => Math.max(m, t.order), -1);

  const team: Team = {
    id: randomUUID(),
    name,
    description: localized(body.description),
    image: typeof body.image === "string" ? body.image : "",
    imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
    detailBg: typeof body.detailBg === "string" ? body.detailBg : undefined,
    ibbaLink: typeof body.ibbaLink === "string" ? body.ibbaLink : undefined,
    playerIds: strList(body.playerIds),
    matches: parseMatches(body.matches),
    enabled: body.enabled === undefined ? true : Boolean(body.enabled),
    order: typeof body.order === "number" ? body.order : maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  await updateTeams((list) => [...list, team]);
  return Response.json({ team }, { status: 201 });
}
