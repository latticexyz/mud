# @latticexyz/entrykit

## 2.2.21

### Patch Changes

- 236ef3c: The session client's world address (used for delegations and `callFrom`) is now available via `sesssionClient.worldAddress`.

  The local signer is also available via `sesssionClient.internal_signer`. This is marked as internal for now as we may change how this is exposed.

  Using the signer allows for [Sign-in with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) and similar flows that avoid prompting the wallet for a signature, but can be validated via the associated session account <> user account delegation in the world.

- f4db683: Updated error message for unsupported methods in `userOpExecutor`.
- 5a67f40: Added React 19 to peer dependency range.
- 98fc29d: Improved escape key handling when account modal is open. And fixed development warnings about missing dialog title/description.
- 55dae5f: Updated chains supported by Relay.link.
- 4543877: Exported an internal method to validate signatures for login flows that use session signer on behalf of user accounts.
- Updated dependencies [1d354b8]
- Updated dependencies [8cdc57b]
- Updated dependencies [b18c0ef]
  - @latticexyz/common@2.2.21
  - @latticexyz/world@2.2.21
  - @latticexyz/config@2.2.21
  - @latticexyz/protocol-parser@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/world-module-callwithsignature@2.2.21
  - @latticexyz/paymaster@2.2.21

## 2.2.20

### Patch Changes

- Updated dependencies [3915759]
- Updated dependencies [3187081]
- Updated dependencies [06e48e0]
- Updated dependencies [3915759]
- Updated dependencies [06e48e0]
- Updated dependencies [3187081]
  - @latticexyz/world-module-callwithsignature@2.2.20
  - @latticexyz/world@2.2.20
  - @latticexyz/store@2.2.20
  - @latticexyz/common@2.2.20
  - @latticexyz/config@2.2.20
  - @latticexyz/paymaster@2.2.20
  - @latticexyz/protocol-parser@2.2.20

## 2.2.19

### Patch Changes

- 900ac35: Improved fee handling for known chains.
  - @latticexyz/common@2.2.19
  - @latticexyz/config@2.2.19
  - @latticexyz/paymaster@2.2.19
  - @latticexyz/protocol-parser@2.2.19
  - @latticexyz/store@2.2.19
  - @latticexyz/world@2.2.19
  - @latticexyz/world-module-callwithsignature@2.2.19

## 2.2.18

### Patch Changes

- 10ce339: Using EntryKit without a configured bundler will now throw an error.

  Redstone, Garnet, Rhodolite, and Anvil chains come preconfigured. For other chains, you can a bundler RPC URL to your chain config via

  ```ts
  import type { Chain } from "viem";

  const chain = {
    ...
    rpcUrls: {
      ...
      bundler: {
        http: ["https://..."],
      },
    },
  } as const satisfies Chain;
  ```

- 88af932: Improved error handling.
- e1db80a: Clarified `SessionClient` type as using a `SmartAccount` under the hood so that it can be used with smart account-related Viem actions.
- Updated dependencies [5d6fb1b]
- Updated dependencies [10ce339]
  - @latticexyz/store@2.2.18
  - @latticexyz/world@2.2.18
  - @latticexyz/common@2.2.18
  - @latticexyz/world-module-callwithsignature@2.2.18
  - @latticexyz/config@2.2.18
  - @latticexyz/protocol-parser@2.2.18
  - @latticexyz/paymaster@2.2.18

## 2.2.17

### Patch Changes

- d5f4e1e: Bumped react-error-boundary dependency.
- 7385948: Renamed `deploy-local-prereqs` bin to `entrykit-deploy`, which now accepts an RPC URL so that you can deploy the EntryKit prerequisites to your chain of choice.

  ```
  RPC_URL=http://rpc.garnetchain.com pnpm entrykit-deploy
  ```

  This bin supports specifying the RPC URL via `RPC_URL`, `RPC_HTTP_URL`, `FOUNDRY_ETH_RPC_URL` environment variables or `FOUNDRY_PROFILE` if using `eth_rpc_url` in `foundry.toml`.

- ffefc8f: `CallWithSignature` module has been moved out of `@latticexyz/world-modules` and into its own package at `@latticexyz/world-module-callwithsignature`. This module is now installed by default during deploy as its needed by EntryKit.

  If you previously had this module installed in your MUD config, you can now remove it.

  ```diff
   export default defineConfig({
     tables: {
       ...
     },
  -  modules: [
  -    {
  -      artifactPath:
  -        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
  -      root: true,
  -    },
  -  ],
   });
  ```

- Updated dependencies [94d82cf]
- Updated dependencies [589fd3a]
- Updated dependencies [7c3df69]
- Updated dependencies [dead80e]
- Updated dependencies [56e65f6]
- Updated dependencies [ffefc8f]
- Updated dependencies [7385948]
  - @latticexyz/world@2.2.17
  - @latticexyz/common@2.2.17
  - @latticexyz/protocol-parser@2.2.17
  - @latticexyz/world-module-callwithsignature@2.2.17
  - @latticexyz/config@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/paymaster@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/common@2.2.16
- @latticexyz/config@2.2.16
- @latticexyz/paymaster@2.2.16
- @latticexyz/protocol-parser@2.2.16
- @latticexyz/store@2.2.16
- @latticexyz/world@2.2.16
- @latticexyz/world-modules@2.2.16

## 2.2.15

### Patch Changes

- 971ffed: Initial, experimental release of EntryKit.
- Updated dependencies [9580d29]
- Updated dependencies [653f378]
- Updated dependencies [2d2aa08]
- Updated dependencies [09e9bd5]
- Updated dependencies [ba5191c]
- Updated dependencies [1b477d4]
- Updated dependencies [b819749]
- Updated dependencies [22674ad]
- Updated dependencies [9d71887]
- Updated dependencies [509a3cc]
- Updated dependencies [09536b0]
- Updated dependencies [88b9daf]
- Updated dependencies [275c867]
- Updated dependencies [a7625b9]
  - @latticexyz/config@2.2.15
  - @latticexyz/world@2.2.15
  - @latticexyz/common@2.2.15
  - @latticexyz/protocol-parser@2.2.15
  - @latticexyz/store@2.2.15
  - @latticexyz/paymaster@2.2.15
  - @latticexyz/world-modules@2.2.15
