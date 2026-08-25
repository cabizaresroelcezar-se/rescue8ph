import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/lib/motion";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { updateProduct } from "@/features/products/actions";

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

    const { data: productImages } = await supabase
      .from("product_images")
      .select("id, storage_path, alt_text, is_primary, sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office · Products</p>
          <h1 className="mt-2 text-display-md text-foreground">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.title}</p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back
        </Link>
      </FadeIn>

      {sp.error && (
        <FadeIn className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {sp.error}
        </FadeIn>
      )}

      <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Product Details
            </h2>
            <p className="text-xs text-muted-foreground">
              Update the product information.
            </p>
          </div>
        </div>

        <form action={updateProduct} className="mt-6 space-y-6">
          <input type="hidden" name="id" value={product.id} />

          <Section title="Basics">
            <Field id="title" label="Title" required>
              <Input id="title" name="title" required defaultValue={product.title} />
            </Field>
            <Field id="slug" label="Slug">
              <Input id="slug" name="slug" defaultValue={product.slug} />
            </Field>
          </Section>

          <Section title="Description">
            <Field id="shortDescription" label="Short Description">
              <Input id="shortDescription" name="shortDescription" defaultValue={product.short_description || ""} />
            </Field>
            <Field id="description" label="Full Description">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                defaultValue={product.description || ""}
              />
            </Field>
          </Section>

          <Section title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="price" label="Price (PHP)" required>
                <Input id="price" name="price" type="number" step="0.01" required defaultValue={product.price} />
              </Field>
              <Field id="compareAtPrice" label="Compare at Price">
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={product.compare_at_price || ""} />
              </Field>
            </div>
          </Section>

          <Section title="Catalog">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sku" label="SKU">
                <Input id="sku" name="sku" defaultValue={product.sku || ""} />
              </Field>
              <Field id="status" label="Status">
                <Select id="status" name="status" defaultValue={product.status}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="weightGrams" label="Weight (grams)">
                <Input id="weightGrams" name="weightGrams" type="number" defaultValue={product.weight_grams || ""} />
              </Field>
              <Field id="featured" label="Featured">
                <Select id="featured" name="featured" defaultValue={product.featured ? "true" : "false"}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="SEO">
                      <Field id="seoTitle" label="SEO Title">
                        <Input id="seoTitle" name="seoTitle" defaultValue={product.seo_title || ""} />
                      </Field>
                      <Field id="seoDescription" label="SEO Description">
                        <Input id="seoDescription" name="seoDescription" defaultValue={product.seo_description || ""} />
                      </Field>
                    </Section>

                    {/* IMAGES — separate form because it has its own server action */}
                    <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1 sm:p-8">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-foreground">
                            Product Images
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Upload photos of the product. The first image marked as Primary will be used in listings.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <ProductImageUploader
                          productId={product.id}
                          images={(productImages ?? []).map((i) => ({
                            id: i.id,
                            storagePath: i.storage_path,
                            altText: i.alt_text,
                            isPrimary: i.is_primary,
                          }))}
                        />
                      </div>
                    </FadeIn>

                    <div className="flex gap-3 border-t border-border pt-6">
                      <Button type="submit">Save Changes</Button>
                      <Link
                        href="/admin/products"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </FadeIn>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-eyebrow">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  id, label, required, children,
}: {
  id: string; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Select({
  id, name, defaultValue, children,
}: {
  id: string; name: string; defaultValue?: string; children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </select>
  );
}
