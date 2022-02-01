import { styled } from 'linaria/react';

export const Avatar = styled.div<{ color?: string; size?: number | string }>`
  @apply relative;

  --color: ${({ color }) => color ?? 'red'};
  --size: ${({ size }) =>
    typeof size === 'string' ? size : `${size ?? '50'}px`};

  animation: heartbeat 1s infinite;
  background-color: var(--color);
  height: var(--size);
  width: var(--size);
  transform: rotate(-45deg);

  &::before,
  &::after {
    @apply absolute;

    content: "";
    background-color: var(--color);
    border-radius: 50%;

    height: var(--size);
    width: var(--size);
  }

  &::before {
    top: calc(var(--size) / -2);
    left: 0;
  }

  &::after {
    left: calc(var(--size) / 2);
    top: 0;
  }

  @keyframes heartbeat {
    0% {
      transform: rotate(-45deg) scale(1);
    }
    20% {
      transform: rotate(-45deg) scale(1.25);
    }
    40% {
      transform: rotate(-45deg) scale(1.5);
    }
  }
`;
