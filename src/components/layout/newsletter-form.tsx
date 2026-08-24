"use client";

import * as React from "react";
import { Mail, Check, ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    setError(null);
    // Simulated subscribe. Wire to /api/newsletter when that endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState("success");
  };

  if (state === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center gap-3 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success md:justify-self-end animate-scale-in"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-4 w-4" />
        </span>
        <span>Thanks! We&apos;ll send product updates your way.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md gap-2 md:justify-self-end"
      noValidate
    >
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
          className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-elev-1 transition-[background,transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:bg-primary/90 hover:shadow-elev-2 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {state === "submitting" ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Subscribing
          </span>
        ) : (
          <>
            Subscribe
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
      {error && (
        <p id="newsletter-error" className="absolute mt-12 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}