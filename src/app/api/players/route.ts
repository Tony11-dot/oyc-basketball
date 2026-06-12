import { randomUUID } from "crypto";
import { getPlayers, updatePlayers } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localized } from "@/lib/api";
import type { Player } from "@/lib/types";

// GET — list all players in the shared roster.
export async function GET() {
  const players = await getPlayers();
  return Response.json({ players });
}

// POST — create a player (admin only).
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

  const player: Player = {
    id: randomUUID(),
    name,
    number: typeof body.number === "string" ? body.number : undefined,
    position: body.position != null ? localized(body.position) : undefined,
    image: typeof body.image === "string" ? body.image : "",
    imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
  };

  await updatePlayers((list) => [...list, player]);
  return Response.json({ player }, { status: 201 });
}
