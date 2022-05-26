import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

// Heart favicon from Twemoji [CC-BY] (https://creativecommons.org/licenses/by/4.0/) via favicon.io (https://favicon.io/emoji-favicons/red-heart/)

const SCRIPT_SRCS = [
  '\'self\'',
  // IFF dev: unsafe-eval
  ...(process.env.NODE_ENV === 'development'
    ? ['\'unsafe-eval\'', '\'unsafe-inline\'']
    : []
  ),
  // fathom
  'paul-branch.bigcomputer.xyz',
];

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="Content-Security-Policy" content={`script-src ${SCRIPT_SRCS.join(' ')}; object-src 'none'; base-uri 'none';`} />

          <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon/favicon-16x16.png" />
          <link rel="manifest" href="/assets/images/favicon/site.webmanifest" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
