import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateProduct } from "@/features/products/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    redirect("/admin/products");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.title}</p>
      </div>

      {sp.error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {sp.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update the product information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProduct} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required defaultValue={product.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={product.slug} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" name="shortDescription" defaultValue={product.short_description || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={product.description || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (PHP) *</Label>
                <Input id="price" name="price" type="number" step="0.01" required defaultValue={product.price} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={product.compare_at_price || ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={product.sku || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={product.status}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightGrams">Weight (grams)</Label>
                <Input id="weightGrams" name="weightGrams" type="number" defaultValue={product.weight_grams || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured">Featured</Label>
                <select
                  id="featured"
                  name="featured"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={product.featured ? "true" : "false"}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={product.seo_title || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Input id="seoDescription" name="seoDescription" defaultValue={product.seo_description || ""} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit">Save Changes</Button>
              <Link href="/admin/products" className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-surface">
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}