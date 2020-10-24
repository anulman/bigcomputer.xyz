import React, { ReactNode } from 'react';
import type { AppProps } from 'next/app';

import '../css/tailwind.css';

export default function MyApp({ Component, pageProps }: AppProps): ReactNode {
  return <Component {...pageProps} />;
}
