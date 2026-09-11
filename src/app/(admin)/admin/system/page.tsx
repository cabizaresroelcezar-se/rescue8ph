import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Database,
  HardDrive,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Activity,
  Server,
  ShieldCheck,
} from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";

export const metadata = {
  title: "System · Super Admin",
  description: "System health, database stats, and platform overview",
};

export default async function SystemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin/system");

  // Verify super_admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();
  if (profile) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("name")
      .eq("id", profile.role_id)
      .single();
    if (roleData?.name !== "super_admin") {
      redirect("/admin");
    }
  } else {
    redirect("/admin");
  }

  // Gather system stats in parallel
  const [
    ordersCount,
    productsCount,
    usersCount,
    blogCount,
    pagesCount,
    reviewsCount,
    inventoryCount,
    auditCount,
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("pages").select("*", { count: "exact", head: true }),
    supabase.from("product_reviews").select("*", { count: "exact", head: true }),
    supabase.from("inventory").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Orders", value: ordersCount.count ?? 0, icon: ShoppingCart, color: "text-primary" },
    { label: "Products", value: productsCount.count ?? 0, icon: Package, color: "text-primary" },
    { label: "Users", value: usersCount.count ?? 0, icon: Users, color: "text-primary" },
    { label: "Blog Posts", value: blogCount.count ?? 0, icon: FileText, color: "text-accent" },
    { label: "CMS Pages", value: pagesCount.count ?? 0, icon: FileText, color: "text-accent" },
    { label: "Reviews", value: reviewsCount.count ?? 0, icon: Activity, color: "text-primary" },
    { label: "Inventory Records", value: inventoryCount.count ?? 0, icon: Database, color: "text-primary" },
    { label: "Audit Log Entries", value: auditCount.count ?? 0, icon: ShieldCheck, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Super Admin</p>
          <h1 className="mt-2 text-display-md text-foreground">System Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform health, database statistics, and resource usage
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Server className="h-3.5 w-3.5" />
          All systems operational
        </span>
      </FadeIn>

      {/* Stats grid */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <FadeIn
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 shadow-elev-1"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </FadeIn>
          );
        })}
      </Stagger>

      {/* Storage overview */}
      <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Storage Buckets</h2>
            <p className="text-xs text-muted-foreground">Media storage usage by bucket</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["products", "blog", "banners", "avatars"].map((bucket) => (
            <StorageBucketStat key={bucket} bucket={bucket} />
          ))}
        </div>
      </FadeIn>

      {/* Environment info */}
      <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Environment</h2>
            <p className="text-xs text-muted-foreground">Platform configuration</p>
          </div>
        </div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Platform</dt>
            <dd className="mt-1 font-medium text-foreground">Next.js 16 + Supabase</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Database</dt>
            <dd className="mt-1 font-medium text-foreground">PostgreSQL (Supabase)</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hosting</dt>
            <dd className="mt-1 font-medium text-foreground">Vercel</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</dt>
            <dd className="mt-1 font-medium text-foreground">ap-northeast-2 (Seoul)</dd>
          </div>
        </dl>
      </FadeIn>
    </div>
  );
}

async function StorageBucketStat({ bucket }: { bucket: string }) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(bucket).list("", { limit: 100 });
  const count = (data || []).filter((f) => f.id).length;
  const folderCount = (data || []).filter((f) => !f.id).length;

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-sm font-semibold text-foreground capitalize">{bucket}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground">
        {count} file{count !== 1 ? "s" : ""} · {folderCount} folder{folderCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}