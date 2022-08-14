import * as React from 'react';
import _ from 'lodash';
import { styled } from 'linaria/react';
import * as Dialog from '@reach/dialog';
import * as spring from '@react-spring/web';

type RequiredKey<T, K extends keyof T> = Required<Record<K, T[K]>> & T;
type Props = React.PropsWithChildren<
  Dialog.DialogProps
  & React.HTMLAttributes<HTMLDivElement>
  & { anchorRect?: DOMRect }
>;

const AnimatedOverlay = spring.animated(Dialog.DialogOverlay);
const AnimatedContent = spring.animated(Dialog.DialogContent);

declare module 'csstype' {
  interface Properties {
    '--overlay-backdrop-blur'?: `${number}px`;
    '--overlay-backdrop-hue-rotate'?: `${number}deg`;
    '--overlay-backdrop-brightness'?: number;
    '--content-backdrop-blur'?: `${number}px`;
    '--content-backdrop-brightness'?: number;
    '--content-backdrop-opacity'?: number;
    '--content-background-opacity'?: number;
    '--content-color-opacity'?: number;
    '--all-opacity'?: number;
  }
}

export const Modal = styled<Props>(
  ({ children, ...props }: RequiredKey<Props, 'children'>) => {
    const innerState = React.useRef<{ wasOpen: boolean; restoreFocusToElem?: HTMLElement }>({
      wasOpen: props.isOpen,
    });

    const transitions = spring.useTransition(props.isOpen, {
      from: {
        contentBackdropBlur: 0,
        contentBackdropBrightness: 0,
        contentBackdropOpacity: 0,
        contentBackgroundOpacity: 0,
        contentColorOpacity: 0,
        overlayBackdropBlur: 0,
        overlayBackdropHueRotate: 0,
        overlayBackdropBrightness: 1,
        allOpacity: 0,
      },
      enter: {
        contentBackdropBlur: 4,
        contentBackdropBrightness: 0.6,
        contentBackdropOpacity: 0.8,
        contentBackgroundOpacity: 0.1325,
        contentColorOpacity: 0.8,
        overlayBackdropBlur: 2,
        overlayBackdropHueRotate: -120,
        overlayBackdropBrightness: 1.25,
        allOpacity: 1,
      },
      leave: {
        contentBackdropBlur: 0,
        contentBackdropBrightness: 0,
        contentBackdropOpacity: 0,
        contentBackgroundOpacity: 0,
        contentColorOpacity: 0,
        overlayBackdropBlur: 0,
        overlayBackdropHueRotate: 0,
        overlayBackdropBrightness: 1,
        allOpacity: 0,
      },
    });

    React.useEffect(() => {
      if (props.isOpen && !innerState.current.wasOpen) {
        // we are opening; cache the last focused element
        innerState.current.restoreFocusToElem = document.activeElement as HTMLElement;
      } else if (!props.isOpen && innerState.current.wasOpen) {
        // restore focus to the last focused element if any, then clear the cache
        innerState.current.restoreFocusToElem?.focus();
        innerState.current.restoreFocusToElem = undefined;
      }

      innerState.current.wasOpen = true;
    }, [props.isOpen]);

    return transitions(
      (styles, item) => item && (
        <AnimatedOverlay
          dangerouslyBypassFocusLock={!props.isOpen}
          style={_.merge({}, props.style, {
            '--overlay-backdrop-blur': styles.overlayBackdropBlur.to((px) => `${px}px`),
            '--overlay-backdrop-hue-rotate': styles.overlayBackdropHueRotate.to((deg) => `${deg}deg`),
            '--overlay-backdrop-brightness': styles.overlayBackdropBrightness,
          })}
          {..._.omit(props, 'anchorRect', 'style', 'isOpen', 'aria-label')}
        >
          <AnimatedContent aria-label={props['aria-label']} style={{
            '--content-backdrop-blur': styles.contentBackdropBlur.to((px) => `${px}px` as `${number}px`),
            '--content-backdrop-brightness': styles.contentBackdropBrightness,
            '--content-backdrop-opacity': styles.contentBackdropOpacity,
            '--content-background-opacity': styles.contentBackgroundOpacity,
            '--content-color-opacity': styles.contentColorOpacity,
            '--all-opacity': styles.allOpacity,
          }}>
            {children}
          </AnimatedContent>
        </AnimatedOverlay>
      ),
    );
  },
)`
  @apply fixed;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  &::before {
    // use a pseudo element to separate the stacking context & layer backdrop-filters
    content: '';
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 0;
    backdrop-filter:
      blur(var(--overlay-backdrop-blur, 2px))
      hue-rotate(var(--overlay-backdrop-hue-rotate, -120deg))
      brightness(var(--overlay-backdrop-brightness, 125%));
  }

  > [data-reach-dialog-content] {
    @apply absolute;
    --width: ${({ anchorRect }) => anchorRect ? `${anchorRect.width}px` : '100vw'};
    --top: ${({ anchorRect }) => anchorRect ? `${anchorRect.top}px` : '0'};

    max-height: 85vh;
    width: var(--width, 100vw);
    left: calc((100% - var(--width, 100vw)) / 2);
    top: var(--top, 0);
    overflow-y: scroll;

    background: rgba(255, 255, 255, var(--content-background-opacity, 0.1325));
    color: rgba(255, 255, 255, var(--content-color-opacity, 0.8));
    border-radius: 4px;
    padding: 1rem;

    z-index: 1;
    backdrop-filter:
      blur(var(--content-backdrop-blur, 4px))
      brightness(var(--content-backdrop-brightness, 60%))
      opacity(var(--content-backdrop-opacity, 0.8));

    opacity: var(--all-opacity, 1);
  }
`;
