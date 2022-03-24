import * as React from 'react';

const DEFAULT_VALUE = Symbol('context default value');

// Pattern lovingly lifted from https://levelup.gitconnected.com/react-how-i-learned-to-create-optimized-contexts-e121dc232a95
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createSafeContext = <T>() => React.createContext<T | typeof DEFAULT_VALUE>(DEFAULT_VALUE);
export const useSafeContext = <T>(TheContext: React.Context<T | typeof DEFAULT_VALUE>): T => {
  const value = React.useContext(TheContext);

  if (value === DEFAULT_VALUE) {
    throw new Error('no value provided for context');
  }

  return value as T;
};

