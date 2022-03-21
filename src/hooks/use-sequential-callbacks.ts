import * as React from 'react';

export const useSequentialCallbacks = <Args extends Array<unknown>, ReturnType>(...callbacks: Array<(...args: Args) => ReturnType>) => React.useCallback((...args: Args) => {
  let lastReturn: ReturnType;

  for (const callback of callbacks) {
    if (!callback) {
      continue;
    }

    lastReturn = callback(...args);

    if ((args[0] as Event)?.defaultPrevented ?? false) {
      break;
    }
  }

  return lastReturn;
}, callbacks);
