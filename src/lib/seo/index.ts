import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rescue8ph.vercel.app";
const SITE_NAME = "Rescue 8 Philippines";
const DEFAULT_DESCRIPTION =
  "Premium products and solutions for every Filipino. Shop with confidence.";

export function createMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_PH",
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      ...(image && { images: [image] }),
    },
  };
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  };
}

export function productSchema(product: {
  title: string;
  description: string;
  price: number;
  slug: string;
  image?: string;
}) {
  return {
    "@type": "Product",
    name: product.title,
    description: product.description,
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "PHP",
      availability: "https://schema.org/InStock",
    },
    ...(product.image && { image: product.image }),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedAt: string;
  image?: string;
}) {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    ...(post.image && { image: post.image }),
  };
}