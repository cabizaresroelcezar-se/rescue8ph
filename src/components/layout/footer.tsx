import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Image
              src="/logo.png"
              alt="Rescue 8 Philippines"
              width={140}
              height={72}
              className="h-12 w-auto"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              EMS and Rescue Equipment. Emergency Disaster Preparedness and Rescue Equipment.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="transition-colors hover:text-primary">All Products</Link></li>
              <li><Link href="/services" className="transition-colors hover:text-primary">Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="transition-colors hover:text-primary">About Us</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-primary">Blog</Link></li>
              <li><Link href="/faq" className="transition-colors hover:text-primary">FAQ</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-primary">Terms of Service</Link></li>
            </ul>
            <a
              href="https://www.facebook.com/rescue8tradingphils"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rescue 8 Trading Philippines, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}