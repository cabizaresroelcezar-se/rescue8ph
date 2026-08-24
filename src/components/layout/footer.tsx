import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Globe, Camera, Briefcase, Clock, Check } from "lucide-react";
import { site } from "@/lib/site";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import {
  VisaIcon,
  MastercardIcon,
  GcashIcon,
  MayaIcon,
  CodIcon,
  BankTransferIcon,
} from "@/components/ui/payment-icons";

const linkGroups = [
  {
    title: "Shop",
    links: [
      { href: "/products",                  label: "All Products" },
      { href: "/products?sort=new",         label: "New Arrivals" },
      { href: "/services",                  label: "Services" },
      { href: "/contact",                   label: "Custom Orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",   label: "About Us" },
      { href: "/blog",    label: "Blog" },
      { href: "/faq",     label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy",  label: "Privacy Policy" },
      { href: "/terms",    label: "Terms of Service" },
      { href: "/shipping", label: "Shipping Policy" },
      { href: "/returns",  label: "Returns & Refunds" },
    ],
  },
];

const socials = [
  { href: "https://www.facebook.com/rescue8tradingphils", label: "Facebook",  Icon: Globe },
  { href: "https://www.instagram.com/",                   label: "Instagram", Icon: Camera },
  { href: "https://www.linkedin.com/",                    label: "LinkedIn",  Icon: Briefcase },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      {/* Newsletter hero strip */}
            <section className="relative isolate overflow-hidden border-b border-border">
              {/* Layered gradient background */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-blue-800"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,white_18%,transparent),transparent_50%),radial-gradient(circle_at_85%_70%,color-mix(in_oklch,var(--orange-500)_28%,transparent),transparent_55%)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-grid-faint opacity-20 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent)]"
              />
              {/* Decorative orbs */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/40 blur-3xl animate-float"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl animate-float"
                style={{ animationDelay: "1.2s" }}
              />

              <div className="container-wide relative grid gap-10 py-14 sm:py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12">
                <div className="text-primary-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                    <span className="pulse-dot" aria-hidden />
                    Monthly briefing
                  </span>
                  <h3 className="mt-4 text-display-lg !text-white">
                    Be the first to know when new gear drops.
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                    Monthly product updates, first-aid tips, and field insights from our
                    EMT-led team. Trusted by 500+ organizations nationwide.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/85">
                    <li className="inline-flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      New product launches
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      First-aid &amp; safety guides
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      Bulk-order discounts
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/15 bg-background/95 p-5 shadow-elev-4 backdrop-blur sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Get product updates
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Join our newsletter — it&apos;s free.
                      </p>
                    </div>
                  </div>
                  <NewsletterForm />
                </div>
              </div>
            </section>

      <div className="container-wide grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Image
            src="/logo.svg"
            alt="Rescue 8 Philippines"
            width={160}
            height={83}
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {site.brand.legalName} supplies premium EMS, rescue, safety, and
            first-aid equipment to first responders, government agencies, and
            organizations nationwide since {site.brand.founded}.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              <a href={`tel:${site.contact.phone.tel}`} className="hover:text-foreground">
                {site.contact.phone.label}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" aria-hidden />
              <a href={`mailto:${site.contact.email}`} className="hover:text-foreground">
                {site.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                {site.contact.address.line1}
                <br />
                {site.contact.address.line2}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                {site.contact.hours.weekday}
                <br />
                {site.contact.hours.saturday}
                <br />
                {site.contact.hours.sunday}
              </span>
            </li>
          </ul>
        </div>

        {linkGroups.map((group) => (
          <div key={group.title} className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-foreground">Follow</h4>
          <ul className="mt-4 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>

          <h4 className="mt-6 text-sm font-semibold text-foreground">We accept</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {[
                        { Icon: VisaIcon,           label: "Visa" },
                        { Icon: MastercardIcon,     label: "Mastercard" },
                        { Icon: GcashIcon,          label: "GCash" },
                        { Icon: MayaIcon,           label: "Maya" },
                        { Icon: BankTransferIcon,   label: "Bank Transfer" },
                        { Icon: CodIcon,            label: "Cash on Delivery" },
                      ].map(({ Icon, label }) => (
                        <span
                          key={label}
                          className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          title={label}
                        >
                          <Icon className="h-4 w-auto" />
                        </span>
                      ))}
                    </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Rescue 8 Trading Philippines, Inc. All rights reserved.
          </p>
          <p>DTI Registered (since 2012) &middot; Made in the Philippines</p>
        </div>
      </div>
    </footer>
  );
}
