import { createClient } from "@/lib/supabase/server";
import { Settings2 } from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { SettingsTable } from "@/components/admin/settings-table";
import { NewSettingButton } from "@/components/admin/new-setting-button";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("id, key, value, description, is_public")
    .order("key", { ascending: true });

  const rows = (settings ?? []) as Array<{
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    is_public: boolean;
  }>;

  const publicCount = rows.filter((s) => s.is_public).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} configuration key{rows.length === 1 ? "" : "s"} ·{" "}
            {publicCount} public
          </p>
        </div>
        <NewSettingButton />
      </FadeIn>

      {rows.length === 0 ? (
        <FadeIn className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No settings configured
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click <strong>New setting</strong> above to add your first key.
          </p>
        </FadeIn>
      ) : (
        <FadeIn>
          <SettingsTable initialSettings={rows} />
        </FadeIn>
      )}
    </div>
  );
}