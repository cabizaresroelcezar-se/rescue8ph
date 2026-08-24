import { createClient } from "@/lib/supabase/server";
import { Users, Mail, Phone } from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { formatDatePh } from "@/lib/format";

type ProfileWithRole = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  role: { name: string }[] | { name: string } | null;
};

const STATUS_TONE: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  INACTIVE:  "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const ROLE_TONE: Record<string, string> = {
  super_admin: "bg-accent/10 text-accent",
  admin:       "bg-primary/10 text-primary",
  staff:       "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  customer:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: profiles, count } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, status, created_at, role:roles(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  const typedProfiles = (profiles || []) as unknown as ProfileWithRole[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count != null
              ? `${count.toLocaleString()} registered user${count === 1 ? "" : "s"}`
              : "View registered customer accounts"}
          </p>
        </div>
      </FadeIn>

      {!typedProfiles || typedProfiles.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No customers yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            When customers register they&apos;ll appear here.
          </p>
        </FadeIn>
      ) : (
        <FadeIn className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-center">Role</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {typedProfiles.map((profile) => {
                  const roleName = Array.isArray(profile.role)
                    ? profile.role[0]?.name
                    : profile.role?.name;
                  const displayName =
                    [profile.first_name, profile.last_name]
                      .filter(Boolean)
                      .join(" ") || "—";
                  const initials = displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((s) => s[0]?.toUpperCase())
                    .slice(0, 2)
                    .join("");
                  return (
                    <tr
                      key={profile.id}
                      className="transition-colors hover:bg-secondary/40"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials || "?"}
                          </div>
                          <span className="font-semibold text-foreground">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {profile.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {profile.phone}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            No phone
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            (roleName && ROLE_TONE[roleName]) ||
                            "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"
                          }`}
                        >
                          {roleName?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS_TONE[profile.status] ??
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
                          }`}
                        >
                          {profile.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDatePh(profile.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
