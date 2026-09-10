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

const phoneRegex = /^[\d\s+\-()]{7,}$/;

export const customerAddressSchema = z.object({
  label: z.string().max(100).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required").regex(phoneRegex, "Invalid phone format"),
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
  phone: z.string().min(1, "Phone is required").regex(phoneRegex, "Invalid phone format"),
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
// Cart Schemas
// =============================================================================

export const cartQuantitySchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be at least 0")
    .max(999, "Quantity must be at most 999"),
});

export const removeFromCartSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

// =============================================================================
// Shipment Schemas
// =============================================================================

export const shipmentProviderEnum = z.enum(["MANUAL", "LALAMOVE", "JNT", "LBC"]);

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  provider: shipmentProviderEnum,
  serviceName: z.string().min(1, "Service name is required"),
  trackingNumber: z.string().optional(),
  shippingCost: z.number().min(0, "Shipping cost must be >= 0"),
  estimatedDelivery: z.string().optional(),
});

export const shipmentStatusEnum = z.enum([
  "PENDING",
  "QUOTED",
  "BOOKED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);

export const updateShipmentStatusSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  status: shipmentStatusEnum,
  description: z.string().optional(),
});

// =============================================================================
// Shipping Fee Schema
// =============================================================================

export const setShippingFeeSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  shippingFee: z.number().min(0, "Shipping fee must be >= 0"),
});

// =============================================================================
// Payment Schema
// =============================================================================

export const markPaymentPaidSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
});

// =============================================================================
// Auth Schemas
// =============================================================================

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required").regex(phoneRegex, "Invalid phone format"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
});

// =============================================================================
// CMS — FAQ Schemas
// =============================================================================

export const createFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sort_order: z.number().int().min(0).optional(),
});

export const updateFaqSchema = z.object({
  id: z.string().min(1, "ID is required"),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sort_order: z.number().int().min(0).optional(),
  is_enabled: z.boolean().optional(),
});

// =============================================================================
// CMS — Blog Category Schema
// =============================================================================

export const createBlogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().optional(),
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
export type CartQuantityInput = z.infer<typeof cartQuantitySchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
export type SetShippingFeeInput = z.infer<typeof setShippingFeeSchema>;
export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;