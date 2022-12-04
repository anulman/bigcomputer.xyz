import _ from 'lodash';
import * as React from 'react';
import { styled } from '@linaria/react';
import * as spring from '@react-spring/web';

type Props = {
  // todo - can we eventually support nodes && fragments?
  children?: string;
  isStruckThrough?: boolean;
  asContainer?: Exclude<
    keyof HTMLElementTagNameMap,
    'dir' | 'font' | 'frame' | 'frameset' | 'marquee'
  >
};

const Container = styled.span`@apply relative;`;

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' });
export const Price = ({ amount }: { amount: number }) => <>{priceFormatter.format(amount / 100)}</>;
export const Instruction = styled.span`
  font-size: 0.875rem;
  opacity: 0.7;
`;

const InnerStrikeThrough = (props: Parameters<typeof Container>[0] & Props) => {
  const springs = spring.useTrail(props.children?.length ?? 0, {
    config: { frequency: Math.min(0.1, 4/props.children?.length), damping: 88/100 },
    from: { opacity: 1 },
    opacity: props.isStruckThrough ? 1 : 0,
  });

  return (
    <Container as={props.asContainer} {..._.omit(props, 'children', 'isStruckThrough', 'asContainer')}>
      <span>{props.children}</span>
      <span className="fg" aria-hidden={true}>
        {springs.map((styles, index) => {
          return <spring.animated.span style={styles} key={`char${index}`}>{props.children[index]}</spring.animated.span>;
        })}
      </span>
    </Container>
  );
};

export const StrikeThrough = styled(InnerStrikeThrough)`
  > .fg {
    @apply absolute left-0 top-0;
    z-index: 1;

    color: transparent;
    pointer-events: none;
    user-select: none;

    text-decoration: line-through;
    text-decoration-color: limegreen;
    text-decoration-thickness: 0.25rem;
  }
`;
