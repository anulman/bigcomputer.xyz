import * as api from '@src/utils/api';
import * as data from '@src/data/';
import * as stripe from '@src/components/Stripe';
import * as text from '@src/parts/Text';

export const StripeForm = ({ order, selectedOption }: {
  order: api.Order;
  selectedOption: data.PackageOption;
}) => (
  <stripe.PaymentForm paymentIntent={order.paymentIntent}>
    <section>
      <h4>Payment</h4>
      <stripe.PaymentElement options={{ fields: { billingDetails: { email: 'never' } } }} />
    </section>
    <section>
      <button type="submit">
        Purchase {data.PACKAGE_CONFIGS[selectedOption].label} package (<text.Price amount={order.total ?? data.PACKAGE_CONFIGS[selectedOption].price} />, incl.tax)
      </button>
    </section>
  </stripe.PaymentForm>
);
