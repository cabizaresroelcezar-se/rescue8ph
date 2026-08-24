import type { Metadata } from "next";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Briefcase,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { site } from "@/lib/site";
import { FadeIn, Stagger } from "@/lib/motion";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Rescue 8 Philippines team — product inquiries, bulk and institutional quotes, training inquiries, and showroom visits in Quezon City.",
};

const channels = [
  {
      icon: Briefcase,
      title: "Sales & bulk orders",
      line1: "Hospitals, LGUs, schools, and corporate accounts.",
      cta: { href: "tel:+6326229565", label: "(02) 622-9565" },
    },
  {
    icon: GraduationCap,
    title: "Training & certification",
    line1: "CPR & First Aid, BLS, Stop the Bleed, Fire Extinguisher, and on-site programs.",
    cta: { href: "tel:+639178946055", label: "+63 917 894 6055" },
  },
  {
    icon: MessageSquare,
    title: "Email",
    line1: "We reply within one business day.",
    cta: { href: "mailto:info@rescue8ph.com", label: "info@rescue8ph.com" },
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b border-border bg-surface">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="max-w-3xl">
            <p className="text-eyebrow">Contact</p>
            <h1 className="mt-2 text-display-2xl text-foreground">
              Talk to the {site.brand.shortName} team.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Whether you need a single first-aid kit or a country-wide rollout
              for first responders — we&apos;re here to help. Send a message
              below or reach us directly during business hours.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CONTACT CHANNELS */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-12">
          <Stagger className="grid gap-4 md:grid-cols-3">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <FadeIn
                  key={c.title}
                  className="group rounded-xl border border-border bg-card p-6 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.line1}</p>
                  <a
                    href={c.cta.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {c.cta.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </FadeIn>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* FORM + SHOWROOM */}
      <section className="bg-surface">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-2 sm:p-8">
            <p className="text-eyebrow">Send a message</p>
            <h2 className="mt-2 text-display-md text-foreground">
              We&apos;ll get back to you within one business day.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us a bit about your team and what you&apos;re looking for.
              The more context you give, the faster we can help.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </FadeIn>

          <FadeIn delay={80} className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
              <p className="text-eyebrow">Showroom</p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Visit us in Quezon City
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {site.contact.address.line1}
                    <br />
                    {site.contact.address.line2}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`tel:${site.contact.phone.tel}`}
                    className="hover:text-foreground"
                  >
                    {site.contact.phone.label}
                  </a>
                  <span className="text-muted-foreground/60">·</span>
                  <a
                    href={`tel:${site.contact.phone.mobile}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {site.contact.phone.mobile}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="hover:text-foreground"
                  >
                    {site.contact.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {site.contact.hours.weekday}
                    <br />
                    {site.contact.hours.saturday}
                    <br />
                    <span className="text-muted-foreground">{site.contact.hours.sunday}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-1">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/10 via-background to-accent/10">
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <MapPin className="h-6 w-6 text-primary" aria-hidden />
                  <p className="text-sm font-semibold text-foreground">
                    {site.contact.address.line1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Brgy Masambong, Quezon City
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${site.contact.address.line1}, ${site.contact.address.line2}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Open in Google Maps
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
