# Change Log

## 2.2.24

### Patch Changes

- Updated dependencies [0e49b51]
  - @latticexyz/common@2.2.24
  - @latticexyz/config@2.2.24
  - @latticexyz/protocol-parser@2.2.24
  - @latticexyz/schema-type@2.2.24

## 2.2.23

### Patch Changes

- a8c404b: Support expectRevert and unusual nameless arguments in system libraries.
- cd0fa57: Bumped to viem v2.35.1, wagmi v2.16.5, abitype v1.0.9.
- b803eb1: Bumped forge-std version and removed ds-test dependency (not needed in current forge-std versions)
- Updated dependencies [94cac74]
- Updated dependencies [cd0fa57]
- Updated dependencies [b803eb1]
- Updated dependencies [122945e]
  - @latticexyz/common@2.2.23
  - @latticexyz/config@2.2.23
  - @latticexyz/protocol-parser@2.2.23
  - @latticexyz/schema-type@2.2.23

## 2.2.22

### Patch Changes

- Updated dependencies [88ddd0c]
- Updated dependencies [ab837ce]
- Updated dependencies [6897086]
  - @latticexyz/common@2.2.22
  - @latticexyz/config@2.2.22
  - @latticexyz/protocol-parser@2.2.22
  - @latticexyz/schema-type@2.2.22

## 2.2.21

### Patch Changes

- Updated dependencies [1d354b8]
- Updated dependencies [b18c0ef]
  - @latticexyz/common@2.2.21
  - @latticexyz/config@2.2.21
  - @latticexyz/protocol-parser@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- 06e48e0: Updated `IStoreRegistration` interface to allow calling `registerTable` with `keyNames` and `fieldNames` from `memory` rather than `calldata` so this can be called with names returned by table libraries.
  - @latticexyz/common@2.2.20
  - @latticexyz/config@2.2.20
  - @latticexyz/protocol-parser@2.2.20
  - @latticexyz/schema-type@2.2.20

## 2.2.19

### Patch Changes

- @latticexyz/common@2.2.19
- @latticexyz/config@2.2.19
- @latticexyz/protocol-parser@2.2.19
- @latticexyz/schema-type@2.2.19

## 2.2.18

### Patch Changes

- 5d6fb1b: Updates `WithWorld` to be a `System`, so that functions in child contracts that use the `onlyWorld` or `onlyNamespace` modifiers must be called through the world in order to safely support calls from systems.
- Updated dependencies [10ce339]
  - @latticexyz/common@2.2.18
  - @latticexyz/config@2.2.18
  - @latticexyz/protocol-parser@2.2.18
  - @latticexyz/schema-type@2.2.18

## 2.2.17

### Patch Changes

- Updated dependencies [589fd3a]
- Updated dependencies [dead80e]
- Updated dependencies [7385948]
  - @latticexyz/common@2.2.17
  - @latticexyz/protocol-parser@2.2.17
  - @latticexyz/config@2.2.17
  - @latticexyz/schema-type@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/common@2.2.16
- @latticexyz/config@2.2.16
- @latticexyz/protocol-parser@2.2.16
- @latticexyz/schema-type@2.2.16

## 2.2.15

### Patch Changes

- 09e9bd5: Moved viem to peer dependencies to ensure a single, consistent version is installed in downstream projects.
- 1b477d4: Added internal `getRecord` and `getStaticDataLocation` helpers.
- 09536b0: Adds an experimental feature to automatically generate Solidity libraries from systems, making it easier to perform calls between systems.
- Updated dependencies [9580d29]
- Updated dependencies [09e9bd5]
- Updated dependencies [9d71887]
- Updated dependencies [88b9daf]
  - @latticexyz/config@2.2.15
  - @latticexyz/common@2.2.15
  - @latticexyz/protocol-parser@2.2.15
  - @latticexyz/schema-type@2.2.15

## 2.2.14

### Patch Changes

- @latticexyz/common@2.2.14
- @latticexyz/config@2.2.14
- @latticexyz/protocol-parser@2.2.14
- @latticexyz/schema-type@2.2.14

## 2.2.13

### Patch Changes

- @latticexyz/schema-type@2.2.13
- @latticexyz/common@2.2.13
- @latticexyz/config@2.2.13
- @latticexyz/protocol-parser@2.2.13

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
  - @latticexyz/common@2.2.12
  - @latticexyz/config@2.2.12
  - @latticexyz/protocol-parser@2.2.12
  - @latticexyz/schema-type@2.2.12

## 2.2.11

### Patch Changes

- 7ddcf64: Added `getStoreLogs` and `flattenStoreLogs` to aid in fetching data from store contracts. For now, these are internal exports and considered unstable/experimental.
- 13e5689: Added an `unwrap` function to the `ResourceIdInstance` library to make it easier to unwrap a `ResourceId` with `resourceId.unwrap()`.
- Updated dependencies [7ddcf64]
  - @latticexyz/common@2.2.11
  - @latticexyz/config@2.2.11
  - @latticexyz/protocol-parser@2.2.11
  - @latticexyz/schema-type@2.2.11

## 2.2.10

### Patch Changes

- @latticexyz/common@2.2.10
- @latticexyz/config@2.2.10
- @latticexyz/protocol-parser@2.2.10
- @latticexyz/schema-type@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/common@2.2.9
- @latticexyz/config@2.2.9
- @latticexyz/protocol-parser@2.2.9
- @latticexyz/schema-type@2.2.9

## 2.2.8

### Patch Changes

- Updated dependencies [7c7bdb2]
  - @latticexyz/common@2.2.8
  - @latticexyz/config@2.2.8
  - @latticexyz/protocol-parser@2.2.8
  - @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- a08ba5e: Improved config output type of `enumValues`.
  - @latticexyz/common@2.2.7
  - @latticexyz/config@2.2.7
  - @latticexyz/protocol-parser@2.2.7
  - @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/common@2.2.6
- @latticexyz/config@2.2.6
- @latticexyz/protocol-parser@2.2.6
- @latticexyz/schema-type@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/common@2.2.5
- @latticexyz/config@2.2.5
- @latticexyz/protocol-parser@2.2.5
- @latticexyz/schema-type@2.2.5

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
- Updated dependencies [8b4110e]
  - @latticexyz/common@2.2.4
  - @latticexyz/config@2.2.4
  - @latticexyz/protocol-parser@2.2.4
  - @latticexyz/schema-type@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/common@2.2.3
- @latticexyz/config@2.2.3
- @latticexyz/protocol-parser@2.2.3
- @latticexyz/schema-type@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/common@2.2.2
- @latticexyz/config@2.2.2
- @latticexyz/protocol-parser@2.2.2
- @latticexyz/schema-type@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [c0764a5]
  - @latticexyz/common@2.2.1
  - @latticexyz/config@2.2.1
  - @latticexyz/protocol-parser@2.2.1
  - @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- 04c675c: Fixed a few type issues with `namespaceLabel` in tables and added/clarified TSDoc for config input/output objects.
- Updated dependencies [69cd0a1]
- Updated dependencies [04c675c]
  - @latticexyz/common@2.2.0
  - @latticexyz/config@2.2.0
  - @latticexyz/protocol-parser@2.2.0
  - @latticexyz/schema-type@2.2.0

## 2.1.1

### Patch Changes

- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- 57bf8c3: Add a strongly typed `namespaceLabel` to the table config output.
  It corresponds to the `label` of the namespace the table belongs to and can't be set manually.
- Updated dependencies [9e21e42]
- Updated dependencies [2daaab1]
- Updated dependencies [57bf8c3]
  - @latticexyz/common@2.1.1
  - @latticexyz/config@2.1.1
  - @latticexyz/protocol-parser@2.1.1
  - @latticexyz/schema-type@2.1.1

## 2.1.0

### Minor Changes

- e85dc53: Tables and systems in config output now include a `label` property. Labels are now used throughout the codebase as a user-friendly way to reference the given resource: config keys, contract names, generated libraries, etc.

  Inside `namespaces` config output, keys for tables and systems and their filenames will always correspond to their labels. This should make MUD tooling more intuitive and predictable. For backwards compatibility, `tables` config output still uses namespace-prefixed keys.

  Labels replace the previous resource `name` usage, which is truncated to `bytes16` to be used as part of the resource ID and, in the future, may not always be human-readable.

  These labels will soon be registered onchain so that developers can initialize a new MUD project from an existing world, generating config and interfaces with user-friendly names.

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

- 24e285d: Disabled deploy of `Hooks` table, as this was meant to be a generic, codegen-only table.
- 7129a16: Bumped `@arktype/util` and moved `evaluate`/`satisfy` usages to its `show`/`satisfy` helpers.
- 69eb63b: Refactored tablegen in preparation for multiple namespaces and addressed a few edge cases:

  - User types configured with a relative `filePath` are now resolved relative to the project root (where the `mud.config.ts` lives) rather than the current working directory.
  - User types inside libraries now need to be referenced with their fully-qualified code path (e.g. `LibraryName.UserTypeName`).

- fb1cfef: Refactored how the config handles shorthand table definitions, greatly simplifying the codebase. This will make it easier to add support for multiple namespaces.
- Updated dependencies [7129a16]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [8d0453e]
  - @latticexyz/config@2.1.0
  - @latticexyz/common@2.1.0
  - @latticexyz/protocol-parser@2.1.0
  - @latticexyz/schema-type@2.1.0

## 2.0.12

### Patch Changes

- c10c9fb2d: Internal `tablegen` function (exported from `@latticexyz/store/codegen`) now expects an object of options with a `configPath` to use as a base path to resolve other relative paths from.
- c10c9fb2d: Added `sourceDirectory` as a top-level config option for specifying contracts source (i.e. Solidity) directory relative to the MUD config. This is used to resolve other paths in the config, like codegen and user types. Like `foundry.toml`, this defaults to `src` and should be kept in sync with `foundry.toml`.

  Also added a `codegen.namespaceDirectories` option to organize codegen output (table libraries, etc.) into directories by namespace. For example, a `Counter` table in the `app` namespace will have codegen at `codegen/app/tables/Counter.sol`. If not set, defaults to `true` when using top-level `namespaces` key, `false` otherwise.

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
  - @latticexyz/config@2.0.12
  - @latticexyz/protocol-parser@2.0.12
  - @latticexyz/schema-type@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/common@2.0.11
- @latticexyz/config@2.0.11
- @latticexyz/protocol-parser@2.0.11
- @latticexyz/schema-type@2.0.11

## 2.0.10

### Patch Changes

- 4e4e9104: Removed the unused `ejs` dependency.
- 32c1cda6: `defineStore` and `defineWorld` will now throw a type error if an unexpected config option is used.
- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- 27f888c7: `defineStore` and `defineWorld` now maps your `enums` to usable, strongly-typed enums on `enumValues`.

  ```ts
  const config = defineStore({
    enums: {
      TerrainType: ["Water", "Grass", "Sand"],
    },
  });

  config.enumValues.TerrainType.Water;
  //                              ^? (property) Water: 0

  config.enumValues.TerrainType.Grass;
  //                              ^? (property) Grass: 1
  ```

  This allows for easier referencing of enum values (i.e. `uint8` equivalent) in contract calls.

  ```ts
  writeContract({
    // …
    functionName: "setTerrainType",
    args: [config.enumValues.TerrainType.Grass],
  });
  ```

- Updated dependencies [51b137d3]
- Updated dependencies [4caca05e]
  - @latticexyz/common@2.0.10
  - @latticexyz/config@2.0.10
  - @latticexyz/protocol-parser@2.0.10
  - @latticexyz/schema-type@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9
  - @latticexyz/config@2.0.9
  - @latticexyz/protocol-parser@2.0.9
  - @latticexyz/schema-type@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/config@2.0.8
  - @latticexyz/protocol-parser@2.0.8
  - @latticexyz/schema-type@2.0.8

## 2.0.7

### Patch Changes

- ed404b7d: Added a check to `registerTable` that prevents registering both an offchain and onchain table with the same name, making it easier to use human-readable names in indexers.
- Updated dependencies [375d902e]
- Updated dependencies [38c61158]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/config@2.0.7
  - @latticexyz/protocol-parser@2.0.7
  - @latticexyz/schema-type@2.0.7

## 2.0.6

### Patch Changes

- 103db6ce: Patched `StoreRead.getDynamicFieldLength` to properly read `StoreCore.getDynamicFieldLength`.

  Previously `StoreRead.getDynamicFieldLength` incorrectly read from `StoreCore.getFieldLength`, which expected a `fieldIndex` instead of a `dynamicFieldIndex`, and thereby returned an invalid result if the table had both static and dynamic fields (in which case `fieldIndex` != `dynamicFieldIndex`). `StoreRead` is used for external reads from the `Store`/`World` contract, so this bug only materialized in external table reads (ie from `Systems` outside the root namespace) of the dynamic length of a field in a table with both static and dynamic fields.

- 9720b568: Internal type improvements.
- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6
  - @latticexyz/config@2.0.6
  - @latticexyz/protocol-parser@2.0.6
  - @latticexyz/schema-type@2.0.6

## 2.0.5

### Patch Changes

- b798ccb2: Fixed the behaviour of static arrays, so that they return zero for uninitialised values, to mirror the native Solidity behavior. Previously they reverted with `Store_IndexOutOfBounds` if the index had not been set yet.
- Updated dependencies [a9e8a407]
  - @latticexyz/common@2.0.5
  - @latticexyz/config@2.0.5
  - @latticexyz/protocol-parser@2.0.5
  - @latticexyz/schema-type@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/config@2.0.4
  - @latticexyz/protocol-parser@2.0.4
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/config@2.0.3
  - @latticexyz/protocol-parser@2.0.3
  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/common@2.0.2
- @latticexyz/config@2.0.2
- @latticexyz/protocol-parser@2.0.2
- @latticexyz/schema-type@2.0.2

## 2.0.1

### Patch Changes

- 4a6b4598: Minor fixes to config input validations:

  - `systems.openAccess` incorrectly expected `true` as the only valid input. It now allows `boolean`.
  - The config complained if parts of it were defined `as const` outside the config input. This is now possible.
  - Shorthand inputs are now enabled.
  - @latticexyz/common@2.0.1
  - @latticexyz/config@2.0.1
  - @latticexyz/protocol-parser@2.0.1
  - @latticexyz/schema-type@2.0.1

## 2.0.0

### Major Changes

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

- c9ee5e4a: Store and World configs have been rebuilt with strong types. The shape of these configs have also changed slightly for clarity, the biggest change of which is merging of `keySchema` and `valueSchema` into a single `schema` with a separate `key` for a table's primary key.

  To migrate, first update the imported config method:

  ```diff filename="mud.config.ts"
  -import { mudConfig } from "@latticexyz/world/register";
  +import { defineWorld } from "@latticexyz/world";

  -export default mudConfig({
  +export default defineWorld({
  ```

  _Note that if you are only using Store, you will need to import `defineStore` from `@latticexyz/store`._

  Then migrate the table key by renaming `keySchema` to `schema` and define the table `key` with each field name from your key schema:

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
       Position: {
  -      keySchema: {
  +      schema: {
           player: "address",
         },
         valueSchema: {
           x: "int32",
           y: "int32",
         },
  +      key: ['player'],
       },
     },
   });
  ```

  Now we can merge the `valueSchema` into `schema`.

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
       Position: {
         schema: {
           player: "address",
  -      },
  -      valueSchema: {
           x: "int32",
           y: "int32",
         },
         key: ['player'],
       },
     },
   });
  ```

  If you previously used the table config shorthand without the full `keySchema` and `valueSchema`, some of the defaults have changed. Shorthands now use an `id: "bytes32"` field by default rather than `key: "bytes32"` and corresponding `key: ["id"]`. To keep previous behavior, you may have to manually define your `schema` with the previous `key` and `value` fields.

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
  -    OwnedBy: "address",
  +    OwnedBy: {
  +      schema: {
  +        key: "bytes32",
  +        value: "address",
  +      },
  +      key: ["key"],
  +    },
     },
   });
  ```

  Singleton tables are defined similarly, where an empty `key` rather than `keySchema` is provided:

  ```diff filename="mud.config.ts"
  -keySchema: {}
  +key: []
  ```

  Offchain tables are now defined as a table `type` instead an `offchainOnly` boolean:

  ```diff filename="mud.config.ts"
  -offchainOnly: true
  +type: 'offchainTable'
  ```

  All codegen options have moved under `codegen`:

  ```diff filename="mud.config.ts"
   export default defineWorld({
  -  codegenDirectory: "…",
  +  codegen: {
  +    outputDirectory: "…",
  +  },
     tables: {
       Position: {
         schema: {
           player: "address",
           x: "int32",
           y: "int32",
         },
         key: ['player'],
  -      directory: "…",
  -      dataStruct: false,
  +      codegen: {
  +        outputDirectory: "…",
  +        dataStruct: false,
  +      },
       },
     },
   });
  ```

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

- aabd30767: Bumped Solidity version to 0.8.24.
- 331dbfdcb: We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  If you've written your own sync logic or are interacting with Store calls directly, this is a breaking change. We have a few more breaking protocol changes upcoming, so you may hold off on upgrading until those land.

  If you are using MUD's built-in tooling (table codegen, indexer, store sync, etc.), you don't have to make any changes except upgrading to the latest versions and deploying a fresh World.

  - The `data` field in each `StoreSetRecord` and `StoreEphemeralRecord` has been replaced with three new fields: `staticData`, `encodedLengths`, and `dynamicData`. This better reflects the on-chain state and makes it easier to perform modifications to the raw bytes. We recommend storing each of these fields individually in your off-chain storage of choice (indexer, client, etc.).

    ```diff
    - event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);

    - event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);
    ```

  - The `StoreSetField` event is now replaced by two new events: `StoreSpliceStaticData` and `StoreSpliceDynamicData`. Splicing allows us to perform efficient operations like push and pop, in addition to replacing a field value. We use two events because updating a dynamic-length field also requires updating the record's `encodedLengths` (aka PackedCounter).

    ```diff
    - event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
    + event StoreSpliceStaticData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data);
    + event StoreSpliceDynamicData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths);
    ```

  Similarly, Store setter methods (e.g. `setRecord`) have been updated to reflect the `data` to `staticData`, `encodedLengths`, and `dynamicData` changes. We'll be following up shortly with Store getter method changes for more gas efficient storage reads.

- f9f9609ef: The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
  where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

  ```diff
  IStore {
    event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes data,
  -   PackedCounter encodedLengths
    );
  }

  IStoreHook {
    function onBeforeSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;

    function onAfterSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;
  }
  ```

- b9e562d8f: The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

  The required `supportsInterface` methods are implemented on the respective base contracts.
  When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

  ```diff
  - import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
  + import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

  - contract MyStoreHook is IStoreHook {}
  + contract MyStoreHook is StoreHook {}
  ```

  ```diff
  - import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
  + import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

  - contract MySystemHook is ISystemHook {}
  + contract MySystemHook is SystemHook {}
  ```

  ```diff
  - import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
  + import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

  - contract MyDelegationControl is IDelegationControl {}
  + contract MyDelegationControl is DelegationControl {}
  ```

  ```diff
  - import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
  + import { Module } from "@latticexyz/world/src/Module.sol";

  - contract MyModule is IModule {}
  + contract MyModule is Module {}
  ```

- 759514d8b: Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

  ```diff
  - import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
  + import {
  +   BEFORE_SET_RECORD,
  +   BEFORE_SET_FIELD,
  +   BEFORE_DELETE_RECORD
  + } from "@latticexyz/store/storeHookTypes.sol";

    StoreCore.registerStoreHook(
      tableId,
      subscriber,
  -   StoreHookLib.encodeBitmap({
  -     onBeforeSetRecord: true,
  -     onAfterSetRecord: false,
  -     onBeforeSetField: true,
  -     onAfterSetField: false,
  -     onBeforeDeleteRecord: true,
  -     onAfterDeleteRecord: false
  -   })
  +   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
    );
  ```

  ```diff
  - import { SystemHookLib } from "../src/SystemHook.sol";
  + import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

    world.registerSystemHook(
      systemId,
      subscriber,
  -   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
  +   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
    );

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

- d5094a242: - The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

  - All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.
  - `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

    These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
    the new splice hooks.

    `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

    ```solidity
    interface IStore {
      // Splice data in the static part of the record
      function spliceStaticData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
        uint40 deleteCount,
        bytes calldata data
      ) external;

      // Splice data in the dynamic part of the record
      function spliceDynamicData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint8 dynamicFieldIndex,
        uint40 startWithinField,
        uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

- a25881160: Remove `TableId` library to simplify `store` package
- c4d5eb4e4: - The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

  - It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

    ```diff
    function registerStoreHook(
      bytes32 tableId,
    - IStoreHook hookAddress
    + IStoreHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;

    function registerSystemHook(
      bytes32 systemId,
    - ISystemHook hookAddress
    + ISystemHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;
    ```

    There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

    ```solidity
    import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

    uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
      onBeforeSetRecord: true,
      onAfterSetRecord: true,
      onBeforeSetField: true,
      onAfterSetField: true,
      onBeforeDeleteRecord: true,
      onAfterDeleteRecord: true
    });
    ```

    ```solidity
    import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

    uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
      onBeforeCallSystem: true,
      onAfterCallSystem: true
    });
    ```

  - The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.

- 9aa5e786: Set the protocol version to `2.0.0` for each Store and World.
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

- ae340b2bf: Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

  If you use codegenerated libraries, you will only need to update `encode` calls.

  ```diff
  - bytes memory data = Position.encode(x, y);
  + (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
  ```

- 433078c54: Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

- 83583a505: Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

  ```diff
  - import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
  + import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
  ```

  `MudTest.sol` was also moved to the World package. You can update your import like:

  ```diff
  - import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  + import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
  ```

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

- 44a5432ac: These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

  - Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
  - In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
  - Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
  - Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.

- 65c9546c4: - Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).
  - Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.
- 672d05ca1: - Moves Store events into its own `IStoreEvents` interface

  - Moves Store interfaces to their own files
  - Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

  If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.

- 8193136a9: Added `dynamicFieldIndex` to the `Store_SpliceDynamicData` event. This enables indexers to store dynamic data as a blob per dynamic field without a schema lookup.
- 92de59982: Bump Solidity version to 0.8.21
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

- bfcb293d1: What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- 1890f1a06: Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).
- af639a264: `Store` events have been renamed for consistency and readability.
  If you're parsing `Store` events manually, you need to update your ABI.
  If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

  ```diff
  - event StoreSetRecord(
  + event Store_SetRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      bytes staticData,
      bytes32 encodedLengths,
      bytes dynamicData
    );
  - event StoreSpliceStaticData(
  + event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data
    );
  - event StoreSpliceDynamicData(
  + event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data,
      bytes32 encodedLengths
    );
  - event StoreDeleteRecord(
  + event Store_DeleteRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple
    );
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

- 99ab9cd6f: Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.
- c049c23f4: - `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

  - The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
    `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.

- 24a6cd536: Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.
- 5c52bee09: Renamed `StoreCore`'s `registerCoreTables` method to `registerInternalTables`.
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

- 252a1852: Migrated to new config format.

### Minor Changes

- 1d60930d6: It is now possible to unregister Store hooks and System hooks.

  ```solidity
  interface IStore {
    function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
    // ...
  }

  interface IWorld {
    function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
    // ...
  }
  ```

- 66cc35a8c: Create gas-report package, move gas-report cli command and GasReporter contract to it
- a7b30c79b: Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

  ```solidity
  // old import
  import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
  // new import
  import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  ```

  Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

  - Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
  - With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
  - In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
  - Besides gas savings, this change has two additional benefits:
    1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
    2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.

- 93390d89: Added an `abstract` `StoreKernel` contract, which includes all Store interfaces except for registration, and implements write methods, `protocolVersion` and initializes `StoreCore`. `Store` extends `StoreKernel` with the `IStoreRegistration` interface. `StoreData` is removed as a separate interface/contract. `World` now extends `StoreKernel` (since the registration methods are added via the `InitModule`).
- 144c0d8d: Replaced the static array length getters in table libraries with constants.
- 9b43029c3: Add protocol version with corresponding getter and event on deploy

  ```solidity
  world.worldVersion();
  world.storeVersion(); // a World is also a Store
  ```

  ```solidity
  event HelloWorld(bytes32 indexed worldVersion);
  event HelloStore(bytes32 indexed storeVersion);
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

- 80dd6992e: Add an optional `namePrefix` argument to `renderRecordData`, to support inlined logic in codegenned `set` method which uses a struct.
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

- 3ac68ade6: Removed `allowEmpty` option from `FieldLayout.validate()` as field layouts should never be empty.
- 3042f86e: Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

  ```diff
  -console.log(SomeTable.getKeySchema());
  +console.log(SomeTable._keySchema);

  -console.log(SomeTable.getValueSchema());
  +console.log(SomeTable._valueSchema);
  ```

- 5e71e1cb5: Moved `KeySchema`, `ValueSchema`, `SchemaToPrimitives` and `TableRecord` types into `@latticexyz/protocol-parser`
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

- 8025c3505: We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

  If you previously relied on TypeChain types from `@latticexyz/store` or `@latticexyz/world`, you will either need to migrate to viem or abitype using ABI JSON imports or generate TypeChain types from our exported ABI JSON files.

  ```ts
  import { getContract } from "viem";
  import IStoreAbi from "@latticexyz/store/abi/IStore.sol/IStore.abi.json";

  const storeContract = getContract({
    abi: IStoreAbi,
    ...
  });

  await storeContract.write.setRecord(...);
  ```

- 103f635eb: Improved error messages for invalid `FieldLayout`s

  ```diff
  -error FieldLayoutLib_InvalidLength(uint256 length);
  +error FieldLayoutLib_TooManyFields(uint256 numFields, uint256 maxFields);
  +error FieldLayoutLib_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
  +error FieldLayoutLib_Empty();
  ```

### Patch Changes

- d8c8f66bf: Exclude ERC165 interface ID from custom interface ID's.
- c6c13f2ea: Storage events are now emitted after "before" hooks, so that the resulting logs are now correctly ordered and reflect onchain logic. This resolves issues with store writes and event emissions happening in "before" hooks.
- 1b86eac05: Changed the type of the output variable in the `slice4` function to `bytes4`.
- a35c05ea9: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- c963b46c7: Optimize storage library
- 05b3e8882: Fixed a race condition when registering core tables, where we would set a record in the `ResourceIds` table before the table was registered.
- aea67c580: Include bytecode for `World` and `Store` in npm packages.
- 90e4161bb: Moved the test tables out of the main config in `world` and `store` and into their own separate config.
- 904fd7d4e: Add store sync package
- e6c03a87a: Renamed the `requireNoCallback` modifier to `prohibitDirectCallback`.
- 1077c7f53: Fixed an issue where `mud.config.ts` source file was not included in the package, causing TS errors downstream.
- 2c920de7: Refactored `StoreCore` to import `IStoreEvents` instead of defining the events twice.
- 44236041f: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- f62c767e7: Parallelized table codegen. Also put logs behind debug flag, which can be enabled using the `DEBUG=mud:*` environment variable.
- 37c228c63: Refactored various files to specify integers in a hex base instead of decimals.
- c991c71a: Added interfaces for all errors that are used by `StoreCore`, which includes `FieldLayout`, `PackedCounter`, `Schema`, and `Slice`. This interfaces are inherited by `IStore`, ensuring that all possible errors are included in the `IStore` ABI for proper decoding in the frontend.
- 1bf2e9087: Updated codegen to not render `push` and `pop` methods for static arrays. The `length` method now returns the hardcoded known length instead of calculating it like with a dynamic array.
- 211be2a1e: The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
  This significantly reduces gas cost in all table library functions.
- 0f3e2e02b: Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).
- d08789282: Prefixed all errors with their respective library/contract for improved debugging.
- 5c965a919: Align Store events parameter naming between IStoreWrite and StoreCore
- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- d5b73b126: Optimize autogenerated table libraries
- 190fdd11: Restored `Bytes.sliceN` helpers that were previously (mistakenly) removed and renamed them to `Bytes.getBytesN`.

  If you're upgrading an existing MUD project, you can rerun codegen with `mud build` to update your table libraries to the new function names.

- b2d2aa715: Added an explicit package export for `mud.config`
- 5e723b90e: The `ResourceType` table is removed.
  It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

  To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
  The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
  This problem is solved by the new table `ResourceIds` being part of `Store`.

  `StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

  ```diff
  - import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
  - import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
  + import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

  - bool tableExists = StoreCore.hasTable(tableId);
  + bool tableExists = ResourceIds.getExists(tableId);

  - bool systemExists = ResourceType.get(systemId) != Resource.NONE;
  + bool systemExists = ResourceIds.getExists(systemId);
  ```

- 6573e38e9: Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );

  event StoreSetField(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key
  );

  event StoreEphemeralRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );
  ```

- 37c228c63: Refactored `ResourceId` to use a global Solidity `using` statement.
- 37c228c63: Refactored EIP165 usages to use the built-in interfaceId property instead of pre-defined constants.
- 6e66c5b74: Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );

  event StoreSetField(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
  );

  event StoreEphemeralRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );
  ```

- 8d51a0348: Clean up Memory.sol, make mcopy pure
- 48909d151: bump forge-std and ds-test dependencies
- 7b28d32e5: Added a custom error `Store_InvalidBounds` for when the `start:end` slice in `getDynamicFieldSlice` is invalid (it used to revert with the default overflow error)
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
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

- 9f8b84e73: Aligned the order of function arguments in the `Storage` library.

  ```solidity
  store(uint256 storagePointer, uint256 offset, bytes memory data)
  store(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
  load(uint256 storagePointer, uint256 offset, uint256 length)
  load(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
  ```

- 55a05fd7a: Refactored `StoreCore.registerStoreHook` to use `StoreHooks._push` for gas efficiency.
- 63831a264: Minor `Store` cleanups: renamed `Utils.sol` to `leftMask.sol` since it only contains a single free function, and removed a leftover sanity check.
- 6db95ce15: Fixed `StoreCore` to pass `previousEncodedLengths` into `onBeforeSpliceDynamicData`.
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 22ee44700: All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.
- ad4ac4459: Added more validation checks for `FieldLayout` and `Schema`.
- be313068b: Optimized the `StoreCore` hash function determining the data location to use less gas.
- bb91edaa0: Fixed `resolveUserTypes` for static arrays.
  `resolveUserTypes` is used by `deploy`, which prevented deploying tables with static arrays.
- 5ac4c97f4: Fixed M-04 Memory Corruption on Load From Storage
  It only affected external use of `Storage.load` with a `memoryPointer` argument
- e48171741: Removed unused imports from various files in the `store` and `world` packages.
- 37c228c63: Refactored various Solidity files to not explicitly initialise variables to zero.
- c58da9ad: Moved the `HelloStore` to `IStoreEvents` so all Store events are defined in the same interface.
- 37c228c63: Refactored some Store functions to use a right bit mask instead of left.
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- 0d12db8c2: Optimize Schema methods.
  Return `uint256` instead of `uint8` in SchemaInstance numFields methods
- 37c228c63: Simplified a check in `Slice.getSubslice`.
- 22ba7b675: Simplified a couple internal constants used for bitshifting.
- 745485cda: Updated `StoreCore` to check that tables exist before registering store hooks.
- 37c228c63: Optimised the `Schema.validate` function to decrease gas use.
- cc2c8da00: - Refactor tightcoder to use typescript functions instead of ejs
  - Optimize `TightCoder` library
  - Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers
- Updated dependencies [a35c05ea9]
- Updated dependencies [16b13ea8f]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [904fd7d4e]
- Updated dependencies [b98e51808]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [3fb9ce283]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [aacffcb59]
- Updated dependencies [b38c096d]
- Updated dependencies [4bb7e8cbf]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e34d1170]
- Updated dependencies [b8a6158d6]
- Updated dependencies [433078c54]
- Updated dependencies [db314a74]
- Updated dependencies [ca50fef81]
- Updated dependencies [59267655]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [48909d151]
- Updated dependencies [f8a01a047]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [f62c767e7]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [f03531d97]
- Updated dependencies [b8a6158d6]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [92de59982]
- Updated dependencies [9ff4dd955]
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
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [a2f41ade9]
- Updated dependencies [cea754dde]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [331f0d636]
- Updated dependencies [cc2c8da00]
  - @latticexyz/common@2.0.0
  - @latticexyz/protocol-parser@2.0.0
  - @latticexyz/schema-type@2.0.0
  - @latticexyz/config@2.0.0

## 2.0.0-next.18

### Major Changes

- c9ee5e4a: Store and World configs have been rebuilt with strong types. The shape of these configs have also changed slightly for clarity, the biggest change of which is merging of `keySchema` and `valueSchema` into a single `schema` with a separate `key` for a table's primary key.

  To migrate, first update the imported config method:

  ```diff filename="mud.config.ts"
  -import { mudConfig } from "@latticexyz/world/register";
  +import { defineWorld } from "@latticexyz/world";

  -export default mudConfig({
  +export default defineWorld({
  ```

  _Note that if you are only using Store, you will need to import `defineStore` from `@latticexyz/store`._

  Then migrate the table key by renaming `keySchema` to `schema` and define the table `key` with each field name from your key schema:

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
       Position: {
  -      keySchema: {
  +      schema: {
           player: "address",
         },
         valueSchema: {
           x: "int32",
           y: "int32",
         },
  +      key: ['player'],
       },
     },
   });
  ```

  Now we can merge the `valueSchema` into `schema`.

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
       Position: {
         schema: {
           player: "address",
  -      },
  -      valueSchema: {
           x: "int32",
           y: "int32",
         },
         key: ['player'],
       },
     },
   });
  ```

  If you previously used the table config shorthand without the full `keySchema` and `valueSchema`, some of the defaults have changed. Shorthands now use an `id: "bytes32"` field by default rather than `key: "bytes32"` and corresponding `key: ["id"]`. To keep previous behavior, you may have to manually define your `schema` with the previous `key` and `value` fields.

  ```diff filename="mud.config.ts"
   export default defineWorld({
     tables: {
  -    OwnedBy: "address",
  +    OwnedBy: {
  +      schema: {
  +        key: "bytes32",
  +        value: "address",
  +      },
  +      key: ["key"],
  +    },
     },
   });
  ```

  Singleton tables are defined similarly, where an empty `key` rather than `keySchema` is provided:

  ```diff filename="mud.config.ts"
  -keySchema: {}
  +key: []
  ```

  Offchain tables are now defined as a table `type` instead an `offchainOnly` boolean:

  ```diff filename="mud.config.ts"
  -offchainOnly: true
  +type: 'offchainTable'
  ```

  All codegen options have moved under `codegen`:

  ```diff filename="mud.config.ts"
   export default defineWorld({
  -  codegenDirectory: "…",
  +  codegen: {
  +    outputDirectory: "…",
  +  },
     tables: {
       Position: {
         schema: {
           player: "address",
           x: "int32",
           y: "int32",
         },
         key: ['player'],
  -      directory: "…",
  -      dataStruct: false,
  +      codegen: {
  +        outputDirectory: "…",
  +        dataStruct: false,
  +      },
       },
     },
   });
  ```

- 9aa5e786: Set the protocol version to `2.0.0` for each Store and World.
- 8193136a9: Added `dynamicFieldIndex` to the `Store_SpliceDynamicData` event. This enables indexers to store dynamic data as a blob per dynamic field without a schema lookup.
- 3e7d83d0: Renamed `PackedCounter` to `EncodedLengths` for consistency.
- 252a1852: Migrated to new config format.

### Minor Changes

- 93390d89: Added an `abstract` `StoreKernel` contract, which includes all Store interfaces except for registration, and implements write methods, `protocolVersion` and initializes `StoreCore`. `Store` extends `StoreKernel` with the `IStoreRegistration` interface. `StoreData` is removed as a separate interface/contract. `World` now extends `StoreKernel` (since the registration methods are added via the `InitModule`).
- 144c0d8d: Replaced the static array length getters in table libraries with constants.
- 3042f86e: Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

  ```diff
  -console.log(SomeTable.getKeySchema());
  +console.log(SomeTable._keySchema);

  -console.log(SomeTable.getValueSchema());
  +console.log(SomeTable._valueSchema);
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

### Patch Changes

- 2c920de7: Refactored `StoreCore` to import `IStoreEvents` instead of defining the events twice.
- 44236041: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- c991c71a: Added interfaces for all errors that are used by `StoreCore`, which includes `FieldLayout`, `PackedCounter`, `Schema`, and `Slice`. This interfaces are inherited by `IStore`, ensuring that all possible errors are included in the `IStore` ABI for proper decoding in the frontend.
- 190fdd11: Restored `Bytes.sliceN` helpers that were previously (mistakenly) removed and renamed them to `Bytes.getBytesN`.

  If you're upgrading an existing MUD project, you can rerun codegen with `mud build` to update your table libraries to the new function names.

- c58da9ad: Moved the `HelloStore` to `IStoreEvents` so all Store events are defined in the same interface.
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [44236041]
- Updated dependencies [307abab3]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [d7b1c588a]
- Updated dependencies [3e7d83d0]
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/protocol-parser@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18
  - @latticexyz/config@2.0.0-next.18

## 2.0.0-next.17

### Major Changes

- aabd3076: Bumped Solidity version to 0.8.24.
- 5c52bee0: Renamed `StoreCore`'s `registerCoreTables` method to `registerInternalTables`.

### Patch Changes

- a35c05ea: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- 05b3e888: Fixed a race condition when registering core tables, where we would set a record in the `ResourceIds` table before the table was registered.
- 55a05fd7: Refactored `StoreCore.registerStoreHook` to use `StoreHooks._push` for gas efficiency.
- 745485cd: Updated `StoreCore` to check that tables exist before registering store hooks.
- Updated dependencies [a35c05ea]
- Updated dependencies [aabd3076]
- Updated dependencies [c162ad5a]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/schema-type@2.0.0-next.17
  - @latticexyz/config@2.0.0-next.17

## 2.0.0-next.16

### Minor Changes

- 3ac68ade: Removed `allowEmpty` option from `FieldLayout.validate()` as field layouts should never be empty.
- 103f635e: Improved error messages for invalid `FieldLayout`s

  ```diff
  -error FieldLayoutLib_InvalidLength(uint256 length);
  +error FieldLayoutLib_TooManyFields(uint256 numFields, uint256 maxFields);
  +error FieldLayoutLib_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
  +error FieldLayoutLib_Empty();
  ```

### Patch Changes

- c6c13f2e: Storage events are now emitted after "before" hooks, so that the resulting logs are now correctly ordered and reflect onchain logic. This resolves issues with store writes and event emissions happening in "before" hooks.
- e6c03a87: Renamed the `requireNoCallback` modifier to `prohibitDirectCallback`.
- 37c228c6: Refactored various files to specify integers in a hex base instead of decimals.
- 1bf2e908: Updated codegen to not render `push` and `pop` methods for static arrays. The `length` method now returns the hardcoded known length instead of calculating it like with a dynamic array.
- 37c228c6: Refactored `ResourceId` to use a global Solidity `using` statement.
- 37c228c6: Refactored EIP165 usages to use the built-in interfaceId property instead of pre-defined constants.
- 7b28d32e: Added a custom error `Store_InvalidBounds` for when the `start:end` slice in `getDynamicFieldSlice` is invalid (it used to revert with the default overflow error)
- 9f8b84e7: Aligned the order of function arguments in the `Storage` library.

  ```solidity
  store(uint256 storagePointer, uint256 offset, bytes memory data)
  store(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
  load(uint256 storagePointer, uint256 offset, uint256 length)
  load(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
  ```

- ad4ac445: Added more validation checks for `FieldLayout` and `Schema`.
- 37c228c6: Refactored various Solidity files to not explicitly initialise variables to zero.
- 37c228c6: Refactored some Store functions to use a right bit mask instead of left.
- 37c228c6: Simplified a check in `Slice.getSubslice`.
- 37c228c6: Optimised the `Schema.validate` function to decrease gas use.
  - @latticexyz/common@2.0.0-next.16
  - @latticexyz/config@2.0.0-next.16
  - @latticexyz/schema-type@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- d8c8f66b: Exclude ERC165 interface ID from custom interface ID's.
- 1b86eac0: Changed the type of the output variable in the `slice4` function to `bytes4`.
- 1077c7f5: Fixed an issue where `mud.config.ts` source file was not included in the package, causing TS errors downstream.
- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 6db95ce1: Fixed `StoreCore` to pass `previousEncodedLengths` into `onBeforeSpliceDynamicData`.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 5ac4c97f: Fixed M-04 Memory Corruption on Load From Storage
  It only affected external use of `Storage.load` with a `memoryPointer` argument
- e4817174: Removed unused imports from various files in the `store` and `world` packages.
- Updated dependencies [933b54b5]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [5d737cf2]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/config@2.0.0-next.15
  - @latticexyz/schema-type@2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- b2d2aa71: Added an explicit package export for `mud.config`
- bb91edaa: Fixed `resolveUserTypes` for static arrays.
  `resolveUserTypes` is used by `deploy`, which prevented deploying tables with static arrays.
- Updated dependencies [aacffcb5]
- Updated dependencies [bb91edaa]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/schema-type@2.0.0-next.14
  - @latticexyz/config@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/config@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Major Changes

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

### Patch Changes

- f62c767e: Parallelized table codegen. Also put logs behind debug flag, which can be enabled using the `DEBUG=mud:*` environment variable.
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/config@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/config@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/config@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10

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

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  If you've written your own sync logic or are interacting with Store calls directly, this is a breaking change. We have a few more breaking protocol changes upcoming, so you may hold off on upgrading until those land.

  If you are using MUD's built-in tooling (table codegen, indexer, store sync, etc.), you don't have to make any changes except upgrading to the latest versions and deploying a fresh World.

  - The `data` field in each `StoreSetRecord` and `StoreEphemeralRecord` has been replaced with three new fields: `staticData`, `encodedLengths`, and `dynamicData`. This better reflects the on-chain state and makes it easier to perform modifications to the raw bytes. We recommend storing each of these fields individually in your off-chain storage of choice (indexer, client, etc.).

    ```diff
    - event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);

    - event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);
    ```

  - The `StoreSetField` event is now replaced by two new events: `StoreSpliceStaticData` and `StoreSpliceDynamicData`. Splicing allows us to perform efficient operations like push and pop, in addition to replacing a field value. We use two events because updating a dynamic-length field also requires updating the record's `encodedLengths` (aka PackedCounter).

    ```diff
    - event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
    + event StoreSpliceStaticData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data);
    + event StoreSpliceDynamicData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths);
    ```

  Similarly, Store setter methods (e.g. `setRecord`) have been updated to reflect the `data` to `staticData`, `encodedLengths`, and `dynamicData` changes. We'll be following up shortly with Store getter method changes for more gas efficient storage reads.

- [#1589](https://github.com/latticexyz/mud/pull/1589) [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2) Thanks [@alvrs](https://github.com/alvrs)! - The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
  where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

  ```diff
  IStore {
    event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes data,
  -   PackedCounter encodedLengths
    );
  }

  IStoreHook {
    function onBeforeSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;

    function onAfterSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;
  }
  ```

- [#1527](https://github.com/latticexyz/mud/pull/1527) [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8) Thanks [@holic](https://github.com/holic)! - Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

  ```diff
  - import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
  + import {
  +   BEFORE_SET_RECORD,
  +   BEFORE_SET_FIELD,
  +   BEFORE_DELETE_RECORD
  + } from "@latticexyz/store/storeHookTypes.sol";

    StoreCore.registerStoreHook(
      tableId,
      subscriber,
  -   StoreHookLib.encodeBitmap({
  -     onBeforeSetRecord: true,
  -     onAfterSetRecord: false,
  -     onBeforeSetField: true,
  -     onAfterSetField: false,
  -     onBeforeDeleteRecord: true,
  -     onAfterDeleteRecord: false
  -   })
  +   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
    );
  ```

  ```diff
  - import { SystemHookLib } from "../src/SystemHook.sol";
  + import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

    world.registerSystemHook(
      systemId,
      subscriber,
  -   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
  +   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
    );

  ```

- [#1531](https://github.com/latticexyz/mud/pull/1531) [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4) Thanks [@alvrs](https://github.com/alvrs)! - - The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

  - All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.

  - `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

    These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
    the new splice hooks.

    `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

    ```solidity
    interface IStore {
      // Splice data in the static part of the record
      function spliceStaticData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
        uint40 deleteCount,
        bytes calldata data
      ) external;

      // Splice data in the dynamic part of the record
      function spliceDynamicData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint8 dynamicFieldIndex,
        uint40 startWithinField,
        uint40 deleteCount,
        bytes calldata data
      ) external;
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

- [#1532](https://github.com/latticexyz/mud/pull/1532) [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623) Thanks [@dk1a](https://github.com/dk1a)! - Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

  If you use codegenerated libraries, you will only need to update `encode` calls.

  ```diff
  - bytes memory data = Position.encode(x, y);
  + (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
  ```

- [#1483](https://github.com/latticexyz/mud/pull/1483) [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab) Thanks [@holic](https://github.com/holic)! - Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

  ```diff
  - import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
  + import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
  ```

  `MudTest.sol` was also moved to the World package. You can update your import like:

  ```diff
  - import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  + import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
  ```

- [#1566](https://github.com/latticexyz/mud/pull/1566) [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9) Thanks [@dk1a](https://github.com/dk1a)! - These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

  - Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
  - In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
  - Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
  - Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.

- [#1550](https://github.com/latticexyz/mud/pull/1550) [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e) Thanks [@dk1a](https://github.com/dk1a)! - - Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).

  - Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.

- [#1602](https://github.com/latticexyz/mud/pull/1602) [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840) Thanks [@holic](https://github.com/holic)! - - Moves Store events into its own `IStoreEvents` interface

  - Moves Store interfaces to their own files
  - Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

  If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

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

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- [#1601](https://github.com/latticexyz/mud/pull/1601) [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70) Thanks [@alvrs](https://github.com/alvrs)! - Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

- [#1577](https://github.com/latticexyz/mud/pull/1577) [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c) Thanks [@alvrs](https://github.com/alvrs)! - `Store` events have been renamed for consistency and readability.
  If you're parsing `Store` events manually, you need to update your ABI.
  If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

  ```diff
  - event StoreSetRecord(
  + event Store_SetRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      bytes staticData,
      bytes32 encodedLengths,
      bytes dynamicData
    );
  - event StoreSpliceStaticData(
  + event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data
    );
  - event StoreSpliceDynamicData(
  + event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data,
      bytes32 encodedLengths
    );
  - event StoreDeleteRecord(
  + event Store_DeleteRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple
    );
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

- [#1520](https://github.com/latticexyz/mud/pull/1520) [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380) Thanks [@holic](https://github.com/holic)! - Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.

- [#1472](https://github.com/latticexyz/mud/pull/1472) [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf) Thanks [@alvrs](https://github.com/alvrs)! - - `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

  - The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
    `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.

- [#1587](https://github.com/latticexyz/mud/pull/1587) [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d) Thanks [@alvrs](https://github.com/alvrs)! - Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

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

### Minor Changes

- [#1511](https://github.com/latticexyz/mud/pull/1511) [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7) Thanks [@holic](https://github.com/holic)! - Add protocol version with corresponding getter and event on deploy

  ```solidity
  world.worldVersion();
  world.storeVersion(); // a World is also a Store
  ```

  ```solidity
  event HelloWorld(bytes32 indexed worldVersion);
  event HelloStore(bytes32 indexed storeVersion);
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

- [#1542](https://github.com/latticexyz/mud/pull/1542) [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2) Thanks [@dk1a](https://github.com/dk1a)! - Add an optional `namePrefix` argument to `renderRecordData`, to support inlined logic in codegenned `set` method which uses a struct.

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

### Patch Changes

- [#1490](https://github.com/latticexyz/mud/pull/1490) [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84) Thanks [@alvrs](https://github.com/alvrs)! - Include bytecode for `World` and `Store` in npm packages.

- [#1600](https://github.com/latticexyz/mud/pull/1600) [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8) Thanks [@alvrs](https://github.com/alvrs)! - Moved the test tables out of the main config in `world` and `store` and into their own separate config.

- [#1508](https://github.com/latticexyz/mud/pull/1508) [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9) Thanks [@Boffee](https://github.com/Boffee)! - The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
  This significantly reduces gas cost in all table library functions.

- [#1512](https://github.com/latticexyz/mud/pull/1512) [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c) Thanks [@Boffee](https://github.com/Boffee)! - Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).

- [#1568](https://github.com/latticexyz/mud/pull/1568) [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c) Thanks [@alvrs](https://github.com/alvrs)! - Prefixed all errors with their respective library/contract for improved debugging.

- [#1544](https://github.com/latticexyz/mud/pull/1544) [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae) Thanks [@alvrs](https://github.com/alvrs)! - The `ResourceType` table is removed.
  It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

  To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
  The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
  This problem is solved by the new table `ResourceIds` being part of `Store`.

  `StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

  ```diff
  - import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
  - import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
  + import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

  - bool tableExists = StoreCore.hasTable(tableId);
  + bool tableExists = ResourceIds.getExists(tableId);

  - bool systemExists = ResourceType.get(systemId) != Resource.NONE;
  + bool systemExists = ResourceIds.getExists(systemId);
  ```

- [#1484](https://github.com/latticexyz/mud/pull/1484) [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );

  event StoreSetField(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key
  );

  event StoreEphemeralRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );
  ```

- [#1492](https://github.com/latticexyz/mud/pull/1492) [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );

  event StoreSetField(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
  );

  event StoreEphemeralRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );
  ```

- [#1599](https://github.com/latticexyz/mud/pull/1599) [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619) Thanks [@alvrs](https://github.com/alvrs)! - Minor `Store` cleanups: renamed `Utils.sol` to `leftMask.sol` since it only contains a single free function, and removed a leftover sanity check.

- [#1586](https://github.com/latticexyz/mud/pull/1586) [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612) Thanks [@alvrs](https://github.com/alvrs)! - All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.

- [#1509](https://github.com/latticexyz/mud/pull/1509) [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87) Thanks [@Boffee](https://github.com/Boffee)! - Optimized the `StoreCore` hash function determining the data location to use less gas.

- [#1569](https://github.com/latticexyz/mud/pull/1569) [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7) Thanks [@alvrs](https://github.com/alvrs)! - Simplified a couple internal constants used for bitshifting.

- Updated dependencies [[`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/config@2.0.0-next.9

## 2.0.0-next.8

### Major Changes

- [#1458](https://github.com/latticexyz/mud/pull/1458) [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac) Thanks [@alvrs](https://github.com/alvrs)! - The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

  The required `supportsInterface` methods are implemented on the respective base contracts.
  When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

  ```diff
  - import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
  + import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

  - contract MyStoreHook is IStoreHook {}
  + contract MyStoreHook is StoreHook {}
  ```

  ```diff
  - import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
  + import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

  - contract MySystemHook is ISystemHook {}
  + contract MySystemHook is SystemHook {}
  ```

  ```diff
  - import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
  + import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

  - contract MyDelegationControl is IDelegationControl {}
  + contract MyDelegationControl is DelegationControl {}
  ```

  ```diff
  - import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
  + import { Module } from "@latticexyz/world/src/Module.sol";

  - contract MyModule is IModule {}
  + contract MyModule is Module {}
  ```

### Minor Changes

- [#1422](https://github.com/latticexyz/mud/pull/1422) [`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7) Thanks [@alvrs](https://github.com/alvrs)! - It is now possible to unregister Store hooks and System hooks.

  ```solidity
  interface IStore {
    function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
    // ...
  }

  interface IWorld {
    function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
    // ...
  }
  ```

- [#1443](https://github.com/latticexyz/mud/pull/1443) [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98) Thanks [@holic](https://github.com/holic)! - Moved `KeySchema`, `ValueSchema`, `SchemaToPrimitives` and `TableRecord` types into `@latticexyz/protocol-parser`

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/config@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Major Changes

- [#1399](https://github.com/latticexyz/mud/pull/1399) [`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15) Thanks [@alvrs](https://github.com/alvrs)! - - The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

  - It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

    ```diff
    function registerStoreHook(
      bytes32 tableId,
    - IStoreHook hookAddress
    + IStoreHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;

    function registerSystemHook(
      bytes32 systemId,
    - ISystemHook hookAddress
    + ISystemHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;
    ```

    There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

    ```solidity
    import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

    uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
      onBeforeSetRecord: true,
      onAfterSetRecord: true,
      onBeforeSetField: true,
      onAfterSetField: true,
      onBeforeDeleteRecord: true,
      onAfterDeleteRecord: true
    });
    ```

    ```solidity
    import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

    uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
      onBeforeCallSystem: true,
      onAfterCallSystem: true
    });
    ```

  - The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/config@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Minor Changes

- [#1413](https://github.com/latticexyz/mud/pull/1413) [`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561) Thanks [@holic](https://github.com/holic)! - We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

  If you previously relied on TypeChain types from `@latticexyz/store` or `@latticexyz/world`, you will either need to migrate to viem or abitype using ABI JSON imports or generate TypeChain types from our exported ABI JSON files.

  ```ts
  import { getContract } from "viem";
  import IStoreAbi from "@latticexyz/store/abi/IStore.sol/IStore.abi.json";

  const storeContract = getContract({
    abi: IStoreAbi,
    ...
  });

  await storeContract.write.setRecord(...);
  ```

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/config@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/config@2.0.0-next.5
  - @latticexyz/gas-report@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/config@2.0.0-next.4
  - @latticexyz/gas-report@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4

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

- [#1231](https://github.com/latticexyz/mud/pull/1231) [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db) Thanks [@dk1a](https://github.com/dk1a)! - Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

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

- [#1303](https://github.com/latticexyz/mud/pull/1303) [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd) Thanks [@dk1a](https://github.com/dk1a)! - Optimize autogenerated table libraries

- [#1252](https://github.com/latticexyz/mud/pull/1252) [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61) Thanks [@dk1a](https://github.com/dk1a)! - Optimize Schema methods.
  Return `uint256` instead of `uint8` in SchemaInstance numFields methods
- Updated dependencies [[`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/config@2.0.0-next.3
  - @latticexyz/gas-report@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1279](https://github.com/latticexyz/mud/pull/1279) [`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062) Thanks [@dk1a](https://github.com/dk1a)! - Remove `TableId` library to simplify `store` package

### Patch Changes

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

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/config@2.0.0-next.2
  - @latticexyz/gas-report@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1194](https://github.com/latticexyz/mud/pull/1194) [`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021) Thanks [@dk1a](https://github.com/dk1a)! - Optimize storage library

- [#1237](https://github.com/latticexyz/mud/pull/1237) [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206) Thanks [@alvrs](https://github.com/alvrs)! - Align Store events parameter naming between IStoreWrite and StoreCore

- [#1210](https://github.com/latticexyz/mud/pull/1210) [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3) Thanks [@dk1a](https://github.com/dk1a)! - - Refactor tightcoder to use typescript functions instead of ejs
  - Optimize `TightCoder` library
  - Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers
- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/config@2.0.0-next.1
  - @latticexyz/gas-report@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1147](https://github.com/latticexyz/mud/pull/1147) [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11) Thanks [@dk1a](https://github.com/dk1a)! - Create gas-report package, move gas-report cli command and GasReporter contract to it

- [#1061](https://github.com/latticexyz/mud/pull/1061) [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda) Thanks [@dk1a](https://github.com/dk1a)! - Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

  ```solidity
  // old import
  import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
  // new import
  import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  ```

  Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

  - Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
  - With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
  - In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
  - Besides gas savings, this change has two additional benefits:
    1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
    2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.

### Patch Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1153](https://github.com/latticexyz/mud/pull/1153) [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f) Thanks [@dk1a](https://github.com/dk1a)! - Clean up Memory.sol, make mcopy pure

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/gas-report@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **cli:** account for getRecord's trimming ([#574](https://github.com/latticexyz/mud/issues/574)) ([9c5317a](https://github.com/latticexyz/mud/commit/9c5317afb2c4a9ac2fbaca424f90f30575dba671))

### Features

- add support for key schemas ([#480](https://github.com/latticexyz/mud/issues/480)) ([37aec2e](https://github.com/latticexyz/mud/commit/37aec2e0a8adf378035fa5b54d752cc6888378d2))
- **cli:** add encode function to all tables ([#498](https://github.com/latticexyz/mud/issues/498)) ([564604c](https://github.com/latticexyz/mud/commit/564604c0c03d675e007d176ec735d8fb76976771))
- **cli:** add module config to CLI ([#494](https://github.com/latticexyz/mud/issues/494)) ([263c828](https://github.com/latticexyz/mud/commit/263c828d3eb6f43d5e635c28026f4a68fbf7a19b))
- **cli:** allow static arrays as abi types in store config and tablegen ([#509](https://github.com/latticexyz/mud/issues/509)) ([588d037](https://github.com/latticexyz/mud/commit/588d0370d4c7d13667ff784ecb170edf59aa119e))
- **cli:** improve storeArgument, refactor cli ([#500](https://github.com/latticexyz/mud/issues/500)) ([bb68670](https://github.com/latticexyz/mud/commit/bb686702da75401d9ea4a8c8effcf3a15fa53b49))
- **cli:** set storeArgument to true by default ([#553](https://github.com/latticexyz/mud/issues/553)) ([cb1ecbc](https://github.com/latticexyz/mud/commit/cb1ecbcd036ead1b1ba0b717c7531d15beaeb106))
- **cli:** use a central codegen dir for tablegen and worldgen ([#585](https://github.com/latticexyz/mud/issues/585)) ([7500b11](https://github.com/latticexyz/mud/commit/7500b119d727a7155fa1033b2fc3ca729a51d033))
- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **cli:** use json for gas report output ([#607](https://github.com/latticexyz/mud/issues/607)) ([bea12ca](https://github.com/latticexyz/mud/commit/bea12cac16a2e0cdbb9623571cf0b02a5ed969a2))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
- **store:** add metadata to the schema table ([#550](https://github.com/latticexyz/mud/issues/550)) ([55ab704](https://github.com/latticexyz/mud/commit/55ab704c36a8ba5fd021cc80abb32b3f69e97b73))
- use IErrors in IStore and IWorldCore ([#573](https://github.com/latticexyz/mud/issues/573)) ([4f9ed7b](https://github.com/latticexyz/mud/commit/4f9ed7ba22ea978623b6d54e9731081580c2ad8f))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))
- **world,store:** add updateInField ([#525](https://github.com/latticexyz/mud/issues/525)) ([0ac76fd](https://github.com/latticexyz/mud/commit/0ac76fd57484f54860157b79678b8b9eb7a86997))
- **world:** add naive ReverseMappingHook/Module ([#487](https://github.com/latticexyz/mud/issues/487)) ([36aaaef](https://github.com/latticexyz/mud/commit/36aaaef3a69914b962a3ef0847aa144134e89d28))
- **world:** add support for modules, add RegistrationModule, add CoreModule ([#482](https://github.com/latticexyz/mud/issues/482)) ([624cbbc](https://github.com/latticexyz/mud/commit/624cbbc6722823e83594f3df38d72682a1cecd99))
- **world:** add UniqueEntityModule ([#552](https://github.com/latticexyz/mud/issues/552)) ([983e26a](https://github.com/latticexyz/mud/commit/983e26a0ee0c0521e99d09dd25ebb9937e7c4ded))
- **world:** allow registration of function selectors in the World, split out RegisterSystem from World ([#481](https://github.com/latticexyz/mud/issues/481)) ([ba0166f](https://github.com/latticexyz/mud/commit/ba0166fb6cd7de63ddc6f4f500ff90c05da67b09))
- **world:** simplify access control to namespaces instead of routes ([#467](https://github.com/latticexyz/mud/issues/467)) ([945f2ef](https://github.com/latticexyz/mud/commit/945f2ef4a09c2fd1f9c4bb0418a1569fc31e0776))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Bug Fixes

- **cli:** add missing await to tablegen, fix formatting ([#472](https://github.com/latticexyz/mud/issues/472)) ([4313c27](https://github.com/latticexyz/mud/commit/4313c277b10c0334716e5c3728ffeaef643c1e6b))

### Features

- add pushToField to Store and World ([#434](https://github.com/latticexyz/mud/issues/434)) ([b665efc](https://github.com/latticexyz/mud/commit/b665efcb407992779c93a400199dee8ffdc03cb7))
- **cli:** add setMetadata to autogen of table libraries ([#466](https://github.com/latticexyz/mud/issues/466)) ([1e129fe](https://github.com/latticexyz/mud/commit/1e129fe9ced354e838d3d9afc9839aba82fbf210))
- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))
- **cli:** user types and route/path separation ([#454](https://github.com/latticexyz/mud/issues/454)) ([758bf03](https://github.com/latticexyz/mud/commit/758bf0388c9e282c58b2890cadb4a59e00978d26))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- add StoreMetadata table for table name and field names to Store and World ([#428](https://github.com/latticexyz/mud/issues/428)) ([ae39ace](https://github.com/latticexyz/mud/commit/ae39acec12e3263bcb9a8cd4f0a4db5d98b96333))
- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.
