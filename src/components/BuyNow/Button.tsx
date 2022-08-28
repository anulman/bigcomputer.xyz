import _ from 'lodash';
import * as React from 'react';
import { styled } from 'linaria/react';

import * as button from '@src/parts/Button';

export const Button = styled<
  React.HTMLAttributes<HTMLButtonElement> & { isShowing?: boolean }
>(
  (props) =>
    <button.PrimaryAction {..._.omit(props, 'isShowing', 'children')}>
      Buy Now
    </button.PrimaryAction>
)`
  pointer-events: ${({ isShowing }) => isShowing ? 'auto' : 'none'};
  opacity: ${({ isShowing }) => isShowing ? 0.7 : 0};
  transition: opacity 0.5s ease-in;
`;
