import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  VerifyPaymentRequest,
  PaymentStatus,
  RefundRequest,
  RefundResult,
  PaymentStatusType,
} from "@/lib/payments/types";

// ============================================================================
// ManualPaymentProvider — Cash on Delivery / Bank Transfer
// ============================================================================

export class ManualPaymentProvider implements PaymentProvider {
  name = "MANUAL";

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    // For manual payment, we just create a pending payment record.
    // The customer pays via COD or bank transfer outside the system.
    // Admin manually marks the payment as paid after verification.
    return {
      provider: "MANUAL",
      providerPaymentId: `MANUAL-${request.orderNumber}-${Date.now()}`,
      status: "PENDING",
    };
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<PaymentStatus> {
    // For manual payment, verification is done by admin.
    // This returns PENDING — admin updates the status via the admin panel.
    return {
      providerPaymentId: request.providerPaymentId,
      status: "PENDING",
      amount: 0,
      currency: "PHP",
      paidAt: null,
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    // Manual refunds are processed outside the system (bank transfer back).
    return {
      providerRefundId: `MANUAL-REFUND-${request.paymentId}-${Date.now()}`,
      status: "REFUNDED",
      amount: request.amount,
    };
  }
}

// ============================================================================
// Payment Provider Registry
// ============================================================================

const providers: Record<string, PaymentProvider> = {
  MANUAL: new ManualPaymentProvider(),
  // XENDIT: new XenditProvider(),  — implement when credentials available
  // PAYMONGO: new PayMongoProvider(), — implement when credentials available
};

export function getPaymentProvider(providerName: string): PaymentProvider | null {
  return providers[providerName.toUpperCase()] || null;
}

// ============================================================================
// Payment Status helpers
// ============================================================================

export function isPaymentComplete(status: PaymentStatusType): boolean {
  return status === "PAID";
}

export function isPaymentFailed(status: PaymentStatusType): boolean {
  return status === "FAILED" || status === "EXPIRED";
}

export function isPaymentRefunded(status: PaymentStatusType): boolean {
  return status === "REFUNDED" || status === "PARTIALLY_REFUNDED";
}