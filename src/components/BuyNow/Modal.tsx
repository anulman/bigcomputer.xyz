import * as React from 'react';
import { styled } from '@linaria/react';
import * as rxHooks from 'observable-hooks';

import * as data from '@src/data/';
import * as stripe from '@src/components/Stripe';
import * as modal from '@src/parts/Modal';
import * as ASCII from '@src/parts/ASCII';

import * as formPart from './FormPart';

const SmallTitle = styled(ASCII.Title)`
  @apply text-center;
  font-size: 0.5rem;
`;

const InnerModal = (props: Omit<Parameters<typeof modal.Modal>[0], 'children'>) => {
  return (
    <modal.Modal {...props} aria-label="Purchase The Tale of the Big Computer">
      <SmallTitle />
      <stripe.OrderContext defaultItems={data.PACKAGE_CONFIGS[data.DEFAULT_PACKAGE].id}>
        <OrderForm />
      </stripe.OrderContext>
    </modal.Modal>
  );
};


const OrderForm = () => {
  const { order$ } = stripe.useOrderContext();
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(data.DEFAULT_PACKAGE);
  const [currentFormPart, setCurrentFormPart] = React.useState(0);
  const [highestFormPart, setHighestFormPart] = React.useState(currentFormPart);

  const order = rxHooks.useObservableState(order$, null);

  React.useEffect(() => {
    if (currentFormPart > highestFormPart) {
      setHighestFormPart(currentFormPart);
    }
  }, [currentFormPart, highestFormPart]);

  return (
    <>
      <formPart.PackageAndEmailForm onSelectedOption={setSelectedOption} onSubmit={() => setCurrentFormPart(1)} />
      {highestFormPart < 1 ? null : (
        <formPart.AddressForm onSubmit={() => setCurrentFormPart(2)} />
      )}
      {highestFormPart < 2 || !order ? null : (
        <formPart.StripeForm order={order} selectedOption={selectedOption} />
      )}
      <section>
        <button type="submit">
          Proceed to payment (${Math.round(data.PACKAGE_CONFIGS[selectedOption].price / 100)})
        </button>
      </section>
    </>
  );
};

export const Modal = styled(InnerModal)`
  // todo - linaria'ify
  --form-control-color: hotpink;

  ${SmallTitle} + * {
    margin-top: 1rem;
  }

  ${SmallTitle} + * ~ * {
    margin-top: 0.5rem;
  }

  h4 {
    font-variation-settings: 'wght' 650, 'wdth' 120;
  }

  fieldset {
    @apply flex;
  }

  label {
    width: fit-content;

    &:hover {
      @apply cursor-pointer;
    }

    > input:first-child {
      margin-right: 0.5rem;
    }

    + label {
      margin-left: 1rem;
    }
  }

  input {
    appearance: none;
  }
`;
