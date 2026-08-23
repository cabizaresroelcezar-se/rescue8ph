import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: inventory } = await supabase
    .from("inventory")
    .select(`
      id,
      quantity_on_hand,
      quantity_reserved,
      reorder_level,
      product:products(id, title, slug, sku)
    `)
    .order("quantity_on_hand", { ascending: true })
    .limit(50);

  type InventoryWithProduct = {
    id: string;
    quantity_on_hand: number;
    quantity_reserved: number;
    reorder_level: number;
    product: { title: string }[] | { title: string } | null;
  };
  const typedInventory = (inventory || []) as unknown as InventoryWithProduct[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track stock levels and manage inventory
        </p>
      </div>

      {typedInventory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No inventory records yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Inventory is created when products are added with stock tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">On Hand</th>
                <th className="px-4 py-3 text-right font-medium">Reserved</th>
                <th className="px-4 py-3 text-right font-medium">Reorder Level</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {typedInventory.map((item) => {
                const productTitle = Array.isArray(item.product)
                  ? item.product[0]?.title
                  : item.product?.title;
                const isLow = item.quantity_on_hand <= item.reorder_level;
                const isOut = item.quantity_on_hand === 0;

                return (
                  <tr key={item.id} className="border-b hover:bg-surface">
                    <td className="px-4 py-3 font-medium">{productTitle || "—"}</td>
                    <td className="px-4 py-3 text-right">{item.quantity_on_hand}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.quantity_reserved}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.reorder_level}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}