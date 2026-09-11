"use client";

import * as React from "react";
import {
  Link2,
  Check,
  Share2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Messenger redirects to R8PH Facebook page
  const messengerUrl = "https://m.me/rescue8tradingphils";

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

      {/* Messenger — redirects to R8PH Facebook Messenger */}
      <a
        href={messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonBase}
        aria-label="Message Rescue 8 on Messenger"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Message us</span>
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
