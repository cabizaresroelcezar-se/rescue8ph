"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { updateUserRole } from "@/features/users/actions";
import { cn } from "@/lib/utils";

type Role = "super_admin" | "admin" | "customer" | null;

const ROLE_CONFIG: Record<
  Exclude<Role, null>,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  super_admin: {
    label: "Super Admin",
    className: "border-accent/30 bg-accent/10 text-accent",
    icon: ShieldAlert,
  },
  admin: {
    label: "Admin",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: ShieldCheck,
  },
  customer: {
    label: "Customer",
    className: "border-border bg-secondary text-foreground",
    icon: UserIcon,
  },
};

export function RoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [optimistic, setOptimistic] = React.useState<Role>(currentRole);
  const [error, setError] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(500);

  React.useEffect(() => {
    // Reset optimistic state when the prop changes (legitimate prop reset)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimistic(currentRole);
  }, [currentRole]);

  async function onChange(next: Exclude<Role, null>) {
    if (busy || next === optimistic) return;
    setError(null);
    setBusy(true);
    const previous = optimistic;
    setOptimistic(next); // optimistic UI
    const result = await updateUserRole(userId, next);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      setOptimistic(previous); // revert
    } else {
      refresh();
      // Soft navigate so the sidebar / topbar reflect the change
      router.refresh();
    }
  }

  const display = optimistic ?? "customer";
  const cfg = ROLE_CONFIG[display];
  const Icon = cfg.icon;
  const isRefreshing = pending && !busy;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
          cfg.className,
        )}
      >
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
      <select
        value={optimistic ?? ""}
        disabled={busy || isSelf}
        onChange={(e) => onChange(e.target.value as Exclude<Role, null>)}
        aria-label="Change role"
        className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="super_admin">Super Admin</option>
        <option value="admin">Admin</option>
        <option value="customer">Customer</option>
      </select>
      {isRefreshing && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
      {isSelf && (
        <span
          title="You cannot change your own role"
          className="inline-flex h-7 items-center rounded-md bg-secondary px-2 text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          You
        </span>
      )}
      {error && (
        <span className="ml-1 text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}