import React, { ReactNode, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { configResponsive } from 'ahooks';
import * as Fathom from 'fathom-client';

import tailwindConfig from '../../tailwind.config';

import '@src/css/tailwind.css';
import '@src/css/app.css';

const shouldRunAxe = typeof window !== 'undefined' &&
  process.env.NODE_ENV !== 'production';

if (shouldRunAxe) {
  Promise.all([import('react-dom'), import('@axe-core/react')])
    .then(([ReactDOM, { default: axe }]) => axe(React, ReactDOM, 1000, {}));
}

export default function MyApp({ Component, pageProps }: AppProps): ReactNode {
  const router = useRouter();

  useEffect(() => {
    Fathom.load('IYSQIMIJ', {
      url: 'https://paul-branch.bigcomputer.xyz/script.js',
      includedDomains: ['bigcomputer.xyz', 'www.bigcomputer.xyz'],
    });

    const onRouteChangeComplete = () => Fathom.trackPageview();

    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return router.events.off('routeChangeComplete', onRouteChangeComplete);
  }, []);

  useEffect(() => {
    console.info('This website is open source! See how it\'s made at https://github.com/anulman/bigcomputer.xyz');
    configResponsive(mapTailwindConfigToResponsiveConfig(tailwindConfig));
  }, []);

  return <>
    <Head>
      <meta property="og:url" content={`https://www.bigcomputer.xyz${router.pathname}`} key="og:url" />
      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:title" content="Tale of the Big Computer" key="og:title" />
      <meta property="og:description" content="An uncannily-prescient 1960s science fiction novel; reprinted in English for the first time in 50 years" key="og:description" />
      <meta property="og:image" content="https://bigcomputer.xyz/assets/images/3d-heart.png" key="og:image" />

      <meta property="twitter:card" content="summary_large_image" key="twitter:card" />

      <title key="title">Tale of the Big Computer</title>
    </Head>
    <Component {...pageProps} />
  </>;
}

function mapTailwindConfigToResponsiveConfig(config: typeof tailwindConfig) {
  const { theme: { screens: twScreens } } = config;

  return Object.keys(twScreens).reduce((screens, screenKey) => ({
    ...screens,
    [screenKey]: parseInt(twScreens[screenKey], 10),
  }), {});
}
