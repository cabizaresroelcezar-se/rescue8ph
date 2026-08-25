export const metadata = {
  title: "Privacy Policy",
  description: "Rescue 8 Philippines privacy policy — how we collect, use, and protect your personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="mt-8 space-y-4 text-sm text-muted-foreground">
        <p>
          Rescue 8 Trading Philippines, Inc. respects your privacy and is committed
          to protecting your personal data. This policy explains how we collect,
          use, and safeguard your information.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, placing
          orders, or contacting us. This includes your name, email, phone number,
          and delivery address.
        </p>
        <h2 className="text-lg font-semibold text-foreground">How We Use Your Information</h2>
        <p>
          Your information is used to process orders, deliver products, provide
          customer support, and communicate about your account. We do not sell
          your personal data to third parties.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data, including encryption, secure authentication,
          and access controls.
        </p>
        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>
          For privacy concerns, please contact us through our Facebook page or
          at our office in Quezon City.
        </p>
      </div>
    </div>
  );
}