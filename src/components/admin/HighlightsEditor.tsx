"use client";

import { useRef, useState } from "react";
import { upload as blobUpload } from "@vercel/blob/client";
import type { Highlight, Localized } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LocalizedField } from "@/components/admin/LocalizedField";
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

export function HighlightsEditor({ highlights, onChange }: { highlights: Highlight[]; onChange: (h: Highlight[]) => void }) {
  const { t } = useI18n();
  const update = (id: string, patch: Partial<Highlight>) =>
    onChange(highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const remove = (id: string) => onChange(highlights.filter((h) => h.id !== id));
  const add = () =>
    onChange([...highlights, { id: `new-${Date.now()}`, caption: emptyLocalized(), aspectRatio: "9 / 16" }]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= highlights.length) return;
    const next = highlights.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{t.admin.highlight.subtitle}</p>
        <Button size="sm" variant="subtle" onClick={add}>+ {t.admin.highlight.add}</Button>
      </div>

      {highlights.length === 0 && (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">{t.admin.highlight.none}</p>
      )}

      {highlights.map((h, i) => (
        <div key={h.id} className="space-y-3 rounded-xl border border-line p-4">
          <div className="flex items-center gap-1">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-dark">#{i + 1}</span>
            <div className="ms-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="up" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === highlights.length - 1} aria-label="down" className="grid size-7 place-items-center rounded-md border border-line text-muted transition hover:border-brand disabled:opacity-30">↓</button>
              <button type="button" onClick={() => remove(h.id)} aria-label="delete" className="grid size-7 place-items-center rounded-md bg-rose-50 text-rose-600 transition hover:bg-rose-100">✕</button>
            </div>
          </div>

          <span className="block text-sm font-semibold text-ink">{t.admin.highlight.video} <span className="font-normal text-muted">— {t.admin.highlight.videoHint}</span></span>
          <VideoUpload value={h.videoUrl} onChange={(videoUrl) => update(h.id, { videoUrl })} />

          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <span className="h-px flex-1 bg-line" /> {t.admin.highlight.or} <span className="h-px flex-1 bg-line" />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.highlight.embed} <span className="font-normal text-muted">— {t.admin.highlight.embedHint}</span></span>
            <input
              dir="ltr"
              placeholder="https://youtu.be/…  ·  https://instagram.com/reel/…"
              value={h.embedUrl ?? ""}
              onChange={(e) => update(h.id, { embedUrl: e.target.value })}
              className="h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.highlight.poster}</span>
            <ImageUpload value={h.poster ?? ""} onChange={(poster) => update(h.id, { poster })} />
          </div>

          <LocalizedField label={t.admin.highlight.caption} value={h.caption} onChange={(caption) => update(h.id, { caption })} />

          <label className="block max-w-xs">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.positioner.frameShape}</span>
            <select
              value={h.aspectRatio ?? "9 / 16"}
              onChange={(e) => update(h.id, { aspectRatio: e.target.value })}
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
            >
              {ASPECTS.map((a) => (
                <option key={a.v} value={a.v}>{a.label}</option>
              ))}
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}
