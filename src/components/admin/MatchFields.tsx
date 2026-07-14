"use client";

import { LocalizedField } from "@/components/admin/LocalizedField";
import { DateField } from "@/components/ui/Calendar";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Match } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

/** The editable fields for a single match/game. Shared by the team detail Games
 * tab and the global Games admin page so the two never drift. */
export function MatchFields({
  match,
  onChange,
  onRemove,
}: {
  match: Match;
  onChange: (patch: Partial<Match>) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <LocalizedField label={t.admin.team.opponent} value={match.opponent} onChange={(opponent) => onChange({ opponent })} />
      <DateField label={t.admin.team.matchDate} value={match.date} withTime onChange={(date) => onChange({ date })} />
      <LocalizedField label={t.admin.team.matchWhere} value={match.where} onChange={(where) => onChange({ where })} />
      <LocalizedField label={`${t.admin.team.contactName} (المسؤول)`} value={match.contactName ?? emptyLoc()} onChange={(contactName) => onChange({ contactName })} />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.contactPhone}</span>
        <input dir="ltr" value={match.contactPhone ?? ""} onChange={(e) => onChange({ contactPhone: e.target.value })} className={plainInput} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.matchIbba}</span>
        <input dir="ltr" placeholder="https://www.ibba.co.il/…" value={match.ibbaLink ?? ""} onChange={(e) => onChange({ ibbaLink: e.target.value })} className={plainInput} />
      </label>
      <button type="button" onClick={onRemove} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.team.removeMatch}</button>
    </div>
  );
}
