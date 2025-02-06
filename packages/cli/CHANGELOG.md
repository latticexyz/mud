# Change Log

## 2.2.18

### Patch Changes

- Updated dependencies [5d6fb1b]
- Updated dependencies [10ce339]
- Updated dependencies [df5d393]
  - @latticexyz/store@2.2.18
  - @latticexyz/world@2.2.18
  - @latticexyz/common@2.2.18
  - @latticexyz/store-sync@2.2.18
  - @latticexyz/world-module-callwithsignature@2.2.18
  - @latticexyz/world-module-metadata@2.2.18
  - @latticexyz/block-logs-stream@2.2.18
  - @latticexyz/config@2.2.18
  - @latticexyz/protocol-parser@2.2.18
  - @latticexyz/abi-ts@2.2.18
  - @latticexyz/gas-report@2.2.18
  - @latticexyz/schema-type@2.2.18
  - @latticexyz/utils@2.2.18

## 2.2.17

### Patch Changes

- 452d3e5: The `verify` command should now be able to correctly verify systems using public libraries.
- 7385948: Added an empty line to the end of `.json` output files for consistency.
  Removed some unnecessary defaults to allow them to pass through via environment variables.
- 5aa8a3a: Fixed an issue with `mud verify` where system contract artifacts were being resolved incorrectly.
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

- 090c922: The world address stored in `worlds.json` and `deploys/latest.json` is now checksummed.
- f52b147: Deploy now prints the current MUD CLI version for easier debugging.
- Updated dependencies [94d82cf]
- Updated dependencies [5a9e238]
- Updated dependencies [9321a5c]
- Updated dependencies [589fd3a]
- Updated dependencies [7c3df69]
- Updated dependencies [40aaf97]
- Updated dependencies [227db4d]
- Updated dependencies [dead80e]
- Updated dependencies [56e65f6]
- Updated dependencies [ffefc8f]
- Updated dependencies [7385948]
  - @latticexyz/world@2.2.17
  - @latticexyz/store-sync@2.2.17
  - @latticexyz/block-logs-stream@2.2.17
  - @latticexyz/common@2.2.17
  - @latticexyz/protocol-parser@2.2.17
  - @latticexyz/world-module-callwithsignature@2.2.17
  - @latticexyz/world-module-metadata@2.2.17
  - @latticexyz/config@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/abi-ts@2.2.17
  - @latticexyz/gas-report@2.2.17
  - @latticexyz/schema-type@2.2.17
  - @latticexyz/utils@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/abi-ts@2.2.16
- @latticexyz/block-logs-stream@2.2.16
- @latticexyz/common@2.2.16
- @latticexyz/config@2.2.16
- @latticexyz/gas-report@2.2.16
- @latticexyz/protocol-parser@2.2.16
- @latticexyz/schema-type@2.2.16
- @latticexyz/store@2.2.16
- @latticexyz/store-sync@2.2.16
- @latticexyz/utils@2.2.16
- @latticexyz/world@2.2.16
- @latticexyz/world-module-metadata@2.2.16

## 2.2.15

### Patch Changes

- 1e09240: When upgrading an existing world, the deployer now attempts to read the deploy block number from the `worlds.json` file. If it is found, the `HelloWorld` and `HelloStore` event are fetched from this block instead of searching for the events starting from the genesis block.
- 3168f1f: Deployer now retrieves resource tags by fetching logs to work around RPC rate limiting issues.
- ee388ed: Deployer will now throw an error if it detects an already registered table with a different schema than the one you are trying to deploy.
- 7409095: In addition to a hex `--salt`, deploy commands now accept a string salt for world deployment, which will get converted to a hex.

  ```
  pnpm mud deploy --salt hello
  ```

- 8fcf9c8: Fixed an issue with overloaded system ABI types.
- b819749: Added an `indexerUrl` option to the `mud deploy` and `mud pull` CLI commands to read table records from an indexer instead of fetching logs from an Ethereum RPC.
- Updated dependencies [9580d29]
- Updated dependencies [1770620]
- Updated dependencies [653f378]
- Updated dependencies [2d2aa08]
- Updated dependencies [5f493cd]
- Updated dependencies [cd9fd0a]
- Updated dependencies [09e9bd5]
- Updated dependencies [ba5191c]
- Updated dependencies [1b477d4]
- Updated dependencies [b819749]
- Updated dependencies [5340394]
- Updated dependencies [22674ad]
- Updated dependencies [9d71887]
- Updated dependencies [509a3cc]
- Updated dependencies [9ddc874]
- Updated dependencies [09536b0]
- Updated dependencies [a6fe15c]
- Updated dependencies [88b9daf]
- Updated dependencies [275c867]
  - @latticexyz/config@2.2.15
  - @latticexyz/store-sync@2.2.15
  - @latticexyz/world@2.2.15
  - @latticexyz/block-logs-stream@2.2.15
  - @latticexyz/common@2.2.15
  - @latticexyz/protocol-parser@2.2.15
  - @latticexyz/schema-type@2.2.15
  - @latticexyz/store@2.2.15
  - @latticexyz/abi-ts@2.2.15
  - @latticexyz/world-module-metadata@2.2.15
  - @latticexyz/gas-report@2.2.15
  - @latticexyz/utils@2.2.15

## 2.2.14

### Patch Changes

- 8eaad30: Added support for deploying public libraries used within modules.
  - @latticexyz/abi-ts@2.2.14
  - @latticexyz/block-logs-stream@2.2.14
  - @latticexyz/common@2.2.14
  - @latticexyz/config@2.2.14
  - @latticexyz/gas-report@2.2.14
  - @latticexyz/protocol-parser@2.2.14
  - @latticexyz/schema-type@2.2.14
  - @latticexyz/store@2.2.14
  - @latticexyz/utils@2.2.14
  - @latticexyz/world@2.2.14
  - @latticexyz/world-module-metadata@2.2.14

## 2.2.13

### Patch Changes

- Updated dependencies [d5c2700]
- Updated dependencies [75e93ba]
  - @latticexyz/gas-report@2.2.13
  - @latticexyz/abi-ts@2.2.13
  - @latticexyz/schema-type@2.2.13
  - @latticexyz/store@2.2.13
  - @latticexyz/world@2.2.13
  - @latticexyz/world-module-metadata@2.2.13
  - @latticexyz/block-logs-stream@2.2.13
  - @latticexyz/common@2.2.13
  - @latticexyz/config@2.2.13
  - @latticexyz/protocol-parser@2.2.13
  - @latticexyz/utils@2.2.13

## 2.2.12

### Patch Changes

- ea18f27: Bumped viem to v2.21.19.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.19
  ```

- Updated dependencies [ea18f27]
- Updated dependencies [41a6e2f]
- Updated dependencies [fe98442]
  - @latticexyz/block-logs-stream@2.2.12
  - @latticexyz/common@2.2.12
  - @latticexyz/config@2.2.12
  - @latticexyz/protocol-parser@2.2.12
  - @latticexyz/schema-type@2.2.12
  - @latticexyz/store@2.2.12
  - @latticexyz/world@2.2.12
  - @latticexyz/world-module-metadata@2.2.12
  - @latticexyz/abi-ts@2.2.12
  - @latticexyz/gas-report@2.2.12
  - @latticexyz/utils@2.2.12

## 2.2.11

### Patch Changes

- 111bb1b: Fixed a dev runner bug where the state block of a previous deploy was not updated during a redeploy, causing failed deploys due to fetching outdated world state.
- 7ddcf64: Deployer now has a better method for fetching store logs from the world that should be more efficient and resilient to block range errors and rate limiting.
- 9e53a51: Added a `mud pull` command that downloads state from an existing world and uses it to generate a MUD config with tables and system interfaces. This makes it much easier to extend worlds.

  ```
  mud pull --worldAddress 0x… --rpc https://…
  ```

- Updated dependencies [7ddcf64]
- Updated dependencies [7ddcf64]
- Updated dependencies [13e5689]
- Updated dependencies [7ddcf64]
  - @latticexyz/block-logs-stream@2.2.11
  - @latticexyz/store@2.2.11
  - @latticexyz/common@2.2.11
  - @latticexyz/world@2.2.11
  - @latticexyz/world-module-metadata@2.2.11
  - @latticexyz/config@2.2.11
  - @latticexyz/protocol-parser@2.2.11
  - @latticexyz/abi-ts@2.2.11
  - @latticexyz/gas-report@2.2.11
  - @latticexyz/schema-type@2.2.11
  - @latticexyz/utils@2.2.11

## 2.2.10

### Patch Changes

- Updated dependencies [9d7fc85]
  - @latticexyz/world@2.2.10
  - @latticexyz/world-module-metadata@2.2.10
  - @latticexyz/abi-ts@2.2.10
  - @latticexyz/block-logs-stream@2.2.10
  - @latticexyz/common@2.2.10
  - @latticexyz/config@2.2.10
  - @latticexyz/gas-report@2.2.10
  - @latticexyz/protocol-parser@2.2.10
  - @latticexyz/schema-type@2.2.10
  - @latticexyz/store@2.2.10
  - @latticexyz/utils@2.2.10

## 2.2.9

### Patch Changes

- 9d990b5: Adjusted deploy order so that the world deploy happens before everything else to avoid spending gas on system contract deploys, etc. if a world cannot be created first.
  - @latticexyz/abi-ts@2.2.9
  - @latticexyz/block-logs-stream@2.2.9
  - @latticexyz/common@2.2.9
  - @latticexyz/config@2.2.9
  - @latticexyz/gas-report@2.2.9
  - @latticexyz/protocol-parser@2.2.9
  - @latticexyz/schema-type@2.2.9
  - @latticexyz/store@2.2.9
  - @latticexyz/utils@2.2.9
  - @latticexyz/world@2.2.9
  - @latticexyz/world-module-metadata@2.2.9

## 2.2.8

### Patch Changes

- 0f5b291: When deploying to an existing world, the deployer now paginates with [`fetchLogs`](https://github.com/latticexyz/mud/blob/main/packages/block-logs-stream/src/fetchLogs.ts) to find the world deployment.
- b071198: If the project is using a custom world, the deployer now waits for the init transaction to be confirmed before transferring ownership of the world.
- Updated dependencies [7c7bdb2]
- Updated dependencies [0f5b291]
  - @latticexyz/common@2.2.8
  - @latticexyz/block-logs-stream@2.2.8
  - @latticexyz/config@2.2.8
  - @latticexyz/protocol-parser@2.2.8
  - @latticexyz/store@2.2.8
  - @latticexyz/world@2.2.8
  - @latticexyz/world-module-metadata@2.2.8
  - @latticexyz/abi-ts@2.2.8
  - @latticexyz/gas-report@2.2.8
  - @latticexyz/schema-type@2.2.8
  - @latticexyz/utils@2.2.8

## 2.2.7

### Patch Changes

- 58f101e: Reduced the log noise from enabling/disabling automine on non-Anvil chains.
- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/world@2.2.7
  - @latticexyz/world-module-metadata@2.2.7
  - @latticexyz/abi-ts@2.2.7
  - @latticexyz/common@2.2.7
  - @latticexyz/config@2.2.7
  - @latticexyz/gas-report@2.2.7
  - @latticexyz/protocol-parser@2.2.7
  - @latticexyz/schema-type@2.2.7
  - @latticexyz/utils@2.2.7

## 2.2.6

### Patch Changes

- 22c37c3: Significantly improved the deployment performance for large projects with public libraries by implementing a more efficient algorithm to resolve public libraries during deployment.
  The local deployment time on a large reference project was reduced from over 10 minutes to 4 seconds.
  - @latticexyz/abi-ts@2.2.6
  - @latticexyz/common@2.2.6
  - @latticexyz/config@2.2.6
  - @latticexyz/gas-report@2.2.6
  - @latticexyz/protocol-parser@2.2.6
  - @latticexyz/schema-type@2.2.6
  - @latticexyz/store@2.2.6
  - @latticexyz/utils@2.2.6
  - @latticexyz/world@2.2.6
  - @latticexyz/world-module-metadata@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/abi-ts@2.2.5
- @latticexyz/common@2.2.5
- @latticexyz/config@2.2.5
- @latticexyz/gas-report@2.2.5
- @latticexyz/protocol-parser@2.2.5
- @latticexyz/schema-type@2.2.5
- @latticexyz/store@2.2.5
- @latticexyz/utils@2.2.5
- @latticexyz/world@2.2.5
- @latticexyz/world-module-metadata@2.2.5

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- d3acd92: Along with table and system labels, the MUD deployer now registers namespace labels. Additionally, labels will only be registered if they differ from the underlying resource name.
- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
- Updated dependencies [1f24978]
- Updated dependencies [8b4110e]
  - @latticexyz/common@2.2.4
  - @latticexyz/config@2.2.4
  - @latticexyz/protocol-parser@2.2.4
  - @latticexyz/schema-type@2.2.4
  - @latticexyz/store@2.2.4
  - @latticexyz/world@2.2.4
  - @latticexyz/world-module-metadata@2.2.4
  - @latticexyz/abi-ts@2.2.4
  - @latticexyz/gas-report@2.2.4
  - @latticexyz/utils@2.2.4

## 2.2.3

### Patch Changes

- 8546452: MUD config now supports a `deploy.customWorld` option that, when used with the CLI, will deploy the specified custom World implementation.
  Custom implementations must still follow [the World protocol](https://github.com/latticexyz/mud/tree/main/packages/world/ts/protocol-snapshots).

  If you want to extend the world with new functions or override existing registered functions, we recommend using [root systems](https://mud.dev/world/systems#root-systems).
  However, there are rare cases where this may not be enough to modify the native/internal World behavior.
  Note that deploying a custom World opts out of the world factory, deterministic world deploys, and upgradeable implementation proxy.

  ```ts
  import { defineWorld } from "@latticexyz/world";

  export default defineWorld({
    customWorld: {
      // path to custom world source from project root
      sourcePath: "src/CustomWorld.sol",
      // custom world contract name
      name: "CustomWorld",
    },
  });
  ```

- d3ab5c3: Speed up deployment in development by temporarily enabling automine mode for the duration of the deployment.
- Updated dependencies [8546452]
  - @latticexyz/world@2.2.3
  - @latticexyz/world-module-metadata@2.2.3
  - @latticexyz/abi-ts@2.2.3
  - @latticexyz/common@2.2.3
  - @latticexyz/config@2.2.3
  - @latticexyz/gas-report@2.2.3
  - @latticexyz/protocol-parser@2.2.3
  - @latticexyz/schema-type@2.2.3
  - @latticexyz/store@2.2.3
  - @latticexyz/utils@2.2.3

## 2.2.2

### Patch Changes

- ef6f7c0: Fixed regression in 2.2.1 where deployment of modules already installed would throw an error instead of skipping.
  - @latticexyz/abi-ts@2.2.2
  - @latticexyz/common@2.2.2
  - @latticexyz/config@2.2.2
  - @latticexyz/gas-report@2.2.2
  - @latticexyz/protocol-parser@2.2.2
  - @latticexyz/schema-type@2.2.2
  - @latticexyz/store@2.2.2
  - @latticexyz/utils@2.2.2
  - @latticexyz/world@2.2.2
  - @latticexyz/world-module-metadata@2.2.2

## 2.2.1

### Patch Changes

- 0738d29: Deployer now waits for prerequisite transactions before continuing.
- Updated dependencies [c0764a5]
  - @latticexyz/common@2.2.1
  - @latticexyz/config@2.2.1
  - @latticexyz/protocol-parser@2.2.1
  - @latticexyz/store@2.2.1
  - @latticexyz/world@2.2.1
  - @latticexyz/world-module-metadata@2.2.1
  - @latticexyz/abi-ts@2.2.1
  - @latticexyz/gas-report@2.2.1
  - @latticexyz/schema-type@2.2.1
  - @latticexyz/utils@2.2.1

## 2.2.0

### Patch Changes

- 04c675c: Add a strongly typed `namespaceLabel` to the system config output.
  It corresponds to the `label` of the namespace the system belongs to and can't be set manually.
- 31caecc: In addition to table labels, system labels and ABIs are now registered onchain during deploy.
- Updated dependencies [69cd0a1]
- Updated dependencies [04c675c]
- Updated dependencies [04c675c]
  - @latticexyz/common@2.2.0
  - @latticexyz/config@2.2.0
  - @latticexyz/store@2.2.0
  - @latticexyz/world@2.2.0
  - @latticexyz/protocol-parser@2.2.0
  - @latticexyz/world-module-metadata@2.2.0
  - @latticexyz/abi-ts@2.2.0
  - @latticexyz/gas-report@2.2.0
  - @latticexyz/schema-type@2.2.0
  - @latticexyz/utils@2.2.0

## 2.1.1

### Patch Changes

- 6435481: Upgrade `zod` to `3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).
- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- fad4e85: Added metadata module to be automatically installed during world deploy. This module allows for tagging any resource with arbitrary metadata. Internally, we'll use this to tag resources with labels onchain so that we can use labels to create a MUD project from an existing world.
- Updated dependencies [9e21e42]
- Updated dependencies [6a66f57]
- Updated dependencies [86a8104]
- Updated dependencies [fad4e85]
- Updated dependencies [2daaab1]
- Updated dependencies [542ea54]
- Updated dependencies [57bf8c3]
  - @latticexyz/common@2.1.1
  - @latticexyz/config@2.1.1
  - @latticexyz/protocol-parser@2.1.1
  - @latticexyz/schema-type@2.1.1
  - @latticexyz/store@2.1.1
  - @latticexyz/world@2.1.1
  - @latticexyz/world-module-metadata@2.1.1
  - @latticexyz/abi-ts@2.1.1
  - @latticexyz/gas-report@2.1.1
  - @latticexyz/utils@2.1.1

## 2.1.0

### Minor Changes

- a10b453: MUD projects can now use multiple namespaces via a new top-level `namespaces` config option.

  ```ts
  import { defineWorld } from "@latticexyz/world";

  export default defineWorld({
    namespaces: {
      game: {
        tables: {
          Player: { ... },
          Position: { ... },
        },
      },
      guilds: {
        tables: {
          Guild: { ... },
        },
        systems: {
          MembershipSystem: { ... },
          TreasurySystem: { ... },
        },
      },
    },
  });
  ```

  Once you use the top-level `namespaces` config option, your project will be in "multiple namespaces mode", which expects a source directory structure similar to the config structure: a top-level `namespaces` directory with nested namespace directories that correspond to each namespace label in the config.

  ```
  ~/guilds
  ├── mud.config.ts
  └── src
      └── namespaces
          ├── game
          │   └── codegen
          │       └── tables
          │           ├── Player.sol
          │           └── Position.sol
          └── guilds
              ├── MembershipSystem.sol
              ├── TreasurySystem.sol
              └── codegen
                  └── tables
                      └── Guild.sol
  ```

### Patch Changes

- 3cbbc62: Refactored package to use the new Store/World configs under the hood, removing compatibility layers.

  Removed `--srcDir` option from all commands in favor of using `sourceDirectory` in the project's MUD config.

- 24e285d: `mud deploy` will now correctly skip tables configured with `deploy: { disabled: true }`.
- 2da9e48: Refactored CLI commands to use tables from config namespaces output. This is a precursor for supporting multiple namespaces.
- 609de11: Refactored `mud trace` command to use Viem instead of Ethers and removed Ethers dependencies from the package.
- e49059f: Bumped `glob` dependency.
- Updated dependencies [24e285d]
- Updated dependencies [570086e]
- Updated dependencies [7129a16]
- Updated dependencies [3cbbc62]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [a10b453]
- Updated dependencies [69eb63b]
- Updated dependencies [e49059f]
- Updated dependencies [8d0453e]
- Updated dependencies [fb1cfef]
  - @latticexyz/store@2.1.0
  - @latticexyz/world@2.1.0
  - @latticexyz/config@2.1.0
  - @latticexyz/common@2.1.0
  - @latticexyz/abi-ts@2.1.0
  - @latticexyz/protocol-parser@2.1.0
  - @latticexyz/gas-report@2.1.0
  - @latticexyz/schema-type@2.1.0
  - @latticexyz/utils@2.1.0

## 2.0.12

### Patch Changes

- 9be2bb863: Fixed `resolveTableId` usage within config's module `args` to allow referencing both namespaced tables (e.g. `resolveTableId("app_Tasks")`) as well as tables by just their name (e.g. `resolveTableId("Tasks")`). Note that using just the table name requires it to be unique among all tables within the config.

  This helper is now exported from `@latticexyz/world` package as intended. The previous, deprecated export has been removed.

  ```diff
  -import { resolveTableId } from "@latticexyz/config/library";
  +import { resolveTableId } from "@latticexyz/world/internal";
  ```

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

- Updated dependencies [c10c9fb2d]
- Updated dependencies [c10c9fb2d]
- Updated dependencies [9be2bb863]
- Updated dependencies [96e7bf430]
  - @latticexyz/store@2.0.12
  - @latticexyz/world@2.0.12
  - @latticexyz/abi-ts@2.0.12
  - @latticexyz/common@2.0.12
  - @latticexyz/config@2.0.12
  - @latticexyz/gas-report@2.0.12
  - @latticexyz/protocol-parser@2.0.12
  - @latticexyz/schema-type@2.0.12
  - @latticexyz/utils@2.0.12

## 2.0.11

### Patch Changes

- fe9d7263: Fixed imports of module artifacts via `artifactPath` and removed unused `@latticexyz/world-modules` dependency.
  - @latticexyz/abi-ts@2.0.11
  - @latticexyz/common@2.0.11
  - @latticexyz/config@2.0.11
  - @latticexyz/gas-report@2.0.11
  - @latticexyz/protocol-parser@2.0.11
  - @latticexyz/schema-type@2.0.11
  - @latticexyz/store@2.0.11
  - @latticexyz/utils@2.0.11
  - @latticexyz/world@2.0.11

## 2.0.10

### Patch Changes

- 0ae9189c: The deploy CLI now uses logs to find registered function selectors and their corresponding function signatures.
  Previously only function signatures were fetched via logs and then mapped to function selectors via `getRecord` calls,
  but this approach failed for namespaced function selectors of non-root system,
  because the function signature table includes both the namespaced and non-namespaced signature but the function selector table only includes the namespaced selector that is registered on the world.
- a1b1ebf6: Worlds can now be deployed with external modules, defined by a module's `artifactPath` in your MUD config, resolved with Node's module resolution. This allows for modules to be published to and imported from npm.

  ```diff
   defineWorld({
     // …
     modules: [
       {
  -      name: "KeysWithValueModule",
  +      artifactPath: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
         root: true,
         args: [resolveTableId("Inventory")],
       },
     ],
   });
  ```

  Note that the above assumes `@latticexyz/world-modules` is included as a dependency of your project.

- 4e4e9104: Removed the unused `ejs` dependency.
- 4a61a128: Removed broken `mud faucet` command.
- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- Updated dependencies [a1b1ebf6]
- Updated dependencies [4e4e9104]
- Updated dependencies [4e4e9104]
- Updated dependencies [51b137d3]
- Updated dependencies [3dbf3bf3]
- Updated dependencies [32c1cda6]
- Updated dependencies [4caca05e]
- Updated dependencies [27f888c7]
  - @latticexyz/world@2.0.10
  - @latticexyz/world-modules@2.0.10
  - @latticexyz/store@2.0.10
  - @latticexyz/common@2.0.10
  - @latticexyz/config@2.0.10
  - @latticexyz/protocol-parser@2.0.10
  - @latticexyz/abi-ts@2.0.10
  - @latticexyz/gas-report@2.0.10
  - @latticexyz/schema-type@2.0.10
  - @latticexyz/utils@2.0.10

## 2.0.9

### Patch Changes

- 30318687: Fixed `mud deploy` to not require the `PRIVATE_KEY` environment variable when using a KMS signer.
- 0b6b70ff: `mud verify` now defaults to blockscout if no `--verifier` is provided.
- 428ff972: Fixed `mud deploy` to use the `forge script --aws` flag when executing `PostDeploy` with a KMS signer.

  Note that you may need to update your `PostDeploy.s.sol` script, with `vm.startBroadcast` receiving no arguments instead of reading a private key from the environment:

  ```diff
  -uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
  -vm.startBroadcast(deployerPrivateKey);

  +vm.startBroadcast();
  ```

- 074ed66e: Removed manual gas setting in PostDeploy step of `mud deploy` in favor of `forge script` fetching it from the RPC.

  If you still want to manually set gas, you can use `mud deploy --forgeScriptOptions="--with-gas-price 1000000"`.

- e03830eb: The key ID for deploying via KMS signer is now set via an `AWS_KMS_KEY_ID` environment variable to better align with Foundry tooling. To enable KMS signing with this environment variable, use the `--kms` flag.

  ```diff
  -mud deploy --awsKmsKeyId [key ID]
  +AWS_KMS_KEY_ID=[key ID] mud deploy --kms
  ```

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9
  - @latticexyz/config@2.0.9
  - @latticexyz/protocol-parser@2.0.9
  - @latticexyz/store@2.0.9
  - @latticexyz/world@2.0.9
  - @latticexyz/world-modules@2.0.9
  - @latticexyz/abi-ts@2.0.9
  - @latticexyz/gas-report@2.0.9
  - @latticexyz/schema-type@2.0.9
  - @latticexyz/services@2.0.9
  - @latticexyz/utils@2.0.9

## 2.0.8

### Patch Changes

- b4eb795e: Patched `mud verify` to properly verify store, world, and world-modules contracts. Currently only `sourcify` is fully supported and is the default verifier.
- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/config@2.0.8
  - @latticexyz/protocol-parser@2.0.8
  - @latticexyz/store@2.0.8
  - @latticexyz/world@2.0.8
  - @latticexyz/world-modules@2.0.8
  - @latticexyz/abi-ts@2.0.8
  - @latticexyz/gas-report@2.0.8
  - @latticexyz/schema-type@2.0.8
  - @latticexyz/services@2.0.8
  - @latticexyz/utils@2.0.8

## 2.0.7

### Patch Changes

- c74a6647: Added a `--awsKmsKeyId` flag to `mud deploy` that deploys the world using an AWS KMS key as a transaction signer.
- dbc7e066: Deploying now retries on "block is out of range" errors, for cases where the RPC is load balanced and out of sync.
- 189050bd: Deploy will now fetch and set the gas price during execution of PostDeploy script. This should greatly reduce the fees paid for L2s.
- fce741b0: Added a new `mud verify` command which verifies all contracts in a project. This includes systems, modules, the WorldFactory and World.
- 632a7525: Fixed an issue where deploys were warning about mismatched bytecode when the bytecode was correct and what we expect.
- 3d1d5905: Added a `deploy.upgradeableWorldImplementation` option to the MUD config that deploys the World as an upgradeable proxy contract. The proxy behaves like a regular World contract, but the underlying implementation can be upgraded by calling `setImplementation`.
- 8493f88f: Added a `--forgeScriptOptions` flag to deploy and dev commands to allow passing in additional CLI flags to `forge script` command.
- Updated dependencies [375d902e]
- Updated dependencies [78a94d71]
- Updated dependencies [38c61158]
- Updated dependencies [3d1d5905]
- Updated dependencies [ed404b7d]
- Updated dependencies [2c9b16c7]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/world-modules@2.0.7
  - @latticexyz/world@2.0.7
  - @latticexyz/store@2.0.7
  - @latticexyz/config@2.0.7
  - @latticexyz/protocol-parser@2.0.7
  - @latticexyz/abi-ts@2.0.7
  - @latticexyz/gas-report@2.0.7
  - @latticexyz/schema-type@2.0.7
  - @latticexyz/services@2.0.7
  - @latticexyz/utils@2.0.7

## 2.0.6

### Patch Changes

- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [103db6ce]
- Updated dependencies [96e82b7f]
- Updated dependencies [9720b568]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6
  - @latticexyz/store@2.0.6
  - @latticexyz/world-modules@2.0.6
  - @latticexyz/world@2.0.6
  - @latticexyz/config@2.0.6
  - @latticexyz/protocol-parser@2.0.6
  - @latticexyz/schema-type@2.0.6
  - @latticexyz/abi-ts@2.0.6
  - @latticexyz/gas-report@2.0.6
  - @latticexyz/services@2.0.6
  - @latticexyz/utils@2.0.6

## 2.0.5

### Patch Changes

- d02efd80: Replaced the `Unstable_DelegationWithSignatureModule` preview module with a more generalized `Unstable_CallWithSignatureModule` that allows making arbitrary calls (similar to `callFrom`).

  This module is still marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

- Updated dependencies [e2e8ec8b]
- Updated dependencies [a9e8a407]
- Updated dependencies [081c3967]
- Updated dependencies [e3c3a118]
- Updated dependencies [b798ccb2]
- Updated dependencies [d02efd80]
  - @latticexyz/world-modules@2.0.5
  - @latticexyz/common@2.0.5
  - @latticexyz/store@2.0.5
  - @latticexyz/world@2.0.5
  - @latticexyz/config@2.0.5
  - @latticexyz/protocol-parser@2.0.5
  - @latticexyz/abi-ts@2.0.5
  - @latticexyz/gas-report@2.0.5
  - @latticexyz/schema-type@2.0.5
  - @latticexyz/services@2.0.5
  - @latticexyz/utils@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/config@2.0.4
  - @latticexyz/protocol-parser@2.0.4
  - @latticexyz/store@2.0.4
  - @latticexyz/world@2.0.4
  - @latticexyz/world-modules@2.0.4
  - @latticexyz/abi-ts@2.0.4
  - @latticexyz/gas-report@2.0.4
  - @latticexyz/schema-type@2.0.4
  - @latticexyz/services@2.0.4
  - @latticexyz/utils@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/world@2.0.3
  - @latticexyz/config@2.0.3
  - @latticexyz/protocol-parser@2.0.3
  - @latticexyz/store@2.0.3
  - @latticexyz/world-modules@2.0.3
  - @latticexyz/abi-ts@2.0.3
  - @latticexyz/gas-report@2.0.3
  - @latticexyz/schema-type@2.0.3
  - @latticexyz/services@2.0.3
  - @latticexyz/utils@2.0.3

## 2.0.2

### Patch Changes

- e86bd14d: Added a new preview module, `Unstable_DelegationWithSignatureModule`, which allows registering delegations with a signature.

  Note: this module is marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

- 3b845d6b: Remove workaround for generating `IWorld` interface from cached forge files as this was fixed by forge.
- Updated dependencies [e86bd14d]
- Updated dependencies [a09bf251]
  - @latticexyz/world-modules@2.0.2
  - @latticexyz/world@2.0.2
  - @latticexyz/abi-ts@2.0.2
  - @latticexyz/common@2.0.2
  - @latticexyz/config@2.0.2
  - @latticexyz/gas-report@2.0.2
  - @latticexyz/protocol-parser@2.0.2
  - @latticexyz/schema-type@2.0.2
  - @latticexyz/services@2.0.2
  - @latticexyz/store@2.0.2
  - @latticexyz/utils@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/world@2.0.1
  - @latticexyz/world-modules@2.0.1
  - @latticexyz/abi-ts@2.0.1
  - @latticexyz/common@2.0.1
  - @latticexyz/config@2.0.1
  - @latticexyz/gas-report@2.0.1
  - @latticexyz/protocol-parser@2.0.1
  - @latticexyz/schema-type@2.0.1
  - @latticexyz/services@2.0.1
  - @latticexyz/utils@2.0.1

## 2.0.0

### Major Changes

- 07dd6f32c: Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
  The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

  ```diff
  // mud.config.ts
  export default mudConfig({
    tables: {
      CounterTable: {
        keySchema: {},
  -     schema: {
  +     valueSchema: {
          value: "uint32",
        },
      },
    }
  }
  ```

- 44236041f: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- 952cd5344: All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
  This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

  ```diff
    function setRecord(
      bytes32 table,
      bytes32[] calldata key,
      bytes calldata data,
  +   Schema valueSchema
    ) external;
  ```

  The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

  This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
  so downstream projects only need to regenerate their table libraries after updating MUD.

- de151fec0: - Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

  - Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

    `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

  - Add `getFieldLayout` to `IStore` interface.

    There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

  - Add `fieldLayoutToHex` utility to `protocol-parser` package.
  - Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.

- c32a9269a: - All `World` function selectors that previously had `bytes16 namespace, bytes16 name` arguments now use `bytes32 resourceSelector` instead.
  This includes `setRecord`, `setField`, `pushToField`, `popFromField`, `updateInField`, `deleteRecord`, `call`, `grantAccess`, `revokeAccess`, `registerTable`,
  `registerStoreHook`, `registerSystemHook`, `registerFunctionSelector`, `registerSystem` and `registerRootFunctionSelector`.
  This change aligns the `World` function selectors with the `Store` function selectors, reduces clutter, reduces gas cost and reduces the `World`'s contract size.

  - The `World`'s `registerHook` function is removed. Use `registerStoreHook` or `registerSystemHook` instead.
  - The `deploy` script is updated to integrate the World interface changes

- e5d208e40: The `registerRootFunctionSelector` function's signature was changed to accept a `string functionSignature` parameter instead of a `bytes4 functionSelector` parameter.
  This change enables the `World` to store the function signatures of all registered functions in a `FunctionSignatures` offchain table, which will allow for the automatic generation of interfaces for a given `World` address in the future.

  ```diff
  IBaseWorld {
    function registerRootFunctionSelector(
      ResourceId systemId,
  -   bytes4 worldFunctionSelector,
  +   string memory worldFunctionSignature,
      bytes4 systemFunctionSelector
    ) external returns (bytes4 worldFunctionSelector);
  }
  ```

- 3d0b3edb4: Removes `.mudbackup` file handling and `--backup`, `--restore`, and `--force` options from `mud set-version` command.

  To revert to a previous MUD version, use `git diff` to find the version that you changed from and want to revert to and run `pnpm mud set-version <prior-version>` again.

- afaf2f5ff: - `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`

  - `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

    ```diff
    -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
    -
    -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

    +  function registerTable(
    +    bytes32 table,
    +    Schema keySchema,
    +    Schema valueSchema,
    +    string[] calldata keyNames,
    +    string[] calldata fieldNames
    +  ) external;
    ```

  - `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
  - The `getSchema` method is renamed to `getValueSchema` on all interfaces
    ```diff
    - function getSchema(bytes32 table) external view returns (Schema schema);
    + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
    ```
  - The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.

- 29c3f5087: `deploy`, `test`, `dev-contracts` were overhauled using a declarative deployment approach under the hood. Deploys are now idempotent and re-running them will introspect the world and figure out the minimal changes necessary to bring the world into alignment with its config: adding tables, adding/upgrading systems, changing access control, etc.

  The following CLI arguments are now removed from these commands:

  - `--debug` (you can now adjust CLI output with `DEBUG` environment variable, e.g. `DEBUG=mud:*`)
  - `--priorityFeeMultiplier` (now calculated automatically)
  - `--disableTxWait` (everything is now parallelized with smarter nonce management)
  - `--pollInterval` (we now lean on viem defaults and we don't wait/poll until the very end of the deploy)

  Most deployment-in-progress logs are now behind a [debug](https://github.com/debug-js/debug) flag, which you can enable with a `DEBUG=mud:*` environment variable.

- 48c51b52a: RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

  To migrate existing projects after upgrading to this MUD version:

  1. Remove `contractComponents.ts` from `client/src/mud`
  2. Remove `components` argument from `syncToRecs`
  3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

     ```diff
     - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
     + "build:mud": "mud tablegen && mud worldgen",
     ```

     ```diff
     - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
     + "dev": "pnpm mud dev-contracts",
     ```

- 57d8965df: Separated core systems deployment from `CoreModule`, and added the systems as arguments to `CoreModule`
- 31ffc9d5d: The `registerFunctionSelector` function now accepts a single `functionSignature` string paramemer instead of separating function name and function arguments into separate parameters.

  ```diff
  IBaseWorld {
    function registerFunctionSelector(
      ResourceId systemId,
  -   string memory systemFunctionName,
  -   string memory systemFunctionArguments
  +   string memory systemFunctionSignature
    ) external returns (bytes4 worldFunctionSelector);
  }
  ```

  This is a breaking change if you were manually registering function selectors, e.g. in a `PostDeploy.s.sol` script or a module.
  To upgrade, simply replace the separate `systemFunctionName` and `systemFunctionArguments` parameters with a single `systemFunctionSignature` parameter.

  ```diff
    world.registerFunctionSelector(
      systemId,
  -   systemFunctionName,
  -   systemFunctionArguments,
  +   string(abi.encodePacked(systemFunctionName, systemFunctionArguments))
    );
  ```

- ac508bf18: Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

  Both can be overridden via the MUD config:

  ```ts
  export default mudConfig({
    /** Filename where common user types will be generated and imported from. */
    userTypesFilename: "common.sol",
    /** Filename where codegen index will be generated. */
    codegenIndexFilename: "index.sol",
  });
  ```

  Note: `userTypesFilename` was renamed from `userTypesPath` and `.sol` is not appended automatically anymore but needs to be part of the provided filename.

  To update your existing project, update all imports from `Tables.sol` to `index.sol` and all imports from `Types.sol` to `common.sol`, or override the defaults in your MUD config to the previous values.

  ```diff
  - import { Counter } from "../src/codegen/Tables.sol";
  + import { Counter } from "../src/codegen/index.sol";
  - import { ExampleEnum } from "../src/codegen/Types.sol";
  + import { ExampleEnum } from "../src/codegen/common.sol";
  ```

- 5e723b90e: - `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

  - All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
    All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IStore {
      function setRecord(
    -   bytes32 tableId,
    +   ResourceId tableId,
        bytes32[] calldata keyTuple,
        bytes calldata staticData,
        PackedCounter encodedLengths,
        bytes calldata dynamicData,
        FieldLayout fieldLayout
      ) external;

      // Same for all other methods
    }
    ```

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IBaseWorld {
      function callFrom(
        address delegator,
    -   bytes32 resourceSelector,
    +   ResourceId systemId,
        bytes memory callData
      ) external payable returns (bytes memory);

      // Same for all other methods
    }
    ```

- 252a1852: Migrated to new config format.

### Minor Changes

- 645736df: Added an `--rpcBatch` option to `mud deploy` command to batch RPC calls for rate limited RPCs.
- bdb46fe3a: Deploys now validate contract size before deploying and warns when a contract is over or close to the size limit (24kb). This should help identify the most common cause of "evm revert" errors during system and module contract deploys.
- aabd30767: Bumped Solidity version to 0.8.24.
- 618dd0e89: `WorldFactory` now expects a user-provided `salt` when calling `deployWorld(...)` (instead of the previous globally incrementing counter). This enables deterministic world addresses across different chains.

  When using `mud deploy`, you can provide a `bytes32` hex-encoded salt using the `--salt` option, otherwise it defaults to a random hex value.

- ccc21e913: Added a `--alwaysRunPostDeploy` flag to deploys (`deploy`, `test`, `dev-contracts` commands) to always run `PostDeploy.s.sol` script after each deploy. By default, `PostDeploy.s.sol` is only run once after a new world is deployed.

  This is helpful if you want to continue a deploy that may not have finished (due to an error or otherwise) or to run deploys with an idempotent `PostDeploy.s.sol` script.

- 59d78c93b: Added a `mud build` command that generates table libraries, system interfaces, and typed ABIs.
- 66cc35a8c: Create gas-report package, move gas-report cli command and GasReporter contract to it
- 92de59982: Bump Solidity version to 0.8.21
- 8025c3505: Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

  This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

  ```
  pnpm add @latticexyz/abi-ts
  pnpm abi-ts
  ```

  By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

  ```console
  pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
  ```

- e667ee808: CLI `deploy`, `test`, `dev-contracts` no longer run `forge clean` before each deploy. We previously cleaned to ensure no outdated artifacts were checked into git (ABIs, typechain types, etc.). Now that all artifacts are gitignored, we can let forge use its cache again.
- 5554b197: `mud deploy` now supports public/linked libraries.

  This helps with cases where system contracts would exceed the EVM bytecode size limit and logic would need to be split into many smaller systems.

  Instead of the overhead and complexity of system-to-system calls, this logic can now be moved into public libraries that will be deployed alongside your systems and automatically `delegatecall`ed.

- c36ffd13c: - update the `set-version` cli command to work with the new release process by adding two new options:

  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
  - `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

  Example:

  ```bash
  pnpm mud set-version --tag main && pnpm install
  pnpm mud set-version --commit db19ea39 && pnpm install
  ```

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

- e1dc88ebe: Transactions sent via deploy will now be retried a few times before giving up. This hopefully helps with large deploys on some chains.

### Patch Changes

- 168a4cb43: Add support for legacy transactions in deploy script by falling back to `gasPrice` if `lastBaseFeePerGas` is not available
- 7ce82b6fc: Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

  If you are sure you need to manually specify a store when interacting with tables, you can still manually toggle it back on with `storeArgument: true` in the table settings of your MUD config.

  If you want to use table libraries in `PostDeploy.s.sol`, you can add the following lines:

  ```diff
    import { Script } from "forge-std/Script.sol";
    import { console } from "forge-std/console.sol";
    import { IWorld } from "../src/codegen/world/IWorld.sol";
  + import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

    contract PostDeploy is Script {
      function run(address worldAddress) external {
  +     StoreSwitch.setStoreAddress(worldAddress);
  +
  +     SomeTable.get(someKey);
  ```

- a35c05ea9: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- 3bfee32cf: `dev-contracts` will no longer bail when there was an issue with deploying (e.g. typo in contracts) and instead wait for file changes before retrying.
- c32c8e8f2: Removes `std-contracts` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.
- 8f49c277d: Attempting to deploy multiple systems where there are overlapping system IDs now throws an error.
- ce7125a1b: Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.
- 854de0761: Using `mud set-version --link` will no longer attempt to fetch the latest version from npm.
- aea67c580: Include bytecode for `World` and `Store` in npm packages.
- c07fa0215: Tables and interfaces in the `world` package are now generated to the `codegen` folder.
  This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
  If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

  ```diff
  - import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
  + import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

  ```

- 87235a21b: Fix table IDs for module install step of deploy
- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 257a0afc: Bumped `typescript` to `5.4.2`, `eslint` to `8.57.0`, and both `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `7.1.1`.
- 4e2a170f9: Deploys now continue if they detect a `Module_AlreadyInstalled` revert error.
- 211be2a1e: The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
  This significantly reduces gas cost in all table library functions.
- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- 1feecf495: Added `--worldAddress` argument to `dev-contracts` CLI command so that you can develop against an existing world.
- 433078c54: Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

- 61c6ab705: Changed deploy order so that system/module contracts are fully deployed before registering/installing them on the world.
- e259ef79f: Generated `contractComponents` now properly import `World` as type
- 78a837167: Fixed registration of world signatures/selectors for namespaced systems. We changed these signatures in [#2160](https://github.com/latticexyz/mud/pull/2160), but missed updating part of the deploy step.
- 063daf80e: Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
  This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
  insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
  so that the `registerSystem`/`registerTable` transactions still went through successfully.
  To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
  Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

  Changes in consuming projects are only necessary if tables or systems are registered manually.
  If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

  ```diff
  +  world.registerNamespace(namespaceId);
     world.registerSystem(systemId, system, true);
  ```

  ```diff
  +  world.registerNamespace(namespaceId);
     MyTable.register();
  ```

- 69d55ce32: Deploy commands (`deploy`, `dev-contracts`, `test`) now correctly run `worldgen` to generate system interfaces before deploying.
- bd9cc8ec2: Refactor `deploy` command to break up logic into modules
- 8d51a0348: Clean up Memory.sol, make mcopy pure
- 2699630c0: Deploys will now always rebuild `IWorld.sol` interface (a workaround for https://github.com/foundry-rs/foundry/issues/6241)
- 48909d151: bump forge-std and ds-test dependencies
- 1d4039622: We fixed a bug in the deploy script that would cause the deployment to fail if a non-root namespace was used in the config.
- 4fe079309: Fixed a few issues with deploys:

  - properly handle enums in MUD config
  - only deploy each unique module/system once
  - waits for transactions serially instead of in parallel, to avoid RPC errors

- 21a626ae9: Changed `mud` CLI import order so that environment variables from the `.env` file are loaded before other imports.
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- db7798be2: Updated deployer with world's new `InitModule` naming.
- d844cd441: Sped up builds by using more of forge's cache.

  Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.

- bfcb293d1: What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- 55ab88a60: `StoreCore` and `IStore` now expose specific functions for `getStaticField` and `getDynamicField` in addition to the general `getField`.
  Using the specific functions reduces gas overhead because more optimized logic can be executed.

  ```solidity
  interface IStore {
    /**
     * Get a single static field from the given tableId and key tuple, with the given value field layout.
     * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
     * Consumers are expected to truncate the returned value as needed.
     */
    function getStaticField(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 fieldIndex,
      FieldLayout fieldLayout
    ) external view returns (bytes32);

    /**
     * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
     * (Dynamic field index = field index - number of static fields)
     */
    function getDynamicField(
      bytes32 tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex
    ) external view returns (bytes memory);
  }
  ```

- 4e4a34150: bump to latest TS version (5.1.6)
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- 83583a505: `deploy` and `dev-contracts` CLI commands now use `forge build --skip test script` before deploying and run `mud abi-ts` to generate strong types for ABIs.
- 60cfd089f: Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

  These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

  If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

  **Migrate existing RECS apps to new sync packages**

  As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

  1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)
  2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

     ```diff
     - import { foundry } from "viem/chains";
     - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
     + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

     - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
     + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
     ```

  3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

     ```diff
     - export async function getNetworkConfig(): Promise<NetworkConfig> {
     + export async function getNetworkConfig() {
     ```

     ```diff
       const initialBlockNumber = params.has("initialBlockNumber")
         ? Number(params.get("initialBlockNumber"))
     -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
     +   : world?.blockNumber ?? 0n;
     ```

     ```diff
     + return {
     +   privateKey: getBurnerWallet().value,
     +   chain,
     +   worldAddress,
     +   initialBlockNumber,
     +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
     + };
     ```

  4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

     ```diff
     - import { setupMUDV2Network } from "@latticexyz/std-client";
     - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
     + import { createFaucetService } from "@latticexyz/network";
     + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
     + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
     + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
     ```

     ```diff
     - const result = await setupMUDV2Network({
     -   ...
     - });

     + const clientOptions = {
     +   chain: networkConfig.chain,
     +   transport: transportObserver(fallback([webSocket(), http()])),
     +   pollingInterval: 1000,
     + } as const satisfies ClientConfig;

     + const publicClient = createPublicClient(clientOptions);

     + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
     + const burnerWalletClient = createWalletClient({
     +   ...clientOptions,
     +   account: burnerAccount,
     + });

     + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
     +   world,
     +   config: storeConfig,
     +   address: networkConfig.worldAddress as Hex,
     +   publicClient,
     +   components: contractComponents,
     +   startBlock: BigInt(networkConfig.initialBlockNumber),
     +   indexerUrl: networkConfig.indexerUrl ?? undefined,
     + });

     + const worldContract = createContract({
     +   address: networkConfig.worldAddress as Hex,
     +   abi: IWorld__factory.abi,
     +   publicClient,
     +   walletClient: burnerWalletClient,
     + });
     ```

     ```diff
       // Request drip from faucet
     - const signer = result.network.signer.get();
     - if (networkConfig.faucetServiceUrl && signer) {
     -   const address = await signer.getAddress();
     + if (networkConfig.faucetServiceUrl) {
     +   const address = burnerAccount.address;
     ```

     ```diff
       const requestDrip = async () => {
     -   const balance = await signer.getBalance();
     +   const balance = await publicClient.getBalance({ address });
         console.info(`[Dev Faucet]: Player balance -> ${balance}`);
     -   const lowBalance = balance?.lte(utils.parseEther("1"));
     +   const lowBalance = balance < parseEther("1");
     ```

     You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

     The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

     ```diff
     + return {
     +   world,
     +   components,
     +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
     +   publicClient,
     +   walletClient: burnerWalletClient,
     +   latestBlock$,
     +   blockStorageOperations$,
     +   waitForTransaction,
     +   worldContract,
     + };
     ```

  5. Update `createSystemCalls` with the new return type of `setupNetwork`.

     ```diff
       export function createSystemCalls(
     -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
     +   { worldContract, waitForTransaction }: SetupNetworkResult,
         { Counter }: ClientComponents
       ) {
          const increment = async () => {
     -      const tx = await worldSend("increment", []);
     -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
     +      const tx = await worldContract.write.increment();
     +      await waitForTransaction(tx);
            return getComponentValue(Counter, singletonEntity);
          };
     ```

  6. (optional) If you still need a clock, you can create it with:

     ```ts
     import { map, filter } from "rxjs";
     import { createClock } from "@latticexyz/network";

     const clock = createClock({
       period: 1000,
       initialTime: 0,
       syncInterval: 5000,
     });

     world.registerDisposer(() => clock.dispose());

     latestBlock$
       .pipe(
         map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
         filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
       )
       .subscribe(clock.update); // Update the local clock
     ```

  If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

  ```ts
  import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
  });

  if (syncProgress.step === SyncStep.LIVE) {
    // we're live!
  }
  ```

- 24a6cd536: Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.
- 708b49c50: Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
  This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

  We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

  ```solidity
  library Counter {
    // Dynamically determine which store to write to based on the context
    function set(uint32 value) internal;

    // Always write to own storage
    function _set(uint32 value) internal;

    // ... equivalent functions for all other Store methods
  }
  ```

- 25086be5f: Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract
- 9c83adc01: Added a non-deterministic fallback for deploying to chains that have replay protection on and do not support pre-EIP-155 transactions (no chain ID).

  If you're using `mud deploy` and there's already a [deterministic deployer](https://github.com/Arachnid/deterministic-deployment-proxy) on your target chain, you can provide the address with `--deployerAddress 0x...` to still get some determinism.

- c049c23f4: - The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```

  - The `World` contract now stores the original creator of the `World` in an immutable state variable.
    It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

    ```solidity
    interface IBaseWorld {
      function creator() external view returns (address);
    }
    ```

  - The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.

- 6c6733256: Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.
- 251170e1e: All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
  If you're using the MUD CLI, the import is already updated and no changes are necessary.
- c4f49240d: Table libraries now correctly handle uninitialized fixed length arrays.
- afdba793f: Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

  This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

  - `component.id` is now the on-chain `bytes32` hex representation of the table ID
  - `component.metadata.componentName` is the table name (e.g. `Position`)
  - `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
  - `component.metadata.keySchema` is an object with key names and their corresponding ABI types
  - `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

- 3e7d83d0: Renamed `PackedCounter` to `EncodedLengths` for consistency.
- cea754dde: - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

  - The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
    This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

    ```diff

    event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
    - uint40 deleteCount,
      bytes data
    );

    interface IStore {
      function spliceStaticData(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
    -   uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

  - The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
    If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

    ```diff
    - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
    + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
    ```

  - All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
    have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

    Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
    The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

    ```diff
    interface IStore {
    - function pushToField(
    + function pushToDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        bytes calldata dataToPush,
    -   FieldLayout fieldLayout
      ) external;

    - function popFromField(
    + function popFromDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        uint256 byteLengthToPop,
    -   FieldLayout fieldLayout
      ) external;

    - function getFieldSlice(
    + function getDynamicFieldSlice(
        ResourceId tableId,
        bytes32[] memory keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
    -   FieldLayout fieldLayout,
        uint256 start,
        uint256 end
      ) external view returns (bytes memory data);
    }
    ```

  - `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

    ```diff
    IStore {
    + function getDynamicFieldLength(
    +   ResourceId tableId,
    +   bytes32[] memory keyTuple,
    +   uint8 dynamicFieldIndex
    + ) external view returns (uint256);
    }

    ```

  - `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.
  - `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.
  - The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
    This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

- d2f8e9400: Moved to new resource ID utils.
- dc258e686: The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.
- Updated dependencies [7ce82b6fc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [77dce993a]
- Updated dependencies [ce97426c0]
- Updated dependencies [3236f799e]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [c963b46c7]
- Updated dependencies [05b3e8882]
- Updated dependencies [eaa766ef7]
- Updated dependencies [52182f70d]
- Updated dependencies [0f27afddb]
- Updated dependencies [748f4588a]
- Updated dependencies [865253dba]
- Updated dependencies [8f49c277d]
- Updated dependencies [7fa2ca183]
- Updated dependencies [745485cda]
- Updated dependencies [16b13ea8f]
- Updated dependencies [aea67c580]
- Updated dependencies [33f50f8a4]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [c07fa0215]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [6ca1874e0]
- Updated dependencies [331dbfdcb]
- Updated dependencies [d5c0682fb]
- Updated dependencies [1d60930d6]
- Updated dependencies [01e46d99]
- Updated dependencies [4be22ba4]
- Updated dependencies [430e6b29a]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [2c920de7]
- Updated dependencies [b98e51808]
- Updated dependencies [b9e562d8f]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [3fb9ce283]
- Updated dependencies [c207d35e8]
- Updated dependencies [db7798be2]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [3be4deecf]
- Updated dependencies [a25881160]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [5debcca8]
- Updated dependencies [80a26419f]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [f8dab7334]
- Updated dependencies [1a0fa7974]
- Updated dependencies [f62c767e7]
- Updated dependencies [d00c4a9af]
- Updated dependencies [d7325e517]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [c32a9269a]
- Updated dependencies [eb384bb0e]
- Updated dependencies [37c228c63]
- Updated dependencies [35348f831]
- Updated dependencies [618dd0e89]
- Updated dependencies [aacffcb59]
- Updated dependencies [c991c71a]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [e5d208e40]
- Updated dependencies [b38c096d]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [4bb7e8cbf]
- Updated dependencies [1f80a0b52]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e5a962bc3]
- Updated dependencies [331f0d636]
- Updated dependencies [f6f402896]
- Updated dependencies [d5b73b126]
- Updated dependencies [e34d1170]
- Updated dependencies [08b422171]
- Updated dependencies [b8a6158d6]
- Updated dependencies [190fdd11]
- Updated dependencies [c4fc85041]
- Updated dependencies [37c228c63]
- Updated dependencies [37c228c63]
- Updated dependencies [433078c54]
- Updated dependencies [2459e15fc]
- Updated dependencies [db314a74]
- Updated dependencies [b2d2aa715]
- Updated dependencies [4c7fd3eb2]
- Updated dependencies [a0341daf9]
- Updated dependencies [ca50fef81]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [6573e38e9]
- Updated dependencies [51914d656]
- Updated dependencies [063daf80e]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [9352648b1]
- Updated dependencies [59267655]
- Updated dependencies [37c228c63]
- Updated dependencies [2bfee9217]
- Updated dependencies [1ca35e9a1]
- Updated dependencies [ca3291751]
- Updated dependencies [ba17bdab5]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [88b1a5a19]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [f8a01a047]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [2ca75f9b9]
- Updated dependencies [f62c767e7]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [1a82c278]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [a02da555b]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [f1cd43bf9]
- Updated dependencies [9d0f492a9]
- Updated dependencies [55a05fd7a]
- Updated dependencies [f03531d97]
- Updated dependencies [c583f3cd0]
- Updated dependencies [31ffc9d5d]
- Updated dependencies [5e723b90e]
- Updated dependencies [63831a264]
- Updated dependencies [b8a6158d6]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [6ca1874e0]
- Updated dependencies [a7b30c79b]
- Updated dependencies [6470fe1fd]
- Updated dependencies [86766ce1]
- Updated dependencies [92de59982]
- Updated dependencies [5741d53d0]
- Updated dependencies [aee8020a6]
- Updated dependencies [331f0d636]
- Updated dependencies [22ee44700]
- Updated dependencies [e2d089c6d]
- Updated dependencies [ad4ac4459]
- Updated dependencies [8025c3505]
- Updated dependencies [be313068b]
- Updated dependencies [ac508bf18]
- Updated dependencies [836383734]
- Updated dependencies [9ff4dd955]
- Updated dependencies [93390d89]
- Updated dependencies [4385c5a4c]
- Updated dependencies [57d8965df]
- Updated dependencies [18d3aea55]
- Updated dependencies [7987c94d6]
- Updated dependencies [bb91edaa0]
- Updated dependencies [144c0d8d]
- Updated dependencies [5ac4c97f4]
- Updated dependencies [bfcb293d1]
- Updated dependencies [3e057061d]
- Updated dependencies [1890f1a06]
- Updated dependencies [90d0d79c]
- Updated dependencies [e48171741]
- Updated dependencies [e4a6189df]
- Updated dependencies [9b43029c3]
- Updated dependencies [37c228c63]
- Updated dependencies [55ab88a60]
- Updated dependencies [c58da9ad]
- Updated dependencies [37c228c63]
- Updated dependencies [747d8d1b8]
- Updated dependencies [4e4a34150]
- Updated dependencies [535229984]
- Updated dependencies [af639a264]
- Updated dependencies [5e723b90e]
- Updated dependencies [99ab9cd6f]
- Updated dependencies [086be4ef4]
- Updated dependencies [be18b75b]
- Updated dependencies [0c4f9fea9]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [17f987209]
- Updated dependencies [25086be5f]
- Updated dependencies [37c228c63]
- Updated dependencies [b1d41727d]
- Updated dependencies [3ac68ade6]
- Updated dependencies [c642ff3a0]
- Updated dependencies [22ba7b675]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [3042f86e]
- Updated dependencies [c049c23f4]
- Updated dependencies [9af542d3e]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [fdbba6d88]
- Updated dependencies [251170e1e]
- Updated dependencies [8025c3505]
- Updated dependencies [c4f49240d]
- Updated dependencies [745485cda]
- Updated dependencies [95f64c85]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [a2f41ade9]
- Updated dependencies [29c3f5087]
- Updated dependencies [cea754dde]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [331f0d636]
- Updated dependencies [95c59b203]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/world-modules@2.0.0
  - @latticexyz/world@2.0.0
  - @latticexyz/services@2.0.0
  - @latticexyz/common@2.0.0
  - @latticexyz/utils@2.0.0
  - @latticexyz/protocol-parser@2.0.0
  - @latticexyz/schema-type@2.0.0
  - @latticexyz/gas-report@2.0.0
  - @latticexyz/abi-ts@2.0.0
  - @latticexyz/config@2.0.0

## 2.0.0-next.18

### Major Changes

- 44236041: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- 252a1852: Migrated to new config format.

### Minor Changes

- 645736df: Added an `--rpcBatch` option to `mud deploy` command to batch RPC calls for rate limited RPCs.
- 5554b197: `mud deploy` now supports public/linked libraries.

  This helps with cases where system contracts would exceed the EVM bytecode size limit and logic would need to be split into many smaller systems.

  Instead of the overhead and complexity of system-to-system calls, this logic can now be moved into public libraries that will be deployed alongside your systems and automatically `delegatecall`ed.

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

- 8f49c277d: Attempting to deploy multiple systems where there are overlapping system IDs now throws an error.
- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 257a0afc: Bumped `typescript` to `5.4.2`, `eslint` to `8.57.0`, and both `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `7.1.1`.
- 9c83adc01: Added a non-deterministic fallback for deploying to chains that have replay protection on and do not support pre-EIP-155 transactions (no chain ID).

  If you're using `mud deploy` and there's already a [deterministic deployer](https://github.com/Arachnid/deterministic-deployment-proxy) on your target chain, you can provide the address with `--deployerAddress 0x...` to still get some determinism.

- 3e7d83d0: Renamed `PackedCounter` to `EncodedLengths` for consistency.
- Updated dependencies [c9ee5e4a]
- Updated dependencies [8f49c277d]
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [4be22ba4]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [3be4deecf]
- Updated dependencies [5debcca8]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [c991c71a]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [190fdd11]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [1a82c278]
- Updated dependencies [a02da555b]
- Updated dependencies [8193136a9]
- Updated dependencies [86766ce1]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [90d0d79c]
- Updated dependencies [c58da9ad]
- Updated dependencies [be18b75b]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [95f64c85]
- Updated dependencies [3e7d83d0]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/world@2.0.0-next.18
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/world-modules@2.0.0-next.18
  - @latticexyz/protocol-parser@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18
  - @latticexyz/gas-report@2.0.0-next.18
  - @latticexyz/config@2.0.0-next.18
  - @latticexyz/abi-ts@2.0.0-next.18
  - @latticexyz/services@2.0.0-next.18
  - @latticexyz/utils@2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- aabd3076: Bumped Solidity version to 0.8.24.
- 618dd0e8: `WorldFactory` now expects a user-provided `salt` when calling `deployWorld(...)` (instead of the previous globally incrementing counter). This enables deterministic world addresses across different chains.

  When using `mud deploy`, you can provide a `bytes32` hex-encoded salt using the `--salt` option, otherwise it defaults to a random hex value.

### Patch Changes

- a35c05ea: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- 78a83716: Fixed registration of world signatures/selectors for namespaced systems. We changed these signatures in [#2160](https://github.com/latticexyz/mud/pull/2160), but missed updating part of the deploy step.
- db7798be: Updated deployer with world's new `InitModule` naming.
- Updated dependencies [a35c05ea]
- Updated dependencies [05b3e888]
- Updated dependencies [745485cd]
- Updated dependencies [aabd3076]
- Updated dependencies [db7798be]
- Updated dependencies [618dd0e8]
- Updated dependencies [c4fc8504]
- Updated dependencies [c162ad5a]
- Updated dependencies [55a05fd7]
- Updated dependencies [6470fe1f]
- Updated dependencies [e2d089c6]
- Updated dependencies [17f98720]
- Updated dependencies [5c52bee0]
- Updated dependencies [745485cd]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/store@2.0.0-next.17
  - @latticexyz/world-modules@2.0.0-next.17
  - @latticexyz/world@2.0.0-next.17
  - @latticexyz/schema-type@2.0.0-next.17
  - @latticexyz/gas-report@2.0.0-next.17
  - @latticexyz/config@2.0.0-next.17
  - @latticexyz/protocol-parser@2.0.0-next.17
  - @latticexyz/abi-ts@2.0.0-next.17
  - @latticexyz/services@2.0.0-next.17
  - @latticexyz/utils@2.0.0-next.17

## 2.0.0-next.16

### Major Changes

- 57d8965d: Separated core systems deployment from `CoreModule`, and added the systems as arguments to `CoreModule`

### Patch Changes

- 063daf80: Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
  This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
  insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
  so that the `registerSystem`/`registerTable` transactions still went through successfully.
  To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
  Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

  Changes in consuming projects are only necessary if tables or systems are registered manually.
  If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

  ```diff
  +  world.registerNamespace(namespaceId);
     world.registerSystem(systemId, system, true);
  ```

  ```diff
  +  world.registerNamespace(namespaceId);
     MyTable.register();
  ```

- Updated dependencies [c6c13f2e]
- Updated dependencies [eaa766ef]
- Updated dependencies [0f27afdd]
- Updated dependencies [865253db]
- Updated dependencies [e6c03a87]
- Updated dependencies [c207d35e]
- Updated dependencies [d00c4a9a]
- Updated dependencies [37c228c6]
- Updated dependencies [1bf2e908]
- Updated dependencies [f6f40289]
- Updated dependencies [08b42217]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [063daf80]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [2bfee921]
- Updated dependencies [7b28d32e]
- Updated dependencies [9f8b84e7]
- Updated dependencies [aee8020a]
- Updated dependencies [ad4ac445]
- Updated dependencies [57d8965d]
- Updated dependencies [e4a6189d]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [3ac68ade]
- Updated dependencies [c642ff3a]
- Updated dependencies [37c228c6]
- Updated dependencies [103f635e]
  - @latticexyz/store@2.0.0-next.16
  - @latticexyz/world-modules@2.0.0-next.16
  - @latticexyz/world@2.0.0-next.16
  - @latticexyz/abi-ts@2.0.0-next.16
  - @latticexyz/common@2.0.0-next.16
  - @latticexyz/config@2.0.0-next.16
  - @latticexyz/gas-report@2.0.0-next.16
  - @latticexyz/protocol-parser@2.0.0-next.16
  - @latticexyz/schema-type@2.0.0-next.16
  - @latticexyz/services@2.0.0-next.16
  - @latticexyz/utils@2.0.0-next.16

## 2.0.0-next.15

### Minor Changes

- 59d78c93: Added a `mud build` command that generates table libraries, system interfaces, and typed ABIs.

### Patch Changes

- 854de076: Using `mud set-version --link` will no longer attempt to fetch the latest version from npm.
- 2699630c: Deploys will now always rebuild `IWorld.sol` interface (a workaround for https://github.com/foundry-rs/foundry/issues/6241)
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- Updated dependencies [d8c8f66b]
- Updated dependencies [1b86eac0]
- Updated dependencies [1077c7f5]
- Updated dependencies [933b54b5]
- Updated dependencies [f8dab733]
- Updated dependencies [1a0fa797]
- Updated dependencies [eb384bb0]
- Updated dependencies [e5a962bc]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [6db95ce1]
- Updated dependencies [5d737cf2]
- Updated dependencies [5ac4c97f]
- Updated dependencies [e4817174]
- Updated dependencies [747d8d1b]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/store@2.0.0-next.15
  - @latticexyz/world@2.0.0-next.15
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/world-modules@2.0.0-next.15
  - @latticexyz/abi-ts@2.0.0-next.15
  - @latticexyz/config@2.0.0-next.15
  - @latticexyz/gas-report@2.0.0-next.15
  - @latticexyz/protocol-parser@2.0.0-next.15
  - @latticexyz/schema-type@2.0.0-next.15
  - @latticexyz/services@2.0.0-next.15
  - @latticexyz/utils@2.0.0-next.15

## 2.0.0-next.14

### Minor Changes

- bdb46fe3: Deploys now validate contract size before deploying and warns when a contract is over or close to the size limit (24kb). This should help identify the most common cause of "evm revert" errors during system and module contract deploys.

### Patch Changes

- 1feecf49: Added `--worldAddress` argument to `dev-contracts` CLI command so that you can develop against an existing world.
- Updated dependencies [aacffcb5]
- Updated dependencies [b2d2aa71]
- Updated dependencies [bb91edaa]
- Updated dependencies [bb91edaa]
- Updated dependencies [fdbba6d8]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/store@2.0.0-next.14
  - @latticexyz/world@2.0.0-next.14
  - @latticexyz/schema-type@2.0.0-next.14
  - @latticexyz/world-modules@2.0.0-next.14
  - @latticexyz/config@2.0.0-next.14
  - @latticexyz/protocol-parser@2.0.0-next.14
  - @latticexyz/abi-ts@2.0.0-next.14
  - @latticexyz/gas-report@2.0.0-next.14
  - @latticexyz/services@2.0.0-next.14
  - @latticexyz/utils@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- 21a626ae: Changed `mud` CLI import order so that environment variables from the `.env` file are loaded before other imports.
- Updated dependencies [52182f70]
- Updated dependencies [d7325e51]
- Updated dependencies [35348f83]
- Updated dependencies [83638373]
- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/utils@2.0.0-next.13
  - @latticexyz/world-modules@2.0.0-next.13
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/config@2.0.0-next.13
  - @latticexyz/protocol-parser@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13
  - @latticexyz/world@2.0.0-next.13
  - @latticexyz/abi-ts@2.0.0-next.13
  - @latticexyz/gas-report@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13
  - @latticexyz/services@2.0.0-next.13

## 2.0.0-next.12

### Major Changes

- 29c3f508: `deploy`, `test`, `dev-contracts` were overhauled using a declarative deployment approach under the hood. Deploys are now idempotent and re-running them will introspect the world and figure out the minimal changes necessary to bring the world into alignment with its config: adding tables, adding/upgrading systems, changing access control, etc.

  The following CLI arguments are now removed from these commands:

  - `--debug` (you can now adjust CLI output with `DEBUG` environment variable, e.g. `DEBUG=mud:*`)
  - `--priorityFeeMultiplier` (now calculated automatically)
  - `--disableTxWait` (everything is now parallelized with smarter nonce management)
  - `--pollInterval` (we now lean on viem defaults and we don't wait/poll until the very end of the deploy)

  Most deployment-in-progress logs are now behind a [debug](https://github.com/debug-js/debug) flag, which you can enable with a `DEBUG=mud:*` environment variable.

### Minor Changes

- ccc21e91: Added a `--alwaysRunPostDeploy` flag to deploys (`deploy`, `test`, `dev-contracts` commands) to always run `PostDeploy.s.sol` script after each deploy. By default, `PostDeploy.s.sol` is only run once after a new world is deployed.

  This is helpful if you want to continue a deploy that may not have finished (due to an error or otherwise) or to run deploys with an idempotent `PostDeploy.s.sol` script.

- e667ee80: CLI `deploy`, `test`, `dev-contracts` no longer run `forge clean` before each deploy. We previously cleaned to ensure no outdated artifacts were checked into git (ABIs, typechain types, etc.). Now that all artifacts are gitignored, we can let forge use its cache again.
- e1dc88eb: Transactions sent via deploy will now be retried a few times before giving up. This hopefully helps with large deploys on some chains.

### Patch Changes

- 7ce82b6f: Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

  If you are sure you need to manually specify a store when interacting with tables, you can still manually toggle it back on with `storeArgument: true` in the table settings of your MUD config.

  If you want to use table libraries in `PostDeploy.s.sol`, you can add the following lines:

  ```diff
    import { Script } from "forge-std/Script.sol";
    import { console } from "forge-std/console.sol";
    import { IWorld } from "../src/codegen/world/IWorld.sol";
  + import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

    contract PostDeploy is Script {
      function run(address worldAddress) external {
  +     StoreSwitch.setStoreAddress(worldAddress);
  +
  +     SomeTable.get(someKey);
  ```

- 3bfee32c: `dev-contracts` will no longer bail when there was an issue with deploying (e.g. typo in contracts) and instead wait for file changes before retrying.
- 4e2a170f: Deploys now continue if they detect a `Module_AlreadyInstalled` revert error.
- 61c6ab70: Changed deploy order so that system/module contracts are fully deployed before registering/installing them on the world.
- 69d55ce3: Deploy commands (`deploy`, `dev-contracts`, `test`) now correctly run `worldgen` to generate system interfaces before deploying.
- 4fe07930: Fixed a few issues with deploys:

  - properly handle enums in MUD config
  - only deploy each unique module/system once
  - waits for transactions serially instead of in parallel, to avoid RPC errors

- d844cd44: Sped up builds by using more of forge's cache.

  Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.

- 25086be5: Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract
- d2f8e940: Moved to new resource ID utils.
- Updated dependencies [7ce82b6f]
- Updated dependencies [7fa2ca18]
- Updated dependencies [6ca1874e]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [ca329175]
- Updated dependencies [f62c767e]
- Updated dependencies [6ca1874e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [29c3f508]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/world-modules@2.0.0-next.12
  - @latticexyz/world@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/abi-ts@2.0.0-next.12
  - @latticexyz/config@2.0.0-next.12
  - @latticexyz/protocol-parser@2.0.0-next.12
  - @latticexyz/gas-report@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12
  - @latticexyz/services@2.0.0-next.12
  - @latticexyz/utils@2.0.0-next.12

## 2.0.0-next.11

### Major Changes

- 3d0b3edb: Removes `.mudbackup` file handling and `--backup`, `--restore`, and `--force` options from `mud set-version` command.

  To revert to a previous MUD version, use `git diff` to find the version that you changed from and want to revert to and run `pnpm mud set-version <prior-version>` again.

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [16b13ea8]
- Updated dependencies [430e6b29]
- Updated dependencies [f99e8898]
- Updated dependencies [9352648b]
- Updated dependencies [ba17bdab]
- Updated dependencies [d075f82f]
- Updated dependencies [4385c5a4]
- Updated dependencies [a2f41ade]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/world@2.0.0-next.11
  - @latticexyz/protocol-parser@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/world-modules@2.0.0-next.11
  - @latticexyz/gas-report@2.0.0-next.11
  - @latticexyz/config@2.0.0-next.11
  - @latticexyz/abi-ts@2.0.0-next.11
  - @latticexyz/services@2.0.0-next.11
  - @latticexyz/utils@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- [#1663](https://github.com/latticexyz/mud/pull/1663) [`87235a21`](https://github.com/latticexyz/mud/commit/87235a21b28fc831b5fb7a1546835ef08bd51655) Thanks [@holic](https://github.com/holic)! - Fix table IDs for module install step of deploy

- [#1619](https://github.com/latticexyz/mud/pull/1619) [`1d403962`](https://github.com/latticexyz/mud/commit/1d403962283c5b5f62410867be01f6adff277f41) Thanks [@alvrs](https://github.com/alvrs)! - We fixed a bug in the deploy script that would cause the deployment to fail if a non-root namespace was used in the config.

- Updated dependencies [[`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29), [`7987c94d`](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)]:
  - @latticexyz/world-modules@2.0.0-next.10
  - @latticexyz/world@2.0.0-next.10
  - @latticexyz/abi-ts@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/config@2.0.0-next.10
  - @latticexyz/gas-report@2.0.0-next.10
  - @latticexyz/protocol-parser@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10
  - @latticexyz/services@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10
  - @latticexyz/utils@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1482](https://github.com/latticexyz/mud/pull/1482) [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
  The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

  ```diff
  // mud.config.ts
  export default mudConfig({
    tables: {
      CounterTable: {
        keySchema: {},
  -     schema: {
  +     valueSchema: {
          value: "uint32",
        },
      },
    }
  }
  ```

- [#1336](https://github.com/latticexyz/mud/pull/1336) [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e) Thanks [@dk1a](https://github.com/dk1a)! - - Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

  - Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

    `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

  - Add `getFieldLayout` to `IStore` interface.

    There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

  - Add `fieldLayoutToHex` utility to `protocol-parser` package.

  - Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.

- [#1575](https://github.com/latticexyz/mud/pull/1575) [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca) Thanks [@alvrs](https://github.com/alvrs)! - The `registerRootFunctionSelector` function's signature was changed to accept a `string functionSignature` parameter instead of a `bytes4 functionSelector` parameter.
  This change enables the `World` to store the function signatures of all registered functions in a `FunctionSignatures` offchain table, which will allow for the automatic generation of interfaces for a given `World` address in the future.

  ```diff
  IBaseWorld {
    function registerRootFunctionSelector(
      ResourceId systemId,
  -   bytes4 worldFunctionSelector,
  +   string memory worldFunctionSignature,
      bytes4 systemFunctionSelector
    ) external returns (bytes4 worldFunctionSelector);
  }
  ```

- [#1574](https://github.com/latticexyz/mud/pull/1574) [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48) Thanks [@alvrs](https://github.com/alvrs)! - The `registerFunctionSelector` function now accepts a single `functionSignature` string paramemer instead of separating function name and function arguments into separate parameters.

  ```diff
  IBaseWorld {
    function registerFunctionSelector(
      ResourceId systemId,
  -   string memory systemFunctionName,
  -   string memory systemFunctionArguments
  +   string memory systemFunctionSignature
    ) external returns (bytes4 worldFunctionSelector);
  }
  ```

  This is a breaking change if you were manually registering function selectors, e.g. in a `PostDeploy.s.sol` script or a module.
  To upgrade, simply replace the separate `systemFunctionName` and `systemFunctionArguments` parameters with a single `systemFunctionSignature` parameter.

  ```diff
    world.registerFunctionSelector(
      systemId,
  -   systemFunctionName,
  -   systemFunctionArguments,
  +   string(abi.encodePacked(systemFunctionName, systemFunctionArguments))
    );
  ```

- [#1318](https://github.com/latticexyz/mud/pull/1318) [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130) Thanks [@holic](https://github.com/holic)! - Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

  Both can be overridden via the MUD config:

  ```ts
  export default mudConfig({
    /** Filename where common user types will be generated and imported from. */
    userTypesFilename: "common.sol",
    /** Filename where codegen index will be generated. */
    codegenIndexFilename: "index.sol",
  });
  ```

  Note: `userTypesFilename` was renamed from `userTypesPath` and `.sol` is not appended automatically anymore but needs to be part of the provided filename.

  To update your existing project, update all imports from `Tables.sol` to `index.sol` and all imports from `Types.sol` to `common.sol`, or override the defaults in your MUD config to the previous values.

  ```diff
  - import { Counter } from "../src/codegen/Tables.sol";
  + import { Counter } from "../src/codegen/index.sol";
  - import { ExampleEnum } from "../src/codegen/Types.sol";
  + import { ExampleEnum } from "../src/codegen/common.sol";
  ```

- [#1544](https://github.com/latticexyz/mud/pull/1544) [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae) Thanks [@alvrs](https://github.com/alvrs)! - - `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

  - All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
    All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IStore {
      function setRecord(
    -   bytes32 tableId,
    +   ResourceId tableId,
        bytes32[] calldata keyTuple,
        bytes calldata staticData,
        PackedCounter encodedLengths,
        bytes calldata dynamicData,
        FieldLayout fieldLayout
      ) external;

      // Same for all other methods
    }
    ```

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IBaseWorld {
      function callFrom(
        address delegator,
    -   bytes32 resourceSelector,
    +   ResourceId systemId,
        bytes memory callData
      ) external payable returns (bytes memory);

      // Same for all other methods
    }
    ```

### Minor Changes

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

### Patch Changes

- [#1490](https://github.com/latticexyz/mud/pull/1490) [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84) Thanks [@alvrs](https://github.com/alvrs)! - Include bytecode for `World` and `Store` in npm packages.

- [#1592](https://github.com/latticexyz/mud/pull/1592) [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07) Thanks [@alvrs](https://github.com/alvrs)! - Tables and interfaces in the `world` package are now generated to the `codegen` folder.
  This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
  If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

  ```diff
  - import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
  + import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

  ```

- [#1508](https://github.com/latticexyz/mud/pull/1508) [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9) Thanks [@Boffee](https://github.com/Boffee)! - The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
  This significantly reduces gas cost in all table library functions.

- [#1503](https://github.com/latticexyz/mud/pull/1503) [`bd9cc8ec`](https://github.com/latticexyz/mud/commit/bd9cc8ec2608efcb05ef95df64448b2ec28bcb49) Thanks [@holic](https://github.com/holic)! - Refactor `deploy` command to break up logic into modules

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- [#1521](https://github.com/latticexyz/mud/pull/1521) [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314) Thanks [@alvrs](https://github.com/alvrs)! - `StoreCore` and `IStore` now expose specific functions for `getStaticField` and `getDynamicField` in addition to the general `getField`.
  Using the specific functions reduces gas overhead because more optimized logic can be executed.

  ```solidity
  interface IStore {
    /**
     * Get a single static field from the given tableId and key tuple, with the given value field layout.
     * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
     * Consumers are expected to truncate the returned value as needed.
     */
    function getStaticField(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 fieldIndex,
      FieldLayout fieldLayout
    ) external view returns (bytes32);

    /**
     * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
     * (Dynamic field index = field index - number of static fields)
     */
    function getDynamicField(
      bytes32 tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex
    ) external view returns (bytes memory);
  }
  ```

- [#1483](https://github.com/latticexyz/mud/pull/1483) [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab) Thanks [@holic](https://github.com/holic)! - `deploy` and `dev-contracts` CLI commands now use `forge build --skip test script` before deploying and run `mud abi-ts` to generate strong types for ABIs.

- [#1587](https://github.com/latticexyz/mud/pull/1587) [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d) Thanks [@alvrs](https://github.com/alvrs)! - Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

- [#1513](https://github.com/latticexyz/mud/pull/1513) [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280) Thanks [@Boffee](https://github.com/Boffee)! - Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
  This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

  We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

  ```solidity
  library Counter {
    // Dynamically determine which store to write to based on the context
    function set(uint32 value) internal;

    // Always write to own storage
    function _set(uint32 value) internal;

    // ... equivalent functions for all other Store methods
  }
  ```

- [#1472](https://github.com/latticexyz/mud/pull/1472) [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf) Thanks [@alvrs](https://github.com/alvrs)! - - The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```

  - The `World` contract now stores the original creator of the `World` in an immutable state variable.
    It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

    ```solidity
    interface IBaseWorld {
      function creator() external view returns (address);
    }
    ```

  - The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.

- [#1591](https://github.com/latticexyz/mud/pull/1591) [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23) Thanks [@alvrs](https://github.com/alvrs)! - All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
  If you're using the MUD CLI, the import is already updated and no changes are necessary.

- [#1598](https://github.com/latticexyz/mud/pull/1598) [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04) Thanks [@dk1a](https://github.com/dk1a)! - Table libraries now correctly handle uninitialized fixed length arrays.

- [#1581](https://github.com/latticexyz/mud/pull/1581) [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b) Thanks [@alvrs](https://github.com/alvrs)! - - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

  - The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
    This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

    ```diff

    event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
    - uint40 deleteCount,
      bytes data
    );

    interface IStore {
      function spliceStaticData(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
    -   uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

  - The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
    If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

    ```diff
    - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
    + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
    ```

  - All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
    have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

    Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
    The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

    ```diff
    interface IStore {
    - function pushToField(
    + function pushToDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        bytes calldata dataToPush,
    -   FieldLayout fieldLayout
      ) external;

    - function popFromField(
    + function popFromDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        uint256 byteLengthToPop,
    -   FieldLayout fieldLayout
      ) external;

    - function getFieldSlice(
    + function getDynamicFieldSlice(
        ResourceId tableId,
        bytes32[] memory keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
    -   FieldLayout fieldLayout,
        uint256 start,
        uint256 end
      ) external view returns (bytes memory data);
    }
    ```

  - `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

    ```diff
    IStore {
    + function getDynamicFieldLength(
    +   ResourceId tableId,
    +   bytes32[] memory keyTuple,
    +   uint8 dynamicFieldIndex
    + ) external view returns (uint256);
    }

    ```

  - `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.

  - `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.

  - The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
    This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

- Updated dependencies [[`77dce993`](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a), [`748f4588`](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033), [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`1f80a0b5`](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`4c7fd3eb`](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651), [`a0341daf`](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`f8a01a04`](https://github.com/latticexyz/mud/commit/f8a01a047d73a15326ebf6577ea033674d8e61a9), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`f1cd43bf`](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203), [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`5741d53d`](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`9ff4dd95`](https://github.com/latticexyz/mud/commit/9ff4dd955fd6dca36eb15cfe7e46bb522d2e943b), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b), [`95c59b20`](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)]:
  - @latticexyz/world@2.0.0-next.9
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/protocol-parser@2.0.0-next.9
  - @latticexyz/world-modules@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/gas-report@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/config@2.0.0-next.9
  - @latticexyz/abi-ts@2.0.0-next.9
  - @latticexyz/services@2.0.0-next.9
  - @latticexyz/utils@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies [[`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7), [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac), [`51914d65`](https://github.com/latticexyz/mud/commit/51914d656d8cd8d851ccc8296d249cf09f53e670), [`2ca75f9b`](https://github.com/latticexyz/mud/commit/2ca75f9b9063ea33524e6c609b87f5494f678fa0), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)]:
  - @latticexyz/store@2.0.0-next.8
  - @latticexyz/world@2.0.0-next.8
  - @latticexyz/protocol-parser@2.0.0-next.8
  - @latticexyz/abi-ts@2.0.0-next.8
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/config@2.0.0-next.8
  - @latticexyz/gas-report@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8
  - @latticexyz/services@2.0.0-next.8
  - @latticexyz/utils@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies [[`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15), [`2459e15f`](https://github.com/latticexyz/mud/commit/2459e15fc9bf49fff2d769b9efba07b99635f2cc), [`18d3aea5`](https://github.com/latticexyz/mud/commit/18d3aea55b1d7f4b442c21343795c299a56fc481)]:
  - @latticexyz/store@2.0.0-next.7
  - @latticexyz/world@2.0.0-next.7
  - @latticexyz/abi-ts@2.0.0-next.7
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/config@2.0.0-next.7
  - @latticexyz/gas-report@2.0.0-next.7
  - @latticexyz/protocol-parser@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7
  - @latticexyz/services@2.0.0-next.7
  - @latticexyz/utils@2.0.0-next.7

## 2.0.0-next.6

### Minor Changes

- [#1413](https://github.com/latticexyz/mud/pull/1413) [`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561) Thanks [@holic](https://github.com/holic)! - Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

  This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

  ```
  pnpm add @latticexyz/abi-ts
  pnpm abi-ts
  ```

  By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

  ```console
  pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
  ```

### Patch Changes

- Updated dependencies [[`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561), [`9af542d3`](https://github.com/latticexyz/mud/commit/9af542d3e29e2699144534dec3430e19294077d4), [`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)]:
  - @latticexyz/abi-ts@2.0.0-next.6
  - @latticexyz/gas-report@2.0.0-next.6
  - @latticexyz/store@2.0.0-next.6
  - @latticexyz/world@2.0.0-next.6
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/config@2.0.0-next.6
  - @latticexyz/protocol-parser@2.0.0-next.6
  - @latticexyz/services@2.0.0-next.6
  - @latticexyz/utils@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- [#1371](https://github.com/latticexyz/mud/pull/1371) [`dc258e68`](https://github.com/latticexyz/mud/commit/dc258e6860196ad34bf1d4ac7fce382f70e2c0c8) Thanks [@alvrs](https://github.com/alvrs)! - The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.

- Updated dependencies [[`ce97426c`](https://github.com/latticexyz/mud/commit/ce97426c0d70832e5efdb8bad83207a9d840302b), [`33f50f8a`](https://github.com/latticexyz/mud/commit/33f50f8a473398dcc19b17d10a17a552a82678c7), [`80a26419`](https://github.com/latticexyz/mud/commit/80a26419f15177333b523bac5d09767487b4ffef), [`1ca35e9a`](https://github.com/latticexyz/mud/commit/1ca35e9a1630a51dfd1e082c26399f76f2cd06ed), [`9d0f492a`](https://github.com/latticexyz/mud/commit/9d0f492a90e5d94c6b38ad732e78fd4b13b2adbe), [`c583f3cd`](https://github.com/latticexyz/mud/commit/c583f3cd08767575ce9df39725ec51195b5feb5b)]:
  - @latticexyz/world@2.0.0-next.5
  - @latticexyz/services@2.0.0-next.5
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/config@2.0.0-next.5
  - @latticexyz/gas-report@2.0.0-next.5
  - @latticexyz/protocol-parser@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5
  - @latticexyz/store@2.0.0-next.5
  - @latticexyz/utils@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- [#1341](https://github.com/latticexyz/mud/pull/1341) [`c32c8e8f`](https://github.com/latticexyz/mud/commit/c32c8e8f2ccac02c4242f715f296bffd5465bd71) Thanks [@holic](https://github.com/holic)! - Removes `std-contracts` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

- [#1340](https://github.com/latticexyz/mud/pull/1340) [`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64) Thanks [@holic](https://github.com/holic)! - Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/config@2.0.0-next.4
  - @latticexyz/gas-report@2.0.0-next.4
  - @latticexyz/protocol-parser@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4
  - @latticexyz/services@2.0.0-next.4
  - @latticexyz/store@2.0.0-next.4
  - @latticexyz/utils@2.0.0-next.4
  - @latticexyz/world@2.0.0-next.4

## 2.0.0-next.3

### Major Changes

- [#1174](https://github.com/latticexyz/mud/pull/1174) [`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57) Thanks [@alvrs](https://github.com/alvrs)! - All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
  This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

  ```diff
    function setRecord(
      bytes32 table,
      bytes32[] calldata key,
      bytes calldata data,
  +   Schema valueSchema
    ) external;
  ```

  The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

  This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
  so downstream projects only need to regenerate their table libraries after updating MUD.

- [#1208](https://github.com/latticexyz/mud/pull/1208) [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c) Thanks [@alvrs](https://github.com/alvrs)! - - All `World` function selectors that previously had `bytes16 namespace, bytes16 name` arguments now use `bytes32 resourceSelector` instead.
  This includes `setRecord`, `setField`, `pushToField`, `popFromField`, `updateInField`, `deleteRecord`, `call`, `grantAccess`, `revokeAccess`, `registerTable`,
  `registerStoreHook`, `registerSystemHook`, `registerFunctionSelector`, `registerSystem` and `registerRootFunctionSelector`.
  This change aligns the `World` function selectors with the `Store` function selectors, reduces clutter, reduces gas cost and reduces the `World`'s contract size.

  - The `World`'s `registerHook` function is removed. Use `registerStoreHook` or `registerSystemHook` instead.

  - The `deploy` script is updated to integrate the World interface changes

- [#1182](https://github.com/latticexyz/mud/pull/1182) [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab) Thanks [@alvrs](https://github.com/alvrs)! - - `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`

  - `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

    ```diff
    -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
    -
    -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

    +  function registerTable(
    +    bytes32 table,
    +    Schema keySchema,
    +    Schema valueSchema,
    +    string[] calldata keyNames,
    +    string[] calldata fieldNames
    +  ) external;
    ```

  - `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
  - The `getSchema` method is renamed to `getValueSchema` on all interfaces
    ```diff
    - function getSchema(bytes32 table) external view returns (Schema schema);
    + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
    ```
  - The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.

### Patch Changes

- [#1231](https://github.com/latticexyz/mud/pull/1231) [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db) Thanks [@dk1a](https://github.com/dk1a)! - Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/world@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/protocol-parser@2.0.0-next.3
  - @latticexyz/services@2.0.0-next.3
  - @latticexyz/config@2.0.0-next.3
  - @latticexyz/gas-report@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3
  - @latticexyz/solecs@2.0.0-next.3
  - @latticexyz/std-contracts@2.0.0-next.3
  - @latticexyz/utils@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1278](https://github.com/latticexyz/mud/pull/1278) [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473) Thanks [@holic](https://github.com/holic)! - RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

  To migrate existing projects after upgrading to this MUD version:

  1. Remove `contractComponents.ts` from `client/src/mud`
  2. Remove `components` argument from `syncToRecs`
  3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

     ```diff
     - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
     + "build:mud": "mud tablegen && mud worldgen",
     ```

     ```diff
     - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
     + "dev": "pnpm mud dev-contracts",
     ```

### Patch Changes

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/config@2.0.0-next.2
  - @latticexyz/gas-report@2.0.0-next.2
  - @latticexyz/services@2.0.0-next.2
  - @latticexyz/solecs@2.0.0-next.2
  - @latticexyz/std-contracts@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1178](https://github.com/latticexyz/mud/pull/1178) [`168a4cb4`](https://github.com/latticexyz/mud/commit/168a4cb43ce4f7bfbdb7b1b9d4c305b912a0d3f2) Thanks [@TheGreatAxios](https://github.com/TheGreatAxios)! - Add support for legacy transactions in deploy script by falling back to `gasPrice` if `lastBaseFeePerGas` is not available

- [#1206](https://github.com/latticexyz/mud/pull/1206) [`e259ef79`](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b) Thanks [@holic](https://github.com/holic)! - Generated `contractComponents` now properly import `World` as type

- [#1214](https://github.com/latticexyz/mud/pull/1214) [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9) Thanks [@holic](https://github.com/holic)! - Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

  These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

  If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

  **Migrate existing RECS apps to new sync packages**

  As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

  1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)

  2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

     ```diff
     - import { foundry } from "viem/chains";
     - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
     + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

     - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
     + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
     ```

  3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

     ```diff
     - export async function getNetworkConfig(): Promise<NetworkConfig> {
     + export async function getNetworkConfig() {
     ```

     ```diff
       const initialBlockNumber = params.has("initialBlockNumber")
         ? Number(params.get("initialBlockNumber"))
     -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
     +   : world?.blockNumber ?? 0n;
     ```

     ```diff
     + return {
     +   privateKey: getBurnerWallet().value,
     +   chain,
     +   worldAddress,
     +   initialBlockNumber,
     +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
     + };
     ```

  4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

     ```diff
     - import { setupMUDV2Network } from "@latticexyz/std-client";
     - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
     + import { createFaucetService } from "@latticexyz/network";
     + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
     + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
     + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
     ```

     ```diff
     - const result = await setupMUDV2Network({
     -   ...
     - });

     + const clientOptions = {
     +   chain: networkConfig.chain,
     +   transport: transportObserver(fallback([webSocket(), http()])),
     +   pollingInterval: 1000,
     + } as const satisfies ClientConfig;

     + const publicClient = createPublicClient(clientOptions);

     + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
     + const burnerWalletClient = createWalletClient({
     +   ...clientOptions,
     +   account: burnerAccount,
     + });

     + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
     +   world,
     +   config: storeConfig,
     +   address: networkConfig.worldAddress as Hex,
     +   publicClient,
     +   components: contractComponents,
     +   startBlock: BigInt(networkConfig.initialBlockNumber),
     +   indexerUrl: networkConfig.indexerUrl ?? undefined,
     + });

     + const worldContract = createContract({
     +   address: networkConfig.worldAddress as Hex,
     +   abi: IWorld__factory.abi,
     +   publicClient,
     +   walletClient: burnerWalletClient,
     + });
     ```

     ```diff
       // Request drip from faucet
     - const signer = result.network.signer.get();
     - if (networkConfig.faucetServiceUrl && signer) {
     -   const address = await signer.getAddress();
     + if (networkConfig.faucetServiceUrl) {
     +   const address = burnerAccount.address;
     ```

     ```diff
       const requestDrip = async () => {
     -   const balance = await signer.getBalance();
     +   const balance = await publicClient.getBalance({ address });
         console.info(`[Dev Faucet]: Player balance -> ${balance}`);
     -   const lowBalance = balance?.lte(utils.parseEther("1"));
     +   const lowBalance = balance < parseEther("1");
     ```

     You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

     The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

     ```diff
     + return {
     +   world,
     +   components,
     +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
     +   publicClient,
     +   walletClient: burnerWalletClient,
     +   latestBlock$,
     +   blockStorageOperations$,
     +   waitForTransaction,
     +   worldContract,
     + };
     ```

  5. Update `createSystemCalls` with the new return type of `setupNetwork`.

     ```diff
       export function createSystemCalls(
     -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
     +   { worldContract, waitForTransaction }: SetupNetworkResult,
         { Counter }: ClientComponents
       ) {
          const increment = async () => {
     -      const tx = await worldSend("increment", []);
     -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
     +      const tx = await worldContract.write.increment();
     +      await waitForTransaction(tx);
            return getComponentValue(Counter, singletonEntity);
          };
     ```

  6. (optional) If you still need a clock, you can create it with:

     ```ts
     import { map, filter } from "rxjs";
     import { createClock } from "@latticexyz/network";

     const clock = createClock({
       period: 1000,
       initialTime: 0,
       syncInterval: 5000,
     });

     world.registerDisposer(() => clock.dispose());

     latestBlock$
       .pipe(
         map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
         filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
       )
       .subscribe(clock.update); // Update the local clock
     ```

  If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

  ```ts
  import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
  });

  if (syncProgress.step === SyncStep.LIVE) {
    // we're live!
  }
  ```

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- [#1195](https://github.com/latticexyz/mud/pull/1195) [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd) Thanks [@holic](https://github.com/holic)! - Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

  This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

  - `component.id` is now the on-chain `bytes32` hex representation of the table ID
  - `component.metadata.componentName` is the table name (e.g. `Position`)
  - `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
  - `component.metadata.keySchema` is an object with key names and their corresponding ABI types
  - `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

- Updated dependencies [[`3236f799`](https://github.com/latticexyz/mud/commit/3236f799e501be227da6e42e7b41a4928750115c), [`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/services@2.0.0-next.1
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/world@2.0.0-next.1
  - @latticexyz/config@2.0.0-next.1
  - @latticexyz/gas-report@2.0.0-next.1
  - @latticexyz/solecs@2.0.0-next.1
  - @latticexyz/std-contracts@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1147](https://github.com/latticexyz/mud/pull/1147) [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11) Thanks [@dk1a](https://github.com/dk1a)! - Create gas-report package, move gas-report cli command and GasReporter contract to it

- [#1157](https://github.com/latticexyz/mud/pull/1157) [`c36ffd13`](https://github.com/latticexyz/mud/commit/c36ffd13c3d859d9a4eadd0e07f6f73ad96b54aa) Thanks [@alvrs](https://github.com/alvrs)! - - update the `set-version` cli command to work with the new release process by adding two new options:

  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
  - `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

  Example:

  ```bash
  pnpm mud set-version --tag main && pnpm install
  pnpm mud set-version --commit db19ea39 && pnpm install
  ```

### Patch Changes

- [#1153](https://github.com/latticexyz/mud/pull/1153) [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f) Thanks [@dk1a](https://github.com/dk1a)! - Clean up Memory.sol, make mcopy pure

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1165](https://github.com/latticexyz/mud/pull/1165) [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b) Thanks [@holic](https://github.com/holic)! - bump to latest TS version (5.1.6)

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9), [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`086be4ef`](https://github.com/latticexyz/mud/commit/086be4ef4f3c1ecb3eac0e9554d7d4eb64531fc2), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/store@2.0.0-next.0
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/world@2.0.0-next.0
  - @latticexyz/gas-report@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/solecs@2.0.0-next.0
  - @latticexyz/std-contracts@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0
  - @latticexyz/services@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **cli:** account for getRecord's trimming ([#574](https://github.com/latticexyz/mud/issues/574)) ([9c5317a](https://github.com/latticexyz/mud/commit/9c5317afb2c4a9ac2fbaca424f90f30575dba671))
- **cli:** add back in resolveTableId export for use with mudConfig ([#518](https://github.com/latticexyz/mud/issues/518)) ([4906d77](https://github.com/latticexyz/mud/commit/4906d771645f9311b74b326ce551336a63e65eb9))
- **cli:** handle static arrays in worldgen ([#566](https://github.com/latticexyz/mud/issues/566)) ([b6a09f2](https://github.com/latticexyz/mud/commit/b6a09f222db8fc6d32800671ba238bc1771eb917))
- **cli:** remove node-dependent exports from base module ([#517](https://github.com/latticexyz/mud/issues/517)) ([abb34a6](https://github.com/latticexyz/mud/commit/abb34a63ffff0c0f7547c0c9ccf8133490ae1756))
- **cli:** use esbuild to load mud config ([#565](https://github.com/latticexyz/mud/issues/565)) ([18a8c42](https://github.com/latticexyz/mud/commit/18a8c42aa26ce54ac1a1bf4ba35de249b7f55979))
- **cli:** use fileSelector in worldgen ([#502](https://github.com/latticexyz/mud/issues/502)) ([fa021ed](https://github.com/latticexyz/mud/commit/fa021ed64800b533bc8995888edbc095e8e112dc))
- **cli:** wait for tx confirmation on deploy txs ([#606](https://github.com/latticexyz/mud/issues/606)) ([b92be71](https://github.com/latticexyz/mud/commit/b92be71e944ce4547193375261ec99649321b17a))
- **recs,cli:** fix bigint in recs and tsgen ([#563](https://github.com/latticexyz/mud/issues/563)) ([29fefae](https://github.com/latticexyz/mud/commit/29fefae43d96b107a66b9fd365b566cb8c466f8b))

### Features

- add support for key schemas ([#480](https://github.com/latticexyz/mud/issues/480)) ([37aec2e](https://github.com/latticexyz/mud/commit/37aec2e0a8adf378035fa5b54d752cc6888378d2))
- align git dep versions ([#577](https://github.com/latticexyz/mud/issues/577)) ([2b5fb5e](https://github.com/latticexyz/mud/commit/2b5fb5e94ad3e7e1134608121fec6c7b6a64d539))
- **cli/recs/std-client:** add ts definitions generator ([#536](https://github.com/latticexyz/mud/issues/536)) ([dd1efa6](https://github.com/latticexyz/mud/commit/dd1efa6a1ebd2b3c62080d1b191633d7b0072916))
- **cli:** add `mud test-v2` command ([#554](https://github.com/latticexyz/mud/issues/554)) ([d6be8b0](https://github.com/latticexyz/mud/commit/d6be8b08d0eeae3b10eb9e7bffb6d4dd2fc58aa0))
- **cli:** add `set-version` to upgrade all MUD dependencies in a project ([#527](https://github.com/latticexyz/mud/issues/527)) ([89731a6](https://github.com/latticexyz/mud/commit/89731a60e6a5643992ceb6996ed9d9894541fc72))
- **cli:** add encode function to all tables ([#498](https://github.com/latticexyz/mud/issues/498)) ([564604c](https://github.com/latticexyz/mud/commit/564604c0c03d675e007d176ec735d8fb76976771))
- **cli:** add module config to CLI ([#494](https://github.com/latticexyz/mud/issues/494)) ([263c828](https://github.com/latticexyz/mud/commit/263c828d3eb6f43d5e635c28026f4a68fbf7a19b))
- **cli:** add mud2 cli entrypoint with only v2 commands ([#567](https://github.com/latticexyz/mud/issues/567)) ([785a324](https://github.com/latticexyz/mud/commit/785a324920c11e24399c5edf575a9099ee4077b6))
- **cli:** add registerFunctionSelectors to deploy cli ([#501](https://github.com/latticexyz/mud/issues/501)) ([de3d459](https://github.com/latticexyz/mud/commit/de3d459c4c5817be8c947acb0131281f69b9133f))
- **cli:** add worldgen ([#496](https://github.com/latticexyz/mud/issues/496)) ([e84c0c8](https://github.com/latticexyz/mud/commit/e84c0c8dbb42b94d5ac096ef7916665f510b5c23))
- **cli:** allow customization of IWorld interface name via mud config, change `world/IWorld` to `world/IBaseWorld` ([#545](https://github.com/latticexyz/mud/issues/545)) ([38b355c](https://github.com/latticexyz/mud/commit/38b355c562a1e5c020deb6553a000a4d34d5fd86))
- **cli:** allow passing world address and src dir to deploy cli ([#586](https://github.com/latticexyz/mud/issues/586)) ([4b532be](https://github.com/latticexyz/mud/commit/4b532bee7fb0445ed624bd456b97e86a8f41e665))
- **cli:** allow static arrays as abi types in store config and tablegen ([#509](https://github.com/latticexyz/mud/issues/509)) ([588d037](https://github.com/latticexyz/mud/commit/588d0370d4c7d13667ff784ecb170edf59aa119e))
- **cli:** improve store config typehints, prepare for static array support ([#508](https://github.com/latticexyz/mud/issues/508)) ([abb5eb2](https://github.com/latticexyz/mud/commit/abb5eb2a111f5f75a4211692e8fede9afd6b2aee))
- **cli:** improve storeArgument, refactor cli ([#500](https://github.com/latticexyz/mud/issues/500)) ([bb68670](https://github.com/latticexyz/mud/commit/bb686702da75401d9ea4a8c8effcf3a15fa53b49))
- **cli:** include stateMutability in worldgen ([#571](https://github.com/latticexyz/mud/issues/571)) ([3a91292](https://github.com/latticexyz/mud/commit/3a91292dffd93a4e40725fac0a4255daab450442))
- **cli:** namespace deploy output by chain id ([#516](https://github.com/latticexyz/mud/issues/516)) ([7687349](https://github.com/latticexyz/mud/commit/768734967d5b8feaa06bb63d49feecce4c6fe3ee))
- **cli:** rename deploymentInfoDirectory to deploysDirectory, default to ./deploys ([#519](https://github.com/latticexyz/mud/issues/519)) ([1dba0d3](https://github.com/latticexyz/mud/commit/1dba0d370ad5e23d20e93d92b5e2d477a194248f))
- **cli:** set storeArgument to true by default ([#553](https://github.com/latticexyz/mud/issues/553)) ([cb1ecbc](https://github.com/latticexyz/mud/commit/cb1ecbcd036ead1b1ba0b717c7531d15beaeb106))
- **cli:** use a central codegen dir for tablegen and worldgen ([#585](https://github.com/latticexyz/mud/issues/585)) ([7500b11](https://github.com/latticexyz/mud/commit/7500b119d727a7155fa1033b2fc3ca729a51d033))
- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **cli:** use json for gas report output ([#607](https://github.com/latticexyz/mud/issues/607)) ([bea12ca](https://github.com/latticexyz/mud/commit/bea12cac16a2e0cdbb9623571cf0b02a5ed969a2))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))
- **world,store:** add updateInField ([#525](https://github.com/latticexyz/mud/issues/525)) ([0ac76fd](https://github.com/latticexyz/mud/commit/0ac76fd57484f54860157b79678b8b9eb7a86997))
- **world:** add naive ReverseMappingHook/Module ([#487](https://github.com/latticexyz/mud/issues/487)) ([36aaaef](https://github.com/latticexyz/mud/commit/36aaaef3a69914b962a3ef0847aa144134e89d28))
- **world:** add support for modules, add RegistrationModule, add CoreModule ([#482](https://github.com/latticexyz/mud/issues/482)) ([624cbbc](https://github.com/latticexyz/mud/commit/624cbbc6722823e83594f3df38d72682a1cecd99))
- **world:** add UniqueEntityModule ([#552](https://github.com/latticexyz/mud/issues/552)) ([983e26a](https://github.com/latticexyz/mud/commit/983e26a0ee0c0521e99d09dd25ebb9937e7c4ded))
- **world:** allow registration of function selectors in the World, split out RegisterSystem from World ([#481](https://github.com/latticexyz/mud/issues/481)) ([ba0166f](https://github.com/latticexyz/mud/commit/ba0166fb6cd7de63ddc6f4f500ff90c05da67b09))
- **world:** simplify access control to namespaces instead of routes ([#467](https://github.com/latticexyz/mud/issues/467)) ([945f2ef](https://github.com/latticexyz/mud/commit/945f2ef4a09c2fd1f9c4bb0418a1569fc31e0776))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Bug Fixes

- **cli:** add missing await ([#475](https://github.com/latticexyz/mud/issues/475)) ([efb5d76](https://github.com/latticexyz/mud/commit/efb5d76303093764c3bb8bd2d2a149bde0f4eb29))
- **cli:** add missing await to tablegen, fix formatting ([#472](https://github.com/latticexyz/mud/issues/472)) ([4313c27](https://github.com/latticexyz/mud/commit/4313c277b10c0334716e5c3728ffeaef643c1e6b))
- **cli:** avoid fs usage in utils, create deployment output directory if it doesn't exist ([#471](https://github.com/latticexyz/mud/issues/471)) ([cc8aa13](https://github.com/latticexyz/mud/commit/cc8aa132885e02e6db5658b19e82cc222676d724))
- **services:** fix protobuf imports ([#477](https://github.com/latticexyz/mud/issues/477)) ([3eda547](https://github.com/latticexyz/mud/commit/3eda547b6799b9899a14d48d022f7ec6460308e0))

### Features

- **cli:** add setMetadata to autogen of table libraries ([#466](https://github.com/latticexyz/mud/issues/466)) ([1e129fe](https://github.com/latticexyz/mud/commit/1e129fe9ced354e838d3d9afc9839aba82fbf210))
- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))
- **cli:** user types and route/path separation ([#454](https://github.com/latticexyz/mud/issues/454)) ([758bf03](https://github.com/latticexyz/mud/commit/758bf0388c9e282c58b2890cadb4a59e00978d26))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- **cli:** reorganize internal structure and add exports for all utilities ([#451](https://github.com/latticexyz/mud/issues/451)) ([e683904](https://github.com/latticexyz/mud/commit/e683904f8b5dcd23b69aef25275a0b3c8c3f9bb0))
- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/cli

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

### Features

- **cli:** deprecate create command ([#424](https://github.com/latticexyz/mud/issues/424)) ([292119f](https://github.com/latticexyz/mud/commit/292119f4c0c40cbd3ad688ee567f4c05d957af7c))
- **cli:** log client world URL ([#426](https://github.com/latticexyz/mud/issues/426)) ([f257467](https://github.com/latticexyz/mud/commit/f25746756ab4e93ef7a477b2b2c4948206f38f69))

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/cli

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/cli

# [1.36.0](https://github.com/latticexyz/mud/compare/v1.35.0...v1.36.0) (2023-02-16)

### Features

- **cli:** use forge config for paths to src, test, out ([#392](https://github.com/latticexyz/mud/issues/392)) ([01217d3](https://github.com/latticexyz/mud/commit/01217d3b1f39a0f0cd1b1b5c45750a65928ea02f))

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

### Bug Fixes

- **cli:** exit if generateDeploy fails in deploy-contracts setup ([#377](https://github.com/latticexyz/mud/issues/377)) ([71dd7f0](https://github.com/latticexyz/mud/commit/71dd7f083b9dccd14f646ea0bdbfd3a9028d4ed5))
- **cli:** pass reuseComponents arg in deploy command ([#356](https://github.com/latticexyz/mud/issues/356)) ([8e31984](https://github.com/latticexyz/mud/commit/8e31984e0f6b91316c18bf773233a0e5e1feb31d))
- **cli:** use nodejs grpc transport ([#374](https://github.com/latticexyz/mud/issues/374)) ([4c9ca7d](https://github.com/latticexyz/mud/commit/4c9ca7dcd756732be817f579fc24092bd2fd7aae))

### Features

- **cli:** add gas-report command ([#365](https://github.com/latticexyz/mud/issues/365)) ([c2a5209](https://github.com/latticexyz/mud/commit/c2a520970d2897efdfda36df4bab0fc6988c346b))
- **cli:** add initialization libs to deploy ([#361](https://github.com/latticexyz/mud/issues/361)) ([3999ca0](https://github.com/latticexyz/mud/commit/3999ca007c93a135692cdfe21ab263d7ab947c9c))
- **cli:** allow initializers to utilize SystemStorage ([#371](https://github.com/latticexyz/mud/issues/371)) ([b8ba018](https://github.com/latticexyz/mud/commit/b8ba018a1abccd4fdea82a3508cb0f39d8794280))
- update forge-std, use some new features in cli ([#311](https://github.com/latticexyz/mud/issues/311)) ([43ad118](https://github.com/latticexyz/mud/commit/43ad11837ae280509be92737e8f86d749d4d48d8))

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

### Bug Fixes

- **cli:** round gas price to nearest integer ([#348](https://github.com/latticexyz/mud/issues/348)) ([ce07174](https://github.com/latticexyz/mud/commit/ce071747eb33ca9feceb0618af627ff845d2b1b8))

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/cli

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

### Bug Fixes

- **cli:** do not copy System test ABIs during build 🧱 ([#312](https://github.com/latticexyz/mud/issues/312)) ([660e508](https://github.com/latticexyz/mud/commit/660e5084076cfe4b86c371fb7fcdb1c68407c4ab))

### Features

- **cli:** add deploy option to specify whether dev flag should be appended to client url ([#313](https://github.com/latticexyz/mud/issues/313)) ([d3de8d2](https://github.com/latticexyz/mud/commit/d3de8d2386a72efd4c3d7fa857e0e51262fab0ee))

### Reverts

- Revert "feat: bump devnode gas limit to 100m (#289)" (#302) ([34c9d27](https://github.com/latticexyz/mud/commit/34c9d2771a9b7535d9dd5d78b15f12f3a01ca187)), closes [#289](https://github.com/latticexyz/mud/issues/289) [#302](https://github.com/latticexyz/mud/issues/302)

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

**Note:** Version bump only for package @latticexyz/cli

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

### Bug Fixes

- **cli:** better logs, more resilience, better gas price mgmt ([#300](https://github.com/latticexyz/mud/issues/300)) ([26c62e6](https://github.com/latticexyz/mud/commit/26c62e6c16738cbbd83dc5d2dacf8090c9beb102))

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

**Note:** Version bump only for package @latticexyz/cli

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

### Bug Fixes

- cli issue with circular dependencies ([#291](https://github.com/latticexyz/mud/issues/291)) ([bbc182f](https://github.com/latticexyz/mud/commit/bbc182fd36b20f69737fd0d337ad0d46332c7543))
- **cli:** catch error when attempting to invalid file ([#282](https://github.com/latticexyz/mud/issues/282)) ([add01a8](https://github.com/latticexyz/mud/commit/add01a8123495feaa194cf4624c2a02c4f24f1e2))
- **cli:** reset LibDeploy.sol using original/cached contents ([#292](https://github.com/latticexyz/mud/issues/292)) ([6e7a8b9](https://github.com/latticexyz/mud/commit/6e7a8b93cf89018444c58c69c785a658d59a49d4))

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

### Bug Fixes

- **cli:** mud trace bug for non-local networks ([#276](https://github.com/latticexyz/mud/issues/276)) ([3f6abeb](https://github.com/latticexyz/mud/commit/3f6abeb6dfc4ca090838c72d5c69c1215c1ed671))
- **cli:** replace LibDeploy.sol content with stub ([275824a](https://github.com/latticexyz/mud/commit/275824a28814f856adf5daa3332957edbc80b1aa))
- use interfaces in LibDeploy ([#278](https://github.com/latticexyz/mud/issues/278)) ([6d01082](https://github.com/latticexyz/mud/commit/6d01082f8119c67fcfdb2351aa98a3d7efa0989f))

### Features

- bump devnode gas limit to 100m ([#289](https://github.com/latticexyz/mud/issues/289)) ([a02e44b](https://github.com/latticexyz/mud/commit/a02e44bb9e3c2ee6b8aaea7b080cd35820bf1de1))

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package @latticexyz/cli

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

### Features

- **cli:** hot system replacement, new commands (deploy-contracts, codegen-libdeploy, devnode, types, test, create) ([#277](https://github.com/latticexyz/mud/issues/277)) ([8e32f98](https://github.com/latticexyz/mud/commit/8e32f983208c37839bc3e347058dbc7e49b6247e))

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

### Features

- **cli:** add faucet cli ([#271](https://github.com/latticexyz/mud/issues/271)) ([a33f1ce](https://github.com/latticexyz/mud/commit/a33f1ce97a13039407c5b786725b1b8efd3faeb6))
- **cli:** add mud types command for TypeChain type generation ([#259](https://github.com/latticexyz/mud/issues/259)) ([4303b40](https://github.com/latticexyz/mud/commit/4303b40b887961cbece6a004c55e0ce6edb65a18))

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

**Note:** Version bump only for package @latticexyz/cli

# [1.27.0](https://github.com/latticexyz/mud/compare/v1.26.0...v1.27.0) (2022-11-15)

**Note:** Version bump only for package @latticexyz/cli

# [1.26.0](https://github.com/latticexyz/mud/compare/v1.25.1...v1.26.0) (2022-11-07)

**Note:** Version bump only for package @latticexyz/cli

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package @latticexyz/cli

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

### Bug Fixes

- remove global install of cli ([653281e](https://github.com/latticexyz/mud/commit/653281e3e502b59f5ecdc752c83b3fb5e3449855))

### Features

- working deploy script from mud basics ([#218](https://github.com/latticexyz/mud/issues/218)) ([fd1c61b](https://github.com/latticexyz/mud/commit/fd1c61bd3525bbeedc70dd0dc384936b583a7340))

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

**Note:** Version bump only for package @latticexyz/cli

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

**Note:** Version bump only for package @latticexyz/cli

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

**Note:** Version bump only for package @latticexyz/cli

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/cli

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/cli

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/cli

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

**Note:** Version bump only for package @latticexyz/cli

# [1.19.0](https://github.com/latticexyz/mud/compare/v1.18.0...v1.19.0) (2022-10-21)

**Note:** Version bump only for package @latticexyz/cli

# [1.18.0](https://github.com/latticexyz/mud/compare/v1.17.0...v1.18.0) (2022-10-21)

**Note:** Version bump only for package @latticexyz/cli

# [1.17.0](https://github.com/latticexyz/mud/compare/v1.16.0...v1.17.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/cli

# [1.16.0](https://github.com/latticexyz/mud/compare/v1.15.0...v1.16.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/cli

# [1.15.0](https://github.com/latticexyz/mud/compare/v1.14.2...v1.15.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/cli

## [1.14.2](https://github.com/latticexyz/mud/compare/v1.14.1...v1.14.2) (2022-10-18)

**Note:** Version bump only for package @latticexyz/cli

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package @latticexyz/cli

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/cli

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

**Note:** Version bump only for package @latticexyz/cli

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

**Note:** Version bump only for package @latticexyz/cli

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/cli

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/cli

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/cli

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

**Note:** Version bump only for package @latticexyz/cli

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package @latticexyz/cli

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

**Note:** Version bump only for package @latticexyz/cli

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

**Note:** Version bump only for package @latticexyz/cli

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/cli

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

### Features

- add a stream rpc for message push ([#174](https://github.com/latticexyz/mud/issues/174)) ([e0aa956](https://github.com/latticexyz/mud/commit/e0aa956ac871064ecde87a07394525ca69e7f17d))

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/cli

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

**Note:** Version bump only for package @latticexyz/cli

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

**Note:** Version bump only for package @latticexyz/cli

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

**Note:** Version bump only for package @latticexyz/cli

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

**Note:** Version bump only for package @latticexyz/cli

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package @latticexyz/cli

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

**Note:** Version bump only for package @latticexyz/cli

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

**Note:** Version bump only for package @latticexyz/cli

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package @latticexyz/cli

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package @latticexyz/cli

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

**Note:** Version bump only for package @latticexyz/cli

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package @latticexyz/cli

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

**Note:** Version bump only for package @latticexyz/cli

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package @latticexyz/cli

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

**Note:** Version bump only for package @latticexyz/cli

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

**Note:** Version bump only for package @latticexyz/cli

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

**Note:** Version bump only for package @latticexyz/cli

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

### Features

- **cli:** forge bulk upload ecs state script ([#142](https://github.com/latticexyz/mud/issues/142)) ([bbd6e1f](https://github.com/latticexyz/mud/commit/bbd6e1f4be18dcae94addc65849136ad01d1ba2a))

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

**Note:** Version bump only for package @latticexyz/cli

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

**Note:** Version bump only for package @latticexyz/cli

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

**Note:** Version bump only for package @latticexyz/cli

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

**Note:** Version bump only for package @latticexyz/cli

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

**Note:** Version bump only for package @latticexyz/cli

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

**Note:** Version bump only for package @latticexyz/cli

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

**Note:** Version bump only for package @latticexyz/cli

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

**Note:** Version bump only for package @latticexyz/cli

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- CacheWorker ([#118](https://github.com/latticexyz/mud/issues/118)) ([bfe006e](https://github.com/latticexyz/mud/commit/bfe006e6adf064982a14d5dc1541d39b1b6016e2))
- optimism, cancel action if gas check fails, add noise utils, fix ecs-browser entry point ([#119](https://github.com/latticexyz/mud/issues/119)) ([f35d3c3](https://github.com/latticexyz/mud/commit/f35d3c3cc7fc9385a215dfda6762a2a825c9fd6d))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package @latticexyz/cli

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package @latticexyz/cli

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package @latticexyz/cli

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Features

- **cli:** cli commands for better debugging ([#113](https://github.com/latticexyz/mud/issues/113)) ([80ae128](https://github.com/latticexyz/mud/commit/80ae128545533a929f272de7461bfa2575cc22fd))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package @latticexyz/cli

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package @latticexyz/cli

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Bug Fixes

- fix deploying to hardhat using forge, check for existing persona in launcher ([#56](https://github.com/latticexyz/mud/issues/56)) ([a0f954b](https://github.com/latticexyz/mud/commit/a0f954b852a01467d84087ace67bfd3065409cf3))

### Features

- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)
- new systems pattern ([#63](https://github.com/latticexyz/mud/issues/63)) ([fb6197b](https://github.com/latticexyz/mud/commit/fb6197b997eb7232e38ecfb9116ff256491dc38c))

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- **cli:** add vscode solidity config file to mud create projects ([064546a](https://github.com/latticexyz/mud/commit/064546ac7e161ba8dd82d5326c3f975a111596c3))
- **contracts:** replace hardhat with foundry toolkit ([#51](https://github.com/latticexyz/mud/issues/51)) ([2c0e4a9](https://github.com/latticexyz/mud/commit/2c0e4a903e6d761941ec2f86f2dda9005520f020))

## [0.1.8](https://github.com/latticexyz/mud/compare/v0.1.7...v0.1.8) (2022-05-25)

### Bug Fixes

- **@latticexyz/cli:** fix create script ([2c3b0db](https://github.com/latticexyz/mud/commit/2c3b0db177ded2c3a74721f82fad59d7f596c98e))

## [0.1.7](https://github.com/latticexyz/mud/compare/v0.1.6...v0.1.7) (2022-05-25)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.6](https://github.com/latticexyz/mud/compare/v0.1.5...v0.1.6) (2022-05-25)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.5](https://github.com/latticexyz/mud/compare/v0.1.4...v0.1.5) (2022-05-24)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.4](https://github.com/latticexyz/mud/compare/v0.1.3...v0.1.4) (2022-05-24)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.3](https://github.com/latticexyz/mud/compare/v0.1.2...v0.1.3) (2022-05-23)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.2](https://github.com/latticexyz/mud/compare/v0.1.1...v0.1.2) (2022-05-23)

**Note:** Version bump only for package @latticexyz/cli

## [0.1.1](https://github.com/latticexyz/mud/compare/v0.1.0...v0.1.1) (2022-05-23)

**Note:** Version bump only for package @latticexyz/cli

# 0.1.0 (2022-05-23)

### Features

- **@mud/cli:** add deploy script to cli ([99d0b70](https://github.com/latticexyz/mud/commit/99d0b704a3fda8646aad257c02fe7d9dc7a0c6c5))
- **@mud/cli:** add initial version of mud create script ([72758cf](https://github.com/latticexyz/mud/commit/72758cfc0923e7592667cb7db73605e301be1c5d))
- **@mud/cli:** add mud cli and move diamond abi generation to cli ([034af90](https://github.com/latticexyz/mud/commit/034af9075c6f8dfbfb10a8f21a442db39d22bbf7))
