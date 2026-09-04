"use client";

import * as React from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/features/cart/actions";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
  className?: string;
  size?: "md" | "lg";
};

export function AddToCartButton({
  productId,
  disabled,
  className,
  size = "lg",
}: AddToCartButtonProps) {
  const [pending, setPending] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  const handleAdd = async (formData: FormData) => {
    setPending(true);
    try {
      const result = await addToCart(formData);
      if (result && typeof result.count === "number") {
        window.dispatchEvent(
          new CustomEvent("cart:updated", { detail: { count: result.count } })
        );
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch {
      /* swallow — redirect throws are expected */
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={handleAdd} className={cn("contents", className)}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <button
        type="submit"
        disabled={disabled || pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "bg-primary text-primary-foreground shadow-elev-1",
          "transition-[background,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-quart)]",
          "hover:bg-primary/90 hover:shadow-elev-2 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-60",
          size === "lg" ? "h-12 px-6 text-base" : "h-11 px-4 text-sm"
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding…
          </>
        ) : added ? (
          <>
            <Check className="h-4 w-4" />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </button>
    </form>
  );
}