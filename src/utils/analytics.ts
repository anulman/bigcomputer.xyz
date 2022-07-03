import * as rxjs from 'rxjs';
import * as rx from 'rxjs/operators';

import * as cookies from './cookies';

declare const firstparty: {
  track: (event: string, properties?: Record<string, unknown>, options?: null | never, callback?: () => unknown) => void;
  page: (category?: string, name?: string, properties?: Record<string, unknown>, options?: null | never, callback?: () => unknown) => void;
};

let totalActiveTimeOnPage = 0;
let lastUpdatedActiveTimeAt: number;
let lastHiddenAt: number | null = null;

export const track = (event: string, properties: Record<string, unknown> = {}) => {
  updateActiveTime();

  if (process.env.NODE_ENV === 'development') {
    console.log('track!!', event, { totalActiveTimeOnPage, ...properties });
  } else {
    firstparty.track(event, { totalActiveTimeOnPage, ...properties });
  }
};

const updateActiveTime = (
  since = lastUpdatedActiveTimeAt ?? cookies.getLatest().LastLoadedAt,
  now = Date.now(),
) => {
  totalActiveTimeOnPage += now - since;
  lastUpdatedActiveTimeAt = now;
};

if (typeof window !== 'undefined') {
  rxjs.fromEvent(document, 'visibilitychange')
    .pipe(rx.map(() => document.visibilityState))
    .subscribe((newState) => {
      if (newState === 'visible') {
        if (lastHiddenAt) {
          updateActiveTime(lastHiddenAt);
        }

        lastHiddenAt = null;
      } else if (newState === 'hidden') {
        lastHiddenAt = Date.now();
      }
    });

  rxjs.fromEvent(window, 'beforeunload')
    .pipe(rx.tap(() => cookies.setCookie('LastUnloadedAt', Date.now())))
    .subscribe(() => track('Page Unloaded'));
}
