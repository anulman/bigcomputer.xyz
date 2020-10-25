import React from 'react';
import { css } from 'linaria';
import { styled } from 'linaria/react';
import { useResponsive } from 'ahooks';

import { Quotes } from './Quotes';
import { Button } from '../../parts/Button';
import { Image } from '../../parts/Image';
import { H1, H2 } from '../../parts/Text';

const HeroBackground = styled.div`
  @apply relative;

  height: 90vh;
  text-shadow: 1px 1px 2px black;

  @screen md {
    min-height: 30rem;
  }
`;

const HeroContents = styled.div`
  @apply absolute inset-0 flex flex-col items-center text-white text-center;

  top: 10%;
`;

// todo - rm these once `linaria` plays nice with pre-built components
// related to: https://github.com/callstack/linaria/issues/601
const heroImageClassName = css`
  @apply w-full h-full object-cover object-bottom;
`;

export const Hero = (): JSX.Element => {
  const { md } = useResponsive() ?? {};

  return (
    <HeroBackground>
      <Image className={heroImageClassName} imagePath={'hero.jpg'} />

      <HeroContents>
        <H1 className="bg-black p-2 w-full">The Tale of the Big Computer</H1>
        <H2 className="mt-4 2xl:mt-8">A 1960s novel about technology&nbsp;today</H2>
        <Button className="mt-4 2xl:mt-8 2xl:text-2xl">Preorder now!</Button>

        {md && (
          <Quotes className="flex w-10/12 max-w-6xl mt-auto mb-12 justify-center 2xl:text-2xl" />
        )}
      </HeroContents>
    </HeroBackground>
  );
};
