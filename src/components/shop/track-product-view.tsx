"use client";

import * as React from "react";
import { trackProductView } from "@/features/recently-viewed/actions";

/**
 * Client component that fires once when the user lands on a product page.
 * Tracks the view in the background (silently fails for anonymous visitors).
 * No visual UI.
 */
export function TrackProductView({ productId }: { productId: string }) {
  const tracked = React.useRef(false);

  React.useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    // Fire-and-forget; server action returns ok: true silently for anon.
    trackProductView(productId).catch(() => {
      // Silently ignore errors — tracking is best-effort.
    });
  }, [productId]);

  return null;
}