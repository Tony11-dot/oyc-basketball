"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Player } from "@/lib/types";
import { DEFAULT_FEE } from "@/lib/fees";

export { DEFAULT_FEE };

const numInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const clampNum = (v: string) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Per-player payment tracker: total fee, amount paid (number + slider) and a
 * live "how much is left" balance with a progress bar. */
export function PaymentEditor({
  player,
  defaultFee = DEFAULT_FEE,
  onChange,
}: {
  player: Player;
  /** Club default fee (admin → Content → Register), used when this player has
   * no explicit override. */
  defaultFee?: number;
  onChange: (patch: Partial<Player>) => void;
}) {
  const { pick } = useI18n();
  const fee = player.feeAmount ?? defaultFee;
  const paid = Math.min(player.paidAmount ?? 0, fee);
  const remaining = Math.max(fee - paid, 0);
  const pct = fee > 0 ? Math.round((paid / fee) * 100) : 0;
  const settled = remaining === 0 && fee > 0;

  const money = (n: number) => `${n.toLocaleString("en-US")} ₪`;

  return (
    <div className="space-y-2.5 rounded-xl border border-line bg-surface/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink">💳 {pick({ ar: "الدفع", he: "תשלום", en: "Payment" })}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${settled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          {settled
            ? pick({ ar: "مدفوع بالكامل", he: "שולם במלואו", en: "Paid in full" })
            : `${pick({ ar: "متبقّي", he: "נותר", en: "Left" })} ${money(remaining)}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-muted">{pick({ ar: "المبلغ المطلوب", he: "סכום לתשלום", en: "Total fee" })}</span>
          <input
            type="number"
            inputMode="numeric"
            dir="ltr"
            value={fee}
            onChange={(e) => {
              const nextFee = clampNum(e.target.value);
              onChange({ feeAmount: nextFee, paidAmount: Math.min(paid, nextFee) });
            }}
            className={numInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-muted">{pick({ ar: "المبلغ المدفوع", he: "שולם", en: "Paid" })}</span>
          <input
            type="number"
            inputMode="numeric"
            dir="ltr"
            value={paid}
            onChange={(e) => onChange({ paidAmount: Math.min(clampNum(e.target.value), fee) })}
            className={numInput}
          />
        </label>
      </div>

      <input
        type="range"
        min={0}
        max={fee}
        step={10}
        value={paid}
        onChange={(e) => onChange({ paidAmount: clampNum(e.target.value) })}
        className="w-full accent-brand"
        aria-label={pick({ ar: "المبلغ المدفوع", he: "שולם", en: "Paid" })}
      />

      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all ${settled ? "bg-emerald-500" : "bg-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>{money(paid)} {pick({ ar: "مدفوع", he: "שולם", en: "paid" })}</span>
        <span>{pct}%</span>
        <span>{pick({ ar: "من", he: "מתוך", en: "of" })} {money(fee)}</span>
      </div>
    </div>
  );
}
