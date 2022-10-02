import * as React from 'react';
import { styled } from '@linaria/react';

import * as data from '@src/data';
import { useNextPreviousShortcuts } from '@src/hooks/use-next-previous-shortcuts';

import * as stripe from '@src/components/Stripe';
import * as modal from '@src/parts/Modal';
import * as ASCII from '@src/parts/ASCII';
import * as text from '@src/parts/Text';

const PACKAGE_CONFIGS: Readonly<Record<
  data.PackageOption,
  Readonly<{ label: React.ReactNode; price: number }>
>> = Object.freeze({
  '5bit': { label: '5-bit', price: 3200 },
  '1byte': { label: '1-byte', price: 25600 },
} as const);

const SmallTitle = styled(ASCII.Title)`
  @apply text-center;
  font-size: 0.5rem;
`;

const InnerModal = (props: Omit<Parameters<typeof modal.Modal>[0], 'children'>) => {
  const [canTabIntoOptions, setCanTabIntoOptions] = React.useState(true);
  const packageOptionsRef = React.useRef<HTMLFieldSetElement>(null);
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(data.PACKAGE_OPTIONS[0]);
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

    newOption.focus();
    newOption.click();
  }, [selectedOption]);

  // const focusCurrentOption = React.useCallback(() => {
  //   const options = packageOptionsRef.current?.querySelectorAll('input[type="radio"][name="package_option"]') as NodeListOf<HTMLInputElement>;
  //   const currentOptionIndex = data.PACKAGE_OPTIONS.findIndex((option) => option === selectedOption);

  //   options[currentOptionIndex].focus();
  // }, [selectedOption]);

  const onSelectOption = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const option = event.target.value as data.PackageOption;

    if (option && data.PACKAGE_OPTIONS.includes(option)) {
      setSelectedOption(option);
    }
  }, []);

  React.useEffect(() => {
    const onFocusEvent = (event: FocusEvent) => {
      console.log(event);
      if (event.type === 'focusin' && packageOptionsRef.current?.contains(event.target as HTMLElement)) {
        console.log('in if');
        packageOptionsRef.current?.removeAttribute('tabindex');
        packageOptionsRef.current?.querySelectorAll('input,label')?.forEach((element) => element.removeAttribute('tabindex'));
        setCanTabIntoOptions(true);
      } else if (event.type === 'focusout' && !packageOptionsRef.current?.contains(event.relatedTarget as HTMLElement)) {
        console.log('in else');
        packageOptionsRef.current?.setAttribute('tabindex', '-1');
        packageOptionsRef.current?.querySelectorAll('input,label')?.forEach((element) => element.setAttribute('tabindex', '-1'));
        setCanTabIntoOptions(false);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (packageOptionsRef.current.contains(document.activeElement) && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();

        const iframe = packageOptionsRef.current.parentElement.parentElement
          .querySelector('.StripeElement iframe') as HTMLIFrameElement;

        iframe?.focus();
      }
    };

    if (props.isOpen) {
      window.addEventListener('keydown', onKeyDown, true);
      document.addEventListener('focusin', onFocusEvent);
      document.addEventListener('focusout', onFocusEvent);
      packageOptionsRef.current?.querySelector('input')?.focus();
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusEvent);
      document.removeEventListener('focusout', onFocusEvent);
    };
  }, [props.isOpen]);

  useNextPreviousShortcuts(goToOption, canTabIntoOptions);

  return (
    <modal.Modal {...props} aria-label="Purchase The Tale of the Big Computer">
      <SmallTitle />
      <stripe.Context amount={PACKAGE_CONFIGS[selectedOption].price}>
        <form onSubmit={(event) => event.preventDefault()}>
          <section>
            <h4>Select your presales package:</h4>
            <fieldset ref={packageOptionsRef}>
              {data.PACKAGE_OPTIONS.map(option => {
                const { label } = PACKAGE_CONFIGS[option];

                return (
                  <label key={option}>
                    <input
                      type="radio"
                      name="package_option"
                      value={option}
                      checked={selectedOption === option}
                      onChange={onSelectOption}
                    />
                    {typeof label === 'string' ? <span>{label}</span> : label}
                  </label>
                );
              })}
            </fieldset>
          </section>
          <section>
            <h4>Goodies</h4>
            <ul>
              {/* todo - tooltip */}
              <li>Unlimited* DRM-free ebook downloads</li>
              <li>1x copy of the book, once printed (hardcover or softcover)</li>
              <text.StrikeThrough asContainer="li" isStruckThrough={selectedOption !== '1byte'}>
              1x copy of a limited, numbered edition of the book (0x00 - 0xff)
              </text.StrikeThrough>
              {/* todo - tooltip for above =  printed by a modified IBM Selectric I */}
              <text.StrikeThrough asContainer="li" isStruckThrough={selectedOption !== '1byte'}>More goodies to be announced...</text.StrikeThrough>
            </ul>
          </section>
          <section>
            <h4>Shipping</h4>
            <ul>
              <text.StrikeThrough asContainer="li" isStruckThrough={selectedOption !== '1byte'}>Free shipping</text.StrikeThrough>
              <li>Free pickup at participating local bookstores (US + Canada only)</li>
            </ul>
          </section>
          <section>
            <h4>Customer</h4>
            <label>
              Email address
              <input type="email" required placeholder="ada@lovela.ce" />
            </label>
          </section>
          {/*<section>
            <h4>Payment</h4>
            <stripe.Payment onEscape={focusCurrentOption} />
          </section>
          */}
          <button type="submit">
            Proceed to payment (${Math.round(PACKAGE_CONFIGS[selectedOption].price / 100)})
          </button>
        </form>
      </stripe.Context>
    </modal.Modal>
  );
};

export const Modal = styled(InnerModal)`
  // todo - linaria'ify
  --form-control-color: hotpink;

  ${SmallTitle} + p {
    margin-top: 1rem;
    font-size: 0.875rem;
    opacity: 0.7;
  }

  ${SmallTitle} + p ~ *, ol ~ * {
    margin-top: 0.5rem;
  }

  fieldset {
    @apply flex justify-center;

    &::after {
      @apply absolute right-0;

      content: 'Press <esc> to refocus options';
    }

    &:focus-within::after {
      content: 'Press <enter> to select';
    }
  }

  fieldset > label {
    @apply flex;
    width: fit-content;

    &:focus, &:focus-within {
      color: var(--form-control-color);
    }

    &:hover {
      @apply cursor-pointer underline;

      color: ${({ isOpen }) => isOpen ? 'crimson' : 'inherit'};
    }

    &[aria-selected="true"] {
      @apply underline;
      color: ${({ isOpen }) => isOpen ? 'hotpink' : 'inherit'};
    }

    + label {
      margin-left: 2rem;
    }

    > .price {
      &::before {
        content: '(';
        filter: opacity(0.2) brightness(5.5);
      }

      &::after {
        content: ')';
        filter: opacity(0.2) brightness(5.5);
      }

      filter: saturate(0.5) brightness(0.9) hue-rotate(120deg);
    }
  }

  input[type="radio"] {
    // clear default display
    appearance: none;
    background-color: transparent;
    margin: 0;

    // style a circle relative to the font size
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 0.15em solid currentColor;
    border-radius: 50%;
    transform: translateY(0.17em) translateX(-0.65em);

    // align our ::before content with the circle border
    display: grid;
    place-content: center;

    // style the default fill; with scale === 0 to hide-by-default
    &::before {
      content: "";
      width: 0.65em;
      height: 0.65em;
      border-radius: 50%;
      transform: scale(0);
      transition: 0.07s transform ease-in;
      box-shadow: inset 1em 1em var(--form-control-color);
    }

    // show our fill when checked
    &:checked::before {
      transform: scale(1);
    }

    // add an extra "focus" ring
    :focus {
      outline: max(2px, 0.15em) solid currentColor;
      outline-offset: max(2px, 0.15em);
    }

    &:checked + * {
      text-decoration: underline;
    }
  }
`;

