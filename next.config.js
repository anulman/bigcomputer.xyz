/* eslint-disable @typescript-eslint/no-var-requires */
const withCSS = require('@zeit/next-css');
const withOptimizedImages = require('next-optimized-images');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = withOptimizedImages(withCSS({
  webpack(config) {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: ['linaria/loader'],
    });

    return config;
  },
}));
