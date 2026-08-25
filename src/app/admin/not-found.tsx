"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { FileQuestion, ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <FileQuestion className="h-8 w-8" />
      </div>
      <p className="mt-4 text-eyebrow text-muted-foreground">Error 404</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">
        Resource not found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The item you&apos;re looking for may have been deleted, or the URL
        may be stale.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/admin" size="sm">
          Dashboard
        </ButtonLink>
        <ButtonLink href="/admin/pages" variant="outline" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> All pages
        </ButtonLink>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </button>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-left text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Common causes</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>The page was deleted in another tab.</li>
          <li>
            Your admin session expired or you no longer have staff access
            — try signing out and back in.
          </li>
          <li>
            You followed a link to <code className="rounded bg-background px-1">/admin/pages/&lt;slug&gt;</code>{" "}
            but the route uses the page&apos;s UUID, not its slug.
          </li>
        </ul>
        <p className="mt-3">
          Lost?{" "}
          <Link
            href="/admin"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Return to admin home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}