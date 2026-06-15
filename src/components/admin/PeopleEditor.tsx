"use client";

import type { Localized, Person } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { Button } from "@/components/ui/Button";

const emptyLocalized = (): Localized => ({ ar: "", he: "", en: "" });

// Manage a list of people (staff or volunteers): add, reorder, edit name/role/
// photo, remove. Mirrors GalleryEditor so the admin feels consistent.
export function PeopleEditor({
  people,
  onChange,
  addLabel,
  emptyLabel,
  nameLabel,
  roleLabel,
}: {
  people: Person[];
  onChange: (p: Person[]) => void;
  addLabel: string;
  emptyLabel: string;
  nameLabel: string;
  roleLabel: string;
}) {
  const update = (id: string, patch: Partial<Person>) =>
    onChange(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => onChange(people.filter((p) => p.id !== id));
  const add = () => onChange([...people, { id: crypto.randomUUID(), name: emptyLocalized(), role: emptyLocalized(), image: "" }]);

  function move(from: number, to: number) {
    if (to < 0 || to >= people.length) return;
    const next = people.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="subtle" onClick={add}>+ {addLabel}</Button>
      </div>

      {people.length === 0 && (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">{emptyLabel}</p>
      )}

      {people.map((p, i) => (
        <div key={p.id} className="space-y-3 rounded-xl border border-line p-4">
          <div className="flex items-center gap-1">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{i + 1}</span>
            <div className="ms-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="up" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === people.length - 1} aria-label="down" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
              <button type="button" onClick={() => remove(p.id)} aria-label="delete" className="grid size-7 place-items-center rounded-md bg-rose-50 text-rose-600 transition hover:bg-rose-100">✕</button>
            </div>
          </div>
          <ImageUpload value={p.image ?? ""} icon="user" onChange={(image) => update(p.id, { image })} />
          {p.image && (
            <ImagePositioner src={p.image} value={p.imagePosition} onChange={(imagePosition) => update(p.id, { imagePosition })} aspectRatio={p.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(p.id, { aspectRatio })} />
          )}
          <LocalizedField label={nameLabel} value={p.name} onChange={(name) => update(p.id, { name })} />
          <LocalizedField label={roleLabel} value={p.role} onChange={(role) => update(p.id, { role })} />
        </div>
      ))}
    </div>
  );
}
