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

    const lastPaymentIntentId = cookies.getLatest().PaymentIntentId;
    fetch('/api/orders', { method: lastPaymentIntentId ? 'GET' : 'POST', body: lastPaymentIntentId ? undefined : JSON.stringify({ amount }) })
      .then((res) => res.ok && res.json())
      .then((data) => {
        CLIENT_SECRET_CACHE.set(data.id, data.clientSecret);
        cookies.setCookie('PaymentIntentId', data.id);
        setClientSecret(data.clientSecret);
      });
  }, []);

  React.useEffect(() => {
    if (cookies.getLatest().PaymentIntentId) {
      fetch('/api/orders', { method: 'PATCH', body: JSON.stringify({ amount }) });
    }
  }, [amount]);

  return <stripe.Elements stripe={!clientSecret ? null : stripePromise} options={{ clientSecret, ...options }}>
    {children}
  </stripe.Elements>;
};

export const Payment = stripe.PaymentElement;
