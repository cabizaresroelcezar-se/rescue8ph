import { AdminPlaceholder } from "@/components/admin/placeholder";
import { UserCog } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <AdminPlaceholder
      title="User Management"
      description="Manage user accounts, roles, and permissions"
      icon={UserCog}
    />
  );
}