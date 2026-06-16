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

// POST — create a coach (admin only).
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

  const coach: Coach = {
    id: randomUUID(),
    name,
    idNumber: typeof body.idNumber === "string" ? body.idNumber.trim() : undefined,
    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
    image: typeof body.image === "string" ? body.image : "",
    imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : undefined,
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
  };

  await updateCoaches((list) => [...list, coach]);
  return Response.json({ coach }, { status: 201 });
}
