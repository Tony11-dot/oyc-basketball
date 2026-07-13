"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { ViewToggle, Thumb, TapChevron, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Player } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const initialOf = (name: Localized, fallback = "?") =>
  (name.ar || name.he || name.en || "").trim().charAt(0) || fallback;

// Dedicated admin view of the shared player roster — independent of teams. Browse
// players as blocks or a list; tap any one to open a detail sheet with the full
// editor. Players managed here are then available to every team.
export default function PlayersAdmin() {
  const { t, pick } = useI18n();
  const toast = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [original, setOriginal] = useState<Player[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then((d) => {
      setPlayers(d.players ?? []);
      setOriginal(d.players ?? []);
      setLoaded(true);
    });
  }, []);

  const update = (id: string, patch: Partial<Player>) =>
    setPlayers((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => setPlayers((list) => list.filter((p) => p.id !== id));
  const add = () => {
    const id = `newp-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    setPlayers((list) => [{ id, name: emptyLoc(), number: "", position: emptyLoc(), image: "" }, ...list]);
    setEditingId(id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const hay = [p.name.ar, p.name.he, p.name.en, p.number].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [players, query]);

  const dirty = useMemo(() => JSON.stringify(players) !== JSON.stringify(original), [players, original]);
  const editing = editingId ? players.find((p) => p.id === editingId) ?? null : null;

  async function save() {
    setSaving(true);
    const headers = { "Content-Type": "application/json" };
    try {
      const removed = original.filter((o) => !players.some((p) => p.id === o.id));
      await Promise.all(removed.map((p) => fetch(`/api/players/${p.id}`, { method: "DELETE" })));
      for (const p of players) {
        const body = JSON.stringify({
          name: p.name,
          number: p.number ?? "",
          position: p.position ?? emptyLoc(),
          image: p.image ?? "",
          imagePosition: p.imagePosition,
          aspectRatio: p.aspectRatio,
        });
        if (p.id.startsWith("newp-")) await fetch("/api/players", { method: "POST", headers, body });
        else await fetch(`/api/players/${p.id}`, { method: "PATCH", headers, body });
      }
      const fresh = await fetch("/api/players").then((r) => r.json());
      setPlayers(fresh.players ?? []);
      setOriginal(fresh.players ?? []);
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
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.players}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.playersSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
          <Button variant="subtle" size="sm" onClick={add}>+ {t.admin.players.add}</Button>
          <Button onClick={save} disabled={saving || !dirty}>{saving ? t.admin.saving : t.admin.save}</Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.admin.players.search}
          className={`${plainInput} max-w-sm`}
        />
        <span className="text-xs text-muted">{filtered.length} / {players.length}</span>
        {dirty && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {pick({ ar: "تغييرات غير محفوظة", he: "שינויים לא שמורים", en: "Unsaved changes" })}
          </span>
        )}
      </div>

      {players.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.admin.players.none}</p>
      ) : view === "grid" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setEditingId(p.id)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
            >
              <div className="relative aspect-[4/5] w-full">
                <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="h-full w-full" />
                {p.number ? (
                  <span className="absolute end-2 top-2 grid min-w-7 place-items-center rounded-full bg-ink/80 px-1.5 py-0.5 text-xs font-bold text-white backdrop-blur">
                    #{p.number}
                  </span>
                ) : null}
                {p.id.startsWith("newp-") && (
                  <span className="absolute start-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                )}
              </div>
              <div className="min-w-0 px-3 py-2.5">
                <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                <p className="truncate text-xs text-muted">{pick(p.position ?? emptyLoc()) || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {filtered.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setEditingId(p.id)}
              className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}
            >
              <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                <p className="truncate text-xs text-muted">{pick(p.position ?? emptyLoc()) || "—"}</p>
              </div>
              {p.number ? <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{p.number}</span> : null}
              <TapChevron className="text-lg" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">{pick({ ar: "اضغط حفظ لتطبيق التغييرات.", he: "לחצו שמירה כדי להחיל את השינויים.", en: "Press Save to apply your changes." })}</p>

      {/* Detail sheet */}
      <Modal open={!!editing} onClose={() => setEditingId(null)} title={editing ? (pick(editing.name) || t.admin.players.name) : ""} className="max-w-md">
        {editing && (
          <div className="space-y-3">
            <ImageUpload value={editing.image ?? ""} icon="user" onChange={(image) => update(editing.id, { image })} />
            {editing.image && (
              <ImagePositioner src={editing.image} value={editing.imagePosition} onChange={(imagePosition) => update(editing.id, { imagePosition })} aspectRatio={editing.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(editing.id, { aspectRatio })} />
            )}
            <LocalizedField label={t.admin.players.name} value={editing.name} onChange={(name) => update(editing.id, { name })} />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.number}</span>
              <input value={editing.number ?? ""} onChange={(e) => update(editing.id, { number: e.target.value })} className={plainInput} />
            </label>
            <LocalizedField label={t.admin.team.position} value={editing.position ?? emptyLoc()} onChange={(position) => update(editing.id, { position })} />
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
        )}
      </Modal>
    </AdminShell>
  );
}
