import * as React from 'react';
import { styled } from 'linaria/react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as windups from 'windups';
import VisuallyHidden from '@reach/visually-hidden';

import { isTouchDevice } from '@src/utils/is-touch-device';

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & {
  isPaused?: boolean;
  isCursorBlinking?: boolean;
  beatMs?: number;
  startDelayBeats?: number;
}>;

const DEFAULT_BEAT_MS = 300;
const DEFAULT_START_DELAY_BEATS = 4;
// const BEAT_MS = 6;

const onSpaceBar$ = typeof window === 'undefined'
  ? rxjs.EMPTY
  : rxjs.fromEventPattern<KeyboardEvent>(
    (handler) => window.addEventListener('keydown', handler, { capture: true }),
    (handler) => window.removeEventListener('keydown', handler, { capture: true }),
  ).pipe(
    rx.filter((event) => event.key === ' ' || event.code === 'Space' || event.keyCode === 32),
    rx.tap((event) => event.preventDefault())
  );

const onTapScreen$ = typeof window === 'undefined'
  ? rxjs.EMPTY
  : rxjs.defer(() => rxjs.race(
    rxjs.fromEventPattern<MouseEvent>(
      (handler) => window.addEventListener('mousedown', handler, { capture: true }),
      (handler) => window.removeEventListener('mousedown', handler, { capture: true }),
    ),
    rxjs.fromEventPattern<TouchEvent>(
      (handler) => window.addEventListener('touchstart', handler, { capture: true }),
      (handler) => window.removeEventListener('touchstart', handler, { capture: true }),
    ),
    rxjs.fromEventPattern<PointerEvent>(
      (handler) => window.addEventListener('pointerdown', handler, { capture: true }),
      (handler) => window.removeEventListener('pointerdown', handler, { capture: true }),
    ),
  ))
    .pipe(
      rx.filter(() => isTouchDevice),
      rx.tap((event) => event.preventDefault())
    );

const ContinuePrompt = styled.p<{ isShowing?: boolean }>`
  @apply italic;

  opacity: ${({ isShowing }) => isShowing === true ? 0.7 : 0};
  transition: opacity 0.5s ease-in;
`;

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
  const [numCompleted, setNumCompleted] = React.useState(0);
  const [isPromptingToContinue, setIsPromptingToContinue] = React.useState(false);

  // delay manually with our own state, because windups seems not to respect
  // <Pause>:first-child elems
  React.useEffect(() => {
    // todo - also handle with speed-up
    setTimeout(() => setHasStarted(true), startDelayBeats * beatMs);
  }, [startDelayBeats, beatMs]);

  // manage cursor blinking
  React.useEffect(() => {
    if (isCursorBlinking) {
      divRef.current?.classList.add('run-animation');
    }

    return () => divRef.current?.classList.remove('run-animation');
  }, [isCursorBlinking]);

  // ensure non-aria keyboard users can't tab through visually hidden elems
  React.useEffect(() => {
    divRef.current.addEventListener('focusin', () => {
      // if we've focused in here, we're not on a device that ignores `aria-hidden`.
      // this means we can ignore our `<VisuallyHidden>` contents in the tabindex
      divRef.current.nextElementSibling.querySelectorAll('button, a')
        .forEach((child) => child.setAttribute('tabindex', '-1'));
    });
  }, []);

  const triggerReflow = React.useCallback(() => {
    if (isCursorBlinking) {
      divRef.current.classList.remove('run-animation');
      void divRef.current.offsetWidth;
      divRef.current.classList.add('run-animation');
    }
  }, [isCursorBlinking]);

  const renderedChildren = React.useMemo(
    () => children instanceof Array
      ? children.slice(0, numCompleted + 1)
      : [children],
    [numCompleted],
  );

  const onWindupFinished = React.useCallback(() => {
    setIsPromptingToContinue(true);
    rxjs.race(onSpaceBar$, onTapScreen$)
      .pipe(rx.take(1), rx.tap(() => setIsPromptingToContinue(false)), rx.delay(500))
      .subscribe(() => setNumCompleted((_numCompleted) => _numCompleted + 1));
  }, []);

  return <>
    <div aria-hidden ref={divRef} {...props}>
      <span />
      {renderedChildren.map((child, index) => (
        <windups.WindupChildren
          isPaused={!hasStarted || isPaused}
          key={`typey-text-${index}`}
          onFinished={onWindupFinished}
        >
          <windups.OnChar fn={triggerReflow}>
            {child}
          </windups.OnChar>
        </windups.WindupChildren>
      ))}
    </div>

    <ContinuePrompt aria-hidden isShowing={
      isPromptingToContinue &&
      children instanceof Array &&
      (numCompleted + 1) < children.length
    }>
      {isTouchDevice
        ? <>[tap screen to continue]</>
        : <>[press spacebar to continue]</>}
    </ContinuePrompt>

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

    margin-top: 2px;
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
