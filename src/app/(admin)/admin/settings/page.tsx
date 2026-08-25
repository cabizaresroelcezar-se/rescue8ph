import { createClient } from "@/lib/supabase/server";
import { Settings2, Eye, EyeOff, Code2 } from "lucide-react";
import { FadeIn } from "@/lib/motion";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("id, key, value, description, is_public")
    .order("key", { ascending: true });

  const publicCount = (settings || []).filter((s) => s.is_public).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(settings || []).length} configuration key
            {(settings || []).length === 1 ? "" : "s"} ·{" "}
            {publicCount} public
          </p>
        </div>
      </FadeIn>

      {!settings || settings.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No settings configured
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add rows to <code className="font-mono">site_settings</code> to
            configure the store.
          </p>
        </FadeIn>
      ) : (
        <FadeIn className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Key</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-center">Public</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {settings.map((setting) => (
                  <tr
                    key={setting.id}
                    className="transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3.5 align-top">
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 font-mono text-xs font-medium text-foreground">
                        <Code2 className="h-3 w-3 text-muted-foreground" />
                        {setting.key}
                      </div>
                    </td>
                    <td className="max-w-md truncate px-5 py-3.5 align-top font-mono text-xs text-muted-foreground">
                      {JSON.stringify(setting.value)}
                    </td>
                    <td className="px-5 py-3.5 align-top text-sm text-muted-foreground">
                      {setting.description || (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center align-top">
                      {setting.is_public ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Eye className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300">
                          <EyeOff className="h-3 w-3" /> Internal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
