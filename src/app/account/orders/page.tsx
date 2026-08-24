import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn, Stagger } from "@/lib/motion";

const STATUS_STYLES: Record<string, string> = {
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

function statusClass(s: string) {
  return STATUS_STYLES[s] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300";
}

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, grand_total, currency, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-eyebrow">My Account</p>
              <h1 className="mt-2 text-display-lg text-foreground">Orders</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track and review every order you&apos;ve placed.
              </p>
            </div>
            <ButtonLink href="/account" variant="outline" size="sm">
              Back to Account
            </ButtonLink>
          </FadeIn>
        </div>
      </section>

      {/* List */}
      <div className="container-page py-10">
        {!orders || orders.length === 0 ? (
          <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              No orders yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              When you place an order it&apos;ll show up here with status updates
              and tracking.
            </p>
            <ButtonLink href="/products" className="mt-5">
              Browse Products
              <ArrowRight />
            </ButtonLink>
          </FadeIn>
        ) : (
          <Stagger className="space-y-3">
            {orders.map((order) => (
              <FadeIn
                key={order.id}
                className="group rounded-xl border border-border bg-card p-4 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {order.order_number}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-base font-semibold text-foreground">
                      {order.currency} {order.grand_total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View details
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
