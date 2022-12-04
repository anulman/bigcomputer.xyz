import * as React from 'react';
import { styled } from '@linaria/react';

import * as data from '@src/data';
import * as stripe from '@src/components/Stripe';
import * as input from '@src/parts/Input';
import * as text from '@src/parts/Text';

import { useNextPreviousShortcuts } from '@src/hooks/use-next-previous-shortcuts';

const Styled = styled.form`
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

export const PackageAndEmailForm = ({ isActive = false, onSelectedOption, onSubmit, ...props }: {
  isActive?: boolean;
  onSelectedOption: (option: data.PackageOption) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
} & React.HTMLAttributes<HTMLFormElement>) => {
  const packageOptionsRef = React.useRef<HTMLFieldSetElement>(null);
  const [selectedOption, setSelectedOption] = React.useState<data.PackageOption>(data.DEFAULT_PACKAGE);
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
    <Styled onSubmit={wrappedOnSubmit} {...props}>
      <section>
        <h4>
          Select your presales package:
          <text.Instruction>
            {' '}(&lt;tab&gt; to toggle)
          </text.Instruction>
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
            <text.Instruction>
              {' '}(&lt;enter&gt; to continue)
            </text.Instruction>
          </h4>
          <input.TypeyInput name="email" required />
        </label>
      </section>
      {!isActive ? null : (
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
        </>
      )}
    </Styled>
  );
};

