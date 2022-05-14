import * as React from 'react';
import { styled } from 'linaria/react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as rxHooks from 'observable-hooks';
import * as windups from 'windups';
import VisuallyHidden from '@reach/visually-hidden';

import { isTouchDevice } from '@src/utils/is-touch-device';

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & {
  isPaused?: boolean;
  isCursorBlinking?: boolean;
  beatMs?: number;
  startDelayBeats?: number;
  onChildWindupWillPlay?: (childIndex: number) => unknown | Promise<unknown>;
  onChildWindupCompleted?: (childIndex: number) => unknown | Promise<unknown>;
}>;

enum ContinuePrompt {
  Desktop = 'press <spacebar> to continue',
  Mobile = 'tap screen to continue',
}

const DEFAULT_BEAT_MS = 300;
const DEFAULT_START_DELAY_BEATS = 4;
// const BEAT_MS = 6;

const onSpaceBar$ = typeof window === 'undefined'
  ? rxjs.EMPTY
  : rxjs.fromEventPattern<KeyboardEvent>(
    (handler) => window.addEventListener('keydown', handler),
    (handler) => window.removeEventListener('keydown', handler),
  ).pipe(
    rx.filter((event) => event.key === ' ' || event.code === 'Space'),
  );

const onTapScreen$ = typeof window === 'undefined'
  ? rxjs.EMPTY
  : rxjs.defer(() => rxjs.race(
    rxjs.fromEventPattern<MouseEvent>(
      (handler) => window.addEventListener('mousedown', handler),
      (handler) => window.removeEventListener('mousedown', handler),
    ),
    rxjs.fromEventPattern<TouchEvent>(
      (handler) => window.addEventListener('touchstart', handler),
      (handler) => window.removeEventListener('touchstart', handler),
    ),
    rxjs.fromEventPattern<PointerEvent>(
      (handler) => window.addEventListener('pointerdown', handler),
      (handler) => window.removeEventListener('pointerdown', handler),
    ),
  ))
    .pipe(
      rx.filter((event) => isTouchDevice && !(event.target instanceof HTMLButtonElement)),
    );

const ContinuePromptContainer = styled.p<{ isShowing?: boolean }>`
  @apply italic;

  opacity: ${({ isShowing }) => isShowing === true ? 0.7 : 0};
  transition: opacity 0.5s ease-in;
`;

// todo - scroll into view onChar
export const Content = styled<Props & { innerRef: React.MutableRefObject<HTMLDivElement> }>((
  {
    children,
    isPaused = false,
    isCursorBlinking = true,
    beatMs = DEFAULT_BEAT_MS,
    startDelayBeats = DEFAULT_START_DELAY_BEATS,
    onChildWindupWillPlay,
    onChildWindupCompleted,
    innerRef: divRef,
    ...props
  },
) => {
  const [hasStarted, setHasStarted] = React.useState(false);
  const [numCompleted, setNumCompleted] = React.useState(0);
  const [isPromptingToContinue, setIsPromptingToContinue] = React.useState(false);
  const [continuePrompt, setContinuePrompt] = React.useState(ContinuePrompt.Desktop);

  const onCanContinue$ = rxHooks.useObservable((inputs$) => inputs$.pipe(
    rx.switchMap(([isPaused]) => rxjs.merge(onSpaceBar$, onTapScreen$).pipe(
      rx.map((event) => [isPaused, event] as [boolean, KeyboardEvent | MouseEvent | TouchEvent | PointerEvent]),
    )),
    rx.filter(([isPaused]) => !isPaused),
    rx.map(([/* isPaused */, event]) => event),
  ), [isPaused]);

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

  const onWindupFinished = React.useCallback(async () => {
    const newNumCompleted = numCompleted + 1;
    const callbackResult = onChildWindupCompleted?.(numCompleted);

    if (callbackResult instanceof Promise) {
      try {
        await callbackResult;
      } catch (err) {
        console.error('something unexpected threw while waiting for `onChildWindupCompleted`', err);
      }
    }

    if (children instanceof Array && newNumCompleted < children.length) {
      setIsPromptingToContinue(true);
      onCanContinue$
        .pipe(
          rx.take(1),
          rx.tap((event) => {
            event.preventDefault();
            event.stopPropagation();
          }),
          rx.switchMap(() => {
            const willPlayCallbackResult = onChildWindupWillPlay?.(newNumCompleted);

            return willPlayCallbackResult instanceof Promise
              ? rxjs.from(willPlayCallbackResult)
              : rxjs.of(willPlayCallbackResult);
          }),
          rx.tap(() => setIsPromptingToContinue(false)),
          rx.delay(500),
        )
        .subscribe(() => setNumCompleted(newNumCompleted));
    }
  }, [onChildWindupCompleted, onChildWindupWillPlay, numCompleted]);


  React.useEffect(() => {
    if (isTouchDevice) {
      setContinuePrompt(ContinuePrompt.Mobile);
    }
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

    <ContinuePromptContainer aria-hidden isShowing={
      isPromptingToContinue &&
      children instanceof Array &&
      (numCompleted + 1) < children.length
    }>
      [{continuePrompt}]
    </ContinuePromptContainer>

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
