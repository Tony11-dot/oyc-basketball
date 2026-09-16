"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlayerPicker } from "@/components/admin/PlayerPicker";
import { useSelection, SelectModeToggle, SelectionBar, BulkActionButton, SelectDot } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { DEFAULT_FEE } from "@/lib/fees";
import type { Localized, Player, Receipt, ReceiptMethod, SiteContent, Team } from "@/lib/types";

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const METHODS: { value: ReceiptMethod; label: Localized }[] = [
  { value: "نقدا", label: { ar: "نقدًا", he: "מזומן", en: "Cash" } },
  { value: "شيكات", label: { ar: "شيكات", he: "צ׳קים", en: "Cheque" } },
  { value: "بطاقة اعتماد", label: { ar: "بطاقة اعتماد", he: "כרטיס אשראי", en: "Credit card" } },
  { value: "تحويل بنكي", label: { ar: "تحويل بنكي", he: "העברה בנקאית", en: "Bank transfer" } },
];

export default function ReceiptsAdmin() {
  const { t, pick, locale } = useI18n();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<ReceiptMethod>("نقدا");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sel = useSelection();
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/receipts").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/teams?all=1").then((r) => r.json()),
      fetch("/api/content").then((r) => r.json()),
    ]).then(([rc, pl, tm, ct]) => {
      setReceipts(rc.receipts ?? []);
      setPlayers(pl.players ?? []);
      setTeams(tm.teams ?? []);
      setContent(ct.content ?? null);
      setLoaded(true);
    });
  }, []);

  const defaultFee = content?.register?.feeAmount || DEFAULT_FEE;
  const player = playerId ? players.find((p) => p.id === playerId) ?? null : null;

  // Selecting a player prefills the amount with their remaining balance
  // (still editable) — but never overwrites something already typed in.
  useEffect(() => {
    if (!player || amount.trim() !== "") return;
    const fee = player.feeAmount ?? defaultFee;
    const remaining = Math.max(fee - Math.min(player.paidAmount ?? 0, fee), 0);
    if (remaining > 0) setAmount(String(remaining));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  const dtf = useMemo(() => new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "he" ? "he" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const methodLabel = (m: string) => pick(METHODS.find((x) => x.value === m)?.label ?? { ar: m, he: m, en: m });

  const canSubmit = player !== null && Number(amount) > 0 && !saving;

  async function create() {
    if (!canSubmit || !player) return;
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
      const paidNow = Number(amount);
      setPlayers((list) => list.map((p) => (p.id === player.id ? { ...p, paidAmount: (p.paidAmount ?? 0) + paidNow } : p)));
      setPlayerId(null); setAmount(""); setNote(""); setMethod("نقدا");
    } catch {
      setError(pick({ ar: "تعذّر إنشاء الوصل. حاول مجددًا.", he: "יצירת הקבלה נכשלה. נסו שוב.", en: "Could not create the receipt. Try again." }));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(pick({ ar: "حذف هذا الوصل؟", he: "למחוק את הקבלה?", en: "Delete this receipt?" }))) return;
    const removed = receipts.find((r) => r.id === id);
    setReceipts((list) => list.filter((r) => r.id !== id));
    await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (removed?.playerId) {
      const takeBack = removed.amount;
      setPlayers((list) => list.map((p) => (p.id === removed.playerId ? { ...p, paidAmount: Math.max((p.paidAmount ?? 0) - takeBack, 0) } : p)));
    }
  }

  async function removeMany(ids: Set<string>) {
    const removedList = receipts.filter((r) => ids.has(r.id));
    setReceipts((list) => list.filter((r) => !ids.has(r.id)));
    await Promise.all(removedList.map((r) => fetch(`/api/receipts/${r.id}`, { method: "DELETE" })));
    const takeBackByPlayer = new Map<string, number>();
    for (const r of removedList) {
      if (!r.playerId) continue;
      takeBackByPlayer.set(r.playerId, (takeBackByPlayer.get(r.playerId) ?? 0) + r.amount);
    }
    if (takeBackByPlayer.size > 0) {
      setPlayers((list) => list.map((p) => (takeBackByPlayer.has(p.id) ? { ...p, paidAmount: Math.max((p.paidAmount ?? 0) - takeBackByPlayer.get(p.id)!, 0) } : p)));
    }
  }

  async function reconcile() {
    if (!confirm(pick({
      ar: "إعادة احتساب رصيد كل لاعب من مجموع وصولاته؟ يرفع المبلغ المدفوع فقط عند الحاجة (لا يُخفَّض أبداً).",
      he: "לחשב מחדש את יתרת כל שחקן לפי סך הקבלות שלו? הסכום ששולם רק יעלה במידת הצורך (לעולם לא יירד).",
      en: "Recalculate every player's paid balance from their receipt totals? This only raises a paid amount when needed — it never lowers one.",
    }))) return;
    setReconciling(true);
    try {
      const res = await fetch("/api/receipts/backfill", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error();
      const byId = new Map<string, number>((d.updated as { id: string; to: number }[]).map((u) => [u.id, u.to]));
      if (byId.size > 0) setPlayers((list) => list.map((p) => (byId.has(p.id) ? { ...p, paidAmount: byId.get(p.id) } : p)));
      alert(pick({
        ar: `تم تحديث ${d.updatedCount} لاعب.`,
        he: `${d.updatedCount} שחקנים עודכנו.`,
        en: `${d.updatedCount} player(s) updated.`,
      }));
    } catch {
      alert(pick({ ar: "تعذّر إعادة الاحتساب. حاول مجددًا.", he: "החישוב מחדש נכשל. נסו שוב.", en: "Recalculation failed. Try again." }));
    } finally {
      setReconciling(false);
    }
  }

  const title = pick({ ar: "الوصول", he: "קבלות", en: "Receipts" });
  const subtitle = pick({ ar: "أنشئ وصلًا رسميًّا بالعربية بضغطة زر.", he: "הפקת קבלה רשמית בערבית בלחיצה אחת.", en: "Issue a formal Arabic payment receipt in one click." });
  const money = (n: number) => `${n.toLocaleString("en-US")} ₪`;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {receipts.length > 0 && (
            <button
              type="button"
              onClick={reconcile}
              disabled={reconciling}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand disabled:opacity-50"
            >
              🔄 {reconciling ? pick({ ar: "جارٍ الاحتساب…", he: "מחשב…", en: "Recalculating…" }) : pick({ ar: "احتساب الأرصدة من الوصول", he: "חישוב יתרות מקבלות", en: "Recalculate balances from receipts" })}
            </button>
          )}
          {receipts.length > 0 && <SelectModeToggle active={sel.active} onToggle={sel.toggleActive} />}
        </div>
      </div>

      {sel.active && (
        <SelectionBar count={sel.ids.size} total={receipts.length} onSelectAll={() => sel.setAll(receipts.map((r) => r.id))} onExit={sel.exit}>
          <BulkActionButton
            count={sel.ids.size}
            label={pick({ ar: "حذف المحدد", he: "מחיקת הנבחרים", en: "Delete selected" })}
            confirmText={pick({ ar: `حذف ${sel.ids.size} وصل؟ سيُخصم المبلغ من رصيد اللاعبين المرتبطين. لا يمكن التراجع.`, he: `למחוק ${sel.ids.size} קבלות? הסכום ינוכה מיתרת השחקנים המשויכים. לא ניתן לבטל.`, en: `Delete ${sel.ids.size} receipt(s)? Linked players' paid balance will be reduced accordingly. This can't be undone.` })}
            onRun={() => { removeMany(sel.ids); sel.exit(); }}
          />
        </SelectionBar>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Create form */}
        <div className="h-fit space-y-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">🧾 {pick({ ar: "وصل جديد", he: "קבלה חדשה", en: "New receipt" })}</h2>

          <div className="block">
            <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "استلمنا من", he: "התקבל מ", en: "Received from" })}</span>
            <PlayerPicker players={players} teams={teams} value={playerId} onChange={setPlayerId} />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "المبلغ (₪)", he: "סכום (₪)", en: "Amount (₪)" })}</span>
            <input type="number" inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={input} />
          </label>

          <div className="block">
            <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "طريقة الدفع", he: "אמצעי תשלום", en: "Payment method" })}</span>
            <div className="grid grid-cols-2 gap-1.5">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${method === m.value ? "border-brand bg-brand-50 text-brand-dark" : "border-line text-muted hover:border-brand/40"}`}
                >
                  {pick(m.label)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "بخصوص (اختياري)", he: "בגין (רשות)", en: "For (optional)" })}</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={pick({ ar: "رسوم تسجيل، ملابس…", he: "דמי הרשמה, ביגוד…", en: "Registration fee, kit…" })} className={input} />
          </label>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <Button onClick={create} disabled={!canSubmit} className="w-full">
            {saving ? pick({ ar: "جارٍ الإنشاء…", he: "יוצר…", en: "Creating…" }) : pick({ ar: "إنشاء الوصل", he: "הפקת קבלה", en: "Create receipt" })}
          </Button>
          <p className="text-center text-[11px] text-muted">{pick({ ar: "يتم توليد PDF رسمي فور الإنشاء.", he: "PDF רשמי נוצר מיד עם ההפקה.", en: "A formal PDF is generated on create." })}</p>
        </div>

        {/* Receipts list */}
        <div>
          {!loaded ? (
            <p className="text-sm text-muted">{t.admin.loading}</p>
          ) : receipts.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface/50 p-12 text-center">
              <p className="text-3xl">🧾</p>
              <p className="mt-2 text-sm font-semibold text-ink">{pick({ ar: "لا وصول بعد", he: "אין קבלות עדיין", en: "No receipts yet" })}</p>
              <p className="mt-1 text-xs text-muted">{pick({ ar: "أنشئ أول وصل من النموذج.", he: "צרו את הקבלה הראשונה מהטופס.", en: "Create your first one from the form." })}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              {receipts.map((r, i) => (
                <div key={r.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
                  {sel.active && <SelectDot checked={sel.isSelected(r.id)} onClick={() => sel.toggle(r.id)} />}
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-xs font-black text-brand-dark">#{r.number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{r.name}</p>
                    <p className="truncate text-xs text-muted">{methodLabel(r.method)} · {dtf.format(new Date(r.createdAt))}{r.note ? ` · ${r.note}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-ink" dir="ltr">{money(r.amount)}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <a href={`/api/receipts/${r.id}/pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                      ⭳ PDF
                    </a>
                    <button type="button" onClick={() => remove(r.id)} aria-label={t.admin.actions.delete} className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-rose-300 hover:text-rose-600">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
