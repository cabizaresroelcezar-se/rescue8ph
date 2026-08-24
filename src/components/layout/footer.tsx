import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Globe, Camera, Briefcase, Clock } from "lucide-react";
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
      <div className="border-b border-border bg-background">
        <div className="container-wide grid items-center gap-6 py-10 md:grid-cols-2">
          <div>
            <p className="text-eyebrow">Stay prepared</p>
            <h3 className="mt-2 text-display-md text-foreground">
              Get product updates &amp; first-aid tips.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
          <form
                      action="/api/newsletter"
                      method="post"
                      className="hidden"
                      aria-hidden
                    >
                      <input type="email" name="email" />
                    </form>
                    <NewsletterForm />
                  </div>
                </div>

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
