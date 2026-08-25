"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Percent, PhilippinePeso, Info } from "lucide-react";
import { createCoupon, updateCoupon } from "@/features/coupons/actions";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { cn } from "@/lib/utils";

export interface CouponFormInitial {
  id: string;
  code: string;
  description: string | null;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  minimum_order_amount: number | null;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export function CouponForm({ initial }: { initial?: CouponFormInitial }) {
  const isEdit = Boolean(initial?.id);
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(700);

  const [code, setCode] = React.useState(initial?.code ?? "");
  const [description, setDescription] = React.useState(
    initial?.description ?? "",
  );
  const [discountType, setDiscountType] = React.useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >(initial?.discount_type ?? "PERCENTAGE");
  const [discountValue, setDiscountValue] = React.useState(
    String(initial?.discount_value ?? ""),
  );
  const [minOrder, setMinOrder] = React.useState(
    initial?.minimum_order_amount ? String(initial.minimum_order_amount) : "",
  );
  const [maxDiscount, setMaxDiscount] = React.useState(
    initial?.maximum_discount_amount ? String(initial.maximum_discount_amount) : "",
  );
  const [usageLimit, setUsageLimit] = React.useState(
    initial?.usage_limit ? String(initial.usage_limit) : "",
  );
  const [startsAt, setStartsAt] = React.useState(
    initial?.starts_at ? toLocalDatetime(initial.starts_at) : "",
  );
  const [expiresAt, setExpiresAt] = React.useState(
    initial?.expires_at ? toLocalDatetime(initial.expires_at) : "",
  );
  const [isActive, setIsActive] = React.useState(initial?.is_active ?? true);

  React.useEffect(() => {
    if (!initial) return;
    // Reset fields when the prop changes (legitimate prop reset)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(initial.code);
    setDescription(initial.description ?? "");
    setDiscountType(initial.discount_type);
    setDiscountValue(String(initial.discount_value));
    setMinOrder(
      initial.minimum_order_amount ? String(initial.minimum_order_amount) : "",
    );
    setMaxDiscount(
      initial.maximum_discount_amount
        ? String(initial.maximum_discount_amount)
        : "",
    );
    setUsageLimit(initial.usage_limit ? String(initial.usage_limit) : "");
    setStartsAt(initial.starts_at ? toLocalDatetime(initial.starts_at) : "");
    setExpiresAt(initial.expires_at ? toLocalDatetime(initial.expires_at) : "");
    setIsActive(initial.is_active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const payload = {
      code,
      description: description || null,
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      minimum_order_amount: minOrder ? parseFloat(minOrder) : null,
      maximum_discount_amount: maxDiscount ? parseFloat(maxDiscount) : null,
      usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    const result = isEdit && initial?.id
      ? await updateCoupon(initial.id, payload)
      : await createCoupon(payload);

    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (!isEdit && "id" in result && result.id) {
      router.push(`/admin/coupons/${result.id}`);
    } else {
      setSavedAt(new Date().toLocaleTimeString("en-PH"));
      refresh();
    }
  }

  const discountValueNum = parseFloat(discountValue);
  const minOrderNum = parseFloat(minOrder);
  const validDiscount = discountValueNum > 0;
  const validMin = !minOrder || minOrderNum >= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/admin/coupons"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Coupons
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {isEdit ? code || "Edit coupon" : "New coupon"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              Saved at {savedAt}
            </span>
          )}
          <button
            type="submit"
            disabled={busy || !code.trim() || !validDiscount || !validMin}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy || pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {pending && !busy
              ? "Saved"
              : isEdit
                ? "Save changes"
                : "Create coupon"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column — main fields */}
        <div className="space-y-5">
          {/* Code + status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="code"
                  className="text-xs font-medium text-foreground"
                >
                  Coupon code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. SUMMER20"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-base font-semibold uppercase outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Letters, numbers, no spaces. Auto-uppercased.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">
                  Status
                </label>
                <label className="mt-1 flex h-[42px] cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="description"
                className="text-xs font-medium text-foreground"
              >
                Internal description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Summer 2026 site-wide promo (not shown to customers)"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Discount */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h2 className="text-sm font-semibold text-foreground">Discount</h2>

            {/* Discount type tabs */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <TypeTab
                active={discountType === "PERCENTAGE"}
                onClick={() => setDiscountType("PERCENTAGE")}
                icon={Percent}
                label="Percentage"
              />
              <TypeTab
                active={discountType === "FIXED_AMOUNT"}
                onClick={() => setDiscountType("FIXED_AMOUNT")}
                icon={PhilippinePeso}
                label="Fixed amount"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="discount_value"
                className="text-xs font-medium text-foreground"
              >
                {discountType === "PERCENTAGE"
                  ? "Discount percentage"
                  : "Discount amount (PHP)"}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                  placeholder={
                    discountType === "PERCENTAGE" ? "20" : "100"
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <span className="text-sm text-muted-foreground">
                  {discountType === "PERCENTAGE" ? "%" : "PHP"}
                </span>
              </div>
              {!validDiscount && (
                <p className="mt-1 text-xs text-destructive">
                  Discount value must be greater than zero.
                </p>
              )}
            </div>

            {/* Caps */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="min_order"
                  className="text-xs font-medium text-foreground"
                >
                  Minimum order (optional)
                </label>
                <input
                  id="min_order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                {!validMin && (
                  <p className="mt-1 text-xs text-destructive">
                    Minimum must be zero or greater.
                  </p>
                )}
              </div>
              {discountType === "PERCENTAGE" && (
                <div>
                  <label
                    htmlFor="max_discount"
                    className="text-xs font-medium text-foreground"
                  >
                    Max discount cap (optional)
                  </label>
                  <input
                    id="max_discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="e.g. 500"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Validity + Usage */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h2 className="text-sm font-semibold text-foreground">
              Validity & usage limits
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="starts_at"
                  className="text-xs font-medium text-foreground"
                >
                  Starts at
                </label>
                <input
                  id="starts_at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label
                  htmlFor="expires_at"
                  className="text-xs font-medium text-foreground"
                >
                  Expires at
                </label>
                <input
                  id="expires_at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label
                  htmlFor="usage_limit"
                  className="text-xs font-medium text-foreground"
                >
                  Usage limit
                </label>
                <input
                  id="usage_limit"
                  type="number"
                  min="1"
                  step="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — tips */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                How coupons work
              </h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                Customers enter the code on the <strong>Cart</strong> page.
              </li>
              <li>
                Validation checks: code matches, active flag, validity
                window, usage limit, and minimum order.
              </li>
              <li>
                Discount is computed against the cart subtotal, capped by
                the max discount amount (percentage coupons only).
              </li>
              <li>
                On order placement, the redemption is recorded and{" "}
                <code className="rounded bg-secondary px-1">
                  usage_count
                </code>{" "}
                is incremented.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-sm font-semibold text-foreground">
              Best practices
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>Use a memorable code (SUMMER20, NEWUSER, etc).</li>
              <li>
                Add a min order to encourage larger baskets.
              </li>
              <li>
                Cap percentage discounts to avoid runaway discounts on big
                orders.
              </li>
              <li>
                Set usage limits so a leaked code can&apos;t be abused.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

function TypeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function toLocalDatetime(iso: string): string {
  // Convert ISO timestamp to the local datetime-local input format
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}