"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Locale, Match, Player, Team } from "@/lib/types";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";
import { cn } from "@/lib/cn";

const INTL_LOCALE: Record<Locale, string> = { ar: "ar", he: "he", en: "en-GB" };

interface Fixture {
  match: Match;
  team: Team;
}

// Public "Games" section. Aggregates every team's fixtures into one schedule,
// ordered by date (soonest first), filterable by team and by player. The data
// comes straight from the teams' matches — the single source managed in admin.
export function Games({ teams, players, bg }: { teams: Team[]; players: Player[]; bg?: string }) {
  const { t, pick, locale } = useI18n();
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [playerFilter, setPlayerFilter] = useState<string>("all");

  // Flatten all fixtures and sort ascending by date (undated games sort last).
  const fixtures = useMemo<Fixture[]>(() => {
    const all: Fixture[] = [];
    for (const team of teams) for (const match of team.matches) all.push({ match, team });
    return all.sort((a, b) => {
      const da = a.match.date ? +new Date(a.match.date) : Infinity;
      const db = b.match.date ? +new Date(b.match.date) : Infinity;
      return da - db;
    });
  }, [teams]);

  const visible = useMemo(
    () =>
      fixtures.filter(({ team }) => {
        if (teamFilter !== "all" && team.id !== teamFilter) return false;
        if (playerFilter !== "all" && !team.playerIds.includes(playerFilter)) return false;
        return true;
      }),
    [fixtures, teamFilter, playerFilter],
  );

  // Computed after mount so SSR and the first client render agree (avoids a
  // hydration mismatch on the upcoming/past label).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const formatDate = (m: Match) => {
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
  };

  const selectCls =
    "h-11 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <section id="games" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x">
        <SectionHeading eyebrow={t.games.eyebrow} title={t.games.heading} subtitle={t.games.subheading} />

        {fixtures.length === 0 ? (
          <p className="mt-12 text-center text-muted">{t.games.empty}</p>
        ) : (
          <>
            {/* Filters */}
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={selectCls} aria-label={t.games.filterTeam}>
                <option value="all">{t.games.allTeams}</option>
                {teams.map((tm) => (
                  <option key={tm.id} value={tm.id}>{pick(tm.name)}</option>
                ))}
              </select>
              <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)} className={selectCls} aria-label={t.games.filterPlayer}>
                <option value="all">{t.games.allPlayers}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{pick(p.name)}</option>
                ))}
              </select>
            </div>

            {visible.length === 0 ? (
              <p className="mt-10 text-center text-muted">{t.games.empty}</p>
            ) : (
              <ul className="mx-auto mt-10 max-w-3xl space-y-3">
                {visible.map(({ match, team }, i) => {
                  const past = now != null && match.date ? +new Date(match.date) < now : false;
                  return (
                    <motion.li
                      key={`${team.id}-${match.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
                      className={cn(
                        "rounded-2xl border border-line bg-white p-4 shadow-sm md:p-5 border-s-4",
                        match.isHome === false ? "border-s-accent" : "border-s-brand-200",
                        past && "opacity-70",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-dark">
                          {pick(team.name)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold",
                            past ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {past ? t.games.past : t.games.upcoming}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs font-bold",
                            match.isHome === false
                              ? "border-accent bg-accent text-white"
                              : "border-line bg-white text-ink",
                          )}
                        >
                          {match.isHome === false ? t.games.away : t.games.home}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted">{t.games.vs}</span>
                        {match.opponentLogo && (
                          <span className="size-6 overflow-hidden rounded-full">
                            <ImageBlock src={match.opponentLogo} alt={pick(match.opponent)} rounded="rounded-none" />
                          </span>
                        )}
                        <span className="text-lg font-bold text-ink">{pick(match.opponent)}</span>
                        {match.opponentNumber && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">#{match.opponentNumber}</span>
                        )}
                      </div>
                      {formatDate(match) && <p className="mt-1.5 text-sm text-muted">🗓️ {formatDate(match)}</p>}
                      {match.isHome === false && (
                        <>
                          {pick(match.where) && <p className="mt-0.5 text-sm text-muted">📍 {t.games.at} {pick(match.where)}</p>}
                          {match.contactName && pick(match.contactName) && (
                            <p className="mt-0.5 text-sm text-muted">🧑‍💼 {t.games.responsible}: {pick(match.contactName)}</p>
                          )}
                          {match.contactPhone && (
                            <p className="mt-0.5 text-sm text-muted">
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
                          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark transition hover:text-brand"
                        >
                          🔗 {t.games.viewIbba}
                        </a>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
