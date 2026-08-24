import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/lib/motion";
import { updateProfile } from "@/features/auth/actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="bg-surface">
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-eyebrow">My Account</p>
              <h1 className="mt-2 text-display-lg text-foreground">
                Edit Profile
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your personal information.
              </p>
            </div>
            <ButtonLink href="/account" variant="outline" size="sm">
              Back to Account
            </ButtonLink>
          </FadeIn>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr]">
        {/* Form */}
        <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground">
                Name and contact details that appear on orders.
              </p>
            </div>
          </div>

          {params.error && (
            <div className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="mt-5 flex items-start gap-2 rounded-md border border-emerald-300/40 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              {params.message}
            </div>
          )}

          <form action={updateProfile} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile?.first_name || ""}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile?.last_name || ""}
                  placeholder="Dela Cruz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ""}
                placeholder="+63 9XX XXX XXXX"
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                Used for delivery updates and order coordination.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Save Changes</Button>
              <ButtonLink href="/account" variant="outline">
                Cancel
              </ButtonLink>
            </div>
          </form>
        </FadeIn>

        {/* Tips */}
        <FadeIn delay={80} className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
          <h3 className="text-base font-semibold text-foreground">
            Why we ask
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Your name appears on delivery receipts.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Your phone is used by couriers for delivery updates.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              We never share your contact details with third parties.
            </li>
          </ul>
        </FadeIn>
      </div>
    </div>
  );
}
