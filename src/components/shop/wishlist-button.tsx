"use client";

import * as React from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/features/wishlist/actions";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  initialSaved?: boolean;
  variant?: "card" | "detail" | "icon";
  className?: string;
};

export function WishlistButton({
  productId,
  initialSaved = false,
  variant = "card",
  className,
}: Props) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialSaved);
  const [busy, setBusy] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    const wasSaved = saved;
    // Optimistic toggle
    setSaved(!wasSaved);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    try {
      const res = await toggleWishlist(productId);
      if (res.error) {
        // Revert
        setSaved(wasSaved);
        if (res.requiresAuth) {
          router.push("/auth/login?redirectTo=" + encodeURIComponent(window.location.pathname));
        }
      } else {
        setSaved(res.action === "added");
        router.refresh();
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setBusy(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-elev-1 backdrop-blur transition-all hover:scale-110 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          saved && "text-destructive border-destructive/40 bg-destructive/10",
          pulse && "animate-scale-in",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4 transition-all", saved && "fill-current scale-110")} />
        )}
      </button>
    );
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          saved
            ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
            : "border-input bg-background text-foreground hover:border-destructive/40 hover:text-destructive",
          pulse && "animate-scale-in",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4 transition-all", saved && "fill-current")} />
        )}
        {saved ? "Saved" : "Save to wishlist"}
      </button>
    );
  }

  // Card variant: just the icon, hover-revealed, heart fill animation
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 shadow-elev-1 backdrop-blur transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        saved
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border text-muted-foreground hover:text-destructive",
        pulse && "animate-scale-in",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4 transition-all", saved && "fill-current scale-110")} />
      )}
    </button>
  );
}