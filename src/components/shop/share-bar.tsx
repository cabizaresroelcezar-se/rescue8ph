"use client";

import * as React from "react";
import {
  Link2,
  Check,
  Share2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Inline Facebook f-icon — Lucide doesn't ship a Facebook glyph in this
 * build. Brand-faithful #1877F2 SVG, 24×24. */
function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="#1877F2"
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.018 1.791-4.683 4.533-4.683 1.313 0 2.686.235 2.686.235v2.969h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export interface ShareBarProps {
  /** The product URL to share (absolute or relative — absolute is preferred for FB/Messenger) */
  url: string;
  /** Short share text (e.g. "Go Bag — Rescue 8 Philippines") */
  text: string;
  className?: string;
  /** "row" (default) spreads buttons horizontally; "stack" puts them in a column */
  orientation?: "row" | "stack";
}

/**
 * Share bar — copy link + native share + Messenger + Facebook share.
 *
 * Uses navigator.share when available (mobile-friendly), falling back
 * to a copy-link button with tooltip feedback.
 *
 * URLs:
 *   - Copy: uses the modern Clipboard API with execCommand fallback
 *   - Facebook: opens sharer.php
 *   - Native: navigator.share() with title/text/url
 *   - Messenger: opens messenger.com with a "send link to a friend" intent
 */
export function ShareBar({
  url,
  text,
  className,
  orientation = "row",
}: ShareBarProps) {
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCopy() {
    setError(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-HTTPS / older browsers
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Copy failed");
    }
  }

  async function handleNative() {
    setError(null);
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title: text, text, url });
      } else {
        await handleCopy();
      }
    } catch {
      // user cancelled
    }
  }

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const messengerUrl = `https://m.me/?text=${encodeURIComponent(text + "\n" + url)}`;

  const buttonBase =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      className={cn(
        orientation === "stack"
          ? "flex flex-col items-stretch gap-2"
          : "flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {/* Copy link — primary action */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy link"}
        className={cn(
          buttonBase,
          copied && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        )}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Copy link
          </>
        )}
      </button>

      {/* Native share (mobile) */}
      <button
        type="button"
        onClick={handleNative}
        className={buttonBase}
        aria-label="Share via system dialog"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      {/* Messenger */}
      <a
        href={messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonBase}
        aria-label="Share via Messenger"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Messenger</span>
      </a>

      {/* Facebook */}
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonBase}
        aria-label="Share on Facebook"
      >
        <FacebookGlyph className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Facebook</span>
      </a>

      {error && (
        <p
          role="alert"
          className="basis-full text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
