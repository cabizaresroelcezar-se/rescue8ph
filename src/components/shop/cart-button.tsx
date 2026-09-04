"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCartCount } from "@/features/cart/actions";

export function CartButton({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  // Fetch real count on mount (handles logged-in users with existing carts)
  useEffect(() => {
    let mounted = true;
    fetchCartCount()
      .then((c) => {
        if (mounted) setCount(c);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ count: number }>;
      if (typeof ce.detail?.count === "number") setCount(ce.detail.count);
    };
    window.addEventListener("cart:updated", onUpdate as EventListener);
    return () =>
      window.removeEventListener("cart:updated", onUpdate as EventListener);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Cart (${count} ${count === 1 ? "item" : "items"})`}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}