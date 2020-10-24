// eslint-disable-next-line @typescript-eslint/no-var-requires
const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  webpack(config) {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: ['linaria/loader'],
    });

    return config;
  },
});
