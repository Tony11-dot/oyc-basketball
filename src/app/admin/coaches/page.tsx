"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Coach, Localized } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

// Dedicated admin view of the shared coach pool — independent of teams. Add,
// edit, search and delete coaches; they're then attachable to every team, and
// their ID number is their login to the attendance portal.
export default function CoachesAdmin() {
  const { t, pick } = useI18n();
  const toast = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [original, setOriginal] = useState<Coach[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/coaches").then((r) => r.json()).then((d) => {
      setCoaches(d.coaches ?? []);
      setOriginal(d.coaches ?? []);
      setLoaded(true);
    });
  }, []);

  const update = (id: string, patch: Partial<Coach>) =>
    setCoaches((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setCoaches((list) => list.filter((c) => c.id !== id));
  const add = () =>
    setCoaches((list) => [
      { id: `newc-${Date.now()}-${Math.round(Math.random() * 1e6)}`, name: emptyLoc(), idNumber: "", phone: "", image: "" },
      ...list,
    ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter((c) => {
      const hay = [c.name.ar, c.name.he, c.name.en, c.idNumber, c.phone].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [coaches, query]);

  async function save() {
    setSaving(true);
    const headers = { "Content-Type": "application/json" };
    try {
      const removed = original.filter((o) => !coaches.some((c) => c.id === o.id));
      await Promise.all(removed.map((c) => fetch(`/api/coaches/${c.id}`, { method: "DELETE" })));
      for (const c of coaches) {
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
      setCoaches(fresh.coaches ?? []);
      setOriginal(fresh.coaches ?? []);
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
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.coaches}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.coachesSub}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" size="sm" onClick={add}>+ {t.admin.coaches.add}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t.admin.saving : t.admin.save}</Button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.admin.coaches.search}
        className={`${plainInput} mt-6 max-w-sm`}
      />

      {coaches.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.admin.coaches.none}</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="space-y-2 rounded-xl border border-line bg-white p-3 shadow-sm">
              <ImageUpload value={c.image ?? ""} icon="user" onChange={(image) => update(c.id, { image })} />
              {c.image && (
                <ImagePositioner src={c.image} value={c.imagePosition} onChange={(imagePosition) => update(c.id, { imagePosition })} aspectRatio={c.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(c.id, { aspectRatio })} />
              )}
              <LocalizedField label={t.admin.coaches.name} value={c.name} onChange={(name) => update(c.id, { name })} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.coaches.idNumber}</span>
                <input dir="ltr" value={c.idNumber ?? ""} onChange={(e) => update(c.id, { idNumber: e.target.value })} className={plainInput} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.coaches.phone}</span>
                <input dir="ltr" value={c.phone ?? ""} onChange={(e) => update(c.id, { phone: e.target.value })} className={plainInput} />
              </label>
              <div className="flex justify-end pt-1">
                <button type="button" onClick={() => { if (confirm(t.admin.reg.deleteConfirm)) remove(c.id); }} className="text-xs font-semibold text-rose-600 hover:underline">
                  {t.admin.actions.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">{pick({ ar: "اضغط حفظ لتطبيق التغييرات.", he: "לחצו שמירה כדי להחיל את השינויים.", en: "Press Save to apply your changes." })}</p>
    </AdminShell>
  );
}
