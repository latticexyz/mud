# @latticexyz/faucet

## 2.2.19

### Patch Changes

- @latticexyz/common@2.2.19

## 2.2.18

### Patch Changes

- Updated dependencies [10ce339]
  - @latticexyz/common@2.2.18

## 2.2.17

### Patch Changes

- Updated dependencies [589fd3a]
- Updated dependencies [7385948]
  - @latticexyz/common@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/common@2.2.16

## 2.2.15

### Patch Changes

- 09e9bd5: Moved viem to peer dependencies to ensure a single, consistent version is installed in downstream projects.
- Updated dependencies [09e9bd5]
- Updated dependencies [9d71887]
- Updated dependencies [88b9daf]
  - @latticexyz/common@2.2.15

## 2.2.14

### Patch Changes

- @latticexyz/common@2.2.14

## 2.2.13

### Patch Changes

- @latticexyz/common@2.2.13

## 2.2.12

### Patch Changes

- 20f44fb: Added bin wrappers to resolve issues when installing the package locally as a dependency of another package.
- ea18f27: Bumped viem to v2.21.19.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.19
  ```

- Updated dependencies [ea18f27]
- Updated dependencies [41a6e2f]
- Updated dependencies [fe98442]
  - @latticexyz/common@2.2.12

## 2.2.11

### Patch Changes

- Updated dependencies [7ddcf64]
  - @latticexyz/common@2.2.11

## 2.2.10

### Patch Changes

- @latticexyz/common@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/common@2.2.9

## 2.2.8

### Patch Changes

- Updated dependencies [7c7bdb2]
  - @latticexyz/common@2.2.8

## 2.2.7

### Patch Changes

- @latticexyz/common@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/common@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/common@2.2.5

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
  - @latticexyz/common@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/common@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/common@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [c0764a5]
  - @latticexyz/common@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [69cd0a1]
  - @latticexyz/common@2.2.0

## 2.1.1

### Patch Changes

- 6435481: Upgrade `zod` to `3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).
- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- Updated dependencies [9e21e42]
- Updated dependencies [2daaab1]
  - @latticexyz/common@2.1.1

## 2.1.0

### Patch Changes

- Updated dependencies [7129a16]
- Updated dependencies [8d0453e]
  - @latticexyz/common@2.1.0

## 2.0.12

### Patch Changes

- 96e7bf430: TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

  If you have a MUD project that you're upgrading, we suggest adding a `tsconfig.json` file to your project workspace that extends this base config.

  ```sh
  pnpm add -D @latticexyz/common
  echo "{\n  \"extends\": \"@latticexyz/common/tsconfig.base.json\"\n}" > tsconfig.json
  ```

  Then in each package of your project, inherit from your workspace root's config.

  For example, your TS config in `packages/contracts/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json"
  }
  ```

  And your TS config in `packages/client/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "types": ["vite/client"],
      "target": "ESNext",
      "lib": ["ESNext", "DOM"],
      "jsx": "react-jsx",
      "jsxImportSource": "react"
    },
    "include": ["src"]
  }
  ```

  You may need to adjust the above configs to include any additional TS options you've set. This config pattern may also reveal new TS errors that need to be fixed or rules disabled.

  If you want to keep your existing TS configs, we recommend at least updating your `moduleResolution` setting.

  ```diff
  -"moduleResolution": "node"
  +"moduleResolution": "Bundler"
  ```

- Updated dependencies [96e7bf430]
  - @latticexyz/common@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/common@2.0.11

## 2.0.10

### Patch Changes

- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- Updated dependencies [51b137d3]
  - @latticexyz/common@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [375d902e]
- Updated dependencies [38c61158]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7

## 2.0.6

### Patch Changes

- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6

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
