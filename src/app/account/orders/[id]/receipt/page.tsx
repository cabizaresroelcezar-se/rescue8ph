import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderReceipt } from "@/components/shop/order-receipt/order-receipt";
import type {
  OrderItemData,
  OrderAddressData,
  OrderForReceipt,
} from "@/components/shop/order-receipt/order-receipt";

export const dynamic = "force-dynamic";

export default async function CustomerOrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Customers must be signed in to view a receipt.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Find the order — by order_number first, fall back to id.
  const isUuid = /^[0-9a-f]{8}-/.test(id);
  const head = isUuid
    ? supabase.from("orders").select("*").eq("id", id)
    : supabase.from("orders").select("*").eq("order_number", id);
  const { data: order } = await head.maybeSingle();
  if (!order || (order as { user_id?: string }).user_id !== user.id) {
    notFound();
  }

  const [itemsRes, addressRes] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", (order as { id: string }).id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_addresses")
      .select("*")
      .eq("order_id", (order as { id: string }).id)
      .maybeSingle(),
  ]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: printCss,
        }}
      />
      <OrderReceipt
        order={order as OrderForReceipt}
        items={(itemsRes.data ?? []) as OrderItemData[]}
        address={(addressRes.data ?? null) as OrderAddressData | null}
        audience="customer"
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
