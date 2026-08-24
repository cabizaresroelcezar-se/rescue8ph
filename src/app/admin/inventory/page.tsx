import { createClient } from "@/lib/supabase/server";
import { Boxes, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";

type InventoryWithProduct = {
  id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_level: number;
  product: { id?: string; title: string; slug?: string; sku?: string | null }[] | { id?: string; title: string; slug?: string; sku?: string | null } | null;
};

const TONE = {
  out: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: inventory } = await supabase
    .from("inventory")
    .select(`
      id,
      quantity_on_hand,
      quantity_reserved,
      reorder_level,
      product:products(id, title, slug, sku)
    `)
    .order("quantity_on_hand", { ascending: true })
    .limit(50);

  const typedInventory = (inventory || []) as unknown as InventoryWithProduct[];

  const outCount = typedInventory.filter((i) => i.quantity_on_hand === 0).length;
  const lowCount = typedInventory.filter(
    (i) => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_level,
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track stock levels and manage inventory.
          </p>
        </div>
      </FadeIn>

      {/* Summary cards */}
      {typedInventory.length > 0 && (
        <Stagger className="grid gap-4 sm:grid-cols-3">
          <FadeIn className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Out of stock
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {outCount}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" /> Needs immediate reorder
            </p>
          </FadeIn>
          <FadeIn className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Low stock
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {lowCount}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-3 w-3" /> At or below reorder level
            </p>
          </FadeIn>
          <FadeIn className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total SKUs tracked
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {typedInventory.length}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" /> Showing 50 most recent
            </p>
          </FadeIn>
        </Stagger>
      )}

      {/* Table or empty state */}
      {typedInventory.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Boxes className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No inventory records yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Inventory is created when products are added with stock tracking.
          </p>
        </FadeIn>
      ) : (
        <FadeIn className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 text-right">On Hand</th>
                  <th className="px-5 py-3 text-right">Reserved</th>
                  <th className="px-5 py-3 text-right">Reorder Level</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {typedInventory.map((item) => {
                  const product = Array.isArray(item.product)
                    ? item.product[0]
                    : item.product;
                  const isOut = item.quantity_on_hand === 0;
                  const isLow =
                    !isOut && item.quantity_on_hand <= item.reorder_level;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-secondary/40"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Boxes className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {product?.title || "—"}
                            </p>
                            {product?.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                        {item.quantity_on_hand}
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground">
                        {item.quantity_reserved}
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground">
                        {item.reorder_level}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isOut ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE.out}`}
                          >
                            <AlertTriangle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE.low}`}
                          >
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE.ok}`}
                          >
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
