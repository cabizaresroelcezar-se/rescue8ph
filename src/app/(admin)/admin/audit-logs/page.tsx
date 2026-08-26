import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/lib/motion";
import { ShieldAlert, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { formatDateTimePh } from "@/lib/format";
import { JsonDiff } from "@/components/admin/json-diff";

export const metadata = {
  title: "Audit Logs",
  description: "Security audit trail of privileged actions",
};

const PAGE_SIZE = 25;

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  LOGIN: "Login",
  LOGOUT: "Logout",
  STATUS_CHANGE: "Status Change",
  PRICE_OVERRIDE: "Price Override",
  REFUND: "Refund",
  CANCEL: "Cancel",
};

const ACTION_TONES: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  UPDATE: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  LOGIN: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  LOGOUT: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
  STATUS_CHANGE: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  PRICE_OVERRIDE: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  REFUND: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  CANCEL: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

function buildHref(
  filters: {
    action?: string;
    resource_type?: string;
    user_id?: string;
    q?: string;
    from?: string;
    to?: string;
    page?: number;
  },
  overrides: Record<string, string | number | undefined> = {},
) {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  }
  const qs = params.toString();
  return qs ? `/admin/audit-logs?${qs}` : "/admin/audit-logs";
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    resource_type?: string;
    user_id?: string;
    q?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const actionFilter = params.action || "";
  const resourceFilter = params.resource_type || "";
  const userFilter = params.user_id || "";
  const queryText = (params.q || "").trim();
  const fromDate = params.from || "";
  const toDate = params.to || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Build base query with all filters except pagination
  let base = supabase
    .from("audit_logs")
    .select(
      "id, action, resource_type, resource_id, user_id, old_values, new_values, metadata, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (actionFilter) base = base.eq("action", actionFilter);
  if (resourceFilter) base = base.eq("resource_type", resourceFilter);
  if (userFilter) base = base.eq("user_id", userFilter);
  if (fromDate) {
    base = base.gte("created_at", `${fromDate}T00:00:00`);
  }
  if (toDate) {
    base = base.lt("created_at", `${toDate}T23:59:59.999`);
  }
  if (queryText) {
    // Free-text search across the JSONB payload fields using ilike on serialized text.
    // Postgres lets us cast ->> and match with ilike operator.
    base = base.or(
      `action.ilike.%${queryText}%,resource_type.ilike.%${queryText}%,resource_id.ilike.%${queryText}%,metadata::text.ilike.%${queryText}%`,
    );
  }

  // Count + paginated fetch in parallel
  const { data: logs, count } = await base.range(offset, offset + PAGE_SIZE - 1);

  // For dropdowns + actor name lookup, fetch from a wide net of recent rows
  // (cheap; 500 rows is small). Run in parallel with the main query.
  const { data: allLogs } = await supabase
    .from("audit_logs")
    .select("action, resource_type, user_id")
    .order("created_at", { ascending: false })
    .limit(500);

  const uniqueActions = [...new Set((allLogs ?? []).map((l) => l.action))].sort();
  const uniqueResources = [
    ...new Set((allLogs ?? []).map((l) => l.resource_type)),
  ].sort();

  // Actor-name lookup. Fetch the profiles for the distinct user_ids in
  // the visible page (small list).
  const actorIds = [
    ...new Set((logs ?? []).map((l) => l.user_id).filter(Boolean) as string[]),
  ];
  const { data: profiles } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", actorIds)
    : { data: [] };
  const actorById = new Map<string, { display_name: string | null; email: string | null }>();
  for (const p of profiles ?? []) {
    const id = (p as { id: string }).id;
    actorById.set(id, {
      display_name: (p as { display_name: string | null }).display_name ?? null,
      email: (p as { email: string | null }).email ?? null,
    });
  }

  const totalRows = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const showingFrom = totalRows === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + PAGE_SIZE, totalRows);

  const filters = {
    action: actionFilter || undefined,
    resource_type: resourceFilter || undefined,
    user_id: userFilter || undefined,
    q: queryText || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    page: page > 1 ? page : undefined,
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-eyebrow">Back Office · Security</p>
          <h1 className="mt-2 text-display-md text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Privileged actions by staff — {totalRows.toLocaleString()} entr
            {totalRows === 1 ? "y" : "ies"} matching your filters
          </p>
        </div>
      </FadeIn>

      {/* Filter bar */}
      <FadeIn className="rounded-2xl border border-border bg-card p-4 shadow-elev-1">
        <form method="GET" className="space-y-3">
          {/* Preserve page=1 on form submit */}
          <input type="hidden" name="page" value="1" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Search
              </span>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  type="text"
                  defaultValue={queryText}
                  placeholder="action, resource, JSON…"
                  className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Action
              </span>
              <select
                name="action"
                defaultValue={actionFilter}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">All actions</option>
                {uniqueActions.map((a) => (
                  <option key={a} value={a}>
                    {ACTION_LABELS[a] ?? a}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Resource
              </span>
              <select
                name="resource_type"
                defaultValue={resourceFilter}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">All resources</option>
                {uniqueResources.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                User ID
              </span>
              <input
                name="user_id"
                type="text"
                defaultValue={userFilter}
                placeholder="uuid"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                From
              </span>
              <input
                name="from"
                type="date"
                defaultValue={fromDate}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                To
              </span>
              <input
                name="to"
                type="date"
                defaultValue={toDate}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </label>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Apply filters
              </button>
              <Link
                href="/admin/audit-logs"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Reset
              </Link>
              <span className="ml-auto text-xs text-muted-foreground">
                Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {totalRows.toLocaleString()}
              </span>
            </div>
          </div>
        </form>
      </FadeIn>

      {/* Logs table */}
      {!logs || logs.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No audit events match
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try widening your filters or clearing the date range.
          </p>
        </FadeIn>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const tone = ACTION_TONES[log.action] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300";
            const actor = log.user_id ? actorById.get(log.user_id) : null;
            const actorLabel = actor?.display_name || actor?.email?.split("@")[0] || "—";
            return (
              <details
                key={log.id}
                className="group rounded-2xl border border-border bg-card shadow-elev-1"
              >
                <summary className="flex cursor-pointer items-center gap-3 p-4 text-sm [&::-webkit-details-marker]:hidden">
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
                  >
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  <span className="font-medium text-foreground">
                    {log.resource_type}
                  </span>
                  {log.resource_id && (
                    <span className="hidden truncate font-mono text-[10px] text-muted-foreground sm:inline">
                      {log.resource_id.slice(0, 8)}…
                    </span>
                  )}
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {actorLabel}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">
                    {formatDateTimePh(log.created_at)}
                  </span>
                </summary>
                <div className="space-y-3 border-t border-border bg-secondary/30 p-4 text-xs">
                  <dl className="grid gap-2 sm:grid-cols-4">
                    <div>
                      <dt className="font-medium text-muted-foreground">ID</dt>
                      <dd className="mt-0.5 font-mono text-foreground break-all">
                        {log.id}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Resource ID
                      </dt>
                      <dd className="mt-0.5 font-mono text-foreground break-all">
                        {log.resource_id ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Actor
                      </dt>
                      <dd className="mt-0.5 text-foreground">
                        {actorLabel}
                        {actor?.email && (
                          <span className="block text-[10px] text-muted-foreground">
                            {actor.email}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Timestamp
                      </dt>
                      <dd className="mt-0.5 text-foreground">
                        {formatDateTimePh(log.created_at)}
                      </dd>
                    </div>
                  </dl>

                  {(log.old_values ?? log.new_values) && (
                    <JsonDiff
                      oldValues={log.old_values as Record<string, unknown> | null | undefined}
                      newValues={log.new_values as Record<string, unknown> | null | undefined}
                    />
                  )}

                  {log.metadata &&
                    typeof log.metadata === "object" &&
                    !Array.isArray(log.metadata) &&
                    Object.keys(log.metadata).length > 0 && (
                      <details className="rounded-md border border-border bg-background">
                        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                          metadata
                        </summary>
                        <pre className="overflow-x-auto border-t border-border p-3 font-mono text-[11px] text-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <FadeIn className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-elev-1">
          <span className="text-xs text-muted-foreground">
            Page {page.toLocaleString()} of {totalPages.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildHref(filters, { page: page - 1 })}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Link>
            ) : (
              <span className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-secondary/40 px-3 text-xs font-medium text-muted-foreground">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={buildHref(filters, { page: page + 1 })}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-secondary/40 px-3 text-xs font-medium text-muted-foreground">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
