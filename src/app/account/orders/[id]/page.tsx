import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const { data: address } = await supabase
    .from("order_addresses")
    .select("*")
    .eq("order_id", order.id)
    .single();

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
          <p className="mt-1 text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <ButtonLink href="/account/orders" variant="outline" size="sm">Back to Orders</ButtonLink>
      </div>

      <div className="mb-4">
        <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} x {item.currency || "PHP"} {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">{item.currency || "PHP"} {item.subtotal.toFixed(2)}</p>
                </div>
              ))}
              {!items?.length && (
                <p className="text-muted-foreground text-sm">No items found.</p>
              )}
            </div>
            <div className="mt-4 border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{order.currency} {order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{order.currency} {order.discount_total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.currency} {order.shipping_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{order.currency} {order.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{address.first_name} {address.last_name}</p>
                <p>{address.phone}</p>
                <p>{address.street_address}</p>
                {address.building_unit && <p>{address.building_unit}</p>}
                <p>{address.barangay}, {address.city_municipality}</p>
                <p>{address.province}, {address.region}</p>
                {address.postal_code && <p>{address.postal_code}</p>}
              </CardContent>
            </Card>
          )}

          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order History</CardTitle>
                <CardDescription>Status updates for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {h.to_status.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(h.created_at).toLocaleDateString("en-PH")}
                        </span>
                      </div>
                      {h.note && <p className="text-muted-foreground">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}