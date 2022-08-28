import type { NextApiRequest, NextApiResponse } from 'next';
import * as stripe from 'stripe';

const stripeApi = new stripe.Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const json = JSON.parse(req.body);
      const intent = await stripeApi.paymentIntents.create({
        amount: json.amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      res.status(201).json({ id: intent.id, clientSecret: intent.client_secret });
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while creating payment intent');
    }
  } else if (req.method === 'GET' && req.cookies.PaymentIntentId) {
    try {
      const intent = await stripeApi.paymentIntents.retrieve(req.cookies.PaymentIntentId);
      res.status(200).json({ id: intent.id, clientSecret: intent.client_secret });
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while retrieving payment intent');
    }
  } else if (req.method === 'PATCH' && req.cookies.PaymentIntentId) {
    try {
      const json = JSON.parse(req.body);
      await stripeApi.paymentIntents.update(req.cookies.PaymentIntentId, json);
      res.status(200).send('');
    } catch (err) {
      console.error(err);
      res.status(500).send('Unknown error while retrieving payment intent');
    }
  } else {
    res.status(501).send(`Method ${req.method} not implemented`);
  }
}
