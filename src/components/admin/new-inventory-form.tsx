"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X, PackagePlus } from "lucide-react";
import {
  createInventory,
  getProductsWithoutInventory,
  type CreateInventoryInput,
} from "@/features/inventory/actions";

export interface ProductOption {
  id: string;
  title: string;
  sku: string | null;
  price: number;
}

export interface NewInventoryFormProps {
  /** Server-fetched list of products that don't yet have an inventory row */
  initialProducts: ProductOption[];
}

/**
 * "Add inventory" modal — pick a product, set initial on-hand qty,
 * optional reserved + reorder threshold, save.
 *
 * Closes itself on success and refreshes the inventory page so the new
 * row appears immediately.
 */
export function NewInventoryForm({ initialProducts }: NewInventoryFormProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  // Server-rendered initial list, kept as state so we can refresh
  // async on open. The setState happens in response to a click handler
  // or inside an await callback — never synchronously in useEffect.
  const [products, setProducts] = React.useState<ProductOption[]>(initialProducts);
  const [search, setSearch] = React.useState("");
  const [productId, setProductId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<string>("0");
  const [reserved, setReserved] = React.useState<string>("0");
  const [reorder, setReorder] = React.useState<string>("5");
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  async function handleOpen() {
    setOpen(true);
    setRefreshing(true);
    setProducts(initialProducts); // Reset to baseline first
    try {
      const list = await getProductsWithoutInventory();
      setProducts(list);
    } catch {
      // Silent: initial products stay displayed on the screen
    } finally {
      setRefreshing(false);
    }
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setProductId("");
    setQuantity("0");
    setReserved("0");
    setReorder("5");
    setNote("");
    setError(null);
    setSearch("");
  }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 100);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 100);
  }, [products, search]);

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError("Please pick a product");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative whole number");
      return;
    }
    const res = parseInt(reserved, 10);
    const rol = parseInt(reorder, 10);
    if (isNaN(res) || res < 0) {
      setError("Reserved must be a non-negative whole number");
      return;
    }
    if (isNaN(rol) || rol < 0) {
      setError("Reorder level must be a non-negative whole number");
      return;
    }
    if (res > qty) {
      setError("Reserved can't exceed quantity on hand");
      return;
    }

    const payload: CreateInventoryInput = {
      productId,
      quantityOnHand: qty,
      quantityReserved: res,
      reorderLevel: rol,
      note: note.trim() || undefined,
    };

    setSubmitting(true);
    const result = await createInventory(payload);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Failed to create inventory");
      return;
    }

    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          handleOpen();
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-elev-1 transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Add inventory
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add inventory"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg space-y-4 overflow-hidden rounded-2xl bg-background shadow-elev-4"
          >
            <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">
                  Add inventory record
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pick a product and set its initial stock level
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5">
              {/* Product picker */}
              <div>
                <label className="block text-xs font-medium text-foreground">
                  Product
                </label>
                {selectedProduct ? (
                  <div className="mt-1 flex items-center justify-between rounded-md border border-primary bg-primary/5 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {selectedProduct.title}
                      </p>
                      {selectedProduct.sku && (
                        <p className="text-[10px] font-mono text-muted-foreground">
                          SKU {selectedProduct.sku}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductId("")}
                      className="ml-2 text-xs text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setPickerOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary"
                    >
                      <span>
                        {refreshing
                          ? "Loading products..."
                          : products.length === 0
                            ? "All products already have inventory"
                            : "Pick a product…"}
                      </span>
                      <span className="text-xs text-muted-foreground">▼</span>
                    </button>
                    {pickerOpen && products.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-72 w-full overflow-hidden rounded-md border border-border bg-background shadow-elev-3">
                        <div className="border-b border-border p-2">
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or SKU…"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          {filtered.length === 0 ? (
                            <li className="p-3 text-center text-xs text-muted-foreground">
                              No products match.
                            </li>
                          ) : (
                            filtered.map((p) => (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductId(p.id);
                                    setPickerOpen(false);
                                  }}
                                  className="flex w-full items-center justify-between gap-2 border-b border-border/40 px-3 py-2 text-left text-xs hover:bg-secondary"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-foreground">
                                      {p.title}
                                    </p>
                                    {p.sku && (
                                      <p className="text-[10px] font-mono text-muted-foreground">
                                        SKU {p.sku}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="qty"
                    className="block text-xs font-medium text-foreground"
                  >
                    Initial quantity on hand
                  </label>
                  <input
                    id="qty"
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="res"
                    className="block text-xs font-medium text-foreground"
                  >
                    Already reserved (optional)
                  </label>
                  <input
                    id="res"
                    type="number"
                    min="0"
                    step="1"
                    value={reserved}
                    onChange={(e) => setReserved(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rol"
                    className="block text-xs font-medium text-foreground"
                  >
                    Reorder level (optional)
                  </label>
                  <input
                    id="rol"
                    type="number"
                    min="0"
                    step="1"
                    value={reorder}
                    onChange={(e) => setReorder(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="block text-xs font-medium text-foreground"
                >
                  Movement note (optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Initial stock from PO #123"
                  className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !productId}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-elev-1 transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Create inventory
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
