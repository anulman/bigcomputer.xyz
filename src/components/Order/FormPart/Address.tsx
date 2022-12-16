import * as React from 'react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as rxHooks from 'observable-hooks';
import { styled } from '@linaria/react';
import * as mapbox from '@src/utils/mapbox';

import * as order from '@src/components/Order';
import * as form from '@src/parts/Form';
import * as input from '@src/parts/Input';
import * as text from '@src/parts/Text';

import { useNextPreviousShortcuts } from '@src/hooks/use-next-previous-shortcuts';

const Suggestion = styled(input.Radio)`
  // style the radio button alternative
  &::before {
    content: '>';
  }

  // by default show suggestions with low opacity
  &::before, + * {
    opacity: 0.4;
    transition: 0.1s opacity ease-out;
  }

  // turn lighter when checked
  &:checked::before, &:checked + * {
    opacity: 0.7;
  }
`;

export const AddressForm = () => {
  const addressValueRef$ = React.useRef(new rxjs.Subject<string>());
  const optionsRef = React.useRef<HTMLUListElement>(null);
  const [currentOptionIndex, setCurrentOptionIndex] = React.useState(0);

  const { submitFormPart } = form.useMultipartContext();
  const { patchOrder } = order.useFormContext();
  const shouldTryAutocomplete = (value: string) => value.length > 4 && value.split(' ')[1]?.length >= 1;
  const suggestions = rxHooks.useObservableState(
    rxjs.merge(
      addressValueRef$.current.pipe(
        rx.filter((value) => shouldTryAutocomplete(value)),
        rx.throttleTime(50, rxjs.asyncScheduler, { leading: true, trailing: true }),
        rx.switchMap((value) => {
          const results = mapbox.search(value);

          return rxjs.from(results).pipe(rx.finalize(() => results.abort()));
        }),
      ),
      addressValueRef$.current.pipe(
        rx.filter((value) => !shouldTryAutocomplete(value)),
        rx.map(() => []),
      )
    ) as rxjs.Observable<mapbox.Address[]>,
    [],
  );

  const onSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const afterSubmit = submitFormPart(event);
    const address = suggestions[currentOptionIndex];
    const formattedAddress = new FormData(event.target as HTMLFormElement).get('address');

    if (address?.full_address !== formattedAddress) {
      // TODO - sentry
      console.error('Address mismatch', address.full_address, formattedAddress);
      afterSubmit.setError('Address did not match; please try again.');
      return;
    }

    patchOrder({ address, shouldSubmit: true })
      .then(afterSubmit.setSuccess)
      .catch(afterSubmit.setError);
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

  return <form.FormPart onSubmit={onSubmit}>
    <section>
      <label className="w-full">
        <h4>
          What is your civic address?
          <text.Instruction>
            {' '}(&lt;enter&gt; to select)
          </text.Instruction>
        </h4>
        <input.TypeyInput required type="search" onChange={(e) => addressValueRef$.current.next(e.target.value)} />
      </label>
      <ul ref={optionsRef}>
        {suggestions.map((suggestion, index) => <li key={suggestion.full_address}>
          <label>
            <Suggestion
              name="address"
              checked={index === currentOptionIndex}
              onChange={() => setCurrentOptionIndex(index)}
              value={suggestion.full_address} />
            <span>{suggestion.full_address}</span>
            {index !== currentOptionIndex ? null : <span className="instruction">
              {' '}(&lt;enter&gt; to select)
            </span>}
          </label>
        </li>)}
      </ul>
    </section>
  </form.FormPart>;
};
