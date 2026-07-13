"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Calendar } from "@/components/ui/Calendar";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";
import type { AttendanceRecord, AttendanceStatus, Coach, Player, Team } from "@/lib/types";

type Tab = "overview" | "players" | "sessions" | "calendar";
type PlayerSort = "rate" | "name" | "present" | "absent";

// "YYYY-MM-DD" → local Date (no timezone drift).
const ymdToDate = (iso: string) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

export default function AttendanceAdmin() {
  const { t, pick, locale } = useI18n();
  const a = t.admin.attendance;
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [teamId, setTeamId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [playerSort, setPlayerSort] = useState<PlayerSort>("rate");
  const [playerQuery, setPlayerQuery] = useState("");

  // The day whose roster sheet is open, plus its editable statuses + saving flag.
  const [dayDate, setDayDate] = useState<string | null>(null);
  const [dayStatuses, setDayStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [savingDay, setSavingDay] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams?all=1").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/coaches").then((r) => r.json()),
    ]).then(([tm, pl, co]) => {
      setTeams(tm.teams ?? []);
      setPlayers(pl.players ?? []);
      setCoaches(co.coaches ?? []);
      setLoaded(true);
    });
  }, []);

  const playerById = (id: string) => players.find((p) => p.id === id);
  const coachById = (id: string) => coaches.find((c) => c.id === id);
  const team = teams.find((tm) => tm.id === teamId) ?? null;

  function openTeam(id: string) {
    setTeamId(id);
    setDayDate(null);
    setTab("overview");
    setRecordsLoading(true);
    fetch(`/api/attendance?teamId=${id}`)
      .then((r) => r.json())
      .then((d) => setRecords(d.records ?? []))
      .finally(() => setRecordsLoading(false));
  }

  // Sessions (dates with a record), ascending, + a date→record lookup.
  const dates = useMemo(() => records.map((r) => r.date).sort((x, y) => x.localeCompare(y)), [records]);
  const recordByDate = useMemo(() => {
    const m = new Map<string, AttendanceRecord>();
    for (const r of records) m.set(r.date, r);
    return m;
  }, [records]);

  const teamPlayers: Player[] = team
    ? team.playerIds.map(playerById).filter((p): p is Player => !!p)
    : [];

  // ---- All the stats, computed once ----------------------------------------
  const stats = useMemo(() => {
    const perSession = dates.map((date) => {
      const rec = recordByDate.get(date);
      const vals = rec ? Object.values(rec.statuses) : [];
      const present = vals.filter((v) => v === "present").length;
      const absent = vals.filter((v) => v === "absent").length;
      const marked = vals.length;
      return { date, present, absent, marked, total: teamPlayers.length, rate: marked ? present / marked : null, coachId: rec?.coachId };
    });

    const perPlayer = teamPlayers.map((p) => {
      let present = 0;
      let absent = 0;
      const seq: AttendanceStatus[] = [];
      for (const date of dates) {
        const st = recordByDate.get(date)?.statuses[p.id];
        if (!st) continue;
        seq.push(st);
        if (st === "present") present++;
        else absent++;
      }
      const marked = present + absent;
      let longest = 0;
      let run = 0;
      for (const st of seq) {
        if (st === "present") { run++; longest = Math.max(longest, run); }
        else run = 0;
      }
      let cur = 0;
      for (let i = seq.length - 1; i >= 0; i--) { if (seq[i] === "present") cur++; else break; }
      let lastPresent: string | null = null;
      for (let i = dates.length - 1; i >= 0; i--) {
        if (recordByDate.get(dates[i])?.statuses[p.id] === "present") { lastPresent = dates[i]; break; }
      }
      return { p, present, absent, marked, rate: marked ? present / marked : null, cur, longest, lastPresent };
    });

    const totPresent = perSession.reduce((s, x) => s + x.present, 0);
    const totMarked = perSession.reduce((s, x) => s + x.marked, 0);
    const rated = perPlayer.filter((x) => x.rate != null);
    const best = [...rated].sort((x, y) => (y.rate! - x.rate!) || y.present - x.present)[0] ?? null;
    const worst = [...rated].sort((x, y) => (x.rate! - y.rate!) || x.present - y.present)[0] ?? null;
    const bestSession = [...perSession].filter((s) => s.rate != null).sort((x, y) => y.rate! - x.rate!)[0] ?? null;

    return {
      perSession,
      perPlayer,
      totalSessions: dates.length,
      overallRate: totMarked ? totPresent / totMarked : null,
      avgPresent: dates.length ? totPresent / dates.length : 0,
      totPresent,
      totMarked,
      best,
      worst,
      bestSession,
    };
  }, [dates, recordByDate, teamPlayers]);

  const sortedPlayers = useMemo(() => {
    const q = playerQuery.trim().toLowerCase();
    const list = stats.perPlayer.filter((x) =>
      !q || [x.p.name.ar, x.p.name.he, x.p.name.en, x.p.number].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
    const byRate = (x: (typeof list)[number]) => (x.rate == null ? -1 : x.rate);
    return [...list].sort((x, y) => {
      if (playerSort === "name") return pick(x.p.name).localeCompare(pick(y.p.name));
      if (playerSort === "present") return y.present - x.present;
      if (playerSort === "absent") return y.absent - x.absent;
      return byRate(y) - byRate(x) || y.present - x.present;
    });
  }, [stats.perPlayer, playerSort, playerQuery, pick]);

  // ---- Day roster editing ---------------------------------------------------
  function openDay(date: string) {
    setDayDate(date);
    setDayStatuses({ ...(recordByDate.get(date)?.statuses ?? {}) });
  }
  const setStatus = (pid: string, status: AttendanceStatus) =>
    setDayStatuses((s) => {
      if (s[pid] === status) { const next = { ...s }; delete next[pid]; return next; }
      return { ...s, [pid]: status };
    });
  const markAll = (status: AttendanceStatus) => setDayStatuses(Object.fromEntries(teamPlayers.map((p) => [p.id, status])));

  async function saveDay() {
    if (!team || !dayDate) return;
    setSavingDay(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, date: dayDate, statuses: dayStatuses }),
      });
      const d = await res.json();
      if (d.record) {
        setRecords((list) => {
          const idx = list.findIndex((r) => r.id === d.record.id || (r.teamId === d.record.teamId && r.date === d.record.date));
          if (idx >= 0) { const next = [...list]; next[idx] = d.record; return next; }
          return [...list, d.record];
        });
      }
      toast.success(t.admin.toasts.saved);
      setDayDate(null);
    } catch {
      toast.error(t.admin.toasts.saveError);
    } finally {
      setSavingDay(false);
    }
  }

  const fmtDay = (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(ymdToDate(iso));
  const dayTitle = dayDate
    ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(ymdToDate(dayDate))
    : "";
  const presentNow = Object.values(dayStatuses).filter((v) => v === "present").length;

  const L = {
    overview: pick({ ar: "نظرة عامة", he: "סקירה", en: "Overview" }),
    players: pick({ ar: "اللاعبون", he: "שחקנים", en: "Players" }),
    sessions: pick({ ar: "الجلسات", he: "מפגשים", en: "Sessions" }),
    calendar: pick({ ar: "التقويم", he: "לוח שנה", en: "Calendar" }),
    attRate: pick({ ar: "نسبة الحضور", he: "אחוז נוכחות", en: "Attendance" }),
    avgPresent: pick({ ar: "متوسط الحضور", he: "נוכחות ממוצעת", en: "Avg present" }),
    perSession: pick({ ar: "لكل جلسة", he: "למפגש", en: "per session" }),
    streak: pick({ ar: "سلسلة", he: "רצף", en: "Streak" }),
    lastPresent: pick({ ar: "آخر حضور", he: "נוכחות אחרונה", en: "Last present" }),
    best: pick({ ar: "الأعلى حضوراً", he: "הכי נוכח", en: "Top attendance" }),
    needs: pick({ ar: "بحاجة لمتابعة", he: "דורש מעקב", en: "Needs follow-up" }),
    bestDay: pick({ ar: "أفضل جلسة", he: "המפגש הטוב", en: "Best session" }),
    trend: pick({ ar: "الحضور عبر الوقت", he: "נוכחות לאורך זמן", en: "Attendance over time" }),
    sortBy: pick({ ar: "ترتيب", he: "מיון", en: "Sort" }),
    byRate: pick({ ar: "النسبة", he: "אחוז", en: "Rate" }),
    byName: pick({ ar: "الاسم", he: "שם", en: "Name" }),
    of: pick({ ar: "من", he: "מתוך", en: "of" }),
    noData: pick({ ar: "لا يوجد حضور مُسجَّل بعد. افتح التقويم واضغط على يوم للبدء.", he: "עדיין אין נוכחות. פתחו את הלוח ולחצו על יום כדי להתחיל.", en: "No attendance recorded yet. Open the Calendar and tap a day to start." }),
    startNow: pick({ ar: "سجّل الحضور", he: "רשמו נוכחות", en: "Take attendance" }),
  };

  if (!loaded) {
    return (
      <AdminShell>
        <p className="text-muted">{t.admin.loading}</p>
      </AdminShell>
    );
  }

  // ---- Team picker ----------------------------------------------------------
  if (!team) {
    return (
      <AdminShell>
        <h1 className="text-2xl font-extrabold text-ink">{t.admin.titles.attendance}</h1>
        <p className="mt-1 text-sm text-muted">{a.subtitle}</p>
        {teams.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{a.noTeams}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((tm) => (
              <button key={tm.id} type="button" onClick={() => openTeam(tm.id)} className="group overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-card">
                <div className="overflow-hidden" style={{ aspectRatio: tm.aspectRatio ?? "16 / 10" }}>
                  <ImageBlock src={tm.image} alt={pick(tm.name)} rounded="rounded-none" objectPosition={tm.imagePosition} />
                </div>
                <div className="p-4">
                  <p className="font-bold text-ink">{pick(tm.name)}</p>
                  <p className="mt-0.5 text-xs text-muted">{tm.playerIds.length} {t.teams.players}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </AdminShell>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: L.overview },
    { id: "players", label: L.players },
    { id: "sessions", label: L.sessions },
    { id: "calendar", label: L.calendar },
  ];
  const hasData = stats.totalSessions > 0;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => setTeamId(null)} className="text-sm font-semibold text-brand-dark hover:underline">{a.backToTeams}</button>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">{pick(team.name)}</h1>
        </div>
        <Button size="sm" onClick={() => setTab("calendar")}>+ {L.startNow}</Button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-1 rounded-xl bg-surface p-1">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition", tab === tb.id ? "bg-white text-brand-dark shadow-sm" : "text-muted hover:text-ink")}>
            {tb.label}
          </button>
        ))}
      </div>

      {recordsLoading ? (
        <p className="mt-6 text-sm text-muted">{t.admin.loading}</p>
      ) : (
        <div className="mt-6">
          {/* ---------------- OVERVIEW ---------------- */}
          {tab === "overview" && (
            !hasData ? <EmptyState text={L.noData} cta={L.startNow} onCta={() => setTab("calendar")} /> : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatTile label={L.attRate} value={pct(stats.overallRate)} accent="text-brand" sub={`${stats.totPresent}/${stats.totMarked}`} />
                  <StatTile label={L.sessions} value={String(stats.totalSessions)} />
                  <StatTile label={L.avgPresent} value={stats.avgPresent.toFixed(1)} sub={`${L.of} ${teamPlayers.length}`} />
                  <StatTile label={L.players} value={String(teamPlayers.length)} />
                </div>

                {/* Trend */}
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-ink">{L.trend}</p>
                  <TrendBars sessions={stats.perSession} fmtDay={fmtDay} onPick={openDay} present={a.present} />
                </div>

                {/* Highlights */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Highlight tone="emerald" title={L.best} player={stats.best} pick={pick} rate />
                  <Highlight tone="rose" title={L.needs} player={stats.worst} pick={pick} rate />
                  <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{L.bestDay}</p>
                    {stats.bestSession ? (
                      <button type="button" onClick={() => openDay(stats.bestSession!.date)} className="mt-1 block text-start">
                        <p className="text-lg font-black text-ink">{pct(stats.bestSession.rate)}</p>
                        <p className="text-xs text-muted">{fmtDay(stats.bestSession.date)} · {stats.bestSession.present}/{stats.bestSession.marked}</p>
                      </button>
                    ) : <p className="mt-1 text-sm text-muted">—</p>}
                  </div>
                </div>
              </div>
            )
          )}

          {/* ---------------- PLAYERS ---------------- */}
          {tab === "players" && (
            !hasData ? <EmptyState text={L.noData} cta={L.startNow} onCta={() => setTab("calendar")} /> : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input value={playerQuery} onChange={(e) => setPlayerQuery(e.target.value)} placeholder={a.player + "…"} className="h-10 w-full max-w-xs rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" />
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted">{L.sortBy}:</span>
                    {([["rate", L.byRate], ["name", L.byName], ["present", a.present], ["absent", a.absent]] as const).map(([id, lbl]) => (
                      <button key={id} type="button" onClick={() => setPlayerSort(id)} className={cn("rounded-lg px-2.5 py-1 font-semibold transition", playerSort === id ? "bg-brand text-white" : "text-muted hover:text-ink")}>{lbl}</button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  {sortedPlayers.map((x, i) => (
                    <div key={x.p.id} className={cn("flex items-center gap-3 px-3 py-3 sm:px-4", i > 0 && "border-t border-line")}>
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-surface">
                        <ImageBlock src={x.p.image} alt={pick(x.p.name)} icon="user" rounded="rounded-none" objectPosition={x.p.imagePosition} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">
                          {x.p.number && <span className="me-1 text-xs text-muted">#{x.p.number}</span>}
                          {pick(x.p.name)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ {x.present}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">✗ {x.absent}</span>
                          {x.cur > 1 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700" title={L.streak}>🔥 {x.cur}</span>}
                          <span className="hidden text-[11px] text-muted sm:inline">{L.lastPresent}: {x.lastPresent ? fmtDay(x.lastPresent) : "—"}</span>
                        </div>
                      </div>
                      <div className="w-28 shrink-0 sm:w-40"><RateBar rate={x.rate} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ---------------- SESSIONS ---------------- */}
          {tab === "sessions" && (
            !hasData ? <EmptyState text={L.noData} cta={L.startNow} onCta={() => setTab("calendar")} /> : (
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                {[...stats.perSession].reverse().map((s, i) => {
                  const co = s.coachId ? coachById(s.coachId) : null;
                  return (
                    <button key={s.date} type="button" onClick={() => openDay(s.date)} className={cn("group flex w-full items-center gap-3 px-3 py-3 text-start transition hover:bg-surface sm:px-4", i > 0 && "border-t border-line")}>
                      <div className="w-24 shrink-0">
                        <p className="text-sm font-bold text-ink">{fmtDay(s.date)}</p>
                        {co && <p className="truncate text-[11px] text-muted">{pick(co.name)}</p>}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ {s.present}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">✗ {s.absent}</span>
                      <div className="ms-auto flex w-28 items-center gap-2 sm:w-44"><RateBar rate={s.rate} /></div>
                      <span aria-hidden className="text-muted transition group-hover:text-brand rtl:rotate-180">›</span>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* ---------------- CALENDAR (mark) ---------------- */}
          {tab === "calendar" && (
            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
              <p className="mb-3 text-sm text-muted">{pick({ ar: "اضغط على أي يوم لتسجيل الحضور.", he: "לחצו על יום כדי לרשום נוכחות.", en: "Tap any day to take attendance." })}</p>
              <Calendar
                selected={dayDate ?? undefined}
                onSelect={openDay}
                isMarked={(d) => recordByDate.has(d)}
                dayBadge={(d) => {
                  const rec = recordByDate.get(d);
                  if (!rec) return null;
                  const p = Object.values(rec.statuses).filter((v) => v === "present").length;
                  return <span className="rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">{p}/{Object.values(rec.statuses).length}</span>;
                }}
              />
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border-2 border-brand-200 bg-brand-50" /> {pick({ ar: "يوجد حضور", he: "יש נוכחות", en: "Has attendance" })}</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded ring-2 ring-brand/30" /> {pick({ ar: "اليوم", he: "היום", en: "Today" })}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day roster sheet */}
      <Modal open={!!dayDate} onClose={() => setDayDate(null)} title={dayTitle} className="max-w-md">
        {dayDate && (
          <div>
            {(() => { const rec = recordByDate.get(dayDate); return rec?.coachId && coachById(rec.coachId) ? <p className="mb-2 text-xs text-muted">{a.takenBy}: {pick(coachById(rec.coachId)!.name)}</p> : null; })()}
            {teamPlayers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{a.dayNoRecords}</p>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{pick({ ar: "حاضر", he: "נוכחים", en: "Present" })}: <span className="text-emerald-600">{presentNow}</span> / {teamPlayers.length}</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => markAll("present")} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">✓ {pick({ ar: "الكل", he: "הכל", en: "All" })}</button>
                    <button type="button" onClick={() => setDayStatuses({})} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">{pick({ ar: "مسح", he: "ניקוי", en: "Clear" })}</button>
                  </div>
                </div>
                <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto">
                  {teamPlayers.map((p) => {
                    const st = dayStatuses[p.id];
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-2">
                        <span className="size-9 shrink-0 overflow-hidden rounded-full"><ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} /></span>
                        <span className="flex-1 truncate text-sm font-medium text-ink">{p.number && <span className="me-1 text-xs text-muted">#{p.number}</span>}{pick(p.name)}</span>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => setStatus(p.id, "present")} aria-label="present" className={cn("grid size-9 place-items-center rounded-lg border-2 text-base font-bold transition", st === "present" ? "border-emerald-500 bg-emerald-500 text-white" : "border-line text-emerald-600 hover:border-emerald-400")}>✓</button>
                          <button type="button" onClick={() => setStatus(p.id, "absent")} aria-label="absent" className={cn("grid size-9 place-items-center rounded-lg border-2 text-base font-bold transition", st === "absent" ? "border-rose-500 bg-rose-500 text-white" : "border-line text-rose-600 hover:border-rose-400")}>✗</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
                  <Button variant="secondary" size="sm" onClick={() => setDayDate(null)}>{t.admin.actions.cancel}</Button>
                  <Button size="sm" onClick={saveDay} disabled={savingDay}>{savingDay ? t.admin.saving : t.admin.save}</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}

// ---- small presentational helpers ------------------------------------------
const pct = (r: number | null) => (r == null ? "—" : `${Math.round(r * 100)}%`);

function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 text-3xl font-black tabular-nums", accent ?? "text-ink")}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted tabular-nums">{sub}</p>}
    </div>
  );
}

// A rate bar, colour-banded so quality reads at a glance; the % is always shown.
function RateBar({ rate }: { rate: number | null }) {
  if (rate == null) return <span className="text-xs text-muted">—</span>;
  const p = Math.round(rate * 100);
  const color = p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${p}%` }} />
      </div>
      <span className="w-9 shrink-0 text-end text-xs font-bold tabular-nums text-ink">{p}%</span>
    </div>
  );
}

function Highlight({ tone, title, player, pick, rate }: { tone: "emerald" | "rose"; title: string; player: { p: Player; rate: number | null; present: number; absent: number } | null; pick: (v: { ar: string; he: string; en: string }) => string; rate?: boolean }) {
  const ring = tone === "emerald" ? "text-emerald-600" : "text-rose-600";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      {player ? (
        <div className="mt-1">
          <p className="truncate text-sm font-bold text-ink">{pick(player.p.name)}</p>
          <p className={cn("text-lg font-black tabular-nums", ring)}>{rate ? (player.rate == null ? "—" : `${Math.round(player.rate * 100)}%`) : ""}<span className="ms-1 text-xs font-semibold text-muted">✓{player.present} ✗{player.absent}</span></p>
        </div>
      ) : <p className="mt-1 text-sm text-muted">—</p>}
    </div>
  );
}

// Attendance % per session over time — thin single-hue bars, baseline-anchored.
function TrendBars({ sessions, fmtDay, onPick, present }: { sessions: { date: string; rate: number | null; present: number; marked: number }[]; fmtDay: (iso: string) => string; onPick: (d: string) => void; present: string }) {
  const shown = sessions.slice(-24); // keep it readable
  const max = 100;
  return (
    <div className="mt-3" dir="ltr">
      <div className="flex h-28 gap-1">
        {shown.map((s) => {
          const p = s.rate == null ? 0 : Math.round(s.rate * 100);
          return (
            <button
              key={s.date}
              type="button"
              onClick={() => onPick(s.date)}
              title={`${fmtDay(s.date)} — ${p}% (${present}: ${s.present}/${s.marked})`}
              className="group flex h-full flex-1 flex-col justify-end"
              style={{ minWidth: 6 }}
            >
              <span className="w-full rounded-t bg-brand/80 transition group-hover:bg-brand" style={{ height: `${Math.max(3, (p / max) * 100)}%` }} />
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted">
        <span>{shown.length > 0 ? fmtDay(shown[0].date) : ""}</span>
        <span>{shown.length > 1 ? fmtDay(shown[shown.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

function EmptyState({ text, cta, onCta }: { text: string; cta: string; onCta: () => void }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="max-w-sm text-sm text-muted">{text}</p>
      <div className="mt-4"><Button size="sm" onClick={onCta}>+ {cta}</Button></div>
    </div>
  );
}
