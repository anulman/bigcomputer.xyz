import * as React from 'react';
import { styled } from 'linaria/react';
import * as windups from 'windups';
import VisuallyHidden from '@reach/visually-hidden';

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & {
  isPaused: boolean;
}>;

const BEAT_MS = 300;

export const Content = styled<Props>(({ children, isPaused = false, ...props }) => {
  const divRef = React.useRef<HTMLDivElement>();
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setHasStarted(true), 4 * BEAT_MS);
    divRef.current.classList.add('run-animation');
    divRef.current.addEventListener('focusin', () => {
      // if we've focused in here, we're not on a device that ignores `aria-hidden`.
      // this means we can ignore our `<VisuallyHidden>` contents in the tabindex
      divRef.current.nextElementSibling.querySelectorAll('button, a')
        .forEach((child) => child.setAttribute('tabindex', '-1'));
    });
  }, []);

  const triggerReflow = React.useCallback(() => {
    divRef.current.classList.remove('run-animation');
    void divRef.current.offsetWidth;
    divRef.current.classList.add('run-animation');
  }, []);

  return <>
    <div aria-hidden ref={divRef} {...props}>
      <span />
      <windups.WindupChildren isPaused={!hasStarted || isPaused}>
        <windups.OnChar fn={triggerReflow}>
          {children}
        </windups.OnChar>
      </windups.WindupChildren>
    </div>
    <VisuallyHidden>{children}</VisuallyHidden>
  </>;
})`
  > :last-child::after {
    @apply inline-block;

    background: var(--text-color, rgba(255, 255, 255, 0.8));
    content: '';
    width: 1ch;
    height: 1rem;

    margin-top: 3px;
    margin-bottom: -4px;
  }

  &.run-animation > :last-child::after {
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
`;

export const Beat = (numBeats = 1) => <windups.Pause ms={numBeats * BEAT_MS} />;
