import { updatePlayers, updateTeams } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localizedWith } from "@/lib/api";
import type { Player } from "@/lib/types";

// PATCH — update a player (admin only).
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

  let updated: Player | undefined;
  await updatePlayers((list) =>
    list.map((p) => {
      if (p.id !== id) return p;
      updated = {
        ...p,
        name: localizedWith(body.name, p.name),
        number: typeof body.number === "string" ? body.number : p.number,
        position: body.position != null ? localizedWith(body.position, p.position ?? { ar: "", he: "", en: "" }) : p.position,
        image: typeof body.image === "string" ? body.image : p.image,
        imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : p.imagePosition,
        aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : p.aspectRatio,
        feeAmount: typeof body.feeAmount === "number" ? body.feeAmount : p.feeAmount,
        paidAmount: typeof body.paidAmount === "number" ? body.paidAmount : p.paidAmount,
      };
      return updated;
    }),
  );

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ player: updated });
}

// DELETE — remove a player from the roster, and detach them from every team.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let found = false;
  await updatePlayers((list) => {
    const next = list.filter((p) => p.id !== id);
    found = next.length !== list.length;
    return next;
  });
  await updateTeams((list) => list.map((t) => ({ ...t, playerIds: t.playerIds.filter((pid) => pid !== id) })));
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
