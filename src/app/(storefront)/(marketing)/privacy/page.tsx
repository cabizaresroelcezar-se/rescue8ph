import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Rescue 8 Trading Philippines, Inc. — how we collect, use, and protect your personal data in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <p>
          Rescue 8 Trading Philippines, Inc. (&ldquo;Rescue 8 Philippines,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your
          privacy and is committed to protecting your personal data in accordance with
          the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its
          Implementing Rules and Regulations. This Privacy Policy explains how we
          collect, use, store, and safeguard your personal information when you visit
          our website at rescue8ph.com or use our services.
        </p>

        {/* 1. Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <h3 className="text-base font-semibold text-foreground">
            1.1 Information You Provide
          </h3>
          <p>
            We collect information that you voluntarily provide when you create an
            account, place an order, or contact us for customer support. This
            includes:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Account information:</strong> Full
              name, email address, phone number, and password (stored as a
              cryptographic hash).
            </li>
            <li>
              <strong className="text-foreground">Order details:</strong> Delivery
              address, ordered products, quantities, special instructions, and order
              history.
            </li>
            <li>
              <strong className="text-foreground">
                Customer support communications:
              </strong>{" "}
              Messages, emails, or phone call records when you reach out to us.
            </li>
            <li>
              <strong className="text-foreground">Marketing opt-in:</strong> If you
              choose to subscribe to our newsletter or promotional communications.
            </li>
          </ul>

          <h3 className="text-base font-semibold text-foreground">
            1.2 Information Collected Automatically
          </h3>
          <p>
            When you browse our website, we collect limited technical data necessary
            for the operation of the site:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Authentication session data:</strong>{" "}
              Supabase auth session cookies that keep you logged in. These are
              strictly necessary for site functionality.
            </li>
            <li>
              <strong className="text-foreground">
                Browsing data within our own database:
              </strong>{" "}
              Product views and search queries are logged in our first-party database
              for site improvement. This is not shared with any third-party analytics
              provider.
            </li>
          </ul>
          <p className="font-semibold text-foreground">
            We do <u>not</u> use Google Analytics, Google Tag Manager, Meta Pixel, or
            any other third-party tracking or analytics service.
          </p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Order processing:</strong> To
              process and fulfill your orders, calculate shipping fees, and manage
              inventory.
            </li>
            <li>
              <strong className="text-foreground">Delivery:</strong> To arrange
              shipping and provide delivery updates via your chosen courier.
            </li>
            <li>
              <strong className="text-foreground">Customer support:</strong> To
              respond to your inquiries, process returns, and resolve issues with
              your orders.
            </li>
            <li>
              <strong className="text-foreground">Account management:</strong> To
              maintain your account, authenticate your login, and secure your
              session.
            </li>
            <li>
              <strong className="text-foreground">Marketing (opt-in only):</strong>{" "}
              To send you promotional emails or updates, but only if you have
              explicitly opted in. You may unsubscribe at any time.
            </li>
            <li>
              <strong className="text-foreground">Legal compliance:</strong> To meet
              our obligations under Philippine law, including tax and business
              record-keeping requirements.
            </li>
          </ul>
          <p>
            We do <strong className="text-foreground">not</strong> sell, rent, or
            trade your personal data to any third party for marketing purposes.
          </p>
        </section>

        {/* 3. Legal Basis */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Legal Basis for Processing
          </h2>
          <p>
            Our processing of your personal data is lawful under the Data Privacy Act
            of 2012 (RA 10173) based on the following grounds:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Consent:</strong> You have given
              clear and informed consent when creating an account, placing an order,
              or opting into marketing communications.
            </li>
            <li>
              <strong className="text-foreground">Contractual necessity:</strong>{" "}
              Processing is necessary to fulfill our contractual obligations to you,
              such as processing and delivering your orders.
            </li>
            <li>
              <strong className="text-foreground">Legitimate interest:</strong> We
              process certain data to operate our business, secure our systems, and
              provide customer support.
            </li>
            <li>
              <strong className="text-foreground">Legal obligation:</strong> We
              retain certain records to comply with Philippine tax and commercial
              regulations.
            </li>
          </ul>
        </section>

        {/* 4. Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Cookie Usage
          </h2>
          <p>
            Our website uses only <strong className="text-foreground">essential</strong>{" "}
            cookies required for authentication and site functionality. Specifically:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Supabase auth session cookies:</strong>{" "}
              These maintain your authenticated session so you stay logged in. They
              are strictly necessary and cannot be disabled if you wish to use account
              features.
            </li>
          </ul>
          <p>
            We do <strong className="text-foreground">not</strong> use:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Analytics cookies (no Google Analytics, no Adobe Analytics, etc.)</li>
            <li>Tracking cookies or pixels (no Meta Pixel, no LinkedIn Insight)</li>
            <li>Advertising cookies (no Google Ads, no Meta Ads cookies)</li>
            <li>Third-party embedded content cookies (no YouTube, no embedded iframes)</li>
          </ul>
          <p>
            For more details, please see our{" "}
            <Link
              href="/cookies"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* 5. Data Retention */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Data Retention
          </h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the
            purposes outlined in this policy and to comply with our legal obligations:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Account data:</strong> Retained for
              the duration of your active account. You may request deletion at any
              time (see Section 7).
            </li>
            <li>
              <strong className="text-foreground">Order records:</strong> Retained for
              a minimum of <strong className="text-foreground">five (5) years</strong>{" "}
              to comply with Philippine Bureau of Internal Revenue (BIR)
              record-keeping requirements.
            </li>
            <li>
              <strong className="text-foreground">Customer support records:</strong>{" "}
              Retained for up to <strong className="text-foreground">two (2) years</strong>{" "}
              after resolution.
            </li>
            <li>
              <strong className="text-foreground">Marketing consent records:</strong>{" "}
              Retained until you withdraw consent, after which your data is removed
              from marketing lists.
            </li>
          </ul>
        </section>

        {/* 6. Third-Party Processors */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. Third-Party Data Processors
          </h2>
          <p>
            We engage the following third-party service providers to operate our
            website. Each acts as a data processor under our instructions, and we have
            taken steps to ensure they provide adequate safeguards for your personal
            data:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Supabase:</strong> Provides our
              authentication and database infrastructure. Supabase stores
              authentication session tokens and user account data. Supabase employs
              encryption in transit (TLS) and at rest, and supports Row-Level Security
              (RLS) policies that we configure to restrict data access. See{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                Supabase&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Vercel:</strong> Hosts our web
              application and serves pages to your browser. Vercel processes minimal
              personal data (such as IP addresses) as part of content delivery. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                Vercel&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p>
            We do not transfer your personal data to any entity outside of these
            processors for the purposes described in this policy. Both Supabase and
              Vercel may store data in cloud infrastructure located outside the
              Philippines; we rely on the safeguards described in their respective
              privacy policies and the contractual terms in place.
          </p>
        </section>

        {/* 7. Your Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Your Rights Under the Data Privacy Act
          </h2>
          <p>
            Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the
            following rights regarding your personal data:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Right to be informed:</strong> You
              have the right to be informed whether personal information about you is
              being processed, and this policy serves that purpose.
            </li>
            <li>
              <strong className="text-foreground">Right to access:</strong> You may
              request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-foreground">
                Right to object / rectification:
              </strong>{" "}
              You may request correction of any inaccurate or incomplete personal data.
            </li>
            <li>
              <strong className="text-foreground">
                Right to erasure or blocking:
              </strong>{" "}
              You may request the deletion or blocking of your personal data, subject
              to legal retention obligations (e.g., BIR-mandated order records).
            </li>
            <li>
              <strong className="text-foreground">
                Right to data portability:
              </strong>{" "}
              You may request that your personal data be provided in a structured,
              commonly used, and machine-readable format, where technically feasible.
            </li>
            <li>
              <strong className="text-foreground">
                Right to damages:
              </strong>{" "}
              You may be entitled to indemnification if you suffer damages due to
              inaccurate, incomplete, or unlawfully disclosed personal data.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:info@rescue8ph.com"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              info@rescue8ph.com
            </a>
            . We will respond to your request within thirty (30) days, as required by
            the National Privacy Commission&apos;s rules.
          </p>
        </section>

        {/* 8. Security Measures */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. Security Measures
          </h2>
          <p>
            We implement industry-standard technical and organizational measures to
            protect your personal data:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Row-Level Security (RLS):</strong>{" "}
              Our Supabase database is configured with RLS policies that enforce
              access controls at the database level, ensuring users can only access
              their own data.
            </li>
            <li>
              <strong className="text-foreground">Encryption:</strong> All data in
              transit is encrypted using TLS/HTTPS. Data at rest in Supabase is
              encrypted by the provider.
            </li>
            <li>
              <strong className="text-foreground">Secure authentication:</strong>{" "}
              User passwords are stored as cryptographic hashes by Supabase Auth. We
              never store or transmit passwords in plaintext.
            </li>
            <li>
              <strong className="text-foreground">Access controls:</strong> Internal
              access to user data is restricted to authorized personnel only, on a
              least-privilege basis.
            </li>
            <li>
              <strong className="text-foreground">
                No third-party tracking scripts:
              </strong>{" "}
              Our site does not load Google Analytics, Meta Pixel, or any third-party
              tracking scripts, reducing the surface area for data leakage.
            </li>
          </ul>
          <p>
            Despite these measures, no system can be guaranteed 100% secure. If a data
            breach occurs that is likely to result in a risk to your rights and
            freedoms, we will notify you and the National Privacy Commission in
            accordance with RA 10173.
          </p>
        </section>

        {/* 9. Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            9. Children&apos;s Privacy
          </h2>
          <p>
            Our services are intended for businesses, institutions, and individual
            professionals. We do not knowingly collect personal data from children
            under the age of eighteen (18). If you believe we have inadvertently
            collected data from a minor, please contact us at{" "}
            <a
              href="mailto:info@rescue8ph.com"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              info@rescue8ph.com
            </a>{" "}
            and we will promptly delete it.
          </p>
        </section>

        {/* 10. Changes to This Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in
            our practices, legal requirements, or operational needs. The
            &ldquo;Last updated&rdquo; date at the top of this page indicates when the
            policy was last revised. We encourage you to review this page periodically.
          </p>
        </section>

        {/* 11. Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            11. Contact Us
          </h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy
            Policy or your personal data, please contact us:
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
            <li>
              <strong className="text-foreground">Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/rescue8tradingphils"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                /rescue8tradingphils
              </a>
            </li>
          </ul>
          <p>
            You may also file a complaint with the{" "}
            <a
              href="https://privacy.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              National Privacy Commission (NPC)
            </a>{" "}
            if you believe your data privacy rights have been violated.
          </p>
        </section>
      </div>
    </div>
  );
}