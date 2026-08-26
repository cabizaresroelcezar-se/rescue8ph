import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { ListPublishToggle } from "./[id]/publish-toggle";

export default async function AdminPagesPage() {
  const supabase = await createClient();

  // Auth + role guard. The pages table RLS lets anon read PUBLISHED rows,
  // but the admin UI needs to see drafts too — so we gate on the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?redirectTo=/admin/pages");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  let roleName: string | undefined;
  if (profile) {
    const roles = (profile as { roles?: { name?: string } | { name?: string }[] | null }).roles;
    if (Array.isArray(roles)) {
      roleName = roles[0]?.name;
    } else if (roles && typeof roles === "object") {
      roleName = roles.name;
    }
  }
  if (roleName !== "admin" && roleName !== "super_admin") {
    redirect("/account");
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, status, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage CMS pages</p>
        </div>
        <ButtonLink href="/admin/pages/new" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Page
        </ButtonLink>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          No pages yet. Click &quot;Add Page&quot; to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Published</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-surface">
                  <td className="px-4 py-3 font-medium">{page.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
                  <td className="px-4 py-3 text-center">
                                      <ListPublishToggle
                                        id={page.id}
                                        initial={page.status as "DRAFT" | "PUBLISHED"}
                                      />
                                    </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {page.published_at
                      ? new Date(page.published_at).toLocaleDateString("en-PH")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                                      <div className="inline-flex items-center gap-1">
                                        {page.status === "PUBLISHED" && (
                                          <Link
                                            href={`/${page.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`View ${page.title} on storefront`}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </Link>
                                        )}
                                        <ButtonLink
                                          href={`/admin/pages/${page.id}`}
                                          variant="ghost"
                                          size="sm"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </ButtonLink>
                                      </div>
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