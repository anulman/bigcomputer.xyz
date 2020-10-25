import React from 'react';
import { css } from 'linaria';
import { styled } from 'linaria/react';

import { Image } from '../../parts/Image';
import { H1 } from '../../parts/Text';

const HeroBackground = styled.div`
  @apply relative;
  height: 90vh;
`;

const HeroContents = styled.div`
  @apply absolute inset-0 mt-4 flex justify-center text-white text-center;
`;

// todo - rm these once `linaria` plays nice with pre-built components
// related to: https://github.com/callstack/linaria/issues/601
const heroImageClassName = css`
  @apply w-full h-full object-cover object-bottom;
`;

const titleClassName = css`
  text-shadow: 1px 1px 2px black;
  font-family: Audiowide, cursive;
`;

export const Hero = (): JSX.Element => (
  <HeroBackground>
    <Image className={heroImageClassName} imagePath={'hero.jpg'} />

    <HeroContents>
      <H1 className={titleClassName}>The Tale of the Big Computer</H1>
    </HeroContents>
  </HeroBackground>
);
