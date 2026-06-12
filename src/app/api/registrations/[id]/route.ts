import { updateRegistrations } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import type { Registration, RegistrationStatus } from "@/lib/types";

const STATUSES: RegistrationStatus[] = ["new", "signed", "archived"];

// PATCH — update a registration's status (admin only).
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

  const status = STATUSES.includes(body.status as RegistrationStatus)
    ? (body.status as RegistrationStatus)
    : undefined;

  let updated: Registration | undefined;
  await updateRegistrations((list) =>
    list.map((r) => {
      if (r.id !== id) return r;
      updated = {
        ...r,
        status: status ?? r.status,
        signedAt: status === "signed" ? (r.signedAt ?? new Date().toISOString()) : r.signedAt,
      };
      return updated;
    }),
  );

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ registration: updated });
}

// DELETE — remove a registration (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let found = false;
  await updateRegistrations((list) => {
    const next = list.filter((r) => r.id !== id);
    found = next.length !== list.length;
    return next;
  });
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
