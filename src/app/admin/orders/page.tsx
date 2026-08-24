import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Package } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";
import { formatDatePh } from "@/lib/format";

const STATUS_TONE: Record<string, string> = {
  PENDING:          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  PAYMENT_PENDING:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  PAID:             "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PROCESSING:       "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  READY_TO_SHIP:    "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  SHIPPED:          "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  DELIVERED:        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED:        "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  FAILED:           "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, count } = await supabase
    .from("orders")
    .select("id, order_number, status, grand_total, currency, created_at, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count != null
              ? `${count.toLocaleString()} order${count === 1 ? "" : "s"} total · showing the 50 most recent`
              : "View and manage customer orders"}
          </p>
        </div>
      </FadeIn>

      {!orders || orders.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            When customers place orders they&apos;ll appear here.
          </p>
        </FadeIn>
      ) : (
        <FadeIn className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {order.order_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDatePh(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_TONE[order.status] ??
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {order.currency} {order.grand_total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
