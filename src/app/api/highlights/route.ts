import { randomUUID } from "crypto";
import { getHighlights, updateHighlights } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { localized } from "@/lib/api";
import type { Highlight } from "@/lib/types";

// GET — list highlight reels (in stored order).
export async function GET() {
  const highlights = await getHighlights();
  return Response.json({ highlights });
}

// POST — create a highlight reel (admin only).
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

  const highlight: Highlight = {
    id: randomUUID(),
    videoUrl: typeof body.videoUrl === "string" ? body.videoUrl : undefined,
    embedUrl: typeof body.embedUrl === "string" ? body.embedUrl : undefined,
    poster: typeof body.poster === "string" ? body.poster : undefined,
    caption: localized(body.caption),
    aspectRatio: typeof body.aspectRatio === "string" ? body.aspectRatio : undefined,
  };

  await updateHighlights((list) => [...list, highlight]);
  return Response.json({ highlight }, { status: 201 });
}
