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

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, role:roles(name)")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role?.name !== "admin" && profile.role?.name !== "super_admin")) {
    redirect("/account");
  }

  const isSuperAdmin = profile.role?.name === "super_admin";

  const sections = [
    { href: "/admin/products", label: "Products", desc: "Manage your product catalog", requires: "PRODUCTS_VIEW" },
    { href: "/admin/orders", label: "Orders", desc: "View and manage customer orders", requires: "ORDERS_VIEW" },
    { href: "/admin/customers", label: "Customers", desc: "View customer accounts", requires: "CUSTOMERS_VIEW" },
    { href: "/admin/inventory", label: "Inventory", desc: "Track stock levels", requires: "INVENTORY_VIEW" },
    { href: "/admin/content", label: "Content", desc: "Manage pages and blog", requires: "CONTENT_VIEW" },
    { href: "/admin/media", label: "Media", desc: "Manage media library", requires: "MEDIA_VIEW" },
    { href: "/admin/users", label: "Users", desc: "Manage user accounts", requires: "USERS_VIEW", superOnly: true },
    { href: "/admin/settings", label: "Settings", desc: "Site configuration", requires: "SETTINGS_VIEW", superOnly: true },
    { href: "/admin/audit-logs", label: "Audit Logs", desc: "Security audit trail", requires: "" },
    { href: "/admin/analytics", label: "Analytics", desc: "Platform analytics", requires: "ANALYTICS_VIEW" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Signed in as {isSuperAdmin ? "Super Admin" : "Admin"} — {user.email}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          // Hide super-admin-only sections from regular admins
          if (section.superOnly && !isSuperAdmin) return null;

          return (
            <Card key={section.href}>
              <CardHeader>
                <CardTitle className="text-lg">{section.label}</CardTitle>
                <CardDescription>{section.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ButtonLink href={section.href} variant="outline" size="sm">
                  Open
                </ButtonLink>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <ButtonLink href="/account" variant="outline">Back to Account</ButtonLink>
      </div>
    </div>
  );
}