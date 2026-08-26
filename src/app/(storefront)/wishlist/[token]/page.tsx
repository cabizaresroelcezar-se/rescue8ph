import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn } from "@/lib/motion";
import { formatCurrency } from "@/lib/format";
import { getMediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await params; // touch params so the type contract is honored
  return {
    title: "A shared wishlist \u00b7 Rescue 8 Philippines",
    description:
      "Someone shared their saved products with you. Browse the picks and add the ones you want.",
    robots: { index: false, follow: true },
  };
}

export default async function SharedWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validate the UUID early — saves a DB roundtrip if the URL is malformed.
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(token)) notFound();

  const supabase = await createClient();

  // RLS will hide revoked/expired rows for anon calls — single query, no
  // need for an explicit revoked_at/expires_at filter.
  const { data: link } = await supabase
    .from("wishlist_share_links")
    .select("id, user_id")
    .eq("id", token)
    .maybeSingle();

  if (!link) notFound();

  const ownerId = (link as { id: string; user_id: string }).user_id;

  if (!ownerId) notFound();

  const { data: rows } = await supabase
    .from("wishlist")
    .select(
      "product_id, product:products(id, title, slug, price, compare_at_price, status, short_description, product_images(storage_path, alt_text, is_primary, sort_order))",
    )
    .eq("user_id", ownerId);

  type ImgRow = {
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  };
  type ProductRow = {
    id: string;
    title: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    status: string;
    short_description: string | null;
    product_images: ImgRow[] | ImgRow;
  };

  const products = (rows ?? [])
    .map((row) => {
      const prod = Array.isArray(row)
        ? (row[0] as unknown as ProductRow | null)
        : ((row as { product: ProductRow | ProductRow[] | null }).product as
            | ProductRow
            | ProductRow[]
            | null);
      return prod && !Array.isArray(prod) ? prod : null;
    })
    .filter((p): p is ProductRow => Boolean(p))
    .filter((p) => p.status === "ACTIVE")
    .map((p) => {
      const imgs: ImgRow[] = Array.isArray(p.product_images)
        ? p.product_images
        : p.product_images
          ? [p.product_images]
          : [];
      const sorted = [...imgs].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.sort_order - b.sort_order;
      });
      const primary = sorted[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        compare_at_price: p.compare_at_price,
        short_description: p.short_description,
        imageSrc: primary ? getMediaUrl(primary.storage_path) : null,
        imageAlt: primary?.alt_text ?? p.title,
      };
    });

  return (
    <div className="bg-surface">
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-14">
          <FadeIn className="max-w-2xl">
            <p className="text-eyebrow">Shared Wishlist</p>
            <h1 className="mt-2 text-display-lg text-foreground">
              {products.length === 0
                ? "This wishlist is empty"
                : products.length === 1
                  ? "1 saved product"
                  : `${products.length} saved products`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length === 0
                ? "The owner hasn't added anything yet. Check back later, or browse the catalog."
                : "These are someone&rsquo;s picks from our catalog. Tap a card to view details, or save your favorites to your own wishlist."}
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container-page py-10">
        {products.length === 0 ? (
          <FadeIn className="rounded-2xl border border-dashed border-border bg-card p-12 text-center sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-display-sm text-foreground">
              Nothing here yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Browse the full catalog and save the gear that calls to you.
            </p>
            <ButtonLink href="/products" className="mt-6">
              Browse products
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </FadeIn>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const discount =
                p.compare_at_price && p.compare_at_price > p.price
                  ? Math.round(
                      ((p.compare_at_price - p.price) / p.compare_at_price) *
                        100,
                    )
                  : 0;
              return (
                <FadeIn
                  key={p.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3"
                >
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-surface to-surface/40">
                      {p.imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageSrc}
                          alt={p.imageAlt}
                          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground shadow-elev-1">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="border-t border-border p-4">
                      <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                        {p.title}
                      </h3>
                      {p.short_description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {p.short_description}
                        </p>
                      )}
                      <div className="mt-3 flex items-baseline gap-2">
                        <p className="text-base font-bold text-foreground">
                          {formatCurrency(p.price)}
                        </p>
                        {discount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(p.compare_at_price!)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        )}

        <FadeIn className="mt-12 flex justify-center">
          <ButtonLink href="/products" variant="outline" size="lg">
            <ArrowRight className="h-3.5 w-3.5" />
            Explore the full catalog
          </ButtonLink>
        </FadeIn>
      </div>
    </div>
  );
}
