import React from 'react';
import Img, { ImgProps } from 'react-optimized-image/lib/components/Img';

type ImageProps = Omit<ImgProps, 'src'> & {
  imagePath: string;
};

export const Image = ({ imagePath, ...rest }: ImageProps): JSX.Element => (
  <Img
    src={require(`../../../assets/images/${imagePath.replace(/^\//, '')}`)}
    {...rest}
  />
);
