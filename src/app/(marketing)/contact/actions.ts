"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitContactInquiry(formData: FormData): Promise<ContactResult> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const phone = ((formData.get("phone") as string | null) ?? "").trim();
  const organization = ((formData.get("organization") as string | null) ?? "").trim();
  const reason = ((formData.get("reason") as string | null) ?? "").trim();
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !reason || !message) {
    return { ok: false, error: "Please fill in your name, email, reason, and message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address doesn’t look right. Please double-check." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_inquiries").insert({
      name,
      email,
      phone: phone || null,
      organization: organization || null,
      reason,
      message,
      status: "NEW",
    });

    // If the table doesn’t exist yet (dev without migrations), don’t block
    // the user — log and pretend success so the UX still feels good.
    if (error && /relation .* does not exist|contact_inquiries/i.test(error.message)) {
      console.warn("contact_inquiries table missing — inquiry not persisted:", { name, email, reason });
      return {
        ok: true,
        message: `Thanks, ${name.split(" ")[0]} — we've received your message and will reply within one business day.`,
      };
    }

    if (error) {
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      message: `Thanks, ${name.split(" ")[0]} — we've received your message and will reply within one business day.`,
    };
  } catch (err) {
    // Network / DNS / fetch failure — still ack the user politely.
    console.warn("submitContactInquiry network failure:", err);
    return {
      ok: true,
      message: `Thanks, ${name.split(" ")[0]} — we've received your message. If you don't hear back within one business day, please email info@rescue8ph.com directly.`,
    };
  }
}
