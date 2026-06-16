"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AttendanceRecord, Coach, Player, Team } from "@/lib/types";

// Short day/month label for a "YYYY-MM-DD" string (e.g. "16/6").
function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
}

export default function AttendanceAdmin() {
  const { t, pick } = useI18n();
  const a = t.admin.attendance;
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [teamId, setTeamId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");

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
    setCalendarOpen(false);
    setCalendarDate("");
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

  const dayRecord = calendarDate ? recordByDate.get(calendarDate) ?? null : null;

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

  // ---- Selected team: grid + calendar ---------------------------------------
  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => setTeamId(null)} className="text-sm font-semibold text-brand-dark hover:underline">
            {a.backToTeams}
          </button>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">{pick(team.name)}</h1>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCalendarOpen((v) => !v)}>
          {calendarOpen ? a.closeCalendar : a.calendar}
        </Button>
      </div>

      {/* Calendar view */}
      {calendarOpen && (
        <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <label className="block max-w-xs">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{a.pickDate}</span>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>
          {calendarDate && (
            dayRecord ? (
              <div className="mt-4">
                {dayRecord.coachId && coachById(dayRecord.coachId) && (
                  <p className="mb-2 text-xs text-muted">{a.takenBy}: {pick(coachById(dayRecord.coachId)!.name)}</p>
                )}
                <ul className="divide-y divide-line">
                  {teamPlayers.map((p) => {
                    const st = dayRecord.statuses[p.id];
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-2">
                        <span className="size-9 shrink-0 overflow-hidden rounded-full">
                          <ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} />
                        </span>
                        <span className="flex-1 text-sm font-medium text-ink">{pick(p.name)}</span>
                        <StatusPill status={st} present={a.present} absent={a.absent} notMarked={a.notMarked} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">{a.dayNoRecords}</p>
            )
          )}
        </div>
      )}

      {/* Grid: rows = players, columns = dates */}
      {recordsLoading ? (
        <p className="mt-6 text-sm text-muted">{t.admin.loading}</p>
      ) : dates.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{a.noRecords}</p>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted">{a.gridHint}</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="sticky start-0 z-10 bg-surface px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    {a.player}
                  </th>
                  {dates.map((d) => (
                    <th key={d} className="px-3 py-3 text-center text-xs font-semibold text-muted" dir="ltr">
                      {shortDate(d)}
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
    </AdminShell>
  );
}

function StatusPill({ status, present, absent, notMarked }: { status?: "present" | "absent"; present: string; absent: string; notMarked: string }) {
  if (status === "present") return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">✓ {present}</span>;
  if (status === "absent") return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">✗ {absent}</span>;
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{notMarked}</span>;
}
