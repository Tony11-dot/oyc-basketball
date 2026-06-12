import { updateHighlights } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localizedWith } from "@/lib/api";
import type { Highlight } from "@/lib/types";

// PATCH — update a highlight reel (admin only).
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

  let updated: Highlight | undefined;
  await updateHighlights((list) =>
    list.map((h) => {
      if (h.id !== id) return h;
      updated = {
        ...h,
        videoUrl: typeof body.videoUrl === "string" ? body.videoUrl : h.videoUrl,
        embedUrl: typeof body.embedUrl === "string" ? body.embedUrl : h.embedUrl,
        poster: typeof body.poster === "string" ? body.poster : h.poster,
        caption: localizedWith(body.caption, h.caption),
        aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : h.aspectRatio,
      };
      return updated;
    }),
  );

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ highlight: updated });
}

// DELETE — remove a highlight reel (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let found = false;
  await updateHighlights((list) => {
    const next = list.filter((h) => h.id !== id);
    found = next.length !== list.length;
    return next;
  });
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
