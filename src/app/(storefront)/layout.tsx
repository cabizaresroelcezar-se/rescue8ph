import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Storefront layout — wraps every page under (storefront)/* with the
 * marketing Header + Footer. This is the ONLY layout that includes
 * storefront chrome, so:
 *
 *   /admin/*       → (admin)/admin/layout.tsx (sidebar + topbar)
 *   /[slug], /     → (storefront)/layout.tsx (header + footer)
 *   /account, /auth, /api → root layout (no chrome)
 *
 * No pathname detection, no headers() trick — each route group has
 * its own dedicated layout file. The storefront Header/Footer literally
 * cannot render on /admin/* because the admin layout is a different
 * React tree.
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 animate-fade-in">
        {children}
      </main>
      <Footer />
    </>
  );
}