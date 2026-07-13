"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ImageBlock } from "@/components/ui/ImageBlock";
import { DateField } from "@/components/ui/Calendar";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import type { AttendanceStatus, Coach, Player, Team } from "@/lib/types";

// Local "YYYY-MM-DD" for today (computed client-side after mount).
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type View = "loading" | "login" | "teams" | "attendance";

export default function CoachPortal() {
  const { t, pick } = useI18n();
  const c = t.coach;
  const toast = useToast();

  const [view, setView] = useState<View>("loading");
  const [coach, setCoach] = useState<Coach | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // login form
  const [idNumber, setIdNumber] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // attendance taking
  const [team, setTeam] = useState<Team | null>(null);
  const [date, setDate] = useState("");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastTaken, setLastTaken] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const d = await fetch("/api/coach/session", { cache: "no-store" }).then((r) => r.json());
      if (d.coach) {
        setCoach(d.coach);
        setTeams(d.teams ?? []);
        setPlayers(d.players ?? []);
        setView("teams");
      } else {
        setView("login");
      }
    } catch {
      setView("login");
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  const playerById = (id: string) => players.find((p) => p.id === id);
  const teamPlayers = (tm: Team): Player[] => tm.playerIds.map(playerById).filter((p): p is Player => !!p);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setSigningIn(true);
    try {
      const res = await fetch("/api/coach/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber }),
      });
      if (!res.ok) { setLoginError(c.wrong); return; }
      setIdNumber("");
      await loadSession();
    } catch {
      setLoginError(c.error);
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    await fetch("/api/coach/logout", { method: "POST" });
    setCoach(null);
    setTeams([]);
    setPlayers([]);
    setView("login");
  }

  // Open a team's attendance sheet for a given date: load any existing record,
  // defaulting every roster player to "present" when none is saved.
  const openSheet = useCallback(async (tm: Team, forDate: string, roster: Player[]) => {
    let saved: Record<string, AttendanceStatus> = {};
    let updatedAt: string | null = null;
    try {
      const d = await fetch(`/api/attendance?teamId=${tm.id}&date=${forDate}`, { cache: "no-store" }).then((r) => r.json());
      const rec = (d.records ?? [])[0];
      if (rec) { saved = rec.statuses ?? {}; updatedAt = rec.updatedAt ?? null; }
    } catch { /* ignore — start fresh */ }
    const next: Record<string, AttendanceStatus> = {};
    for (const p of roster) next[p.id] = saved[p.id] ?? "present";
    setStatuses(next);
    setLastTaken(updatedAt);
  }, []);

  const rosterOf = (tm: Team, list: Player[]) =>
    tm.playerIds.map((id) => list.find((p) => p.id === id)).filter((p): p is Player => !!p);

  async function chooseTeam(tm: Team) {
    const d = todayISO();
    setTeam(tm);
    setDate(d);
    setView("attendance");
    // Pull the latest roster so it always matches the admin (players a coach was
    // just given / removed show up without needing a full reload).
    let freshPlayers = players;
    let freshTm = tm;
    try {
      const s = await fetch("/api/coach/session", { cache: "no-store" }).then((r) => r.json());
      if (s?.coach) {
        setTeams(s.teams ?? []);
        setPlayers(s.players ?? []);
        freshPlayers = s.players ?? [];
        freshTm = (s.teams ?? []).find((x: Team) => x.id === tm.id) ?? tm;
        setTeam(freshTm);
      }
    } catch { /* offline → use what we have */ }
    openSheet(freshTm, d, rosterOf(freshTm, freshPlayers));
  }

  function changeDate(d: string) {
    setDate(d);
    if (team && d) openSheet(team, d, rosterOf(team, players));
  }

  const setAll = (status: AttendanceStatus) => {
    if (!team) return;
    const next: Record<string, AttendanceStatus> = {};
    for (const p of teamPlayers(team)) next[p.id] = status;
    setStatuses(next);
  };

  async function submit() {
    if (!team || !date) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, date, statuses }),
      });
      if (!res.ok) throw new Error();
      const { record } = await res.json();
      setLastTaken(record?.updatedAt ?? null);
      toast.success(c.submitted);
    } catch {
      toast.error(c.error);
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Loading --------------------------------------------------------------
  if (view === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="size-6 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  // ---- Login ----------------------------------------------------------------
  if (view === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-card"
        >
          <div className="flex justify-center"><Logo className="h-32" /></div>
          <h1 className="mt-6 text-center text-2xl font-extrabold text-ink">{c.loginTitle}</h1>
          <p className="mt-1 text-center text-sm text-muted">{c.loginSubtitle}</p>
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{c.idLabel}</span>
              <input
                autoFocus
                dir="ltr"
                inputMode="numeric"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                placeholder={c.idPlaceholder}
              />
            </label>
            {loginError && <p className="text-sm font-medium text-rose-600">{loginError}</p>}
            <Button type="submit" disabled={signingIn} className="w-full">
              {signingIn ? c.signingIn : c.signIn}
            </Button>
          </form>
          <div className="mt-4 flex justify-center"><LanguageSwitcher /></div>
        </motion.div>
      </div>
    );
  }

  // ---- Header shared by teams + attendance ----------------------------------
  const header = (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Logo className="h-9" />
        {coach && <span className="text-sm font-semibold text-ink">{pick(coach.name)}</span>}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button type="button" onClick={signOut} className="text-sm font-semibold text-rose-600">{c.signOut}</button>
      </div>
    </header>
  );

  // ---- Teams ----------------------------------------------------------------
  if (view === "teams") {
    return (
      <div className="min-h-screen bg-surface">
        {header}
        <main className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-extrabold text-ink">{c.myTeamsTitle}</h1>
          <p className="mt-1 text-sm text-muted">{c.myTeamsSubtitle}</p>
          {teams.length === 0 ? (
            <p className="mt-8 text-sm text-muted">{c.noTeams}</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {teams.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => chooseTeam(tm)}
                  className="group overflow-hidden rounded-2xl border border-line bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="overflow-hidden" style={{ aspectRatio: tm.aspectRatio ?? "16 / 10" }}>
                    <ImageBlock src={tm.image} alt={pick(tm.name)} rounded="rounded-none" objectPosition={tm.imagePosition} />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-bold text-ink">{pick(tm.name)}</p>
                      <p className="mt-0.5 text-xs text-muted">{tm.playerIds.length} {t.teams.players}</p>
                    </div>
                    <span className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white transition group-hover:bg-brand-dark">
                      {c.takeAttendance}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ---- Attendance taking ----------------------------------------------------
  const roster = team ? teamPlayers(team) : [];
  const presentCount = roster.filter((p) => statuses[p.id] === "present").length;
  return (
    <div className="min-h-screen bg-surface pb-28">
      {header}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <button type="button" onClick={() => setView("teams")} className="text-sm font-semibold text-brand-dark hover:underline">
          {c.backToTeams}
        </button>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">{team && pick(team.name)}</h1>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-56">
            <DateField label={c.dateLabel} value={date} onChange={(v) => v && changeDate(v)} />
          </div>
          <div className="flex gap-2">
            <Button variant="subtle" size="sm" onClick={() => setAll("present")}>{c.markAllPresent}</Button>
            <Button variant="secondary" size="sm" onClick={() => setAll("absent")}>{c.clearAll}</Button>
          </div>
        </div>

        {lastTaken && (
          <p className="mt-2 text-xs text-muted">{c.lastTaken}: {new Date(lastTaken).toLocaleString()}</p>
        )}

        {roster.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{c.noPlayers}</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {roster.map((p) => {
              const st = statuses[p.id];
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm">
                  <span className="size-11 shrink-0 overflow-hidden rounded-full">
                    <ImageBlock src={p.image} alt={pick(p.name)} icon="user" rounded="rounded-none" objectPosition={p.imagePosition} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {p.number && <span className="me-1 text-xs text-muted">#{p.number}</span>}
                      {pick(p.name)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label={c.present}
                      onClick={() => setStatuses((s) => ({ ...s, [p.id]: "present" }))}
                      className={`grid size-11 place-items-center rounded-xl text-lg font-bold transition ${st === "present" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      aria-label={c.absent}
                      onClick={() => setStatuses((s) => ({ ...s, [p.id]: "absent" }))}
                      className={`grid size-11 place-items-center rounded-xl text-lg font-bold transition ${st === "absent" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}`}
                    >
                      ✗
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Sticky submit bar */}
      {roster.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">
              <span className="text-emerald-600">{presentCount}</span> / {roster.length} {c.present}
            </span>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? c.submitting : c.submit}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
