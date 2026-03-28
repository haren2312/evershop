import config from 'config';
import { getConfig } from '../../lib/util/getConfig.js';
import { hookAfter } from '../../lib/util/hookable.js';
import { registerPaymentMethod } from '../checkout/services/getAvailablePaymentMethods.js';
import { getSetting } from '../setting/services/setting.js';
import { cancelPaymentIntent } from './services/cancelPayment.js';

export default async () => {
  const authorizedPaymentStatus = {
    order: {
      paymentStatus: {
        stripe_authorized: {
          name: 'Authorized',
          badge: 'warning'
        },
        stripe_failed: {
          name: 'Failed',
          badge: 'critical'
        },
        stripe_refunded: {
          name: 'Refunded',
          badge: 'critical'
        },
        stripe_partial_refunded: {
          name: 'Partial Refunded',
          badge: 'critical'
        }
      },
      psoMapping: {
        'stripe_authorized:*': 'processing',
        'stripe_failed:*': 'new',
        'stripe_refunded:*': 'closed',
        'stripe_partial_refunded:*': 'processing',
        'stripe_partial_refunded:delivered': 'completed'
      }
    }
  };
  config.util.setModuleDefaults('oms', authorizedPaymentStatus);

  hookAfter('changePaymentStatus', async (order, orderID, status) => {
    if (status !== 'canceled') {
      return;
    }
    if (order.payment_method !== 'stripe') {
      return;
    }
    await cancelPaymentIntent(orderID);
  });

  registerPaymentMethod({
    init: async () => ({
      code: 'stripe',
      name: await getSetting('stripeDisplayName', 'Stripe')
    }),
    validator: async () => {
      const stripeConfig = getConfig('system.stripe', {}) ?? {};
      let stripeStatus;
      if (stripeConfig.status) {
        stripeStatus = stripeConfig.status;
      } else {
        stripeStatus = await getSetting('stripePaymentStatus', 0);
      }
      if (parseInt(stripeStatus, 10) === 1) {
        return true;
      } else {
        return false;
      }
    }
  });
};
