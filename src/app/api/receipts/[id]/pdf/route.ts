import { getReceipts } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { buildReceiptPdf } from "@/lib/receiptPdf";

// GET — generate + stream the receipt PDF on the fly (admin only).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const receipt = (await getReceipts()).find((r) => r.id === id);
  if (!receipt) return Response.json({ error: "Not found" }, { status: 404 });

  const baseUrl = new URL(request.url).origin;
  const bytes = await buildReceiptPdf(baseUrl, receipt);

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${receipt.number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
