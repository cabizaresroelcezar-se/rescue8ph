import { createClient } from "@/lib/supabase/server";
import { FadeIn, Stagger } from "@/lib/motion";
import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Analytics",
  description: "Platform analytics and sales insights",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Fetch analytics data in parallel
  const [
    ordersRes,
    paidOrdersRes,
    customersRes,
    productsRes,
    lowStockRes,
    recentOrdersRes,
    topProductsRes,
    ordersByStatusRes,
  ] = await Promise.all([
    supabase.from("orders").select("grand_total, created_at").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("grand_total")
      .in("status", ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("inventory")
      .select("quantity_on_hand, reorder_level"),
    supabase
      .from("orders")
      .select("id, order_number, status, grand_total, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("order_items")
      .select("product_name, quantity, subtotal")
      .order("subtotal", { ascending: false })
      .limit(10),
    supabase.from("orders").select("status"),
  ]);

  // Calculate revenue
  const totalRevenue = (paidOrdersRes.data || []).reduce(
    (sum, o) => sum + Number(o.grand_total),
    0,
  );
  const allOrdersValue = (ordersRes.data || []).reduce(
    (sum, o) => sum + Number(o.grand_total),
    0,
  );

  // Count orders by status
  const statusCounts: Record<string, number> = {};
  (ordersByStatusRes.data || []).forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Top products by revenue
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  (topProductsRes.data || []).forEach((item) => {
    const name = item.product_name;
    if (!productMap[name]) {
      productMap[name] = { name, qty: 0, revenue: 0 };
    }
    productMap[name].qty += item.quantity;
    productMap[name].revenue += Number(item.subtotal);
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockCount =
    lowStockRes.data?.filter(
      (i) => i.quantity_on_hand <= i.reorder_level,
    ).length ?? 0;

  // Recent orders trend (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = (ordersRes.data || []).filter(
    (o) => new Date(o.created_at) >= sevenDaysAgo,
  );
  const recentRevenue = recentOrders.reduce(
    (sum, o) => sum + Number(o.grand_total),
    0,
  );

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      description: "From paid/fulfilled orders",
      tone: "text-primary",
    },
    {
      title: "Gross Order Value",
      value: formatCurrency(allOrdersValue),
      icon: BarChart3,
      description: "All orders including pending",
      tone: "text-primary",
    },
    {
      title: "Recent 7-Day Revenue",
      value: formatCurrency(recentRevenue),
      icon: TrendingUp,
      description: `${recentOrders.length} orders in last 7 days`,
      tone: "text-accent",
    },
    {
      title: "Total Customers",
      value: (customersRes.count ?? 0).toLocaleString(),
      icon: Users,
      description: "Registered users",
      tone: "text-primary",
    },
    {
      title: "Total Products",
      value: (productsRes.count ?? 0).toLocaleString(),
      icon: Package,
      description: "Products in catalog",
      tone: "text-primary",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      description: "At or below reorder level",
      tone: "text-destructive",
    },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    PAYMENT_PENDING: "Payment Pending",
    PAID: "Paid",
    PROCESSING: "Processing",
    READY_TO_SHIP: "Ready to Ship",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED: "Partially Refunded",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-muted text-muted-foreground",
    PAYMENT_PENDING: "bg-accent/10 text-accent",
    PAID: "bg-primary/10 text-primary",
    PROCESSING: "bg-primary/10 text-primary",
    READY_TO_SHIP: "bg-primary/10 text-primary",
    SHIPPED: "bg-primary/10 text-primary",
    OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
    DELIVERED: "bg-emerald-500/10 text-emerald-600",
    CANCELLED: "bg-destructive/10 text-destructive",
    FAILED: "bg-destructive/10 text-destructive",
    REFUNDED: "bg-destructive/10 text-destructive",
    PARTIALLY_REFUNDED: "bg-accent/10 text-accent",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform analytics and sales insights
          </p>
        </div>
      </FadeIn>

      {/* KPI Grid */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <FadeIn
              key={stat.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-3"
            >
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
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

      {/* Two-column: Order Status + Top Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <FadeIn className="rounded-xl border border-border bg-card p-6 shadow-elev-1">
          <h2 className="text-base font-semibold text-foreground">
            Orders by Status
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Current distribution of all orders
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(statusCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {statusLabels[status] || status}
                  </span>
                  <span
                    className={
                      "inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full px-2.5 text-xs font-semibold " +
                      (statusColors[status] || "bg-muted text-muted-foreground")
                    }
                  >
                    {count}
                  </span>
                </div>
              ))}
            {Object.keys(statusCounts).length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders yet
              </p>
            )}
          </div>
        </FadeIn>

        {/* Top Products by Revenue */}
        <FadeIn
          delay={80}
          className="rounded-xl border border-border bg-card p-6 shadow-elev-1"
        >
          <h2 className="text-base font-semibold text-foreground">
            Top Products by Revenue
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Best-performing products from order items
          </p>
          <div className="mt-4 space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.qty} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No order data yet
              </p>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Recent Orders Table */}
      <FadeIn
        delay={120}
        className="rounded-xl border border-border bg-card p-6 shadow-elev-1"
      >
        <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Latest 10 orders across all statuses
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Order #
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersRes.data && recentOrdersRes.data.length > 0 ? (
                recentOrdersRes.data.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-surface">
                    <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold " +
                          (statusColors[order.status] ||
                            "bg-muted text-muted-foreground")
                        }
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-foreground">
                      {formatCurrency(Number(order.grand_total))}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}