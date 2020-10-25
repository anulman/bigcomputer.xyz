import { styled } from 'linaria/react';

export const H1 = styled.div`
  @apply text-4xl leading-none;
  font-family: Audiowide, cursive;

  @screen 2xl {
    @apply text-5xl;
  }
`;

export const H2 = styled.div`
  @apply text-3xl leading-tight;
  font-family: serif;

  @screen 2xl {
    @apply text-4xl;
  }
`;
