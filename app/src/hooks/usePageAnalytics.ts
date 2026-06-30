/**
 * Page Visit Tracker
 *
 * Sends a hit to Yandex.Metrica and records the page view in our own
 * analytics table on every route change. Safe to call inside App.tsx.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { trpc } from "@/providers/trpc";

declare global {
  interface Window {
    ym?: (counterId: number, eventName: string, ...args: unknown[]) => void;
  }
}

const YM_COUNTER_ID = 110269497;

export function usePageAnalytics() {
  const { pathname } = useLocation();
  const track = trpc.analytics.trackVisit.useMutation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    // Skip admin area completely — it shouldn't pollute public site analytics.
    if (pathname.startsWith("/admin")) return;

    // Yandex.Metrica: track SPA route change
    if (typeof window.ym === "function") {
      window.ym(YM_COUNTER_ID, "hit", `/#${pathname}`);
    }

    // Self-hosted analytics
    track.mutate({
      path: pathname,
      referrer: document.referrer || undefined,
    });
  }, [pathname, track]);
}
