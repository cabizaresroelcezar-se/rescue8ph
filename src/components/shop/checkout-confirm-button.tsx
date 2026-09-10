"use client";

import * as React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// CheckoutConfirmButton — wraps the place order submit with a confirmation modal
// ============================================================================

interface CheckoutConfirmButtonProps {
  disabled?: boolean;
  emailVerified?: boolean;
  totalLabel?: string;
}

export function CheckoutConfirmButton({
  disabled,
  emailVerified = true,
  totalLabel,
}: CheckoutConfirmButtonProps) {
  const [confirming, setConfirming] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleClick() {
    if (!emailVerified || disabled) return;
    // Trigger HTML5 validation first
    const form = formRef.current;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setConfirming(true);
  }

  function handleConfirm() {
    setSubmitting(true);
    // Submit the parent form
    const form = formRef.current;
    if (form) form.requestSubmit();
  }

  // Find the parent form
  React.useEffect(() => {
    // The button is inside a form — find it
    const btn = document.getElementById("place-order-btn");
    if (btn) {
      formRef.current = btn.closest("form");
    }
  }, []);

  if (confirming) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-elev-4">
            <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Confirm your order</h3>
                <p className="text-xs text-muted-foreground">Review before placing your order</p>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {totalLabel && (
                <p className="text-center text-2xl font-bold text-foreground">{totalLabel}</p>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Shipping fee will be determined after order confirmation.
                You will pay only when you receive your order.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Button
      id="place-order-btn"
      type="button"
      className="w-full"
      disabled={disabled || !emailVerified}
      onClick={handleClick}
    >
      {emailVerified ? "Place Order" : "Verify email to continue"}
    </Button>
  );
}