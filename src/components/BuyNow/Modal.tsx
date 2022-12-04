import * as React from 'react';
import { styled } from '@linaria/react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as rxHooks from 'observable-hooks';

import { useNextPreviousShortcuts } from '@src/hooks/use-next-previous-shortcuts';

import * as data from '@src/data/';
import * as stripe from '@src/components/Stripe';
import * as modal from '@src/parts/Modal';
import * as ASCII from '@src/parts/ASCII';
import * as input from '@src/parts/Input';
import * as text from '@src/parts/Text';
import * as radar from '@src/utils/radar';

if (typeof window !== 'undefined') {
  // @ts-expect-error 2304
  window.searchRadar = radar.search;
}

const DEFAULT_PACKAGE = '5bit';

const SmallTitle = styled(ASCII.Title)`
  @apply text-center;
  font-size: 0.5rem;
`;

const InnerModal = (props: Omit<Parameters<typeof modal.Modal>[0], 'children'>) => {
  return (
    <modal.Modal {...props} aria-label="Purchase The Tale of the Big Computer">
      <SmallTitle />
      <stripe.OrderContext defaultItems={data.PACKAGE_CONFIGS[DEFAULT_PACKAGE].id}>
        <OrderForm />
      </stripe.OrderContext>
    </modal.Modal>
  );
};

const StyledFirstForm = styled.form`
  input[type="radio"] {
    appearance: none;
    width: fit-content;

    // align our ::before content with the circle border
    display: grid;
    place-content: center;

    // style the radio button alternative
    &::before {
      content: '🤖';
      transform: scale(0.4);
      transition: 0.1s transform ease-out;
    }

    // grow our head when checked
    &:checked::before {
      transform: scale(1.5);
      transition-delay: 0.07s;
    }

    // underline focused, hovered, & checked text
    :focus + *,
    :hover + *,
    &:checked + * {
      @apply underline;
    }

    // set color on checked text
    &:checked + * {
      color: var(--form-control-color);
    }
  }
`;

const FirstFormPart = ({ onSelectedOption, onSubmit, ...props }: {
  onSelectedOption: (option: data.PackageOption) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
} & React.HTMLAttributes<HTMLFormElement>) => {
  const packageOptionsRef = React.useRef<HTMLFieldSetElement>(null);
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(DEFAULT_PACKAGE);
  const { patchOrder } = stripe.useOrderContext();

  const goToOption = React.useCallback((direction: 'next' | 'previous') => {
    const options = packageOptionsRef.current?.querySelectorAll('input[type="radio"][name="package_option"]') as NodeListOf<HTMLInputElement>;
    if (!options) {
      return;
    }

    const currentOptionIndex = data.PACKAGE_OPTIONS.findIndex((option) => option === selectedOption);
    const newOptionIndex = direction === 'next'
      ? (currentOptionIndex + 1) % options.length
      : (currentOptionIndex - 1) < 0 ? options.length - 1 : currentOptionIndex - 1;

    const newOption = options[newOptionIndex];
    options.forEach((option) => {
      if (option === newOption) {
        setSelectedOption(option.value as data.PackageOption);
        option.setAttribute('checked', '');
      } else {
        option.removeAttribute('checked');
      }
    });

    // todo - merge these!
    onSelectedOption(newOption.value as data.PackageOption);
    patchOrder({ items: data.PACKAGE_CONFIGS[newOption.value as data.PackageOption].id });
    // emailInputRef.current?.focus();
  }, [selectedOption]);

  const onSelectOption = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const option = event.target.value as data.PackageOption;

    if (option && data.PACKAGE_OPTIONS.includes(option)) {
      patchOrder({ items: data.PACKAGE_CONFIGS[option].id });
    }
  }, []);

  // todo - rehydrate email?
  const wrappedOnSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const option = formData.get('package_option');
    const email = formData.get('email') as string;

    if (option !== selectedOption) {
      console.error('Selection mismatch', option, selectedOption);
    }

    patchOrder({ email, items: data.PACKAGE_CONFIGS[selectedOption].id })
      .then(() => onSubmit(event));
  }, [onSubmit]);

  useNextPreviousShortcuts(goToOption, { useArrows: false, canUseChars: false });

  return (
    <StyledFirstForm onSubmit={wrappedOnSubmit} {...props}>
      <section>
        <h4>
          Select your presales package:
          <span className="instruction">
            {/* todo - instruction-style text */}
            {' '}(&lt;tab&gt; to toggle)
          </span>
        </h4>
        <fieldset className="flex" ref={packageOptionsRef}>
          {data.PACKAGE_OPTIONS.map(option => {
            const { label, price } = data.PACKAGE_CONFIGS[option];

            return (
              <label className="flex" key={option} aria-selected={selectedOption === option}>
                <input
                  type="radio"
                  name="package_option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={onSelectOption}
                />
                {typeof label === 'string' ? <span>{label}</span> : label}
                &nbsp;(${Math.round(price / 100)})
              </label>
            );
          })}
        </fieldset>
      </section>
      <section>
        <label className="w-full">
          <h4>What is your email address?
            <span className="instruction">
              {/* todo - instruction-style text */}
              {' '}(&lt;enter&gt; to continue)
            </span>
          </h4>
          <input.TypeyInput name="email" required />
        </label>
      </section>
    </StyledFirstForm>
  );
};

const StyledSecondForm = styled.form`
  input[type="radio"] {
    appearance: none;
    width: fit-content;

    // align our ::before content with the circle border
    place-content: center;

    // style the radio button alternative
    &::before {
      content: '>';
    }

    &::before, + * {
      opacity: 0.4;
      color: white;
      transition: 0.1s opacity ease-out;
    }

    // turn lighter when checked
    &:checked::before, &:checked + * {
      opacity: 0.7;
    }

    // underline focused, hovered, & checked text
    :focus + *,
    :hover + *,
    &:checked + * {
      @apply underline;
    }
  }
`;

const SecondFormPart = ({ onSubmit }: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  const addressValueRef$ = React.useRef(new rxjs.Subject<string>());
  const optionsRef = React.useRef<HTMLUListElement>(null);
  const [currentOptionIndex, setCurrentOptionIndex] = React.useState(0);

  const { patchOrder } = stripe.useOrderContext();
  const shouldTryAutocomplete = (value: string) => value.length > 4 && value.split(' ')[1]?.length >= 1;
  const suggestions = rxHooks.useObservableState(
    rxjs.merge(
      addressValueRef$.current.pipe(
        rx.filter((value) => shouldTryAutocomplete(value)),
        rx.throttleTime(50, rxjs.asyncScheduler, { leading: true, trailing: true }),
        rx.switchMap((value) => {
          const results = radar.search(value);

          return rxjs.from(results).pipe(rx.finalize(() => results.abort()));
        }),
      ),
      addressValueRef$.current.pipe(
        rx.filter((value) => !shouldTryAutocomplete(value)),
        rx.map(() => []),
      )
    ) as rxjs.Observable<radar.Address[]>,
    [],
  );

  const wrappedOnSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = suggestions[currentOptionIndex];
    const formattedAddress = new FormData(event.target as HTMLFormElement).get('address');

    if (address?.formattedAddress !== formattedAddress) {
      // TODO - sentry
      console.error('Address mismatch', address.formattedAddress, formattedAddress);
    }

    // TODO - patch selected address into the order
    patchOrder({ address, shouldSubmit: true })
      .then(() => onSubmit(event));
  }, [suggestions, currentOptionIndex]);

  React.useEffect(() => {
    if (!suggestions || suggestions.length === 0) {
      setCurrentOptionIndex(0);
    } else if (currentOptionIndex > suggestions.length - 1) {
      setCurrentOptionIndex(suggestions.length - 1);
    }
  }, [suggestions, currentOptionIndex]);

  const goToOption = React.useCallback((direction: 'next' | 'previous') => {
    const newOptionIndex = direction === 'next'
      ? (currentOptionIndex + 1) % suggestions.length
      : (currentOptionIndex - 1) < 0 ? suggestions.length - 1 : currentOptionIndex - 1;

    setCurrentOptionIndex(newOptionIndex);
  }, [suggestions, currentOptionIndex]);

  React.useEffect(() => {
    const options = optionsRef.current?.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    options?.forEach((option, index) => {
      if (index === currentOptionIndex) {
        option.setAttribute('checked', '');
      } else {
        option.removeAttribute('checked');
        option.blur();
      }
    });
  }, [currentOptionIndex]);

  useNextPreviousShortcuts(goToOption, { useArrows: 'vertical', charsRequireCtrl: true });

  return <StyledSecondForm onSubmit={wrappedOnSubmit}>
    <section>
      <label className="w-full">
        <h4>
          What is your civic address?
          <span className="instruction">
            {/* todo - instruction-style text */}
            {' '}(&lt;enter&gt; to select)
          </span>
        </h4>
        <input.TypeyInput required type="search" onChange={(e) => addressValueRef$.current.next(e.target.value)} />
      </label>
      <ul ref={optionsRef}>
        {suggestions.map((suggestion, index) => <li key={suggestion.formattedAddress}>
          <label>
            <input
              type="radio"
              name="address"
              checked={index === currentOptionIndex}
              onChange={() => setCurrentOptionIndex(index)}
              value={suggestion.formattedAddress} />
            <span>{suggestion.formattedAddress}</span>
            {index !== currentOptionIndex ? null : <span className="instruction">
              {' '}(&lt;enter&gt; to select)
            </span>}
          </label>
        </li>)}
      </ul>
    </section>
  </StyledSecondForm>;
};

const OrderForm = () => {
  const { order$ } = stripe.useOrderContext();
  const [selectedOption, setSelectedOption] = React.useState(DEFAULT_PACKAGE);
  const [currentFormPart, setCurrentFormPart] = React.useState(0);
  const [highestFormPart, setHighestFormPart] = React.useState(currentFormPart);

  const order = rxHooks.useObservableState(order$, null);
  rxHooks.useSubscription(order$, console.log.bind(console, 'subscription!!'));

  React.useEffect(() => {
    if (currentFormPart > highestFormPart) {
      setHighestFormPart(currentFormPart);
    }
  }, [currentFormPart, highestFormPart]);

  return (
    <>
      <FirstFormPart onSelectedOption={setSelectedOption} onSubmit={() => setCurrentFormPart(1)} />
      {highestFormPart < 1 ? (
        <>
          <section className="border-dashed border-2 mt-3 p-2">
            <h4 className="mb-1 underline" >Goodies</h4>
            <ul>
              {/* todo - tooltip */}
              <li>Unlimited* DRM-free ebook downloads</li>
              <li>1x copy of the book, once printed (hardcover or softcover)</li>
              <text.StrikeThrough asContainer="li" isStruckThrough={selectedOption !== '1byte'}>
            1x copy of a limited, numbered edition of the book (0x00 - 0xff)
              </text.StrikeThrough>
              {/* todo - tooltip for above =  printed by a modified IBM Selectric I */}
            </ul>
          </section>
          <section className="border-dashed border-2 mt-3 p-2">
            <h4 className="mb-1 underline">Shipping</h4>
            <ul>
              <text.StrikeThrough asContainer="li" isStruckThrough={selectedOption !== '1byte'}>Free shipping</text.StrikeThrough>
              <li>Free pickup at participating local bookstores (US + Canada only)</li>
            </ul>
          </section>
          <section>
            <button type="submit">
            Proceed to payment (${Math.round(data.PACKAGE_CONFIGS[selectedOption].price / 100)})
            </button>
          </section>
        </>
      ) : (
        <SecondFormPart onSubmit={() => setCurrentFormPart(2)} />
      )}
      {highestFormPart < 2 || !order ? null : (
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
      )}
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

  .instruction {
    font-size: 0.875rem;
    opacity: 0.7;
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
