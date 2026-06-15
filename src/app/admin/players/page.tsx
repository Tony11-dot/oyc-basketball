"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Player } from "@/lib/types";

const emptyLoc = (): Localized => ({ ar: "", he: "", en: "" });
const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

// Dedicated admin view of the shared player roster — independent of teams. Add,
// edit, search and delete players here; they're then available to every team.
export default function PlayersAdmin() {
  const { t, pick } = useI18n();
  const toast = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [original, setOriginal] = useState<Player[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

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
  const add = () =>
    setPlayers((list) => [
      { id: `newp-${Date.now()}-${Math.round(Math.random() * 1e6)}`, name: emptyLoc(), number: "", position: emptyLoc(), image: "" },
      ...list,
    ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const hay = [p.name.ar, p.name.he, p.name.en, p.number].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [players, query]);

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

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.players}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.playersSub}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" size="sm" onClick={add}>+ {t.admin.players.add}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t.admin.saving : t.admin.save}</Button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.admin.players.search}
        className={`${plainInput} mt-6 max-w-sm`}
      />

      {players.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.admin.players.none}</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-line bg-white p-3 shadow-sm">
              <ImageUpload value={p.image ?? ""} icon="user" onChange={(image) => update(p.id, { image })} />
              {p.image && (
                <ImagePositioner src={p.image} value={p.imagePosition} onChange={(imagePosition) => update(p.id, { imagePosition })} aspectRatio={p.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => update(p.id, { aspectRatio })} />
              )}
              <LocalizedField label={t.admin.players.name} value={p.name} onChange={(name) => update(p.id, { name })} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">{t.admin.team.number}</span>
                <input value={p.number ?? ""} onChange={(e) => update(p.id, { number: e.target.value })} className={plainInput} />
              </label>
              <LocalizedField label={t.admin.team.position} value={p.position ?? emptyLoc()} onChange={(position) => update(p.id, { position })} />
              <div className="flex justify-end pt-1">
                <button type="button" onClick={() => { if (confirm(t.admin.reg.deleteConfirm)) remove(p.id); }} className="text-xs font-semibold text-rose-600 hover:underline">
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
