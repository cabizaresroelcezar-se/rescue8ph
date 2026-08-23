export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Get in touch with the Rescue 8 Philippines team
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Get in Touch</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-medium">Address</p>
              <p className="mt-1 text-muted-foreground">
                Unit G4 #65 Gasan, Brgy Masambong<br />
                Quezon City, Philippines
              </p>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <p className="mt-1 text-muted-foreground">(02) 622-9565</p>
            </div>
            <div>
              <p className="font-medium">Facebook</p>
              <a
                href="https://www.facebook.com/rescue8tradingphils"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-primary hover:underline"
              >
                facebook.com/rescue8tradingphils
              </a>
            </div>
            <div>
              <p className="font-medium">Business Hours</p>
              <p className="mt-1 text-muted-foreground">
                Monday to Friday: 8:00 AM - 5:00 PM<br />
                Saturday: 8:00 AM - 12:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-surface p-6">
          <h2 className="text-lg font-semibold">Send a Message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For inquiries, quotes, and bulk orders, please reach out through
            our Facebook page or call us directly. We respond within 1 business day.
          </p>
          <a
            href="https://www.facebook.com/rescue8tradingphils"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Message on Facebook
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            For government and institutional purchases, we provide special
            pricing and can accommodate purchase orders.
          </p>
        </div>
      </div>
    </div>
  );
}