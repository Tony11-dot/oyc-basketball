"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Calendar } from "@/components/ui/Calendar";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AttendanceRecord, AttendanceStatus, Coach, Player, Team } from "@/lib/types";

// Short day/month label for a "YYYY-MM-DD" string (e.g. "16/6").
function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
}

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
    setRecordsLoading(true);
    fetch(`/api/attendance?teamId=${id}`)
      .then((r) => r.json())
      .then((d) => setRecords(d.records ?? []))
      .finally(() => setRecordsLoading(false));
  }

  // Dates that actually have attendance, ascending.
  const dates = useMemo(
    () => records.map((r) => r.date).sort((x, y) => x.localeCompare(y)),
    [records],
  );
  const recordByDate = useMemo(() => {
    const m = new Map<string, AttendanceRecord>();
    for (const r of records) m.set(r.date, r);
    return m;
  }, [records]);

  const teamPlayers: Player[] = team
    ? team.playerIds.map(playerById).filter((p): p is Player => !!p)
    : [];

  // Present / marked counts for a given day (drives the lit-up calendar badge).
  const dayCounts = (date: string) => {
    const rec = recordByDate.get(date);
    if (!rec) return null;
    const vals = Object.values(rec.statuses);
    return { present: vals.filter((v) => v === "present").length, marked: vals.length };
  };

  function openDay(date: string) {
    setDayDate(date);
    setDayStatuses({ ...(recordByDate.get(date)?.statuses ?? {}) });
  }
  const setStatus = (pid: string, status: AttendanceStatus) =>
    setDayStatuses((s) => {
      // Tapping the same status again clears it (back to "not marked").
      if (s[pid] === status) {
        const next = { ...s };
        delete next[pid];
        return next;
      }
      return { ...s, [pid]: status };
    });
  const markAll = (status: AttendanceStatus) =>
    setDayStatuses(Object.fromEntries(teamPlayers.map((p) => [p.id, status])));

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

  const dayTitle = dayDate
    ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
        new Date(Number(dayDate.slice(0, 4)), Number(dayDate.slice(5, 7)) - 1, Number(dayDate.slice(8, 10))),
      )
    : "";
  const presentNow = Object.values(dayStatuses).filter((v) => v === "present").length;

  if (!loaded) {
    return (
      <AdminShell>
        <p className="text-muted">{t.admin.loading}</p>
      </AdminShell>
    );
  }

  // ---- Team picker (grid of blocks) -----------------------------------------
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
              <button
                key={tm.id}
                type="button"
                onClick={() => openTeam(tm.id)}
                className="group overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-card"
              >
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

  // ---- Selected team: big calendar + summary --------------------------------
  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => setTeamId(null)} className="text-sm font-semibold text-brand-dark hover:underline">
            {a.backToTeams}
          </button>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">{pick(team.name)}</h1>
        </div>
      </div>

      {/* Big month calendar — days with attendance are lit up; tap any to mark. */}
      <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <p className="mb-3 text-sm text-muted">{pick({ ar: "اضغط على أي يوم لتسجيل الحضور.", he: "לחצו על יום כדי לרשום נוכחות.", en: "Tap any day to take attendance." })}</p>
        <Calendar
          selected={dayDate ?? undefined}
          onSelect={openDay}
          isMarked={(d) => recordByDate.has(d)}
          dayBadge={(d) => {
            const c = dayCounts(d);
            if (!c) return null;
            return (
              <span className="rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">
                {c.present}/{c.marked}
              </span>
            );
          }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border-2 border-brand-200 bg-brand-50" /> {pick({ ar: "يوجد حضور", he: "יש נוכחות", en: "Has attendance" })}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded ring-2 ring-brand/30" /> {pick({ ar: "اليوم", he: "היום", en: "Today" })}</span>
        </div>
      </div>

      {/* Summary grid: rows = players, columns = recorded dates */}
      {recordsLoading ? (
        <p className="mt-6 text-sm text-muted">{t.admin.loading}</p>
      ) : dates.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{a.noRecords}</p>
      ) : (
        <>
          <p className="mt-8 text-xs text-muted">{a.gridHint}</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="sticky start-0 z-10 bg-surface px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    {a.player}
                  </th>
                  {dates.map((d) => (
                    <th key={d} className="px-3 py-3 text-center text-xs font-semibold text-muted" dir="ltr">
                      <button type="button" onClick={() => openDay(d)} className="hover:text-brand hover:underline">{shortDate(d)}</button>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">{a.rate}</th>
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map((p) => {
                  let present = 0;
                  let marked = 0;
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="sticky start-0 z-10 bg-white px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="size-8 shrink-0 overflow-hidden rounded-full">
                            <ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} />
                          </span>
                          <span className="whitespace-nowrap font-medium text-ink">
                            {p.number && <span className="me-1 text-xs text-muted">#{p.number}</span>}
                            {pick(p.name)}
                          </span>
                        </div>
                      </td>
                      {dates.map((d) => {
                        const st = recordByDate.get(d)?.statuses[p.id];
                        if (st) marked++;
                        if (st === "present") present++;
                        return (
                          <td key={d} className="px-3 py-2.5 text-center">
                            {st === "present" ? (
                              <span className="text-emerald-600">✓</span>
                            ) : st === "absent" ? (
                              <span className="text-rose-600">✗</span>
                            ) : (
                              <span className="text-line">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-muted">
                        {marked ? `${Math.round((present / marked) * 100)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Day roster sheet — tap ✓ / ✗ per player, then save. */}
      <Modal open={!!dayDate} onClose={() => setDayDate(null)} title={dayTitle} className="max-w-md">
        {dayDate && (
          <div>
            {(() => {
              const rec = recordByDate.get(dayDate);
              return rec?.coachId && coachById(rec.coachId) ? (
                <p className="mb-2 text-xs text-muted">{a.takenBy}: {pick(coachById(rec.coachId)!.name)}</p>
              ) : null;
            })()}

            {teamPlayers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{a.dayNoRecords}</p>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {pick({ ar: "حاضر", he: "נוכחים", en: "Present" })}: <span className="text-emerald-600">{presentNow}</span> / {teamPlayers.length}
                  </span>
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
                        <span className="size-9 shrink-0 overflow-hidden rounded-full">
                          <ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} />
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-ink">
                          {p.number && <span className="me-1 text-xs text-muted">#{p.number}</span>}
                          {pick(p.name)}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, "present")}
                            aria-label="present"
                            className={`grid size-9 place-items-center rounded-lg border-2 text-base font-bold transition ${st === "present" ? "border-emerald-500 bg-emerald-500 text-white" : "border-line text-emerald-600 hover:border-emerald-400"}`}
                          >✓</button>
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, "absent")}
                            aria-label="absent"
                            className={`grid size-9 place-items-center rounded-lg border-2 text-base font-bold transition ${st === "absent" ? "border-rose-500 bg-rose-500 text-white" : "border-line text-rose-600 hover:border-rose-400"}`}
                          >✗</button>
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
