import * as React from 'react';

type GoToCallback = (direction: 'next' | 'previous') => void;

export const useNextPreviousShortcuts = (goToCallback: GoToCallback) => {
  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      switch (event.key) {
      case 'Tab':
        // todo - stop capturing tab once user makes an explicit selection?
        goToCallback(event.shiftKey ? 'previous' : 'next');
        break;
      case 'j':
      case 'ArrowRight':
      case 'n':
        if (event.key === 'n' && !event.ctrlKey) {
          // Ctrl+N is valid; N alone is not
          return;
        }

        goToCallback('next');
        break;
      case 'k':
      case 'ArrowLeft':
      case 'p':
        if (event.key === 'p' && !event.ctrlKey) {
          // Ctrl+P is valid; P alone is not
          return;
        }

        goToCallback('previous');
        break;
      default:
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    document.addEventListener('keydown', listener);

    return () => document?.removeEventListener('keydown', listener);
  }, [goToCallback]);
};
