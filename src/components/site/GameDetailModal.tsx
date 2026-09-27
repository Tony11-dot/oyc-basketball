"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Match, Team } from "@/lib/types";
import { matchDateParts } from "@/lib/matchDate";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const CLUB_NAME: Localized = { ar: "النادي الأرثوذكسي", he: "האגודה האורתודוקסית", en: "OBA Nazareth" };

/** Dramatic "team vs team" scoreboard shown when a fixture is tapped. The club
 * is always the highlighted side; the layout is pinned left/right by a fixed
 * ltr direction (like a real scoreboard) so it doesn't flip with the site's
 * RTL languages — the opponent sits on the right for away games (they're the
 * home side) and on the left for home games. */
export function GameDetailModal({
  match,
  team,
  onClose,
}: {
  match: Match;
  team: Team;
  onClose: () => void;
}) {
  const { t, pick, locale } = useI18n();
  const isAway = match.isHome === false;
  const dp = matchDateParts(match, locale);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clubSlot = (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <span className="size-24 overflow-hidden rounded-2xl bg-white shadow-2xl ring-4 ring-white md:size-32">
        <span className="grid h-full w-full place-items-center p-2"><Logo className="h-full w-auto" /></span>
      </span>
      <span className="text-lg font-black leading-tight text-white drop-shadow md:text-xl">{pick(CLUB_NAME)}</span>
    </div>
  );

  const opponentSlot = (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <span className="size-24 overflow-hidden rounded-full shadow-2xl ring-4 ring-white/40 md:size-32">
        <ImageBlock src={match.opponentLogo} alt={pick(match.opponent)} rounded="rounded-none" />
      </span>
      <span className="text-lg font-black leading-tight text-white drop-shadow md:text-xl">
        {pick(match.opponent)}
        {match.opponentNumber && <span className="ms-1 font-normal text-white/60">#{match.opponentNumber}</span>}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/70 p-4 py-10 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.94, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Full team photo (the squad) */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: team.aspectRatio ?? "16 / 9" }}>
            <ImageBlock src={team.image} alt={pick(team.name)} rounded="rounded-none" objectPosition={team.imagePosition} />
            <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent", isAway ? "from-accent-dark" : "from-brand-dark")} />
          </div>

          {/* Scoreboard header */}
          <div className={cn(
              "px-5 pb-7 pt-6 md:px-8",
              isAway ? "bg-gradient-to-br from-brand-darker via-accent-dark to-accent" : "bg-gradient-to-br from-brand-darker via-brand-dark to-brand-light",
            )}>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.a11y.close}
              className="absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-lg text-white backdrop-blur transition hover:bg-black/60"
            >
              ✕
            </button>

            <p className="text-center text-sm font-black uppercase tracking-widest text-white/75">{pick(team.name)}</p>

            <div dir="ltr" className="mt-4 flex items-start justify-between gap-2">
              {isAway ? clubSlot : opponentSlot}
              <div className="flex shrink-0 flex-col items-center gap-1.5 pt-6">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    isAway ? "border-white/30 bg-white/10 text-white" : "border-white bg-white text-brand-dark",
                  )}
                >
                  {isAway ? t.games.away : t.games.home}
                </span>
                <span className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg md:text-5xl">{t.games.vs}</span>
                {match.round && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {t.games.round} {match.round}
                  </span>
                )}
              </div>
              {isAway ? opponentSlot : clubSlot}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 p-5 md:p-6">
            {dp && (
              <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-surface text-center ring-1 ring-line">
                <div className="px-3 py-3">
                  <p className="text-sm font-bold text-muted">🗓️ {dp.weekday}</p>
                  <p dir="ltr" className="mt-0.5 text-3xl font-black tabular-nums tracking-tight text-ink">{dp.date}</p>
                </div>
                <div className="border-s border-line px-3 py-3">
                  <p className="text-sm font-bold text-muted">⏰</p>
                  <p dir="ltr" className="mt-0.5 text-3xl font-black tabular-nums tracking-tight text-ink">{dp.time}</p>
                </div>
              </div>
            )}
            {isAway && (
              <>
                {pick(match.where) && <p className="text-base font-semibold text-ink">📍 {t.games.at} {pick(match.where)}</p>}
                {match.contactName && pick(match.contactName) && (
                  <p className="text-base font-semibold text-ink">🧑‍💼 {t.games.responsible}: {pick(match.contactName)}</p>
                )}
                {match.contactPhone && (
                  <p className="text-base font-semibold text-ink">
                    📞 <a href={`tel:${match.contactPhone}`} dir="ltr" className="font-semibold text-brand-dark hover:underline">{match.contactPhone}</a>
                  </p>
                )}
              </>
            )}
            {match.ibbaLink && (
              <a
                href={match.ibbaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark transition hover:text-brand"
              >
                🔗 {t.games.viewIbba}
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
