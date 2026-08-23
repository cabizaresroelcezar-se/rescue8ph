// =============================================================================
// Rescue 8 Philippines — Domain Types
// =============================================================================

// --- Enums -------------------------------------------------------------------

export type ProfileStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type InventoryMovementType =
  | "PURCHASE"
  | "SALE"
  | "RESERVATION"
  | "RELEASE"
  | "RETURN"
  | "DAMAGE"
  | "ADJUSTMENT";
export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
export type PaymentStatusType =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
export type PaymentProviderType = "XENDIT" | "PAYMONGO" | "MANUAL";
export type ShippingProviderType = "MANUAL" | "LALAMOVE" | "JNT" | "LBC";
export type ShipmentStatusType =
  | "PENDING"
  | "QUOTED"
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";
export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
export type PageSectionType =
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

// --- Database Entity Types ---------------------------------------------------

export interface Profile {
  id: string;
  roleId: string;
  status: ProfileStatus;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  status: ProductStatus;
  featured: boolean;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number;
  attributes: Record<string, unknown>;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  productId: string;
  variantId: string | null;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId: string | null;
  movementType: InventoryMovementType;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
  buildingUnit: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  customerNotes: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  subtotal: number;
  createdAt: string;
}

export interface OrderAddress {
  id: string;
  orderId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
  buildingUnit: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProviderType;
  status: PaymentStatusType;
  amount: number;
  currency: string;
  providerPaymentId: string | null;
  providerReference: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  eventType: string;
  externalEventId: string | null;
  status: PaymentStatusType | null;
  amount: number | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ShippingRate {
  id: string;
  orderId: string | null;
  provider: ShippingProviderType;
  serviceName: string;
  rate: number;
  currency: string;
  estimatedDeliveryText: string | null;
  providerRateId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  provider: ShippingProviderType;
  status: ShipmentStatusType;
  trackingNumber: string | null;
  providerShipmentId: string | null;
  serviceName: string | null;
  shippingCost: number;
  estimatedDeliveryText: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatusType;
  eventTime: string;
  description: string | null;
  providerEventId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageSection {
  id: string;
  pageId: string;
  sectionType: PageSectionType;
  sortOrder: number;
  isEnabled: boolean;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImageUrl: string | null;
  authorId: string | null;
  categoryId: string | null;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  roleOrCompany: string | null;
  quote: string;
  imageUrl: string | null;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  storagePath: string;
  fileName: string;
  fileType: MediaType;
  mimeType: string | null;
  fileSize: number | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string | null;
  parentId: string | null;
  sortOrder: number;
  isEnabled: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}