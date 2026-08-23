import { z } from "zod";

// =============================================================================
// Product Schemas
// =============================================================================

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be >= 0"),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().max(100).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  weightGrams: z.number().int().min(0).optional(),
  lengthCm: z.number().min(0).optional(),
  widthCm: z.number().min(0).optional(),
  heightCm: z.number().min(0).optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
});

// =============================================================================
// Customer Address Schema
// =============================================================================

export const customerAddressSchema = z.object({
  label: z.string().max(100).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  cityMunicipality: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  buildingUnit: z.string().optional(),
  postalCode: z.string().optional(),
  deliveryNotes: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// =============================================================================
// Checkout Schema
// =============================================================================

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  cityMunicipality: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  buildingUnit: z.string().optional(),
  postalCode: z.string().optional(),
  deliveryNotes: z.string().optional(),
  shippingProvider: z.enum(["MANUAL", "LALAMOVE", "JNT", "LBC"]),
  paymentProvider: z.enum(["XENDIT", "PAYMONGO", "MANUAL"]),
  couponCode: z.string().optional(),
  customerNotes: z.string().optional(),
});

// =============================================================================
// Coupon Schemas
// =============================================================================

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50)
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric with hyphens"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0, "Discount value must be > 0"),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// =============================================================================
// Order Schemas
// =============================================================================

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "PAYMENT_PENDING",
    "PAID",
    "PROCESSING",
    "READY_TO_SHIP",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
  internalNotes: z.string().optional(),
});

// =============================================================================
// CMS Page Schema
// =============================================================================

export const createPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImageUrl: z.string().url().optional(),
});

// =============================================================================
// Blog Post Schema
// =============================================================================

export const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  featuredImageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;