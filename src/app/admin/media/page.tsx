import { AdminPlaceholder } from "@/components/admin/placeholder";
import { ImageIcon } from "lucide-react";

export default function AdminMediaPage() {
  return (
    <AdminPlaceholder
      title="Media Library"
      description="Upload and manage images, documents, and other media"
      icon={ImageIcon}
    />
  );
}