import { ReactNode, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { configResponsive } from 'ahooks';
import * as Fathom from 'fathom-client';

import tailwindConfig from '../../tailwind.config';

import '@src/css/tailwind.css';
import '@src/css/app.css';

export default function MyApp({ Component, pageProps }: AppProps): ReactNode {
  const router = useRouter();

  useEffect(() => {
    Fathom.load('IYSQIMIJ', {
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

  return <Component {...pageProps} />;
}

function mapTailwindConfigToResponsiveConfig(config: typeof tailwindConfig) {
  const { theme: { screens: twScreens } } = config;

  return Object.keys(twScreens).reduce((screens, screenKey) => ({
    ...screens,
    [screenKey]: parseInt(twScreens[screenKey], 10),
  }), {});
}
