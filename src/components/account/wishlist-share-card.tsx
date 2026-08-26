"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Share2, Copy, Check, X, RotateCw, Link as LinkIcon } from "lucide-react";
import {
  getOrCreateShareLink,
  revokeShareLink,
  type ShareLinkResult,
} from "@/features/wishlist/share-actions";

/**
 * Share card on /account/wishlist — surfaces the active share URL and
 * supports copy / revoke / re-create flows.
 *
 * The card is compact when closed (one button) and expands inline to
 * reveal the URL, Copy, and Revoke actions. No modal needed — keeps the
 * UX light and accessible.
 */
export interface WishlistShareCardProps {
  /** Existing active share link, if any (server-fetched). */
  initialLink: ShareLinkResult | null;
  /** Number of items in the wishlist (shown in the prompt to nudge sharing). */
  itemCount: number;
}

export function WishlistShareCard({ initialLink, itemCount }: WishlistShareCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [link, setLink] = React.useState<ShareLinkResult | null>(initialLink);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Build the full URL on the client (uses window.location.origin so it
  // works in dev, preview, and prod without env vars).
  const fullUrl = React.useMemo(() => {
    if (!link) return "";
    if (typeof window === "undefined") return link.path;
    return `${window.location.origin}${link.path}`;
  }, [link]);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const result = await getOrCreateShareLink();
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to create share link");
      return;
    }
    setLink(result.result);
    setExpanded(true);
  }

  async function handleRevoke() {
    if (!link) return;
    setBusy(true);
    setError(null);
    const result = await revokeShareLink(link.token);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to revoke link");
      return;
    }
    setLink(null);
    setExpanded(false);
    router.refresh();
  }

  async function handleCopy() {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / insecure contexts
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setError("Copy failed — select the URL manually.");
      } finally {
        document.body.removeChild(input);
      }
    }
  }

  function handleShareNative() {
    if (!fullUrl || typeof navigator === "undefined" || !("share" in navigator)) {
      return;
    }
    try {
      navigator
        .share({
          title: "My Rescue 8 wishlist",
          text: `Check out my wishlist (${itemCount} item${itemCount === 1 ? "" : "s"})`,
          url: fullUrl,
        })
        .catch(() => undefined);
    } catch {
      // user cancelled — ignore
    }
  }

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Add a few products and you can share your wishlist with a single link.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elev-1">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Share2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">Share your wishlist</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Generate a single link to {itemCount === 1 ? "send a friend" : "share with family"}{" "}
            your {itemCount} saved item{itemCount === 1 ? "" : "s"}. They don&rsquo;t need an account.
          </p>
        </div>
      </div>

      {!link ? (
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy}
          className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? (
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          Generate share link
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            {expanded ? "Hide link" : "Show link"}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3">
              <div className="flex items-stretch gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  onClick={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground"
                  aria-label="Share URL"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  title="Copy URL"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {typeof navigator !== "undefined" &&
                  typeof navigator.canShare === "function" && (
                    <button
                      type="button"
                      onClick={handleShareNative}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share via…
                    </button>
                  )}
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={busy}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/40 bg-background px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  title="Stop sharing — anyone with this link will lose access"
                >
                  {busy ? (
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Revoke link
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
