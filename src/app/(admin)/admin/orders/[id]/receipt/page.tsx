import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderReceipt } from "@/components/shop/order-receipt/order-receipt";
import type {
  OrderItemData,
  OrderAddressData,
  OrderForReceipt,
} from "@/components/shop/order-receipt/order-receipt";

export const dynamic = "force-dynamic";

/** Look up the receipt data for a given order by id or order_number. */
async function loadOrder(idOrNumber: string): Promise<{
  order: OrderForReceipt;
  items: OrderItemData[];
  address: OrderAddressData | null;
} | null> {
  const supabase = await createClient();

  // Try by UUID first (admin URLs use the id), then by order_number (customer URLs use that).
  const isUuid = /^[0-9a-f]{8}-/.test(idOrNumber);
  const head = isUuid
    ? supabase.from("orders").select("*").eq("id", idOrNumber)
    : supabase.from("orders").select("*").eq("order_number", idOrNumber);
  const { data: order } = await head.maybeSingle();
  if (!order) return null;

  const [itemsRes, addressRes] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", (order as OrderForReceipt & { id?: string }).id ?? idOrNumber)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_addresses")
      .select("*")
      .eq("order_id", (order as OrderForReceipt & { id?: string }).id ?? idOrNumber)
      .maybeSingle(),
  ]);

  // Allow ANY signed-in staff member to view any receipt.
  // Customer role can only view their own.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (process.env.NODE_ENV === "production") {
      notFound();
    } else {
      // dev convenience: don't 404 on preview
    }
  } else if (
    user.id !== (order as { user_id?: string }).user_id
  ) {
    // not the order owner — check if they're staff
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles(name)")
      .eq("id", user.id)
      .maybeSingle();
    const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
    const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
    const isStaff = roleName === "admin" || roleName === "super_admin";
    if (!isStaff) notFound();
  }

  return {
    order: order as OrderForReceipt,
    items: (itemsRes.data ?? []) as OrderItemData[],
    address: (addressRes.data ?? null) as OrderAddressData | null,
  };
}

export default async function AdminOrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadOrder(id);
  if (!data) notFound();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: printCss,
        }}
      />
      <OrderReceipt
        order={data.order}
        items={data.items}
        address={data.address}
        audience="admin"
      />
    </>
  );
}

const printCss = `
@media print {
  header, nav, aside, footer, .no-print {
    display: none !important;
  }
  html, body, main, body > div, #receipt-sheet {
    background: white !important;
    color: black !important;
  }
  .shadow-elev-1, .shadow-elev-2, .shadow-elev-3, .shadow-elev-4 {
    box-shadow: none !important;
  }
  [class*="ring-"] {
    box-shadow: none !important;
  }
  .backdrop-blur, .backdrop-blur-sm, .backdrop-blur-md {
    backdrop-filter: none !important;
  }
  @page {
    size: A4;
    margin: 12mm;
  }
  body { margin: 0; }
  p, td, th { line-height: 1.35 !important; }
  #receipt-sheet {
    page-break-inside: avoid;
    max-width: 100% !important;
    padding: 0 !important;
  }
}`;