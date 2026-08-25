"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { deleteCoupon } from "@/features/coupons/actions";

export function DeleteCouponButton({
  id,
  code,
}: {
  id: string;
  code: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const { refresh, pending } = useDelayedRefresh(400);

  async function onClick() {
    if (
      !confirm(
        `Delete coupon "${code}"? This cannot be undone. Any unredeemed coupon code will be gone immediately.`,
      )
    ) {
      return;
    }
    setBusy(true);
    const result = await deleteCoupon(id);
    setBusy(false);
    if (result?.error) {
      alert(result.error);
      return;
    }
    setTimeout(() => router.push("/admin/coupons"), 300);
    refresh();
  }

  const showSpinner = busy || pending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`Delete coupon ${code}`}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
    >
      {showSpinner ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Delete
    </button>
  );
}