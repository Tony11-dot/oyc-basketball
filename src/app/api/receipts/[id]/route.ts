import { updateReceipts, updatePlayers } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import type { Receipt } from "@/lib/types";

// DELETE — remove a receipt (admin only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let removed: Receipt | undefined;
  await updateReceipts((list) => {
    removed = list.find((r) => r.id === id);
    return list.filter((r) => r.id !== id);
  });
  if (!removed) return Response.json({ error: "Not found" }, { status: 404 });

  // Undo the balance credit this receipt gave the player, so deleting a
  // mistaken receipt doesn't leave them looking paid.
  if (removed.playerId) {
    const takeBack = removed.amount;
    await updatePlayers((list) =>
      list.map((p) => (p.id === removed!.playerId ? { ...p, paidAmount: Math.max((p.paidAmount ?? 0) - takeBack, 0) } : p)),
    );
  }

  return Response.json({ ok: true });
}
