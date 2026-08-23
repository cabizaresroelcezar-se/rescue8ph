import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  if (!product) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("product_categories")
    .select("category:categories(name, slug)")
    .eq("product_id", product.id);

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {" / "}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image area */}
        <div className="aspect-square rounded-lg border bg-surface flex items-center justify-center">
          {images && images.length > 0 ? (
            <Image
              src={images[0].storage_path}
              alt={images[0].alt_text || product.title}
              className="h-full w-full rounded-lg object-contain p-4"
            />
          ) : (
            <span className="text-6xl text-muted-foreground/20">+</span>
          )}
        </div>

        {/* Product info */}
        <div>
          {categories && categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {categories.map((c, i) => {
                const cat = Array.isArray(c.category) ? c.category[0] : c.category;
                if (!cat) return null;
                return (
                  <Link
                    key={i}
                    href={`/products?category=${cat.slug}`}
                    className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          )}

          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">PHP {product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">
                PHP {product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          )}

          {product.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Specs */}
          <div className="mt-6 space-y-2 border-t pt-4 text-sm">
            {product.sku && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
            )}
            {product.weight_grams && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{product.weight_grams}g</span>
              </div>
            )}
            {(product.length_cm || product.width_cm || product.height_cm) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium">
                  {product.length_cm || "—"} x {product.width_cm || "—"} x {product.height_cm || "—"} cm
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Inquire to Order
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-white px-8 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Back to Products
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            For bulk orders and institutional purchases, contact us directly for special pricing.
          </p>
        </div>
      </div>
    </div>
  );
}