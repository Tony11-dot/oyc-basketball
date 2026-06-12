"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Locale, Match, Player, Team } from "@/lib/types";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";

const INTL_LOCALE: Record<Locale, string> = { ar: "ar", he: "he", en: "en-GB" };

// Public "Teams" section. Each card opens a full-screen detail sheet listing the
// team's players and matches, plus a link to the team's IBBA page.
export function Teams({ teams, players, bg }: { teams: Team[]; players: Player[]; bg?: string }) {
  const { t, pick, locale } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = teams.find((tm) => tm.id === openId) ?? null;

  const byId = new Map(players.map((p) => [p.id, p]));
  const teamPlayers = (tm: Team): Player[] => tm.playerIds.map((id) => byId.get(id)).filter((p): p is Player => !!p);

  // Close the detail on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function formatMatch(m: Match): string {
    if (!m.date) return "";
    const d = new Date(m.date);
    if (isNaN(+d)) return "";
    try {
      return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  }

  return (
    <section id="teams" className={`relative scroll-mt-20 overflow-hidden py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={t.teams.eyebrow} title={t.teams.heading} subtitle={t.teams.subheading} />

        {teams.length === 0 ? (
          <p className="mt-12 text-center text-muted">{t.teams.empty}</p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-5xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((tm, i) => (
              <motion.article
                key={tm.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setOpenId(tm.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenId(tm.id)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="overflow-hidden" style={{ aspectRatio: tm.aspectRatio ?? "16 / 10" }}>
                  <ImageBlock src={tm.image} alt={pick(tm.name)} rounded="rounded-none" objectPosition={tm.imagePosition} />
                </div>
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h3 className="whitespace-pre-line text-xl font-bold text-ink">{pick(tm.name)}</h3>
                  {pick(tm.description) && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-base leading-relaxed text-muted">{pick(tm.description)}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-brand-dark">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden>👥</span> {teamPlayers(tm).length} {t.teams.players}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden>🏀</span> {tm.matches.length} {t.teams.matches}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-base font-semibold text-white transition group-hover:bg-brand-dark">
                    {t.teams.open}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen detail sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
            className="fixed inset-0 z-[70] overflow-y-auto"
          >
            {open.detailBg ? <SectionBg url={open.detailBg} /> : <div className="fixed inset-0 brand-gradient" />}

            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Close"
              className="fixed end-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-2xl text-ink shadow-lg transition hover:bg-white"
            >
              ✕
            </button>

            <div className="relative z-0 flex min-h-full items-start justify-center p-4 py-16 md:p-8">
              <motion.div
                initial={{ scale: 0.96, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                {/* header */}
                <div className="relative">
                  <div className="overflow-hidden" style={{ aspectRatio: open.aspectRatio ?? "16 / 9" }}>
                    <ImageBlock src={open.image} alt={pick(open.name)} rounded="rounded-none" objectPosition={open.imagePosition} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 md:p-7">
                    <h3 className="whitespace-pre-line text-2xl font-extrabold text-white drop-shadow md:text-4xl">{pick(open.name)}</h3>
                  </div>
                </div>

                <div className="space-y-8 p-5 md:p-8">
                  {pick(open.description) && (
                    <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">{pick(open.description)}</p>
                  )}

                  {open.ibbaLink && (
                    <a
                      href={open.ibbaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-brand-darker shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-dark hover:text-white"
                    >
                      🔗 {t.teams.teamIbba}
                    </a>
                  )}

                  {/* Players */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand">{t.teams.players}</h4>
                    {teamPlayers(open).length === 0 ? (
                      <p className="mt-3 text-sm text-muted">{t.teams.noPlayers}</p>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {teamPlayers(open).map((p) => (
                          <div key={p.id} className="overflow-hidden rounded-2xl border border-line">
                            <div className="relative" style={{ aspectRatio: p.aspectRatio ?? "4 / 5" }}>
                              <ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} />
                              {p.number && (
                                <span className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-brand text-sm font-extrabold text-white shadow">
                                  {p.number}
                                </span>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="truncate text-sm font-bold text-ink">{pick(p.name)}</p>
                              {p.position && pick(p.position) && (
                                <p className="truncate text-xs font-semibold text-muted">{pick(p.position)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Matches */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand">{t.teams.matches}</h4>
                    {open.matches.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">{t.teams.noMatches}</p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {open.matches.map((m) => (
                          <li key={m.id} className="rounded-2xl border border-line p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-muted">{t.teams.vs}</span>
                              {m.opponentLogo && (
                                <span className="size-6 overflow-hidden rounded-full">
                                  <ImageBlock src={m.opponentLogo} alt={pick(m.opponent)} rounded="rounded-none" />
                                </span>
                              )}
                              <span className="text-base font-bold text-ink">{pick(m.opponent)}</span>
                            </div>
                            {formatMatch(m) && <p className="mt-1.5 text-sm text-muted">🗓️ {formatMatch(m)}</p>}
                            {pick(m.where) && <p className="mt-0.5 text-sm text-muted">📍 {t.teams.at} {pick(m.where)}</p>}
                            {m.ibbaLink && (
                              <a
                                href={m.ibbaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark transition hover:text-brand"
                              >
                                🔗 {t.teams.viewIbba}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
