import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  featured?: boolean;
  image?: { src: string; alt: string } | null;
  className?: string;
};

export function ProductCard({
  slug,
  title,
  short_description,
  price,
  compare_at_price,
  featured,
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
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-elev-1",
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)]",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-3",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-quart)] group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-light text-muted-foreground/30">+</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {featured && (
            <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground shadow-elev-1">
              Featured
            </span>
          )}
          {discount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background shadow-elev-1">
              <BadgePercent className="h-3 w-3" />
              {discount}% off
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground/90 px-3 py-2 text-xs font-medium text-background shadow-elev-2 backdrop-blur">
            <ShoppingCart className="h-3.5 w-3.5" />
            Quick view
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </h3>
        {short_description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {short_description}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-foreground">
            PHP {price.toFixed(2)}
          </span>
          {compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">
              PHP {compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
