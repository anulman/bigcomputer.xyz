import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';
import * as rxHooks from 'observable-hooks';

export const fromRefEvent = <E extends Event, T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  eventName: React.SyntheticEvent<T>['type'],
) => rxHooks.useObservable(
    (inputs$) => inputs$.pipe(rx.switchMap(([ref]) => ref.current
      ? rxjs.fromEvent<E>(ref.current, eventName)
      : rxjs.EMPTY,
    )),
    [ref]
  );

export const eventTargetIsNotContainedBy = (...containers: Node[]) => <T extends MouseEvent>(source: rxjs.Observable<T>) =>
  source.pipe(
    rx.filter((event) => !containers.some(
      (container) => container?.contains(event.target as Node),
    )),
  );
