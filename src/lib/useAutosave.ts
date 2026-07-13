"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave with an undo stack. The page owns `value` (via useState);
 * this hook watches it and persists changes, then lets the user step back.
 *
 * - `onSave(value, prevSaved)` performs the write and returns the canonical
 *   persisted value (e.g. after a refetch that assigns real ids). Returning it
 *   keeps the baseline in sync so a save-induced state change never re-triggers.
 *   `prevSaved` is the last-saved value — handy for computing deletions.
 * - `paused` defers saving (e.g. while a detail modal is open); on unpause a
 *   pending change flushes.
 */
export function useAutosave<T>({
  value,
  setValue,
  onSave,
  ready,
  paused = false,
  delay = 900,
}: {
  value: T;
  setValue: (v: T) => void;
  onSave: (value: T, prevSaved: T) => Promise<T | void>;
  ready: boolean;
  paused?: boolean;
  delay?: number;
}) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [undoStack, setUndoStack] = useState<T[]>([]);

  const baseline = useRef<string | null>(null); // serialized last-saved value
  const saving = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTmr = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Establish the baseline once the initial data has loaded.
  useEffect(() => {
    if (ready && baseline.current === null) baseline.current = JSON.stringify(value);
  }, [ready, value]);

  const flush = useCallback(async () => {
    if (saving.current || baseline.current === null) return;
    const v = valueRef.current;
    if (JSON.stringify(v) === baseline.current) return;
    const prevSaved = JSON.parse(baseline.current) as T;
    const prevSerialized = baseline.current;
    saving.current = true;
    setSaveState("saving");
    try {
      const result = await onSave(v, prevSaved);
      const savedVal = (result == null ? v : result) as T;
      baseline.current = JSON.stringify(savedVal);
      setUndoStack((s) => [...s.slice(-24), JSON.parse(prevSerialized) as T]);
      setSaveState("saved");
      if (clearTmr.current) clearTimeout(clearTmr.current);
      clearTmr.current = setTimeout(() => setSaveState((st) => (st === "saved" ? "idle" : st)), 1600);
    } catch {
      setSaveState("error");
    } finally {
      saving.current = false;
      // Edits that landed mid-save → run once more.
      if (!pausedRef.current && baseline.current !== null && JSON.stringify(valueRef.current) !== baseline.current) {
        schedule();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSave]);

  const flushRef = useRef(flush);
  flushRef.current = flush;

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (!pausedRef.current) flushRef.current(); }, delay);
  }, [delay]);

  // Schedule when the value changes (and we're ready and not paused).
  useEffect(() => {
    if (!ready || baseline.current === null || paused) return;
    if (JSON.stringify(value) === baseline.current) return;
    schedule();
  }, [value, paused, ready, schedule]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const undo = useCallback(() => {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setValue(prev); // reverting counts as an edit → autosaves the revert
      return s.slice(0, -1);
    });
  }, [setValue]);

  return { saveState, undo, canUndo: undoStack.length > 0 };
}
