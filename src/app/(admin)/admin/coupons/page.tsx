import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Ticket, Plus, Calendar } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDatePh } from "@/lib/format";
import { CouponActiveToggle } from "./active-toggle";
import { DeleteCouponButton } from "./delete-button";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  minimum_order_amount: number | null;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select(
      "id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, usage_count, starts_at, expires_at, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  const rows: Coupon[] = (coupons ?? []) as unknown as Coupon[];
  const now = new Date();

  const stats = {
    total: rows.length,
    active: rows.filter(
      (c) =>
        c.is_active &&
        (!c.starts_at || new Date(c.starts_at) <= now) &&
        (!c.expires_at || new Date(c.expires_at) >= now) &&
        (!c.usage_limit || c.usage_count < c.usage_limit),
    ).length,
    expired: rows.filter((c) => c.expires_at && new Date(c.expires_at) < now)
      .length,
    totalRedemptions: rows.reduce((sum, c) => sum + c.usage_count, 0),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-eyebrow text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" />
            Sales
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create promo codes that customers can apply at checkout.
          </p>
        </div>
        <ButtonLink href="/admin/coupons/new" size="sm">
          <Plus className="h-3.5 w-3.5" />
          New coupon
        </ButtonLink>
      </header>

      {/* Stats */}
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total coupons" value={stats.total} />
        <Stat label="Currently active" value={stats.active} tone="text-green-600" />
        <Stat label="Expired" value={stats.expired} tone="text-muted-foreground" />
        <Stat label="Total redemptions" value={stats.totalRedemptions} tone="text-primary" />
      </Stagger>

      {/* Table */}
      <FadeIn className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            All coupons ({rows.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Validity</th>
                <th className="px-4 py-3 text-center font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No coupons yet. Click <strong>New coupon</strong> to
                    create one.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const expired =
                    c.expires_at && new Date(c.expires_at) < now;
                  const notStarted =
                    c.starts_at && new Date(c.starts_at) > now;
                  const usedUp =
                    c.usage_limit && c.usage_count >= c.usage_limit;
                  const status = !c.is_active
                    ? "inactive"
                    : expired
                      ? "expired"
                      : notStarted
                        ? "scheduled"
                        : usedUp
                          ? "limit-reached"
                          : "active";

                  return (
                    <tr key={c.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/coupons/${c.id}`}
                          className="font-mono font-semibold text-foreground hover:text-primary"
                        >
                          {c.code}
                        </Link>
                        {c.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {c.discount_type === "PERCENTAGE"
                          ? `${c.discount_value}% off`
                          : `₱${c.discount_value.toLocaleString("en-PH")} off`}
                        {c.maximum_discount_amount && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            cap ₱
                            {c.maximum_discount_amount.toLocaleString("en-PH")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.minimum_order_amount
                          ? `�${c.minimum_order_amount.toLocaleString("en-PH")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.starts_at || c.expires_at ? (
                          <span className="inline-flex flex-col gap-0.5">
                            {c.starts_at && (
                              <span>
                                <Calendar className="mr-1 inline h-3 w-3" />
                                {formatDatePh(new Date(c.starts_at))}
                              </span>
                            )}
                            {c.expires_at && (
                              <span>
                                → {formatDatePh(new Date(c.expires_at))}
                              </span>
                            )}
                          </span>
                        ) : (
                          "Always"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-foreground">
                          {c.usage_count}
                          {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <CouponActiveToggle
                          id={c.id}
                          initial={c.is_active}
                          status={status}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/coupons/${c.id}`}
                            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                          >
                            Edit
                          </Link>
                          <DeleteCouponButton
                            id={c.id}
                            code={c.code}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <FadeIn className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}>
        {value.toLocaleString()}
      </p>
    </FadeIn>
  );
}