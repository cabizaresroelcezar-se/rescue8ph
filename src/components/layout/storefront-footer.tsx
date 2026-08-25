import { Footer } from "@/components/layout/footer";

/**
 * Renders the storefront Footer. Used by (storefront)/layout.tsx.
 *
 * NOTE: This is now a thin pass-through. The component is preserved
 * for backward compatibility but the recommended path is to import
 * { Footer } directly.
 */
export function StorefrontFooter() {
  return <Footer />;
}