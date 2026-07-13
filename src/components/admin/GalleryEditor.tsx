"use client";

import { useEffect, useState } from "react";
import type { GalleryImage, Localized, TextStyle } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { StyleToolbar } from "@/components/admin/StyleToolbar";
import { ViewToggle, Thumb, TapChevron, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const emptyLocalized = (): Localized => ({ ar: "", he: "", en: "" });

// Manage the hero gallery / carousel slides as cards or a list; tap one to open
// its detail sheet (photo, frame, caption).
export function GalleryEditor({
  gallery,
  onChange,
  addLabel,
  emptyLabel,
  captionLabel,
  styles,
  onStyle,
  onEditingChange,
}: {
  gallery: GalleryImage[];
  onChange: (g: GalleryImage[]) => void;
  addLabel: string;
  emptyLabel: string;
  captionLabel: string;
  styles?: Record<string, TextStyle>;
  onStyle?: (key: string, v: TextStyle) => void;
  onEditingChange?: (open: boolean) => void;
}) {
  const { pick } = useI18n();
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { onEditingChange?.(!!editingId); return () => onEditingChange?.(false); }, [editingId, onEditingChange]);

  const update = (id: string, patch: Partial<GalleryImage>) =>
    onChange(gallery.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const remove = (id: string) => onChange(gallery.filter((g) => g.id !== id));
  const add = () => {
    const id = crypto.randomUUID();
    onChange([...gallery, { id, image: "", caption: emptyLocalized() }]);
    setEditingId(id);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= gallery.length) return;
    const next = gallery.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const editing = editingId ? gallery.find((g) => g.id === editingId) ?? null : null;
  const editingIndex = editing ? gallery.findIndex((g) => g.id === editing.id) : -1;
  const tapToEdit = pick({ ar: "اضغط للتعديل", he: "לחצו לעריכה", en: "Tap to edit" });

  return (
    <div className="space-y-4">
      {!editing && (<>
      <div className="flex items-center justify-between gap-2">
        <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
        <Button size="sm" variant="subtle" onClick={add}>+ {addLabel}</Button>
      </div>

      {gallery.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">{emptyLabel}</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((g, i) => (
            <button key={g.id} type="button" onClick={() => setEditingId(g.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
              <div className="relative aspect-[4/3] w-full">
                <Thumb src={g.image} position={g.imagePosition} fallback="🖼" className="h-full w-full" />
                <span className="absolute start-1.5 top-1.5 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">#{i + 1}</span>
              </div>
              <p className="truncate px-2.5 py-2 text-xs font-bold text-ink">{pick(g.caption) || tapToEdit}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {gallery.map((g, i) => (
            <button key={g.id} type="button" onClick={() => setEditingId(g.id)} className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}>
              <Thumb src={g.image} position={g.imagePosition} fallback="🖼" className="size-11 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{pick(g.caption) || tapToEdit}</span>
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
                <button type="button" onClick={() => move(editingIndex, editingIndex + 1)} disabled={editingIndex === gallery.length - 1} aria-label="down" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
                <button type="button" onClick={() => { remove(editing.id); setEditingId(null); }} className="ms-1 text-sm font-semibold text-rose-600 hover:underline">✕</button>
              </div>
            </div>
            <ImageUpload value={editing.image} icon="eye" onChange={(image) => update(editing.id, { image })} />
            {editing.image && (
              <ImagePositioner src={editing.image} value={editing.imagePosition} onChange={(imagePosition) => update(editing.id, { imagePosition })} aspectRatio={editing.aspectRatio ?? "16 / 9"} onAspectChange={(aspectRatio) => update(editing.id, { aspectRatio })} />
            )}
            <LocalizedField label={captionLabel} value={editing.caption} onChange={(caption) => update(editing.id, { caption })} />
            {onStyle && <StyleToolbar value={styles?.[`gallery.${editing.id}.caption`]} onChange={(v) => onStyle(`gallery.${editing.id}.caption`, v)} />}
            <div className="flex justify-end border-t border-line pt-3">
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סיום", en: "Done" })}</Button>
            </div>
          </div>
        )}
    </div>
  );
}
