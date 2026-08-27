import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export interface RevenuePoint {
  /** ISO date string, e.g. "2026-08-21" */
  date: string;
  /** Total revenue (grand_total sum) for that day */
  revenue: number;
  /** Order count for that day (for the sub-line) */
  orders: number;
}

export interface RevenueLast7DaysProps {
  /** Exactly 7 entries, ordered chronologically (oldest first) */
  points: RevenuePoint[];
  /** Total revenue across all 7 days */
  total: number;
  /** Number of orders across all 7 days */
  orderCount: number;
}

/**
 * Revenue mini chart — a sparkline of last-7-days revenue with
 * a filled area, the day's revenue dot, and per-day hover labels.
 * No external chart lib; pure SVG.
 *
 * Layout:
 *  - Left side: label + total
 *  - Right side: sparkline (160×40)
 *  - Bottom row: 7 day-codes aligned under the 7 points
 */
export function RevenueLast7Days({
  points,
  total,
  orderCount,
}: RevenueLast7DaysProps) {
  const W = 160;
  const H = 40;
  const PAD = 2;
  const dayCount = points.length;

  // Guard: zero orders
  const hasData = points.some((p) => p.revenue > 0);
  const max = Math.max(...points.map((p) => p.revenue), 1);

  const xStep = dayCount > 1 ? (W - PAD * 2) / (dayCount - 1) : 0;

  // Calculate points and polyline
  const polyPts = points
    .map((p, i) => {
      const x = PAD + xStep * i;
      const y = H - PAD - (p.revenue / max) * (H - PAD * 2);
      return [x, y] as const;
    });

  const polylineStr = polyPts.map(([x, y]) => `${x},${y}`).join(" ");
  // Area path: top-line then close to baseline
  const areaPath =
    polyPts.length > 0
      ? [
          `M ${polyPts[0][0]},${H - PAD}`,
          ...polyPts.map(([x, y]) => `L ${x},${y}`),
          `L ${polyPts[polyPts.length - 1][0]},${H - PAD}`,
          `Z`,
        ].join(" ")
      : "";

  // Compute day labels as "Aug 26" etc.
  const dayLabels = points.map((p) => {
    const d = new Date(p.date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  return (
    <section className="rounded-xl border border-border bg-card shadow-elev-1">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">
            Revenue · last 7 days
          </h2>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          Analytics
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="flex items-end gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(total)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {orderCount === 0
              ? "No orders yet"
              : `${orderCount} order${orderCount === 1 ? "" : "s"} in 7 days`}
          </p>
        </div>

        <div className="relative shrink-0">
          {hasData ? (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              className="overflow-visible"
              aria-label="Revenue sparkline"
            >
              <defs>
                <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity="0.35"
                    className="text-accent"
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity="0"
                    className="text-accent"
                  />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#revenue-area)" />
              <polyline
                points={polylineStr}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-accent"
              />
              {polyPts.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.6}
                  fill="currentColor"
                  className="text-accent"
                >
                  <title>
                    {dayLabels[i]}: {formatCurrency(points[i].revenue)} (
                    {points[i].orders} orders)
                  </title>
                </circle>
              ))}
            </svg>
          ) : (
            <div
              className="flex items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground"
              style={{ width: W, height: H }}
            >
              No data
            </div>
          )}
        </div>
      </div>

      {/* Day labels aligned with svg x positions for clarity */}
      <div
        className="flex justify-between px-4 pb-3 text-[10px] text-muted-foreground"
        style={{ paddingLeft: "calc(1rem + 0px)" }}
      >
        {dayLabels.map((lbl, i) => (
          <span key={i} className="font-mono">
            {lbl}
          </span>
        ))}
      </div>
    </section>
  );
}
