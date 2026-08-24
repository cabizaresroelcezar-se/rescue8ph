import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Boxes,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts in parallel — INTERFACE-ONLY refactor preserves all original queries.
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
      accent: "from-primary/10 to-primary/0",
      tone: "text-primary",
    },
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingCart,
      description: "All orders",
      accent: "from-primary/10 to-primary/0",
      tone: "text-primary",
    },
    {
      title: "Pending Orders",
      value: pendingOrderCount,
      icon: TrendingUp,
      description: "Need attention",
      accent: "from-accent/10 to-accent/0",
      tone: "text-accent",
    },
    {
      title: "Customers",
      value: customerCount,
      icon: Users,
      description: "Registered users",
      accent: "from-primary/10 to-primary/0",
      tone: "text-primary",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      icon: AlertTriangle,
      description: "At or below reorder level",
      accent: "from-destructive/10 to-destructive/0",
      tone: "text-destructive",
    },
    {
      title: "Published Pages",
      value: publishedPageCount,
      icon: FileText,
      description: "CMS pages live",
      accent: "from-primary/10 to-primary/0",
      tone: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your Rescue 8 Philippines store
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-elev-1 transition-colors hover:bg-secondary"
        >
          <BarChart3 className="h-4 w-4" />
          View analytics
        </Link>
      </FadeIn>

      {/* KPI grid */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <FadeIn
              key={stat.title}
              className={
                "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3"
              }
            >
              <div
                aria-hidden
                className={
                  "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100 " +
                  stat.accent
                }
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary " +
                    stat.tone
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </FadeIn>
          );
        })}
      </Stagger>

      {/* Two-column: quick actions + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn className="rounded-xl border border-border bg-card p-6 shadow-elev-1 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Quick Actions
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Jump straight into common tasks.
              </p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <QuickAction
              href="/admin/products"
              title="Manage Products"
              desc="Add, edit, or archive items in your catalog"
              icon={Package}
            />
            <QuickAction
              href="/admin/orders"
              title="View Orders"
              desc="Process payments and fulfillment"
              icon={ShoppingCart}
            />
            <QuickAction
              href="/admin/inventory"
              title="Check Inventory"
              desc="Reorder SKUs below threshold"
              icon={Boxes}
            />
            <QuickAction
              href="/admin/content"
              title="Edit Content"
              desc="Update site copy and CMS pages"
              icon={FileText}
            />
          </div>
        </FadeIn>

        <FadeIn
          delay={80}
          className="rounded-xl border border-border bg-card p-6 shadow-elev-1"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              Needs Attention
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <AttentionItem
              count={pendingOrderCount}
              label="Orders awaiting fulfillment"
              href="/admin/orders"
            />
            <AttentionItem
              count={lowStockCount}
              label="SKUs at or below reorder level"
              href="/admin/inventory"
              tone="destructive"
            />
            <AttentionItem
              count={0}
              label="Customer replies to review"
              href="/admin/customers"
            />
          </ul>
          <Link
            href="/admin/orders"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Review queue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function AttentionItem({
  count,
  label,
  href,
  tone,
}: {
  count: number;
  label: string;
  href: string;
  tone?: "destructive";
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary"
      >
        <span className="text-muted-foreground">{label}</span>
        <span
          className={
            "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold " +
            (tone === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-accent/10 text-accent")
          }
        >
          {count}
        </span>
      </Link>
    </li>
  );
}
