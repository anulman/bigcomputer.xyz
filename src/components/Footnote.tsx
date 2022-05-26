import * as React from 'react';
import { styled } from 'linaria/react';
import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as rxHooks from 'observable-hooks';

import { createSafeContext, useSafeContext } from '@src/hooks/use-safe-context';
import * as analytics from '@src/utils/analytics';

const FootnoteContext = createSafeContext<{
  currentFootnote$: rxjs.Observable<CurrentFootnote>;
  registerFootnote: (footnote: React.ReactNode) => number;
  show: (event: MouseEvent, key?: number) => void;
  hide: () => void;
}>();

const useFootnoteContext = () => useSafeContext(FootnoteContext);

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  onShow?: () => void;
  onHide?: () => void;
};

type CurrentFootnote = {
  key?: number;
  trigger: HTMLElement;
  content: React.ReactNode;
  isPersistent: boolean;
}

export const Container = ({ onShow, onHide, children, ...props }: ContainerProps): JSX.Element => {
  const footnotes = React.useRef<Array<React.ReactNode>>([]);
  const currentSubjectRef = React.useRef(new rxjs.BehaviorSubject<CurrentFootnote | null>(null));

  const registerFootnote = React.useCallback((footnote: React.ReactNode): number => {
    return footnotes.current.push(footnote);
  }, [footnotes]);

  const hide = React.useCallback(() => {
    rxjs.race(
      // didCancelHide will be `true` if currentSubjectRef emits again
      currentSubjectRef.current.pipe(
        // skip the first value because this is a BehaviorSubject
        rx.skip(1),
        rx.filter((current) => current !== null),
        rx.map(() => true),
      ),
      // didCancelHide will be `false` after a delay
      rxjs.of(false).pipe(rx.delay(50)),
    ).pipe(
      rx.first(),
      rx.filter((didCancelHide) => !didCancelHide),
      rx.tap(() => onHide?.()),
    ).subscribe(() => {
      currentSubjectRef.current.next(null);
    });
  }, [currentSubjectRef, onHide]);

  const show = React.useCallback((event: MouseEvent, key?: number) => {
    const currentFootnote = !key || key === currentSubjectRef.current.value?.key
      ? currentSubjectRef.current.value
      : null;

    currentSubjectRef.current.next({
      key: currentFootnote?.key ?? key,
      trigger: currentFootnote?.trigger ?? (event.target as HTMLElement),
      content: currentFootnote?.content ?? footnotes.current[key - 1],
      isPersistent: currentFootnote?.isPersistent === true ? true : event.type === 'click',
    });
    onShow?.();

    if (key && currentFootnote?.key !== key) {
      analytics.track('Showed Footnote', { which: key });
    }
  }, [onShow]);

  React.useEffect(() => {
    // reset footnotes on destroy
    footnotes.current = [];
  }, []);

  const value = React.useMemo(() => ({
    currentFootnote$: currentSubjectRef.current.asObservable(),
    registerFootnote,
    show,
    hide,
  }), [currentSubjectRef, registerFootnote, show, hide]);

  return (
    <FootnoteContext.Provider value={value}>
      <Display {...props} />
      {children}
    </FootnoteContext.Provider>
  );
};

export const Display = styled<React.HTMLAttributes<HTMLDivElement>>(
  (props) => {
    const { currentFootnote$, show, hide } = useFootnoteContext();
    const elementRef = React.useRef<HTMLDivElement>(null);

    const onMouseOver$ = fromRefEvent<MouseEvent>(elementRef, 'mouseover');
    const onMouseOut$ = fromRefEvent<MouseEvent>(elementRef, 'mouseout');
    const currentFootnote = rxHooks.useObservableState(currentFootnote$);

    const repositionFootnote = React.useCallback(
      anchorFootnoteToTrigger(elementRef.current, currentFootnote?.trigger),
      [elementRef, currentFootnote],
    );

    rxHooks.useSubscription(onMouseOver$, show);
    rxHooks.useSubscription(
      onMouseOut$.pipe(currentFootnoteIsNotPersistent(currentFootnote$)),
      hide,
    );

    rxHooks.useSubscription(
      currentFootnote$.pipe(
        rx.filter((current) => current !== null),
        rx.distinctUntilKeyChanged('key'),
      ),
      () => {
        elementRef.current.style.visibility = 'visible';
        elementRef.current.style.pointerEvents = 'auto';
        repositionFootnote();
      },
    );

    rxHooks.useLayoutSubscription(
      currentFootnote$.pipe(rx.filter((current) => current === null)),
      () => {
        elementRef.current.style.visibility = 'hidden';
        elementRef.current.style.pointerEvents = 'none';
      },
    );

    rxHooks.useSubscription(
      currentFootnote$.pipe(
        rx.switchMap(
          (current) => current?.isPersistent ?? false
            // emit the first "click outside the footnote" OR `Escape` keypress
            ? rxjs.race(
              // onDocumentClick$
              rxjs.fromEvent<MouseEvent>(document, 'click', { capture: true }).pipe(
                eventTargetIsNotContainedBy(elementRef.current, current.trigger),
              ),
              // onEscapeKeydown$
              rxjs.fromEvent<KeyboardEvent>(document, 'keydown', { capture: true })
                .pipe(rx.filter((event) => event.key === 'Escape'))
            ).pipe(
              rx.first(),
              rx.tap((event) => event.preventDefault()),
            )
            // if it's not persistent, nevermind
            : rxjs.NEVER,
        ),
      ),
      hide,
    );

    React.useEffect(() => {
      const observer = new ResizeObserver(() => repositionFootnote());

      observer.observe(document.body);
      observer.observe(elementRef.current);

      return () => {
        observer.disconnect();
      };
    }, [elementRef]);

    return <aside ref={elementRef} {...props}>
      <span>[{currentFootnote?.key}] - </span>
      {currentFootnote?.content}
    </aside>;
  }
)`
  /* START - attrs that will be overridden by our listeners */
  visibility: hidden;
  pointer-events: none;
  /* END - attrs that will be overridden by our listeners */

  > :nth-child(-n+2) {
    display: inline;
  }
`;

export const Reference = styled<React.HTMLAttributes<HTMLButtonElement> & { value: React.ReactNode; children?: never; }>(
  ({ value, ...props }): JSX.Element => {
    const { currentFootnote$, registerFootnote, show, hide } = useFootnoteContext();
    const [footnoteNum] = React.useState(() => registerFootnote(value));
    const elementRef = React.useRef<HTMLButtonElement>(null);

    const onClick$ = fromRefEvent<MouseEvent>(elementRef, 'click');
    const onMouseOver$ = fromRefEvent<MouseEvent>(elementRef, 'mouseover');
    const onMouseOut$ = fromRefEvent<MouseEvent>(elementRef, 'mouseout');

    rxHooks.useSubscription(
      onClick$.pipe(rx.tap(() => elementRef.current.style.color = 'crimson')),
      (event) => show(event, footnoteNum),
    );

    rxHooks.useSubscription(
      onMouseOver$.pipe(
        rx.withLatestFrom(currentFootnote$),
        rx.filter(([, current]) => current?.isPersistent !== true),
        rx.tap(() => elementRef.current.style.color = 'white'),
      ),
      ([event]) => show(event, footnoteNum),
    );

    rxHooks.useSubscription(
      onMouseOut$.pipe(currentFootnoteIsNotPersistent(currentFootnote$)),
      hide,
    );

    rxHooks.useSubscription(
      currentFootnote$.pipe(
        rx.map((current) => current?.trigger),
        rx.filter((trigger) => trigger !== elementRef.current),
      ),
      () => elementRef.current.style.color = '',
    );

    return <button ref={elementRef} {...props}>
      [{footnoteNum}]
    </button>;
  }
)`
  @apply border-none bg-transparent p-0 m-0 underline;

  &:hover, &:active {
    @apply text-white outline-none;
  }
`;

Container.displayName = 'Container';

const eventTargetIsNotContainedBy = (...containers: Node[]) => <T extends MouseEvent>(source: rxjs.Observable<T>) =>
  source.pipe(
    rx.filter((event) => !containers.some(
      (container) => container?.contains(event.target as Node),
    )),
  );

const currentFootnoteIsNotPersistent = (currentFootnote$: rxjs.Observable<CurrentFootnote>) => <T extends Event>(source: rxjs.Observable<T>) =>
  source.pipe(
    rx.withLatestFrom(currentFootnote$),
    rx.filter(([, current]) => current?.isPersistent !== true),
  );

const fromRefEvent = <E extends Event, T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  eventName: React.SyntheticEvent<T>['type'],
) => rxHooks.useObservable(
    (inputs$) => inputs$.pipe(rx.switchMap(([ref]) => ref.current
      ? rxjs.fromEvent<E>(ref.current, eventName)
      : rxjs.EMPTY,
    )),
    [ref]
  );

// todo - what happens when window is shorter than the footnote?
const anchorFootnoteToTrigger = (displayElement: HTMLDivElement, triggerElement?: HTMLElement) => () => {
  if (displayElement && triggerElement) {
    const footnoteBounds = displayElement.getBoundingClientRect();
    const triggerBounds = triggerElement.getBoundingClientRect();
    const underTriggerTop = triggerBounds.bottom + 8; // 0.5rem in px
    const aboveTriggerBottom = triggerBounds.top - 8; // 0.5rem in px

    if (underTriggerTop + footnoteBounds.height <= window.innerHeight) {
      // there is enough space to position the footnote under the trigger
      displayElement.style.top = `${underTriggerTop}px`;
    } else if (aboveTriggerBottom - footnoteBounds.height >= 0) {
      // there is enough space to position the footnote above the trigger
      displayElement.style.top = `${aboveTriggerBottom - footnoteBounds.height}px`;
    } else {
      // we can't pin this footnote to its trigger; let's vertically center it in the window
      displayElement.style.top =
        `calc(${Math.floor(window.scrollY)}px + (100vh - ${footnoteBounds.height}px) / 2)`;
    }
  }
};
