"use client";

import * as React from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

const STORAGE_KEY = "r8-cookie-consent-v1";

export function CookieConsent() {
  const visible = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      try {
        return !localStorage.getItem(STORAGE_KEY);
      } catch {
        return true;
      }
    },
    () => false,
  );

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    window.dispatchEvent(new Event("storage"));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] border-t border-border bg-card p-4 shadow-elev-4">
      <div className="container-wide flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              We use essential cookies
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Only necessary cookies for authentication and site functionality.
              No tracking, no advertising cookies.{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}