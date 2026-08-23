import { createClient } from "@/lib/supabase/server";

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Security audit trail of privileged actions
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          No audit logs yet. Privileged admin actions will be recorded here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Resource</th>
                <th className="px-4 py-3 text-left font-medium">Resource ID</th>
                <th className="px-4 py-3 text-left font-medium">User ID</th>
                <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-surface">
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.resource_type}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {log.resource_id ? log.resource_id.slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {log.user_id ? log.user_id.slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("en-PH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}