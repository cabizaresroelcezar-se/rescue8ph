import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {params.message && (
        <div className="mb-6 rounded-md bg-primary/10 p-4 text-sm text-primary">
          {params.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          My Account
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {displayName}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
              {profile?.role?.name && (
                <>
                  <p className="mt-2 text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{profile.role.name.replace("_", " ")}</p>
                </>
              )}
            </div>
            <ButtonLink href="/account/profile" variant="outline" size="sm" className="mt-4">Edit Profile</ButtonLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders</CardTitle>
            <CardDescription>View your order history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total orders</p>
            <ButtonLink href="/account/orders" variant="outline" size="sm" className="mt-4">View Orders</ButtonLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Addresses</CardTitle>
            <CardDescription>Manage your delivery addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink href="/account/addresses" variant="outline" size="sm" className="mt-4">Manage Addresses</ButtonLink>
          </CardContent>
        </Card>

        {(profile?.role?.name === "admin" || profile?.role?.name === "super_admin") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Panel</CardTitle>
              <CardDescription>Access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLink href="/admin" size="sm" className="mt-4">Go to Admin</ButtonLink>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}