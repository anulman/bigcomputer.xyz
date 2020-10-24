import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <JamScript />
        </body>
      </Html>
    );
  }
}

const JamScript = (): JSX.Element => process.env.NODE_ENV === 'production'
  ? (
    <>
      <script src="https://jam.dev/jam.js"></script>
      <script dangerouslySetInnerHTML={{ __html: 'Jam.init(\'untrue-cephalopod-7517\')' }} />
    </>
  )
  : null;
