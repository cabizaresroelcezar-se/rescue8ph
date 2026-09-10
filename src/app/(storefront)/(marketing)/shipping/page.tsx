import Link from "next/link";

export const metadata = {
  title: "Shipping Policy",
  description:
    "Shipping policy for Rescue 8 Trading Philippines, Inc. — customer-arranged courier, nationwide coverage, and delivery timelines for EMS and rescue equipment.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Shipping Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <p>
          This Shipping Policy describes how Rescue 8 Trading Philippines, Inc.
          handles the delivery of orders placed through rescue8ph.com. We offer
          nationwide shipping within the Philippines using customer-arranged or
          admin-coordinated courier services.
        </p>

        {/* 1. Shipping Methods */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Shipping Methods
          </h2>
          <p>
            We use a flexible, customer-driven shipping model. After your order is
            confirmed, you may choose from the following options:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">
                Customer-arranged courier:
              </strong>{" "}
              You arrange your own courier to pick up the order from our warehouse in
              Quezon City. Commonly used couriers include:
              <ul className="list-disc space-y-1 pl-6 pt-1">
                <li>Lalamove</li>
                <li>Grab Express</li>
                <li>J&amp;T Express</li>
                <li>LBC Express</li>
                <li>JRS Express</li>
                <li>Ninja Van</li>
                <li>Other local couriers of your choice</li>
              </ul>
            </li>
            <li>
              <strong className="text-foreground">Admin-coordinated shipping:</strong>{" "}
              If you prefer, our admin can coordinate with a courier on your behalf
              after order confirmation. The shipping fee will be communicated to you
              before dispatch.
            </li>
          </ul>
        </section>

        {/* 2. Shipping Fee Determination */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Shipping Fee Determination
          </h2>
          <p>
            Shipping fees are <strong className="text-foreground">not fixed</strong>{" "}
            at checkout. Instead:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              After your order is confirmed, our admin calculates the shipping fee
              based on the destination, package weight and dimensions, and the chosen
              courier&apos;s current rates.
            </li>
            <li>
              The shipping fee is communicated to you for approval before the order is
              dispatched.
            </li>
            <li>
              For customer-arranged couriers (e.g., Lalamove, Grab), you pay the
              courier directly. No shipping fee is added to your order total.
            </li>
            <li>
              For admin-coordinated shipping, the shipping fee is added to your order
              and must be settled before or upon dispatch, depending on the agreed
              payment method.
            </li>
          </ul>
        </section>

        {/* 3. Delivery Timeline */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Delivery Timeline
          </h2>
          <p>
            Delivery times depend on the courier selected, the destination, and
            current logistics conditions. The following are estimated timelines:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Metro Manila (same-day):</strong>{" "}
              Lalamove and Grab Express can deliver within the same day, typically
              2&ndash;6 hours after pickup.
            </li>
            <li>
              <strong className="text-foreground">
                Metro Manila (next-day):
              </strong>{" "}
              LBC, J&amp;T, and similar couriers typically deliver next-day within
              Metro Manila.
            </li>
            <li>
              <strong className="text-foreground">Provincial (2&ndash;5 days):</strong>{" "}
              Delivery to provincial destinations typically takes 2&ndash;5 business
              days via standard courier services.
            </li>
            <li>
              <strong className="text-foreground">Remote areas (5&ndash;10 days):</strong>{" "}
              Delivery to remote or island provinces may take 5&ndash;10 business days
              or longer, depending on courier schedules and weather conditions.
            </li>
          </ul>
          <p>
            These are estimates only. We are not liable for delays caused by the
            courier, weather, natural disasters, or other circumstances beyond our
            control.
          </p>
        </section>

        {/* 4. Nationwide Coverage */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Nationwide Coverage
          </h2>
          <p>
            We ship to all provinces, cities, and municipalities in the Philippines
            that are serviced by available couriers. If your location is not covered
            by standard courier routes, we will work with you to find an alternative
            delivery arrangement.
          </p>
        </section>

        {/* 5. Tracking Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Tracking Information
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">
                Customer-arranged courier:
              </strong>{" "}
              Tracking is managed directly through the courier&apos;s app or website
              (e.g., Lalamove app, Grab app, J&amp;T tracking portal).
            </li>
            <li>
              <strong className="text-foreground">
                Admin-coordinated shipping:
              </strong>{" "}
              We will provide you with the courier name and tracking number once the
              order has been dispatched. You can track your package through the
              courier&apos;s tracking system.
            </li>
            <li>
              You may also contact us at{" "}
              <a
                href="mailto:info@rescue8ph.com"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                info@rescue8ph.com
              </a>{" "}
              for assistance with tracking your order.
            </li>
          </ul>
        </section>

        {/* 6. International Shipping */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. International Shipping
          </h2>
          <p>
            We do <strong className="text-foreground">not</strong> currently offer
            international shipping. All orders are delivered within the Philippines
            only. International shipping options may be considered in the future; any
            updates will be posted on this page.
          </p>
        </section>

        {/* 7. Order Pickup */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. In-Store / Warehouse Pickup
          </h2>
          <p>
            You may also choose to pick up your order directly from our warehouse in
            Quezon City. Please coordinate the pickup date and time with us in
            advance. Our office hours are:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Monday&ndash;Friday: 08:00&ndash;20:00</li>
            <li>Saturday: 08:00&ndash;17:00</li>
            <li>Sunday: Closed</li>
          </ul>
        </section>

        {/* 8. Shipping Issues */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. Lost or Damaged Shipments
          </h2>
          <p>
            If your order arrives damaged, please refer to our{" "}
            <Link
              href="/returns"
              className="font-medium text-foreground underline hover:text-foreground/80"
            >
              Refund Policy
            </Link>{" "}
            for return and exchange instructions. If your order is lost in transit,
            contact us immediately and we will coordinate with the courier to locate
            the package or arrange a replacement or refund.
          </p>
        </section>

        {/* 9. Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            9. Contact Us
          </h2>
          <p>
            For any questions about shipping, please contact us:
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

        {/* 10. Changes to This Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to This Policy
          </h2>
          <p>
            We reserve the right to update this Shipping Policy at any time. Changes
            will be posted on this page with an updated &ldquo;Last updated&rdquo;
            date.
          </p>
        </section>
      </div>
    </div>
  );
}