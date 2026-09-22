// Shared parsing helpers for the API route handlers.
import { randomUUID } from "crypto";
import type { Localized, Match } from "./types";

/** Coerce an arbitrary value into a full Localized record (trimmed). */
export function localized(v: unknown): Localized {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    ar: String(o.ar ?? "").trim(),
    he: String(o.he ?? "").trim(),
    en: String(o.en ?? "").trim(),
  };
}

/** Localized with per-field fallback (for PATCH partial updates). */
export function localizedWith(v: unknown, fallback: Localized): Localized {
  if (v == null) return fallback;
  const o = v as Record<string, unknown>;
  return {
    ar: String(o.ar ?? fallback.ar).trim(),
    he: String(o.he ?? fallback.he).trim(),
    en: String(o.en ?? fallback.en).trim(),
  };
}

/** Keep only non-empty string entries of an array. */
export function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
}

/** Parse an array of match objects, assigning ids to any that lack one. */
export function parseMatches(v: unknown): Match[] {
  if (!Array.isArray(v)) return [];
  return v.map((raw) => {
    const o = (raw ?? {}) as Record<string, unknown>;
    return {
      id: typeof o.id === "string" && o.id ? o.id : randomUUID(),
      opponent: localized(o.opponent),
      opponentNumber: typeof o.opponentNumber === "string" ? o.opponentNumber : undefined,
      opponentLogo: typeof o.opponentLogo === "string" ? o.opponentLogo : undefined,
      date: typeof o.date === "string" ? o.date : "",
      isHome: o.isHome !== false,
      where: localized(o.where),
      contactName: o.contactName != null ? localized(o.contactName) : undefined,
      contactPhone: typeof o.contactPhone === "string" ? o.contactPhone : undefined,
      ibbaLink: typeof o.ibbaLink === "string" ? o.ibbaLink : undefined,
    };
  });
}
