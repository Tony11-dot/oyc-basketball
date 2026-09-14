import { getReceipts, getPlayers, updatePlayers } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

// POST — one-time (or occasional) reconciliation: sum every player's receipts
// and raise their paidAmount to at least that total. Needed because receipts
// issued before paidAmount-syncing shipped never touched the player's
// balance, so Teams/Finances undercounted what was actually collected.
// Never lowers paidAmount — a receipt total is a floor, not a replacement,
// so manual payments recorded without a receipt are preserved.
export async function POST() {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [receipts, players] = await Promise.all([getReceipts(), getPlayers()]);

  const totalsByPlayer = new Map<string, number>();
  for (const r of receipts) {
    if (!r.playerId) continue;
    totalsByPlayer.set(r.playerId, (totalsByPlayer.get(r.playerId) ?? 0) + r.amount);
  }

  const updated: { id: string; name: string; from: number; to: number }[] = [];
  await updatePlayers((list) =>
    list.map((p) => {
      const receiptTotal = totalsByPlayer.get(p.id);
      if (receiptTotal == null) return p;
      const before = p.paidAmount ?? 0;
      if (receiptTotal <= before) return p;
      updated.push({ id: p.id, name: p.name.ar || p.name.he || p.name.en || p.id, from: before, to: receiptTotal });
      return { ...p, paidAmount: receiptTotal };
    }),
  );

  const untouched = players.filter((p) => totalsByPlayer.has(p.id) && !updated.some((u) => u.id === p.id)).length;
  return Response.json({ updated, updatedCount: updated.length, alreadyCurrentCount: untouched });
}
