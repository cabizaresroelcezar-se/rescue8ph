import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn } from "@/lib/motion";
import { getMediaUrl } from "@/lib/media";
import { formatCurrency } from "@/lib/format";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistShareCard } from "@/components/account/wishlist-share-card";
import { getActiveShareLink } from "@/features/wishlist/share-actions";

export const metadata = {
  title: "My Wishlist \u00b7 Rescue 8 Philippines",
  description: "Items you saved for later.",
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/wishlist");
  }

  const { data: rows } = await supabase
    .from("wishlist")
    .select(
      "id, created_at, product:products(id, title, slug, price, compare_at_price, status, short_description, product_images(storage_path, alt_text, is_primary, sort_order))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (rows ?? [])
    .map((row) => {
      const prod = row.product as unknown as {
        id: string;
        title: string;
        slug: string;
        price: number;
        compare_at_price: number | null;
        status: string;
        short_description: string | null;
        product_images: Array<{
          storage_path: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
        }>;
      } | null;
      if (!prod) return null;
      const sorted = (prod.product_images ?? []).slice().sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      });
      const primary = sorted[0];
      const imageUrl = primary ? getMediaUrl(primary.storage_path) : null;
      return {
        id: row.id,
        productId: prod.id,
        slug: prod.slug,
        title: prod.title,
        price: prod.price,
        compare_at_price: prod.compare_at_price,
        status: prod.status,
        short_description: prod.short_description,
        image: imageUrl ? { src: imageUrl, alt: primary?.alt_text || prod.title } : null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // Check if this user has an active share link (server side, runs in
  // parallel with the wishlist load above via Promise.all-like fetches
  // we're doing inline; the data fetch is fast since it's a single PK).
  const activeShareLink = await getActiveShareLink();

  return (
    <div className="bg-surface">
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-eyebrow">My Account</p>
              <h1 className="mt-1 text-display-md text-foreground">
                My Wishlist
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length === 0
                  ? "Items you save will appear here."
                  : `${items.length} item${items.length === 1 ? "" : "s"} saved`}
              </p>
            </div>
            <ButtonLink href="/products" variant="outline" size="sm">
              Continue shopping
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </FadeIn>
        </div>
      </section>

      <div className="container-page py-10">
        {items.length === 0 ? (
          <FadeIn className="rounded-2xl border border-dashed border-border bg-card p-12 text-center sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-display-sm text-foreground">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Save items for later by tapping the heart icon on any product. They&apos;ll wait for you right here.
            </p>
            <ButtonLink href="/products" className="mt-6">
              Browse products
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </FadeIn>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const discount =
                item.compare_at_price && item.compare_at_price > item.price
                  ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)
                  : 0;
              return (
                <FadeIn
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3"
                >
                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-surface to-surface/40">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image.src}
                          alt={item.image.alt}
                          className="h-full w-full object-contain p-6 transition-transform duration-[var(--duration-slower)] group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-5xl font-light text-muted-foreground/30">
                            +
                          </span>
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background shadow-elev-1">
                          \u2212{discount}%
                        </span>
                      )}
                      {item.status !== "ACTIVE" && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {item.status}
                        </span>
                      )}
                      <div className="absolute right-3 top-3">
                        <WishlistButton productId={item.productId} initialSaved />
                      </div>
                    </div>
                    <div className="border-t border-border p-4">
                      <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.short_description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.short_description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-foreground">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <AddToCartButton
                          productId={item.productId}
                          className="flex-1 h-9 text-xs"
                        />
                        <Link
                          href={`/products/${item.slug}`}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-secondary"
                          aria-label={`View ${item.title}`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <WishlistShareCard
                initialLink={activeShareLink}
                itemCount={items.length}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}