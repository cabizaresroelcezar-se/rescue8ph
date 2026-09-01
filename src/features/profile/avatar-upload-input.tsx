"use client";

import { useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";

/**
 * Avatar upload input — auto-submits when a file is selected so the user
 * doesn't need a separate "Upload" click. Shows a brief loading state during
 * the server action.
 *
 * Server action is passed in as a prop so this component stays a pure
 * client component (the action signature is preserved through serialization).
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    startTransition(async () => {
      await uploadAction(formData);
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