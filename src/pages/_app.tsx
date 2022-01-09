import { ReactNode, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { configResponsive } from 'ahooks';

import tailwindConfig from '../../tailwind.config';

import '@src/css/app.css';
import '@src/css/tailwind.css';

export default function MyApp({ Component, pageProps }: AppProps): ReactNode {
  useEffect(() => {
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
