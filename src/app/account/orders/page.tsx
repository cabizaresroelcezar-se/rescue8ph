import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <ButtonLink href="/account" variant="outline" size="sm">Back to Account</ButtonLink>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <ButtonLink href="/products" className="mt-4">Browse Products</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {order.currency} {order.grand_total.toFixed(2)}
                  </p>
                </div>
                <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="sm" className="mt-4">
                  View Details
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}