export const metadata = {
  title: "Refund Policy",
  description:
    "Refund and return policy for Rescue 8 Trading Philippines, Inc. — eligibility, process, and timelines for returns of EMS and rescue equipment.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <p>
          At Rescue 8 Trading Philippines, Inc., we want you to be satisfied with your
          purchase. This Refund Policy outlines the conditions under which you may
          return products and receive a refund or exchange. This policy applies to
          purchases made through rescue8ph.com and is consistent with the Consumer Act
          of the Philippines (Republic Act No. 7394).
        </p>

        {/* 1. Eligibility for Returns */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Eligibility for Returns
          </h2>
          <p>
            You may request a return if the following conditions are met:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              The item is <strong className="text-foreground">damaged</strong> or{" "}
              <strong className="text-foreground">defective</strong> upon receipt.
            </li>
            <li>
              The wrong item was delivered, or the item does not match the product
              description on our website.
            </li>
            <li>
              The return request is made within{" "}
              <strong className="text-foreground">seven (7) days</strong> of
              receiving the item.
            </li>
            <li>
              The item is in its original packaging, with all accessories,
              documentation, and tags intact, and shows no signs of use beyond
              reasonable inspection.
            </li>
          </ul>
          <p>
            Please inspect your order upon delivery. If the packaging appears damaged,
            indicate this on the courier&apos;s delivery receipt before accepting the
            package, and contact us immediately.
          </p>
        </section>

        {/* 2. Non-Returnable Items */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Non-Returnable Items
          </h2>
          <p>
            For health, safety, and customization reasons, the following items are{" "}
            <strong className="text-foreground">not eligible</strong> for return or
            refund:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Consumables:</strong> First-aid
              supplies, bandages, adhesives, medical consumables, and similar items
              that are single-use or have expiration dates, once opened.
            </li>
            <li>
              <strong className="text-foreground">Customized orders:</strong> Items
              that were specially ordered, engraved, modified, or manufactured to your
              specifications.
            </li>
            <li>
              <strong className="text-foreground">Training materials:</strong> Books,
              manuals, or digital materials that have been opened or accessed.
            </li>
            <li>
              <strong className="text-foreground">Items damaged by misuse:</strong>{" "}
              Products damaged due to improper use, unauthorized modification, or
              negligence, as determined by our inspection or the manufacturer&apos;s
              assessment.
            </li>
          </ul>
        </section>

        {/* 3. Refund Process and Timeline */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Refund Process and Timeline
          </h2>
          <p>To initiate a return, follow these steps:</p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>
              <strong className="text-foreground">Contact us:</strong> Email{" "}
              <a
                href="mailto:info@rescue8ph.com"
                className="font-medium text-foreground underline hover:text-foreground/80"
              >
                info@rescue8ph.com
              </a>{" "}
              within seven (7) days of receiving the item. Include your order number, a
              description of the issue, and photos of the damage or defect.
            </li>
            <li>
              <strong className="text-foreground">Approval:</strong> We will review
              your request and respond within two (2) business days with return
              instructions, including the return shipping address.
            </li>
            <li>
              <strong className="text-foreground">Ship the item:</strong> Pack the
              item securely in its original packaging and send it to the address
              provided. Include a copy of your order confirmation or return
              authorization email.
            </li>
            <li>
              <strong className="text-foreground">Inspection:</strong> Upon receiving
              the returned item, we will inspect it within three (3) business days to
              verify the damage or defect.
            </li>
            <li>
              <strong className="text-foreground">Refund issued:</strong> If the
              return is approved, we will process your refund within five (5) business
              days. Refunds for bank transfer payments will be returned to the
              original bank account. For COD payments, we will arrange a bank transfer
              or cash refund at our discretion.
            </li>
          </ol>
          <p>
            The total time to receive your refund depends on your payment method and
            bank processing times, typically five (5) to ten (10) business days after
            approval.
          </p>
        </section>

        {/* 4. Exchange Options */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Exchange Options
          </h2>
          <p>
            If you prefer, you may request an exchange instead of a refund for
            eligible items. Exchanges are subject to product availability. If the
            replacement item is of a different price:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              If the replacement is more expensive, you will pay the difference.
            </li>
            <li>
              If the replacement is less expensive, we will refund the difference.
            </li>
          </ul>
          <p>
            Exchanges follow the same process as returns (Section 3). Please specify
            your preference for exchange when contacting us.
          </p>
        </section>

        {/* 5. Return Shipping Costs */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Return Shipping Costs
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-foreground">
                Damaged or defective items (our error):
              </strong>{" "}
              We will cover the return shipping cost. We may arrange a courier pickup
              at our expense, or reimburse you for documented return shipping costs.
            </li>
            <li>
              <strong className="text-foreground">Change of mind:</strong> We do not
              accept returns for change of mind. Please review product descriptions
              carefully before ordering.
            </li>
            <li>
              <strong className="text-foreground">
                Items returned without authorization:
              </strong>{" "}
              We are not responsible for items sent without prior approval. Please
              wait for our return authorization before shipping any item.
            </li>
          </ul>
        </section>

        {/* 6. Contact for Return Requests */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. Contact for Return Requests
          </h2>
          <p>
            For all return, refund, or exchange requests, please contact us:
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
          <p>
            When contacting us, please have your order number ready to help us process
            your request efficiently.
          </p>
        </section>

        {/* 7. Changes to This Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Changes to This Policy
          </h2>
          <p>
            We reserve the right to update this Refund Policy at any time. Changes will
            be posted on this page with an updated &ldquo;Last updated&rdquo; date.
          </p>
        </section>
      </div>
    </div>
  );
}