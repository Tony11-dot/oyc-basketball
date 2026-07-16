"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MatchFields } from "@/components/admin/MatchFields";
import { ViewToggle, TapChevron, AutosaveBar, DetailPanel, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAutosave } from "@/lib/useAutosave";
import type { Localized, Match, Team } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const selectInput =
  "h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

type TimeFilter = "all" | "upcoming" | "past";

interface GameRow {
  team: Team;
  match: Match;
  time: number; // ms; NaN when no date
}

export default function GamesAdmin() {
  const { t, pick, locale } = useI18n();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [editingKey, setEditingKey] = useState<string | null>(null); // `${teamId}:${matchId}`

  useEffect(() => {
    fetch("/api/teams?all=1")
      .then((r) => r.json())
      .then((d) => { setTeams(d.teams ?? []); setLoaded(true); });
  }, []);

  // ---- Match mutators (edit the owning team's matches) ----------------------
  const updateMatch = (teamId: string, matchId: string, patch: Partial<Match>) =>
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, matches: tm.matches.map((m) => (m.id === matchId ? { ...m, ...patch } : m)) } : tm)));
  const removeMatch = (teamId: string, matchId: string) => {
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, matches: tm.matches.filter((m) => m.id !== matchId) } : tm)));
    setEditingKey(null);
  };
  const addMatch = (teamId: string) => {
    if (!teamId) return;
    const id = `m-${Date.now()}`;
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, matches: [...tm.matches, { id, opponent: emptyLoc(), date: "", where: emptyLoc(), ibbaLink: "" }] } : tm)));
    setEditingKey(`${teamId}:${id}`);
  };

  // ---- Persist: PATCH only the teams whose matches changed ------------------
  // Match ids are client-generated and stable, so saving is safe even while the
  // inline editor is open; failures throw so autosave shows the error and
  // retries. No refetch: in-flight keystrokes are never overwritten.
  const persist = useCallback(async (v: Team[], prev: Team[]): Promise<Team[]> => {
    const headers = { "Content-Type": "application/json" };
    const changed = v.filter((tm) => {
      const before = prev.find((p) => p.id === tm.id);
      return !before || JSON.stringify(before.matches) !== JSON.stringify(tm.matches);
    });
    await Promise.all(changed.map((tm) => fetch(`/api/teams/${tm.id}`, { method: "PATCH", headers, body: JSON.stringify({ matches: tm.matches }) }).then((r) => {
      if (!r.ok) throw new Error(`save failed: ${r.status}`);
    })));
    return v;
  }, []);

  const { saveState, undo, canUndo } = useAutosave({
    value: teams,
    setValue: setTeams,
    onSave: persist,
    ready: loaded,
  });

  // ---- Derived list ---------------------------------------------------------
  const now = Date.now();
  const dtf = useMemo(() => new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "he" ? "he" : "en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }), [locale]);
  const ttf = useMemo(() => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }), []);

  const games = useMemo<GameRow[]>(() => {
    const rows: GameRow[] = [];
    for (const tm of teams) for (const m of tm.matches) rows.push({ team: tm, match: m, time: m.date ? new Date(m.date).getTime() : NaN });
    // Order: upcoming ascending (soonest first), then past descending (most recent first), then undated.
    return rows.sort((a, b) => {
      const au = !Number.isNaN(a.time) && a.time >= now;
      const bu = !Number.isNaN(b.time) && b.time >= now;
      if (Number.isNaN(a.time) && Number.isNaN(b.time)) return 0;
      if (Number.isNaN(a.time)) return 1;
      if (Number.isNaN(b.time)) return -1;
      if (au && bu) return a.time - b.time;
      if (!au && !bu) return b.time - a.time;
      return au ? -1 : 1;
    });
  }, [teams, now]);

  const filtered = games.filter((g) => {
    if (teamFilter !== "all" && g.team.id !== teamFilter) return false;
    if (timeFilter === "upcoming") return !Number.isNaN(g.time) && g.time >= now;
    if (timeFilter === "past") return !Number.isNaN(g.time) && g.time < now;
    return true;
  });

  const editing = editingKey ? games.find((g) => `${g.team.id}:${g.match.id}` === editingKey) : null;

  const fmtDate = (iso: string) => { if (!iso) return pick({ ar: "بدون تاريخ", he: "ללא תאריך", en: "No date" }); const d = new Date(iso); return `${dtf.format(d)} · ${ttf.format(d)}`; };
  const isUpcoming = (time: number) => !Number.isNaN(time) && time >= now;

  if (!loaded) {
    return (
      <AdminShell>
        <p className="text-muted">{t.admin.loading}</p>
      </AdminShell>
    );
  }

  const title = pick({ ar: "المباريات", he: "משחקים", en: "Games" });
  const subtitle = pick({ ar: "كل مباريات النادي في مكان واحد — أضف، عدّل واحذف.", he: "כל משחקי המועדון במקום אחד — הוספה, עריכה ומחיקה.", en: "Every club game in one place — add, edit and delete." });
  const upcomingLabel = pick({ ar: "قادمة", he: "קרובים", en: "Upcoming" });
  const pastLabel = pick({ ar: "سابقة", he: "עברו", en: "Past" });

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
          <AutosaveBar saveState={saveState} onUndo={undo} canUndo={canUndo} />
        </div>
      </div>

      {/* Filters + add */}
      {!editing && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={selectInput}>
            <option value="all">{pick({ ar: "كل الفرق", he: "כל הקבוצות", en: "All teams" })}</option>
            {teams.map((tm) => (
              <option key={tm.id} value={tm.id}>{pick(tm.name) || tm.id}</option>
            ))}
          </select>
          <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
            {([["all", pick({ ar: "الكل", he: "הכול", en: "All" })], ["upcoming", upcomingLabel], ["past", pastLabel]] as const).map(([k, lbl]) => (
              <button key={k} type="button" onClick={() => setTimeFilter(k)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${timeFilter === k ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink"}`}>{lbl}</button>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <AddGame teams={teams} pick={pick} onAdd={addMatch} />
          </div>
        </div>
      )}

      {/* List / cards */}
      {!editing && (
        <>
          {filtered.length === 0 && <p className="mt-8 text-sm text-muted">{pick({ ar: "لا مباريات بعد.", he: "אין משחקים עדיין.", en: "No games yet." })}</p>}

          {view === "list" ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              {filtered.map((g, i) => {
                const up = isUpcoming(g.time);
                return (
                  <button
                    key={`${g.team.id}:${g.match.id}`}
                    type="button"
                    onClick={() => setEditingKey(`${g.team.id}:${g.match.id}`)}
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-lg ${up ? "bg-brand-50" : "bg-surface"}`}>🏀</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">
                        {pick(g.team.name) || "—"} <span className="text-muted">vs</span> {pick(g.match.opponent) || pick({ ar: "خصم", he: "יריב", en: "Opponent" })}
                      </p>
                      <p className="truncate text-xs text-muted">{fmtDate(g.match.date)}{pick(g.match.where) ? ` · ${pick(g.match.where)}` : ""}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${up ? "bg-emerald-100 text-emerald-700" : "bg-surface text-muted"}`}>{up ? upcomingLabel : pastLabel}</span>
                    <TapChevron className="text-lg" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => {
                const up = isUpcoming(g.time);
                return (
                  <button
                    key={`${g.team.id}:${g.match.id}`}
                    type="button"
                    onClick={() => setEditingKey(`${g.team.id}:${g.match.id}`)}
                    className="group rounded-2xl border border-line bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">{pick(g.team.name) || "—"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${up ? "bg-emerald-100 text-emerald-700" : "bg-surface text-muted"}`}>{up ? upcomingLabel : pastLabel}</span>
                    </div>
                    <p className="mt-3 text-base font-extrabold text-ink">🏀 {pick(g.match.opponent) || pick({ ar: "خصم", he: "יריב", en: "Opponent" })}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{fmtDate(g.match.date)}</p>
                    {pick(g.match.where) && <p className="mt-0.5 text-xs text-muted">📍 {pick(g.match.where)}</p>}
                    {pick(g.match.contactName ?? emptyLoc()) && <p className="mt-0.5 text-xs text-muted">👤 {pick(g.match.contactName ?? emptyLoc())}{g.match.contactPhone ? ` · ${g.match.contactPhone}` : ""}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">{pick({ ar: "تعديل", he: "עריכה", en: "Edit" })} <TapChevron /></span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inline editor */}
      {editing && (
        <DetailPanel
          title={`${pick(editing.team.name) || "—"} — ${pick(editing.match.opponent) || pick({ ar: "مباراة", he: "משחק", en: "Game" })}`}
          onBack={() => setEditingKey(null)}
        >
          <MatchFields
            match={editing.match}
            onChange={(patch) => updateMatch(editing.team.id, editing.match.id, patch)}
            onRemove={() => { if (confirm(pick({ ar: "حذف هذه المباراة؟", he: "למחוק את המשחק?", en: "Delete this game?" }))) removeMatch(editing.team.id, editing.match.id); }}
          />
          <div className="flex justify-end border-t border-line pt-3">
            <Button size="sm" onClick={() => setEditingKey(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
          </div>
        </DetailPanel>
      )}
    </AdminShell>
  );
}

// Team picker + "Add game" button — creating a game needs a team to attach it to.
function AddGame({ teams, pick, onAdd }: { teams: Team[]; pick: (v: Localized) => string; onAdd: (teamId: string) => void }) {
  const [teamId, setTeamId] = useState<string>(teams[0]?.id ?? "");
  const selected = teams.some((tm) => tm.id === teamId) ? teamId : teams[0]?.id ?? "";
  if (teams.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <select value={selected} onChange={(e) => setTeamId(e.target.value)} className={selectInput}>
        {teams.map((tm) => (
          <option key={tm.id} value={tm.id}>{pick(tm.name) || tm.id}</option>
        ))}
      </select>
      <Button size="sm" onClick={() => onAdd(selected)}>+ {pick({ ar: "مباراة", he: "משחק", en: "Game" })}</Button>
    </div>
  );
}
