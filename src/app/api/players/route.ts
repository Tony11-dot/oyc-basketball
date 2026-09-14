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

// POST — create or update ("upsert") a player (admin only). Accepts an optional
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
  const player: Player = {
    id,
    name: localized(body.name),
    number: typeof body.number === "string" ? body.number : undefined,
    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
    fatherPhone: typeof body.fatherPhone === "string" ? body.fatherPhone.trim() : undefined,
    motherPhone: typeof body.motherPhone === "string" ? body.motherPhone.trim() : undefined,
    image: typeof body.image === "string" ? body.image : "",
    imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
    birthDate: typeof body.birthDate === "string" ? body.birthDate : undefined,
    feeAmount: typeof body.feeAmount === "number" ? body.feeAmount : undefined,
    paidAmount: typeof body.paidAmount === "number" ? body.paidAmount : undefined,
  };

  let existed = false;
  await updatePlayers((list) => {
    const i = list.findIndex((p) => p.id === id);
    if (i >= 0) {
      existed = true;
      const next = [...list];
      next[i] = player;
      return next;
    }
    return [...list, player];
  });
  return Response.json({ player }, { status: existed ? 200 : 201 });
}
