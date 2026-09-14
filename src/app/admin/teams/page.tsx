"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { ViewToggle, Thumb, TapChevron, AutosaveBar, DetailPanel, type ViewMode } from "@/components/admin/EntityList";
import { MatchFields } from "@/components/admin/MatchFields";
import { PaymentEditor, DEFAULT_FEE } from "@/components/admin/PaymentEditor";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAutosave } from "@/lib/useAutosave";
import { PlayerReceipts } from "@/components/admin/PlayerReceipts";
import { DateField } from "@/components/ui/Calendar";
import type { Coach, Localized, Match, Player, SiteContent, Team } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

type TeamTab = "settings" | "players" | "coaches" | "games" | "finances";

const initialOf = (name: Localized, fallback = "?") =>
  (name.ar || name.he || name.en || "").trim().charAt(0) || fallback;

export default function TeamsAdmin() {
  const { t, pick } = useI18n();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Club default fee (admin → Content → Register), used whenever a player has
  // no explicit fee override — keeps every price display in sync with it.
  const defaultFee = content?.register?.feeAmount || DEFAULT_FEE;
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<TeamTab>("settings");
  // Players tab: compact card/list browsing, tap a player to expand the editor.
  const [playersView, setPlayersView] = useState<ViewMode>("list");
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);
  const switchTab = (next: TeamTab) => { setTab(next); setOpenPlayerId(null); };
  const openTeam = (id: string) => { setEditingId(id); setTab("settings"); setOpenPlayerId(null); };

  useEffect(() => {
    Promise.all([
      fetch("/api/teams?all=1").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/coaches").then((r) => r.json()),
      fetch("/api/content").then((r) => r.json()),
    ]).then(([tm, pl, co, ct]) => {
      setTeams(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setCoaches(co.coaches ?? []);
      setContent(ct.content ?? null);
      setLoaded(true);
    });
  }, []);

  const playerById = (id: string) => players.find((p) => p.id === id);
  const coachById = (id: string) => coaches.find((c) => c.id === id);

  // Resolved roster + whole-team payment totals (fee owed / collected / left).
  // Only ids that resolve to a real player count, so numbers are always accurate.
  const money = (n: number) => `${n.toLocaleString("en-US")} ₪`;
  const rosterOf = (tm: Team) => tm.playerIds.map(playerById).filter(Boolean) as Player[];
  const totalsOf = (tm: Team) => {
    const ps = rosterOf(tm);
    const fee = ps.reduce((s, p) => s + (p.feeAmount ?? defaultFee), 0);
    const paid = ps.reduce((s, p) => s + Math.min(p.paidAmount ?? 0, p.feeAmount ?? defaultFee), 0);
    return { fee, paid, left: Math.max(fee - paid, 0) };
  };

  // ---- Team mutators --------------------------------------------------------
  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeams((list) => list.map((tm) => (tm.id === id ? { ...tm, ...patch } : tm)));
  const removeTeam = (id: string) => setTeams((list) => list.filter((tm) => tm.id !== id));
  const addTeam = () => {
    const id = crypto.randomUUID();
    setTeams((list) => [
      ...list,
      {
        id,
        name: emptyLoc(),
        description: emptyLoc(),
        image: "",
        imagePosition: "center",
        detailBg: "",
        ibbaLink: "",
        playerIds: [],
        coachIds: [],
        matches: [],
        paymentsEnabled: true,
        enabled: true,
        order: list.length,
        createdAt: new Date().toISOString(),
      },
    ]);
    openTeam(id);
  };
  const moveTeam = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= teams.length) return;
    setTeams((list) => {
      const next = [...list];
      const [m] = next.splice(index, 1);
      next.splice(target, 0, m);
      // Renumber so the stored order always matches the visual order (autosave
      // diffs whole objects, so this also marks the moved teams as changed).
      return next.map((tm, i) => (tm.order === i ? tm : { ...tm, order: i }));
    });
  };

  // ---- Player mutators (players are a shared pool) --------------------------
  const updatePlayer = (id: string, patch: Partial<Player>) =>
    setPlayers((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const deletePlayer = (id: string) => {
    setPlayers((list) => list.filter((p) => p.id !== id));
    setTeams((list) => list.map((tm) => ({ ...tm, playerIds: tm.playerIds.filter((pid) => pid !== id) })));
  };
  const attachPlayer = (teamId: string, playerId: string) => {
    if (!playerId) return;
    setTeams((list) => list.map((tm) => (tm.id === teamId && !tm.playerIds.includes(playerId) ? { ...tm, playerIds: [...tm.playerIds, playerId] } : tm)));
  };
  const detachPlayer = (teamId: string, playerId: string) =>
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, playerIds: tm.playerIds.filter((pid) => pid !== playerId) } : tm)));
  const addNewPlayer = (teamId: string, initialName?: string): string => {
    const id = crypto.randomUUID();
    const name = initialName ? { ar: initialName, he: initialName, en: initialName } : emptyLoc();
    setPlayers((list) => [...list, { id, name, number: "", image: "" }]);
    attachPlayer(teamId, id);
    return id;
  };

  // ---- Coach mutators (coaches are a shared pool) ---------------------------
  const updateCoach = (id: string, patch: Partial<Coach>) =>
    setCoaches((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const deleteCoach = (id: string) => {
    setCoaches((list) => list.filter((c) => c.id !== id));
    setTeams((list) => list.map((tm) => ({ ...tm, coachIds: (tm.coachIds ?? []).filter((cid) => cid !== id) })));
  };
  const attachCoach = (teamId: string, coachId: string) => {
    if (!coachId) return;
    setTeams((list) => list.map((tm) => (tm.id === teamId && !(tm.coachIds ?? []).includes(coachId) ? { ...tm, coachIds: [...(tm.coachIds ?? []), coachId] } : tm)));
  };
  const detachCoach = (teamId: string, coachId: string) =>
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, coachIds: (tm.coachIds ?? []).filter((cid) => cid !== coachId) } : tm)));
  const addNewCoach = (teamId: string, initialName?: string) => {
    const id = crypto.randomUUID();
    const name = initialName ? { ar: initialName, he: initialName, en: initialName } : emptyLoc();
    setCoaches((list) => [...list, { id, name, idNumber: "", phone: "", image: "" }]);
    attachCoach(teamId, id);
  };

  // ---- Match mutators -------------------------------------------------------
  const addMatch = (teamId: string) =>
    setTeams((list) =>
      list.map((tm) =>
        tm.id === teamId
          ? { ...tm, matches: [...tm.matches, { id: `m-${Date.now()}`, opponent: emptyLoc(), date: "", where: emptyLoc(), ibbaLink: "" }] }
          : tm,
      ),
    );
  const updateMatch = (teamId: string, matchId: string, patch: Partial<Match>) =>
    setTeams((list) =>
      list.map((tm) => (tm.id === teamId ? { ...tm, matches: tm.matches.map((m) => (m.id === matchId ? { ...m, ...patch } : m)) } : tm)),
    );
  const removeMatch = (teamId: string, matchId: string) =>
    setTeams((list) => list.map((tm) => (tm.id === teamId ? { ...tm, matches: tm.matches.filter((m) => m.id !== matchId) } : tm)));

  const editingIndex = editingId ? teams.findIndex((tm) => tm.id === editingId) : -1;
  const editing = editingIndex >= 0 ? teams[editingIndex] : null;

  // ---- Persist (autosaved) --------------------------------------------------
  // Teams reference shared players + coaches, so all three are saved together as
  // one composite value; new ids are remapped, then everything is refetched.
  type Composite = { teams: Team[]; players: Player[]; coaches: Coach[] };
  const composite = useMemo<Composite>(() => ({ teams, players, coaches }), [teams, players, coaches]);
  const setComposite = useCallback((v: Composite) => {
    setTeams(v.teams);
    setPlayers(v.players);
    setCoaches(v.coaches);
  }, []);

  // Ids are generated client-side and never change (the POST routes upsert), so
  // saving is safe at any moment — including while a detail sheet is open. Only
  // entities that actually changed since the last save are sent; failures throw
  // so autosave shows the error and retries. No refetch: state is never
  // overwritten, so keystrokes typed while a save is in flight survive.
  const persist = useCallback(async (v: Composite, prev: Composite): Promise<Composite> => {
    const headers = { "Content-Type": "application/json" };
    const deleted = (res: Response) => { if (!res.ok && res.status !== 404) throw new Error(`delete failed: ${res.status}`); };
    const saved = (res: Response) => { if (!res.ok) throw new Error(`save failed: ${res.status}`); };
    const diff = <T extends { id: string }>(cur: T[], before: T[]) =>
      cur.filter((x) => {
        const b = before.find((o) => o.id === x.id);
        return !b || JSON.stringify(b) !== JSON.stringify(x);
      });

    // Deletions first, then upserts (players/coaches before the teams that
    // reference them — a deleted player is auto-detached server-side).
    await Promise.all([
      ...prev.players.filter((o) => !v.players.some((p) => p.id === o.id)).map((p) => fetch(`/api/players/${p.id}`, { method: "DELETE" }).then(deleted)),
      ...prev.coaches.filter((o) => !v.coaches.some((c) => c.id === o.id)).map((c) => fetch(`/api/coaches/${c.id}`, { method: "DELETE" }).then(deleted)),
      ...prev.teams.filter((o) => !v.teams.some((tm) => tm.id === o.id)).map((tm) => fetch(`/api/teams/${tm.id}`, { method: "DELETE" }).then(deleted)),
    ]);
    // Players + coaches BEFORE the teams that reference them, so a team never
    // points at a player that doesn't exist yet (the read side drops dangling
    // roster ids, so writing the team first could lose the attachment).
    await Promise.all([
      ...diff(v.players, prev.players).map((p) => fetch("/api/players", { method: "POST", headers, body: JSON.stringify(p) }).then(saved)),
      ...diff(v.coaches, prev.coaches).map((c) => fetch("/api/coaches", { method: "POST", headers, body: JSON.stringify(c) }).then(saved)),
    ]);
    await Promise.all(
      diff(v.teams, prev.teams).map((tm) => fetch("/api/teams", { method: "POST", headers, body: JSON.stringify(tm) }).then(saved)),
    );
    return v;
  }, []);

  const { saveState, undo, canUndo } = useAutosave({
    value: composite,
    setValue: setComposite,
    onSave: persist,
    ready: loaded,
  });

  if (!loaded) {
    return (
      <AdminShell>
        <p className="text-muted">{t.admin.loading}</p>
      </AdminShell>
    );
  }

  const tapToEdit = pick({ ar: "اضغط للتعديل", he: "לחצו לעריכה", en: "Tap to edit" });

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.teams}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.teamsSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
          <Button variant="subtle" size="sm" onClick={addTeam}>+ {t.admin.team.addTitle}</Button>
          <AutosaveBar saveState={saveState} onUndo={undo} canUndo={canUndo} />
        </div>
      </div>

      {!editing && (<>
      {teams.length === 0 && <p className="mt-8 text-sm text-muted">{t.admin.team.none}</p>}

      {view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((tm, i) => (
            <div key={tm.id} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
              <button type="button" onClick={() => openTeam(tm.id)} className="block w-full text-start">
                <div className="relative w-full" style={{ aspectRatio: tm.aspectRatio ?? "16 / 10" }}>
                  <Thumb src={tm.image} position={tm.imagePosition} fallback={initialOf(tm.name, "🏀")} className="h-full w-full" />
                  {!tm.enabled && (
                    <span className="absolute start-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {pick({ ar: "مخفي", he: "מוסתר", en: "Hidden" })}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{i + 1}</span>
                    <p className="truncate font-bold text-ink">{pick(tm.name) || tapToEdit}</p>
                    <TapChevron className="ms-auto text-lg" />
                  </div>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>👤 {rosterOf(tm).length} {t.teams.players}</span>
                    <span>🧑‍🏫 {(tm.coachIds ?? []).length}</span>
                    <span>🏀 {tm.matches.length}</span>
                  </p>
                  {(() => {
                    if (tm.paymentsEnabled === false) return null;
                    const tt = totalsOf(tm);
                    if (tt.fee <= 0) return null;
                    return (
                      <p className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-1.5 text-[11px] font-semibold">
                        <span className="text-muted">💳 <span dir="ltr">{money(tt.paid)} / {money(tt.fee)}</span></span>
                        <span className={tt.left > 0 ? "text-amber-700" : "text-emerald-700"}>
                          {tt.left > 0 ? `${pick({ ar: "متبقّي", he: "נותר", en: "left" })} ${money(tt.left)}` : pick({ ar: "مكتمل ✓", he: "שולם ✓", en: "Paid ✓" })}
                        </span>
                      </p>
                    );
                  })()}
                </div>
              </button>
              {/* reorder bar — its own row so it never overlaps the card text */}
              <div className="flex items-center justify-end gap-1 border-t border-line px-3 py-1.5">
                <button type="button" onClick={() => moveTeam(i, -1)} disabled={i === 0} aria-label={t.admin.sections.moveUp} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveTeam(i, 1)} disabled={i === teams.length - 1} aria-label={t.admin.sections.moveDown} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {teams.map((tm, i) => (
            <div key={tm.id} className={`group flex items-center gap-3 px-3 py-2.5 transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}>
              <span className="w-6 shrink-0 text-center text-xs font-bold text-muted">{i + 1}</span>
              <button type="button" onClick={() => openTeam(tm.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                <Thumb src={tm.image} position={tm.imagePosition} fallback={initialOf(tm.name, "🏀")} className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{pick(tm.name) || tapToEdit}</p>
                  <p className="truncate text-xs text-muted">👤 {rosterOf(tm).length} · 🧑‍🏫 {(tm.coachIds ?? []).length} · 🏀 {tm.matches.length}{!tm.enabled ? ` · ${pick({ ar: "مخفي", he: "מוסתר", en: "Hidden" })}` : ""}</p>
                  {(() => {
                    if (tm.paymentsEnabled === false) return null;
                    const tt = totalsOf(tm);
                    if (tt.fee <= 0) return null;
                    return (
                      <p className="truncate text-[11px] font-semibold">
                        <span className="text-muted">💳 <span dir="ltr">{money(tt.paid)} / {money(tt.fee)}</span></span>{" "}
                        <span className={tt.left > 0 ? "text-amber-700" : "text-emerald-700"}>
                          {tt.left > 0 ? `· ${pick({ ar: "متبقّي", he: "נותר", en: "left" })} ${money(tt.left)}` : `· ${pick({ ar: "مكتمل ✓", he: "שולם ✓", en: "Paid ✓" })}`}
                        </span>
                      </p>
                    );
                  })()}
                </div>
                <TapChevron className="text-lg" />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => moveTeam(i, -1)} disabled={i === 0} aria-label={t.admin.sections.moveUp} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveTeam(i, 1)} disabled={i === teams.length - 1} aria-label={t.admin.sections.moveDown} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>)}

      {/* Team detail — expands inline, organised into tabs */}
      {editing && (() => {
        const teamPlayers = rosterOf(editing);
        const payEnabled = editing.paymentsEnabled !== false;
        const { fee: totalFee, paid: totalPaid, left: outstanding } = totalsOf(editing);
        const TABS: { key: TeamTab; icon: string; label: Localized; count?: number }[] = [
          { key: "settings", icon: "⚙", label: { ar: "الإعدادات", he: "הגדרות", en: "Settings" } },
          { key: "players", icon: "👤", label: { ar: "اللاعبون", he: "שחקנים", en: "Players" }, count: teamPlayers.length },
          { key: "coaches", icon: "🧑‍🏫", label: { ar: "المدرّبون", he: "מאמנים", en: "Coaches" }, count: (editing.coachIds ?? []).length },
          { key: "games", icon: "🏀", label: { ar: "المباريات", he: "משחקים", en: "Games" }, count: editing.matches.length },
          ...(payEnabled ? [{ key: "finances" as const, icon: "💰", label: { ar: "الماليّة", he: "כספים", en: "Finances" } }] : []),
        ];
        return (
        <DetailPanel title={pick(editing.name) || t.admin.team.name} onBack={() => setEditingId(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{editingIndex + 1}</span>
              <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) { removeTeam(editing.id); setEditingId(null); } }} className="text-sm font-semibold text-rose-600 hover:underline">
                {t.admin.actions.delete}
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
              {TABS.map((tb) => (
                <button
                  key={tb.key}
                  type="button"
                  onClick={() => switchTab(tb.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === tb.key ? "bg-brand text-white shadow-sm" : "text-ink/70 hover:bg-white"}`}
                >
                  <span aria-hidden>{tb.icon}</span>
                  {pick(tb.label)}
                  {tb.count != null && (
                    <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === tb.key ? "bg-white/25 text-white" : "bg-brand-50 text-brand-dark"}`}>{tb.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* SETTINGS TAB */}
            {tab === "settings" && (
              <div className="space-y-4">
                <span className="block text-sm font-semibold text-ink">
                  {t.admin.team.cover} <span className="font-normal text-muted">— {t.admin.team.coverHint}</span>
                </span>
                <ImageUpload value={editing.image ?? ""} onChange={(image) => updateTeam(editing.id, { image })} />
                {editing.image && (
                  <ImagePositioner src={editing.image} value={editing.imagePosition} onChange={(imagePosition) => updateTeam(editing.id, { imagePosition })} aspectRatio={editing.aspectRatio ?? "16 / 10"} onAspectChange={(aspectRatio) => updateTeam(editing.id, { aspectRatio })} />
                )}
                <LocalizedField label={t.admin.team.name} value={editing.name} onChange={(name) => updateTeam(editing.id, { name })} />
                <LocalizedField label={t.admin.team.description} textarea value={editing.description} onChange={(description) => updateTeam(editing.id, { description })} />

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">
                    {t.admin.team.ibbaLink} <span className="font-normal text-muted">— {t.admin.team.ibbaLinkHint}</span>
                  </span>
                  <input dir="ltr" placeholder="https://www.ibba.co.il/…" value={editing.ibbaLink ?? ""} onChange={(e) => updateTeam(editing.id, { ibbaLink: e.target.value })} className={plainInput} />
                </label>

                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-ink">
                    {t.admin.team.detailBg} <span className="font-normal text-muted">— {t.admin.team.detailBgHint}</span>
                  </span>
                  <ImageUpload value={editing.detailBg ?? ""} onChange={(detailBg) => updateTeam(editing.id, { detailBg })} />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
                  <input type="checkbox" checked={editing.enabled} onChange={(e) => updateTeam(editing.id, { enabled: e.target.checked })} className="size-4" />
                  <span className="text-sm font-semibold text-ink">{t.admin.team.show}</span>
                </label>

                {/* Payments switch — off for teams whose players don't pay */}
                <label className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">💳 {pick({ ar: "الدفعات لهذا الفريق", he: "תשלומים לקבוצה זו", en: "Payments for this team" })}</span>
                    <span className="block text-xs text-muted">{pick({ ar: "أطفئه إذا كان لاعبو هذا الفريق لا يدفعون — تختفي كل واجهات المال.", he: "כבו אם שחקני הקבוצה לא משלמים — כל ממשקי הכסף יוסתרו.", en: "Turn off if this team's players don't pay — all money UI disappears." })}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={payEnabled}
                    onClick={() => updateTeam(editing.id, { paymentsEnabled: !payEnabled })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${payEnabled ? "bg-brand" : "bg-line"}`}
                  >
                    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${payEnabled ? "start-[calc(100%-1.375rem)]" : "start-0.5"}`} />
                  </button>
                </label>
              </div>
            )}

            {/* PLAYERS TAB */}
            {tab === "players" && (
              <div className="space-y-3">
                {/* Payment summary */}
                {payEnabled && teamPlayers.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-line bg-white p-3 text-center">
                      <p className="text-[11px] font-semibold text-muted">{pick({ ar: "المطلوب", he: "לתשלום", en: "Total due" })}</p>
                      <p className="mt-0.5 text-sm font-extrabold text-ink" dir="ltr">{money(totalFee)}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                      <p className="text-[11px] font-semibold text-emerald-700">{pick({ ar: "المحصّل", he: "נגבה", en: "Collected" })}</p>
                      <p className="mt-0.5 text-sm font-extrabold text-emerald-700" dir="ltr">{money(totalPaid)}</p>
                    </div>
                    <div className={`rounded-xl border p-3 text-center ${outstanding > 0 ? "border-amber-200 bg-amber-50" : "border-line bg-white"}`}>
                      <p className={`text-[11px] font-semibold ${outstanding > 0 ? "text-amber-700" : "text-muted"}`}>{pick({ ar: "المتبقّي", he: "נותר", en: "Outstanding" })}</p>
                      <p className={`mt-0.5 text-sm font-extrabold ${outstanding > 0 ? "text-amber-700" : "text-ink"}`} dir="ltr">{money(outstanding)}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {t.admin.team.players} <span className="font-normal text-muted">— {t.admin.team.playersHint}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {!openPlayerId && (
                      <ViewToggle mode={playersView} onChange={setPlayersView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
                    )}
                    <Button size="sm" variant="subtle" onClick={() => setOpenPlayerId(addNewPlayer(editing.id))}>{t.admin.team.addNew}</Button>
                  </div>
                </div>

                {!openPlayerId && (
                  <PlayerPicker
                    players={players.filter((p) => !editing.playerIds.includes(p.id))}
                    pick={pick}
                    placeholder={t.admin.players.pickerPlaceholder}
                    addNewLabel={t.admin.players.addNew}
                    onAttach={(pid) => attachPlayer(editing.id, pid)}
                    onAddNew={(name) => setOpenPlayerId(addNewPlayer(editing.id, name))}
                  />
                )}

                {teamPlayers.length === 0 && <p className="text-sm text-muted">{t.admin.team.noPlayers}</p>}

                {/* Expanded editor for the tapped player */}
                {openPlayerId && (() => {
                  const p = playerById(openPlayerId);
                  if (!p) return null;
                  return (
                    <div className="space-y-2 rounded-xl border border-brand/40 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
                        <button type="button" onClick={() => setOpenPlayerId(null)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                          <span aria-hidden className="rtl:-scale-x-100">←</span> {pick({ ar: "رجوع", he: "חזרה", en: "Back" })}
                        </button>
                        <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                      </div>
                      <ImageUpload value={p.image ?? ""} icon="user" onChange={(image) => updatePlayer(p.id, { image })} />
                      {p.image && (
                        <ImagePositioner src={p.image} value={p.imagePosition} onChange={(imagePosition) => updatePlayer(p.id, { imagePosition })} aspectRatio={p.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => updatePlayer(p.id, { aspectRatio })} />
                      )}
                      <LocalizedField label={t.admin.team.newPlayerName} value={p.name} onChange={(name) => updatePlayer(p.id, { name })} />
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.number}</span>
                          <input value={p.number ?? ""} onChange={(e) => updatePlayer(p.id, { number: e.target.value })} className={plainInput} />
                        </label>
                        <DateField
                          label={pick({ ar: "تاريخ الميلاد", he: "תאריך לידה", en: "Date of birth" })}
                          value={p.birthDate}
                          onChange={(birthDate) => updatePlayer(p.id, { birthDate })}
                          max={new Date().toISOString().slice(0, 10)}
                        />
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "هاتف اللاعب", he: "טלפון השחקן", en: "Player phone" })}</span>
                          <input dir="ltr" type="tel" value={p.phone ?? ""} onChange={(e) => updatePlayer(p.id, { phone: e.target.value })} className={plainInput} />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "هاتف الأب", he: "טלפון האב", en: "Father's phone" })}</span>
                          <input dir="ltr" type="tel" value={p.fatherPhone ?? ""} onChange={(e) => updatePlayer(p.id, { fatherPhone: e.target.value })} className={plainInput} />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "هاتف الأم", he: "טלפון האם", en: "Mother's phone" })}</span>
                          <input dir="ltr" type="tel" value={p.motherPhone ?? ""} onChange={(e) => updatePlayer(p.id, { motherPhone: e.target.value })} className={plainInput} />
                        </label>
                      </div>
                      {payEnabled && <PaymentEditor player={p} defaultFee={defaultFee} onChange={(patch) => updatePlayer(p.id, patch)} />}
                      <PlayerReceipts player={p} defaultFee={defaultFee} />
                      <div className="flex items-center justify-between border-t border-line pt-2">
                        <div className="flex gap-3">
                          <button type="button" onClick={() => { detachPlayer(editing.id, p.id); setOpenPlayerId(null); }} className="text-xs font-semibold text-muted hover:text-ink">↩ {t.admin.team.detach}</button>
                          <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) { deletePlayer(p.id); setOpenPlayerId(null); } }} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.actions.delete}</button>
                        </div>
                        <Button size="sm" onClick={() => setOpenPlayerId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Compact browsing: cards or list, tap to edit */}
                {!openPlayerId && playersView === "grid" && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {teamPlayers.map((p) => {
                      const fee = p.feeAmount ?? defaultFee;
                      const left = Math.max(fee - Math.min(p.paidAmount ?? 0, fee), 0);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setOpenPlayerId(p.id)}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                        >
                          <div className="relative aspect-[4/5] w-full">
                            <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="h-full w-full" />
                            {p.number ? (
                              <span className="absolute end-2 top-2 grid min-w-7 place-items-center rounded-full bg-ink/80 px-1.5 py-0.5 text-xs font-bold text-white backdrop-blur">#{p.number}</span>
                            ) : null}
                          </div>
                          <div className="min-w-0 px-3 py-2.5">
                            <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                            {payEnabled ? (
                              <p className={`truncate text-[11px] font-semibold ${left > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                                {left > 0 ? `${pick({ ar: "متبقّي", he: "נותר", en: "Left" })} ${money(left)}` : pick({ ar: "مدفوع بالكامل ✓", he: "שולם ✓", en: "Paid ✓" })}
                              </p>
                            ) : (
                              <p className="truncate text-[11px] text-muted" dir="ltr">{p.phone || p.fatherPhone || p.motherPhone || "—"}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {!openPlayerId && playersView === "list" && teamPlayers.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                    {teamPlayers.map((p, i) => {
                      const fee = p.feeAmount ?? defaultFee;
                      const left = Math.max(fee - Math.min(p.paidAmount ?? 0, fee), 0);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setOpenPlayerId(p.id)}
                          className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
                        >
                          <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="size-11 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                            <p className="truncate text-xs text-muted" dir="ltr">{p.phone || p.fatherPhone || p.motherPhone || "—"}</p>
                          </div>
                          {p.number ? <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{p.number}</span> : null}
                          {payEnabled && (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${left > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {left > 0 ? `${pick({ ar: "متبقّي", he: "נותר", en: "Left" })} ${money(left)}` : pick({ ar: "مدفوع ✓", he: "שולם ✓", en: "Paid ✓" })}
                            </span>
                          )}
                          <TapChevron className="text-lg" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* COACHES TAB */}
            {tab === "coaches" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {t.admin.team.coaches} <span className="font-normal text-muted">— {t.admin.team.coachesHint}</span>
                  </span>
                  <Button size="sm" variant="subtle" onClick={() => addNewCoach(editing.id)}>{t.admin.team.addNewCoach}</Button>
                </div>

                <CoachPicker
                  coaches={coaches.filter((c) => !(editing.coachIds ?? []).includes(c.id))}
                  pick={pick}
                  placeholder={t.admin.coaches.pickerPlaceholder}
                  addNewLabel={t.admin.coaches.addNew}
                  onAttach={(cid) => attachCoach(editing.id, cid)}
                  onAddNew={(name) => addNewCoach(editing.id, name)}
                />

                {(editing.coachIds ?? []).filter(coachById).length === 0 && <p className="text-sm text-muted">{t.admin.team.noCoaches}</p>}

                <div className="grid gap-3 sm:grid-cols-2">
                  {(editing.coachIds ?? []).map((cid) => {
                    const c = coachById(cid);
                    if (!c) return null;
                    return (
                      <div key={cid} className="space-y-2 rounded-xl border border-line p-3">
                        <ImageUpload value={c.image ?? ""} icon="user" onChange={(image) => updateCoach(cid, { image })} />
                        {c.image && (
                          <ImagePositioner src={c.image} value={c.imagePosition} onChange={(imagePosition) => updateCoach(cid, { imagePosition })} aspectRatio={c.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => updateCoach(cid, { aspectRatio })} />
                        )}
                        <LocalizedField label={t.admin.coaches.name} value={c.name} onChange={(name) => updateCoach(cid, { name })} />
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.coachId}</span>
                            <input dir="ltr" value={c.idNumber ?? ""} onChange={(e) => updateCoach(cid, { idNumber: e.target.value })} className={plainInput} />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.coachPhone}</span>
                            <input dir="ltr" value={c.phone ?? ""} onChange={(e) => updateCoach(cid, { phone: e.target.value })} className={plainInput} />
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => detachCoach(editing.id, cid)} className="text-xs font-semibold text-muted hover:text-ink">↩ {t.admin.team.detach}</button>
                          <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) deleteCoach(cid); }} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.actions.delete}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GAMES TAB */}
            {tab === "games" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {t.admin.team.matches} <span className="font-normal text-muted">— {t.admin.team.matchesHint}</span>
                  </span>
                  <Button size="sm" variant="subtle" onClick={() => addMatch(editing.id)}>{t.admin.team.addMatch}</Button>
                </div>
                {editing.matches.length === 0 && <p className="text-sm text-muted">{t.admin.team.noMatches}</p>}
                {editing.matches.map((m) => (
                  <div key={m.id} className="rounded-xl border border-line p-3">
                    <MatchFields
                      match={m}
                      onChange={(patch) => updateMatch(editing.id, m.id, patch)}
                      onRemove={() => removeMatch(editing.id, m.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* FINANCES TAB — who paid what, and a printable PDF report */}
            {tab === "finances" && payEnabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-line bg-white p-3 text-center">
                    <p className="text-[11px] font-semibold text-muted">{pick({ ar: "المطلوب", he: "לתשלום", en: "Total due" })}</p>
                    <p className="mt-0.5 text-sm font-extrabold text-ink" dir="ltr">{money(totalFee)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-[11px] font-semibold text-emerald-700">{pick({ ar: "المحصّل", he: "נגבה", en: "Collected" })}</p>
                    <p className="mt-0.5 text-sm font-extrabold text-emerald-700" dir="ltr">{money(totalPaid)}</p>
                  </div>
                  <div className={`rounded-xl border p-3 text-center ${outstanding > 0 ? "border-amber-200 bg-amber-50" : "border-line bg-white"}`}>
                    <p className={`text-[11px] font-semibold ${outstanding > 0 ? "text-amber-700" : "text-muted"}`}>{pick({ ar: "المتبقّي", he: "נותר", en: "Outstanding" })}</p>
                    <p className={`mt-0.5 text-sm font-extrabold ${outstanding > 0 ? "text-amber-700" : "text-ink"}`} dir="ltr">{money(outstanding)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {pick({ ar: "مدفوعات اللاعبين", he: "תשלומי השחקנים", en: "Player payments" })}
                  </span>
                  <a
                    href={`/api/teams/${editing.id}/report`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
                  >
                    🧾 {pick({ ar: "توليد تقرير PDF", he: "הפקת דוח PDF", en: "Generate PDF report" })}
                  </a>
                </div>

                {teamPlayers.length === 0 ? (
                  <p className="text-sm text-muted">{t.admin.team.noPlayers}</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                    {teamPlayers.map((p, i) => {
                      const fee = p.feeAmount ?? defaultFee;
                      const paid = Math.min(p.paidAmount ?? 0, fee);
                      const left = Math.max(fee - paid, 0);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setTab("players"); setOpenPlayerId(p.id); }}
                          className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
                        >
                          <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="size-10 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}{p.number ? <span className="ms-1.5 text-xs font-semibold text-muted">#{p.number}</span> : null}</p>
                            <div className="mt-1 h-1.5 w-full max-w-45 overflow-hidden rounded-full bg-line">
                              <div className={`h-full rounded-full ${left > 0 ? "bg-brand" : "bg-emerald-500"}`} style={{ width: `${fee > 0 ? Math.round((paid / fee) * 100) : 0}%` }} />
                            </div>
                          </div>
                          <div className="shrink-0 text-end">
                            <p className="text-xs font-bold text-emerald-700" dir="ltr">{money(paid)}</p>
                            <p className={`text-[11px] font-semibold ${left > 0 ? "text-amber-700" : "text-muted"}`} dir="ltr">
                              {left > 0 ? `- ${money(left)}` : pick({ ar: "مكتمل", he: "שולם", en: "settled" })}
                            </p>
                          </div>
                          <TapChevron className="text-lg" />
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted">{pick({ ar: "اضغط على لاعب لتعديل دفعاته.", he: "לחצו על שחקן לעריכת התשלומים.", en: "Tap a player to edit their payments." })}</p>
              </div>
            )}

            <div className="flex justify-end border-t border-line pt-3">
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
            </div>
          </div>
        </DetailPanel>
        );
      })()}
    </AdminShell>
  );
}

// Searchable player combobox: type to filter the shared roster, click to attach,
// or create a brand-new player on the spot (optionally pre-named with what you
// typed). Closes on outside click; keyboard-friendly via Enter on the add option.
function PlayerPicker({
  players,
  pick,
  placeholder,
  addNewLabel,
  onAttach,
  onAddNew,
}: {
  players: Player[];
  pick: (v: Localized) => string;
  placeholder: string;
  addNewLabel: string;
  onAttach: (id: string) => void;
  onAddNew: (name?: string) => void;
}) {
  const [q, setQ] = useState("");
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

  const needle = q.trim().toLowerCase();
  const matches = players.filter((p) => {
    if (!needle) return true;
    return [p.name.ar, p.name.he, p.name.en, p.number].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });

  const choose = (id: string) => { onAttach(id); setQ(""); setOpen(false); };
  const create = () => { onAddNew(q.trim() || undefined); setQ(""); setOpen(false); };

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); if (matches.length === 1) choose(matches[0].id); else create(); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className={plainInput}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-card">
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-ink transition hover:bg-surface"
            >
              <span className="font-medium">{pick(p.name) || p.id}</span>
              {p.number && <span className="text-xs text-muted">#{p.number}</span>}
            </button>
          ))}
          {matches.length === 0 && needle === "" && (
            <p className="px-3 py-2 text-xs text-muted">—</p>
          )}
          <button
            type="button"
            onClick={create}
            className="mt-1 flex w-full items-center gap-1.5 border-t border-line px-3 py-2 text-start text-sm font-semibold text-brand-dark transition hover:bg-brand-50"
          >
            {addNewLabel}{q.trim() ? `: “${q.trim()}”` : ""}
          </button>
        </div>
      )}
    </div>
  );
}

// Searchable coach combobox — mirrors PlayerPicker for the shared coach pool.
function CoachPicker({
  coaches,
  pick,
  placeholder,
  addNewLabel,
  onAttach,
  onAddNew,
}: {
  coaches: Coach[];
  pick: (v: Localized) => string;
  placeholder: string;
  addNewLabel: string;
  onAttach: (id: string) => void;
  onAddNew: (name?: string) => void;
}) {
  const [q, setQ] = useState("");
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

  const needle = q.trim().toLowerCase();
  const matches = coaches.filter((c) => {
    if (!needle) return true;
    return [c.name.ar, c.name.he, c.name.en, c.idNumber].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });

  const choose = (id: string) => { onAttach(id); setQ(""); setOpen(false); };
  const create = () => { onAddNew(q.trim() || undefined); setQ(""); setOpen(false); };

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); if (matches.length === 1) choose(matches[0].id); else create(); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className={plainInput}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-card">
          {matches.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => choose(c.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-ink transition hover:bg-surface"
            >
              <span className="font-medium">{pick(c.name) || c.id}</span>
              {c.idNumber && <span className="text-xs text-muted" dir="ltr">{c.idNumber}</span>}
            </button>
          ))}
          <button
            type="button"
            onClick={create}
            className="mt-1 flex w-full items-center gap-1.5 border-t border-line px-3 py-2 text-start text-sm font-semibold text-brand-dark transition hover:bg-brand-50"
          >
            {addNewLabel}{q.trim() ? `: “${q.trim()}”` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
