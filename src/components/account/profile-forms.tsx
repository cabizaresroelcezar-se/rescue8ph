"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Save, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ============================================================================
// Profile info form — wraps the server action with toast + loading state
// ============================================================================
export function ProfileFormWrapper({
  updateAction,
  initialFirstName,
  initialLastName,
  initialPhone,
}: {
  updateAction: (formData: FormData) => Promise<void>;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setBusy(true);
    toast({ title: "Saving profile...", variant: "loading" });
    try {
      await updateAction(formData);
      // The server action redirects, so this may not execute.
      // But if it does (e.g. the redirect is caught), show success.
      toast({ title: "Profile saved", description: "Your changes have been saved.", variant: "success" });
      router.refresh();
    } catch (err) {
      // Redirects throw in server actions — check if it's a redirect
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // This is expected — the server action redirects on success
        return;
      }
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save profile.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={initialFirstName} placeholder="Juan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={initialLastName} placeholder="Dela Cruz" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={initialPhone} placeholder="+63 9XX XXX XXXX" />
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          Used for delivery updates and order coordination.
        </p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
        <ButtonLink href="/account" variant="outline">Cancel</ButtonLink>
      </div>
    </form>
  );
}

// ============================================================================
// Delete avatar — confirm dialog + toast
// ============================================================================
export function DeleteAvatarButton({
  deleteAction,
}: {
  deleteAction: () => Promise<void>;
}) {
  const { toast } = useToast();
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={<><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove photo</>}
      triggerClassName="inline-flex h-8 items-center px-2 text-xs text-muted-foreground hover:text-destructive"
      title="Remove profile photo?"
      description="Your current photo will be deleted. You can upload a new one anytime."
      confirmLabel="Remove"
      onConfirm={async () => {
        await deleteAction();
      }}
      onSuccess={() => {
        toast({ title: "Photo removed", description: "Your profile photo has been deleted.", variant: "success" });
        router.refresh();
      }}
    />
  );
}

// ============================================================================
// Email change form — toast feedback
// ============================================================================
export function EmailChangeWrapper({
  requestAction,
}: {
  requestAction: (formData: FormData) => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setBusy(true);
    toast({ title: "Sending confirmation...", variant: "loading" });
    try {
      await requestAction(formData);
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      toast({
        title: "Request failed",
        description: err instanceof Error ? err.message : "Could not request email change.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-2">
      <Label htmlFor="newEmail">New email</Label>
      <div className="flex gap-2">
        <Input id="newEmail" name="newEmail" type="email" placeholder="newemail@example.com" required />
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request change"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        We&apos;ll send a confirmation link to both your current and new email.
        Your address only changes after you click both.
      </p>
    </form>
  );
}