import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, status, created_at, role:roles(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Type assertion for join result
  type ProfileWithRole = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    status: string;
    created_at: string;
    role: { name: string }[] | { name: string } | null;
  };
  const typedProfiles = (profiles || []) as unknown as ProfileWithRole[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View registered customer accounts
        </p>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No customers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {typedProfiles.map((profile) => {
                const roleName = Array.isArray(profile.role)
                  ? profile.role[0]?.name
                  : profile.role?.name;
                return (
                  <tr key={profile.id} className="border-b hover:bg-surface">
                    <td className="px-4 py-3 font-medium">
                      {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {profile.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium capitalize">
                        {roleName?.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          profile.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString("en-PH")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}