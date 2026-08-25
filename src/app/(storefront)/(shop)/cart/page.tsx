import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateCartQuantity, removeFromCart } from "@/features/cart/actions";
import { ButtonLink } from "@/components/ui/button-link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { CouponInput } from "@/components/shop/coupon-input";

export default async function CartPage({
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
    redirect("/auth/login?redirectTo=/cart");
  }

  // Get cart with coupon fields
    const { data: cart } = await supabase
      .from("carts")
      .select("id, coupon_id, coupon_discount_amount, coupon:coupons(code, discount_type, discount_value)")
      .eq("user_id", user.id)
      .single();

    const cartTyped = cart as unknown as {
      id: string;
      coupon_id: string | null;
      coupon_discount_amount: number | null;
      coupon: { code: string; discount_type: string; discount_value: number } | { code: string; discount_type: string; discount_value: number }[] | null;
    } | null;
    const couponField = cartTyped?.coupon ?? null;
    const appliedCouponCode = Array.isArray(couponField)
      ? (couponField[0]?.code ?? null)
      : (couponField?.code ?? null);
    const appliedDiscount = cartTyped?.coupon_discount_amount ?? null;

  if (!cart) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <ButtonLink href="/products" className="mt-4">Browse Products</ButtonLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get cart items with product details
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product:products(id, title, slug, price, short_description, status)
    `)
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  type CartItemWithProduct = {
    id: string;
    quantity: number;
    product: { id: string; title: string; slug: string; price: number; short_description: string | null; status: string }[] | { id: string; title: string; slug: string; price: number; short_description: string | null; status: string } | null;
  };
  const typedItems = (cartItems || []) as unknown as CartItemWithProduct[];

  // Calculate totals
  let subtotal = 0;
  typedItems.forEach((item) => {
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    if (p) subtotal += p.price * item.quantity;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

      {params.error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {params.error}
        </div>
      )}

      {typedItems.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <ButtonLink href="/products" className="mt-4">Browse Products</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Cart items */}
          <div className="space-y-4 md:col-span-2">
            {typedItems.map((item) => {
              const p = Array.isArray(item.product) ? item.product[0] : item.product;
              if (!p) return null;

              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex aspect-square h-20 w-20 shrink-0 items-center justify-center rounded-md bg-surface">
                      <span className="text-2xl text-muted-foreground/30">+</span>
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${p.slug}`} className="font-semibold hover:text-primary">
                        {p.title}
                      </Link>
                      {p.short_description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {p.short_description}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-primary">
                        PHP {p.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <form action={updateCartQuantity}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity - 1} />
                          <button
                            type="submit"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </form>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <form action={updateCartQuantity}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity + 1} />
                          <button
                            type="submit"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </form>
                      </div>
                      <p className="text-sm font-bold">
                        PHP {(p.price * item.quantity).toFixed(2)}
                      </p>
                      <form action={removeFromCart}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">PHP {subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount !== null && appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="flex items-center gap-1">
                      Discount
                      {appliedCouponCode && (
                        <span className="font-mono text-xs">({appliedCouponCode})</span>
                      )}
                    </span>
                    <span className="font-medium">
                      −₱
                      {appliedDiscount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      PHP{" "}
                      {(subtotal - (appliedDiscount ?? 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon input */}
                <div className="border-t pt-3">
                  <CouponInput
                    subtotal={subtotal}
                    appliedCode={appliedCouponCode}
                    appliedDiscount={appliedDiscount}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <ButtonLink href="/checkout" className="w-full">
                    Proceed to Checkout
                  </ButtonLink>
                  <ButtonLink
                    href="/products"
                    variant="outline"
                    className="w-full"
                  >
                    Continue Shopping
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}