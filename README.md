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

## Payments
Payments are managed by Stripe. Our flow is roughly:

- Fetch num editions available && SSE connection
    - https://www.oreilly.com/library/view/high-performance-browser/9781449344757/ch16.html
- Create a `Customer`?? https://stripe.com/docs/payments/save-during-payment
    - Looks like we can attach this to a customer after payment completes; that seems smarter: https://stripe.com/docs/api/payment_intents/object#payment_intent_object-setup_future_usage
        - Doesn't work with `Order`s it seems
    - Maybe we should give the user the option "confirm with me before charging the balance" (7d expiry; otherwise reverts to $32 + $5 shipping)?
- Create an `Order` for the appropriate `Product`
- Capture $32 (+ $5 shipping?) immediately from 1-byte buyers
