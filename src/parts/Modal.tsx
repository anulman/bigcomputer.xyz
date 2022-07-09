import * as React from 'react';
import _ from 'lodash';
import { styled } from 'linaria/react';
import * as Dialog from '@reach/dialog';

type RequiredKey<T, K extends keyof T> = Required<Record<K, T[K]>> & T;
type Props = React.PropsWithChildren<
  Dialog.DialogProps
  & React.HTMLAttributes<HTMLDivElement>
  & { anchorRect?: DOMRect }
>;

export const Modal = styled<Props>(
  ({ children, ...props }: RequiredKey<Props, 'children'>) => (
    <Dialog.DialogOverlay {..._.omit(props, 'anchorRect')}>
      <Dialog.DialogContent>
        {children}
      </Dialog.DialogContent>
    </Dialog.DialogOverlay>
  )
)`
  @apply fixed;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  &::before {
    // use a pseudo element to separate the stacking context & layer backdrop-filters
    content: '';
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    backdrop-filter: blur(2px) hue-rotate(-120deg) brightness(125%);
    z-index: 0;
  }

  > [data-reach-dialog-content] {
    @apply absolute;
    --width: ${({ anchorRect }) => anchorRect ? `${anchorRect.width}px` : '100vw'};
    --top: ${({ anchorRect }) => anchorRect ? `${anchorRect.top}px` : '0'};

    background: #ffffff33
    backdrop-filter: blur(4px) brightness(60%) opacity(0.8);

    color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 1rem;

    width: var(--width, 100vw);
    left: calc((100% - var(--width, 100vw)) / 2);
    top: var(--top, 0);

    max-height: 85vh;
    overflow-y: scroll;
    z-index: 1;
  }
`;
