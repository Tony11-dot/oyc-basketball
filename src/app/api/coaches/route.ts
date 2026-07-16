import { randomUUID } from "crypto";
import { getCoaches, updateCoaches } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localized } from "@/lib/api";
import type { Coach } from "@/lib/types";

// GET — list all coaches in the shared pool (admin only: ID numbers double as
// login credentials, so this must not be public).
export async function GET() {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coaches = await getCoaches();
  return Response.json({ coaches });
}

// POST — create or update ("upsert") a coach (admin only). Accepts an optional
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
  const coach: Coach = {
    id,
    name: localized(body.name),
    idNumber: typeof body.idNumber === "string" ? body.idNumber.trim() : undefined,
    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
    image: typeof body.image === "string" ? body.image : "",
    imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
  };

  let existed = false;
  await updateCoaches((list) => {
    const i = list.findIndex((c) => c.id === id);
    if (i >= 0) {
      existed = true;
      const next = [...list];
      next[i] = coach;
      return next;
    }
    return [...list, coach];
  });
  return Response.json({ coach }, { status: existed ? 200 : 201 });
}
