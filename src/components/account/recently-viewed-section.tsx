import Link from "next/link";
import { Clock } from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { getRecentlyViewed } from "@/features/recently-viewed/actions";
import { ClearRecentlyViewedButton } from "@/components/account/clear-recently-viewed-button";

const MAX_DISPLAY = 8;

export async function RecentlyViewedSection() {
  const items = await getRecentlyViewed();
  if (items.length === 0) return null;

  const display = items.slice(0, MAX_DISPLAY);

  return (
    <FadeIn delay={180} className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">For you</p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recently viewed
          </h2>
        </div>
        {items.length > 0 && <ClearRecentlyViewedButton />}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {display.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elev-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image.src}
                  alt={item.image.alt || item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground/40">
                  ?
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                {item.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                ₱{item.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </FadeIn>
  );
}