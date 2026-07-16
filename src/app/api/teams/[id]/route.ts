import { updateTeams } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localizedWith, parseMatches } from "@/lib/api";
import type { Team } from "@/lib/types";

// PATCH — update a team (admin only).
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

  let updated: Team | undefined;
  await updateTeams((list) =>
    list.map((t) => {
      if (t.id !== id) return t;
      updated = {
        ...t,
        name: localizedWith(body.name, t.name),
        description: localizedWith(body.description, t.description),
        image: typeof body.image === "string" ? body.image : t.image,
        imagePosition: typeof body.imagePosition === "string" ? body.imagePosition : t.imagePosition,
        aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : t.aspectRatio,
        detailBg: typeof body.detailBg === "string" ? body.detailBg : t.detailBg,
        ibbaLink: typeof body.ibbaLink === "string" ? body.ibbaLink : t.ibbaLink,
        playerIds: Array.isArray(body.playerIds)
          ? body.playerIds.filter((x): x is string => typeof x === "string")
          : t.playerIds,
        coachIds: Array.isArray(body.coachIds)
          ? body.coachIds.filter((x): x is string => typeof x === "string")
          : t.coachIds ?? [],
        matches: body.matches != null ? parseMatches(body.matches) : t.matches,
        paymentsEnabled: body.paymentsEnabled != null ? Boolean(body.paymentsEnabled) : t.paymentsEnabled,
        enabled: body.enabled != null ? Boolean(body.enabled) : t.enabled,
        order: typeof body.order === "number" ? body.order : t.order,
      };
      return updated;
    }),
  );

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ team: updated });
}

// DELETE — remove a team (admin only). Players stay in the shared roster.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let found = false;
  await updateTeams((list) => {
    const next = list.filter((t) => t.id !== id);
    found = next.length !== list.length;
    return next;
  });
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
