"use client";

import * as React from "react";
import { Mail, Check, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    setError(null);
    // Simulated subscribe. Wire to /api/newsletter when that endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setState("success");
  };

  if (state === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-md rounded-2xl border border-success/30 bg-success/10 p-4 backdrop-blur animate-scale-in"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground shadow-elev-1">
            <Check className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">You&apos;re in.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Look out for product updates, first-aid tips, and EMS insights in your inbox.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md"
      noValidate
      aria-label="Newsletter signup"
    >
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="relative flex-1">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={state === "error"}
            aria-describedby={error ? "newsletter-error" : undefined}
            className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-5 text-sm font-semibold text-background shadow-elev-1 transition-transformed-[background,transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:bg-foreground/90 hover:shadow-elev-3 active:scale-[0.98] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-success" />
          No spam, ever
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-accent" />
          Unsubscribe anytime
        </span>
      </div>

      {error && (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}