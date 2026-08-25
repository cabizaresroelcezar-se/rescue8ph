import { createProduct } from "@/features/products/actions";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button-link";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office · Products</p>
          <h1 className="mt-2 text-display-md text-foreground">
            Add New Product
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new product listing.
          </p>
        </div>
        <ButtonLink href="/admin/products" variant="outline" size="sm">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Cancel
        </ButtonLink>
      </FadeIn>

      {params.error && (
        <FadeIn className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {params.error}
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
              Enter the product information.
            </p>
          </div>
        </div>

        <form action={createProduct} className="mt-6 space-y-6">
          <Section title="Basics">
            <Field id="title" label="Title" required>
              <Input id="title" name="title" required placeholder="e.g., Foldable Stretcher" />
            </Field>
            <Field id="slug" label="Slug" hint="Auto-generated if empty">
              <Input id="slug" name="slug" placeholder="foldable-stretcher" />
            </Field>
          </Section>

          <Section title="Description">
            <Field id="shortDescription" label="Short Description">
              <Input id="shortDescription" name="shortDescription" placeholder="Brief product summary" />
            </Field>
            <Field id="description" label="Full Description">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                placeholder="Detailed product description"
              />
            </Field>
          </Section>

          <Section title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="price" label="Price (PHP)" required>
                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
              </Field>
              <Field id="compareAtPrice" label="Compare at Price">
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" placeholder="0.00" />
              </Field>
            </div>
          </Section>

          <Section title="Catalog">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sku" label="SKU">
                <Input id="sku" name="sku" placeholder="R8-001" />
              </Field>
              <Field id="status" label="Status">
                <Select id="status" name="status" defaultValue="DRAFT">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="weightGrams" label="Weight (grams)">
                <Input id="weightGrams" name="weightGrams" type="number" placeholder="0" />
              </Field>
              <Field id="featured" label="Featured">
                <Select id="featured" name="featured" defaultValue="false">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="SEO">
            <Field id="seoTitle" label="SEO Title">
              <Input id="seoTitle" name="seoTitle" placeholder="SEO page title" />
            </Field>
            <Field id="seoDescription" label="SEO Description">
              <Input id="seoDescription" name="seoDescription" placeholder="SEO meta description" />
            </Field>
          </Section>

          <div className="flex gap-3 border-t border-border pt-6">
            <Button type="submit">Create Product</Button>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-eyebrow">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Select({
  id,
  name,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
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
