import _ from 'lodash';
import * as React from 'react';

import type * as stripeJs from '@stripe/stripe-js';
import * as stripePure from '@stripe/stripe-js/pure';
import * as stripe from '@stripe/react-stripe-js';

import * as cookies from '@src/utils/cookies';

const DEFAULT_STRIPE_KEY = process.env.STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const CLIENT_SECRET_CACHE = new Map<string, string>();

// by memoizing _outside_ of React, we can avoid re-initializing Stripe even
// while reusing the underlying `<Elements>` component.
const loadStripe = _.memoize((key: string) => stripePure.loadStripe(key));

export const Context = ({ key, options, amount, children }: React.PropsWithChildren<{ key?: `pk_${string}`; amount: number; options?: stripeJs.StripeElementsOptions }>) => {
  const stripePromise = loadStripe(key ?? DEFAULT_STRIPE_KEY);
  const [clientSecret, setClientSecret] = React.useState(() => CLIENT_SECRET_CACHE.get(cookies.getLatest().PaymentIntentId));

  React.useEffect(() => {
    if (clientSecret !== undefined) {
      return;
    }

    const findOrCreatePaymentIntent = async (lastPaymentIntentId?: string): Promise<{ id: string; clientSecret: string }> => {
      // todo - fallback to a lazy import if needed - old mobile safari does not support this
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch('/api/orders', {
        method: lastPaymentIntentId ? 'GET' : 'POST',
        body: lastPaymentIntentId
          ? undefined
          : JSON.stringify({ amount, idempotencyKey }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create payment intent: ${await res.text()}`);
      }

      const json = await res.json();

      if (lastPaymentIntentId && json.isComplete) {
        return findOrCreatePaymentIntent();
      }

      return json;
    };

    const lastPaymentIntentId = cookies.getLatest().PaymentIntentId;
    findOrCreatePaymentIntent(lastPaymentIntentId)
      .then((data: { id: string, clientSecret: string }) => {
        CLIENT_SECRET_CACHE.set(data.id, data.clientSecret);
        cookies.setCookie('PaymentIntentId', data.id);
        setClientSecret(data.clientSecret);
      });
  }, []);

  React.useEffect(() => {
    // todo - fallback to a lazy import if needed - old mobile safari does not support this
    const idempotencyKey = crypto.randomUUID();

    if (cookies.getLatest().PaymentIntentId) {
      fetch('/api/orders', { method: 'PATCH', body: JSON.stringify({ amount, idempotencyKey }) });
    }
  }, [amount]);

  return <stripe.Elements stripe={!clientSecret ? null : stripePromise} options={{ clientSecret, ...options }}>
    {children}
  </stripe.Elements>;
};

export const Payment = stripe.PaymentElement;

export const Form = ({ email, children }: React.PropsWithChildren<{ email: string }>) => {
  const stripeApi = stripe.useStripe();
  const elements = stripe.useElements();
  // todo - expose via context?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isSubmitting, setIsSubmitting] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_didSucceed, setDidSucceed] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // todo - set a proper `return_url`
    const result = await stripeApi.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://bigcomputer.xyz',
        payment_method_data: { billing_details: { email } },
      },
      redirect: 'if_required',
    });

    setIsSubmitting(false);

    if (result.error) {
      const loggable = {
        ..._.omit(result.error, 'payment_intent', 'payment_method'),
        payment_intent_id: result.error.payment_intent?.id,
        payment_method_id: result.error.payment_method?.id
      };

      // todo - log to sentry or similar
      console.error(loggable);

      // TODO - Show error to customer (for example, payment details incomplete)
    } else {
      // TODO - handle successful payment, with and without redirects
      setDidSucceed(true);
      console.log('success!');
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return <form onSubmit={onSubmit}>{children}</form>;
};
