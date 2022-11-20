import * as React from 'react';

type GoToCallback = (direction: 'next' | 'previous') => void;

const isNextKey = (key: 'j' | 'k' | 'n' | 'p' | 'ArrowLeft' | 'ArrowRight') =>
  key === 'j' || key === 'n' || key === 'ArrowRight';

const isEmacsKey = (key: 'j' | 'k' | 'n' | 'p' | 'ArrowLeft' | 'ArrowRight') =>
  key === 'n' || key === 'p';

export const useNextPreviousShortcuts = (goToCallback: GoToCallback, { canUseTab = true, canUseArrows = true, canUseChars = true, charsRequireCtrl = false } = {}) => {
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
        if (!canUseArrows) {
          return;
        }

        goToCallback(isNextKey(event.key) ? 'next' : 'previous');
        break;
      default:
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    document.addEventListener('keydown', listener);

    return () => document?.removeEventListener('keydown', listener);
  }, [goToCallback, canUseTab, canUseArrows, canUseChars, charsRequireCtrl]);
};
