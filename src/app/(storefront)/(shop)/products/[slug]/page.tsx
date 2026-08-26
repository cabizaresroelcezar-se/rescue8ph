import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Shield, Truck, RotateCcw, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn, Stagger } from "@/lib/motion";
import { createMetadata, productSchema, breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { getMediaUrl } from "@/lib/media";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewForm } from "@/components/shop/review-form";
import { ReviewList, ReviewHistogram } from "@/components/shop/review-list";
import { TrackProductView } from "@/components/shop/track-product-view";
import { getReviewStats } from "@/features/reviews/actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("title, short_description, seo_title, seo_description, slug, price")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .single();

  if (!product) return {};

  return createMetadata({
    title: product.seo_title || product.title,
    description: product.seo_description || product.short_description || undefined,
    path: `/products/${product.slug}`,
    type: "website",
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .single();

  if (!product) notFound();

  const [{ data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("product_categories")
      .select("category:categories(name, slug)")
      .eq("product_id", product.id),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order"),
  ]);

  // Related: same category, exclude this product
  let related: { product: ProductCardLite | ProductCardLite[] }[] = [];
  if (categories && categories.length > 0) {
    const firstCatSlug = (Array.isArray(categories[0].category)
      ? categories[0].category[0]
      : categories[0].category)?.slug;

    if (firstCatSlug) {
      const { data: catRow } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", firstCatSlug)
        .single();

      if (catRow) {
        const { data } = await supabase
          .from("product_categories")
          .select(
            "product:products(id, title, slug, short_description, price, compare_at_price, featured)"
          )
          .eq("category_id", catRow.id)
          .neq("product_id", product.id)
          .limit(4);
        if (data) related = data as typeof related;
      }
    }
  }

  const galleryImages = (images ?? [])
      .map((i) => ({
        src: getMediaUrl(i.storage_path) ?? "",
        alt: i.alt_text || product.title,
      }))
      .filter((i) => i.src !== "");

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100
        )
      : null;

  // Fetch primary images for the related products
    const relatedIds = related
      .map((r) => (Array.isArray(r.product) ? r.product[0]?.id : r.product?.id))
      .filter((id): id is string => Boolean(id));
    const { data: relatedImages } = relatedIds.length
          ? await supabase
              .from("product_images")
              .select("product_id, storage_path, alt_text, is_primary, sort_order")
              .in("product_id", relatedIds)
              .order("sort_order", { ascending: true })
          : { data: [] };
        const relatedImageByProduct: Record<string, { src: string; alt: string }> = {};
        for (const img of relatedImages ?? []) {
          const url = getMediaUrl(img.storage_path);
          if (!url) continue;
          const existing = relatedImageByProduct[img.product_id];
          if (!existing || img.is_primary) {
            relatedImageByProduct[img.product_id] = { src: url, alt: img.alt_text || "" };
          }
        }

        // ----- Reviews -----
                const [
                  { data: { user: reviewUser } },
                  reviewStats,
                  { data: reviews },
                ] = await Promise.all([
                  supabase.auth.getUser(),
                  getReviewStats(product.id),
                  supabase
                    .from("product_reviews")
                    .select(
                      "id, rating, title, body, is_verified_purchase, created_at, author:profiles!product_reviews_user_id_fkey(first_name, last_name, display_name)",
                    )
                    .eq("product_id", product.id)
                    .eq("status", "APPROVED")
                    .order("created_at", { ascending: false })
                    .limit(20),
                ]);
                const ownReviewResult = reviewUser
                  ? await supabase
                      .from("product_reviews")
                      .select("id, rating, title, body, status")
                      .eq("product_id", product.id)
                      .eq("user_id", reviewUser.id)
                      .maybeSingle()
                  : { data: null };

    return (
      <div className="bg-background pb-28 md:pb-10">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...productSchema({
              title: product.title,
              description: product.short_description || product.title,
              price: product.price,
              slug: product.slug,
            }),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...breadcrumbSchema([
              { name: "Products", url: "/products" },
              { name: product.title, url: `/products/${product.slug}` },
            ]),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...organizationSchema(),
          }),
        }}
      />
      <TrackProductView productId={product.id} />
      <div className="border-b border-border bg-surface">
        <div className="container-page py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {categories?.map((c, i) => {
              const cat = Array.isArray(c.category) ? c.category[0] : c.category;
              if (!cat) return null;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </span>
              );
            })}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <FadeIn>
          <ProductGallery images={galleryImages} title={product.title} />
        </FadeIn>

        <FadeIn delay={80} className="lg:sticky lg:top-24 lg:self-start">
          {categories && categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {categories.map((c, i) => {
                const cat = Array.isArray(c.category)
                  ? c.category[0]
                  : c.category;
                if (!cat) return null;
                return (
                  <Link
                    key={i}
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          )}

          <h1 className="text-display-md text-foreground">{product.title}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              PHP {product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  PHP {product.compare_at_price.toFixed(2)}
                </span>
                {discount && (
                  <span className="inline-flex h-6 items-center rounded-full bg-accent/10 px-2 text-xs font-semibold text-accent">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          {product.short_description && (
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {product.short_description}
            </p>
          )}

          <ul className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <TrustChip icon={Shield}    label="Authentic" />
            <TrustChip icon={Truck}     label="Nationwide" />
            <TrustChip icon={RotateCcw} label="Easy returns" />
            <TrustChip icon={Phone}     label="Expert help" />
          </ul>

          <div className="mt-7 hidden flex-wrap items-center gap-3 md:flex">
            <AddToCartButton productId={product.id} />
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-elev-1 transition-colors hover:bg-secondary"
            >
              Inquire to Order
            </Link>
          </div>

          {(product.sku ||
            product.weight_grams ||
            product.length_cm ||
            product.width_cm ||
            product.height_cm) && (
            <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card text-sm">
              {product.sku && <SpecRow label="SKU" value={product.sku} />}
              {product.weight_grams && (
                <SpecRow label="Weight" value={`${product.weight_grams} g`} />
              )}
              {(product.length_cm ||
                product.width_cm ||
                product.height_cm) && (
                <SpecRow
                  label="Dimensions"
                  value={`${product.length_cm || "—"} × ${product.width_cm || "—"} × ${product.height_cm || "—"} cm`}
                />
              )}
            </div>
          )}

          {product.description && (
            <details
              className="group mt-6 rounded-xl border border-border bg-card open:shadow-elev-2"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold text-foreground">
                Description
                <span
                  aria-hidden
                  className="text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>
            </details>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            For bulk orders and institutional purchases,{" "}
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              contact us directly
            </Link>{" "}
            for special pricing.
          </p>
        </FadeIn>
      </div>

      {/* Reviews */}
      <section className="border-t border-border bg-background">
        <div className="container-page py-12">
          <FadeIn className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">Customer reviews</p>
              <h2 className="mt-2 flex items-baseline gap-2 text-display-md text-foreground">
                <StarRating value={reviewStats.average} size="md" showValue />
                <span className="text-base font-normal text-muted-foreground">
                  {reviewStats.total === 0
                    ? "No reviews yet"
                    : `${reviewStats.total} review${reviewStats.total === 1 ? "" : "s"}`}
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar: histogram + write-a-review form */}
            <aside className="space-y-5">
              {reviewStats.total > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Rating breakdown
                  </h3>
                  <div className="mt-4">
                    <ReviewHistogram
                      counts={reviewStats.counts}
                      total={reviewStats.total}
                    />
                  </div>
                </div>
              )}

              {reviewUser ? (
                <ReviewForm
                  productId={product.id}
                  existing={
                    ownReviewResult.data
                      ? (ownReviewResult.data as {
                          id: string;
                          rating: number;
                          title: string | null;
                          body: string;
                          status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
                        })
                      : null
                  }
                />
              ) : (
                <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
                  <p className="text-sm text-muted-foreground">
                    <Link
                      href={`/auth/login?redirectTo=/products/${slug}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to write a review.
                  </p>
                </div>
              )}
            </aside>

            {/* Reviews list */}
            <div>
              <ReviewList
                reviews={(reviews ?? []).map((r) => ({
                  id: r.id as string,
                  rating: r.rating as number,
                  title: (r.title as string | null) ?? null,
                  body: r.body as string,
                  is_verified_purchase: r.is_verified_purchase as boolean,
                  created_at: r.created_at as string,
                  author: (() => {
                    const a = r.author;
                    if (!a) return null;
                    if (Array.isArray(a)) return (a[0] ?? null) as never;
                    return a as never;
                  })(),
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-page py-14">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-eyebrow">You may also need</p>
                <h2 className="mt-2 text-display-md text-foreground">Related Products</h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          {related
                            .map((r) => (Array.isArray(r.product) ? r.product[0] : r.product))
                            .filter((p): p is ProductCardLite => Boolean(p))
                            .map((p) => (
                              <FadeIn key={p.id}>
                                <ProductCard
                                  slug={p.slug}
                                  title={p.title}
                                  short_description={p.short_description}
                                  price={p.price}
                                  compare_at_price={p.compare_at_price}
                                  featured={p.featured}
                                  image={relatedImageByProduct[p.id] ?? null}
                                />
                              </FadeIn>
                            ))}
                        </Stagger>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {product.title}
            </p>
            <p className="text-base font-bold text-foreground">
              PHP {product.price.toFixed(2)}
            </p>
          </div>
          <AddToCartButton productId={product.id} size="md" />
        </div>
      </div>
    </div>
  );
}

type ProductCardLite = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  featured?: boolean;
};

function TrustChip({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-foreground">{label}</span>
    </li>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
