import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn, Stagger } from "@/lib/motion";
import { SortSelect } from "@/components/shop/sort-select";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { createMetadata } from "@/lib/seo";
import { getMediaUrl } from "@/lib/media";

export const metadata = createMetadata({
  title: "Products",
  description: "Browse EMS, rescue, safety, and first aid equipment from Rescue 8 Philippines.",
  path: "/products",
});

type SortOption = "new" | "price-asc" | "price-desc" | "popular";
type StockOption = "any" | "in-stock";
type OnSaleOption = "any" | "on-sale";

type SearchParams = {
  category?: string;
  q?: string;
  sort?: SortOption;
  min?: string;
  max?: string;
  stock?: StockOption;
  sale?: OnSaleOption;
  page?: string;
};

const PAGE_SIZE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Parse numeric params safely
  const min = params.min ? Math.max(0, Number(params.min)) : null;
  const max = params.max ? Math.max(0, Number(params.max)) : null;
  const stock = params.stock === "in-stock" ? "in-stock" : "any";
  const sale = params.sale === "on-sale" ? "on-sale" : "any";
  const sort: SortOption = params.sort ?? "new";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ----- Build base query -----
  let query = supabase
    .from("products")
    .select(
      "id, title, slug, short_description, price, compare_at_price, featured, created_at",
      { count: "exact" },
    )
    .eq("status", "ACTIVE");

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,short_description.ilike.%${params.q}%`,
    );
  }

  if (min !== null) query = query.gte("price", min);
  if (max !== null) query = query.lte("price", max);

  if (sale === "on-sale") {
    query = query.not("compare_at_price", "is", null).gt("compare_at_price", 0);
    // compare_at_price > price filters to actual discounts
  }

  // In-stock: only products that have at least one variant with stock > 0
  let inStockProductIds: string[] | null = null;
  if (stock === "in-stock") {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("status", "ACTIVE")
      .gt("stock", 0);
    inStockProductIds = Array.from(
      new Set((variants ?? []).map((v) => v.product_id as string)),
    );
    if (inStockProductIds.length === 0) {
      // Force empty result
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", inStockProductIds);
    }
  }

  // Category filter (joins via product_categories)
  if (params.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .eq("status", "PUBLISHED")
      .single();

    if (category) {
      const { data: productIds } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", category.id);

      if (productIds && productIds.length > 0) {
        query = query.in(
          "id",
          productIds.map((p) => p.product_id),
        );
      } else {
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  // ----- Sort + pagination -----
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      query = query
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "new":
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  // ----- Run all queries in parallel -----
  const [{ data: products, count: totalCount }, { data: categories }] =
    await Promise.all([
      query,
      supabase
        .from("categories")
        .select("name, slug")
        .eq("status", "PUBLISHED")
        .order("name"),
    ]);

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));

  // ----- Hydrate product images + wishlist in parallel -----
  const productIds = (products ?? []).map((p) => p.id);
  const [
    { data: imageRows },
    { data: { user } },
    wishlistResult,
  ] = await Promise.all([
    productIds.length
      ? supabase
          .from("product_images")
          .select("product_id, storage_path, alt_text, is_primary, sort_order")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase.auth.getUser(),
    productIds.length
      ? supabase
          .from("wishlist")
          .select("product_id")
          .in("product_id", productIds)
      : Promise.resolve({ data: [] }),
  ]);

  const imageByProduct: Record<string, { src: string; alt: string }> = {};
  for (const img of imageRows ?? []) {
    const url = getMediaUrl(img.storage_path);
    if (!url) continue;
    const existing = imageByProduct[img.product_id];
    if (!existing || img.is_primary) {
      imageByProduct[img.product_id] = { src: url, alt: img.alt_text || "" };
    }
  }

  const savedSet = new Set(
    (wishlistResult.data ?? [])
      .filter((w) => user && (w as { user_id?: string }).user_id === user.id)
      .map((w) => (w as { product_id: string }).product_id),
  );

  const activeCategory = categories?.find((c) => c.slug === params.category);

  // ----- Build active-filter chips -----
  const chips: { label: string; removeHref: string }[] = [];
  if (params.q)
    chips.push({ label: `“${params.q}”`, removeHref: buildHref(params, { q: undefined }) });
  if (params.category)
    chips.push({ label: activeCategory?.name ?? params.category, removeHref: buildHref(params, { category: undefined }) });
  if (min !== null)
    chips.push({ label: `₱${min.toLocaleString("en-PH")}+`, removeHref: buildHref(params, { min: undefined }) });
  if (max !== null)
    chips.push({ label: `Under ₱${max.toLocaleString("en-PH")}`, removeHref: buildHref(params, { max: undefined }) });
  if (stock === "in-stock")
    chips.push({ label: "In stock only", removeHref: buildHref(params, { stock: undefined }) });
  if (sale === "on-sale")
    chips.push({ label: "On sale", removeHref: buildHref(params, { sale: undefined }) });

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-surface">
        <div className="container-page py-10">
          <Breadcrumbs
            items={[
              { label: "Products", href: "/products" },
              ...(activeCategory ? [{ label: activeCategory.name }] : []),
            ]}
          />
          <FadeIn className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">
                {activeCategory ? activeCategory.name : "All Products"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeCategory
                  ? `Browse our ${activeCategory.name.toLowerCase()} collection.`
                  : "EMS, rescue, and safety equipment for first responders nationwide."}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalCount !== null && (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {products?.length ?? 0}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {totalCount}
                  </span>{" "}
                  {totalCount === 1 ? "product" : "products"}
                </>
              )}
            </p>
          </FadeIn>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="border-b border-border bg-background">
          <div className="container-page flex flex-wrap items-center gap-2 py-4">
            <Pill href="/products" active={!params.category} label="All" />
            {categories.map((cat) => (
              <Pill
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                active={params.category === cat.slug}
                label={cat.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="border-b border-border bg-secondary/30">
          <div className="container-page flex flex-wrap items-center gap-2 py-3 text-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active filters:
            </span>
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.removeHref}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {chip.label}
                <X className="h-3 w-3" aria-hidden />
              </Link>
            ))}
            <Link
              href="/products"
              className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Link>
          </div>
        </div>
      )}

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            categories={categories ?? []}
            activeCategory={params.category}
            min={params.min}
            max={params.max}
            stock={stock}
            sale={sale}
          />
        </aside>

        <section>
          <div className="mb-6 flex items-center justify-between gap-3">
            <MobileFilters
              categories={categories ?? []}
              activeCategory={params.category}
              min={params.min}
              max={params.max}
              stock={stock}
              sale={sale}
            />
            <div className="ml-auto">
              <SortSelect value={sort} />
            </div>
          </div>

          {!products || products.length === 0 ? (
            <EmptyState
              hasFilters={
                Boolean(params.q) ||
                Boolean(params.category) ||
                min !== null ||
                max !== null ||
                stock !== "any" ||
                sale !== "any"
              }
            />
          ) : (
            <>
              <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => {
                  const image = imageByProduct[p.id] ?? null;
                  return (
                    <FadeIn key={p.id}>
                      <ProductCard
                        id={p.id}
                        slug={p.slug}
                        title={p.title}
                        short_description={p.short_description}
                        price={p.price}
                        compare_at_price={p.compare_at_price}
                        featured={p.featured}
                        image={image}
                        initialSaved={savedSet.has(p.id)}
                      />
                    </FadeIn>
                  );
                })}
              </Stagger>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <PaginationLink
                    href={page > 1 ? buildHref(params, { page: String(page - 1) }) : "#"}
                    disabled={page <= 1}
                    label="Previous"
                  />
                  <span className="text-sm text-muted-foreground">
                    Page <strong className="text-foreground">{page}</strong> of{" "}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <PaginationLink
                    href={
                      page < totalPages
                        ? buildHref(params, { page: String(page + 1) })
                        : "#"
                    }
                    disabled={page >= totalPages}
                    label="Next"
                  />
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function buildHref(
  current: SearchParams,
  overrides: Partial<SearchParams>,
): string {
  const merged = { ...current, ...overrides };
  // Strip undefined / empty values
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "" && v !== "any") {
      cleaned[k] = String(v);
    }
  }
  // Always reset to page 1 when changing filters (except when explicitly setting page)
  if (!("page" in overrides)) {
    delete cleaned.page;
  }
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `/products?${qs}` : "/products";
}

// ============================================================================
// Sub-components
// ============================================================================

function Pill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-elev-1"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary")
      }
    >
      {label}
    </Link>
  );
}

function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function FilterPanel({
  categories,
  activeCategory,
  min,
  max,
  stock,
  sale,
}: {
  categories: { name: string; slug: string }[];
  activeCategory?: string;
  min?: string;
  max?: string;
  stock: StockOption;
  sale: OnSaleOption;
}) {
  return (
    <div className="sticky top-24 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Categories</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li>
            <Link
              href="/products"
              aria-current={!activeCategory ? "page" : undefined}
              className={
                "block rounded-md px-2.5 py-1.5 transition-colors " +
                (!activeCategory
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
            >
              All
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/products?category=${c.slug}`}
                aria-current={activeCategory === c.slug ? "page" : undefined}
                className={
                  "block rounded-md px-2.5 py-1.5 transition-colors " +
                  (activeCategory === c.slug
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Availability</h2>
        <Link
          href={stock === "in-stock" ? "/products" : "/products?stock=in-stock"}
          className={
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
            (stock === "in-stock"
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground")
          }
        >
          <span
            className={
              "inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border " +
              (stock === "in-stock"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border")
            }
          >
            {stock === "in-stock" && "✓"}
          </span>
          In stock only
        </Link>
      </div>

      {/* On sale */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Deals</h2>
        <Link
          href={sale === "on-sale" ? "/products" : "/products?sale=on-sale"}
          className={
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
            (sale === "on-sale"
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground")
          }
        >
          <span
            className={
              "inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border " +
              (sale === "on-sale"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border")
            }
          >
            {sale === "on-sale" && "✓"}
          </span>
          On sale only
        </Link>
      </div>

      <form action="/products" method="get" className="space-y-3">
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory} />
        )}
        {stock === "in-stock" && <input type="hidden" name="stock" value="in-stock" />}
        {sale === "on-sale" && <input type="hidden" name="sale" value="on-sale" />}
        <h2 className="text-sm font-semibold text-foreground">Price (PHP)</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="min">Minimum</label>
          <input
            id="min"
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={min ?? ""}
            placeholder="Min"
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <span className="text-muted-foreground">–</span>
          <label className="sr-only" htmlFor="max">Maximum</label>
          <input
            id="max"
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={max ?? ""}
            placeholder="Max"
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Apply
        </button>
      </form>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
      <h3 className="text-base font-semibold text-foreground">No products found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? "We couldn't find anything matching your filters. Try clearing them or contact us for a custom order."
          : "There are no products available right now. Please check back later."}
      </p>
      {hasFilters && (
        <div className="mt-6">
          <ButtonLink href="/products">Clear filters</ButtonLink>
        </div>
      )}
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted-foreground/50">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {label}
    </Link>
  );
}