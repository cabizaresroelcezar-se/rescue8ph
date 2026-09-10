import Link from "next/link";

export const metadata = {
  title: "Cookie Policy",
  description:
    "Cookie policy for Rescue 8 Trading Philippines, Inc. — what cookies we use (essential Supabase auth only), what we don't use (no tracking or analytics cookies), and how to manage cookies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <p>
          This Cookie Policy explains how Rescue 8 Trading Philippines, Inc. uses
          cookies on rescue8ph.com. It is provided in compliance with the Philippine
          Data Privacy Act of 2012 (RA 10173) and is supplementary to our{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline hover:text-foreground/80"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* 1. What Are Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your device (computer, tablet, or
            phone) by a website you visit. They allow the website to recognize your
            device and remember information about your visit, such as your login
            status or preferences. Cookies are widely used to make websites function
            efficiently and to provide information to website owners.
          </p>
          <p>
            Cookies are not programs and cannot install software or viruses on your
            device. They are simply text files that store limited data.
          </p>
        </section>

        {/* 2. Essential Cookies Used */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Essential Cookies We Use
          </h2>
          <p>
            Our website uses only <strong className="text-foreground">essential</strong>{" "}
            cookies that are strictly necessary for the website to function. These
            are:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">
                Supabase authentication session cookies:
              </strong>{" "}
              When you log in to your account, Supabase Auth sets session cookies on
              your device. These cookies authenticate your session, keep you logged
              in as you navigate the site, and allow you to access account-only
              features such as placing orders and viewing order history.
            </li>
          </ul>
          <p>
            These cookies are classified as{" "}
            <strong className="text-foreground">strictly necessary</strong>. Without
            them, you would not be able to log in or use authenticated features of
            the website.
          </p>
        </section>

        {/* 3. No Analytics or Tracking Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. No Analytics or Tracking Cookies
          </h2>
          <p>
            We are committed to a minimal-cookie, no-tracking approach. Our website{" "}
            <strong className="text-foreground">does not use</strong> any of the
            following:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">
                Google Analytics cookies:
              </strong>{" "}
              We do not use Google Analytics or any Google Analytics tracking cookies.
            </li>
            <li>
              <strong className="text-foreground">
                Google Tag Manager:
              </strong>{" "}
              We do not use Google Tag Manager or any tags it manages.
            </li>
            <li>
              <strong className="text-foreground">Meta/Facebook Pixel:</strong> We do
              not use the Meta (Facebook) Pixel or any Meta tracking cookies.
            </li>
            <li>
              <strong className="text-foreground">
                Other third-party analytics:
              </strong>{" "}
              We do not use Hotjar, Mixpanel, Amplitude, Adobe Analytics, or any other
              third-party analytics service.
            </li>
            <li>
              <strong className="text-foreground">Tracking pixels:</strong> We do not
              embed tracking pixels from any advertising or social media platform.
            </li>
          </ul>
          <p>
            Our site uses <strong className="text-foreground">first-party</strong>{" "}
            analytics only, meaning that when you browse products, your activity is
            stored in our own database for the sole purpose of improving our product
            offerings. This data is not transmitted to any third-party analytics
            provider and no cookies are set for this purpose.
          </p>
        </section>

        {/* 4. No Third-Party Advertising Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. No Third-Party Advertising Cookies
          </h2>
          <p>
            Our website does <strong className="text-foreground">not</strong> display
            third-party advertisements and does <strong className="text-foreground">not</strong>{" "}
            use advertising cookies of any kind. We do not participate in any
            advertising network or retargeting program. No cookies are set by
            third-party advertisers on rescue8ph.com.
          </p>
        </section>

        {/* 5. No Third-Party Embedded Content */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. No Third-Party Embedded Content
          </h2>
          <p>
            Our website does not embed third-party content such as YouTube videos,
            Google Maps, social media widgets, or other iframes that could set
            cookies. Our rich text editor strips iframe embeds, ensuring no
            third-party content can introduce cookies through embedded elements.
          </p>
        </section>

        {/* 6. How to Manage Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. How to Manage Cookies
          </h2>
          <p>
            Because we only use essential authentication cookies, you generally do not
            need to manage cookie preferences on our site. However, you can control
            or delete cookies through your browser settings at any time:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Google Chrome:</strong> Settings
              &rarr; Privacy and security &rarr; Cookies and other site data
            </li>
            <li>
              <strong className="text-foreground">Mozilla Firefox:</strong> Settings
              &rarr; Privacy &amp; Security &rarr; Cookies and Site Data
            </li>
            <li>
              <strong className="text-foreground">Safari:</strong> Preferences
              &rarr; Privacy &rarr; Cookies and website data
            </li>
            <li>
              <strong className="text-foreground">Microsoft Edge:</strong> Settings
              &rarr; Cookies and site permissions &rarr; Cookies and site data
            </li>
          </ul>
          <p>
            Please note that if you disable essential authentication cookies, you
            will not be able to log in to your account or place orders on our website.
            You can still browse products and view public pages without cookies.
          </p>
          <p>
            For more information about managing cookies, visit{" "}
            <a
              href="https://www.allaboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              www.allaboutcookies.org
            </a>
            .
          </p>
        </section>

        {/* 7. Changes to This Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Changes to This Cookie Policy
          </h2>
          <p>
            If we ever change our cookie practices &mdash; for example, by adding
            analytics or optional cookies &mdash; we will update this policy and
            provide a clear notice on the website. The &ldquo;Last updated&rdquo;
            date at the top of this page will reflect the most recent revision.
          </p>
        </section>

        {/* 8. Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. Contact Us
          </h2>
          <p>
            If you have any questions about this Cookie Policy or our use of cookies,
            please contact us:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Email:</strong>{" "}
              <a
                href="mailto:info@rescue8ph.com"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                info@rescue8ph.com
              </a>
            </li>
            <li>
              <strong className="text-foreground">Phone:</strong> (02) 622-9565
            </li>
            <li>
              <strong className="text-foreground">Mobile:</strong> +63 917 577 6055
            </li>
            <li>
              <strong className="text-foreground">Address:</strong> 156B Wayan St.
              Brgy. Masambong, Quezon City, Philippines, 1115
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}