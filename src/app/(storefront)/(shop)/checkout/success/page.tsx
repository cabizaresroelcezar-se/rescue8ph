import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const orderNumber = params.order;

  // Verify the order belongs to this user
  let order = null;
  if (orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single();
    order = data;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          <CardDescription>
            Thank you for your order. We&apos;ll contact you shortly to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order && (
            <div className="rounded-lg border bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-semibold">Order #{order.order_number}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{order.status.replace(/_/g, " ").toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{order.currency} {order.grand_total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium">Cash on Delivery / Bank Transfer</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString("en-PH")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">What happens next?</p>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Our team will review your order and confirm availability</li>
              <li>We&apos;ll contact you to arrange payment and delivery</li>
              <li>For COD orders, please prepare the exact amount</li>
              <li>You&apos;ll receive updates on your order status</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <ButtonLink href="/account/orders" className="flex-1">
              View My Orders
            </ButtonLink>
            <ButtonLink href="/products" variant="outline" className="flex-1">
              Continue Shopping
            </ButtonLink>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            For inquiries about your order, contact us at (02) 622-9565 or message us on{" "}
            <Link href="https://www.facebook.com/rescue8tradingphils" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Facebook
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}