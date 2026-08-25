"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { formatDatePh } from "@/lib/format";

export interface ReviewListItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  author: { name: string | null; first_name: string | null; last_name: string | null } | null;
}

export function ReviewList({ reviews }: { reviews: ReviewListItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience with this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <article
          key={r.id}
          className="rounded-xl border border-border bg-card p-5 shadow-elev-1"
        >
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(r.author)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {displayName(r.author)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDatePh(new Date(r.created_at))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={r.rating} size="sm" />
              {r.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified buyer
                </span>
              )}
            </div>
          </header>

          {r.title && (
            <h4 className="mt-3 text-sm font-semibold text-foreground">
              {r.title}
            </h4>
          )}
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
            {r.body}
          </p>
        </article>
      ))}
    </div>
  );
}

export function ReviewHistogram({
  counts,
  total,
}: {
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}) {
  const bars: { rating: 5 | 4 | 3 | 2 | 1; count: number }[] = [
    { rating: 5, count: counts[5] },
    { rating: 4, count: counts[4] },
    { rating: 3, count: counts[3] },
    { rating: 2, count: counts[2] },
    { rating: 1, count: counts[1] },
  ];
  return (
    <div className="space-y-1.5">
      {bars.map((b) => {
        const pct = total === 0 ? 0 : Math.round((b.count / total) * 100);
        return (
          <div
            key={b.rating}
            className="flex items-center gap-2 text-xs"
          >
            <span className="w-3 shrink-0 text-right text-muted-foreground">
              {b.rating}
            </span>
            <StarRating value={1} size="xs" max={1} />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-muted-foreground">
              {b.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function initials(author: ReviewListItem["author"]): string {
  if (!author) return "?";
  const first = author.first_name?.trim();
  const last = author.last_name?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (author.name) return author.name.slice(0, 2).toUpperCase();
  return "?";
}

function displayName(author: ReviewListItem["author"]): string {
  if (!author) return "Anonymous";
  const first = author.first_name?.trim();
  const last = author.last_name?.trim();
  if (first && last) return `${first} ${last.charAt(0).toUpperCase()}.`;
  if (first) return first;
  if (author.name) {
    const parts = author.name.split(/[\s@]/);
    return parts[0] || "Anonymous";
  }
  return "Anonymous";
}