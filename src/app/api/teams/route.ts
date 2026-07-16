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

// POST — create or update ("upsert") a team (admin only). Accepts an optional
// client-generated id so autosave can retry safely without ids ever changing;
// posting the same id twice updates instead of duplicating.
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

  const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : randomUUID();
  const current = await getTeams();
  const maxOrder = current.reduce((m, t) => Math.max(m, t.order), -1);

  let saved: Team | undefined;
  let existed = false;
  await updateTeams((list) => {
    const i = list.findIndex((t) => t.id === id);
    saved = {
      id,
      name: localized(body.name),
      description: localized(body.description),
      image: typeof body.image === "string" ? body.image : "",
      imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
      aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
      detailBg: typeof body.detailBg === "string" ? body.detailBg : undefined,
      ibbaLink: typeof body.ibbaLink === "string" ? body.ibbaLink : undefined,
      playerIds: strList(body.playerIds),
      coachIds: strList(body.coachIds),
      matches: parseMatches(body.matches),
      enabled: body.enabled === undefined ? true : Boolean(body.enabled),
      order: typeof body.order === "number" ? body.order : i >= 0 ? list[i].order : maxOrder + 1,
      createdAt: i >= 0 ? list[i].createdAt : new Date().toISOString(),
    };
    if (i >= 0) {
      existed = true;
      const next = [...list];
      next[i] = saved;
      return next;
    }
    return [...list, saved];
  });
  return Response.json({ team: saved }, { status: existed ? 200 : 201 });
}
