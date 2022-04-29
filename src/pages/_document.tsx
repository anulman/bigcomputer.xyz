import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

// Heart favicon from Twemoji [CC-BY] (https://creativecommons.org/licenses/by/4.0/) via favicon.io (https://favicon.io/emoji-favicons/red-heart/)

const SCRIPT_SRCS = [
  '\'self\'',
  // IFF dev: unsafe-eval
  ...(process.env.NODE_ENV === 'development'
    ? ['\'unsafe-eval\'', '\'unsafe-inline\'']
    : ['sha256-RxpNNTe7DYJZzQPNtsGFQ485xNNq4Ks28yzondu6J70='] // todo - hash this
  ),
  // firstparty
  'fp.bigcomputer.xyz',
  // fathom
  'paul-branch.bigcomputer.xyz',
];

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="Content-Security-Policy" content={`script-src ${SCRIPT_SRCS.join(' ')}; object-src 'none'; base-uri 'none';`} />
          <script type="application/javascript" dangerouslySetInnerHTML={{ __html: `
            !function(){var t=window.firstparty=window.firstparty||[];if(!t.initialize){if(t.invoked)return void(window.console&&console.error&&console.error("Firstparty snippet included twice."));t.invoked=!0,t.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"],t.factory=function(r){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(r),t.push(e),t}};for(var r=0;r<t.methods.length;r++){var e=t.methods[r];t[e]=t.factory(e)}t.load=function(r,e,i){t._writeKey=r,t._host=e,t._firstpartyOptions=i;var a="/js/firstparty.min.js";void 0!==i&&void 0!==i.libraryPath&&(a=i.libraryPath);var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src="https://"+e+a;var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(o,n)},t.SNIPPET_VERSION="0.1.0"}}();
            firstparty.load("wmc8KThQ2MxPq7Vu", "fp.bigcomputer.xyz");
            firstparty.page();
          ` }} />

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
