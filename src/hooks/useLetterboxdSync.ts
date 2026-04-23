import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Title } from "@/hooks/useTitles";

type LetterboxdEntry = { title: string; year: number | null; watchedAt: string | null };

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, "and")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const SYNC_CACHE_KEY = "letterboxd-sync-last-run";
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * On mount, if the current user is the owner of any titles, fetch the
 * Letterboxd RSS feed and mark matching titles as watched. Throttled to
 * once per hour via localStorage so we don't spam the function on every
 * page navigation.
 */
export function useLetterboxdSync(titles: Title[] | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (!user || !titles || titles.length === 0) return;

    // Only the owner can update titles (RLS). Skip for everyone else.
    const ownsAny = titles.some((t) => t.user_id === user.id);
    if (!ownsAny) return;

    // Throttle
    try {
      const last = localStorage.getItem(SYNC_CACHE_KEY);
      if (last && Date.now() - parseInt(last, 10) < SYNC_INTERVAL_MS) return;
    } catch {
      // ignore
    }

    ranRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("letterboxd-watched");
        if (error || !data?.entries) return;

        const entries = data.entries as LetterboxdEntry[];
        const watchedKeys = new Set<string>();
        for (const e of entries) {
          const n = normalise(e.title);
          if (!n) continue;
          watchedKeys.add(n);
          if (e.year) watchedKeys.add(`${n}|${e.year}`);
        }

        // Find owned, currently-unwatched leaf titles that match
        const parentIds = new Set(titles.filter((t) => t.parent_id).map((t) => t.parent_id));
        const candidates = titles.filter(
          (t) =>
            t.user_id === user.id &&
            !t.watched &&
            // Leaf title (either has a parent, or is not a parent of anything)
            (t.parent_id || !parentIds.has(t.id)),
        );

        const toMark: string[] = [];
        for (const t of candidates) {
          const n = normalise(t.title);
          if (!n) continue;
          const yearKey = t.year ? `${n}|${t.year}` : null;
          if ((yearKey && watchedKeys.has(yearKey)) || watchedKeys.has(n)) {
            toMark.push(t.id);
          }
        }

        if (toMark.length > 0) {
          const { error: updErr } = await supabase
            .from("titles")
            .update({ watched: true })
            .in("id", toMark);
          if (!updErr) {
            qc.invalidateQueries({ queryKey: ["titles"] });
          }
        }

        try {
          localStorage.setItem(SYNC_CACHE_KEY, Date.now().toString());
        } catch {
          // ignore
        }
      } catch {
        // Silent — sync is best-effort
      }
    })();
  }, [user, titles, qc]);
}
