import { randomUUID } from "crypto";
import { getReceipts, updateReceipts } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import type { Receipt, ReceiptMethod } from "@/lib/types";

const METHODS: ReceiptMethod[] = ["نقدا", "شيكات", "بطاقة اعتماد"];

// GET — list receipts, newest first (admin only; they contain payment info).
export async function GET() {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const receipts = (await getReceipts()).slice().sort((a, b) => b.number - a.number);
  return Response.json({ receipts });
}

// POST — issue a new receipt (admin only). Assigns the next sequential number.
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const method = METHODS.includes(body.method as ReceiptMethod) ? (body.method as ReceiptMethod) : null;

  if (!name) return Response.json({ error: "name is required" }, { status: 422 });
  if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "amount must be a positive number" }, { status: 422 });
  if (!method) return Response.json({ error: "invalid payment method" }, { status: 422 });

  let created: Receipt | undefined;
  await updateReceipts((list) => {
    const nextNo = list.reduce((m, r) => Math.max(m, r.number), 0) + 1;
    created = {
      id: randomUUID(),
      number: nextNo,
      name,
      amount: Math.round(amount),
      method,
      note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : undefined,
      createdAt: new Date().toISOString(),
    };
    return [created, ...list];
  });

  return Response.json({ receipt: created }, { status: 201 });
}
