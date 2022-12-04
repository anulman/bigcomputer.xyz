import _ from 'lodash';
import * as React from 'react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';

import type * as stripeJs from '@stripe/stripe-js';
import * as stripePure from '@stripe/stripe-js/pure';
import * as stripe from '@stripe/react-stripe-js';

import { createSafeContext, useSafeContext } from '@src/hooks/use-safe-context';
import * as api from '@src/utils/api';
import * as cookies from '@src/utils/cookies';

const SafeOrderContext = createSafeContext<{
  order$: rxjs.Observable<api.Order>;
  emailRef: React.RefObject<string>,
  patchOrder: (patchData: Parameters<typeof api.patchOrder>[1]) => Promise<api.Order>;
}>();

export const useOrderContext = () => useSafeContext(SafeOrderContext);

// by memoizing _outside_ of React, we can avoid re-initializing Stripe even
// while reusing the underlying `<Elements>` component.
const loadStripe = _.memoize((key: string) => stripePure.loadStripe(key, { apiVersion: '2022-11-15;orders_beta=v4' }));

export const OrderContext = ({
  defaultItems,
  children
}: React.PropsWithChildren<{
  defaultItems: api.ProductOrLineItems;
}>) => {
  const orderRef$ = React.useRef(new rxjs.Subject<api.Order>());
  const emailRef = React.useRef<string>();
  const orderId = React.useRef(cookies.getLatest().OrderId);
  const patchOrder = React.useCallback((patchData: Parameters<typeof api.patchOrder>[1]) => {
    if (!orderId.current) {
      console.warn('Tried to patch order without an order ID');
      return;
    }

    const promise = api.patchOrder(orderId.current, patchData);
    promise.then((order) => {
      if (patchData.email) {
        emailRef.current = patchData.email;
      }

      orderRef$.current.next(order);
    }).catch(console.error);

    return promise;
  }, []);

  React.useEffect(() => {
    const createOrder = () => api.createOrder(defaultItems)
      .then((order) => {
        cookies.setCookie('OrderId', order.id);
        return order;
      });

    const orderPromise = orderId.current
      ? api.findOrder(orderId.current)
        .catch(createOrder)
        // order status will always be `open` if just-created
        .then((order) => order.status === 'open' ? order : createOrder())
      : createOrder();

    orderPromise
      .then((order) => {
        orderRef$.current.next(order);
        orderId.current = order.id;
      })
      .catch(console.error);
  }, []);

  const value = React.useMemo(() => ({
    order$: orderRef$.current.pipe(rx.distinctUntilChanged()),
    emailRef,
    patchOrder
  }), [patchOrder]);

  // todo - safecontext
  return <SafeOrderContext.Provider value={value}>
    {children}
  </SafeOrderContext.Provider>;
};

export const PaymentElement = stripe.PaymentElement;
export const PaymentForm = ({
  key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  options,
  paymentIntent,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> & React.PropsWithChildren<{
  key?: string;
  options?: stripeJs.StripeElementsOptions;
  paymentIntent: api.Order['paymentIntent']
}>) => {
  const stripePromise = loadStripe(key);

  return <stripe.Elements stripe={!paymentIntent?.clientSecret ? null : stripePromise} options={{ clientSecret: paymentIntent?.clientSecret, ...options }}>
    <InnerPaymentForm {...props}>
      {children}
    </InnerPaymentForm>
  </stripe.Elements>;
};

const InnerPaymentForm = ({ children, ...props }: React.PropsWithChildren<Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'>>) => {
  const stripeApi = stripe.useStripe();
  const elements = stripe.useElements();
  const { emailRef } = useOrderContext();

  // todo - expose via context?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isSubmitting, setIsSubmitting] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_didSucceed, setDidSucceed] = React.useState(false);

  const onSubmit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // todo - set a proper `return_url`
    const result = await stripeApi.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://bigcomputer.xyz',
        payment_method_data: { billing_details: { email: emailRef.current } },
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
  }, [stripeApi, elements]);

  return <form onSubmit={onSubmit} {...props}>{children}</form>;
};
