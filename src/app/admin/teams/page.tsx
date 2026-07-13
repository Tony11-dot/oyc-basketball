"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { ViewToggle, Thumb, TapChevron, type ViewMode } from "@/components/admin/EntityList";
import { DateField } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Coach, Localized, Match, Player, Team } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const initialOf = (name: Localized, fallback = "?") =>
  (name.ar || name.he || name.en || "").trim().charAt(0) || fallback;

export default function TeamsAdmin() {
  const { t, pick } = useI18n();
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsOriginal, setTeamsOriginal] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersOriginal, setPlayersOriginal] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesOriginal, setCoachesOriginal] = useState<Coach[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams?all=1").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/coaches").then((r) => r.json()),
    ]).then(([tm, pl, co]) => {
      setTeams(tm.teams ?? []);
      setTeamsOriginal(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setPlayersOriginal(pl.players ?? []);
      setCoaches(co.coaches ?? []);
      setCoachesOriginal(co.coaches ?? []);
      setLoaded(true);
    });
  }, []);

  const playerById = (id: string) => players.find((p) => p.id === id);
  const coachById = (id: string) => coaches.find((c) => c.id === id);

  // ---- Team mutators --------------------------------------------------------
  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeams((list) => list.map((tm) => (tm.id === id ? { ...tm, ...patch } : tm)));
  const removeTeam = (id: string) => setTeams((list) => list.filter((tm) => tm.id !== id));
  const addTeam = () => {
    const id = `new-${Date.now()}`;
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
        enabled: true,
        order: list.length,
        createdAt: new Date().toISOString(),
      },
    ]);
    setEditingId(id);
  };
  const moveTeam = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= teams.length) return;
    setTeams((list) => {
      const next = [...list];
      const [m] = next.splice(index, 1);
      next.splice(target, 0, m);
      return next;
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
  const addNewPlayer = (teamId: string, initialName?: string) => {
    const id = `newp-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const name = initialName ? { ar: initialName, he: initialName, en: initialName } : emptyLoc();
    setPlayers((list) => [...list, { id, name, number: "", position: emptyLoc(), image: "" }]);
    attachPlayer(teamId, id);
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
    const id = `newc-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
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

  const dirty = useMemo(
    () =>
      JSON.stringify(teams) !== JSON.stringify(teamsOriginal) ||
      JSON.stringify(players) !== JSON.stringify(playersOriginal) ||
      JSON.stringify(coaches) !== JSON.stringify(coachesOriginal),
    [teams, teamsOriginal, players, playersOriginal, coaches, coachesOriginal],
  );

  const editingIndex = editingId ? teams.findIndex((tm) => tm.id === editingId) : -1;
  const editing = editingIndex >= 0 ? teams[editingIndex] : null;

  // ---- Persist --------------------------------------------------------------
  async function save() {
    setSaving(true);
    const headers = { "Content-Type": "application/json" };
    try {
      // 1. Players first (teams reference them). Delete removed, create/update rest.
      const removedPlayers = playersOriginal.filter((o) => !players.some((p) => p.id === o.id));
      await Promise.all(removedPlayers.map((p) => fetch(`/api/players/${p.id}`, { method: "DELETE" })));

      const idMap = new Map<string, string>();
      for (const p of players) {
        const body = JSON.stringify({
          name: p.name,
          number: p.number ?? "",
          position: p.position ?? emptyLoc(),
          image: p.image ?? "",
          imagePosition: p.imagePosition,
          aspectRatio: p.aspectRatio,
        });
        if (p.id.startsWith("newp-")) {
          const res = await fetch("/api/players", { method: "POST", headers, body });
          const d = await res.json();
          if (d.player?.id) idMap.set(p.id, d.player.id);
        } else {
          await fetch(`/api/players/${p.id}`, { method: "PATCH", headers, body });
        }
      }
      const realId = (id: string) => idMap.get(id) ?? id;

      // 2. Coaches (teams reference them too). Delete removed, create/update rest.
      const removedCoaches = coachesOriginal.filter((o) => !coaches.some((c) => c.id === o.id));
      await Promise.all(removedCoaches.map((c) => fetch(`/api/coaches/${c.id}`, { method: "DELETE" })));

      const coachIdMap = new Map<string, string>();
      for (const c of coaches) {
        const body = JSON.stringify({
          name: c.name,
          idNumber: c.idNumber ?? "",
          phone: c.phone ?? "",
          image: c.image ?? "",
          imagePosition: c.imagePosition,
          aspectRatio: c.aspectRatio,
        });
        if (c.id.startsWith("newc-")) {
          const res = await fetch("/api/coaches", { method: "POST", headers, body });
          const d = await res.json();
          if (d.coach?.id) coachIdMap.set(c.id, d.coach.id);
        } else {
          await fetch(`/api/coaches/${c.id}`, { method: "PATCH", headers, body });
        }
      }
      const realCoachId = (id: string) => coachIdMap.get(id) ?? id;

      // 3. Teams. Delete removed, create/update rest (with remapped player ids).
      const removedTeams = teamsOriginal.filter((o) => !teams.some((tm) => tm.id === o.id));
      await Promise.all(removedTeams.map((tm) => fetch(`/api/teams/${tm.id}`, { method: "DELETE" })));

      for (let i = 0; i < teams.length; i++) {
        const tm = teams[i];
        const body = JSON.stringify({
          name: tm.name,
          description: tm.description,
          image: tm.image ?? "",
          imagePosition: tm.imagePosition,
          aspectRatio: tm.aspectRatio,
          detailBg: tm.detailBg ?? "",
          ibbaLink: tm.ibbaLink ?? "",
          playerIds: tm.playerIds.map(realId),
          coachIds: (tm.coachIds ?? []).map(realCoachId),
          matches: tm.matches,
          enabled: tm.enabled,
          order: i,
        });
        const isNew = tm.id.startsWith("new-");
        await fetch(isNew ? "/api/teams" : `/api/teams/${tm.id}`, { method: isNew ? "POST" : "PATCH", headers, body });
      }

      const [tm, pl, co] = await Promise.all([
        fetch("/api/teams?all=1").then((r) => r.json()),
        fetch("/api/players").then((r) => r.json()),
        fetch("/api/coaches").then((r) => r.json()),
      ]);
      setTeams(tm.teams ?? []);
      setTeamsOriginal(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setPlayersOriginal(pl.players ?? []);
      setCoaches(co.coaches ?? []);
      setCoachesOriginal(co.coaches ?? []);
      // The just-created team gets a real id on save; close the sheet to avoid a stale ref.
      setEditingId(null);
      toast.success(t.admin.toasts.saved);
    } catch {
      toast.error(t.admin.toasts.saveError);
    } finally {
      setSaving(false);
    }
  }

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
          <Button onClick={save} disabled={saving || !dirty}>{saving ? t.admin.saving : t.admin.save}</Button>
        </div>
      </div>

      {dirty && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {pick({ ar: "تغييرات غير محفوظة", he: "שינויים לא שמורים", en: "Unsaved changes" })}
          </span>
        </div>
      )}

      {teams.length === 0 && <p className="mt-8 text-sm text-muted">{t.admin.team.none}</p>}

      {view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((tm, i) => (
            <div key={tm.id} className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
              <button type="button" onClick={() => setEditingId(tm.id)} className="block w-full text-start">
                <div className="relative w-full" style={{ aspectRatio: tm.aspectRatio ?? "16 / 10" }}>
                  <Thumb src={tm.image} position={tm.imagePosition} fallback={initialOf(tm.name, "🏀")} className="h-full w-full" />
                  {!tm.enabled && (
                    <span className="absolute start-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {pick({ ar: "مخفي", he: "מוסתר", en: "Hidden" })}
                    </span>
                  )}
                  {tm.id.startsWith("new-") && (
                    <span className="absolute end-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{i + 1}</span>
                    <p className="truncate font-bold text-ink">{pick(tm.name) || tapToEdit}</p>
                    <TapChevron className="ms-auto text-lg" />
                  </div>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>👤 {tm.playerIds.length} {t.teams.players}</span>
                    <span>🧑‍🏫 {(tm.coachIds ?? []).length}</span>
                    <span>🏀 {tm.matches.length}</span>
                  </p>
                </div>
              </button>
              <div className="absolute end-2 bottom-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => moveTeam(i, -1)} disabled={i === 0} aria-label={t.admin.sections.moveUp} className="grid size-7 place-items-center rounded-md border border-line bg-white text-muted shadow-sm transition hover:border-brand disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveTeam(i, 1)} disabled={i === teams.length - 1} aria-label={t.admin.sections.moveDown} className="grid size-7 place-items-center rounded-md border border-line bg-white text-muted shadow-sm transition hover:border-brand disabled:opacity-30">↓</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {teams.map((tm, i) => (
            <div key={tm.id} className={`group flex items-center gap-3 px-3 py-2.5 transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}>
              <span className="w-6 shrink-0 text-center text-xs font-bold text-muted">{i + 1}</span>
              <button type="button" onClick={() => setEditingId(tm.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                <Thumb src={tm.image} position={tm.imagePosition} fallback={initialOf(tm.name, "🏀")} className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{pick(tm.name) || tapToEdit}</p>
                  <p className="truncate text-xs text-muted">👤 {tm.playerIds.length} · 🧑‍🏫 {(tm.coachIds ?? []).length} · 🏀 {tm.matches.length}{!tm.enabled ? ` · ${pick({ ar: "مخفي", he: "מוסתר", en: "Hidden" })}` : ""}</p>
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

      {/* Team detail sheet */}
      <Modal open={!!editing} onClose={() => setEditingId(null)} title={editing ? (pick(editing.name) || t.admin.team.name) : ""} className="max-w-2xl">
        {editing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pe-1">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{editingIndex + 1}</span>
              <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) { removeTeam(editing.id); setEditingId(null); } }} className="text-sm font-semibold text-rose-600 hover:underline">
                {t.admin.actions.delete}
              </button>
            </div>

            {/* Team identity */}
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

            {/* Players */}
            <div className="space-y-3 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">
                  {t.admin.team.players} <span className="font-normal text-muted">— {t.admin.team.playersHint}</span>
                </span>
                <Button size="sm" variant="subtle" onClick={() => addNewPlayer(editing.id)}>{t.admin.team.addNew}</Button>
              </div>

              <PlayerPicker
                players={players.filter((p) => !editing.playerIds.includes(p.id))}
                pick={pick}
                placeholder={t.admin.players.pickerPlaceholder}
                addNewLabel={t.admin.players.addNew}
                onAttach={(pid) => attachPlayer(editing.id, pid)}
                onAddNew={(name) => addNewPlayer(editing.id, name)}
              />

              {editing.playerIds.length === 0 && <p className="text-sm text-muted">{t.admin.team.noPlayers}</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                {editing.playerIds.map((pid) => {
                  const p = playerById(pid);
                  if (!p) return null;
                  return (
                    <div key={pid} className="space-y-2 rounded-xl border border-line p-3">
                      <ImageUpload value={p.image ?? ""} icon="user" onChange={(image) => updatePlayer(pid, { image })} />
                      {p.image && (
                        <ImagePositioner src={p.image} value={p.imagePosition} onChange={(imagePosition) => updatePlayer(pid, { imagePosition })} aspectRatio={p.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => updatePlayer(pid, { aspectRatio })} />
                      )}
                      <LocalizedField label={t.admin.team.newPlayerName} value={p.name} onChange={(name) => updatePlayer(pid, { name })} />
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.number}</span>
                          <input value={p.number ?? ""} onChange={(e) => updatePlayer(pid, { number: e.target.value })} className={plainInput} />
                        </label>
                      </div>
                      <LocalizedField label={t.admin.team.position} value={p.position ?? emptyLoc()} onChange={(position) => updatePlayer(pid, { position })} />
                      <div className="flex gap-3">
                        <button type="button" onClick={() => detachPlayer(editing.id, pid)} className="text-xs font-semibold text-muted hover:text-ink">↩ {t.admin.team.detach}</button>
                        <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) deletePlayer(pid); }} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.actions.delete}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coaches */}
            <div className="space-y-3 border-t border-line pt-4">
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

              {(editing.coachIds ?? []).length === 0 && <p className="text-sm text-muted">{t.admin.team.noCoaches}</p>}

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

            {/* Matches */}
            <div className="space-y-3 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">
                  {t.admin.team.matches} <span className="font-normal text-muted">— {t.admin.team.matchesHint}</span>
                </span>
                <Button size="sm" variant="subtle" onClick={() => addMatch(editing.id)}>{t.admin.team.addMatch}</Button>
              </div>
              {editing.matches.length === 0 && <p className="text-sm text-muted">{t.admin.team.noMatches}</p>}
              {editing.matches.map((m) => (
                <div key={m.id} className="space-y-2 rounded-xl border border-line p-3">
                  <LocalizedField label={t.admin.team.opponent} value={m.opponent} onChange={(opponent) => updateMatch(editing.id, m.id, { opponent })} />
                  <DateField label={t.admin.team.matchDate} value={m.date} withTime onChange={(date) => updateMatch(editing.id, m.id, { date })} />
                  <LocalizedField label={t.admin.team.matchWhere} value={m.where} onChange={(where) => updateMatch(editing.id, m.id, { where })} />
                  <LocalizedField label={`${t.admin.team.contactName} (المسؤول)`} value={m.contactName ?? emptyLoc()} onChange={(contactName) => updateMatch(editing.id, m.id, { contactName })} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.contactPhone}</span>
                    <input dir="ltr" value={m.contactPhone ?? ""} onChange={(e) => updateMatch(editing.id, m.id, { contactPhone: e.target.value })} className={plainInput} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.matchIbba}</span>
                    <input dir="ltr" placeholder="https://www.ibba.co.il/…" value={m.ibbaLink ?? ""} onChange={(e) => updateMatch(editing.id, m.id, { ibbaLink: e.target.value })} className={plainInput} />
                  </label>
                  <button type="button" onClick={() => removeMatch(editing.id, m.id)} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.team.removeMatch}</button>
                </div>
              ))}
            </div>

            {/* Visibility */}
            <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
              <input type="checkbox" checked={editing.enabled} onChange={(e) => updateTeam(editing.id, { enabled: e.target.checked })} className="size-4" />
              <span className="text-sm font-semibold text-ink">{t.admin.team.show}</span>
            </label>

            <div className="flex justify-end border-t border-line pt-3">
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
            </div>
          </div>
        )}
      </Modal>
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
