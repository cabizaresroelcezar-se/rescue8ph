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
 * Note: the Footer is NOT included here. It is rendered separately by
 * the root layout AFTER <main> so the DOM order is:
 *   <Header> → <main>{children}</main> → <Footer>
 */
export async function StorefrontShell() {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "";
  if (pathname.startsWith("/admin")) return null;
  return <Header />;
}