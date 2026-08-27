import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes } from "lucide-react";

export interface LowStockItem {
  inventory_id: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  sku: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_level: number;
  /** available = quantity_on_hand - quantity_reserved */
  available: number;
}

export interface LowStockAlertProps {
  items: LowStockItem[];
}

/**
 * Low-stock alert widget — the top 5 most-depleted inventory rows.
 * Sorted by available-stock ascending (worst first), excludes
 * out-of-stock rows that are already showing on /admin/inventory.
 *
 * Empty state: shows a confirmation message; never renders the
 * section with "0 items" so a quiet day doesn't add noise.
 */
export function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-foreground">
            Inventory
          </h2>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          All tracked SKUs are above their reorder level — no action
          needed.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-elev-1">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">
            Low stock
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            {items.length}+
          </span>
        </div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          Manage
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <ul className="divide-y divide-border">
        {items.map((item) => {
          const severity =
            item.available <= 0
              ? "bg-destructive/10 text-destructive"
              : item.available <= Math.ceil(item.reorder_level / 2)
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
          return (
            <li key={item.inventory_id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${item.product_id}`}
                  className="block truncate text-xs font-medium text-foreground hover:text-primary"
                >
                  {item.product_title}
                </Link>
                {item.sku && (
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    SKU {item.sku}
                  </p>
                )}
              </div>
              <span
                className={
                  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                  severity
                }
              >
                {item.available} left
              </span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                /{item.reorder_level}
              </span>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-border px-4 py-2.5">
        <p className="text-[11px] text-muted-foreground">
          Sorted by available stock (worst first). Reserved:&nbsp;
          <span className="font-mono">
            {items.reduce((acc, i) => acc + i.quantity_reserved, 0)}
          </span>{" "}
          units total across {items.length} SKUs
        </p>
      </footer>
    </section>
  );
}
