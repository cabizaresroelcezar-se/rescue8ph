"use client";

import * as React from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <p className="mt-4 text-eyebrow text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">
        We hit a snag rendering this page.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        An unexpected error occurred while loading this admin page. You can
        try again, or head back to the dashboard.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          ref: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
        <ButtonLink href="/admin" variant="outline" size="sm">
          <Home className="h-3.5 w-3.5" />
          Dashboard
        </ButtonLink>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-left text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Common causes</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>A required table (e.g. pages, page_sections) is missing.</li>
          <li>
            Your admin role was removed — sign out and back in to refresh
            your session.
          </li>
          <li>
            A stale browser tab from before the latest deploy — hard
            refresh (Ctrl+Shift+R) usually clears it.
          </li>
        </ul>
        <p className="mt-3">
          Still stuck?{" "}
          <Link
            href="/admin/pages"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Go to all pages
          </Link>
          .
        </p>
      </div>
    </div>
  );
}