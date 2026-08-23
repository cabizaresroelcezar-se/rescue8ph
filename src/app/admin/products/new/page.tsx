import { createProduct } from "@/features/products/actions";
import Link from "next/link";
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

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new product listing</p>
      </div>

      {params.error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {params.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Enter the product information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="e.g., Foldable Stretcher" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (auto-generated if empty)</Label>
              <Input id="slug" name="slug" placeholder="foldable-stretcher" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" name="shortDescription" placeholder="Brief product summary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Detailed product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (PHP) *</Label>
                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="R8-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                <Input id="weightGrams" name="weightGrams" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured">Featured</Label>
                <select
                  id="featured"
                  name="featured"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" name="seoTitle" placeholder="SEO page title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Input id="seoDescription" name="seoDescription" placeholder="SEO meta description" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit">Create Product</Button>
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