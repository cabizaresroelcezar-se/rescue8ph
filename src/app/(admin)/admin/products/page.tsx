import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, Plus, Pencil, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn } from "@/lib/motion";
import { formatDatePh } from "@/lib/format";

const STATUS_TONE: Record<string, string> = {
  ACTIVE:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  DRAFT:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  ARCHIVED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products, count } = await supabase
    .from("products")
    .select("id, title, slug, price, status, featured, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch all product→category assignments for the visible products,
  // plus the category names, so we can render chips per row.
  const productIds = (products ?? []).map((p) => p.id);
  const { data: categoryLinks } = productIds.length
    ? await supabase
        .from("product_categories")
        .select("product_id, categories:categories(id, name, slug)")
        .in("product_id", productIds)
    : { data: [] };

  const categoriesByProduct = new Map<
    string,
    Array<{ id: string; name: string; slug: string }>
  >();
  for (const link of categoryLinks ?? []) {
    const l = link as {
      product_id: string;
      categories:
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;
    };
    const cats = Array.isArray(l.categories)
      ? l.categories
      : l.categories
        ? [l.categories]
        : [];
    categoriesByProduct.set(
      l.product_id,
      cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count != null
              ? `${count.toLocaleString()} product${count === 1 ? "" : "s"} in catalog`
              : "Manage your product catalog"}
          </p>
        </div>
        <ButtonLink href="/admin/products/new">
          <Plus className="h-4 w-4" />
          Add Product
        </ButtonLink>
      </FadeIn>

      {!products || products.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No products yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first product.
          </p>
        </FadeIn>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Categories</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Featured</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((product) => {
                const cats = categoriesByProduct.get(product.id) ?? [];
                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {product.title}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {cats.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {cats.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                              title={`/${c.slug}`}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      PHP {product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_TONE[product.status] ??
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                          <Star className="h-3 w-3" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDatePh(product.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={`Edit ${product.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}