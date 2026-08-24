import { SignOutButton } from "@/components/auth/sign-out-button";
import { Bell, Search, ShieldCheck, Mail, ChevronDown } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <div className="flex items-center gap-2">
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
            (isSuperAdmin
              ? "bg-accent/10 text-accent"
              : "bg-primary/10 text-primary")
          }
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </span>
        <h1 className="hidden text-sm font-medium text-foreground sm:block">
          Rescue 8 Philippines · Back Office
        </h1>
      </div>

      <form
        role="search"
        className="ml-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm shadow-elev-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:flex"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <input
          type="search"
          placeholder="Search products, orders, customers…"
          className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
          />
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-full border border-border bg-background py-0.5 pl-1 pr-3 shadow-elev-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-xs font-medium text-foreground">{displayName}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Mail className="h-2.5 w-2.5" />
              <span className="truncate max-w-[160px]">{email}</span>
            </span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden />
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
