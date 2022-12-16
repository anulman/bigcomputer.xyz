import _ from 'lodash';
import * as React from 'react';
import * as rxHooks from 'observable-hooks';

import type * as stripeJs from '@stripe/stripe-js';
import * as stripePure from '@stripe/stripe-js/pure';
import * as stripe from '@stripe/react-stripe-js';

import * as data from '@src/data/';
import * as order from '@src/components/Order';
import * as form from '@src/parts/Form';
import * as text from '@src/parts/Text';

// by memoizing _outside_ of React, we can avoid re-initializing Stripe even
// while reusing the underlying `<Elements>` component.
const loadedStripe: Record<string, stripeJs.Stripe> = {};
const loadStripe = async (key: string) => {
  let loaded = loadedStripe[key];

  if (!loaded) {
    loaded = await stripePure.loadStripe(key, { apiVersion: '2022-11-15;orders_beta=v4' });
  }

  return loaded;
};

export const StripeForm = ({
  selectedOption,
  stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeOptions,
  ...props
}: {
  selectedOption: data.PackageOption;
  stripeKey?: string;
  stripeOptions?: stripeJs.StripeElementsOptions;
} & React.HTMLAttributes<HTMLFormElement>) => {
  const { order$ } = order.useFormContext();
  const orderValue = rxHooks.useObservableState(order$);

  const stripePromise = React.useMemo(() => loadStripe(stripeKey), [stripeKey]);

  return !orderValue?.paymentIntent?.clientSecret ? null : (
    <stripe.Elements stripe={stripePromise} options={{ clientSecret: orderValue?.paymentIntent?.clientSecret, ...stripeOptions }}>
      <PaymentForm selectedOption={selectedOption} {...props} />
    </stripe.Elements>
  );
};

const PaymentForm = ({ selectedOption, ...props }: {
  selectedOption: data.PackageOption;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'>) => {
  const stripeApi = stripe.useStripe();
  const elements = stripe.useElements();

  const { submitFormPart } = form.useMultipartContext();
  const { order$, emailRef } = order.useFormContext();
  const orderValue = rxHooks.useObservableState(order$);

  const onSubmit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    const afterSubmit = submitFormPart(event);
    // T-94 - set a proper `return_url`
    const result = await stripeApi.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://bigcomputer.xyz',
        payment_method_data: { billing_details: { email: emailRef.current } },
      },
      redirect: 'if_required',
    });

    if (result.error) {
      const loggable = {
        ..._.omit(result.error, 'payment_intent', 'payment_method'),
        payment_intent_id: result.error.payment_intent?.id,
        payment_method_id: result.error.payment_method?.id
      };

      // T-95 - log to sentry or similar
      console.error(loggable);
      afterSubmit.setError(result.error?.message);
    } else {
      console.log('success!');
      afterSubmit.setSuccess();
      // T-96 - handle redirects?
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }, [stripeApi, elements]);

  // tk - consolidate purchase button into a multipart-aware component
  return <form.FormPart onSubmit={onSubmit} {...props}>
    <section>
      <h4>Payment</h4>
      <stripe.PaymentElement options={{ fields: { billingDetails: { email: 'never' } } }} />
    </section>
    <section>
      <button type="submit">
        Purchase {data.PACKAGE_CONFIGS[selectedOption].label} package (<text.Price amount={orderValue?.total ?? data.PACKAGE_CONFIGS[selectedOption].price} />, incl.tax)
      </button>
    </section>
  </form.FormPart>;
};
