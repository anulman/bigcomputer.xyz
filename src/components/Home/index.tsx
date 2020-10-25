import React from 'react';
import { useResponsive } from 'ahooks';

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
    </Page>
  );
};

export default Home;
