import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Rescue 8 Philippines website and purchasing EMS and rescue equipment from Rescue 8 Trading Philippines, Inc.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
          rescue8ph.com website and the services provided by Rescue 8 Trading
          Philippines, Inc. (&ldquo;Rescue 8 Philippines,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using our website,
          you agree to be bound by these Terms. If you do not agree, please do not use
          our website or services.
        </p>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account, browsing our products, or placing an order on
            rescue8ph.com, you acknowledge that you have read, understood, and agree
            to these Terms and our{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              Privacy Policy
            </Link>
            . These Terms constitute a legally binding agreement between you and
            Rescue 8 Trading Philippines, Inc.
          </p>
          <p>
            If you are using our services on behalf of an organization (such as a
            local government unit, hospital, school, or company), you represent and
            warrant that you have the authority to bind that organization to these
            Terms.
          </p>
        </section>

        {/* 2. Account Registration */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Account Registration and Responsibilities
          </h2>
          <p>
            To place orders and access certain features, you must create an account.
            When registering, you agree to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Provide accurate, current, and complete information about yourself or
              your organization.
            </li>
            <li>
              Maintain the confidentiality of your account credentials and accept
              responsibility for all activities under your account.
            </li>
            <li>
              Notify us immediately of any unauthorized use of your account or any
              other security breach.
            </li>
            <li>
              Be at least eighteen (18) years of age or have legal authority to enter
              into contracts under Philippine law.
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these
            Terms or are suspected of fraudulent activity.
          </p>
        </section>

        {/* 3. Product Information and Pricing */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Product Information and Pricing
          </h2>
          <p>
            We strive to display accurate product descriptions, images, and pricing on
            our website. However:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Product images are for illustrative purposes and may not exactly match
              the actual item. Colors, dimensions, and specifications may vary.
            </li>
            <li>
              Prices are listed in Philippine Pesos (PHP) and are subject to change
              without prior notice. The price at the time of order confirmation is the
              binding price.
            </li>
            <li>
              Availability of products is subject to stock levels. We reserve the
              right to limit quantities or refuse orders.
            </li>
            <li>
              For bulk and institutional purchases (LGUs, hospitals, schools, private
              companies), pricing and terms may be negotiated separately.
            </li>
          </ul>
        </section>

        {/* 4. Order Process and Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Order Process and Acceptance
          </h2>
          <p>
            Placing an order on our website constitutes an offer to purchase. Our
            acceptance of your order occurs only when we send an order confirmation,
            either through the website or via email/phone. Until that point, we are
            not obligated to fulfill the order.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Orders are processed during business hours (Monday&ndash;Friday
              08:00&ndash;20:00, Saturday 08:00&ndash;17:00, Philippine Time).
            </li>
            <li>
              We reserve the right to decline or cancel any order for any reason,
              including pricing errors, stock unavailability, or suspected fraud.
            </li>
            <li>
              If we cancel an order after payment has been made, we will issue a full
              refund or offer an exchange, at your preference.
            </li>
          </ul>
        </section>

        {/* 5. Payment Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Payment Terms
          </h2>
          <p>
            We currently accept the following payment methods:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Cash on Delivery (COD):</strong>{" "}
              Payment is made in cash to the courier upon receipt of your order. Exact
              payment is appreciated.
            </li>
            <li>
              <strong className="text-foreground">Bank Transfer:</strong> You may
              transfer payment to our designated bank account. Order processing begins
              after we confirm receipt of payment.
            </li>
          </ul>
          <p>
            We do not currently offer online payment via credit card, e-wallet, or
            payment gateway. Online payment options may be added in the future, at
            which point these Terms will be updated.
          </p>
          <p>
            For institutional and bulk orders, payment terms (including deposits,
              installments, or net-terms) may be negotiated and documented in a
              separate agreement.
          </p>
        </section>

        {/* 6. Shipping and Delivery */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. Shipping and Delivery
          </h2>
          <p>
            Shipping is arranged as described in our{" "}
            <Link
              href="/shipping"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              Shipping Policy
            </Link>
            . In summary:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Customers may arrange their own courier (Lalamove, Grab, J&amp;T, LBC,
              etc.) for delivery, or we can coordinate on your behalf.
            </li>
            <li>
              Shipping fees are determined and set by our admin after order
              confirmation, based on destination, weight, and courier rates.
            </li>
            <li>
              Delivery timelines depend on the chosen courier and destination. We are
              not liable for delays caused by the courier.
            </li>
            <li>
              We offer nationwide coverage within the Philippines. International
              shipping is not currently available.
            </li>
          </ul>
        </section>

        {/* 7. Returns and Refunds */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Returns and Refunds
          </h2>
          <p>
            Our return and refund policy is described in detail on our{" "}
            <Link
              href="/returns"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              Refund Policy
            </Link>{" "}
            page. Key points:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Damaged or defective items may be returned within seven (7) days of
              receipt.
            </li>
            <li>
              Certain items, such as consumables and customized orders, are
              non-returnable.
            </li>
            <li>
              Refunds are processed after we receive and inspect the returned item.
            </li>
          </ul>
        </section>

        {/* 8. Product Warranties */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. Product Warranties
          </h2>
          <p>
            Product warranties, if any, are provided by the respective manufacturers
            or suppliers, not by Rescue 8 Trading Philippines, Inc. We will assist you
            in coordinating warranty claims with the manufacturer where possible, but
            we do not directly warrant the products we sell.
          </p>
          <p>
            Warranty terms vary by product and manufacturer. Please refer to the
            warranty documentation included with your purchase or contact us for
            manufacturer warranty details.
          </p>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            9. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by Philippine law, Rescue 8 Trading
            Philippines, Inc. shall not be liable for:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Any indirect, incidental, special, consequential, or punitive damages
              arising from the use of our products or services.
            </li>
            <li>
              Any loss of profits, revenue, data, or business opportunity resulting
              from your use of our website or products.
            </li>
            <li>
              Any damage or injury resulting from improper use, modification, or
              misuse of products purchased from us.
            </li>
            <li>
              Delays or failures caused by couriers, payment providers, or other
              third-party services outside our control.
            </li>
          </ul>
          <p>
            Our total liability for any claim arising from these Terms or your use of
            our services shall not exceed the amount you paid for the specific product
            or order that is the subject of the claim.
          </p>
          <p>
            EMS and rescue equipment must be used by trained professionals in
            accordance with manufacturer instructions. We are not liable for injuries
            or damages resulting from use of equipment by untrained individuals.
          </p>
        </section>

        {/* 10. Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            10. Intellectual Property
          </h2>
          <p>
            All content on rescue8ph.com, including the logo, text, graphics, product
            descriptions, photographs, and website design, is the intellectual
            property of Rescue 8 Trading Philippines, Inc. or its licensors and is
            protected by Philippine intellectual property laws.
          </p>
          <p>You may not:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Reproduce, copy, or distribute our content without prior written consent.</li>
            <li>Use our trademarks, logos, or brand name without authorization.</li>
            <li>Modify, reverse-engineer, or create derivative works from our website.</li>
          </ul>
          <p>
            Product names, brands, and trademarks shown on our website are the
            property of their respective owners and are used for identification
            purposes only.
          </p>
        </section>

        {/* 11. Governing Law */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            11. Governing Law and Dispute Resolution
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of
            the Republic of the Philippines. Any dispute arising out of or relating to
            these Terms or your use of our services shall be:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              First, attempted to be resolved amicably through good-faith
              negotiations between the parties.
            </li>
            <li>
              If unresolved, submitted to the exclusive jurisdiction of the courts of
              Quezon City, Republic of the Philippines.
            </li>
          </ul>
        </section>

        {/* 12. Changes to Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            12. Changes to These Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be
            posted on this page with an updated &ldquo;Last updated&rdquo; date. Your
            continued use of our website after changes are posted constitutes
            acceptance of the revised Terms. We encourage you to review this page
            periodically.
          </p>
        </section>

        {/* 13. Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            13. Contact Information
          </h2>
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Company:</strong> Rescue 8 Trading
              Philippines, Inc. (DTI Registered since February 2012)
            </li>
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
            <li>
              <strong className="text-foreground">Instagram:</strong>{" "}
              <a
                href="https://www.instagram.com/rescue8trading.ph.inc"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                /rescue8trading.ph.inc
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}