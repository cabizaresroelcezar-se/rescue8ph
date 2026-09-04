import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "FAQ",
  description: "Frequently asked questions about Rescue 8 Philippines products, delivery, bulk orders, and training.",
  path: "/faq",
});

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("question, answer")
    .eq("is_enabled", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
      <p className="mt-2 text-muted-foreground">
        Common questions about our products and services
      </p>

      <div className="mt-10 space-y-6">
        {(faqs || []).map((faq, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">{faq.question}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
        {!faqs || faqs.length === 0 ? (
          <p className="text-muted-foreground">No FAQs available at this time.</p>
        ) : null}
      </div>

      <div className="mt-12 rounded-lg bg-primary p-8 text-center text-white">
        <h2 className="text-xl font-bold">Still have questions?</h2>
        <p className="mt-2 text-white/80">We&apos;re here to help. Contact our team for assistance.</p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}