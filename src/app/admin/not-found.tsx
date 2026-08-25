import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <FileQuestion className="h-8 w-8" />
      </div>
      <p className="mt-4 text-eyebrow text-muted-foreground">Error 404</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">
        Resource not found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The item you&apos;re looking for may have been deleted, or your
        account no longer has permission to view it. Head back to the
        dashboard and try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/admin" size="sm">
          Dashboard
        </ButtonLink>
        <ButtonLink href="/admin/pages" variant="outline" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> All pages
        </ButtonLink>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Lost? <Link href="/admin" className="text-foreground underline-offset-4 hover:underline">Return to admin home</Link>.
      </p>
    </div>
  );
}