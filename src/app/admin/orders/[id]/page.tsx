import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  markPaymentPaid,
  updateOrderStatus,
  cancelOrder,
  createShipment,
  updateShipmentStatus,
} from "@/features/orders/actions";
import { Truck, CreditCard, Package, Ban } from "lucide-react";

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
  ] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase.from("order_addresses").select("*").eq("order_id", order.id).single(),
    supabase.from("order_status_history").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
    supabase.from("payments").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
    supabase.from("shipments").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
  ]);

  const orderStatuses = [
    "PENDING", "PAYMENT_PENDING", "PAID", "PROCESSING", "READY_TO_SHIP",
    "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED",
  ];

  const shipmentStatuses = [
    "PENDING", "QUOTED", "BOOKED", "PICKED_UP", "IN_TRANSIT",
    "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED",
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString("en-PH")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {sp.error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {sp.error}
        </div>
      )}
      {sp.message && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {sp.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + address */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(items || []).map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-2 text-sm last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x PHP {item.unit_price.toFixed(2)}
                        {item.sku && ` (SKU: ${item.sku})`}
                      </p>
                    </div>
                    <p className="font-medium">PHP {item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>PHP {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-PHP {order.discount_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>PHP {order.shipping_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{order.currency} {order.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery address */}
          {address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{address.first_name} {address.last_name}</p>
                <p>{address.phone}</p>
                {address.email && <p>{address.email}</p>}
                <p>{address.street_address}</p>
                {address.building_unit && <p>{address.building_unit}</p>}
                <p>{address.barangay}, {address.city_municipality}</p>
                <p>{address.province}, {address.region}</p>
                {address.postal_code && <p>{address.postal_code}</p>}
                {address.delivery_notes && <p className="italic text-muted-foreground">Notes: {address.delivery_notes}</p>}
              </CardContent>
            </Card>
          )}

          {/* Shipments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-primary" />
                Shipments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(shipments || []).length === 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">No shipments created yet.</p>
                  {/* Create shipment form */}
                  <form action={createShipment} className="rounded-lg border p-4 space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Provider</label>
                        <select name="provider" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm">
                          <option value="MANUAL">Manual</option>
                          <option value="LALAMOVE">Lalamove</option>
                          <option value="JNT">J&T</option>
                          <option value="LBC">LBC</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Service Name</label>
                        <input name="serviceName" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="Standard Delivery" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Tracking Number</label>
                        <input name="trackingNumber" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="(optional)" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Shipping Cost (PHP)</label>
                        <input name="shippingCost" type="number" step="0.01" defaultValue="0" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Estimated Delivery</label>
                      <input name="estimatedDelivery" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="3-5 business days" />
                    </div>
                    <Button type="submit" size="sm">Create Shipment</Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  {(shipments || []).map((ship) => (
                    <div key={ship.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{ship.provider} — {ship.service_name || "N/A"}</p>
                          {ship.tracking_number && <p className="text-xs text-muted-foreground">Tracking: {ship.tracking_number}</p>}
                          <p className="text-xs text-muted-foreground">Cost: PHP {ship.shipping_cost.toFixed(2)}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {ship.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {/* Update shipment status */}
                      <form action={updateShipmentStatus} className="mt-3 flex items-center gap-2">
                        <input type="hidden" name="shipmentId" value={ship.id} />
                        <input type="hidden" name="orderId" value={order.id} />
                        <select name="status" className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                          {shipmentStatuses.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <input name="description" placeholder="Description (optional)" className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
                        <Button type="submit" size="sm" variant="outline">Update</Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: status + payments + history */}
        <div className="space-y-6">
          {/* Order status update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form action={updateOrderStatus} className="space-y-2">
                <input type="hidden" name="orderId" value={order.id} />
                <select name="status" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue={order.status}>
                  {orderStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <input name="note" placeholder="Note (optional)" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
                <Button type="submit" size="sm" className="w-full">Update Status</Button>
              </form>
              <form action={cancelOrder}>
                <input type="hidden" name="orderId" value={order.id} />
                <Button type="submit" variant="destructive" size="sm" className="w-full">
                  <Ban className="mr-1 h-3 w-3" />
                  Cancel Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(payments || []).map((payment) => (
                <div key={payment.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{payment.provider}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      payment.status === "PAID" ? "bg-green-100 text-green-700" :
                      payment.status === "FAILED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm">Amount: {payment.currency} {payment.amount.toFixed(2)}</p>
                  {payment.provider_payment_id && (
                    <p className="text-xs text-muted-foreground">Ref: {payment.provider_payment_id}</p>
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
              {!payments || payments.length === 0 && (
                <p className="text-sm text-muted-foreground">No payment records.</p>
              )}
            </CardContent>
          </Card>

          {/* Status history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(history || []).map((h) => (
                  <div key={h.id} className="text-sm border-l-2 border-primary/30 pl-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{h.to_status.replace(/_/g, " ").toLowerCase()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString("en-PH")}
                      </span>
                    </div>
                    {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                  </div>
                ))}
                {!history || history.length === 0 && (
                  <p className="text-sm text-muted-foreground">No history records.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}