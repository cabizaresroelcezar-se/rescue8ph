import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDatePh } from "@/lib/format";
import { PrintButton } from "@/components/shop/order-receipt/print-button";

/**
 * Printable receipt — used by both admin and customer. The page is
 * designed to look like a paper receipt when printed (or saved to PDF
 * via the browser print dialog). On screen, it lives inside a max-width
 * container with the standard chrome visible (admin sidebar or customer
 * header); when printed, only the receipt itself renders (CSS hides
 * chrome via @media print rules in page.tsx).
 */

export interface OrderItemData {
  product_name: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  subtotal: number;
}

export interface OrderAddressData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  region: string;
  province: string;
  city_municipality: string;
  barangay: string;
  street_address: string;
  building_unit: string | null;
  postal_code: string | null;
}

export interface OrderForReceipt {
  order_number: string;
  status: string;
  created_at: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  currency: string;
  customer_notes: string | null;
}

export interface OrderReceiptProps {
  order: OrderForReceipt;
  items: OrderItemData[];
  address: OrderAddressData | null;
  /** "admin" or "customer" — controls the back-link target. */
  audience: "admin" | "customer";
}

const STATUS_TONE: Record<string, string> = {
  PAID: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  PROCESSING: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  SHIPPED: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  DELIVERED: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  PENDING: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  PAYMENT_PENDING:
    "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  CANCELLED: "border-zinc-500 bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300",
  FAILED: "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  REFUNDED: "border-zinc-500 bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300",
  PARTIALLY_REFUNDED:
    "border-zinc-500 bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300",
};

export function OrderReceipt({ order, items, address, audience }: OrderReceiptProps) {
  const statusClass = STATUS_TONE[order.status] ?? "border-border bg-muted text-foreground";
  const backHref =
    audience === "admin"
      ? `/admin/orders/${order.order_number}`
      : `/account/orders/${order.order_number}`;

  return (
    <div className="space-y-4 print:space-y-2">
      {/* On-screen toolbar — hidden when printing */}
      <div className="no-print flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to order
        </Link>
        <PrintButton />
      </div>

      {/* The receipt itself */}
      <article
        id="receipt-sheet"
        className="mx-auto max-w-2xl bg-background px-6 py-8 ring-1 ring-foreground/10 print:max-w-none print:ring-0 print:px-4 print:py-2 sm:px-8 sm:py-10"
      >
        {/* Header */}
        <header className="flex items-start justify-between border-b border-foreground/20 pb-6 print:pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground print:text-[9px]">
              Rescue 8 Philippines · EMS &amp; Rescue Equipment
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground print:text-xl">
              Receipt
            </h1>
            <p className="mt-1 font-mono text-sm text-foreground print:text-xs">
              <span className="text-muted-foreground">Order</span> #
              {order.order_number}
            </p>
          </div>
          <div className="text-right">
            <span
              className={
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                statusClass
              }
            >
              {order.status.replace(/_/g, " ")}
            </span>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground print:text-[9px]">
              Issued
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground print:text-xs">
              {formatDatePh(order.created_at)}
            </p>
          </div>
        </header>

        {/* Bill-to / Ship-to */}
        {address ? (
          <section className="mt-6 grid gap-6 border-b border-foreground/20 pb-6 sm:grid-cols-2 print:mt-3 print:grid-cols-2 print:gap-4 print:pb-3">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[9px]">
                Bill to &amp; ship to
              </h2>
              <p className="mt-1.5 text-sm font-medium text-foreground print:text-xs">
                {address.first_name} {address.last_name}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground print:text-[10px]">
                {address.street_address}
                {address.building_unit ? `, ${address.building_unit}` : ""}
                <br />
                {address.barangay}, {address.city_municipality}
                <br />
                {address.province}, {address.region}
                {address.postal_code ? ` ${address.postal_code}` : ""}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground print:text-[10px]">
                {address.phone}
                {address.email ? ` · ${address.email}` : ""}
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[9px]">
                Issued by
              </h2>
              <p className="mt-1.5 text-sm font-medium text-foreground print:text-xs">
                Rescue 8 Trading Philippines, Inc.
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground print:text-[10px]">
                156B Wayan St., Brgy. Masambong
                <br />
                Quezon City, 1115
                <br />
                Metro Manila, Philippines
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground print:text-[10px]">
                support@rescue8ph.com
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-6 border-b border-foreground/20 pb-6 print:mt-3 print:pb-3">
            <p className="text-sm text-muted-foreground print:text-xs">
              No shipping address on file for this order.
            </p>
          </section>
        )}

        {/* Line items */}
        <section className="mt-6 print:mt-3">
          <table className="w-full border-collapse text-xs print:text-[10px]">
            <thead>
              <tr className="border-b border-foreground/30 text-left">
                <th className="py-2 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[8px] print:py-1">
                  Item
                </th>
                <th className="py-2 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[8px] print:py-1">
                  Qty
                </th>
                <th className="py-2 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[8px] print:py-1">
                  Unit
                </th>
                {items.some((i) => i.discount_amount > 0) && (
                  <th className="py-2 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[8px] print:py-1">
                    Disc.
                  </th>
                )}
                <th className="py-2 pl-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-[8px] print:py-1">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-foreground/10 align-top"
                >
                  <td className="py-2 pr-3 print:py-1">
                    <p className="font-medium text-foreground">{item.product_name}</p>
                    {item.sku && (
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground print:text-[9px]">
                        SKU {item.sku}
                      </p>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-foreground print:py-1">
                    {item.quantity}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-foreground print:py-1">
                    {formatCurrency(Number(item.unit_price))}
                  </td>
                  {items.some((i) => i.discount_amount > 0) && (
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground print:py-1">
                      {item.discount_amount > 0
                        ? `−${formatCurrency(Number(item.discount_amount))}`
                        : "—"}
                    </td>
                  )}
                  <td className="py-2 pl-3 text-right font-mono font-medium text-foreground print:py-1">
                    {formatCurrency(Number(item.subtotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-6 flex justify-end border-b border-foreground/20 pb-6 print:mt-3 print:pb-3">
          <dl className="w-full max-w-xs space-y-1 text-xs print:text-[10px] print:space-y-0.5">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="font-mono text-foreground">
                {formatCurrency(Number(order.subtotal))}
              </dd>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="font-mono text-emerald-600 dark:text-emerald-400">
                  −{formatCurrency(Number(order.discount_total))}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping</dt>
              <dd className="font-mono text-foreground">
                {Number(order.shipping_total) > 0
                  ? formatCurrency(Number(order.shipping_total))
                  : "Free"}
              </dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Tax</dt>
              <dd className="font-mono text-foreground">
                {Number(order.tax_total) > 0
                  ? formatCurrency(Number(order.tax_total))
                  : "—"}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-foreground/30 pt-2 print:mt-1 print:pt-1.5">
              <dt className="text-sm font-semibold uppercase tracking-wider text-foreground print:text-xs">
                Total
              </dt>
              <dd className="font-mono text-lg font-bold tabular-nums text-foreground print:text-base">
                {formatCurrency(Number(order.grand_total))}
              </dd>
            </div>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-6 flex flex-col items-center gap-1 print:mt-3">
          <p className="text-[11px] text-muted-foreground print:text-[9px]">
            Thank you for your purchase.
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground print:text-[8px]">
            Rescue 8 Philippines · emergency preparedness equipment
          </p>
          {order.customer_notes && (
            <div className="mt-3 w-full rounded-md border border-foreground/20 bg-muted/30 p-2 text-left text-[10px] text-muted-foreground print:mt-2 print:p-1.5 print:text-[9px]">
              <p className="font-semibold text-foreground">Customer notes</p>
              <p className="mt-0.5 whitespace-pre-line">{order.customer_notes}</p>
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}


