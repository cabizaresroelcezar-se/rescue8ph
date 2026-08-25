import { Suspense } from "react";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";

/**
 * Renders the storefront header EXCEPT on /admin/* routes,
 * which use their own dedicated back-office layout (sidebar + topbar).
 *
 * Server component — uses the request URL set by middleware (x-pathname)
 * to skip rendering on admin routes so we don't pull in Header's
 * server-only dependencies (next/headers) into admin pages.
 *
 * Wrapped in <Suspense> with `dynamic = "force-dynamic"` so the
 * path-detection re-runs on every navigation. Without this, Next.js
 * can reuse a cached layout when navigating client-side, and the
 * storefront header would briefly appear on /admin/* pages until
 * the next full refresh.
 */
export const dynamic = "force-dynamic";

export async function StorefrontShell() {
  return (
    <Suspense fallback={null}>
      <StorefrontShellInner />
    </Suspense>
  );
}

async function StorefrontShellInner() {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "";
  if (pathname.startsWith("/admin")) return null;
  return <Header />;
}