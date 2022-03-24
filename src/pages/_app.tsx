import { ReactNode, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { configResponsive } from 'ahooks';

import tailwindConfig from '../../tailwind.config';

import '@src/css/tailwind.css';
import '@src/css/app.css';

export default function MyApp({ Component, pageProps }: AppProps): ReactNode {
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
