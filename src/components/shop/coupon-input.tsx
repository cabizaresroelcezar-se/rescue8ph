"use client";

import * as React from "react";
import { Ticket, X, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  validateCoupon,
  applyCouponToCart,
  removeCouponFromCart,
} from "@/features/coupons/actions";

export function CouponInput({
  subtotal,
  appliedCode,
  appliedDiscount,
}: {
  subtotal: number;
  appliedCode: string | null;
  appliedDiscount: number | null;
}) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setSuccess(null);
    setBusy(true);

    const result = await validateCoupon(code, subtotal);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }

    const applyResult = await applyCouponToCart(
      result.coupon.id,
      result.coupon.discount_amount,
    );
    setBusy(false);
    if (applyResult?.error) {
      setError(applyResult.error);
      return;
    }
    setCode("");
    setSuccess(`Coupon ${result.coupon.code} applied!`);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await removeCouponFromCart();
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (appliedCode && appliedDiscount !== null) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-900">
              <span className="font-mono">{appliedCode}</span> applied
            </span>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            aria-label="Remove coupon"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-green-200 bg-card px-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            Remove
          </button>
        </div>
        <p className="mt-1 text-xs text-green-700">
          You saved ₱
          {appliedDiscount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="space-y-2">
      <label
        htmlFor="coupon-code"
        className="block text-xs font-medium text-foreground"
      >
        Coupon code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            disabled={busy}
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 font-mono text-sm uppercase outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>
      {error && (
        <p className="flex items-start gap-1 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-start gap-1 text-xs text-green-700">
          <Check className="mt-0.5 h-3 w-3 shrink-0" />
          {success}
        </p>
      )}
    </form>
  );
}