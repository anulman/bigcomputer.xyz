import type { NextApiRequest, NextApiResponse } from 'next';
import * as stripe from 'stripe';

import * as utils from '@src/utils/api';

// @ts-expect-error 2322
const stripeApi = new stripe.Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01;orders_beta=v4' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ajs_anonymous_id: anonymousId } = req.cookies;

  if (req.method === 'POST') {
    try {
      // todo - type!!
      const json = JSON.parse(req.body);
      const order = await stripeApi.orders.create({
        currency: 'usd',
        automatic_tax: { enabled: true },
        billing_details: {
          email: json.email,
        },
        line_items: json.lineItems,
        metadata: { anonymousId: anonymousId.replace(/"/g, '') },
      }, { idempotencyKey: json.idempotencyKey });

      res.status(201).json(utils.stripeApiOrderToOrder(order));
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while creating order');
    }
  } else {
    res.status(501).send(`Method ${req.method} not implemented`);
  }
}
