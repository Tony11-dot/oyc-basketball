"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, Localized } from "../types";
import { DEFAULT_LOCALE, LOCALES, dictionaries, type Dict } from "./dictionary";

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  /** Resolve a localized value to the active language, falling back to any
   * filled language (ar → he → en) so a name typed in one language is always
   * visible in every UI language. */
  pick: (value: Localized) => string;
  locales: Locale[];
  /** Re-fetch the admin text overrides (call after saving them in the admin). */
  refreshOverrides: () => void;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "oyc.locale";

function isLocale(v: string | null): v is Locale {
  return v === "ar" || v === "he" || v === "en";
}

// Deep-merge admin text overrides (a flat map of "a.b.c" → Localized) onto the
// built-in dictionary for one language. Only paths that already exist in the
// dictionary are replaced, so overrides can never inject stray keys.
function applyOverrides(base: Dict, overrides: Record<string, Localized>, locale: Locale): Dict {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return base;
  const clone = JSON.parse(JSON.stringify(base)) as Dict;
  for (const path of keys) {
    const val = overrides[path]?.[locale];
    if (!val) continue;
    const parts = path.split(".");
    let node: Record<string, unknown> | null = clone as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const next = node[parts[i]];
      if (!next || typeof next !== "object") {
        node = null;
        break;
      }
      node = next as Record<string, unknown>;
    }
    if (node && parts[parts.length - 1] in node) node[parts[parts.length - 1]] = val;
  }
  return clone;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [overrides, setOverrides] = useState<Record<string, Localized>>({});

  // Restore saved preference after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) setLocaleState(saved);
  }, []);

  // Load admin text overrides so every dictionary string reflects admin edits.
  const refreshOverrides = useCallback(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => setOverrides(d.content?.overrides ?? {}))
      .catch(() => {});
  }, []);
  useEffect(() => {
    refreshOverrides();
  }, [refreshOverrides]);

  // Keep <html lang/dir> in sync with the active language.
  useEffect(() => {
    const dir = dictionaries[locale].dir;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore storage failures (private mode etc.) */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const t = applyOverrides(dictionaries[locale], overrides, locale);
    return {
      locale,
      setLocale,
      t,
      pick: (v) => v?.[locale]?.trim() || v?.ar?.trim() || v?.he?.trim() || v?.en?.trim() || "",
      locales: LOCALES,
      refreshOverrides,
    };
  }, [locale, setLocale, overrides, refreshOverrides]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <LanguageProvider>");
  return ctx;
}
