import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserCog, Search, ShieldCheck, ShieldAlert, User as UserIcon } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";
import { formatDatePh } from "@/lib/format";
import { RoleSelect } from "./role-select";
import { ButtonLink } from "@/components/ui/button-link";

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  role_id: string | null;
  role: { name: string; description: string | null } | { name: string; description: string | null }[] | null;
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) redirect("/auth/login?redirectTo=/admin/users");

  // Verify super_admin access
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", currentUser.id)
    .single();
  const currentRole = (
    currentProfile as { roles?: { name?: string } } | null
  )?.roles?.name;
  if (currentRole !== "super_admin") {
    redirect("/admin");
  }

  // Fetch all profiles with their role
  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone, created_at, role_id, role:roles(name, description)",
    )
    .order("created_at", { ascending: false });

  const rows: ProfileRow[] = (profiles ?? []) as unknown as ProfileRow[];

  // Count by role
  const counts = {
    super_admin: 0,
    admin: 0,
    customer: 0,
    none: 0,
  };
  for (const r of rows) {
    const roleName = Array.isArray(r.role)
      ? r.role[0]?.name
      : r.role?.name;
    if (roleName === "super_admin") counts.super_admin++;
    else if (roleName === "admin") counts.admin++;
    else if (roleName === "customer") counts.customer++;
    else counts.none++;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-eyebrow text-muted-foreground">
            <UserCog className="h-3.5 w-3.5" />
            System
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            User management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promote, demote, and edit user accounts. Super-admin only.
          </p>
        </div>
      </header>

      {/* Role summary cards */}
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RoleCard
          label="Super admins"
          count={counts.super_admin}
          tone="text-accent"
          icon={ShieldAlert}
        />
        <RoleCard
          label="Admins"
          count={counts.admin}
          tone="text-primary"
          icon={ShieldCheck}
        />
        <RoleCard
          label="Customers"
          count={counts.customer}
          tone="text-foreground"
          icon={UserIcon}
        />
        <RoleCard
          label="No role"
          count={counts.none}
          tone="text-muted-foreground"
          icon={UserIcon}
        />
      </Stagger>

      {/* Roles & permissions matrix link */}
      <FadeIn className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Roles & permissions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Manage which permissions each role has. Changes apply immediately.
            </p>
          </div>
          <ButtonLink href="/admin/users/roles" variant="outline" size="sm">
            Open matrix
          </ButtonLink>
        </div>
      </FadeIn>

      {/* User list */}
      <FadeIn className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              All users ({rows.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Click a row to view / edit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users yet.
                  </td>
                </tr>
              ) : (
                rows.map((u) => {
                  const roleName = Array.isArray(u.role)
                    ? u.role[0]?.name
                    : u.role?.name;
                  const displayName =
                    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                    u.email ||
                    "Unknown";
                  const initials = displayName
                    .split(" ")
                    .map((s) => s[0]?.toUpperCase())
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("");

                  return (
                    <tr key={u.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </span>
                          <span className="font-medium text-foreground">
                            {displayName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.created_at
                          ? formatDatePh(new Date(u.created_at))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RoleSelect
                          userId={u.id}
                          currentRole={
                            (roleName ?? null) as
                              | "super_admin"
                              | "admin"
                              | "customer"
                              | null
                          }
                          isSelf={u.id === currentUser.id}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}

function RoleCard({
  label,
  count,
  tone,
  icon: Icon,
}: {
  label: string;
  count: number;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <FadeIn className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {count.toLocaleString()}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Icon className={`h-4 w-4 ${tone}`} />
        </div>
      </div>
    </FadeIn>
  );
}