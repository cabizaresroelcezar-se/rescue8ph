// =============================================================================
// Payment Provider Abstraction
// =============================================================================

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
}

export interface PaymentResult {
  provider: string;
  providerPaymentId: string;
  redirectUrl?: string;
  status: PaymentStatusType;
}

export interface VerifyPaymentRequest {
  providerPaymentId: string;
}

export interface PaymentStatus {
  providerPaymentId: string;
  status: PaymentStatusType;
  amount: number;
  currency: string;
  paidAt: string | null;
}

export interface RefundRequest {
  paymentId: string;
  providerPaymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: PaymentStatusType;
  amount: number;
}

export type PaymentStatusType =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface PaymentProvider {
  name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(request: VerifyPaymentRequest): Promise<PaymentStatus>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
}