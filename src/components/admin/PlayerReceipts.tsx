"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Player, Receipt, ReceiptMethod } from "@/lib/types";
import { DEFAULT_FEE } from "@/lib/fees";

const METHODS: { value: ReceiptMethod; label: Localized }[] = [
  { value: "نقدا", label: { ar: "نقدًا", he: "מזומן", en: "Cash" } },
  { value: "شيكات", label: { ar: "شيكات", he: "צ׳קים", en: "Cheque" } },
  { value: "بطاقة اعتماد", label: { ar: "بطاقة اعتماد", he: "כרטיס אשראי", en: "Credit card" } },
  { value: "تحويل بنكي", label: { ar: "تحويل بنكي", he: "העברה בנקאית", en: "Bank transfer" } },
];

const numInput =
  "h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

/** A player's receipt history + a quick "add receipt" form, embeddable in any
 * player editor. Self-contained: fetches/creates/deletes on its own, keyed by
 * `player.id`. */
export function PlayerReceipts({
  player,
  defaultFee = DEFAULT_FEE,
  onPaidChange,
}: {
  player: Player;
  /** Club default fee (admin → Content → Register); used only to prefill a
   * new receipt's amount with the player's remaining balance. */
  defaultFee?: number;
  /** Called with +amount when a receipt is created and -amount when one is
   * deleted, so the parent can reflect the balance change immediately (the
   * server already applies the same change to the player's paidAmount). */
  onPaidChange?: (delta: number) => void;
}) {
  const { pick, locale } = useI18n();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<ReceiptMethod>("نقدا");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(false);
    fetch(`/api/receipts?playerId=${player.id}`)
      .then((r) => r.json())
      .then((d) => { setReceipts(d.receipts ?? []); setLoaded(true); });
  }, [player.id]);

  const fee = player.feeAmount ?? defaultFee;
  const paid = Math.min(player.paidAmount ?? 0, fee);
  const remaining = Math.max(fee - paid, 0);
  const money = (n: number) => `${n.toLocaleString("en-US")} ₪`;
  const dtf = useMemo(() => new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "he" ? "he" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const methodLabel = (m: string) => pick(METHODS.find((x) => x.value === m)?.label ?? { ar: m, he: m, en: m });

  const openForm = () => {
    setAmount(remaining > 0 ? String(remaining) : "");
    setMethod("نقدا");
    setNote("");
    setError(null);
    setOpen(true);
  };

  const canCreate = Number(amount) > 0 && !saving;

  const create = async () => {
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, name: pick(player.name) || player.id, amount: Number(amount), method, note: note.trim() }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setReceipts((list) => [d.receipt, ...list]);
      onPaidChange?.(Number(amount));
      setOpen(false);
    } catch {
      setError(pick({ ar: "تعذّر إنشاء الوصل. حاول مجددًا.", he: "יצירת הקבלה נכשלה. נסו שוב.", en: "Could not create the receipt. Try again." }));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(pick({ ar: "حذف هذا الوصل؟", he: "למחוק את הקבלה?", en: "Delete this receipt?" }))) return;
    const removed = receipts.find((r) => r.id === id);
    setReceipts((list) => list.filter((r) => r.id !== id));
    await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (removed) onPaidChange?.(-removed.amount);
  };

  return (
    <div className="space-y-2 rounded-xl border border-line bg-surface/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink">🧾 {pick({ ar: "الوصول", he: "קבלות", en: "Receipts" })}</span>
        {!open && (
          <button type="button" onClick={openForm} className="rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-brand-dark">
            + {pick({ ar: "وصل جديد", he: "קבלה חדשה", en: "New receipt" })}
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-2 rounded-lg border border-brand/30 bg-white p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold text-muted">{pick({ ar: "المبلغ (₪)", he: "סכום (₪)", en: "Amount (₪)" })}</span>
              <input type="number" inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} className={numInput} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold text-muted">{pick({ ar: "بخصوص (اختياري)", he: "בגין (רשות)", en: "For (optional)" })}</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} className={numInput} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${method === m.value ? "border-brand bg-brand-50 text-brand-dark" : "border-line text-muted hover:border-brand/40"}`}
              >
                {pick(m.label)}
              </button>
            ))}
          </div>
          {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="text-[11px] font-semibold text-muted hover:text-ink">
              {pick({ ar: "إلغاء", he: "ביטול", en: "Cancel" })}
            </button>
            <button
              type="button"
              onClick={create}
              disabled={!canCreate}
              className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {saving ? pick({ ar: "جارٍ الإنشاء…", he: "יוצר…", en: "Creating…" }) : pick({ ar: "إنشاء", he: "יצירה", en: "Create" })}
            </button>
          </div>
        </div>
      )}

      {!loaded ? null : receipts.length === 0 ? (
        <p className="text-[11px] text-muted">{pick({ ar: "لا وصول لهذا اللاعب بعد.", he: "אין עדיין קבלות לשחקן זה.", en: "No receipts for this player yet." })}</p>
      ) : (
        <div className="space-y-1.5">
          {receipts.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs">
              <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-black text-brand-dark">#{r.number}</span>
              <p className="min-w-0 flex-1 truncate text-[11px] text-muted">{methodLabel(r.method)} · {dtf.format(new Date(r.createdAt))}{r.note ? ` · ${r.note}` : ""}</p>
              <span className="shrink-0 text-xs font-extrabold text-ink" dir="ltr">{money(r.amount)}</span>
              <a href={`/api/receipts/${r.id}/pdf`} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-bold text-brand-dark hover:underline">PDF</a>
              <button type="button" onClick={() => remove(r.id)} aria-label="delete" className="shrink-0 text-muted transition hover:text-rose-600">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
