import config from 'config';
import { getConfig } from '../../../lib/util/getConfig.js';
import { addProcessor } from '../../../lib/util/registry.js';
import {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus
} from '../../../types/order.js';

/**
 * Retrieves the list of order statuses defined in the system. The statuses are defined in the configuration under `oms.order.status`. Each status includes details such as its name, badge, whether it's the default status, and possible next statuses.
 * @returns A record of order statuses, where the key is the status ID and the value is an object containing the status details.
 */
function getOrderStatusList(): Record<string, OrderStatus> {
  const statuses = getConfig('oms.order.status', {}) as Record<
    string,
    OrderStatus
  >;
  return statuses;
}

/**
 * Retrieves the list of shipment statuses defined in the system. The statuses are defined in the configuration under `oms.order.shipmentStatus`. Each status includes details such as its name, badge, whether it's the default status, and whether it's cancelable.
 * @returns A record of shipment statuses, where the key is the status ID and the value is an object containing the status details.
 */
function getShipmentStatusList() {
  const statuses = getConfig('oms.order.shipmentStatus', {}) as Record<
    string,
    {
      name: string;
      badge: string;
      progress?: string;
      isDefault?: boolean;
      isCancelable?: boolean;
    }
  >;
  return statuses;
}

/**
 * Retrieves the list of payment statuses defined in the system. The statuses are defined in the configuration under `oms.order.paymentStatus`. Each status includes details such as its name, badge, whether it's the default status, and whether it's cancelable.
 * @returns A record of payment statuses, where the key is the status ID and the value is an object containing the status details.
 */
function getPaymentStatusList() {
  const statuses = getConfig('oms.order.paymentStatus', {}) as Record<
    string,
    {
      name: string;
      badge: string;
      isDefault?: boolean;
      isCancelable?: boolean;
    }
  >;
  return statuses;
}

/**
 * Registers a new payment status in the system. This function must be called during the application initialization phase (e.g., in a module's `bootstrap` function).
 * @param id Unique identifier for the payment status (e.g., "paid", "pending")
 * @param detail Object containing details about the payment status (name, badge, etc.)
 * @param psoMapping Optional mapping of payment status to order status (e.g., { "paid": "processing" })
 */
function registerPaymentStatus(
  id: string,
  detail: PaymentStatus,
  psoMapping?: Record<string, string>
) {
  // Make sure ID is not empty and does not contain spaces
  if (!id || /\s/.test(id)) {
    throw new Error(
      'Payment status ID must be a non-empty string without spaces.'
    );
  }
  const statusConfig = {
    order: {
      paymentStatus: {
        [id]: detail
      },
      psoMapping: psoMapping
    }
  };
  config.util.setModuleDefaults('oms', statusConfig);
}

/**
 * Registers a new shipment status in the system. This function must be called during the application initialization phase (e.g., in a module's `bootstrap` function).
 * @param id Unique identifier for the shipment status (e.g., "shipped", "delivered")
 * @param detail Object containing details about the shipment status (name, badge, etc.)
 * @param psoMapping Optional mapping of shipment status to order status (e.g., { "shipped": "processing" })
 */
function registerShipmentStatus(
  id: string,
  detail: ShipmentStatus,
  psoMapping?: Record<string, string>
) {
  // Make sure ID is not empty and does not contain spaces
  if (!id || /\s/.test(id)) {
    throw new Error(
      'Shipment status ID must be a non-empty string without spaces.'
    );
  }
  const statusConfig = {
    order: {
      shipmentStatus: {
        [id]: detail
      },
      psoMapping: psoMapping
    }
  };
  config.util.setModuleDefaults('oms', statusConfig);
}

/**
 * Registers a new order status in the system. This function must be called during the application initialization phase (e.g., in a module's `bootstrap` function).
 * @param id Unique identifier for the order status (e.g., "processing", "completed")
 * @param detail Object containing details about the order status (name, badge, next statuses, etc.)
 */
function registerOrderStatus(id: string, detail: OrderStatus) {
  // Make sure ID is not empty and does not contain spaces
  if (!id || /\s/.test(id)) {
    throw new Error(
      'Order status ID must be a non-empty string without spaces.'
    );
  }
  const statusConfig = {
    order: {
      status: {
        [id]: { ...detail }
      }
    }
  };
  config.util.setModuleDefaults('oms', statusConfig);
}

/** Registers a mapping of payment status and shipment status to order status. This function must be called during the application initialization phase (e.g., in a module's `bootstrap` function).
 * @param paymentStatus Payment status ID or "*" to match any payment status
 * @param shipmentStatus Shipment status ID or "*" to match any shipment status
 * @param orderStatus Order status ID to map to when the payment status and shipment status match the provided values
 */
function registerPSOStatusMapping(
  paymentStatus: string | '*',
  shipmentStatus: string | '*',
  orderStatus: string
) {
  addProcessor('psoMapping', async (mapping: Record<string, string>) => {
    mapping[`${paymentStatus}:${shipmentStatus}`] = orderStatus;
    return mapping;
  });
}

export {
  getOrderStatusList,
  getShipmentStatusList,
  getPaymentStatusList,
  registerPaymentStatus,
  registerShipmentStatus,
  registerOrderStatus,
  registerPSOStatusMapping
};
