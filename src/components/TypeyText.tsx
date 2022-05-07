import * as React from 'react';
import { styled } from 'linaria/react';
import * as windups from 'windups';
import VisuallyHidden from '@reach/visually-hidden';

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & {
  isPaused?: boolean;
  isCursorBlinking?: boolean;
  beatMs?: number;
  startDelayBeats?: number;
}>;

const DEFAULT_BEAT_MS = 300;
const DEFAULT_START_DELAY_BEATS = 4;
// const BEAT_MS = 6;

export const Content = styled<Props>(({
  children,
  isPaused = false,
  isCursorBlinking = true,
  beatMs = DEFAULT_BEAT_MS,
  startDelayBeats = DEFAULT_START_DELAY_BEATS,
  ...props
}) => {
  const divRef = React.useRef<HTMLDivElement>();
  const [hasStarted, setHasStarted] = React.useState(false);
  const [isInFastMode, setIsInFastMode] = React.useState(false);

  // delay manually with our own state, because windups seems not to respect
  // <Pause>:first-child elems
  React.useEffect(() => {
    // todo - also handle with speed-up
    setTimeout(() => setHasStarted(true), startDelayBeats * beatMs);
  }, [startDelayBeats, beatMs]);

  // ensure non-aria keyboard users can't tab through visually hidden elems
  React.useEffect(() => {
    divRef.current.addEventListener('focusin', () => {
      // if we've focused in here, we're not on a device that ignores `aria-hidden`.
      // this means we can ignore our `<VisuallyHidden>` contents in the tabindex
      divRef.current.nextElementSibling.querySelectorAll('button, a')
        .forEach((child) => child.setAttribute('tabindex', '-1'));
    });
  }, []);

  // manage fast-mode
  const turnOnFastMode = React.useCallback((event: KeyboardEvent) => {
    if (event.keyCode === 32 && !event.repeat) {
      console.log('hiiii fast mode');
      setIsInFastMode(true);
    }
  }, []);
  const turnOffFastMode = React.useCallback((event: KeyboardEvent) => {
    if (event.keyCode === 32) {
      console.log('byeeee fast mode');
      setIsInFastMode(false);
    }
  }, []);
  React.useEffect(() => {
    document.addEventListener('keydown', turnOnFastMode);
    document.addEventListener('keyup', turnOffFastMode);

    return () => {
      document.removeEventListener('keydown', turnOnFastMode);
      document.removeEventListener('keyup', turnOffFastMode);
    };
  }, []);

  // manage cursor blinking
  React.useEffect(() => {
    if (isCursorBlinking) {
      divRef.current?.classList.add('run-animation');
    }

    return () => divRef.current?.classList.remove('run-animation');
  }, [isCursorBlinking]);

  const triggerReflow = React.useCallback(() => {
    if (isCursorBlinking) {
      divRef.current.classList.remove('run-animation');
      void divRef.current.offsetWidth;
      divRef.current.classList.add('run-animation');
    }
  }, [isCursorBlinking]);
  console.log(isInFastMode);

  return <>
    <div aria-hidden ref={divRef} {...props}>
      <span />
      <windups.WindupChildren isPaused={!hasStarted || isPaused}>
        <windups.OnChar fn={triggerReflow}>
          <windups.Pace ms={isInFastMode ? 4 : null}>
            {children}
          </windups.Pace>
        </windups.OnChar>
      </windups.WindupChildren>
    </div>
    <VisuallyHidden>{children}</VisuallyHidden>
  </>;
})`
  > :last-child::after {
    @apply inline-block;

    display: ${({ isCursorBlinking = true }) => isCursorBlinking ? 'inline-block' : 'none'};
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

// todo - context
export const Beat = (numBeats = 1) => <windups.Pause ms={numBeats * DEFAULT_BEAT_MS} />;
