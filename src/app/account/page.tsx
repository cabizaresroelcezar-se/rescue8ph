import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Star,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RecentlyViewedSection } from "@/components/account/recently-viewed-section";
import { FadeIn, Stagger } from "@/lib/motion";
import { getMediaUrl } from "@/lib/media";

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

  const profileComplete = Boolean(
    profile?.first_name && profile?.last_name && profile?.phone,
  );

  const avatarUrl = getMediaUrl(profile?.avatar_url ?? null, "avatars");

  return (
    <div className="container-page py-6">
      {/* Compact header */}
      <FadeIn className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-primary/10 text-base font-bold text-primary shadow-elev-1">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {initials || "R"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {displayName}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <ButtonLink href="/products" size="sm" variant="outline">
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </FadeIn>

      {/* Flash message */}
      {params.message && (
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
          {params.message}
        </div>
      )}

      {/* Profile completion nudge */}
      {!profileComplete && (
        <FadeIn className="mt-3 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
          <Clock className="h-4 w-4 shrink-0 text-accent" />
          <p className="flex-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Complete your profile
            </span>{" "}
            — add your name and phone number for faster checkout.
          </p>
          <ButtonLink href="/account/profile" size="sm" variant="outline">
            Update
          </ButtonLink>
        </FadeIn>
      )}

      {/* Cards grid */}
      <Stagger className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          subtitle="Manage delivery addresses"
          cta={{ href: "/account/addresses", label: "Manage addresses" }}
        />
        <AccountCard
          icon={UserIcon}
          title="Profile"
          subtitle="Name, phone, preferences"
          cta={{ href: "/account/profile", label: "Edit profile" }}
        />
        <AccountCard
          icon={Heart}
          title="Wishlist"
          subtitle="Items saved for later"
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
            subtitle="Manage store, orders, content"
            cta={{ href: "/admin", label: "Go to admin" }}
            accent
          />
        )}
        <FadeIn className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-elev-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <LogOut className="h-4 w-4" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">Sign out</p>
          <p className="mt-1 text-xs text-muted-foreground">
            End your session on this device
          </p>
          <div className="mt-auto pt-3">
            <SignOutButton />
          </div>
        </FadeIn>
      </Stagger>

      {/* Recently viewed */}
      <RecentlyViewedSection />
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
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3 " +
        (accent ? "border-accent/30 bg-accent/5" : "border-border")
      }
    >
      <div className="flex items-start justify-between">
        <div
          className={
            "flex h-8 w-8 items-center justify-center rounded-lg " +
            (accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")
          }
        >
          <Icon className="h-4 w-4" />
        </div>
        {value && (
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-auto pt-3">
        <ButtonLink href={cta.href} size="sm" variant="ghost" className="px-0">
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </ButtonLink>
      </div>
    </FadeIn>
  );
}