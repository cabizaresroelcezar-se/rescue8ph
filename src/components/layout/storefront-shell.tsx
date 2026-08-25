import { Header } from "@/components/layout/header";

/**
 * Renders the storefront Header. Used by (storefront)/layout.tsx.
 *
 * NOTE: This is now a thin pass-through. The component is preserved
 * for backward compatibility (somewhere it might be referenced) but
 * the recommended path is to import { Header } directly.
 */
export function StorefrontShell() {
  return <Header />;
}