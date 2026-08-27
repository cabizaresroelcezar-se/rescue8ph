import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { formatCurrency, formatDateTimePh } from "@/lib/format";

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  PAYMENT_PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  READY_TO_SHIP: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  SHIPPED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  REFUNDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  PARTIALLY_REFUNDED: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
}

export interface RecentOrdersProps {
  orders: RecentOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-elev-1">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Recent orders
          </h2>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {orders.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          No orders yet. Once customers start buying, they&apos;ll show up here.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((o) => {
            const tone =
              STATUS_TONE[o.status] ??
              "bg-muted text-muted-foreground";
            return (
              <li
                key={o.id}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="block truncate font-mono text-xs font-medium text-foreground hover:text-primary"
                  >
                    {o.order_number}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDateTimePh(o.created_at)}
                  </p>
                </div>
                <span
                  className={
                    "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                    tone
                  }
                >
                  {o.status.replace(/_/g, " ")}
                </span>
                <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground">
                  {formatCurrency(Number(o.grand_total))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
