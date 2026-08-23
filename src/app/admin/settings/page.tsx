import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("id, key, value, description, is_public")
    .order("key", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Site configuration and settings
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Key</th>
              <th className="px-4 py-3 text-left font-medium">Value</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-center font-medium">Public</th>
            </tr>
          </thead>
          <tbody>
            {settings?.map((setting) => (
              <tr key={setting.id} className="border-b hover:bg-surface">
                <td className="px-4 py-3 font-medium font-mono text-xs">{setting.key}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {JSON.stringify(setting.value)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{setting.description || "—"}</td>
                <td className="px-4 py-3 text-center">
                  {setting.is_public ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Yes
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}