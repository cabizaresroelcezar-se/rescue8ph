import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Mail, Phone, Calendar, UserCog, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDatePh } from "@/lib/format";
import { RoleSelect } from "../role-select";
import { ProfileEditor } from "./profile-editor";

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) redirect(`/auth/login?redirectTo=/admin/users/${id}`);

  // Verify super_admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", currentUser.id)
    .single();
  const currentRole = (
    currentProfile as { roles?: { name?: string } } | null
  )?.roles?.name;
  if (currentRole !== "super_admin") redirect("/admin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone, created_at, role_id, role:roles(name, description)",
    )
    .eq("id", id)
    .single();
  if (error || !profile) notFound();

  const roleName = (
    profile as unknown as {
      role: { name: string } | { name: string }[] | null;
    }
  ).role
    ? Array.isArray((profile as unknown as { role: { name: string }[] }).role)
      ? (profile as unknown as { role: { name: string }[] }).role[0]?.name ??
        null
      : (
          (profile as unknown as { role: { name: string } | null }).role as
            | { name: string }
            | null
        )?.name ?? null
    : null;

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email ||
    "Unknown";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Users
        </Link>
        <span>/</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      {/* User card */}
      <FadeIn className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {displayName
                .split(" ")
                .map((s: string) => s[0]?.toUpperCase())
                .filter(Boolean)
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {profile.email || "—"}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {profile.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDatePh(new Date(profile.created_at))}
                </span>
              </div>
            </div>
          </div>
          <div>
            <RoleSelect
              userId={profile.id}
              currentRole={
                (roleName ?? null) as
                  | "super_admin"
                  | "admin"
                  | "customer"
                  | null
              }
              isSelf={profile.id === currentUser.id}
            />
          </div>
        </div>
      </FadeIn>

      {/* Profile editor */}
      <FadeIn>
        <ProfileEditor
          userId={profile.id}
          initial={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
          }}
        />
      </FadeIn>

      {/* Quick actions */}
      <FadeIn className="rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <UserCog className="h-4 w-4" /> Quick actions
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="rounded-md px-3 py-2 transition-colors hover:bg-secondary">
            <ButtonLink
              href={`/admin/orders?customer_id=${profile.id}`}
              variant="ghost"
              size="sm"
            >
              View their orders →
            </ButtonLink>
          </li>
          <li className="rounded-md px-3 py-2 transition-colors hover:bg-secondary">
            <ButtonLink
              href={`/admin/audit-logs?resource_id=${profile.id}`}
              variant="ghost"
              size="sm"
            >
              View their audit log →
            </ButtonLink>
          </li>
          <li className="rounded-md px-3 py-2 transition-colors hover:bg-secondary">
            <ButtonLink
              href="/admin/users/roles"
              variant="ghost"
              size="sm"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Manage role permissions →
            </ButtonLink>
          </li>
        </ul>
      </FadeIn>
    </div>
  );
}