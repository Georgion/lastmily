/**
 * Shipment custom type
 */
export interface Shipment {
  id: string;
  name: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
  creationDate: Date | number;
  desiredDeliveryDate: Date | number;
}


/**
 * ShipmentPaginatedListResponse custom type
 */
export interface ShipmentPaginatedListResponse {
  body: {
    rows: Shipment[];
    total: number;
  }
}

/**
 * ShipmentPaginatedListResponse type guard
 */
export const isShipmentPaginatedListResponse = function (shipmentPaginatedListResponse: unknown): shipmentPaginatedListResponse is ShipmentPaginatedListResponse {
  return (
    (shipmentPaginatedListResponse as ShipmentPaginatedListResponse).body?.rows !== undefined &&
    (shipmentPaginatedListResponse as ShipmentPaginatedListResponse).body?.total !== undefined
  )
};

/**
 * ShipmentCreateResponse custom type
 */
export interface ShipmentCreatePatchResponse {
  body: {
    message: string;
    shipment: Shipment;
  };
}

/**
 * ShipmentCreateResponse type guard
 */
export const isShipmentCreatePatchResponse = function (shipmentCreateResponse: unknown): shipmentCreateResponse is ShipmentCreatePatchResponse {
  return (
    (shipmentCreateResponse as ShipmentCreatePatchResponse).body?.message !== undefined &&
    (shipmentCreateResponse as ShipmentCreatePatchResponse).body?.shipment !== undefined
  )
};

/**
 * ShipmentDeleteResponse custom type
 */
export interface ShipmentDeleteResponse {
  body: {
    message: string;
  };
}

/**
 * ShipmentDeleteResponse type guard
 */
export const isShipmentDeleteResponse = function (shipmentDeleteResponse: unknown): shipmentDeleteResponse is ShipmentDeleteResponse {
  return (
    (shipmentDeleteResponse as ShipmentDeleteResponse).body?.message !== undefined
  )
};
