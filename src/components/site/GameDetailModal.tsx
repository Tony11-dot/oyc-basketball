"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Localized, Match } from "@/lib/types";
import { formatMatchDateTime } from "@/lib/matchDate";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const CLUB_NAME: Localized = { ar: "نادي الروم", he: "נדי אלרום", en: "OBA Nazareth" };

/** Dramatic "team vs team" scoreboard shown when a fixture is tapped. The club
 * is always the highlighted side; the layout is pinned left/right by a fixed
 * ltr direction (like a real scoreboard) so it doesn't flip with the site's
 * RTL languages — the opponent sits on the right for away games (they're the
 * home side) and on the left for home games. */
export function GameDetailModal({
  match,
  teamName,
  onClose,
}: {
  match: Match;
  teamName: Localized;
  onClose: () => void;
}) {
  const { t, pick, locale } = useI18n();
  const isAway = match.isHome === false;
  const dateLabel = formatMatchDateTime(match, locale);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clubSlot = (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <span className="inline-flex rounded-2xl bg-white p-2 shadow-lg ring-2 ring-accent/70">
        <Logo className="h-12 w-auto" />
      </span>
      <span className="text-base font-extrabold text-white drop-shadow md:text-lg">{pick(CLUB_NAME)}</span>
    </div>
  );

  const opponentSlot = (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <span className="size-16 overflow-hidden rounded-full ring-2 ring-white/30">
        <ImageBlock src={match.opponentLogo} alt={pick(match.opponent)} rounded="rounded-none" />
      </span>
      <span className="text-sm font-bold text-white/85 md:text-base">
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
          className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Scoreboard header */}
          <div className="relative brand-gradient px-5 pb-6 pt-8 md:px-8">
            <button
              type="button"
              onClick={onClose}
              aria-label={t.a11y.close}
              className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
            >
              ✕
            </button>

            <p className="text-center text-xs font-bold uppercase tracking-widest text-white/60">{pick(teamName)}</p>

            <div dir="ltr" className="mt-4 flex items-start justify-between gap-2">
              {isAway ? clubSlot : opponentSlot}
              <div className="flex shrink-0 flex-col items-center gap-1.5 pt-3">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    isAway ? "border-white/30 bg-white/10 text-white" : "border-white bg-white text-brand-dark",
                  )}
                >
                  {isAway ? t.games.away : t.games.home}
                </span>
                <span className="text-2xl font-black text-white/90">{t.games.vs}</span>
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
          <div className="space-y-2 p-5 md:p-6">
            {dateLabel && <p className="text-sm text-muted">🗓️ {dateLabel}</p>}
            {isAway && (
              <>
                {pick(match.where) && <p className="text-sm text-muted">📍 {t.games.at} {pick(match.where)}</p>}
                {match.contactName && pick(match.contactName) && (
                  <p className="text-sm text-muted">🧑‍💼 {t.games.responsible}: {pick(match.contactName)}</p>
                )}
                {match.contactPhone && (
                  <p className="text-sm text-muted">
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
