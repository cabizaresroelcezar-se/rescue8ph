import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Mail,
  ArrowRight,
  Star,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FadeIn, Stagger } from "@/lib/motion";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, role:roles(name)")
    .eq("id", user.id)
    .single();

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : user.email?.split("@")[0] || "User";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const roleName = (profile?.role as { name?: string } | undefined)?.name;
  const isAdmin = roleName === "admin" || roleName === "super_admin";

  const profileComplete =
    Boolean(profile?.first_name && profile?.last_name && profile?.phone);

  return (
    <div className="bg-surface">
      {/* Greeting hero */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary shadow-elev-1">
                {initials || "R"}
              </div>
              <div>
                <p className="text-eyebrow">My Account</p>
                <h1 className="mt-1 text-display-md text-foreground">
                  Hello, {displayName.split(" ")[0]}
                </h1>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
            </div>
            <ButtonLink href="/products">
              Continue shopping
              <ArrowRight />
            </ButtonLink>
          </FadeIn>
        </div>
      </section>

      {/* Flash message */}
      {params.message && (
        <div className="container-page pt-6">
          <div className="rounded-md border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
            {params.message}
          </div>
        </div>
      )}

      {/* Profile completion nudge */}
      {!profileComplete && (
        <div className="container-page pt-6">
          <FadeIn className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Complete your profile
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your name and phone number for faster checkout and order
                updates.
              </p>
            </div>
            <ButtonLink href="/account/profile" size="sm" variant="outline">
              Update profile
            </ButtonLink>
          </FadeIn>
        </div>
      )}

      <div className="container-page py-10">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AccountCard
            icon={ShoppingBag}
            title="Orders"
            value={(orderCount ?? 0).toLocaleString()}
            subtitle="Total orders placed"
            cta={{ href: "/account/orders", label: "View orders" }}
          />
          <AccountCard
            icon={MapPin}
            title="Addresses"
            subtitle="Manage your delivery addresses"
            cta={{ href: "/account/addresses", label: "Manage addresses" }}
          />
          <AccountCard
            icon={UserIcon}
            title="Profile"
            subtitle="Name, phone, email preferences"
            cta={{ href: "/account/profile", label: "Edit profile" }}
          />
          <AccountCard
                      icon={Heart}
                      title="Wishlist"
                      subtitle="Items you&apos;re saving for later"
                      cta={{ href: "/account/wishlist", label: "View wishlist" }}
                    />
          <AccountCard
            icon={Star}
            title="Reviews"
            subtitle="Reviews you&apos;ve written"
            cta={{ href: "/account/orders", label: "Write a review" }}
          />
          {isAdmin && (
                      <AccountCard
                        icon={ShieldCheck}
                        title="Admin Panel"
                        subtitle="Manage the store, orders, and content"
                        cta={{ href: "/admin", label: "Go to admin" }}
                        accent
                      />
                    )}
                    <FadeIn className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-elev-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-foreground">Sign out</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        End your session on this device
                      </p>
                      <div className="mt-auto pt-4">
                        <SignOutButton />
                      </div>
                    </FadeIn>
                  </Stagger>

        {/* Account meta */}
        <FadeIn delay={120} className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Account details</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-3">
            <Field label="Email" value={user.email || "—"} />
            <Field
              label="Name"
              value={
                profile?.first_name || profile?.last_name
                  ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                  : "Not set"
              }
            />
            <Field label="Phone" value={profile?.phone || "Not set"} />
            {roleName && (
              <Field
                label="Role"
                value={roleName.replace("_", " ").replace(/^./, (c) => c.toUpperCase())}
              />
            )}
          </dl>
        </FadeIn>
      </div>
    </div>
  );
}

function AccountCard({
  icon: Icon,
  title,
  value,
  subtitle,
  cta,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value?: string;
  subtitle?: string;
  cta: { href: string; label: string };
  accent?: boolean;
}) {
  return (
    <FadeIn
      className={
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3 " +
        (accent ? "border-accent/30 bg-accent/5" : "border-border")
      }
    >
      <div className="flex items-start justify-between">
        <div
          className={
            "flex h-10 w-10 items-center justify-center rounded-lg " +
            (accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        {value && (
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-auto pt-4">
        <ButtonLink href={cta.href} size="sm" variant="ghost" className="px-0">
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </ButtonLink>
      </div>
    </FadeIn>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}
