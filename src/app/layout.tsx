import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rescue 8 Philippines — EMS and Rescue Equipment",
    template: "%s | Rescue 8 Philippines",
  },
  description:
    "Rescue 8 Philippines — EMS and Rescue Equipment. Emergency Disaster Preparedness and Rescue Equipment for first responders, government agencies, and organizations nationwide.",
  keywords: [
    "Rescue 8 Philippines",
    "EMS equipment",
    "rescue equipment",
    "first aid kits",
    "safety equipment",
    "emergency preparedness",
    "Philippines",
  ],
  authors: [{ name: "Rescue 8 Trading Philippines, Inc." }],
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Rescue 8 Philippines — EMS and Rescue Equipment",
    description:
      "EMS and Rescue Equipment. Emergency Disaster Preparedness and Rescue Equipment.",
    type: "website",
    locale: "en_PH",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0E1018" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

/**
 * Root layout — ONLY the <html>/<head>/<body> wrapper.
 *
 * Per-route chrome is owned by route-group layouts:
 *   - (admin)/admin/*       → (admin)/admin/layout.tsx  (sidebar + topbar)
 *   - (storefront)/*        → (storefront)/layout.tsx   (Header + Footer)
 *   - account, auth, api    → no chrome (uses this root layout only)
 *
 * Previously the root layout rendered <StorefrontShell /> + <StorefrontFooter />
 * which conditionally suppressed themselves on /admin/* via headers(). That
 * worked for direct loads but could flash the storefront chrome during client-
 * side navigations because of cached layouts. With separate route groups, the
 * storefront Header/Footer are LITERALLY not in the admin React tree — they
 * cannot render.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elev-3 focus:outline-none"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}