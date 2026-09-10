"use client";

import * as React from "react";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function SignOutButton() {
  const [confirming, setConfirming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { toast, update, dismiss } = useToast();

  async function handleSignOut() {
    setBusy(true);
    const toastId = toast({ title: "Signing out...", variant: "loading" });
    try {
      await signOut();
    } catch {
      // signOut redirects — the redirect throws internally
    } finally {
      // Dismiss the loading toast before the page navigates away
      dismiss(toastId);
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
          Confirm Sign Out
        </button>
      </>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => setConfirming(true)}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}