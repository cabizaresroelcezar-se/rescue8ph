import { SignOutButton } from "@/components/auth/sign-out-button";
import { Shield } from "lucide-react";

export function AdminTopbar({
  email,
  firstName,
  isSuperAdmin,
}: {
  email: string;
  firstName: string | null;
  isSuperAdmin: boolean;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">
          {isSuperAdmin ? "Super Admin" : "Admin"} Panel
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {firstName || email.split("@")[0]}
        </span>
        <span className="text-xs text-muted-foreground">({email})</span>
        <SignOutButton />
      </div>
    </header>
  );
}