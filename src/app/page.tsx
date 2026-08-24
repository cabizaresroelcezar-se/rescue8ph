import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowRight, Shield, Truck, Award, Headphones, Phone, MapPin } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: services }, { data: testimonials }, { data: faqs }, { data: categories }] =
    await Promise.all([
      supabase.from("products").select("id, title, slug, short_description, price, compare_at_price").eq("status", "ACTIVE").eq("featured", true).limit(8),
      supabase.from("services").select("title, slug, short_description").eq("status", "PUBLISHED").order("sort_order").limit(4),
      supabase.from("testimonials").select("name, role_or_company, quote").eq("is_enabled", true).order("sort_order").limit(3),
      supabase.from("faqs").select("question, answer").eq("is_enabled", true).order("sort_order").limit(6),
      supabase.from("categories").select("name, slug").eq("status", "PUBLISHED").order("name"),
    ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <Image
              src="/logo.svg"
              alt="Rescue 8 Philippines"
              width={200}
              height={103}
              className="mb-6 h-16 w-auto brightness-0 invert"
              priority
            />
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              EMS and Rescue Equipment
            </h1>
            <p className="mt-2 text-xl text-white/80">
              Emergency Disaster Preparedness and Rescue Equipment
            </p>
            <p className="mt-4 text-base text-white/70">
              Rescue 8 Philippines supplies premium EMS, rescue, safety, and
              first aid equipment to first responders, government agencies, and
              organizations nationwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/products" size="lg" className="bg-accent text-white hover:bg-accent/90">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/about" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Learn More
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            { icon: Shield, label: "Quality Assured", desc: "Field-tested equipment" },
            { icon: Truck, label: "Nationwide Delivery", desc: "All across the Philippines" },
            { icon: Award, label: "DTI Registered", desc: "Since February 2012" },
            { icon: Headphones, label: "Expert Support", desc: "EMS professionals on call" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Shop by Category</h2>
              <p className="mt-1 text-sm text-muted-foreground">Browse our equipment by category</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group rounded-lg border border-border bg-white p-6 transition-all hover:border-primary hover:shadow-sm"
                >
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Browse {cat.name.toLowerCase()} &rarr;</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Products</h2>
                <p className="mt-1 text-sm text-muted-foreground">Top picks for emergency preparedness</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline">
                View all products &rarr;
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group rounded-lg border border-border bg-white p-4 transition-all hover:border-primary hover:shadow-sm"
                >
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-surface">
                    <span className="text-4xl text-muted-foreground/30">+</span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary">{product.title}</h3>
                  {product.short_description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {product.short_description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">PHP {product.price.toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        PHP {product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Our Services</h2>
              <p className="mt-1 text-sm text-muted-foreground">Comprehensive EMS, rescue, and safety solutions</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href="/services"
                  className="group rounded-lg border border-border bg-white p-6 transition-all hover:border-primary hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">What Our Clients Say</h2>
              <p className="mt-1 text-sm text-muted-foreground">Trusted by professionals across the Philippines</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface p-6">
                  <p className="text-sm text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    {t.role_or_company && (
                      <p className="text-sm text-muted-foreground">{t.role_or_company}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Common questions about our products and services</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-lg border border-border bg-white p-4">
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Ready to equip your team?</h2>
          <p className="mt-2 text-white/80">Browse our catalog or contact us for custom orders and bulk pricing.</p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/products" className="bg-accent text-white hover:bg-accent/90">
              Shop Now
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Contact Us
            </ButtonLink>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              (02) 622-9565
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Quezon City, Philippines
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}