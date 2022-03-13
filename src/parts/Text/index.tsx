import React from 'react';
import { styled } from 'linaria/react';

type LinkAttributes = React.HTMLProps<HTMLAnchorElement>;
type ButtonAttributes = React.HTMLAttributes<HTMLButtonElement>;

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

export const Link = styled<LinkAttributes | ButtonAttributes>(
  <T extends LinkAttributes | ButtonAttributes>(props: T extends LinkAttributes ? LinkAttributes : ButtonAttributes) =>
    (props as LinkAttributes).href !== undefined
      ? <a {...props as LinkAttributes} />
      : <button {...props as ButtonAttributes} />
);
