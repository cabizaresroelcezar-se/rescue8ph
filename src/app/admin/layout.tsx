import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, role:roles(name)")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role?.name !== "admin" && profile.role?.name !== "super_admin")) {
    redirect("/account");
  }

  const isSuperAdmin = profile.role?.name === "super_admin";

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar isSuperAdmin={isSuperAdmin} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar
          email={user.email || ""}
          firstName={profile.first_name}
          isSuperAdmin={isSuperAdmin}
        />
        <main id="main" className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}