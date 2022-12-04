import type * as stripeJs from '@stripe/stripe-js';
import type * as stripeApi from 'stripe';

import * as data from '@src/data/stripe';
import type * as radar from '@src/utils/radar';

type LineItem = { product: ProductId; quantity: number };
type ProductId = typeof data.PACKAGE_CONFIGS[data.PackageOption]['id'];

export type ProductOrLineItems = ProductId | LineItem[];
export type Order = {
  id?: stripeJs.Order['id'];
  paymentIntent?: {
    id: stripeJs.PaymentIntent['id'];
    clientSecret?: stripeJs.PaymentIntent['client_secret'];
  };
  status: stripeJs.Order.Status,
  subtotal: stripeJs.Order['amount_subtotal'],
  // see https://stripe.com/docs/api/orders_v2/object#order_v2_object-automatic_tax
  taxStatus: 'requires_location_inputs' | 'complete' | 'failed';
  total: stripeJs.Order['amount_total'],
  totalDetails: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
};

export type Address = {
  id: stripeJs.Order['id'];
  paymentIntentId?: string;
  status: stripeJs.Order.Status,
  subtotal: stripeJs.Order['amount_subtotal'],
  // see https://stripe.com/docs/api/orders_v2/object#order_v2_object-automatic_tax
  taxStatus: 'requires_location_inputs' | 'complete' | 'failed';
  total: stripeJs.Order['amount_total'],
  totalDetails: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
};

const generateIdempotencyKey = () => {
  // todo - fallback to a lazy import if needed - old mobile safari does not support this
  return crypto.randomUUID();
};

const itemsToLineItems = (items: ProductOrLineItems): LineItem[] => (
  items instanceof Array
    ? items
    : [{ product: items, quantity: 1 }]
);

const addressToShippingAddress = (address: radar.Address): stripeJs.Order.Shipping['address'] => {
  const { number, street, city, stateCode, postalCode, countryCode } = address;

  return {
    line1: `${number} ${street}`,
    line2: null,
    city,
    state: stateCode,
    postal_code: postalCode,
    country: countryCode,
  };
};

export const stripeApiOrderToOrder = (order: stripeApi.Stripe.Order): Order => ({
  id: order.id,
  status: order.status,
  subtotal: order.amount_subtotal,
  taxStatus: order.automatic_tax.status,
  totalDetails: order.total_details,
  total: order.amount_total,
  ...(!order.payment.payment_intent ? {} : {
    paymentIntent: {
      id: typeof order.payment.payment_intent === 'string'
        ? order.payment.payment_intent
        : order.payment.payment_intent.id,
      clientSecret: typeof order.payment.payment_intent === 'string'
        ? undefined
        : order.payment.payment_intent.client_secret,
    },
  }),
});

export const findOrder = async (id: string) => {
  const res = await fetch(`/api/orders/${id}`, { method: 'GET' });

  if (!res.ok) {
    throw new Error(`Failed to find order ${id}: ${await res.text()}`);
  }

  return res.json() as Promise<Order>;
};

export const createOrder = async (items: ProductOrLineItems) => {
  const lineItems = itemsToLineItems(items);
  const idempotencyKey = generateIdempotencyKey();
  // todo - use id in URL
  const res = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, lineItems })
  });

  if (!res.ok) {
    throw new Error(`Failed to create order: ${await res.text()}`);
  }

  return res.json() as Promise<Order>;
};

export const patchOrder = async (
  id: string,
  patchData: { email?: string; items?: ProductOrLineItems; address?: radar.Address, shouldSubmit?: boolean },
) => {
  const lineItems = patchData.items ? itemsToLineItems(patchData.items) : undefined;
  const shippingAddress = patchData.address ? addressToShippingAddress(patchData.address) : undefined;
  const billingAddress: stripeJs.Order.Billing = patchData.email ? { email: patchData.email } : undefined;
  const shouldSubmit = patchData.shouldSubmit ?? false;

  const idempotencyKey = crypto.randomUUID();
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ lineItems, billingAddress, shippingAddress, shouldSubmit, idempotencyKey }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update order: ${await res.text()}`);
  }

  return res.json() as Promise<Order>;
};
