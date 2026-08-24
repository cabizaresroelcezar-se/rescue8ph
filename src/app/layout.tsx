import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}