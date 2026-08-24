import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-faint opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
      />
      <div className="container-page relative text-center">
        <p className="text-eyebrow">Error 404</p>
        <h1 className="mt-3 text-display-2xl text-foreground">
          We can&apos;t find that page.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The link may be broken, or the product may have been moved. Try
          searching the catalog or heading back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            <Home className="h-4 w-4" />
            Back to home
          </ButtonLink>
          <ButtonLink href="/products" size="lg" variant="outline">
            <Search className="h-4 w-4" />
            Browse products
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
