import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn, Stagger } from "@/lib/motion";
import { addAddress, deleteAddress } from "@/features/cart/actions";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/addresses");
  }

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-10 sm:py-12">
          <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-eyebrow">My Account</p>
              <h1 className="mt-2 text-display-lg text-foreground">
                Delivery Addresses
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage where your orders ship.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="container-page space-y-8 py-10">
        {params.error && (
          <FadeIn
            delay={0}
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {params.error}
          </FadeIn>
        )}

        {/* Existing addresses */}
        {addresses && addresses.length > 0 && (
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <FadeIn
                key={addr.id}
                className={
                  "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-2 " +
                  (addr.is_default
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : "border-border")
                }
              >
                {addr.is_default && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Star className="h-3 w-3" /> Default
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {addr.label || `${addr.first_name} ${addr.last_name}`}
                    </p>
                    <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {addr.first_name} {addr.last_name}
                      </p>
                      <p>{addr.phone}</p>
                      <p>{addr.street_address}</p>
                      {addr.building_unit && <p>{addr.building_unit}</p>}
                      <p>
                        {addr.barangay}, {addr.city_municipality}
                      </p>
                      <p>
                        {addr.province}, {addr.region}
                      </p>
                      {addr.postal_code && <p>{addr.postal_code}</p>}
                      {addr.delivery_notes && (
                        <p className="italic">Notes: {addr.delivery_notes}</p>
                      )}
                    </div>
                    <form action={deleteAddress} className="mt-4">
                      <input type="hidden" name="id" value={addr.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive underline-offset-4 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </FadeIn>
            ))}
          </Stagger>
        )}

        {/* Add new address form */}
        <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Add New Address
              </h2>
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this for faster checkout.
              </p>
            </div>
          </div>

          <form action={addAddress} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="First name" required>
                <Input id="firstName" name="firstName" required placeholder="Juan" />
              </Field>
              <Field id="lastName" label="Last name" required>
                <Input id="lastName" name="lastName" required placeholder="Dela Cruz" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phone" label="Phone" required>
                <Input id="phone" name="phone" required placeholder="+63 9XX XXX XXXX" />
              </Field>
              <Field id="label" label="Label (optional)">
                <Input id="label" name="label" placeholder="Home, Office, etc." />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="region" label="Region" required>
                <Input id="region" name="region" required placeholder="NCR" />
              </Field>
              <Field id="province" label="Province" required>
                <Input id="province" name="province" required placeholder="Metro Manila" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="cityMunicipality" label="City / Municipality" required>
                <Input id="cityMunicipality" name="cityMunicipality" required placeholder="Quezon City" />
              </Field>
              <Field id="barangay" label="Barangay" required>
                <Input id="barangay" name="barangay" required placeholder="Masambong" />
              </Field>
            </div>
            <Field id="streetAddress" label="Street Address" required>
              <Input id="streetAddress" name="streetAddress" required placeholder="Unit G4 #65 Gasan Street" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="buildingUnit" label="Building / Unit (optional)">
                <Input id="buildingUnit" name="buildingUnit" placeholder="Unit number" />
              </Field>
              <Field id="postalCode" label="Postal Code (optional)">
                <Input id="postalCode" name="postalCode" placeholder="1115" />
              </Field>
            </div>
            <Field id="deliveryNotes" label="Delivery Notes (optional)">
              <Input id="deliveryNotes" name="deliveryNotes" placeholder="Gate code, landmarks, etc." />
            </Field>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                value="true"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Set as default address
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Save Address</Button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
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
