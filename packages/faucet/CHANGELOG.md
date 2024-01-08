# @latticexyz/faucet

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 9082c179: Updated to use MUD's `sendTransaction`, which does a better of managing nonces for higher volumes of transactions.
- Updated dependencies [933b54b5]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [5d737cf2]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/common@2.0.0-next.15

## 2.0.0-next.14

## 2.0.0-next.13

## 2.0.0-next.12

### Minor Changes

- 1d0f7e22: Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8

## 2.0.0-next.10

## 2.0.0-next.9

### Minor Changes

- [#1517](https://github.com/latticexyz/mud/pull/1517) [`9940fdb3`](https://github.com/latticexyz/mud/commit/9940fdb3e036e03aa8ede1ca80cd44d86d3b85b7) Thanks [@holic](https://github.com/holic)! - New package to run your own faucet service. We'll use this soon for our testnet in place of `@latticexyz/services`.

  To run the faucet server:

  - Add the package with `pnpm add @latticexyz/faucet`
  - Add a `.env` file that has a `RPC_HTTP_URL` and `FAUCET_PRIVATE_KEY` (or pass the environment variables into the next command)
  - Run `pnpm faucet-server` to start the server

  You can also adjust the server's `HOST` (defaults to `0.0.0.0`) and `PORT` (defaults to `3002`). The tRPC routes are accessible under `/trpc`.

  To connect a tRPC client, add the package with `pnpm add @latticexyz/faucet` and then use `createClient`:

  ```ts
  import { createClient } from "@latticexyz/faucet";

  const faucet = createClient({ url: "http://localhost:3002/trpc" });

  await faucet.mutate.drip({ address: burnerAccount.address });
  ```

### Patch Changes

- [#1546](https://github.com/latticexyz/mud/pull/1546) [`301bcb75`](https://github.com/latticexyz/mud/commit/301bcb75dd8c15b8ea1a9d0ca8c75c15d7cd92bd) Thanks [@holic](https://github.com/holic)! - Improves error message when parsing env variables

- [#1534](https://github.com/latticexyz/mud/pull/1534) [`fa409e83`](https://github.com/latticexyz/mud/commit/fa409e83db6b76422d525f7d2e9c947dc3c51262) Thanks [@holic](https://github.com/holic)! - Added README
