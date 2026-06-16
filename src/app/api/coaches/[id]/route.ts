import { updateCoaches, updateTeams } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localizedWith } from "@/lib/api";
import type { Coach } from "@/lib/types";

// PATCH — update a coach (admin only).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let updated: Coach | undefined;
  await updateCoaches((list) =>
    list.map((c) => {
      if (c.id !== id) return c;
      updated = {
        ...c,
        name: localizedWith(body.name, c.name),
        idNumber: typeof body.idNumber === "string" ? body.idNumber.trim() : c.idNumber,
        phone: typeof body.phone === "string" ? body.phone.trim() : c.phone,
        image: typeof body.image === "string" ? body.image : c.image,
        imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : c.imagePosition,
        aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : c.aspectRatio,
      };
      return updated;
    }),
  );

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ coach: updated });
}

// DELETE — remove a coach from the pool, and detach them from every team.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let found = false;
  await updateCoaches((list) => {
    const next = list.filter((c) => c.id !== id);
    found = next.length !== list.length;
    return next;
  });
  await updateTeams((list) => list.map((t) => ({ ...t, coachIds: (t.coachIds ?? []).filter((cid) => cid !== id) })));
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
