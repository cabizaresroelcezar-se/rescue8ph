import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [productsRes, ordersRes, customersRes, pendingOrdersRes, lowStockRes, publishedPagesRes] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["PENDING", "PAYMENT_PENDING", "PAID", "PROCESSING"]),
      supabase
        .from("inventory")
        .select("quantity_on_hand, reorder_level")
        .lt("quantity_on_hand", 10),
      supabase
        .from("pages")
        .select("*", { count: "exact", head: true })
        .eq("status", "PUBLISHED"),
    ]);

  const productCount = productsRes.count ?? 0;
  const orderCount = ordersRes.count ?? 0;
  const customerCount = customersRes.count ?? 0;
  const pendingOrderCount = pendingOrdersRes.count ?? 0;
  const lowStockCount = lowStockRes.data?.filter(
    (i) => i.quantity_on_hand <= i.reorder_level,
  ).length ?? 0;
  const publishedPageCount = publishedPagesRes.count ?? 0;

  const stats = [
    {
      title: "Total Products",
      value: productCount,
      icon: Package,
      description: "Products in catalog",
      color: "text-primary",
    },
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingCart,
      description: "All orders",
      color: "text-primary",
    },
    {
      title: "Pending Orders",
      value: pendingOrderCount,
      icon: TrendingUp,
      description: "Need attention",
      color: "text-accent",
    },
    {
      title: "Customers",
      value: customerCount,
      icon: Users,
      description: "Registered users",
      color: "text-primary",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      icon: AlertTriangle,
      description: "At or below reorder level",
      color: "text-destructive",
    },
    {
      title: "Published Pages",
      value: publishedPageCount,
      icon: DollarSign,
      description: "CMS pages live",
      color: "text-primary",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your Rescue 8 Philippines store
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
                <CardDescription className="mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/admin/products"
            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-surface"
          >
            Manage Products
          </a>
          <a
            href="/admin/orders"
            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-surface"
          >
            View Orders
          </a>
          <a
            href="/admin/inventory"
            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-surface"
          >
            Check Inventory
          </a>
          <a
            href="/admin/content"
            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-surface"
          >
            Edit Content
          </a>
        </div>
      </div>
    </div>
  );
}