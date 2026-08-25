import { headers } from "next/headers";
import { Footer } from "@/components/layout/footer";

/**
 * Renders the storefront footer EXCEPT on /admin/* routes.
 * Mirrors StorefrontShell's path-detection logic.
 */
export async function StorefrontFooter() {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "";
  if (pathname.startsWith("/admin")) return null;
  return <Footer />;
}