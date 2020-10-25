import React from 'react';
import { useResponsive } from 'ahooks';

import { AboutText } from './AboutText';
import { Hero } from './Hero';
import { Quotes } from './Quotes';
import { Page } from '../../parts/Page';

export const Home = (): JSX.Element => {
  const { md } = useResponsive() ?? {};

  return (
    <Page>
      <Hero />
      {!md && (
        <Quotes className="my-2 flex flex-col p-4 items-center" />
      )}
      <AboutText className="mt-6 w-11/12 max-w-4xl mx-auto" />
    </Page>
  );
};

export default Home;
