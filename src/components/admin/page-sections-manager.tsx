"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Layers,
  ImageIcon,
  Type,
  HelpCircle,
  Mail,
  Sparkles,
  Star,
  Grid3X3,
  Megaphone,
  Package,
  Newspaper,
} from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import {
  createPageSection,
  deletePageSection,
  updatePageSection,
} from "@/features/cms/actions";
import { cn } from "@/lib/utils";

export interface PageSection {
  id: string;
  page_id: string;
  section_type:
    | "HERO"
    | "FEATURE_GRID"
    | "PRODUCT_GRID"
    | "IMAGE_TEXT"
    | "SERVICE_GRID"
    | "TESTIMONIALS"
    | "FAQ"
    | "BLOG_GRID"
    | "CTA"
    | "RICH_TEXT"
    | "BANNER";
  sort_order: number;
  is_enabled: boolean;
  content: Record<string, unknown>;
}

const SECTION_PRESETS: Array<{
  type: PageSection["section_type"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultContent: Record<string, unknown>;
}> = [
  {
    type: "HERO",
    label: "Hero banner",
    icon: Sparkles,
    description: "Large title + subtitle + CTA at the top.",
    defaultContent: {
      eyebrow: "",
      title: "",
      subtitle: "",
      cta_label: "",
      cta_href: "",
      align: "left",
    },
  },
  {
    type: "RICH_TEXT",
    label: "Rich text",
    icon: Type,
    description: "Markdown-formatted block of text.",
    defaultContent: { body: "## Heading\n\nWrite your content here." },
  },
  {
    type: "FEATURE_GRID",
    label: "Feature grid",
    icon: Grid3X3,
    description: "3–4 small feature cards with icons.",
    defaultContent: {
      eyebrow: "Why us",
      title: "",
      features: [
        { icon: "ShieldCheck", title: "", description: "" },
        { icon: "Truck", title: "", description: "" },
        { icon: "Award", title: "", description: "" },
      ],
    },
  },
  {
    type: "IMAGE_TEXT",
    label: "Image + text",
    icon: ImageIcon,
    description: "Side-by-side image and copy block.",
    defaultContent: {
      title: "",
      body: "",
      image_url: "",
      image_alt: "",
      cta_label: "",
      cta_href: "",
      flip: false,
    },
  },
  {
    type: "CTA",
    label: "Call to action",
    icon: Megaphone,
    description: "Conversion-focused CTA strip.",
    defaultContent: {
      title: "",
      body: "",
      cta_label: "",
      cta_href: "",
    },
  },
  {
    type: "FAQ",
    label: "FAQ list",
    icon: HelpCircle,
    description: "Reuse your existing FAQs by category.",
    defaultContent: {
      title: "Frequently asked questions",
      category: "",
      limit: 6,
    },
  },
  {
    type: "TESTIMONIALS",
    label: "Testimonials",
    icon: Star,
    description: "Customer quotes displayed in cards.",
    defaultContent: {
      title: "What customers say",
      items: [
        { quote: "", author: "", role: "" },
        { quote: "", author: "", role: "" },
      ],
    },
  },
  {
    type: "PRODUCT_GRID",
    label: "Product grid",
    icon: Package,
    description: "Showcase a curated set of products.",
    defaultContent: { title: "Top picks", limit: 6, sort: "featured" },
  },
  {
    type: "BLOG_GRID",
    label: "Blog grid",
    icon: Newspaper,
    description: "Surface recent blog posts.",
    defaultContent: { title: "From the blog", limit: 3 },
  },
  {
    type: "SERVICE_GRID",
    label: "Service grid",
    icon: Layers,
    description: "Highlight your service offerings.",
    defaultContent: {
      title: "What we offer",
      services: [{ icon: "", title: "", description: "" }],
    },
  },
  {
    type: "BANNER",
    label: "Banner",
    icon: Mail,
    description: "Full-width announcement strip.",
    defaultContent: { text: "", link_label: "", link_href: "" },
  },
];

export function PageSectionsManager({
  pageId,
  sections,
}: {
  pageId: string;
  sections: PageSection[];
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const { refresh } = useDelayedRefresh(500);

  const sorted = React.useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections],
  );

  async function handleAdd(type: PageSection["section_type"]) {
    const preset = SECTION_PRESETS.find((p) => p.type === type);
    if (!preset) return;
    setBusy(true);
    setError(null);
    const nextSort =
      sorted.length === 0
        ? 0
        : Math.max(...sorted.map((s) => s.sort_order)) + 10;
    const result = await createPageSection({
      page_id: pageId,
      section_type: type,
      sort_order: nextSort,
      content: preset.defaultContent,
    });
    setBusy(false);
    setShowAddMenu(false);
    if (result?.error) {
      setError(result.error);
    } else {
      refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    setBusy(true);
    const result = await deletePageSection(id);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
    } else {
      refresh();
    }
  }

  async function handleToggle(section: PageSection) {
    setBusy(true);
    const result = await updatePageSection(section.id, {
      is_enabled: !section.is_enabled,
    });
    setBusy(false);
    if (result?.error) {
      setError(result.error);
    } else {
      refresh();
    }
  }

  async function handleReorder(section: PageSection, dir: "up" | "down") {
    setBusy(true);
    const swapWith =
      dir === "up"
        ? sorted.find((s) => s.sort_order < section.sort_order)
        : sorted.find((s) => s.sort_order > section.sort_order);
    if (!swapWith) {
      setBusy(false);
      return;
    }
    // Swap sort_order values
    await updatePageSection(section.id, { sort_order: swapWith.sort_order });
    await updatePageSection(swapWith.id, { sort_order: section.sort_order });
    setBusy(false);
    refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-elev-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Layers className="h-4 w-4" /> Page sections
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Composable blocks rendered in order on the storefront. The page
            body (Markdown) appears after all enabled sections.
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu((v) => !v)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add section
          </button>
          {showAddMenu && (
            <div
              role="menu"
              className="absolute right-0 top-10 z-20 w-72 rounded-lg border border-border bg-popover p-1.5 shadow-elev-3"
            >
              {SECTION_PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => handleAdd(p.type)}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {p.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface/60 px-4 py-6 text-center text-xs text-muted-foreground">
          No sections yet. Click <strong>Add section</strong> to compose this
          page from reusable blocks.
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s, idx) => {
            const preset = SECTION_PRESETS.find((p) => p.type === s.section_type);
            const Icon = preset?.icon ?? Layers;
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5",
                  s.is_enabled
                    ? "border-border"
                    : "border-dashed border-border/50 opacity-60",
                )}
              >
                <Icon className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {preset?.label ?? s.section_type}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.is_enabled ? "Visible" : "Hidden"} · order {idx + 1}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleReorder(s, "up")}
                    disabled={busy || idx === 0}
                    aria-label="Move up"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(s, "down")}
                    disabled={busy || idx === sorted.length - 1}
                    aria-label="Move down"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(s)}
                    disabled={busy}
                    aria-label={s.is_enabled ? "Hide" : "Show"}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {s.is_enabled ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    disabled={busy}
                    aria-label="Delete section"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11px] text-muted-foreground">
        Section content editing for each block is a future iteration; today
        each block ships with sensible defaults that you can configure.
      </p>
    </div>
  );
}