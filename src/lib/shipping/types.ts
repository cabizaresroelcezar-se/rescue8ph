// =============================================================================
// Shipping Provider Abstraction
// =============================================================================

export interface ShippingRateRequest {
  origin: AddressInfo;
  destination: AddressInfo;
  parcel: ParcelInfo;
}

export interface AddressInfo {
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
  buildingUnit?: string;
  postalCode?: string;
}

export interface ParcelInfo {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ShippingRate {
  provider: string;
  serviceName: string;
  rate: number;
  currency: string;
  estimatedDeliveryText: string;
  providerRateId?: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  orderNumber: string;
  origin: AddressInfo;
  destination: AddressInfo;
  parcel: ParcelInfo;
  serviceName: string;
  rate: number;
  currency: string;
}

export interface Shipment {
  providerShipmentId: string;
  trackingNumber: string | null;
  status: ShipmentStatusType;
  serviceName: string;
}

export interface TrackingInformation {
  trackingNumber: string;
  status: ShipmentStatusType;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  description: string;
  eventTime: string;
  location?: string;
}

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

export interface ShippingProvider {
  name: string;
  getRates(request: ShippingRateRequest): Promise<ShippingRate[]>;
  createShipment(request: CreateShipmentRequest): Promise<Shipment>;
  cancelShipment(shipmentId: string): Promise<void>;
  getTracking(trackingNumber: string): Promise<TrackingInformation>;
}