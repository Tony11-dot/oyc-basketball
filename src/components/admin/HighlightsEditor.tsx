"use client";

import { useEffect, useRef, useState } from "react";
import { upload as blobUpload } from "@vercel/blob/client";
import type { Highlight, Localized } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ViewToggle, Thumb, TapChevron, type ViewMode } from "@/components/admin/EntityList";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const emptyLocalized = (): Localized => ({ ar: "", he: "", en: "" });

const ASPECTS = [
  { v: "9 / 16", label: "9:16 (reel)" },
  { v: "1 / 1", label: "1:1" },
  { v: "4 / 5", label: "4:5" },
  { v: "16 / 9", label: "16:9" },
];

// Uploads a video file (Vercel Blob in prod, /public/uploads locally) and
// reports the resulting URL. Mirrors ImageUpload but for video, with a <video>
// preview.
function VideoUpload({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const toast = useToast();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const ext = ({ "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string, string>)[file.type] || "mp4";
      const safePath = `uploads/clip.${ext}`;
      try {
        const blob = await blobUpload(safePath, file, { access: "public", handleUploadUrl: "/api/upload" });
        onChange(blob.url);
        return;
      } catch {
        // fall through to local upload
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-local", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.admin.imageUpload.failed);
      onChange(data.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.admin.imageUpload.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-black">
        {value ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={value} muted className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl text-muted">🎬</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-brand-dark transition hover:border-brand disabled:opacity-60"
        >
          {busy ? t.admin.imageUpload.uploading : value ? t.admin.imageUpload.replace : t.admin.highlight.video}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-start text-xs font-medium text-rose-600 hover:underline">
            {t.admin.imageUpload.remove}
          </button>
        )}
      </div>
    </div>
  );
}

export function HighlightsEditor({ highlights, onChange, onEditingChange }: { highlights: Highlight[]; onChange: (h: Highlight[]) => void; onEditingChange?: (open: boolean) => void }) {
  const { t, pick } = useI18n();
  const [view, setView] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { onEditingChange?.(!!editingId); return () => onEditingChange?.(false); }, [editingId, onEditingChange]);

  const update = (id: string, patch: Partial<Highlight>) =>
    onChange(highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const remove = (id: string) => onChange(highlights.filter((h) => h.id !== id));
  const add = () => {
    const id = `new-${Date.now()}`;
    onChange([...highlights, { id, caption: emptyLocalized(), aspectRatio: "9 / 16" }]);
    setEditingId(id);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= highlights.length) return;
    const next = highlights.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const editing = editingId ? highlights.find((h) => h.id === editingId) ?? null : null;
  const editingIndex = editing ? highlights.findIndex((h) => h.id === editing.id) : -1;
  const tapToEdit = pick({ ar: "اضغط للتعديل", he: "לחצו לעריכה", en: "Tap to edit" });
  const kind = (h: Highlight) => (h.videoUrl ? "🎬" : h.embedUrl ? "🔗" : "🎬");

  return (
    <div className="space-y-4">
      {!editing && (<>
      <div className="flex items-center justify-between gap-2">
        <ViewToggle mode={view} onChange={setView} labels={{ grid: pick({ ar: "بطاقات", he: "כרטיסים", en: "Cards" }), list: pick({ ar: "قائمة", he: "רשימה", en: "List" }) }} />
        <Button size="sm" variant="subtle" onClick={add}>+ {t.admin.highlight.add}</Button>
      </div>

      {highlights.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">{t.admin.highlight.none}</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {highlights.map((h, i) => (
            <button key={h.id} type="button" onClick={() => setEditingId(h.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
              <div className="relative aspect-[9/16] w-full bg-black">
                {h.poster ? (
                  <Thumb src={h.poster} fallback={kind(h)} className="h-full w-full" />
                ) : h.videoUrl ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={h.videoUrl} muted className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl text-white/40">{kind(h)}</div>
                )}
                <span className="absolute start-1.5 top-1.5 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">#{i + 1}</span>
              </div>
              <p className="truncate px-2.5 py-2 text-xs font-bold text-ink">{pick(h.caption) || tapToEdit}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {highlights.map((h, i) => (
            <button key={h.id} type="button" onClick={() => setEditingId(h.id)} className={`group flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface ${i > 0 ? "border-t border-line" : ""}`}>
              <Thumb src={h.poster} fallback={kind(h)} className="size-11 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{pick(h.caption) || tapToEdit}</span>
              <span className="text-xs text-muted">{h.videoUrl ? "🎬" : h.embedUrl ? "🔗" : "—"}</span>
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
                <button type="button" onClick={() => move(editingIndex, editingIndex + 1)} disabled={editingIndex === highlights.length - 1} aria-label="down" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
                <button type="button" onClick={() => { remove(editing.id); setEditingId(null); }} className="ms-1 text-sm font-semibold text-rose-600 hover:underline">{t.admin.imageUpload.remove}</button>
              </div>
            </div>

            <span className="block text-sm font-semibold text-ink">{t.admin.highlight.video} <span className="font-normal text-muted">— {t.admin.highlight.videoHint}</span></span>
            <VideoUpload value={editing.videoUrl} onChange={(videoUrl) => update(editing.id, { videoUrl })} />

            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <span className="h-px flex-1 bg-line" /> {t.admin.highlight.or} <span className="h-px flex-1 bg-line" />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.highlight.embed} <span className="font-normal text-muted">— {t.admin.highlight.embedHint}</span></span>
              <input dir="ltr" placeholder="https://youtu.be/…  ·  https://instagram.com/reel/…" value={editing.embedUrl ?? ""} onChange={(e) => update(editing.id, { embedUrl: e.target.value })} className="h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" />
            </label>

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.highlight.poster}</span>
              <ImageUpload value={editing.poster ?? ""} onChange={(poster) => update(editing.id, { poster })} />
            </div>

            <LocalizedField label={t.admin.highlight.caption} value={editing.caption} onChange={(caption) => update(editing.id, { caption })} />

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.positioner.frameShape}</span>
              <select value={editing.aspectRatio ?? "9 / 16"} onChange={(e) => update(editing.id, { aspectRatio: e.target.value })} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand">
                {ASPECTS.map((a) => (<option key={a.v} value={a.v}>{a.label}</option>))}
              </select>
            </label>

            <div className="flex justify-end border-t border-line pt-3">
              <Button size="sm" onClick={() => setEditingId(null)}>{pick({ ar: "تم", he: "סيום", en: "Done" })}</Button>
            </div>
        </div>
      )}
    </div>
  );
}
