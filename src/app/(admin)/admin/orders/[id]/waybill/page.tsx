import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { WaybillPrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function AdminOrderWaybillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles(name)")
    .eq("id", user.id)
    .maybeSingle();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") notFound();

  // Load order
  const isUuid = /^[0-9a-f]{8}-/.test(id);
  const head = isUuid
    ? supabase.from("orders").select("*").eq("id", id)
    : supabase.from("orders").select("*").eq("order_number", id);
  const { data: order } = await head.maybeSingle();
  if (!order) notFound();

  const [itemsRes, addressRes] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
    supabase.from("order_addresses").select("*").eq("order_id", order.id).maybeSingle(),
  ]);

  const items = itemsRes.data ?? [];
  const address = addressRes.data;

  const totalQty = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: waybillPrintCss }} />
      <div id="waybill-sheet" className="mx-auto max-w-[210mm] bg-white p-8 text-black print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue 8 Trading Philippines, Inc.</h1>
            <p className="mt-1 text-sm">
              {site.contact.address.line1}, {site.contact.address.line2}
            </p>
            <p className="text-sm">
              Tel: {site.contact.phone.label} · {site.contact.phone.mobile}
            </p>
            <p className="text-sm">DTI Registered since 2012</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase tracking-wider">Waybill / Delivery Slip</p>
            <p className="mt-1 text-sm font-mono">{order.order_number}</p>
            <p className="text-xs text-gray-600">
              {new Date(order.created_at).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* From / To section */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Sender */}
          <div className="border border-gray-400 p-4">
            <p className="mb-2 border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-gray-600">
              From (Sender)
            </p>
            <div className="space-y-0.5 text-sm">
              <p className="font-bold">Rescue 8 Trading Philippines, Inc.</p>
              <p>{site.contact.address.line1}</p>
              <p>{site.contact.address.line2}</p>
              <p>Tel: {site.contact.phone.label}</p>
              <p>Mobile: {site.contact.phone.mobile}</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="border border-gray-400 p-4">
            <p className="mb-2 border-b border-gray-300 pb-1 text-xs font-bold uppercase tracking-wider text-gray-600">
              To (Recipient)
            </p>
            <div className="space-y-0.5 text-sm">
              {address ? (
                <>
                  <p className="font-bold">
                    {address.first_name} {address.last_name}
                  </p>
                  <p>Tel: {address.phone}</p>
                  {address.email && <p>Email: {address.email}</p>}
                  <p>{address.street_address}</p>
                  {address.building_unit && <p>{address.building_unit}</p>}
                  <p>
                    {address.barangay}, {address.city_municipality}
                  </p>
                  <p>
                    {address.province}, {address.region}
                  </p>
                  {address.postal_code && <p>{address.postal_code}</p>}
                  {address.delivery_notes && (
                    <p className="mt-2 italic text-gray-600">
                      Notes: {address.delivery_notes}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No delivery address on file</p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery booking instructions */}
        <div className="mt-4 rounded border-2 border-dashed border-gray-400 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Delivery Booking Instructions
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <div>
              <label className="block text-xs text-gray-500">Courier / App</label>
              <div className="mt-1 h-7 border-b border-gray-400">&nbsp;</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Tracking No.</label>
              <div className="mt-1 h-7 border-b border-gray-400">&nbsp;</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Booking Date</label>
              <div className="mt-1 h-7 border-b border-gray-400">&nbsp;</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Customer may book their own delivery via Lalamove, Grab, J&amp;T, LBC, or any
            courier of their choice. Confirm pickup availability with customer before booking.
          </p>
        </div>

        {/* Items table */}
        <div className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Item</th>
                <th className="border border-gray-400 px-3 py-2 text-center">SKU</th>
                <th className="border border-gray-400 px-3 py-2 text-center">Qty</th>
                <th className="border border-gray-400 px-3 py-2 text-right">Unit Price</th>
                <th className="border border-gray-400 px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: { id: string; product_name: string; sku: string | null; quantity: number; unit_price: number; subtotal: number }) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="border border-gray-400 px-3 py-2 font-medium">
                    {item.product_name}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-gray-600">
                    {item.sku || "—"}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    ₱{Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right font-semibold">
                    ₱{Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black">
                <td colSpan={2} className="px-3 py-2 text-right font-bold">
                  Total Items:
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center font-bold">
                  {totalQty}
                </td>
                <td className="px-3 py-2 text-right font-bold">Grand Total:</td>
                <td className="border border-gray-400 px-3 py-2 text-right font-bold">
                  ₱{Number(order.grand_total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary + signatures */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₱{Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₱{Number(order.discount_total).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>₱{Number(order.shipping_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-bold">
              <span>Total:</span>
              <span>₱{Number(order.grand_total).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Payment Status:</span>
              <span className="font-semibold">{order.status.replace(/_/g, " ")}</span>
            </div>
            {order.customer_notes && (
              <div className="mt-2 border-t border-gray-300 pt-2">
                <p className="text-xs text-gray-600">Customer notes:</p>
                <p className="text-sm">{order.customer_notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-8 pt-4">
            <div>
              <div className="border-b border-black pb-8">&nbsp;</div>
              <p className="mt-1 text-xs text-gray-600">Prepared by (Signature)</p>
            </div>
            <div>
              <div className="border-b border-black pb-8">&nbsp;</div>
              <p className="mt-1 text-xs text-gray-600">Received by (Signature)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-300 pt-3 text-center text-xs text-gray-500">
          <p>
            This waybill was generated by Rescue 8 Philippines · {order.order_number} ·
            Print date: {new Date().toLocaleString("en-PH")}
          </p>
          <p className="mt-1 no-print">
            <WaybillPrintButton />
          </p>
        </div>
      </div>
    </>
  );
}

const waybillPrintCss = `
@media print {
  header, nav, aside, footer, .no-print {
    display: none !important;
  }
  html, body, main, body > div, #waybill-sheet {
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
    margin: 10mm;
  }
  body { margin: 0; }
  #waybill-sheet {
    page-break-inside: avoid;
    max-width: 100% !important;
    padding: 0 !important;
  }
}`;