"use client";

import { useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

/**
 * Avatar upload input — auto-submits when a file is selected.
 * Shows toast notifications on success/error.
 */
export function AvatarUploadInput({
  uploadAction,
  hasAvatar,
}: {
  uploadAction: (formData: FormData) => Promise<void>;
  hasAvatar: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    toast({ title: "Uploading photo...", variant: "loading" });
    startTransition(async () => {
      try {
        await uploadAction(formData);
        toast({ title: "Photo updated", description: "Your profile photo has been updated successfully.", variant: "success" });
        router.refresh();
      } catch (err) {
        toast({
          title: "Upload failed",
          description: err instanceof Error ? err.message : "Could not upload photo. Please try again.",
          variant: "error",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="avatar-upload"
        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            {hasAvatar ? "Replace photo" : "Upload photo"}
          </>
        )}
      </label>
      <input
        ref={inputRef}
        id="avatar-upload"
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={isPending}
        onChange={handleChange}
      />
    </div>
  );
}