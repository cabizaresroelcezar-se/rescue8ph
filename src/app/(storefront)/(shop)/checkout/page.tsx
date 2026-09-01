import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { placeOrder } from "@/features/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ShieldCheck, Truck, CreditCard, ClipboardCheck, Mail } from "lucide-react";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/checkout");
  }

  // Phase 16a: check email verification before allowing checkout.
  // We render a banner + disable the Place Order button if unverified;
  // the server action also gates this defensively (requireVerifiedEmail).
  const emailVerified = Boolean(user.email_confirmed_at);

  // Get cart
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!cart) {
    redirect("/cart");
  }

  // Get cart items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product:products(id, title, slug, price, status)
    `)
    .eq("cart_id", cart.id);

  type CartItemWithProduct = {
    id: string;
    quantity: number;
    product: { id: string; title: string; slug: string; price: number; status: string }[] | { id: string; title: string; slug: string; price: number; status: string } | null;
  };
  const typedItems = (cartItems || []) as unknown as CartItemWithProduct[];

  if (typedItems.length === 0) {
    redirect("/cart");
  }

  // Calculate subtotal
  let subtotal = 0;
  typedItems.forEach((item) => {
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    if (p) subtotal += p.price * item.quantity;
  });

  // Get user's saved addresses for pre-fill
  const { data: defaultAddress } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  // Get user profile for pre-fill
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your order and enter delivery details
        </p>
      </div>

      {params.error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {params.error}
        </div>
      )}

      <form action={placeOrder} className="grid gap-6 md:grid-cols-3">
        {/* Left: forms */}
        <div className="space-y-6 md:col-span-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    defaultValue={profile?.first_name || defaultAddress?.first_name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    defaultValue={profile?.last_name || defaultAddress?.last_name || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={user.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    defaultValue={profile?.phone || defaultAddress?.phone || ""}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input id="region" name="region" required defaultValue={defaultAddress?.region || ""} placeholder="NCR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Input id="province" name="province" required defaultValue={defaultAddress?.province || ""} placeholder="Metro Manila" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cityMunicipality">City/Municipality *</Label>
                  <Input id="cityMunicipality" name="cityMunicipality" required defaultValue={defaultAddress?.city_municipality || ""} placeholder="Quezon City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay *</Label>
                  <Input id="barangay" name="barangay" required defaultValue={defaultAddress?.barangay || ""} placeholder="Masambong" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input id="streetAddress" name="streetAddress" required defaultValue={defaultAddress?.street_address || ""} placeholder="Unit G4 #65 Gasan Street" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildingUnit">Building/Unit</Label>
                  <Input id="buildingUnit" name="buildingUnit" defaultValue={defaultAddress?.building_unit || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" defaultValue={defaultAddress?.postal_code || ""} placeholder="1115" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Input id="deliveryNotes" name="deliveryNotes" defaultValue={defaultAddress?.delivery_notes || ""} placeholder="Gate code, landmarks, etc." />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-surface">
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="MANUAL"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold">Cash on Delivery / Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive or via bank deposit</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 opacity-50">
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="XENDIT"
                    disabled
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold">Credit Card / E-Wallet (Xendit)</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 opacity-50">
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="PAYMONGO"
                    disabled
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold">Credit Card (PayMongo)</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="customerNotes"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Any special instructions for your order?"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: order summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {typedItems.map((item) => {
                  const p = Array.isArray(item.product) ? item.product[0] : item.product;
                  if (!p) return null;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">PHP {(p.price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">PHP {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated after order</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-muted-foreground">PHP 0.00</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>PHP {subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place order */}
              {!emailVerified && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">Verify your email to place this order</p>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-300/80">
                      We sent a confirmation link to{" "}
                      <span className="font-medium">{user.email}</span>. Click it to enable checkout.
                    </p>
                    <Link
                      href={`/auth/verify-email?email=${encodeURIComponent(user.email ?? "")}`}
                      className="mt-1 inline-block font-medium text-amber-900 underline hover:text-amber-700 dark:text-amber-200"
                    >
                      Resend confirmation email
                    </Link>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!emailVerified}>
                {emailVerified ? "Place Order" : "Verify email to continue"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our terms of service.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}