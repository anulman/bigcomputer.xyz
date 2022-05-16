// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

// Heart favicon from Twemoji [CC-BY] (https://creativecommons.org/licenses/by/4.0/) via favicon.io (https://favicon.io/emoji-favicons/red-heart/)

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firstparty: any;
  }
}

const SCRIPT_SRCS = [
  '\'self\'',
  // IFF dev: unsafe-eval
  ...(process.env.NODE_ENV === 'development'
    ? ['\'unsafe-eval\'', '\'unsafe-inline\'']
    : [
      // todo - compute `addFirstPartyTracking` sha directly
      '\'sha256-pCvT9hv4L2vQuke5Si1q8TMe2VBR2EIoRjDrOuTQU54=\'',
    ]
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
          <script type="application/javascript" dangerouslySetInnerHTML={{ __html:
            // todo - webpackify
            addFirstPartyTracking.toString()
              .replace(/^[^\n]*\n/, '')
              .replace(/\n[^\n]+$/, '')
              .trim()
          }} />

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

/* eslint-disable */
function addFirstPartyTracking() {
  !function(){const t=window.firstparty=window.firstparty||[];if(!t.initialize){if(t.invoked)return void(window.console&&console.error&&console.error('Firstparty snippet included twice.'));t.invoked=!0,t.methods=['trackSubmit','trackClick','trackLink','trackForm','pageview','identify','reset','group','track','ready','alias','debug','page','once','off','on','addSourceMiddleware','addIntegrationMiddleware','setAnonymousId','addDestinationMiddleware'],t.factory=function(r){return function(){const e=Array.prototype.slice.call(arguments);return e.unshift(r),t.push(e),t;};};for(let r=0;r<t.methods.length;r++){const e=t.methods[r];t[e]=t.factory(e);}t.load=function(r,e,i){t._writeKey=r,t._host=e,t._firstpartyOptions=i;let a='/js/firstparty.min.js';void 0!==i&&void 0!==i.libraryPath&&(a=i.libraryPath);const o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src='https://'+e+a;const n=document.getElementsByTagName('script')[0];n.parentNode.insertBefore(o,n);},t.SNIPPET_VERSION='0.1.0';}}();
  window.firstparty.load('wmc8KThQ2MxPq7Vu', 'fp.bigcomputer.xyz');

  document.cookie = `LastLoadedAt=${Date.now()}; max-age=400d; secure; samesite=lax;`;

  // initialize analytics w/ profile uuid
  let anonymousId = document.cookie.split(';').reduce((id, _value) => {
    if (id) {
      return id;
    }

    const [key, value] = _value.trim().split('=');

    if (key === 'AnonymousId') {
      return value;
    }
  }, null);

  if (!anonymousId) {
    // generates uuidv4; ht https://stackoverflow.com/a/2117523
    anonymousId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  // set the cookie no matter what
  document.cookie = [
    `AnonymousId=${anonymousId}`,
    ...(/^https:\/\/([^\/]+\.)*bigcomputer\.xyz\//.test(window.location.href) ? ['domain=bigcomputer.xyz'] : []),
    'max-age=400d',
    'secure',
    'samesite=lax',
  ].join(';');

  window.firstparty.setAnonymousId(anonymousId);

  if (process.env.NODE_ENV !== 'development') {
    window.firstparty.page();
  }
}
/* eslint-enable */
