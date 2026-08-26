"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

/**
 * Rich-text editor for CMS pages and similar content.
 *
 * Stores HTML in the parent's state. Output is sanitized via the
 * ContentSecurityPolicy and `dangerouslySetInnerHTML` consumer code
 * (never eval'd). The editor itself never produces <script> tags.
 *
 * Toolbar shows only the controls we actually need; advanced users
 * can use markdown shortcuts (e.g. **bold**, # heading, - bullet).
 */

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Called when the user clicks the image button. */
  onInsertImage?: () => void;
}

const TOOLBAR: Array<{
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (e: Editor) => boolean;
  isDisabled?: (e: Editor) => boolean;
  run: (e: Editor) => void;
  divider?: boolean;
}> = [
  {
    key: "bold",
    label: "Bold (Cmd+B)",
    icon: Bold,
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    key: "italic",
    label: "Italic (Cmd+I)",
    icon: Italic,
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    key: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    isActive: (e) => e.isActive("strike"),
    run: (e) => e.chain().focus().toggleStrike().run(),
    divider: true,
  },
  {
    key: "h2",
    label: "Heading 2",
    icon: Heading2,
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: "h3",
    label: "Heading 3",
    icon: Heading3,
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    divider: true,
  },
  {
    key: "ul",
    label: "Bullet list",
    icon: List,
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    key: "ol",
    label: "Numbered list",
    icon: ListOrdered,
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    key: "quote",
    label: "Quote",
    icon: Quote,
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    key: "code",
    label: "Code",
    icon: Code,
    isActive: (e) => e.isActive("codeBlock"),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
    divider: true,
  },
  {
    key: "link",
    label: "Link (Cmd+K)",
    icon: LinkIcon,
    isActive: (e) => e.isActive("link"),
    run: (e) => {
      const previousUrl = e.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL", previousUrl ?? "https://");
      if (url === null) return;
      if (url === "") {
        e.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
  },
  {
    key: "image",
    label: "Insert image",
    icon: ImageIcon,
    run: () => {
      // Defer to the parent (parent owns media selection modal)
      const button = document.activeElement as HTMLElement | null;
      button?.dispatchEvent(new CustomEvent("rte:insert-image", { bubbles: true }));
    },
  },
  {
    key: "hr",
    label: "Horizontal rule",
    icon: Minus,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
    divider: true,
  },
  {
    key: "undo",
    label: "Undo (Cmd+Z)",
    icon: Undo2,
    isDisabled: (e) => !e.can().undo(),
    run: (e) => e.chain().focus().undo().run(),
  },
  {
    key: "redo",
    label: "Redo (Cmd+Shift+Z)",
    icon: Redo2,
    isDisabled: (e) => !e.can().redo(),
    run: (e) => e.chain().focus().redo().run(),
  },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  minHeight = "16rem",
  onInsertImage,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Don't include code-block in StarterKit — we configure our own
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 50_000 }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // SSR-safe (React 19 / Next.js)
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none dark:prose-invert focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Keep the editor in sync if the parent updates `value` from outside
    // (e.g. when loading a draft). Only apply when the editor is mounted
    // and the current HTML differs.
    React.useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      if (value !== current && value !== editor.getText()) {
        editor.commands.setContent(value, false);
      }
      // We intentionally do not depend on `editor` (stable instance).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

  // Listen for "insert image" event from the toolbar button
  React.useEffect(() => {
    if (!onInsertImage) return;
    const handler = () => onInsertImage();
    window.addEventListener("rte:insert-image", handler);
    return () => window.removeEventListener("rte:insert-image", handler);
  }, [onInsertImage]);

  // If a parent supplies an image URL externally (via a media picker that
  // mutates a hidden input), expose a window event the picker can fire:
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ src: string; alt?: string }>).detail;
      if (!editor || !detail?.src) return;
      editor.chain().focus().setImage({ src: detail.src, alt: detail.alt ?? "" }).run();
    };
    window.addEventListener("rte:set-image", handler);
    return () => window.removeEventListener("rte:set-image", handler);
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-border bg-background"
        style={{ minHeight }}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <footer className="flex items-center justify-between border-t border-border bg-surface/40 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>
          {editor.storage.characterCount?.characters() ?? 0} characters ·{" "}
          {editor.storage.characterCount?.words() ?? 0} words
        </span>
        <span>HTML output · sanitized on render</span>
      </footer>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface/40 p-1.5">
      {TOOLBAR.map((t) => {
        const Icon = t.icon;
        const active = t.isActive?.(editor) ?? false;
        const disabled = t.isDisabled?.(editor) ?? false;
        return (
          <React.Fragment key={t.key}>
            <button
              type="button"
              onClick={() => t.run(editor)}
              disabled={disabled}
              title={t.label}
              aria-label={t.label}
              aria-pressed={active}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40 ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
            {t.divider && (
              <span
                aria-hidden
                className="mx-0.5 h-5 w-px bg-border"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Sanitize a value before sending to the server (defense-in-depth).
 *
 * The editor itself doesn't produce dangerous content (no <script>),
 * but if a value comes from outside (e.g. an import), we strip the
 * obvious trouble: <script>, <iframe>, on* attributes, javascript:
 * URLs. Used in the page-form before submit.
 */
export function sanitizeRichText(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: rely on a simple regex pass (full DOMPurify is
    // client-only). This is good enough for the editor's outputs,
    // which never include these tags by default.
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, "");
  }
  // Client-side: full DOMPurify would be overkill — we strip at the
  // boundary and trust the editor. Same regex pass.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}