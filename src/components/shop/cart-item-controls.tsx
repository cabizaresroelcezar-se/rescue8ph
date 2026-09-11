"use client";

import * as React from "react";
import { Minus, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { updateCartQuantity, removeFromCart } from "@/features/cart/actions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface CartItemControlsProps {
  itemId: string;
  quantity: number;
}

export function CartItemControls({ itemId, quantity }: CartItemControlsProps) {
  const [confirmingRemove, setConfirmingRemove] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleUpdate(newQty: number) {
    if (newQty < 1) return; // Never go below 1
    setBusy(true);
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("quantity", String(newQty));
    try {
      await updateCartQuantity(formData);
      router.refresh();
    } catch {
      // redirect throws
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    const formData = new FormData();
    formData.set("itemId", itemId);
    try {
      await removeFromCart(formData);
      toast({ title: "Item removed", variant: "success" });
      router.refresh();
    } catch {
      // redirect throws
    } finally {
      setBusy(false);
      setConfirmingRemove(false);
    }
  }

  if (confirmingRemove) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-medium text-destructive">Remove?</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex h-6 items-center rounded bg-destructive px-2 text-[11px] font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingRemove(false)}
            disabled={busy}
            className="inline-flex h-6 items-center rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleUpdate(quantity - 1)}
          disabled={quantity <= 1 || busy}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => handleUpdate(quantity + 1)}
          disabled={busy}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setConfirmingRemove(true)}
        disabled={busy}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
        aria-label="Remove from cart"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}