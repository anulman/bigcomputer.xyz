import type { NextApiRequest, NextApiResponse } from 'next';
import * as stripe from 'stripe';

import * as utils from '@src/utils/api';
import crypto from 'node:crypto';

// @ts-expect-error 2322
const stripeApi = new stripe.Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01;orders_beta=v4' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const orderId = req.query.id as string;

  if (req.method === 'GET') {
    try {
      const order = await stripeApi.orders.retrieve(orderId, { expand: ['payment.payment_intent'] });

      res.status(200).json(utils.stripeApiOrderToOrder(order));
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while retrieving order');
    }
  } else if (req.method === 'PATCH') {
    try {
      const json = JSON.parse(req.body);
      let order = await stripeApi.orders.update(
        orderId,
        {
          ...(json.billingAddress === undefined ? {} : { billing_details: json.billingAddress }),
          ...(json.lineItems === undefined ? {} : { line_items: json.lineItems }),
          ...(json.shippingAddress === undefined ? {} : {
            shipping_details: {
              name: 'TK',
              address: json.shippingAddress,
            },
          }),
        },
        { idempotencyKey: json.idempotencyKey },
      );

      if (json.shouldSubmit === true) {
        console.log(crypto.webcrypto.randomUUID());
        const idempotencyKey = crypto.webcrypto.randomUUID();
        order = await stripeApi.orders.submit(
          orderId,
          { expected_total: order.amount_total, expand: ['payment.payment_intent'] },
          { idempotencyKey },
        );

        console.log(order);
      }

      res.status(200).send(utils.stripeApiOrderToOrder(order));
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while patching order');
    }
  } else if (req.method === 'POST') {
    try {
      const json = JSON.parse(req.body);
      const order = await stripeApi.orders.submit(
        orderId,
        { expected_total: json.expectedTotal, expand: ['payment.payment_intent'] },
        { idempotencyKey: json.idempotencyKey },
      );

      res.status(200).send(utils.stripeApiOrderToOrder(order));
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while submitting order');
    }
  } else if (req.method === 'DELETE') {
    try {
      const json = JSON.parse(req.body);
      const order = await stripeApi.orders.retrieve(orderId);

      if (order.status === 'submitted') {
        // we are reopening the order first
        const reopened = await stripeApi.orders.reopen(orderId, null, {
          idempotencyKey: json.idempotencyKey,
        });

        res.status(200).send(utils.stripeApiOrderToOrder(reopened));
      } else {
        await stripeApi.orders.cancel(orderId, null, {
          idempotencyKey: json.idempotencyKey,
        });

        res.status(204).send('');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while submitting order');
    }
  } else {
    res.status(501).send(`Method ${req.method} not implemented`);
  }
}

