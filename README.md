# www.bigcomputer.xyz

This project contains the source code driving the public bigcomputer.xyz website.

It is primarily a Next.js app, deployed to && hosted by Vercel. See [Next.js docs](https://nextjs.org/docs/getting-started) for core concepts.

## Installation
Requires a local Node.js environment (recommend [Nodenv](https://github.com/nodenv/nodenv)) && [yarn](https://yarnpkg.com/getting-started/install).

```bash
yarn # to install deps
```

## Development
Our `dev` script proxies to Next.js':
```bash
yarn run dev # starts next.js livereload server
```

## Building
Our `build` scripts also proxy to Next.js':
```bash
yarn run build # creates a next.js prod build
yarn run start # serves the next.js prod build
yarn run export # exports static html/css/js files for the next.js prod build
```

## Deploying
Deploys are managed by Vercel, on the [Big Computer](https://vercel.com/anulman/big-computer) project. Push to deploy!
```bash
git push # builds and deploys to prod on the `main` branch; otherwise to custom subdomains (see vercel or PR for link)
```
