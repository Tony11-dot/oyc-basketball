"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Match, Player, Team } from "@/lib/types";
import { matchDateParts } from "@/lib/matchDate";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { SectionHeading } from "./SectionHeading";
import { SectionBg } from "./SectionBg";
import { GameDetailModal } from "./GameDetailModal";
import { cn } from "@/lib/cn";

interface Fixture {
  match: Match;
  team: Team;
}

type LocationFilter = "all" | "home" | "away";

// Public "Games" section. Aggregates every team's fixtures into one schedule,
// ordered by date (soonest first), filterable by team, player and home/away.
// Tapping a fixture opens a dramatic team-vs-team detail view. The data comes
// straight from the teams' matches — the single source managed in admin.
export function Games({ teams, players, bg }: { teams: Team[]; players: Player[]; bg?: string }) {
  const { t, pick, locale } = useI18n();
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [playerFilter, setPlayerFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [selected, setSelected] = useState<Fixture | null>(null);

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
      fixtures.filter(({ match, team }) => {
        if (teamFilter !== "all" && team.id !== teamFilter) return false;
        if (playerFilter !== "all" && !team.playerIds.includes(playerFilter)) return false;
        if (locationFilter === "home" && match.isHome === false) return false;
        if (locationFilter === "away" && match.isHome !== false) return false;
        return true;
      }),
    [fixtures, teamFilter, playerFilter, locationFilter],
  );

  // Computed after mount so SSR and the first client render agree (avoids a
  // hydration mismatch on the upcoming/past label).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

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
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                className={selectCls}
                aria-label={t.games.filterLocation}
              >
                <option value="all">{t.games.allLocations}</option>
                <option value="home">{t.games.home}</option>
                <option value="away">{t.games.away}</option>
              </select>
            </div>

            {visible.length === 0 ? (
              <p className="mt-10 text-center text-muted">{t.games.empty}</p>
            ) : (
              <ul className="mx-auto mt-10 max-w-3xl space-y-5">
                {visible.map(({ match, team }, i) => {
                  const past = now != null && match.date ? +new Date(match.date) < now : false;
                  const dp = matchDateParts(match, locale);
                  return (
                    <motion.li
                      key={`${team.id}-${match.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
                      onClick={() => setSelected({ match, team })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected({ match, team })}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-3xl text-white shadow-lg ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl",
                        match.isHome === false
                          ? "bg-gradient-to-br from-brand-darker via-accent-dark to-accent"
                          : "bg-gradient-to-br from-brand-darker via-brand-dark to-brand-light",
                        past && "opacity-60 saturate-50",
                      )}
                    >
                      {/* Faint team photo wash behind the whole card */}
                      {team.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.image} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity" />
                      )}
                      <div className="relative p-5 md:p-7">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider md:text-sm",
                              match.isHome === false ? "bg-white text-accent-dark" : "bg-white text-brand-dark",
                            )}
                          >
                            {match.isHome === false ? t.games.away : t.games.home}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-bold md:text-sm",
                              past ? "bg-white/15 text-white/70" : "bg-emerald-400 text-emerald-950",
                            )}
                          >
                            {past ? t.games.past : t.games.upcoming}
                          </span>
                          {match.round && (
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold md:text-sm">
                              {t.games.round} {match.round}
                            </span>
                          )}
                        </div>

                        {/* Team vs opponent */}
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                            <span className="size-20 overflow-hidden rounded-2xl bg-white shadow-xl ring-4 ring-white/80 md:size-28">
                              <ImageBlock src={team.image} alt={pick(team.name)} rounded="rounded-none" objectPosition={team.imagePosition} />
                            </span>
                            <span className="line-clamp-2 text-base font-black leading-tight drop-shadow md:text-xl">{pick(team.name)}</span>
                          </div>
                          <span className="shrink-0 text-3xl font-black italic tracking-tighter text-white/90 drop-shadow-lg md:text-5xl">
                            {t.games.vs}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                            <span className="size-20 overflow-hidden rounded-full bg-white/10 shadow-xl ring-4 ring-white/30 md:size-28">
                              <ImageBlock src={match.opponentLogo} alt={pick(match.opponent)} rounded="rounded-none" />
                            </span>
                            <span className="line-clamp-2 text-base font-black leading-tight drop-shadow md:text-xl">
                              {pick(match.opponent)}
                              {match.opponentNumber && <span className="ms-1 text-sm font-bold text-white/60">#{match.opponentNumber}</span>}
                            </span>
                          </div>
                        </div>

                        {/* Date + time — big and unambiguous */}
                        {dp && (
                          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl bg-black/30 text-center ring-1 ring-white/15 backdrop-blur-sm">
                            <div className="px-3 py-3">
                              <p className="text-xs font-bold text-white/60 md:text-sm">🗓️ {dp.weekday}</p>
                              <p dir="ltr" className="mt-0.5 text-2xl font-black tabular-nums tracking-tight md:text-3xl">{dp.date}</p>
                            </div>
                            <div className="border-s border-white/15 px-3 py-3">
                              <p className="text-xs font-bold text-white/60 md:text-sm">⏰</p>
                              <p dir="ltr" className="mt-0.5 text-2xl font-black tabular-nums tracking-tight md:text-3xl">{dp.time}</p>
                            </div>
                          </div>
                        )}

                        {match.isHome === false && (
                          <div className="mt-4 space-y-1 text-sm font-semibold text-white/85 md:text-base">
                            {pick(match.where) && <p>📍 {t.games.at} {pick(match.where)}</p>}
                            {match.contactName && pick(match.contactName) && (
                              <p>🧑‍💼 {t.games.responsible}: {pick(match.contactName)}</p>
                            )}
                            {match.contactPhone && (
                              <p>
                                📞 <a href={`tel:${match.contactPhone}`} dir="ltr" onClick={(e) => e.stopPropagation()} className="font-bold text-white underline-offset-2 hover:underline">{match.contactPhone}</a>
                              </p>
                            )}
                          </div>
                        )}
                        {match.ibbaLink && (
                          <a
                            href={match.ibbaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25"
                          >
                            🔗 {t.games.viewIbba}
                          </a>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {selected && (
        <GameDetailModal match={selected.match} team={selected.team} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
