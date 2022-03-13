module.exports = {
  presets: ['next/babel', 'linaria/babel'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: { '@src': './src', '@public': './public' },
    }],
  ],
};
