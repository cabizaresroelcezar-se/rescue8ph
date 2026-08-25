import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Package,
  MapPin,
  Truck,
  Clock,
  ArrowRight,
  Circle,
  Receipt,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn, Stagger } from "@/lib/motion";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    redirect("/account/orders");
  }

  const [{ data: items }, { data: address }, { data: history }] =
    await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase
        .from("order_addresses")
        .select("*")
        .eq("order_id", order.id)
        .single(),
      supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
    ]);

  const tone = STATUS_TONE[order.status] ?? "bg-zinc-100 text-zinc-700";

  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-eyebrow">My Account · Orders</p>
              <h1 className="mt-2 text-display-lg text-foreground">
                {order.order_number}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
              <ButtonLink href="/account/orders" variant="outline" size="sm">
                Back
              </ButtonLink>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="container-page grid gap-6 py-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: items + history */}
        <Stagger className="space-y-6">
          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Items</h2>
                <p className="text-xs text-muted-foreground">
                  {(items || []).length} item{(items || []).length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-border/60">
              {(items || []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.quantity} × {item.currency || "PHP"}{" "}
                      {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.currency || "PHP"} {item.subtotal.toFixed(2)}
                  </p>
                </li>
              ))}
              {(!items || items.length === 0) && (
                <li className="py-3 text-sm text-muted-foreground">
                  No items found.
                </li>
              )}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <SummaryRow label="Subtotal" value={`${order.currency} ${order.subtotal.toFixed(2)}`} />
              {order.discount_total > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-${order.currency} ${order.discount_total.toFixed(2)}`}
                  muted
                />
              )}
              <SummaryRow
                label="Shipping"
                value={`${order.currency} ${order.shipping_total.toFixed(2)}`}
              />
              <SummaryRow
                label="Total"
                value={`${order.currency} ${order.grand_total.toFixed(2)}`}
                bold
              />
            </div>
          </FadeIn>

          {history && history.length > 0 && (
            <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Status History
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Updates for this order
                  </p>
                </div>
              </div>
              <ol className="relative mt-5 space-y-4 border-l border-border pl-5">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <Circle
                      className="absolute -left-[27px] top-1 h-3 w-3 fill-primary text-primary"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold capitalize text-foreground">
                      {h.to_status.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleString("en-PH")}
                    </p>
                    {h.note && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {h.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </FadeIn>
          )}
        </Stagger>

        {/* Right: address */}
        <Stagger className="space-y-6">
          {address && (
            <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Where this order ships to
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-0.5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {address.first_name} {address.last_name}
                </p>
                <p>{address.phone}</p>
                <p>{address.street_address}</p>
                {address.building_unit && <p>{address.building_unit}</p>}
                <p>
                  {address.barangay}, {address.city_municipality}
                </p>
                <p>
                  {address.province}, {address.region}
                </p>
                {address.postal_code && <p>{address.postal_code}</p>}
              </div>
            </FadeIn>
          )}

          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Need help?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Reach out if something looks wrong.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <Link
                  href="mailto:info@rescue8ph.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Email support
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <Link
                  href="/contact"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Open a ticket
                </Link>
              </li>
            </ul>
          </FadeIn>

          {/* Truck icon spacer card — keeps layout balanced */}
          <FadeIn className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
            <Truck className="h-5 w-5 shrink-0 text-primary" />
            Tracking will appear here once the order ships.
          </FadeIn>
        </Stagger>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bold ? "border-t border-border pt-2 text-base font-bold text-foreground" : ""
      } ${muted ? "text-muted-foreground" : ""}`}
    >
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
