import _ from 'lodash';
import * as React from 'react';
import { styled } from 'linaria/react';
import VisuallyHidden from '@reach/visually-hidden';

const BaseButton = styled.button`
  background: hotpink;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
`;

export const PrimaryAction = styled(
  (props: React.HTMLAttributes<HTMLButtonElement>) => {
    // todo - somehow share the "once keyboard-focused, ignore the visually hidden" logic?

    return <>
      <BaseButton aria-hidden {..._.omit(props, 'children')}>
        {props.children}
      </BaseButton>
      <VisuallyHidden>
        <button {..._.omit(props, 'children')}>
          {props.children}
        </button>
      </VisuallyHidden>
    </>;
  }
)`
  background: hotpink;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
`;

