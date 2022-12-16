import * as React from 'react';
import { styled } from '@linaria/react';

const BaseInput = styled.input`
  appearance: none;
  // clear default display
  background-color: transparent;
  color: inherit;
  caret-color: transparent;
  // todo - mobile
  width: 0;

  + span {
    @apply inline-block cursor-text;
    word-wrap: break-word;

    &::before {
      content: '> ';
      opacity: 0.6;
    }

    &::selection {
      background-color: white;
      color: black;
    }
  }
`;

const Cursor = styled.span<{ position?: number }>`
  @apply inline-block;

  position: absolute;
  background: var(--text-color, rgba(255, 255, 255, 0.8));
  content: '';
  width: 1ch;
  height: 1rem;
  visibility: visible;

  margin-top: 3px;
  margin-bottom: -4px;

  &.run-animation {
    animation: blink 1s step-end infinite;
  }

  &.hide {
    visibility: hidden;
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

type BaseInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
// `email` inputs do not report their cursor positions
type InvalidType = 'email';
type Props = Omit<BaseInputProps, 'type' | 'value'> & {
  inputRef?: React.MutableRefObject<HTMLInputElement>
  type: Exclude<BaseInputProps['type'], InvalidType>;
  value: string;
};

export const TypeyInput = (props: Partial<Props>) => {
  const { inputRef = React.useRef<HTMLInputElement>(null), onChange, ...restOfProps } = props;
  const [value, setValue] = React.useState<string>(props.value ?? '');
  const [cursorPosition, setCursorPosition] = React.useState<number>(0);

  const wrappedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setValue(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  React.useEffect(() => {
    const cursor = inputRef.current
      ?.parentElement
      ?.querySelector(`.${Cursor.__linaria.className}`) as HTMLSpanElement;

    if (!cursor) {
      return;
    }

    const updateCursor = () => requestAnimationFrame(
      () => setCursorPosition(inputRef.current?.selectionStart ?? 0)
    );

    const startBlinking = () => {
      cursor?.classList.add('run-animation');
      cursor?.classList.remove('hide');
    };

    const stopBlinking = () => {
      cursor?.classList.remove('run-animation');
      cursor?.classList.add('hide');
    };

    const onSelectionChange = () => {
      const selection = document.getSelection();
      const isRelatedSpan = selection.anchorNode && (
        selection.anchorNode === cursor.parentElement ||
        selection.anchorNode.parentElement === cursor.parentElement
      );

      if (!isRelatedSpan) {
        return;
      }

      const startIndex = selection.anchorNode.previousSibling === cursor
        ? selection.anchorOffset
        : selection.anchorOffset + cursorPosition;
      // make sure to strip any trailing `\n`, in case of full-line highlights
      const selectionLength = selection.toString().replace(/[\n]$/, '').length;

      inputRef.current.setSelectionRange(startIndex, startIndex + selectionLength);
      inputRef.current.focus();
    };

    inputRef.current.addEventListener('keydown', updateCursor, { passive: true });
    inputRef.current.addEventListener('mousedown', updateCursor, { passive: true });
    inputRef.current.addEventListener('focusin', startBlinking, { passive: true });
    inputRef.current.addEventListener('focusout', stopBlinking, { passive: true });
    document.addEventListener('selectionchange', onSelectionChange, { passive: true });

    () => {
      inputRef.current.removeEventListener('keydown', updateCursor);
      inputRef.current.removeEventListener('mousedown', updateCursor);
      inputRef.current.removeEventListener('focusin', startBlinking);
      inputRef.current.removeEventListener('focusout', stopBlinking);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  // manage cursor blinking
  React.useEffect(() => {
    const cursor = inputRef.current
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

      if (document.activeElement === inputRef.current) {
        cursor.classList.add('run-animation');
        cursor.classList.remove('hide');
      } else {
        cursor.classList.add('hide');
      }

      if (cursorX > (boundingX + boundingWidth)) {
        cursor.style.left = '0';
        cursor.style.transform = `translateY(calc(${cursorY - boundingY + 1}px + 1.5rem))`;
      }
    });
  }, [cursorPosition]);

  // TODO - clicking on the span should move the cursor to the correct position
  const prefix = value.slice(0, cursorPosition).replace(/\s/g, '\xa0');
  const suffix = value.slice(cursorPosition).replace(/\s/g, '\xa0');

  return <>
    <BaseInput ref={inputRef} onChange={wrappedOnChange} {...restOfProps} />
    <span className="relative w-full">{prefix}&zwj;<Cursor className="run-animation" />&zwj;{suffix}</span>
  </>;
};

const _Radio = (props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) => (
  <input type="radio" {...props} />
);

export const Radio = styled(_Radio)`
  appearance: none;
  width: fit-content;

  // underline focused, hovered, & checked text
  &:focus + *,
  &:hover + *,
  &:checked + * {
    @apply underline;
  }

  // set color on checked text
  &:checked + * {
    color: var(--form-control-color);
  }
`;
