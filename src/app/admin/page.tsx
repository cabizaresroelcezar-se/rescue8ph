import Link from "next/link";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  FileText,
  Boxes,
  ArrowRight,
  BarChart3,
  Users,
  ImageIcon,
} from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Single round-trip per resource; counts only
  const [products, orders, customers, pendingOrders, lowStock, posts] = await Promise.all([
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
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
  ]);

  const lowStockCount =
    (lowStock.data ?? []).filter((i) => i.quantity_on_hand <= i.reorder_level).length ?? 0;

  // Only show the 4 most actionable KPIs
  const kpis = [
    {
      title: "Pending Orders",
      value: pendingOrders.count ?? 0,
      href: "/admin/orders",
      icon: TrendingUp,
      tone: "text-accent",
    },
    {
      title: "Low Stock",
      value: lowStockCount,
      href: "/admin/inventory",
      icon: AlertTriangle,
      tone: "text-destructive",
    },
    {
      title: "Total Products",
      value: products.count ?? 0,
      href: "/admin/products",
      icon: Package,
      tone: "text-primary",
    },
    {
      title: "Published Posts",
      value: posts.count ?? 0,
      href: "/admin/blog",
      icon: FileText,
      tone: "text-primary",
    },
  ];

  const sections = [
    {
      title: "Catalog",
      links: [
        { href: "/admin/products", label: "Products", icon: Package, count: products.count ?? 0 },
        { href: "/admin/inventory", label: "Inventory", icon: Boxes, count: lowStockCount },
        { href: "/admin/media", label: "Media library", icon: ImageIcon },
      ],
    },
    {
      title: "Sales",
      links: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart, count: orders.count ?? 0 },
        { href: "/admin/customers", label: "Customers", icon: Users, count: customers.count ?? 0 },
      ],
    },
    {
      title: "Content",
      links: [
        { href: "/admin/content", label: "Site content", icon: FileText },
        { href: "/admin/blog", label: "Blog", icon: FileText, count: posts.count ?? 0 },
        { href: "/admin/pages", label: "Pages", icon: FileText },
      ],
    },
    {
      title: "Insights",
      links: [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Compact greeting */}
      <FadeIn className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What needs attention today.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <BarChart3 className="h-4 w-4" /> View analytics
        </Link>
      </FadeIn>

      {/* Actionable KPIs */}
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <FadeIn
              key={k.title}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
            >
              <Link href={k.href} className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {k.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {k.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ${k.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </Link>
            </FadeIn>
          );
        })}
      </Stagger>

      {/* Section navigation — replaces the old "Quick Actions" grid */}
      <FadeIn className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Manage your store</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Jump to any section.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <div key={s.title}>
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {s.title}
              </p>
              <ul className="space-y-1">
                {s.links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                        <span className="flex-1">{l.label}</span>
                        {typeof l.count === "number" && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {l.count}
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}