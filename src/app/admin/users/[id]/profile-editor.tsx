"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { updateUserProfile } from "@/features/users/actions";

export function ProfileEditor({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
}) {
  const [firstName, setFirstName] = React.useState(initial.first_name ?? "");
  const [lastName, setLastName] = React.useState(initial.last_name ?? "");
  const [phone, setPhone] = React.useState(initial.phone ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(700);

  React.useEffect(() => {
    // Reset fields when the prop changes (legitimate prop reset)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(initial.first_name ?? "");
    setLastName(initial.last_name ?? "");
    setPhone(initial.phone ?? "");
  }, [initial.first_name, initial.last_name, initial.phone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await updateUserProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    setBusy(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSavedAt(new Date().toLocaleTimeString("en-PH"));
      refresh();
    }
  }

  const dirty =
    firstName !== (initial.first_name ?? "") ||
    lastName !== (initial.last_name ?? "") ||
    phone !== (initial.phone ?? "");

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-elev-1"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Profile details
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Basic account information. Email cannot be changed here.
          </p>
        </div>
        {savedAt && (
          <span className="text-xs text-muted-foreground">
            Saved at {savedAt}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id="first_name"
          label="First name"
          value={firstName}
          onChange={setFirstName}
        />
        <Field
          id="last_name"
          label="Last name"
          value={lastName}
          onChange={setLastName}
        />
      </div>

      <Field
        id="phone"
        label="Phone"
        value={phone}
        onChange={setPhone}
        placeholder="+63 917 123 4567"
        type="tel"
      />

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={busy || !dirty}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {busy || pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {pending && !busy
            ? "Saved"
            : busy
              ? "Saving…"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}