"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Wraps useRouter().refresh with a debounce so that rapid-fire clicks
 * (publish/unpublish/delete) don't each trigger an immediate server
 * re-fetch. Useful for admin actions where one click should "settle"
 * the UI before another fetch happens.
 *
 * Also returns a flag `pending` so the caller can show a cooldown
 * indicator while the refresh is being scheduled.
 */
export function useDelayedRefresh(delayMs = 600) {
  const router = useRouter();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, setPending] = React.useState(false);

  const refresh = React.useCallback(() => {
    setPending(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      router.refresh();
      setPending(false);
    }, delayMs);
  }, [router, delayMs]);

  // Flush on unmount so a late refresh still goes through
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { refresh, pending };
}