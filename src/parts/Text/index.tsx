import _ from 'lodash';
import React from 'react';
import { styled } from 'linaria/react';

type LinkAttributes = { href: string; onClick: never } & Partial<React.HTMLAttributes<HTMLAnchorElement>>;
type ButtonAttributes = { href: never; onClick: React.MouseEventHandler<HTMLButtonElement> } & Partial<React.HTMLAttributes<HTMLButtonElement>>;

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
  ({ href, ...props }) =>
    href !== undefined
      ? <a href={href} {...props} />
      : <button type={props.type ?? 'button'} {..._.omit(props, 'type')} />
);
