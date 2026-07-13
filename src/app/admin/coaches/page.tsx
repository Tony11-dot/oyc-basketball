"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { ViewToggle, Thumb, TapChevron, AutosaveBar, DetailPanel, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAutosave } from "@/lib/useAutosave";
import type { Coach, Localized } from "@/lib/types";

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
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coaches").then((r) => r.json()).then((d) => {
      setCoaches(d.coaches ?? []);
      setLoaded(true);
    });
  }, []);

  const update = (id: string, patch: Partial<Coach>) =>
    setCoaches((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setCoaches((list) => list.filter((c) => c.id !== id));
  const add = () => {
    const id = `newc-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
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

  const persist = useCallback(async (list: Coach[], prev: Coach[]): Promise<Coach[]> => {
    const headers = { "Content-Type": "application/json" };
    const removed = prev.filter((o) => !list.some((c) => c.id === o.id));
    await Promise.all(removed.map((c) => fetch(`/api/coaches/${c.id}`, { method: "DELETE" })));
    for (const c of list) {
      const body = JSON.stringify({
        name: c.name,
        idNumber: c.idNumber ?? "",
        phone: c.phone ?? "",
        image: c.image ?? "",
        imagePosition: c.imagePosition,
        aspectRatio: c.aspectRatio,
      });
      if (c.id.startsWith("newc-")) await fetch("/api/coaches", { method: "POST", headers, body });
      else await fetch(`/api/coaches/${c.id}`, { method: "PATCH", headers, body });
    }
    const fresh = await fetch("/api/coaches").then((r) => r.json());
    const next: Coach[] = fresh.coaches ?? [];
    setCoaches(next);
    return next;
  }, []);

  const { saveState, undo, canUndo } = useAutosave({
    value: coaches,
    setValue: setCoaches,
    onSave: persist,
    ready: loaded,
    paused: !!editingId,
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

      {coaches.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.admin.coaches.none}</p>
      ) : view === "grid" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setEditingId(c.id)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
            >
              <div className="relative aspect-[4/5] w-full">
                <Thumb src={c.image} position={c.imagePosition} fallback={initialOf(c.name)} className="h-full w-full" />
                {c.id.startsWith("newc-") && (
                  <span className="absolute start-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                )}
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
              onClick={() => setEditingId(c.id)}
              className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
            >
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
