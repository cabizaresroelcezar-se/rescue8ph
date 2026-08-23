import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, title, slug, short_description, price, compare_at_price, featured")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  // Category filter
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
      }
    }
  }

  const { data: products } = await query;
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("status", "PUBLISHED")
    .order("name");

  const activeCategory = categories?.find((c) => c.slug === params.category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {activeCategory
            ? `Browse our ${activeCategory.name.toLowerCase()} collection`
            : "Browse our complete catalog of EMS, rescue, and safety equipment"}
        </p>
      </div>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !params.category
                ? "border-primary bg-primary text-white"
                : "border-border bg-white hover:bg-surface"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                params.category === cat.slug
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:bg-surface"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products grid */}
      {!products || products.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">No products found in this category yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re constantly adding new products. Check back soon or contact us for specific items.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group rounded-lg border bg-white p-4 transition-colors hover:border-primary"
            >
              <div className="aspect-square mb-3 rounded-md bg-surface flex items-center justify-center">
                <span className="text-4xl text-muted-foreground/30">+</span>
              </div>
              <h3 className="font-semibold group-hover:text-primary">{product.title}</h3>
              {product.short_description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {product.short_description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-bold">PHP {product.price.toFixed(2)}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    PHP {product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.featured && (
                <span className="mt-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  Featured
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}