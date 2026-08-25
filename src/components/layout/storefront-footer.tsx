import { Suspense } from "react";
import { headers } from "next/headers";
import { Footer } from "@/components/layout/footer";

/**
 * Renders the storefront footer EXCEPT on /admin/* routes.
 * Mirrors StorefrontShell's path-detection logic.
 *
 * Wrapped in <Suspense> with `dynamic = "force-dynamic"` so the
 * path-detection re-runs on every navigation. Without this, Next.js
 * can reuse a cached layout when navigating client-side, and the
 * storefront footer would briefly appear on /admin/* pages until
 * the next full refresh.
 */
export const dynamic = "force-dynamic";

export async function StorefrontFooter() {
  return (
    <Suspense fallback={null}>
      <StorefrontFooterInner />
    </Suspense>
  );
}

async function StorefrontFooterInner() {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "";
  if (pathname.startsWith("/admin")) return null;
  return <Footer />;
}