import _ from 'lodash';
import * as React from 'react';
import { styled } from 'linaria/react';

import { createSafeContext, useSafeContext } from '@src/hooks/use-safe-context';
import { useSequentialCallbacks } from '@src/hooks/use-sequential-callbacks';

export const FootnoteContext = createSafeContext<{ registerFootnote: (footnote: React.ReactNode) => number; show: (num: number) => void; hide: () => void }>();
export const useFootnoteContext = () => useSafeContext(FootnoteContext);

export const Container = ({ onShow, onHide, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { onShow?: () => void, onHide?: () => void }): JSX.Element => {
  const footnotes = React.useRef<Array<React.ReactNode>>([]);
  const currentFootnote = React.useRef<number>();
  const [isShowing, setIsShowing] = React.useState(false);

  const registerFootnote = React.useCallback((footnote: React.ReactNode): number => {
    return footnotes.current.push(footnote);
  }, [footnotes]);

  const show = React.useCallback((num: number) => {
    currentFootnote.current = num;
    setIsShowing(true);
    onShow?.();
  }, [currentFootnote, footnotes, setIsShowing, onShow]);

  const hide = React.useCallback(() => {
    setIsShowing(false);
    onHide?.();
  }, [setIsShowing, currentFootnote, onHide]);

  return (
    <FootnoteContext.Provider value={{ registerFootnote, show, hide }}>
      <Display isShowing={isShowing} {...props}>
          [{currentFootnote.current}] - {footnotes.current[currentFootnote.current - 1]}!!
      </Display>
      {children}
    </FootnoteContext.Provider>
  );
};

export const Display = styled<React.HTMLAttributes<HTMLDivElement> & { isShowing?: boolean }>(
  (props) => <aside {...props} />
)`
  @apply border-gray-800;

  opacity: ${({ isShowing = false }) => isShowing ? '1' : '0'};
  transition: opacity 0.2s ease-in;
`;

export const Reference = styled<React.HTMLAttributes<HTMLButtonElement> & { value: React.ReactNode; children?: never; }>(
  ({ value, ...props }): JSX.Element => {
    const { registerFootnote, show, hide } = useFootnoteContext();
    const [footnoteNum] = React.useState(() => registerFootnote(value));

    const showFootnote = React.useCallback(() => show(footnoteNum), [show, footnoteNum]);
    const onMouseOver = useSequentialCallbacks(props.onMouseOver, showFootnote);
    const onMouseOut = useSequentialCallbacks(props.onMouseOut, hide);

    return <button
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      {..._.omit(props, ['onMouseOver', 'onMouseOut'])}
    >
      [{footnoteNum}]
    </button>;
  }
)`
  @apply border-none bg-transparent p-0 m-0 underline;

  &:hover {
    @apply text-white;
  }
`;

// export const Modal = ({
//   children,
//   wrapperClassName,
//   ...rest
// }: Props) => {
// 
//   const isShowing = useObservableEagerState(isShowing$);
// 
//   const show = useCallback(() => {
//     debug(`Showing modal T: ${Date.now()}`);
//     isShowing$.next(true);
//   }, []);
//   const hide = useCallback(() => {
//     debug(`Hiding modal T: ${Date.now()}`);
//     isShowing$.next(false);
//   }, []);
//   const contextValue = useMemo(() => ({ isShowing$, show, hide }), []);
//   const className = useMemo(() => cx(wrapperClassName, isShowing ? 'visible' : 'hidden'), [
//     isShowing,
//     wrapperClassName,
//   ]);
// 
//   const onPointerDown: MouseEventHandler<HTMLDivElement> = useCallback(
//     (evt) => {
//       debug(`Pointer down received in modal. Should hide next T: ${Date.now()}`);
//       const modalChildren = Array.from(modalRef.current?.children ?? []);
//       const didClickChild = modalChildren.some((child) =>
//         child.contains(evt.target as HTMLElement),
//       );
// 
//       if (!didClickChild) {
//         hide();
//       }
//     },
//     [modalRef.current, hide],
//   );
// 
//   useEffect(() => {
//     if (typeof propsIsShowing === 'boolean' && isShowing !== propsIsShowing) {
//       isShowing$.next(propsIsShowing);
//     }
//   }, [isShowing, propsIsShowing]);
// 
//   return (
//     <ModalContext.Provider value={{ isShowing$, show, hide }}>
//       <div className={className} onPointerDown={onPointerDown} ref={modalRef} {...rest}>
//         {children}
//       </div>
//     </ModalContext.Provider>
//   );
// };
