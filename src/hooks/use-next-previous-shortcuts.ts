import * as React from 'react';

type GoToCallback = (direction: 'next' | 'previous') => void;
type UseArrowsOption = boolean | 'horizontal' | 'vertical';

const NEXT_KEYS = ['j', 'n', 'ArrowRight', 'ArrowDown'] as const;
const PREVIOUS_KEYS = ['k', 'p', 'ArrowLeft', 'ArrowUp'] as const;
type NextPreviousKey = typeof NEXT_KEYS[number] | typeof PREVIOUS_KEYS[number];

const isEmacsKey = (key: NextPreviousKey) => key === 'n' || key === 'p';
const isVerticalKey = (key: NextPreviousKey) => key === 'ArrowUp' || key === 'ArrowDown';
const isNextKey = <Key extends NextPreviousKey>(key: Key): boolean =>
  (NEXT_KEYS as readonly string[]).includes(key);

export const useNextPreviousShortcuts = (goToCallback: GoToCallback, { canUseTab = true, canUseChars = true, charsRequireCtrl = false, useArrows = true as UseArrowsOption } = {}) => {
  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      switch (event.key) {
      case 'Tab':
        if (!canUseTab) {
          return;
        }

        goToCallback(event.shiftKey ? 'previous' : 'next');
        break;
      case 'j':
      case 'k':
      case 'n':
      case 'p':
        if (!canUseChars) {
          return;
        }

        if (!event.ctrlKey && (charsRequireCtrl || isEmacsKey(event.key))) {
          // regardless of `charsRequireCtrl`, emacs keys require ctrl
          return;
        }

        goToCallback(isNextKey(event.key) ? 'next' : 'previous');
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        const axis = isVerticalKey(event.key) ? 'vertical' : 'horizontal';

        if (useArrows === false || useArrows !== axis) {
          return;
        }

        goToCallback(isNextKey(event.key) ? 'next' : 'previous');
        break;
      }
      default:
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    document.addEventListener('keydown', listener);

    return () => document?.removeEventListener('keydown', listener);
  }, [goToCallback, canUseTab, useArrows, canUseChars, charsRequireCtrl]);
};
