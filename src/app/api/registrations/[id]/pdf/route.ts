import { getRegistrations } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { loadFilledPdf } from "@/lib/registrationPdf";

// GET — stream the filled registration PDF (admin only). Works whether the file
// lives in Vercel Blob (production) or on local disk (dev).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const reg = (await getRegistrations()).find((r) => r.id === id);
  if (!reg) return Response.json({ error: "Not found" }, { status: 404 });

  const bytes = await loadFilledPdf(reg);
  if (!bytes) return Response.json({ error: "No PDF stored" }, { status: 404 });

  const name = (reg.playerName || "registration").replace(/[^\p{L}\p{N}_-]+/gu, "_");
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
