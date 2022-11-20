import type { NextApiRequest, NextApiResponse } from 'next';
import * as stripe from 'stripe';

const stripeApi = new stripe.Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { PaymentIntentId: paymentIntentId, ajs_anonymous_id: anonymousId } = req.cookies;

  if (req.method === 'POST') {
    try {
      // todo - type!!
      const json = JSON.parse(req.body);
      const intent = await stripeApi.paymentIntents.create({
        amount: json.amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        setup_future_usage: 'on_session',
        metadata: { anonymousId },
      }, { idempotencyKey: json.idempotencyKey });

      res.status(201).json({ id: intent.id, clientSecret: intent.client_secret });
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while creating payment intent');
    }
  } else if (req.method === 'GET' && paymentIntentId) {
    try {
      const intent = await stripeApi.paymentIntents.retrieve(paymentIntentId);
      res.status(200).json({
        id: intent.id,
        clientSecret: intent.client_secret,
        isComplete: intent.status === 'succeeded' || intent.status === 'canceled',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while retrieving payment intent');
    }
  } else if (req.method === 'PATCH' && paymentIntentId) {
    try {
      const json = JSON.parse(req.body);
      await stripeApi.paymentIntents.update(paymentIntentId, { amount: json.amount }, { idempotencyKey: json.idempotencyKey });
      res.status(200).send('');
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while retrieving payment intent');
    }
  } else {
    res.status(501).send(`Method ${req.method} not implemented`);
  }
}
