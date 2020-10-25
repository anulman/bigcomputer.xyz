import React, { HTMLProps } from 'react';
import { styled } from 'linaria/react';

export const QUOTES = [{
  body: 'It may be full of telling points; I wouldn’t know; it was too dull to read.',
  author: 'Judith Merril',
  source: {
    title: 'June, 1968',
    url: 'http://www.isfdb.org/cgi-bin/pl.cgi?61218',
  },
}, {
  body: 'If you look around you, you can see the first chapters of the Big Computer’s tale taking form.',
  author: 'P Schuyler Miller',
  source: {
    title: 'May, 1969',
    url: 'http://www.isfdb.org/cgi-bin/pl.cgi?57167',
  },
}];

export const Quote = styled.blockquote`
  @apply relative p-4 flex flex-col justify-between text-center text-black;

  text-shadow: none;

  * {
    mix-blend-mode: multiply;
  }

  &::before {
    @apply absolute inset-0 bg-red-300 rounded-xl;

    @screen md {
      mix-blend-mode: screen;
    }

    content: '';
  }

  @screen md {
    @apply shadow;
  }

  & + & {
    @apply mt-4;

    @screen md {
      @apply mt-0 ml-8;
    }
  }

  p {
    max-width: 25em;
  }

  footer {
    @apply mt-2;

    &::before {
      content: '—';
    }
  }

  cite {
    &:hover {
      @apply underline;
    }
  }
`;

// todo - memo? not expensive though
export const Quotes = (props: HTMLProps<HTMLDivElement>): JSX.Element => QUOTES.length > 0 && (
  <div {...props}>
    {QUOTES.map((quote, index) => (
      <Quote key={`hero-quote-${index}`}>
        <p>&ldquo;{quote.body}&rdquo;</p>
        <footer>
          {quote.author};
          {' '}<cite>
            <a href={quote.source.url} rel="noreferrer" target="_blank">
              {quote.source.title}
            </a>
          </cite>
        </footer>
      </Quote>
    ))}
  </div>
);
