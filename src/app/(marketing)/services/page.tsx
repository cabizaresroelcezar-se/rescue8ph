import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("title, slug, short_description, description")
    .eq("status", "PUBLISHED")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Our Services</h1>
      <p className="mt-2 text-muted-foreground">
        Comprehensive EMS, rescue, and safety solutions for every need
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(services || []).map((service) => (
          <div key={service.slug} className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-bold">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {service.short_description}
            </p>
            {service.description && (
              <p className="mt-3 text-sm text-muted-foreground">{service.description}</p>
            )}
          </div>
        ))}
        {!services || services.length === 0 ? (
          <p className="text-muted-foreground">Services information coming soon.</p>
        ) : null}
      </div>
    </div>
  );
}