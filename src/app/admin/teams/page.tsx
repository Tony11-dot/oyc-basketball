"use client";

import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Match, Player, Team } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

// Convert an ISO/date string into a value for <input type="datetime-local"> in
// local time, and keep the naive local string when the admin edits it.
function toLocalInput(v?: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(+d)) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TeamsAdmin() {
  const { t, pick } = useI18n();
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsOriginal, setTeamsOriginal] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersOriginal, setPlayersOriginal] = useState<Player[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams?all=1").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
    ]).then(([tm, pl]) => {
      setTeams(tm.teams ?? []);
      setTeamsOriginal(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setPlayersOriginal(pl.players ?? []);
      setLoaded(true);
    });
  }, []);

  const playerById = (id: string) => players.find((p) => p.id === id);

  // ---- Team mutators --------------------------------------------------------
  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeams((list) => list.map((tm) => (tm.id === id ? { ...tm, ...patch } : tm)));
  const removeTeam = (id: string) => setTeams((list) => list.filter((tm) => tm.id !== id));
  const addTeam = () =>
    setTeams((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        name: emptyLoc(),
        description: emptyLoc(),
        image: "",
        imagePosition: "center",
        detailBg: "",
        ibbaLink: "",
        playerIds: [],
        matches: [],
        enabled: true,
        order: list.length,
        createdAt: new Date().toISOString(),
      },
    ]);
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

      // 2. Teams. Delete removed, create/update rest (with remapped player ids).
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
          matches: tm.matches,
          enabled: tm.enabled,
          order: i,
        });
        const isNew = tm.id.startsWith("new-");
        await fetch(isNew ? "/api/teams" : `/api/teams/${tm.id}`, { method: isNew ? "POST" : "PATCH", headers, body });
      }

      const [tm, pl] = await Promise.all([
        fetch("/api/teams?all=1").then((r) => r.json()),
        fetch("/api/players").then((r) => r.json()),
      ]);
      setTeams(tm.teams ?? []);
      setTeamsOriginal(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setPlayersOriginal(pl.players ?? []);
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

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.teams}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.teamsSub}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" size="sm" onClick={addTeam}>+ {t.admin.team.addTitle}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t.admin.saving : t.admin.save}</Button>
        </div>
      </div>

      {teams.length === 0 && <p className="mt-8 text-sm text-muted">{t.admin.team.none}</p>}

      <div className="mt-6 space-y-6">
        {teams.map((tm, i) => (
          <div key={tm.id} className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{i + 1}</span>
              <span className="text-base font-bold text-ink">{pick(tm.name) || t.admin.team.name}</span>
              <div className="ms-auto flex items-center gap-1">
                <button type="button" onClick={() => moveTeam(i, -1)} disabled={i === 0} aria-label={t.admin.sections.moveUp} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveTeam(i, 1)} disabled={i === teams.length - 1} aria-label={t.admin.sections.moveDown} className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
                <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) removeTeam(tm.id); }} aria-label={t.admin.actions.delete} className="grid size-7 place-items-center rounded-md bg-rose-50 text-rose-600 transition hover:bg-rose-100">✕</button>
              </div>
            </div>

            {/* Team identity */}
            <span className="block text-sm font-semibold text-ink">
              {t.admin.team.cover} <span className="font-normal text-muted">— {t.admin.team.coverHint}</span>
            </span>
            <ImageUpload value={tm.image ?? ""} onChange={(image) => updateTeam(tm.id, { image })} />
            {tm.image && (
              <ImagePositioner src={tm.image} value={tm.imagePosition} onChange={(imagePosition) => updateTeam(tm.id, { imagePosition })} aspectRatio={tm.aspectRatio ?? "16 / 10"} onAspectChange={(aspectRatio) => updateTeam(tm.id, { aspectRatio })} />
            )}
            <LocalizedField label={t.admin.team.name} value={tm.name} onChange={(name) => updateTeam(tm.id, { name })} />
            <LocalizedField label={t.admin.team.description} textarea value={tm.description} onChange={(description) => updateTeam(tm.id, { description })} />

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                {t.admin.team.ibbaLink} <span className="font-normal text-muted">— {t.admin.team.ibbaLinkHint}</span>
              </span>
              <input dir="ltr" placeholder="https://www.ibba.co.il/…" value={tm.ibbaLink ?? ""} onChange={(e) => updateTeam(tm.id, { ibbaLink: e.target.value })} className={plainInput} />
            </label>

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                {t.admin.team.detailBg} <span className="font-normal text-muted">— {t.admin.team.detailBgHint}</span>
              </span>
              <ImageUpload value={tm.detailBg ?? ""} onChange={(detailBg) => updateTeam(tm.id, { detailBg })} />
            </div>

            {/* Players */}
            <div className="space-y-3 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">
                  {t.admin.team.players} <span className="font-normal text-muted">— {t.admin.team.playersHint}</span>
                </span>
                <Button size="sm" variant="subtle" onClick={() => addNewPlayer(tm.id)}>{t.admin.team.addNew}</Button>
              </div>

              {/* Searchable picker: find an existing player or create one on the spot */}
              <PlayerPicker
                players={players.filter((p) => !tm.playerIds.includes(p.id))}
                pick={pick}
                placeholder={t.admin.players.pickerPlaceholder}
                addNewLabel={t.admin.players.addNew}
                onAttach={(pid) => attachPlayer(tm.id, pid)}
                onAddNew={(name) => addNewPlayer(tm.id, name)}
              />

              {tm.playerIds.length === 0 && <p className="text-sm text-muted">{t.admin.team.noPlayers}</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                {tm.playerIds.map((pid) => {
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
                        <button type="button" onClick={() => detachPlayer(tm.id, pid)} className="text-xs font-semibold text-muted hover:text-ink">↩ {t.admin.team.detach}</button>
                        <button type="button" onClick={() => { if (confirm(t.admin.team.deleteWarn)) deletePlayer(pid); }} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.actions.delete}</button>
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
                <Button size="sm" variant="subtle" onClick={() => addMatch(tm.id)}>{t.admin.team.addMatch}</Button>
              </div>
              {tm.matches.length === 0 && <p className="text-sm text-muted">{t.admin.team.noMatches}</p>}
              {tm.matches.map((m) => (
                <div key={m.id} className="space-y-2 rounded-xl border border-line p-3">
                  <LocalizedField label={t.admin.team.opponent} value={m.opponent} onChange={(opponent) => updateMatch(tm.id, m.id, { opponent })} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.matchDate}</span>
                    <input
                      type="datetime-local"
                      value={toLocalInput(m.date)}
                      onChange={(e) => updateMatch(tm.id, m.id, { date: e.target.value })}
                      className={plainInput}
                    />
                  </label>
                  <LocalizedField label={t.admin.team.matchWhere} value={m.where} onChange={(where) => updateMatch(tm.id, m.id, { where })} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.matchIbba}</span>
                    <input dir="ltr" placeholder="https://www.ibba.co.il/…" value={m.ibbaLink ?? ""} onChange={(e) => updateMatch(tm.id, m.id, { ibbaLink: e.target.value })} className={plainInput} />
                  </label>
                  <button type="button" onClick={() => removeMatch(tm.id, m.id)} className="text-xs font-semibold text-rose-600 hover:underline">{t.admin.team.removeMatch}</button>
                </div>
              ))}
            </div>

            {/* Visibility */}
            <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
              <input type="checkbox" checked={tm.enabled} onChange={(e) => updateTeam(tm.id, { enabled: e.target.checked })} className="size-4" />
              <span className="text-sm font-semibold text-ink">{t.admin.team.show}</span>
            </label>
          </div>
        ))}
      </div>
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
