"use client";

import { useEffect, useState } from "react";
import type { Localized, Person } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ViewToggle, Thumb, TapChevron, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const emptyLocalized = (): Localized => ({ ar: "", he: "", en: "" });
const initialOf = (name: Localized) => (name.ar || name.he || name.en || "").trim().charAt(0) || "?";

// Manage a list of people (staff or volunteers) as cards or a list; tap one to
// open its detail sheet (photo, name, role).
export function PeopleEditor({
  people,
  onChange,
  addLabel,
  emptyLabel,
  nameLabel,
  roleLabel,
  onEditingChange,
}: {
  people: Person[];
  onChange: (p: Person[]) => void;
  addLabel: string;
  emptyLabel: string;
  nameLabel: string;
  roleLabel: string;
  onEditingChange?: (open: boolean) => void;
}) {
  const { pick } = useI18n();
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { onEditingChange?.(!!editingId); return () => onEditingChange?.(false); }, [editingId, onEditingChange]);

  const update = (id: string, patch: Partial<Person>) =>
    onChange(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => onChange(people.filter((p) => p.id !== id));
  const add = () => {
    const id = crypto.randomUUID();
    onChange([...people, { id, name: emptyLocalized(), role: emptyLocalized(), image: "" }]);
    setEditingId(id);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= people.length) return;
    const next = people.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const editing = editingId ? people.find((p) => p.id === editingId) ?? null : null;
  const editingIndex = editing ? people.findIndex((p) => p.id === editing.id) : -1;
  const tapToEdit = pick({ ar: "اضغط للتعديل", he: "לחצו לעריכה", en: "Tap to edit" });

  return (
    <div className="space-y-4">
      {!editing && (<>
      <div className="flex items-center justify-between gap-2">
        <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
        <Button size="sm" variant="subtle" onClick={add}>+ {addLabel}</Button>
      </div>

      {people.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">{emptyLabel}</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {people.map((p) => (
            <button key={p.id} type="button" onClick={() => setEditingId(p.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
              <div className="relative aspect-[4/5] w-full">
                <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="h-full w-full" />
              </div>
              <div className="min-w-0 px-2.5 py-2">
                <p className="truncate text-xs font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                <p className="truncate text-[11px] text-muted">{pick(p.role) || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {people.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setEditingId(p.id)} className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}>
              <Thumb src={p.image} position={p.imagePosition} fallback={initialOf(p.name)} className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{pick(p.name) || tapToEdit}</p>
                <p className="truncate text-xs text-muted">{pick(p.role) || "—"}</p>
              </div>
              <TapChevron className="text-lg" />
            </button>
          ))}
        </div>
      )}

      </>)}

      {editing && (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"><span aria-hidden className="rtl:-scale-x-100">←</span> {pick({ ar: "رجوع", he: "חזרה", en: "Back" })}</button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(editingIndex, editingIndex - 1)} disabled={editingIndex === 0} aria-label="up" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(editingIndex, editingIndex + 1)} disabled={editingIndex === people.length - 1} aria-label="down" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
                <button type="button" onClick={() => { remove(editing.id); setEditingId(null); }} className="ms-1 text-sm font-semibold text-rose-600 hover:underline">✕</button>
              </div>
            </div>
            <ImageUpload value={editing.image ?? ""} icon="user" onChange={(image) => update(editing.id, { image })} />
            {editing.image && (
              <ImagePositioner src={editing.image} value={editing.imagePosition} onChange={(imagePosition) => update(editing.id, { imagePosition })} aspectRatio={editing.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(editing.id, { aspectRatio })} />
            )}
            <LocalizedField label={nameLabel} value={editing.name} onChange={(name) => update(editing.id, { name })} />
            <LocalizedField label={roleLabel} value={editing.role} onChange={(role) => update(editing.id, { role })} />
            <div className="flex justify-end border-t border-line pt-3">
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
            </div>
          </div>
        )}
    </div>
  );
}
