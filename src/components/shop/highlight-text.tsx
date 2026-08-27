import * as React from "react";

export interface HighlightTextProps {
  text: string;
  query?: string | null;
  /** Highlights every match (default true); pass false to highlight only the first */
  highlightAll?: boolean;
  /** Pre-built class for the <mark> wrapper. Should be visually subtle: */
  className?: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps occurrences of `query` inside `text` with a <mark>. Case-insensitive.
 * Empty query → plain text. Safe for SSR (no client hooks).
 */
export function HighlightText({
  text,
  query,
  highlightAll = true,
  className = "bg-primary/15 text-foreground rounded px-0.5",
}: HighlightTextProps) {
  const q = (query ?? "").trim();
  if (!q) return <>{text}</>;

  const regex = new RegExp(
    `(${escapeRegex(q)})`,
    highlightAll ? "gi" : "i",
  );
  // If `highlightAll` is true we use `gi`, otherwise `i` — set case-aware later.
  const parts = text.split(regex);
  if (parts.length === 1) return <>{text}</>;

  // With split + capturing group, the matched chunks are at odd indices.
  const matcher = highlightAll ? new RegExp(escapeRegex(q), "gi") : new RegExp(escapeRegex(q), "i");
  const matchedValues = text.match(matcher) ?? [];

  return (
    <>
      {parts.map((part, i) => {
        if (i === 0) return <React.Fragment key={i}>{part}</React.Fragment>;
        const matched = matchedValues[i - 1] ?? part;
        const isHit = matched.toLowerCase() === q.toLowerCase();
        return isHit ? (
          <mark key={i} className={className}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        );
      })}
    </>
  );
}
