import { randomUUID } from "crypto";
import { getAttendance, getTeams, updateAttendance } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { getCurrentCoach } from "@/lib/coachAuth";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

// Coerce a raw statuses object into a clean {playerId: "present"|"absent"} map.
function parseStatuses(v: unknown): Record<string, AttendanceStatus> {
  const out: Record<string, AttendanceStatus> = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === "present" || val === "absent") out[k] = val;
    }
  }
  return out;
}

// GET — list attendance records, optionally filtered by ?teamId= and/or ?date=.
// Admins see everything; coaches see only their own teams.
export async function GET(request: Request) {
  const admin = await isAuthed();
  const coach = admin ? null : await getCurrentCoach();
  if (!admin && !coach) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const teamId = params.get("teamId");
  const date = params.get("date");

  let records = await getAttendance();
  if (coach) {
    const teams = await getTeams();
    const mine = new Set(teams.filter((t) => (t.coachIds ?? []).includes(coach.id)).map((t) => t.id));
    records = records.filter((r) => mine.has(r.teamId));
  }
  if (teamId) records = records.filter((r) => r.teamId === teamId);
  if (date) records = records.filter((r) => r.date === date);

  return Response.json({ records });
}

// POST — upsert the attendance sheet for a (teamId, date). Admin or a coach of
// that team may submit; re-submitting overwrites the day's statuses.
export async function POST(request: Request) {
  const admin = await isAuthed();
  const coach = admin ? null : await getCurrentCoach();
  if (!admin && !coach) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const teamId = typeof body.teamId === "string" ? body.teamId : "";
  const date = typeof body.date === "string" ? body.date.slice(0, 10) : "";
  if (!teamId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "teamId and a valid date are required" }, { status: 422 });
  }

  const teams = await getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return Response.json({ error: "Unknown team" }, { status: 404 });
  if (coach && !(team.coachIds ?? []).includes(coach.id)) {
    return Response.json({ error: "Not your team" }, { status: 403 });
  }

  const statuses = parseStatuses(body.statuses);
  const now = new Date().toISOString();
  const coachId = coach ? coach.id : typeof body.coachId === "string" ? body.coachId : undefined;

  let saved: AttendanceRecord | undefined;
  await updateAttendance((list) => {
    const idx = list.findIndex((r) => r.teamId === teamId && r.date === date);
    if (idx >= 0) {
      saved = { ...list[idx], statuses, coachId: coachId ?? list[idx].coachId, updatedAt: now };
      const next = [...list];
      next[idx] = saved;
      return next;
    }
    saved = { id: randomUUID(), teamId, date, coachId, statuses, createdAt: now, updatedAt: now };
    return [...list, saved];
  });

  return Response.json({ record: saved }, { status: 201 });
}
