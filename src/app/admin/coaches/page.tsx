"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { ViewToggle, Thumb, TapChevron, AutosaveBar, DetailPanel, useSelection, SelectModeToggle, SelectionBar, BulkActionButton, SelectDot, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAutosave } from "@/lib/useAutosave";
import type { Coach, Localized, Team } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const initialOf = (name: Localized, fallback = "?") =>
  (name.ar || name.he || name.en || "").trim().charAt(0) || fallback;

// Dedicated admin view of the shared coach pool — independent of teams. Browse
// coaches as blocks or a list; tap one to open a detail sheet with the full
// editor. A coach's ID number is their login to the attendance portal.
export default function CoachesAdmin() {
  const { t, pick } = useI18n();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);
  const sel = useSelection();

  useEffect(() => {
    fetch("/api/coaches").then((r) => r.json()).then((d) => {
      setCoaches(d.coaches ?? []);
      setLoaded(true);
    });
    fetch("/api/teams?all=1").then((r) => r.json()).then((d) => setTeams(d.teams ?? []));
  }, []);

  // Which team(s) a coach is attached to — the relationship lives on the team
  // side (Team.coachIds), so a coach is "on" a team whenever its id is listed there.
  const teamsOf = (coachId: string) => teams.filter((tm) => (tm.coachIds ?? []).includes(coachId));

  // Attaching/detaching writes straight through to the team (not autosaved via
  // this page's own diff), since it mutates a different entity than the one
  // this page's persist() tracks.
  async function attachTeam(coachId: string, teamId: string) {
    const team = teams.find((tm) => tm.id === teamId);
    if (!team || (team.coachIds ?? []).includes(coachId)) return;
    const updated = { ...team, coachIds: [...(team.coachIds ?? []), coachId] };
    setTeams((list) => list.map((tm) => (tm.id === teamId ? updated : tm)));
    await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  }
  async function detachTeam(coachId: string, teamId: string) {
    const team = teams.find((tm) => tm.id === teamId);
    if (!team) return;
    const updated = { ...team, coachIds: (team.coachIds ?? []).filter((id) => id !== coachId) };
    setTeams((list) => list.map((tm) => (tm.id === teamId ? updated : tm)));
    await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  }

  const update = (id: string, patch: Partial<Coach>) =>
    setCoaches((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setCoaches((list) => list.filter((c) => c.id !== id));
  const removeMany = (ids: Set<string>) => setCoaches((list) => list.filter((c) => !ids.has(c.id)));
  const add = () => {
    const id = crypto.randomUUID();
    setCoaches((list) => [{ id, name: emptyLoc(), idNumber: "", phone: "", image: "" }, ...list]);
    setEditingId(id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter((c) => {
      const hay = [c.name.ar, c.name.he, c.name.en, c.idNumber, c.phone].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [coaches, query]);

  const editing = editingId ? coaches.find((c) => c.id === editingId) ?? null : null;

  // Delete removed, upsert only what changed. Ids are client-generated and
  // permanent (POST upserts), so saving is safe mid-edit and retries can't
  // duplicate; no refetch ever overwrites in-flight keystrokes.
  const persist = useCallback(async (list: Coach[], prev: Coach[]): Promise<Coach[]> => {
    const headers = { "Content-Type": "application/json" };
    const removed = prev.filter((o) => !list.some((c) => c.id === o.id));
    await Promise.all(removed.map((c) => fetch(`/api/coaches/${c.id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok && r.status !== 404) throw new Error(`delete failed: ${r.status}`);
    })));
    const changed = list.filter((c) => {
      const before = prev.find((o) => o.id === c.id);
      return !before || JSON.stringify(before) !== JSON.stringify(c);
    });
    await Promise.all(changed.map((c) => fetch("/api/coaches", { method: "POST", headers, body: JSON.stringify(c) }).then((r) => {
      if (!r.ok) throw new Error(`save failed: ${r.status}`);
    })));
    return list;
  }, []);

  const { saveState, undo, canUndo } = useAutosave({
    value: coaches,
    setValue: setCoaches,
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
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.coaches}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.coachesSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
          <SelectModeToggle active={sel.active} onToggle={sel.toggleActive} />
          <Button variant="subtle" size="sm" onClick={add}>+ {t.admin.coaches.add}</Button>
          <AutosaveBar saveState={saveState} onUndo={undo} canUndo={canUndo} />
        </div>
      </div>

      {!editing && (<>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.admin.coaches.search}
          className={`${plainInput} max-w-sm`}
        />
        <span className="text-xs text-muted">{filtered.length} / {coaches.length}</span>
      </div>

      {sel.active && (
        <SelectionBar count={sel.ids.size} total={filtered.length} onSelectAll={() => sel.setAll(filtered.map((c) => c.id))} onExit={sel.exit}>
          <BulkActionButton
            count={sel.ids.size}
            label={pick({ ar: "حذف المحدد", he: "מחיקת הנבחרים", en: "Delete selected" })}
            confirmText={pick({ ar: `حذف ${sel.ids.size} مدرّب؟ لا يمكن التراجع.`, he: `למחוק ${sel.ids.size} מאמנים? לא ניתן לבטל.`, en: `Delete ${sel.ids.size} coach(es)? This can't be undone.` })}
            onRun={() => { removeMany(sel.ids); sel.exit(); }}
          />
        </SelectionBar>
      )}

      {coaches.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.admin.coaches.none}</p>
      ) : view === "grid" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => (sel.active ? sel.toggle(c.id) : setEditingId(c.id))}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
            >
              <div className="relative aspect-[4/5] w-full">
                <Thumb src={c.image} position={c.imagePosition} fallback={initialOf(c.name)} className="h-full w-full" />
                {sel.active && <SelectDot checked={sel.isSelected(c.id)} onClick={() => sel.toggle(c.id)} className="absolute start-2 top-2" />}
              </div>
              <div className="min-w-0 px-3 py-2.5">
                <p className="truncate text-sm font-bold text-ink">{pick(c.name) || tapToEdit}</p>
                <p className="truncate text-xs text-muted" dir="ltr">{c.phone || c.idNumber || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {filtered.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => (sel.active ? sel.toggle(c.id) : setEditingId(c.id))}
              className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
            >
              {sel.active && <SelectDot checked={sel.isSelected(c.id)} onClick={() => sel.toggle(c.id)} />}
              <Thumb src={c.image} position={c.imagePosition} fallback={initialOf(c.name)} className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{pick(c.name) || tapToEdit}</p>
                <p className="truncate text-xs text-muted" dir="ltr">{c.idNumber || "—"}</p>
              </div>
              {c.phone ? <span className="hidden text-xs text-muted sm:inline" dir="ltr">{c.phone}</span> : null}
              <TapChevron className="text-lg" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">{pick({ ar: "تُحفظ التغييرات تلقائياً.", he: "השינויים נשמרים אוטומטית.", en: "Changes save automatically." })}</p>
      </>)}

      {/* Detail — expands inline */}
      {editing && (
        <DetailPanel title={pick(editing.name) || t.admin.coaches.name} onBack={() => setEditingId(null)}>
          <div className="space-y-4">
            <ImageUpload value={editing.image ?? ""} icon="user" onChange={(image) => update(editing.id, { image })} />
            {editing.image && (
              <ImagePositioner src={editing.image} value={editing.imagePosition} onChange={(imagePosition) => update(editing.id, { imagePosition })} aspectRatio={editing.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(editing.id, { aspectRatio })} />
            )}
            <LocalizedField label={t.admin.coaches.name} value={editing.name} onChange={(name) => update(editing.id, { name })} />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.coaches.idNumber}</span>
              <input dir="ltr" value={editing.idNumber ?? ""} onChange={(e) => update(editing.id, { idNumber: e.target.value })} className={plainInput} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.coaches.phone}</span>
              <input dir="ltr" value={editing.phone ?? ""} onChange={(e) => update(editing.id, { phone: e.target.value })} className={plainInput} />
            </label>
            <div className="space-y-2">
              <span className="mb-1 block text-xs font-semibold text-ink">{pick({ ar: "الفريق الذي يدرّبه", he: "הקבוצה שהוא מאמן", en: "Team coached" })}</span>
              <TeamPicker
                teams={teams.filter((tm) => !(tm.coachIds ?? []).includes(editing.id))}
                pick={pick}
                placeholder={pick({ ar: "ابحث عن فريق...", he: "חיפוש קבוצה...", en: "Search team..." })}
                onAttach={(teamId) => attachTeam(editing.id, teamId)}
              />
              {teamsOf(editing.id).length === 0 ? (
                <p className="text-xs text-muted">{pick({ ar: "لا يوجد فريق مرتبط بعد.", he: "טרם שויכה לקבוצה.", en: "No team assigned yet." })}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teamsOf(editing.id).map((tm) => (
                    <span key={tm.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink">
                      {pick(tm.name) || tm.id}
                      <button type="button" onClick={() => detachTeam(editing.id, tm.id)} className="text-muted hover:text-rose-600" aria-label={pick({ ar: "إزالة", he: "הסרה", en: "Remove" })}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <button
                type="button"
                onClick={() => { if (confirm(t.admin.reg.deleteConfirm)) { remove(editing.id); setEditingId(null); } }}
                className="text-sm font-semibold text-rose-600 hover:underline"
              >
                {t.admin.actions.delete}
              </button>
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
            </div>
          </div>
        </DetailPanel>
      )}
    </AdminShell>
  );
}

// Searchable, filterable team dropdown — mirrors the PlayerPicker/CoachPicker
// combobox pattern used on the Teams admin page, minus "add new" (teams aren't
// created from here).
function TeamPicker({
  teams,
  pick,
  placeholder,
  onAttach,
}: {
  teams: Team[];
  pick: (v: Localized) => string;
  placeholder: string;
  onAttach: (id: string) => void;
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
  const matches = teams.filter((tm) => {
    if (!needle) return true;
    return [tm.name.ar, tm.name.he, tm.name.en].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });

  const choose = (id: string) => { onAttach(id); setQ(""); setOpen(false); };

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches.length === 1) { e.preventDefault(); choose(matches[0].id); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className={plainInput}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-card">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted">—</p>
          ) : (
            matches.map((tm) => (
              <button
                key={tm.id}
                type="button"
                onClick={() => choose(tm.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-ink transition hover:bg-surface"
              >
                <span className="font-medium">{pick(tm.name) || tm.id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
