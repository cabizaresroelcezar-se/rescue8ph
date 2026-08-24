import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  image?: { src: string; alt: string } | null;
  className?: string;
};

function StarRating({ rating = 4.6, count = 0 }: { rating?: number; count?: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="inline-flex items-center gap-1" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i <= full
                ? "fill-amber-400 text-amber-400"
                : i === full + 1 && partial > 0
                ? "fill-amber-400/50 text-amber-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">
        {rating.toFixed(1)}
        {count > 0 && <span className="text-muted-foreground/70"> ({count})</span>}
      </span>
    </div>
  );
}

export function ProductCard({
  slug,
  title,
  short_description,
  price,
  compare_at_price,
  featured,
  rating = 4.6,
  reviewCount,
  inStock = true,
  image,
  className,
}: ProductCardProps) {
  const discount =
    compare_at_price && compare_at_price > price
      ? Math.round(((compare_at_price - price) / compare_at_price) * 100)
      : null;

  return (
    <Link
      href={`/products/${slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-elev-1",
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)]",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-elev-3",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-surface to-surface/40">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-[var(--duration-slower)] ease-[var(--ease-out-quart)] group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-light text-muted-foreground/30">+</span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground shadow-elev-1">
              Featured
            </span>
          )}
          {discount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background shadow-elev-1">
              −{discount}%
            </span>
          )}
        </div>

        {/* Top-right wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground opacity-0 shadow-elev-1 backdrop-blur transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] hover:text-rose-500 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Bottom quick-add bar (slides in on hover) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground/95 px-3 py-2.5 text-xs font-semibold text-background shadow-elev-2 backdrop-blur transition-transform duration-[var(--duration-fast)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick add
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {/* In-stock indicator */}
          {inStock && (
            <span
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-success"
              aria-label="In stock"
            >
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              <span className="hidden sm:inline">In stock</span>
            </span>
          )}
        </div>

        {short_description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {short_description}
          </p>
        )}

        <StarRating rating={rating} count={reviewCount} />

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold tracking-tight text-foreground">
            ₱{price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">
              ₱{compare_at_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}