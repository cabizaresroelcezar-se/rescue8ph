import type {
  ShippingProvider,
  ShippingRate,
  CreateShipmentRequest,
  Shipment,
  TrackingInformation,
} from "@/lib/shipping/types";

// ============================================================================
// ManualShippingProvider — Manual shipping (no API integration)
// ============================================================================

export class ManualShippingProvider implements ShippingProvider {
  name = "MANUAL";

  async getRates(): Promise<ShippingRate[]> {
    // For manual shipping, return a flat rate.
    // In production, this would call the provider's API for real rates.
    return [
      {
        provider: "MANUAL",
        serviceName: "Standard Delivery",
        rate: 150.0,
        currency: "PHP",
        estimatedDeliveryText: "3-5 business days",
      },
      {
        provider: "MANUAL",
        serviceName: "Express Delivery",
        rate: 250.0,
        currency: "PHP",
        estimatedDeliveryText: "1-2 business days",
      },
    ];
  }

  async createShipment(request: CreateShipmentRequest): Promise<Shipment> {
    // For manual shipping, we just generate a tracking number.
    // The admin physically books the shipment with the courier.
    return {
      providerShipmentId: `MANUAL-SHIP-${request.orderNumber}-${Date.now()}`,
      trackingNumber: null, // Admin fills this in after booking with courier
      status: "BOOKED",
      serviceName: request.serviceName,
    };
  }

  async cancelShipment(): Promise<void> {
    // Manual cancellation — no API call needed.
    // The admin contacts the courier to cancel.
    return;
  }

  async getTracking(trackingNumber: string): Promise<TrackingInformation> {
    // Manual tracking — admin updates tracking via the admin panel.
    return {
      trackingNumber,
      status: "IN_TRANSIT",
      events: [],
    };
  }
}

// ============================================================================
// Shipping Provider Registry
// ============================================================================

const providers: Record<string, ShippingProvider> = {
  MANUAL: new ManualShippingProvider(),
  // LALAMOVE: new LalamoveProvider(),  — implement when API access available
  // JNT: new JntProvider(),              — implement when API access available
  // LBC: new LbcProvider(),              — implement when API access available
};

export function getShippingProvider(providerName: string): ShippingProvider | null {
  return providers[providerName.toUpperCase()] || null;
}