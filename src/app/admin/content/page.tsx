"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImagePositioner } from "@/components/admin/ImagePositioner";
import { StyleToolbar } from "@/components/admin/StyleToolbar";
import { BlockBuilder } from "@/components/admin/BlockBuilder";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { PeopleEditor } from "@/components/admin/PeopleEditor";
import { HighlightsEditor } from "@/components/admin/HighlightsEditor";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Block, BlocksPosition, GalleryImage, HistoricSection, Highlight, Localized, Person, SiteContent, TextStyle } from "@/lib/types";
import { STYLE_KEYS } from "@/lib/textStyle";
import { cn } from "@/lib/cn";

type Tab = "hero" | "highlights" | "gallery" | "historic" | "staff" | "volunteers" | "blocks" | "footer" | "backgrounds";

const BG_SECTIONS = ["home", "teams", "games", "highlights", "gallery", "historic", "staff", "volunteers", "register"] as const;

const emptyLocalized = (): Localized => ({ ar: "", he: "", en: "" });
const emptyHistoric = (): HistoricSection => ({ title: emptyLocalized(), body: emptyLocalized(), image: "" });

const plainInput =
  "h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export default function ContentAdmin() {
  const toast = useToast();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("hero");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  // Highlights live in their own store; edited inline here and synced on save.
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsOriginal, setHighlightsOriginal] = useState<Highlight[]>([]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "hero", label: t.admin.contentTabs.hero },
    { id: "highlights", label: t.admin.contentTabs.highlights },
    { id: "gallery", label: t.admin.contentTabs.gallery },
    { id: "historic", label: t.admin.contentTabs.historic },
    { id: "staff", label: t.admin.contentTabs.staff },
    { id: "volunteers", label: t.admin.contentTabs.volunteers },
    { id: "blocks", label: t.admin.contentTabs.blocks },
    { id: "backgrounds", label: t.admin.contentTabs.backgrounds },
    { id: "footer", label: t.admin.contentTabs.footer },
  ];

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => setContent(d.content));
    fetch("/api/highlights").then((r) => r.json()).then((d) => {
      setHighlights(d.highlights ?? []);
      setHighlightsOriginal(d.highlights ?? []);
    });
  }, []);

  async function syncHighlights() {
    const removed = highlightsOriginal.filter((o) => !highlights.some((h) => h.id === o.id));
    await Promise.all(removed.map((h) => fetch(`/api/highlights/${h.id}`, { method: "DELETE" })));
    await Promise.all(
      highlights.map((h) => {
        const body = JSON.stringify({
          videoUrl: h.videoUrl ?? "",
          embedUrl: h.embedUrl ?? "",
          poster: h.poster ?? "",
          caption: h.caption,
          aspectRatio: h.aspectRatio ?? "",
        });
        const isNew = h.id.startsWith("new-");
        return fetch(isNew ? "/api/highlights" : `/api/highlights/${h.id}`, {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }),
    );
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error();
      await syncHighlights();
      const fresh = await fetch("/api/highlights").then((r) => r.json());
      setHighlights(fresh.highlights ?? []);
      setHighlightsOriginal(fresh.highlights ?? []);
      setPreviewKey((k) => k + 1);
      toast.success(t.admin.toasts.saved);
    } catch {
      toast.error(t.admin.toasts.saveError);
    } finally {
      setSaving(false);
    }
  }

  // Section updaters keep edits immutable.
  const setHero = (patch: Partial<SiteContent["hero"]>) =>
    setContent((c) => (c ? { ...c, hero: { ...c.hero, ...patch } } : c));
  const setFooter = (patch: Partial<SiteContent["footer"]>) =>
    setContent((c) => (c ? { ...c, footer: { ...c.footer, ...patch } } : c));
  const setStyle = (key: string, v: TextStyle) =>
    setContent((c) => (c ? { ...c, styles: { ...(c.styles ?? {}), [key]: v } } : c));
  const setBlocks = (blocks: Block[]) => setContent((c) => (c ? { ...c, blocks } : c));
  const setGallery = (gallery: GalleryImage[]) => setContent((c) => (c ? { ...c, gallery } : c));
  const setStaff = (staff: Person[]) => setContent((c) => (c ? { ...c, staff } : c));
  const setVolunteers = (volunteers: Person[]) => setContent((c) => (c ? { ...c, volunteers } : c));
  const setHistoric = (patch: Partial<HistoricSection>) =>
    setContent((c) => (c ? { ...c, historic: { ...(c.historic ?? emptyHistoric()), ...patch } } : c));
  const setBackground = (id: string, url: string) =>
    setContent((c) => (c ? { ...c, backgrounds: { ...(c.backgrounds ?? {}), [id]: url } } : c));
  const setBlocksPosition = (blocksPosition: BlocksPosition) =>
    setContent((c) => (c ? { ...c, blocksPosition } : c));

  if (!content) {
    return (
      <AdminShell>
        <p className="text-muted">{t.admin.loading}</p>
      </AdminShell>
    );
  }

  // Field + its formatting toolbar.
  const styled = (label: string, value: Localized, onChange: (v: Localized) => void, key: string, opts?: { textarea?: boolean; rows?: number }) => (
    <div>
      <LocalizedField label={label} value={value} onChange={onChange} textarea={opts?.textarea} rows={opts?.rows} />
      <StyleToolbar value={content.styles?.[key]} onChange={(v) => setStyle(key, v)} />
    </div>
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.content}</h1>
          <p className="mt-1 text-sm text-muted">{t.admin.titles.contentSub}</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? t.admin.saving : t.admin.save}</Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 rounded-xl bg-surface p-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === tb.id ? "bg-white text-brand-dark shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Editor */}
        <div className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm">
          {tab === "hero" && (
            <>
              <ImageUpload value={content.hero.image} onChange={(image) => setHero({ image })} />
              {content.hero.image && (
                <ImagePositioner src={content.hero.image} value={content.hero.imagePosition} onChange={(imagePosition) => setHero({ imagePosition })} aspectRatio={content.hero.aspectRatio ?? "4 / 5"} onAspectChange={(aspectRatio) => setHero({ aspectRatio })} />
              )}
              {styled(t.admin.fields.headline, content.hero.title, (title) => setHero({ title }), STYLE_KEYS.heroTitle)}
              {styled(t.admin.fields.subtitle, content.hero.subtitle, (subtitle) => setHero({ subtitle }), STYLE_KEYS.heroSubtitle)}
              {styled(t.admin.fields.body, content.hero.body, (body) => setHero({ body }), STYLE_KEYS.heroBody, { textarea: true, rows: 4 })}
            </>
          )}

          {tab === "highlights" && <HighlightsEditor highlights={highlights} onChange={setHighlights} />}

          {tab === "gallery" && (
            <GalleryEditor
              gallery={content.gallery ?? []}
              onChange={setGallery}
              addLabel={t.admin.gallery.add}
              emptyLabel={t.admin.gallery.empty}
              captionLabel={t.admin.gallery.caption}
              styles={content.styles}
              onStyle={setStyle}
            />
          )}

          {tab === "historic" && (
            <div className="space-y-4">
              <ImageUpload value={content.historic?.image ?? ""} onChange={(image) => setHistoric({ image })} />
              {content.historic?.image && (
                <ImagePositioner
                  src={content.historic.image}
                  value={content.historic.imagePosition}
                  onChange={(imagePosition) => setHistoric({ imagePosition })}
                  aspectRatio={content.historic.aspectRatio ?? "4 / 3"}
                  onAspectChange={(aspectRatio) => setHistoric({ aspectRatio })}
                />
              )}
              {styled(t.admin.historicEditor.title, content.historic?.title ?? emptyLocalized(), (title) => setHistoric({ title }), "historic.title")}
              {styled(t.admin.historicEditor.body, content.historic?.body ?? emptyLocalized(), (body) => setHistoric({ body }), "historic.body", { textarea: true, rows: 6 })}
            </div>
          )}

          {tab === "staff" && (
            <PeopleEditor
              people={content.staff ?? []}
              onChange={setStaff}
              addLabel={t.admin.people.addStaff}
              emptyLabel={t.admin.people.emptyStaff}
              nameLabel={t.admin.people.name}
              roleLabel={t.admin.people.role}
            />
          )}

          {tab === "volunteers" && (
            <PeopleEditor
              people={content.volunteers ?? []}
              onChange={setVolunteers}
              addLabel={t.admin.people.addVolunteer}
              emptyLabel={t.admin.people.emptyVolunteers}
              nameLabel={t.admin.people.name}
              roleLabel={t.admin.people.role}
            />
          )}

          {tab === "blocks" && (
            <BlockBuilder
              blocks={content.blocks ?? []}
              position={content.blocksPosition ?? "afterTeams"}
              onBlocksChange={setBlocks}
              onPositionChange={setBlocksPosition}
            />
          )}

          {tab === "footer" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.fields.phone}</span>
                  <input dir="ltr" value={content.footer.phone} onChange={(e) => setFooter({ phone: e.target.value })} className={plainInput} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">{t.admin.fields.email}</span>
                  <input dir="ltr" value={content.footer.email} onChange={(e) => setFooter({ email: e.target.value })} className={plainInput} />
                </label>
              </div>
              {styled(t.admin.fields.address, content.footer.address, (address) => setFooter({ address }), "footer.address")}

              <div className="space-y-3 border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">{t.admin.fields.socialLinks}</h3>
                  <Button size="sm" variant="subtle" onClick={() => setFooter({ social: [...content.footer.social, { label: "", url: "" }] })}>
                    + {t.admin.fields.addLink}
                  </Button>
                </div>
                {content.footer.social.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      placeholder={t.admin.fields.linkLabel}
                      value={s.label}
                      onChange={(e) => setFooter({ social: content.footer.social.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                      className={cn(plainInput, "max-w-40")}
                    />
                    <input
                      placeholder="https://…"
                      dir="ltr"
                      value={s.url}
                      onChange={(e) => setFooter({ social: content.footer.social.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
                      className={plainInput}
                    />
                    <button
                      onClick={() => setFooter({ social: content.footer.social.filter((_, j) => j !== i) })}
                      aria-label="Remove link"
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "backgrounds" && (
            <div className="space-y-5">
              <p className="text-sm text-muted">{t.admin.sections.subtitle}</p>
              {BG_SECTIONS.map((id) => (
                <div key={id} className="rounded-xl border border-line p-4">
                  <p className="mb-2 text-sm font-bold text-ink">{t.nav[id]}</p>
                  <ImageUpload value={content.backgrounds?.[id] ?? ""} onChange={(url) => setBackground(id, url)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live preview — the real site, reloaded after each save */}
        <div className="lg:sticky lg:top-6">
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-1.5">
            <span className="text-xs font-semibold text-muted">{t.admin.preview.label}</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-brand-dark shadow-sm transition hover:text-brand"
            >
              ↻ {t.admin.refresh}
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <iframe key={previewKey} src="/" title="Live preview" className="h-[78vh] w-full" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
