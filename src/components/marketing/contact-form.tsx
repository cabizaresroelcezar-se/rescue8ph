"use client";

import Link from "next/link";
import * as React from "react";
import { useFormStatus } from "react-dom";
import { Send, Loader2, Check, AlertCircle } from "lucide-react";
import { submitContactInquiry } from "@/app/(marketing)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const reasons = [
  { value: "product",  label: "Product inquiry" },
  { value: "quote",    label: "Bulk / institutional quote" },
  { value: "training", label: "Training & certification" },
  { value: "support",  label: "Existing order support" },
  { value: "other",    label: "Something else" },
] as const;

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string>("");
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (status === "success") {
      formRef.current?.reset();
      const t = window.setTimeout(() => setStatus("idle"), 4000);
      return () => window.clearTimeout(t);
    }
  }, [status]);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setStatus("submitting");
        setMessage("");
        try {
          const res = await submitContactInquiry(fd);
          if (res.ok) {
            setStatus("success");
            setMessage(res.message);
          } else {
            setStatus("error");
            setMessage(res.error);
          }
        } catch (err) {
          setStatus("error");
          setMessage(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please email info@rescue8ph.com.",
          );
        }
      }}
      className="space-y-5"
      noValidate
    >
      {status === "success" && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success-foreground/90 dark:text-success"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message || "Thanks — we’ll be in touch within one business day."}</span>
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message || "We couldn’t send your message. Please try again."}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Full name" required>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field id="email" label="Email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone (optional)">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+63 …" />
        </Field>
        <Field id="organization" label="Organization (optional)">
          <Input id="organization" name="organization" placeholder="Agency, hospital, LGU…" />
        </Field>
      </div>

      <Field id="reason" label="Reason for contact" required>
        <select
          id="reason"
          name="reason"
          required
          defaultValue=""
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <option value="" disabled>
            Select a reason
          </option>
          {reasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="message" label="How can we help?" required>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about the equipment you need, the team size, and your timeline."
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        />
      </Field>

      <SubmitButton status={status} />
      <p className="text-xs text-muted-foreground">
        By submitting, you agree to our{" "}
        <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        . We respond within one business day.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SubmitButton({ status }: { status: Status }) {
  const { pending } = useFormStatus();
  const busy = pending || status === "submitting";
  return (
    <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Send message
        </>
      )}
    </Button>
  );
}
