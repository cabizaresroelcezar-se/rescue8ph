export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Rescue 8 Philippines website and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <div className="mt-8 space-y-4 text-sm text-muted-foreground">
        <p>
          By using the Rescue 8 Philippines website and services, you agree to
          these terms and conditions.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Products</h2>
        <p>
          We strive to display accurate product information and pricing. However,
          availability and prices may change without notice. All orders are
          subject to confirmation.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Orders</h2>
        <p>
          Orders are processed during business hours. For bulk and institutional
          purchases, pricing and terms may be negotiated separately. Payment
          methods and delivery options will be communicated at the time of order.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Liability</h2>
        <p>
          Rescue 8 Trading Philippines, Inc. is not liable for indirect or
          consequential damages arising from the use of our products. Product
          warranties are provided by the respective manufacturers.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Governing Law</h2>
        <p>
          These terms are governed by the laws of the Republic of the Philippines.
        </p>
      </div>
    </div>
  );
}