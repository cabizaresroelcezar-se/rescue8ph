import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addAddress, deleteAddress } from "@/features/cart/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your delivery addresses</p>
        </div>
      </div>

      {params.error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {params.error}
        </div>
      )}

      {/* Existing addresses */}
      {addresses && addresses.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id} className={addr.is_default ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {addr.label || `${addr.first_name} ${addr.last_name}`}
                  </CardTitle>
                  {addr.is_default && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{addr.first_name} {addr.last_name}</p>
                  <p>{addr.phone}</p>
                  <p>{addr.street_address}</p>
                  {addr.building_unit && <p>{addr.building_unit}</p>}
                  <p>{addr.barangay}, {addr.city_municipality}</p>
                  <p>{addr.province}, {addr.region}</p>
                  {addr.postal_code && <p>{addr.postal_code}</p>}
                  {addr.delivery_notes && <p className="italic">Notes: {addr.delivery_notes}</p>}
                </div>
                <form action={deleteAddress} className="mt-4">
                  <input type="hidden" name="id" value={addr.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new address form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add New Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" name="firstName" required placeholder="Juan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" name="lastName" required placeholder="Dela Cruz" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" required placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label (optional)</Label>
                <Input id="label" name="label" placeholder="Home, Office, etc." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input id="region" name="region" required placeholder="NCR" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input id="province" name="province" required placeholder="Metro Manila" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cityMunicipality">City/Municipality *</Label>
                <Input id="cityMunicipality" name="cityMunicipality" required placeholder="Quezon City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay *</Label>
                <Input id="barangay" name="barangay" required placeholder="Masambong" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input id="streetAddress" name="streetAddress" required placeholder="Unit G4 #65 Gasan Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingUnit">Building/Unit (optional)</Label>
                <Input id="buildingUnit" name="buildingUnit" placeholder="Unit number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code (optional)</Label>
                <Input id="postalCode" name="postalCode" placeholder="1115" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Delivery Notes (optional)</Label>
              <Input id="deliveryNotes" name="deliveryNotes" placeholder="Gate code, landmarks, etc." />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                value="true"
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Set as default address
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Save Address</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}