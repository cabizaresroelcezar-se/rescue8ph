import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/lib/motion";
import { ShieldAlert, Filter } from "lucide-react";
import { formatDateTimePh } from "@/lib/format";

export const metadata = {
  title: "Audit Logs",
  description: "Security audit trail of privileged actions",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; resource_type?: string }>;
}) {
  const supabase = await createClient();
  const filters = await searchParams;
  const actionFilter = filters.action;
  const resourceFilter = filters.resource_type;

  let query = supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, created_at, user_id, metadata, old_values, new_values")
    .order("created_at", { ascending: false })
    .limit(100);

  if (actionFilter) {
    query = query.eq("action", actionFilter);
  }
  if (resourceFilter) {
    query = query.eq("resource_type", resourceFilter);
  }

  const { data: logs } = await query;

  // Get unique actions and resource types for filter dropdowns
  const { data: allLogs } = await supabase
    .from("audit_logs")
    .select("action, resource_type")
    .order("created_at", { ascending: false })
    .limit(500);

  const uniqueActions = [...new Set((allLogs || []).map((l) => l.action))].sort();
  const uniqueResources = [...new Set((allLogs || []).map((l) => l.resource_type))].sort();

  const actionLabels: Record<string, string> = {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Security audit trail of privileged actions
          </p>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={40}>
        <form className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4 shadow-elev-1">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          <div>
            <label htmlFor="action-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
              Action
            </label>
            <select
              id="action-filter"
              name="action"
              defaultValue={actionFilter || ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-elev-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {actionLabels[a] || a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resource-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
              Resource Type
            </label>
            <select
              id="resource-filter"
              name="resource_type"
              defaultValue={resourceFilter || ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-elev-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All resources</option>
              {uniqueResources.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-elev-1 transition-colors hover:bg-primary/90"
          >
            Apply
          </button>
          {(actionFilter || resourceFilter) && (
            <Link
              href="/admin/audit-logs"
              className="h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Clear
            </Link>
          )}
        </form>
      </FadeIn>

      {/* Log count */}
      <p className="text-sm text-muted-foreground">
        Showing {logs?.length ?? 0} {logs?.length === 1 ? "entry" : "entries"}
        {actionFilter && ` for action: ${actionLabels[actionFilter] || actionFilter}`}
        {resourceFilter && ` on: ${resourceFilter}`}
      </p>

      {/* Audit log table */}
      {!logs || logs.length === 0 ? (
        <FadeIn
          delay={80}
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center shadow-elev-1"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">No audit logs found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {actionFilter || resourceFilter
                ? "Try adjusting or clearing the filters."
                : "Privileged admin actions will be recorded here."}
            </p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn
          delay={80}
          className="overflow-x-auto rounded-xl border border-border bg-card shadow-elev-1"
        >
          <table className="w-full text-sm">
            <thead className="border-b bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const hasChanges = log.old_values || log.new_values;
                return (
                  <tr key={log.id} className="border-b hover:bg-surface">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.resource_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.resource_id ? log.resource_id.slice(0, 8) + "\u2026" : "\u2014"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.user_id ? log.user_id.slice(0, 8) + "\u2026" : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTimePh(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {hasChanges ? (
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                            View
                          </summary>
                          <div className="mt-2 space-y-1">
                            {log.old_values && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Before</p>
                                <pre className="mt-1 max-w-xs overflow-x-auto rounded bg-surface p-2 text-[11px] text-foreground">
                                  {JSON.stringify(log.old_values, null, 2).slice(0, 200)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground">After</p>
                                <pre className="mt-1 max-w-xs overflow-x-auto rounded bg-surface p-2 text-[11px] text-foreground">
                                  {JSON.stringify(log.new_values, null, 2).slice(0, 200)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">\u2014</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </FadeIn>
      )}
    </div>
  );
}