import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rescue 8 Philippines",
    template: "%s | Rescue 8 Philippines",
  },
  description:
    "Rescue 8 Philippines — premium products and solutions for every Filipino. Shop with confidence.",
  keywords: ["Rescue 8", "Philippines", "shopping", "ecommerce", "online store"],
  authors: [{ name: "Rescue 8 Philippines" }],
  openGraph: {
    title: "Rescue 8 Philippines",
    description:
      "Premium products and solutions for every Filipino. Shop with confidence.",
    type: "website",
    locale: "en_PH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}