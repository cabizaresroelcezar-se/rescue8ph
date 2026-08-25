import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { PermissionToggle } from "./permission-toggle";

type Role = { id: string; name: string; description: string | null };
type Permission = { id: string; code: string; description: string | null };
type RolePermission = { role_id: string; permission_id: string };

export default async function RolesPermissionsPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) redirect("/auth/login?redirectTo=/admin/users/roles");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", currentUser.id)
    .single();
  const currentRole = (
    currentProfile as { roles?: { name?: string } } | null
  )?.roles?.name;
  if (currentRole !== "super_admin") redirect("/admin");

  // Fetch roles, permissions, and current assignments in parallel
  const [
    { data: rolesData },
    { data: permissionsData },
    { data: assignmentsData },
  ] = await Promise.all([
    supabase
      .from("roles")
      .select("id, name, description")
      .order("name"),
    supabase
      .from("permissions")
      .select("id, code, description")
      .order("code"),
    supabase.from("role_permissions").select("role_id, permission_id"),
  ]);

  const roles: Role[] = (rolesData ?? []) as Role[];
  const permissions: Permission[] = (permissionsData ?? []) as Permission[];
  const assignments: RolePermission[] =
    (assignmentsData ?? []) as RolePermission[];

  // Build a Set for quick lookup: "roleId|permId" => bool
  const assignmentSet = new Set(
    assignments.map((a) => `${a.role_id}|${a.permission_id}`),
  );

  // Group permissions by prefix for nicer display
  const groups = new Map<string, Permission[]>();
  for (const p of permissions) {
    const prefix = p.code.split("_")[0];
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix)!.push(p);
  }
  const grouped = Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Users
        </Link>
        <span>/</span>
        <span className="text-foreground">Roles & permissions</span>
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Roles & permissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle individual permissions per role. Super-admin is locked to
          full access and can&apos;t be edited.
        </p>
      </header>

      {/* Role summary */}
      <FadeIn className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {r.name === "super_admin" ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                )}
                {r.name}
              </div>
              {r.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Permission matrix */}
      <FadeIn className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Permission matrix
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {permissions.length} permissions · {roles.length} roles
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-secondary/40 px-4 py-3 font-medium">
                  Permission
                </th>
                {roles.map((r) => (
                  <th
                    key={r.id}
                    className="px-4 py-3 text-center font-medium"
                  >
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map(([group, perms]) => (
                <>
                  <tr
                    key={`group-${group}`}
                    className="border-y border-border bg-surface/50"
                  >
                    <td
                      colSpan={1 + roles.length}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {group}
                    </td>
                  </tr>
                  {perms.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/20"
                    >
                      <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
                          {p.code}
                        </code>
                        {p.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.description}
                          </p>
                        )}
                      </td>
                      {roles.map((r) => {
                        const has = assignmentSet.has(`${r.id}|${p.id}`);
                        const isSuperAdmin = r.name === "super_admin";
                        return (
                          <td
                            key={r.id}
                            className="px-4 py-2.5 text-center"
                          >
                            <PermissionToggle
                              roleName={
                                r.name as "admin" | "customer" | "super_admin"
                              }
                              permissionCode={p.code}
                              granted={isSuperAdmin ? true : has}
                              locked={isSuperAdmin}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>

      <p className="text-xs text-muted-foreground">
        Note: customers don&apos;t access the admin dashboard, but their
        permissions are still tracked for future self-service features.
      </p>
    </div>
  );
}