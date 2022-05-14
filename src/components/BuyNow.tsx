import _ from 'lodash';
import * as React from 'react';
import { styled } from 'linaria/react';
import VisuallyHidden from '@reach/visually-hidden';

export const Button = styled<
  React.HTMLAttributes<HTMLButtonElement> &
  { isShowing?: boolean; innerRef: React.MutableRefObject<HTMLButtonElement> }
>(
  ({ innerRef, ...props }) => {
    // todo - somehow share the "once keyboard-focused, ignore the visually hidden" logic?

    return <>
      <button aria-hidden ref={innerRef} {..._.omit(props, 'isShowing')}>
        Buy Now
      </button>
      <VisuallyHidden>
        <button {..._.omit(props, 'isShowing')}>
          Buy Now
        </button>
      </VisuallyHidden>
    </>;
  }
)`
  background: hotpink;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);

  pointer-events: ${({ isShowing }) => isShowing ? 'auto' : 'none'};
  opacity: ${({ isShowing }) => isShowing ? 0.7 : 0};
  transition: opacity 0.5s ease-in;
`;
