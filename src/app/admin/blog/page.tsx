import { AdminPlaceholder } from "@/components/admin/placeholder";
import { FileText } from "lucide-react";

export default function AdminBlogPage() {
  return (
    <AdminPlaceholder
      title="Blog Management"
      description="Create and manage blog posts and categories"
      icon={FileText}
    />
  );
}