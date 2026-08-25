import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select(
      "id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, starts_at, expires_at, is_active",
    )
    .eq("id", id)
    .single();
  if (error || !coupon) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Coupons
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground">{coupon.code}</span>
      </div>
      <CouponForm initial={coupon as Parameters<typeof CouponForm>[0]["initial"]} />
    </div>
  );
}