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

const Cursor = styled.span<{ position?: number }>`
  @apply inline-block;

  position: absolute;
  background: var(--text-color, rgba(255, 255, 255, 0.8));
  content: '';
  width: 1ch;
  height: 1rem;

  margin-top: 3px;
  margin-bottom: -4px;

  &.run-animation {
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0% {
      opacity: 1.0;
    }

    25% {
      opacity: 0.0;
    }

    75% {
      opacity: 1.0;
    }
  }
}
`;

const InnerModal = (props: Omit<Parameters<typeof modal.Modal>[0], 'children'>) => {
  const packageOptionsRef = React.useRef<HTMLFieldSetElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(data.PACKAGE_OPTIONS[0]);
  const [email, setEmail] = React.useState<string>('');
  const [cursorPosition, setCursorPosition] = React.useState<number>(0);
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

    emailInputRef.current?.focus();
  }, [selectedOption]);

  React.useEffect(() => {
    const updateCursor = () => requestAnimationFrame(() => setCursorPosition(emailInputRef.current?.selectionStart ?? 0));

    document.addEventListener('keydown', updateCursor, { passive: true });
    document.addEventListener('mousedown', updateCursor, { passive: true });

    () => {
      document.removeEventListener('keydown', updateCursor);
      document.removeEventListener('mousedown', updateCursor);
    };
  }, []);

  // manage cursor blinking
  React.useEffect(() => {
    const cursor = emailInputRef.current
      ?.parentElement
      ?.querySelector(`.${Cursor.__linaria.className}`) as HTMLSpanElement;

    if (!cursor) {
      return;
    }

    cursor.classList.remove('run-animation');
    requestAnimationFrame(() => {
      const { x: cursorX, y: cursorY } = cursor.getBoundingClientRect();
      const { x: boundingX, y: boundingY, width: boundingWidth } = cursor.parentElement.getBoundingClientRect();

      cursor.style.left = null;
      cursor.style.transform = null;

      cursor.classList.add('run-animation');

      console.log(cursorX, boundingX + boundingWidth);
      if (cursorX > (boundingX + boundingWidth)) {
        console.log('hieeeiei');
        cursor.style.left = '0';
        cursor.style.transform = `translateY(calc(${cursorY - boundingY + 1}px + 1.5rem))`;
      }
    });
  }, [cursorPosition]);

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
    emailInputRef.current?.focus();
  }, [emailInputRef]);

  const [didSubmit, setDidSubmit] = React.useState(false);
  const onSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDidSubmit(true);
  }, []);

  useNextPreviousShortcuts(goToOption, { canUseArrows: false, canUseChars: false });

  return (
    <modal.Modal {...props} aria-label="Purchase The Tale of the Big Computer">
      <SmallTitle />
      <form onSubmit={onSubmit}>
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
              const { label, price } = PACKAGE_CONFIGS[option];

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
            {/* todo - add validation */}
            <input required type={/* todo - `email` on mobile */'text'}
              ref={emailInputRef}
              onChange={(e) => {
                setEmail(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }} />
            <span className="relative w-full">{email.slice(0, cursorPosition)}&zwj;<Cursor className="run-animation" />&zwj;{email.slice(cursorPosition)}</span>
          </label>
        </section>
        {didSubmit ? null : (<>
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
            Proceed to payment (${Math.round(PACKAGE_CONFIGS[selectedOption].price / 100)})
            </button>
          </section>
        </>)}
      </form>
      {!didSubmit ? null : (<>
        <stripe.Context amount={PACKAGE_CONFIGS[selectedOption].price}>
          <stripe.Form email={email}>
            <section>
              <h4>Payment</h4>
              <stripe.Payment options={{ fields: { billingDetails: { email: 'never' } } }} />
            </section>
            <section>
              <button type="submit">
            Purchase {PACKAGE_CONFIGS[selectedOption].label} package (${Math.round(PACKAGE_CONFIGS[selectedOption].price / 100)})
              </button>
            </section>
          </stripe.Form>
        </stripe.Context>
      </>)}
    </modal.Modal>
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
    // clear default display
    background-color: transparent;
    color: inherit;
    caret-color: transparent;
    // todo - mobile
    width: 0;

    &::selection {
      background-color: white;
      color: black;
    }
  }

  input[type="text"] {
    + span {
      @apply inline-block;
      word-wrap: break-word;
    }
  }

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

