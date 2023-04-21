# 12. Deploy to the testnet

Lattice provides a testnet you can deploy to with one-second block times (compared to the ~12 seconds of Ethereum mainnet). This is a great way to share your game with others.

We recommend reading the full [deployment guide](/guides/deployment.md) to learn more about the MUD deploy process and our testnets.

## Deploy the contracts

From your `packages/contracts` directory, you'll run `yarn deploy` to deploy them to the testnet. You may need to provide the testnet RPC URL, as well as your deployer's privat key. Make sure to use the faucet to get some testnet ether!

## Deploy the client

We still have a few kinks to work out in MUD to make deploying the client as easy as possible, but you can still build and deploy manually.

From your `packages/client` directory, you'll run `yarn build` to build the client. Then, you can deploy the `packages/client/dist` directory to a static hosting service like [Netlify](https://www.netlify.com/) or [Cloudflare Pages](https://pages.cloudflare.com/).

We'll be adding more deploy guides for providers like [Vercel](https://vercel.com/) in the near future. Stay tuned!
