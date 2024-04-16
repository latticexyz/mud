# @latticexyz/faucet

## 2.0.5

### Patch Changes

- Updated dependencies [a9e8a407]
  - @latticexyz/common@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/common@2.0.2

## 2.0.1

### Patch Changes

- @latticexyz/common@2.0.1

## 2.0.0

### Minor Changes

- 9940fdb3e: New package to run your own faucet service. We'll use this soon for our testnet in place of `@latticexyz/services`.

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

- 1d0f7e22b: Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes
- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

### Patch Changes

- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- 301bcb75d: Improves error message when parsing env variables
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 9082c179c: Updated to use MUD's `sendTransaction`, which does a better of managing nonces for higher volumes of transactions.
- fa409e83d: Added README
- Updated dependencies [a35c05ea9]
- Updated dependencies [16b13ea8f]
- Updated dependencies [82693072]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [3fb9ce283]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [307abab3]
- Updated dependencies [aacffcb59]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e34d1170]
- Updated dependencies [b8a6158d6]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [f62c767e7]
- Updated dependencies [590542030]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [b8a6158d6]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [92de59982]
- Updated dependencies [bfcb293d1]
- Updated dependencies [3e057061d]
- Updated dependencies [535229984]
- Updated dependencies [5e723b90e]
- Updated dependencies [0c4f9fea9]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [25086be5f]
- Updated dependencies [b1d41727d]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [c4f49240d]
- Updated dependencies [5df1f31bc]
- Updated dependencies [cea754dde]
- Updated dependencies [331f0d636]
- Updated dependencies [cc2c8da00]
  - @latticexyz/common@2.0.0

## 2.0.0-next.18

### Minor Changes

- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

### Patch Changes

- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [44236041]
- Updated dependencies [307abab3]
- Updated dependencies [e34d1170]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [d7b1c588a]
  - @latticexyz/common@2.0.0-next.18

## 2.0.0-next.17

### Patch Changes

- Updated dependencies [a35c05ea]
- Updated dependencies [aabd3076]
- Updated dependencies [c162ad5a]
  - @latticexyz/common@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- @latticexyz/common@2.0.0-next.16

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
