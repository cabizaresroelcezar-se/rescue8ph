"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";
const SIZE_PX: Record<Size, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * StarRating — read-only display of a star rating.
 *
 * Use for product cards, review summaries, etc. For interactive rating
 * input use StarRatingInput.
 */
export function StarRating({
  value,
  size = "sm",
  max = 5,
  showValue,
  className,
}: {
  value: number;
  size?: Size;
  max?: number;
  showValue?: boolean;
  className?: string;
}) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));
  const half = value - filled >= 0.25 && value - filled < 0.75;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const isFilled = idx <= filled;
        const isHalf = idx === filled + 1 && half;
        return (
          <Star
            key={i}
            className={cn(
              SIZE_PX[size],
              isFilled || isHalf
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
            aria-hidden
          />
        );
      })}
      {showValue && (
        <span className="ml-1 text-xs font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

/**
 * StarRatingInput — interactive 1–5 star selector.
 */
export function StarRatingInput({
  value,
  onChange,
  size = "md",
  max = 5,
  name,
  required,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: Size;
  max?: number;
  name?: string;
  required?: boolean;
}) {
  const [hover, setHover] = React.useState(0);
  const display = hover || value;

  return (
    <span
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= display;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === idx}
            aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(idx)}
            onFocus={() => setHover(idx)}
            onClick={() => onChange(idx)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(
                SIZE_PX[size],
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}
    </span>
  );
}