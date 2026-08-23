import { AdminPlaceholder } from "@/components/admin/placeholder";
import { FileText } from "lucide-react";

export default function AdminContentPage() {
  return (
    <AdminPlaceholder
      title="Content Management"
      description="Manage pages, blog posts, FAQs, testimonials, and services"
      icon={FileText}
    />
  );
}