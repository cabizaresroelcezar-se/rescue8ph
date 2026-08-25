import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminSidebarTrigger } from "@/components/admin/sidebar-trigger";
import { ShieldCheck, ArrowLeft, User } from "lucide-react";

export function AdminTopbar({
  email,
  firstName,
  isSuperAdmin,
}: {
  email: string;
  firstName: string | null;
  isSuperAdmin: boolean;
}) {
  const displayName = firstName || email.split("@")[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      {/* Mobile menu trigger + role badge */}
      <AdminSidebarTrigger />

      <span
        className={
          "hidden inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex " +
          (isSuperAdmin
            ? "bg-accent/10 text-accent"
            : "bg-primary/10 text-primary")
        }
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        {isSuperAdmin ? "Super Admin" : "Admin"}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {/* Back to storefront */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open storefront in new tab"
          className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Storefront
        </Link>

        {/* Compact user chip */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-0.5 pl-1 pr-2.5 shadow-elev-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-xs font-medium text-foreground">{displayName}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <User className="h-2.5 w-2.5" />
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
