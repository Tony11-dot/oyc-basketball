"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Player, Team } from "@/lib/types";

const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

/** Searchable, team-filterable combobox for picking one existing player from
 * the shared roster (e.g. "who is this receipt for?"). Unlike the team-detail
 * PlayerPicker, this one only selects — it never creates a new player. */
export function PlayerPicker({
  players,
  teams,
  value,
  onChange,
  placeholder,
}: {
  players: Player[];
  teams: Team[];
  /** Selected player id, or null when nothing is picked. */
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const { pick } = useI18n();
  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const teamNamesOf = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const tm of teams) {
      const label = pick(tm.name);
      for (const pid of tm.playerIds) map.set(pid, [...(map.get(pid) ?? []), label]);
    }
    return map;
  }, [teams, pick]);

  const selected = value ? players.find((p) => p.id === value) ?? null : null;

  const needle = q.trim().toLowerCase();
  const matches = players.filter((p) => {
    if (teamFilter !== "all" && !teams.find((tm) => tm.id === teamFilter)?.playerIds.includes(p.id)) return false;
    if (!needle) return true;
    return [p.name.ar, p.name.he, p.name.en, p.number, ...(teamNamesOf.get(p.id) ?? [])].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });

  const choose = (id: string) => { onChange(id); setQ(""); setOpen(false); };

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{pick(selected.name) || selected.id}</p>
          <p className="truncate text-xs text-muted">
            {selected.number ? `#${selected.number} · ` : ""}
            {(teamNamesOf.get(selected.id) ?? []).join(", ") || pick({ ar: "بلا فريق", he: "ללא קבוצה", en: "No team" })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          {pick({ ar: "تغيير", he: "החלפה", en: "Change" })}
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative space-y-2">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? pick({ ar: "ابحث عن لاعب…", he: "חיפוש שחקן…", en: "Search a player…" })}
          className={plainInput}
        />
        {teams.length > 0 && (
          <select
            value={teamFilter}
            onChange={(e) => { setTeamFilter(e.target.value); setOpen(true); }}
            className={`${plainInput} max-w-40 shrink-0`}
          >
            <option value="all">{pick({ ar: "كل الفرق", he: "כל הקבוצות", en: "All teams" })}</option>
            {teams.map((tm) => (
              <option key={tm.id} value={tm.id}>{pick(tm.name) || tm.id}</option>
            ))}
          </select>
        )}
      </div>
      {open && (
        <div className="absolute z-20 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-card">
          {matches.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted">{pick({ ar: "لا نتائج", he: "אין תוצאות", en: "No matches" })}</p>
          )}
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-ink transition hover:bg-surface"
            >
              <span className="min-w-0 flex-1 truncate font-medium">{pick(p.name) || p.id}</span>
              {p.number && <span className="shrink-0 text-xs text-muted">#{p.number}</span>}
              <span className="shrink-0 truncate text-xs text-muted">{(teamNamesOf.get(p.id) ?? []).join(", ")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
