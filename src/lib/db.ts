// Storage layer. In production it uses Upstash Redis (Vercel KV); locally — when
// no KV env vars are set — it falls back to JSON files so dev keeps working.
// Everything goes through these helpers so the backend stays swappable.
import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { AdminSettings, AttendanceRecord, Coach, Highlight, Player, Receipt, Registration, SiteContent, Team } from "./types";
import { demoCoaches, demoGallery, demoHighlights, demoPlayers, demoStaff, demoTeams, demoVolunteers } from "./demoData";
import { seedAttendance, seedCoaches, seedHighlights, seedPlayers, seedReceipts, seedRegistrations, seedTeams, seedContent } from "./seed";

const useRedis = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

type RedisClient = import("@upstash/redis").Redis;
let _redis: RedisClient | null = null;
async function redis(): Promise<RedisClient> {
  if (_redis) return _redis;
  const { Redis } = await import("@upstash/redis");
  _redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  return _redis;
}

// Local-dev file storage (only used when Redis isn't configured).
const DATA_DIR = process.env.VERCEL ? "/tmp/oyc-data" : path.join(process.cwd(), "data");

// Serialise writes per-key to avoid lost updates within a single instance.
const locks = new Map<string, Promise<unknown>>();

// ---- Sample-data purge --------------------------------------------------------
// Earlier versions seeded sample teams/players/coaches/etc. into a fresh
// database. Any stored copy the admin never touched is removed on read (and the
// cleaned value written back). Anything the admin edited — even a single field —
// no longer matches and is kept as their own data.

/** JSON with sorted keys, so equality doesn't depend on property order. */
function stable(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, (val as Record<string, unknown>)[k]]))
      : val,
  );
}

/** Drops list items identical to the sample item with the same id. */
function withoutDemo<T extends { id: string }>(list: T[], demo: T[]): T[] {
  const byId = new Map(demo.map((d) => [d.id, stable(d)]));
  const out = list.filter((item) => byId.get(item.id) !== stable(item));
  return out.length === list.length ? list : out;
}

function purgeTeams(teams: Team[]): Team[] {
  let changed = false;
  const out: Team[] = [];
  for (const t of teams) {
    const demo = demoTeams.find((d) => d.id === t.id);
    if (!demo) {
      out.push(t);
      continue;
    }
    // Strip untouched sample fixtures, then drop the team itself if what's left
    // is still just the untouched sample team (roster links aside — those only
    // pointed at sample players/coaches).
    const matches = withoutDemo(t.matches, demo.matches);
    const rest = (x: Team) => stable({ ...x, playerIds: [], coachIds: [], matches: [] });
    if (matches.length === 0 && rest(t) === rest(demo)) {
      changed = true;
      continue;
    }
    if (matches !== t.matches) changed = true;
    out.push(matches === t.matches ? t : { ...t, matches });
  }
  return changed ? out : teams;
}

function purgeContent(c: SiteContent): SiteContent {
  const gallery = c.gallery && withoutDemo(c.gallery, demoGallery);
  const staff = c.staff && withoutDemo(c.staff, demoStaff);
  const volunteers = c.volunteers && withoutDemo(c.volunteers, demoVolunteers);
  return gallery === c.gallery && staff === c.staff && volunteers === c.volunteers
    ? c
    : { ...c, gallery, staff, volunteers };
}

const PURGE: Record<string, (v: never) => unknown> = {
  players: (v: Player[]) => withoutDemo(v, demoPlayers),
  coaches: (v: Coach[]) => withoutDemo(v, demoCoaches),
  highlights: (v: Highlight[]) => withoutDemo(v, demoHighlights),
  teams: purgeTeams,
  content: purgeContent,
};

async function read<T>(key: string, fallback: T): Promise<T> {
  const val = await readRaw<T>(key, fallback);
  const purge = PURGE[key] as ((v: T) => T) | undefined;
  if (!purge) return val;
  const cleaned = purge(val);
  if (cleaned !== val) {
    try {
      await write(key, cleaned);
    } catch {
      /* serve the cleaned view regardless */
    }
  }
  return cleaned;
}

async function readRaw<T>(key: string, fallback: T): Promise<T> {
  if (useRedis) {
    const r = await redis();
    const val = await r.get<T>(key);
    if (val == null) {
      await r.set(key, fallback);
      return fallback;
    }
    return val;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function write<T>(key: string, value: T): Promise<void> {
  if (useRedis) {
    const r = await redis();
    await r.set(key, value);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `${key}.json`), JSON.stringify(value, null, 2), "utf8");
}

/** Run a read-modify-write against a key under a per-key lock. */
async function mutate<T>(key: string, fn: (current: T) => T | Promise<T>, fallback: T): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  locks.set(key, prev.then(() => next));
  await prev;
  try {
    const current = await read<T>(key, fallback);
    const updated = await fn(current);
    await write(key, updated);
    return updated;
  } finally {
    release();
  }
}

// ---- Registrations ----------------------------------------------------------

export const getRegistrations = () => read<Registration[]>("registrations", seedRegistrations);

export const updateRegistrations = (fn: (list: Registration[]) => Registration[]) =>
  mutate<Registration[]>("registrations", fn, seedRegistrations);

// ---- Players (shared roster pool) -------------------------------------------

export const getPlayers = () => read<Player[]>("players", seedPlayers);

export const updatePlayers = (fn: (list: Player[]) => Player[]) =>
  mutate<Player[]>("players", fn, seedPlayers);

// ---- Coaches (shared pool) --------------------------------------------------

export const getCoaches = () => read<Coach[]>("coaches", seedCoaches);

export const updateCoaches = (fn: (list: Coach[]) => Coach[]) =>
  mutate<Coach[]>("coaches", fn, seedCoaches);

// ---- Attendance -------------------------------------------------------------

export const getAttendance = () => read<AttendanceRecord[]>("attendance", seedAttendance);

export const updateAttendance = (fn: (list: AttendanceRecord[]) => AttendanceRecord[]) =>
  mutate<AttendanceRecord[]>("attendance", fn, seedAttendance);

// ---- Teams ------------------------------------------------------------------

/**
 * Teams are always served with their rosters sanitized: any playerIds/coachIds
 * that no longer resolve to an existing player/coach are dropped, so counts and
 * lists are accurate everywhere (admin, public site, coach portal). When stale
 * ids are found the cleanup is also written back, permanently healing the data.
 */
export async function getTeams(): Promise<Team[]> {
  const [teams, players, coaches] = await Promise.all([
    read<Team[]>("teams", seedTeams),
    read<Player[]>("players", seedPlayers),
    read<Coach[]>("coaches", seedCoaches),
  ]);
  const pids = new Set(players.map((p) => p.id));
  const cids = new Set(coaches.map((c) => c.id));
  // Backfill home/away on older matches saved before that field existed: a
  // recorded contact person only ever makes sense for an away fixture, so its
  // presence is the signal; everything else defaults to a home game.
  const healMatch = (m: Team["matches"][number]): Team["matches"][number] => {
    if (m.isHome !== undefined) return m;
    const hasContact = Boolean(m.contactName?.ar || m.contactName?.he || m.contactName?.en || m.contactPhone);
    return { ...m, isHome: !hasContact };
  };
  const clean = (t: Team): Team => {
    const playerIds = t.playerIds.filter((id) => pids.has(id));
    const coachIds = (t.coachIds ?? []).filter((id) => cids.has(id));
    const matches = t.matches.map(healMatch);
    const matchesChanged = matches.some((m, i) => m !== t.matches[i]);
    return playerIds.length !== t.playerIds.length || coachIds.length !== (t.coachIds ?? []).length || matchesChanged
      ? { ...t, playerIds, coachIds, matches }
      : t;
  };
  const cleaned = teams.map(clean);
  if (cleaned.some((t, i) => t !== teams[i])) {
    // Self-heal in storage (re-filter inside the lock so a concurrent update
    // isn't clobbered). Never let a healing hiccup break the read path.
    try {
      await mutate<Team[]>("teams", (cur) => cur.map(clean), seedTeams);
    } catch {
      /* serve the cleaned view regardless */
    }
  }
  return cleaned;
}

export const updateTeams = (fn: (list: Team[]) => Team[]) =>
  mutate<Team[]>("teams", fn, seedTeams);

// ---- Highlights -------------------------------------------------------------

export const getHighlights = () => read<Highlight[]>("highlights", seedHighlights);

export const updateHighlights = (fn: (list: Highlight[]) => Highlight[]) =>
  mutate<Highlight[]>("highlights", fn, seedHighlights);

// ---- Site content -----------------------------------------------------------

export const getContent = () => read<SiteContent>("content", seedContent);

export const updateContent = (fn: (c: SiteContent) => SiteContent) =>
  mutate<SiteContent>("content", fn, seedContent);

// ---- Receipts ---------------------------------------------------------------

export const getReceipts = () => read<Receipt[]>("receipts", seedReceipts);

export const updateReceipts = (fn: (list: Receipt[]) => Receipt[]) =>
  mutate<Receipt[]>("receipts", fn, seedReceipts);

// ---- Admin settings ---------------------------------------------------------

export const getSettings = () => read<AdminSettings>("settings", {});

export const updateSettings = (fn: (s: AdminSettings) => AdminSettings) =>
  mutate<AdminSettings>("settings", fn, {});
