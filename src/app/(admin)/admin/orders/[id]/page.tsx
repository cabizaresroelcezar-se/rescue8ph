import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CreditCard,
  Ban,
  MapPin,
  Clock,
  ArrowRight,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger } from "@/lib/motion";
import { formatDateTimePh } from "@/lib/format";
import {
  markPaymentPaid,
  updateOrderStatus,
  cancelOrder,
  createShipment,
  updateShipmentStatus,
} from "@/features/orders/actions";
import { listOrderNotes } from "@/features/order-notes/actions";
import { OrderNotesTimeline } from "@/components/admin/order-notes-timeline";

const ORDER_STATUSES = [
  "PENDING", "PAYMENT_PENDING", "PAID", "PROCESSING", "READY_TO_SHIP",
  "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED",
];

const SHIPMENT_STATUSES = [
  "PENDING", "QUOTED", "BOOKED", "PICKED_UP", "IN_TRANSIT",
  "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED",
];

const ORDER_TONE: Record<string, string> = {
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

const PAYMENT_TONE: Record<string, string> = {
  PAID:    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  FAILED:  "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
};

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    redirect("/admin/orders");
  }

  const [
      { data: items },
      { data: address },
      { data: history },
      { data: payments },
      { data: shipments },
      { data: notes },
      { data: { user } },
    ] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase.from("order_addresses").select("*").eq("order_id", order.id).single(),
      supabase.from("order_status_history").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
      supabase.from("payments").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
      supabase.from("shipments").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
      listOrderNotes(order.id).then((data) => ({ data })),
      supabase.auth.getUser(),
    ]);

    // Check if user is super_admin (they can delete any note). Admin users
    // can only delete their own notes.
    let canDeleteAny = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_id, roles(name)")
        .eq("id", user.id)
        .single();
      const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
      const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
      canDeleteAny = roleName === "super_admin";
    }

    const orderTone = ORDER_TONE[order.status] ?? "bg-zinc-100 text-zinc-700";

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office · Orders</p>
          <h1 className="mt-2 text-display-md text-foreground">
            {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTimePh(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${orderTone}`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
          <Link
            href={`/admin/orders/${order.id}/receipt`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Printer className="h-3.5 w-3.5" />
            Receipt
          </Link>
          <Link
            href={`/admin/orders/${order.id}/waybill`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Truck className="h-3.5 w-3.5" />
            Waybill
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Back
          </Link>
        </div>
      </FadeIn>

      {/* Flash messages */}
      {sp.error && (
        <FadeIn className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {sp.error}
        </FadeIn>
      )}
      {sp.message && (
        <FadeIn className="rounded-md border border-emerald-300/40 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {sp.message}
        </FadeIn>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + address + shipments */}
        <Stagger className="space-y-6 lg:col-span-2">
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
                <li key={item.id} className="flex justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.quantity} × PHP {item.unit_price.toFixed(2)}
                      {item.sku && ` (SKU: ${item.sku})`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    PHP {item.subtotal.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <SummaryRow label="Subtotal" value={`PHP ${order.subtotal.toFixed(2)}`} />
              {order.discount_total > 0 && (
                <SummaryRow label="Discount" value={`-PHP ${order.discount_total.toFixed(2)}`} muted />
              )}
              <SummaryRow label="Shipping" value={`PHP ${order.shipping_total.toFixed(2)}`} />
              <SummaryRow label="Total" value={`${order.currency} ${order.grand_total.toFixed(2)}`} bold />
            </div>
          </FadeIn>

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
                  <p className="text-xs text-muted-foreground">Recipient details</p>
                </div>
              </div>
              <div className="mt-4 space-y-0.5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {address.first_name} {address.last_name}
                </p>
                <p>{address.phone}</p>
                {address.email && <p>{address.email}</p>}
                <p>{address.street_address}</p>
                {address.building_unit && <p>{address.building_unit}</p>}
                <p>
                  {address.barangay}, {address.city_municipality}
                </p>
                <p>
                  {address.province}, {address.region}
                </p>
                {address.postal_code && <p>{address.postal_code}</p>}
                {address.delivery_notes && (
                  <p className="italic">Notes: {address.delivery_notes}</p>
                )}
              </div>
            </FadeIn>
          )}

          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Shipments</h2>
                <p className="text-xs text-muted-foreground">
                  {(shipments || []).length} shipment{(shipments || []).length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(shipments || []).length === 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    No shipments created yet.
                  </p>
                  <form action={createShipment} className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Provider</label>
                        <select name="provider" className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                          <option value="MANUAL">Manual</option>
                          <option value="LALAMOVE">Lalamove</option>
                          <option value="JNT">J&amp;T</option>
                          <option value="LBC">LBC</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Service Name</label>
                        <input name="serviceName" className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="Standard Delivery" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Tracking Number</label>
                        <input name="trackingNumber" className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="(optional)" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Shipping Cost (PHP)</label>
                        <input name="shippingCost" type="number" step="0.01" defaultValue="0" className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Estimated Delivery</label>
                      <input name="estimatedDelivery" className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="3-5 business days" />
                    </div>
                    <Button type="submit" size="sm">Create Shipment</Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  {(shipments || []).map((ship) => (
                    <div key={ship.id} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ship.provider} — {ship.service_name || "N/A"}
                          </p>
                          {ship.tracking_number && (
                            <p className="text-xs text-muted-foreground">
                              Tracking: {ship.tracking_number}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Cost: PHP {ship.shipping_cost.toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ORDER_TONE[ship.status] ?? "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {ship.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <form action={updateShipmentStatus} className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="shipmentId" value={ship.id} />
                        <input type="hidden" name="orderId" value={order.id} />
                        <select name="status" className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                          {SHIPMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                        <input
                          name="description"
                          placeholder="Description (optional)"
                          className="h-9 flex-1 min-w-[12rem] rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <Button type="submit" size="sm" variant="outline">
                          Update
                        </Button>
            </form>
            </div>
            ))}
            </div>
            )}
            </div>
            </FadeIn>
            
            {notes && (
            <OrderNotesTimeline
            orderId={order.id}
            initialNotes={notes}
            currentUserId={user?.id ?? ""}
            canDeleteAny={canDeleteAny}
            />
            )}
            </Stagger>
            
            {/* Right: status, payments, history */}
            <Stagger className="space-y-6">
            <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Update Status
                </h2>
                <p className="text-xs text-muted-foreground">
                  Move this order forward
                </p>
              </div>
            </div>
            <form action={updateOrderStatus} className="mt-4 space-y-2">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <input
                name="note"
                placeholder="Note (optional)"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
              <Button type="submit" size="sm" className="w-full">
                Update Status
              </Button>
            </form>
            <form action={cancelOrder} className="mt-3">
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit" variant="destructive" size="sm" className="w-full">
                <Ban className="h-3.5 w-3.5" />
                Cancel Order
              </Button>
            </form>
          </FadeIn>

          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Payments</h2>
                <p className="text-xs text-muted-foreground">
                  {(payments || []).length} payment record{(payments || []).length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(payments || []).map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg border border-border bg-background p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {payment.provider}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        PAYMENT_TONE[payment.status] ??
                        "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Amount: {payment.currency} {payment.amount.toFixed(2)}
                  </p>
                  {payment.provider_payment_id && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {payment.provider_payment_id}
                    </p>
                  )}
                  {payment.status === "PENDING" && (
                    <form action={markPaymentPaid}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="orderId" value={order.id} />
                      <Button type="submit" size="sm" className="w-full">
                        Mark as Paid
                      </Button>
                    </form>
                  )}
                </div>
              ))}
              {(!payments || payments.length === 0) && (
                <p className="text-sm text-muted-foreground">No payment records.</p>
              )}
            </div>
          </FadeIn>

          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Status History</h2>
                <p className="text-xs text-muted-foreground">All status changes</p>
              </div>
            </div>
            <ol className="relative mt-4 space-y-4 border-l border-border pl-5">
              {(history || []).map((h) => (
                <li key={h.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary"
                  />
                  <p className="text-sm font-medium capitalize text-foreground">
                    {h.to_status.replace(/_/g, " ").toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTimePh(h.created_at)}
                  </p>
                  {h.note && (
                    <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>
                  )}
                </li>
              ))}
              {(!history || history.length === 0) && (
                <li className="text-sm text-muted-foreground">No history records.</li>
              )}
            </ol>
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
