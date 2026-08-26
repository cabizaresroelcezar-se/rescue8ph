export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Gradient background — three radial blobs so it looks rich in both
          dark and light modes. pointer-events-none keeps it decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Primary blob, top-left */}
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl dark:bg-primary/40" />
        {/* Accent blob, bottom-right */}
        <div className="absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-accent/25 blur-3xl dark:bg-accent/35" />
        {/* Subtle middle fill so the gradient transitions smoothly */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent dark:via-primary/10" />
      </div>

      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
