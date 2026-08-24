import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn, Stagger } from "@/lib/motion";
import { SortSelect } from "@/components/shop/sort-select";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Products",
  description: "Browse EMS, rescue, safety, and first aid equipment from Rescue 8 Philippines.",
  path: "/products",
});

type SearchParams = {
  category?: string;
  q?: string;
  sort?: "new" | "price-asc" | "price-desc" | "popular";
  min?: string;
  max?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, title, slug, short_description, price, compare_at_price, featured, created_at"
    )
    .eq("status", "ACTIVE");

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,short_description.ilike.%${params.q}%`
    );
  }

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
          productIds.map((p) => p.product_id)
        );
      } else {
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  if (params.min) query = query.gte("price", Number(params.min));
  if (params.max) query = query.lte("price", Number(params.max));

  switch (params.sort) {
    case "price-asc":  query = query.order("price", { ascending: true });  break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    case "popular":
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "new":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase
      .from("categories")
      .select("name, slug")
      .eq("status", "PUBLISHED")
      .order("name"),
  ]);

  const activeCategory = categories?.find((c) => c.slug === params.category);

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
              <span className="font-semibold text-foreground">
                {products?.length ?? 0}
              </span>{" "}
              {products?.length === 1 ? "product" : "products"}
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

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            categories={categories ?? []}
            activeCategory={params.category}
            min={params.min}
            max={params.max}
          />
        </aside>

        <section>
          <div className="mb-6 flex items-center justify-between gap-3">
            <MobileFilters
              categories={categories ?? []}
              activeCategory={params.category}
              min={params.min}
              max={params.max}
            />
            <div className="ml-auto">
              <SortSelect value={params.sort ?? "new"} />
            </div>
          </div>

          {!products || products.length === 0 ? (
            <EmptyState />
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <FadeIn key={p.id}>
                  <ProductCard
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    short_description={p.short_description}
                    price={p.price}
                    compare_at_price={p.compare_at_price}
                    featured={p.featured}
                  />
                </FadeIn>
              ))}
            </Stagger>
          )}
        </section>
      </div>
    </div>
  );
}

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
}: {
  categories: { name: string; slug: string }[];
  activeCategory?: string;
  min?: string;
  max?: string;
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

      <form action="/products" method="get" className="space-y-3">
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory} />
        )}
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

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
      <h3 className="text-base font-semibold text-foreground">No products found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        We couldn&apos;t find anything matching your filters. Try clearing them or
        contact us for a custom order.
      </p>
      <div className="mt-6">
        <ButtonLink href="/products">Clear filters</ButtonLink>
      </div>
    </div>
  );
}
