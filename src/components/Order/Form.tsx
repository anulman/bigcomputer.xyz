import * as React from 'react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';

import * as data from '@src/data/';
import { createSafeContext, useSafeContext } from '@src/hooks/use-safe-context';
import * as form from '@src/parts/Form';
import * as api from '@src/utils/api';
import * as cookies from '@src/utils/cookies';

import * as formPart from './FormPart';

type FormProps = React.HTMLAttributes<HTMLFormElement> & {
  defaultItems?: api.ProductOrLineItems;
  orderId?: string;
};

const SafeOrderFormContext = createSafeContext<{
  order$: rxjs.Observable<api.Order>;
  emailRef: React.RefObject<string>,
  patchOrder: (patchData: Parameters<typeof api.patchOrder>[1]) => Promise<api.Order>;
}>();

export const useFormContext = () => useSafeContext(SafeOrderFormContext);

export const Form = ({
  defaultItems = data.PACKAGE_CONFIGS[data.DEFAULT_PACKAGE].id,
  orderId = cookies.getLatest().OrderId,
  ...props
}: FormProps) => {
  const orderRef$ = React.useRef(new rxjs.Subject<api.Order>());
  const emailRef = React.useRef<string>();
  const orderIdRef = React.useRef(orderId);
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(data.DEFAULT_PACKAGE);

  const patchOrder = React.useCallback((patchData: Parameters<typeof api.patchOrder>[1]) => {
    if (!orderIdRef.current) {
      console.warn('Tried to patch order without an order ID');
      return;
    }

    const promise = api.patchOrder(orderIdRef.current, patchData);
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

    const orderPromise = orderIdRef.current
      ? api.findOrder(orderIdRef.current)
        .catch(createOrder)
        // order status will always be `open` if just-created
        .then((order) => order.status === 'open' ? order : createOrder())
      : createOrder();

    orderPromise
      .then((order) => {
        orderRef$.current.next(order);
        orderIdRef.current = order.id;
      })
      .catch(console.error);
  }, []);

  const value = React.useMemo(() => ({
    order$: orderRef$.current.pipe(rx.distinctUntilChanged()),
    emailRef,
    patchOrder
  }), [patchOrder]);

  return <SafeOrderFormContext.Provider value={value}>
    <form.Multipart {...props}>
      <formPart.PackageAndEmailForm onSelectedOption={setSelectedOption} />
      <formPart.AddressForm />
      <formPart.StripeForm selectedOption={selectedOption} />
      <section>
        <button type="submit">
          Proceed to payment (${Math.round(data.PACKAGE_CONFIGS[selectedOption].price / 100)})
        </button>
      </section>
    </form.Multipart>
  </SafeOrderFormContext.Provider>;
};
