import { styled } from '@linaria/react';

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
