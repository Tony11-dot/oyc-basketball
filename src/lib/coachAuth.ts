// Coach auth for the attendance portal. Lightweight, separate from the admin
// session: a coach signs in with their ID number, and we store their internal
// (unguessable) coach id in an httpOnly cookie. Every request re-checks that the
// coach still exists, so deleting a coach immediately revokes their access.
import "server-only";
import { cookies } from "next/headers";
import { getCoaches } from "./db";
import type { Coach } from "./types";

export const COACH_COOKIE = "oyc_coach";

/** Find a coach by the ID number they typed at login (trimmed, case-insensitive). */
export async function findCoachByIdNumber(idNumber: string): Promise<Coach | undefined> {
  const needle = idNumber.trim().toLowerCase();
  if (!needle) return undefined;
  const coaches = await getCoaches();
  return coaches.find((c) => (c.idNumber ?? "").trim().toLowerCase() === needle);
}

/** Set the coach session cookie to a coach's internal id. */
export async function setCoachSession(coachId: string): Promise<void> {
  const store = await cookies();
  store.set(COACH_COOKIE, coachId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export async function clearCoachSession(): Promise<void> {
  const store = await cookies();
  store.delete(COACH_COOKIE);
}

/** The signed-in coach, or null. Verifies the cookie id still maps to a coach. */
export async function getCurrentCoach(): Promise<Coach | null> {
  const store = await cookies();
  const id = store.get(COACH_COOKIE)?.value;
  if (!id) return null;
  const coaches = await getCoaches();
  return coaches.find((c) => c.id === id) ?? null;
}
