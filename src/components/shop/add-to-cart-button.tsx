"use client";

import { useState } from "react";
import { addToCart } from "@/features/cart/actions";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [pending, setPending] = useState(false);

  const handleAdd = async (formData: FormData) => {
    setPending(true);
    try {
      await addToCart(formData);
    } catch {
      setPending(false);
    }
  };

  return (
    <form action={handleAdd}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <Button type="submit" disabled={disabled || pending} className="w-full sm:w-auto">
        {pending ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </form>
  );
}