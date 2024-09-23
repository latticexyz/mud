# Change Log

## 2.2.8

### Patch Changes

- Updated dependencies [7c7bdb2]
  - @latticexyz/common@2.2.8
  - @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- @latticexyz/common@2.2.7
- @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/common@2.2.6
- @latticexyz/schema-type@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/common@2.2.5
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
  - @latticexyz/common@2.2.4
  - @latticexyz/schema-type@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/common@2.2.3
- @latticexyz/schema-type@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/common@2.2.2
- @latticexyz/schema-type@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [c0764a5]
  - @latticexyz/common@2.2.1
  - @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- 04c675c: Fixed a few type issues with `namespaceLabel` in tables and added/clarified TSDoc for config input/output objects.
- Updated dependencies [69cd0a1]
  - @latticexyz/common@2.2.0
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
  - @latticexyz/common@2.1.1
  - @latticexyz/schema-type@2.1.1

## 2.1.0

### Minor Changes

- e85dc53: Tables and systems in config output now include a `label` property. Labels are now used throughout the codebase as a user-friendly way to reference the given resource: config keys, contract names, generated libraries, etc.

  Inside `namespaces` config output, keys for tables and systems and their filenames will always correspond to their labels. This should make MUD tooling more intuitive and predictable. For backwards compatibility, `tables` config output still uses namespace-prefixed keys.

  Labels replace the previous resource `name` usage, which is truncated to `bytes16` to be used as part of the resource ID and, in the future, may not always be human-readable.

  These labels will soon be registered onchain so that developers can initialize a new MUD project from an existing world, generating config and interfaces with user-friendly names.

### Patch Changes

- 7129a16: Bumped `@arktype/util` and moved `evaluate`/`satisfy` usages to its `show`/`satisfy` helpers.
- Updated dependencies [7129a16]
- Updated dependencies [8d0453e]
  - @latticexyz/common@2.1.0
  - @latticexyz/schema-type@2.1.0

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
  - @latticexyz/schema-type@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/common@2.0.11
- @latticexyz/schema-type@2.0.11

## 2.0.10

### Patch Changes

- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- Updated dependencies [51b137d3]
  - @latticexyz/common@2.0.10
  - @latticexyz/schema-type@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9
  - @latticexyz/schema-type@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/schema-type@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [375d902e]
- Updated dependencies [38c61158]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/schema-type@2.0.7

## 2.0.6

### Patch Changes

- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6
  - @latticexyz/schema-type@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [a9e8a407]
  - @latticexyz/common@2.0.5
  - @latticexyz/schema-type@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/common@2.0.2
- @latticexyz/schema-type@2.0.2

## 2.0.1

### Patch Changes

- @latticexyz/common@2.0.1
- @latticexyz/schema-type@2.0.1

## 2.0.0

### Major Changes

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

- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 3e057061d: Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).
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
- Updated dependencies [b38c096d]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e34d1170]
- Updated dependencies [b8a6158d6]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [48909d151]
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
  - @latticexyz/schema-type@2.0.0

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
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [d7b1c588a]
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18

## 2.0.0-next.17

### Patch Changes

- Updated dependencies [a35c05ea]
- Updated dependencies [aabd3076]
- Updated dependencies [c162ad5a]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/schema-type@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- @latticexyz/common@2.0.0-next.16
- @latticexyz/schema-type@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- Updated dependencies [933b54b5]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [5d737cf2]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/schema-type@2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- Updated dependencies [aacffcb5]
- Updated dependencies [bb91edaa]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/schema-type@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- 3e057061: Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).
- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

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

### Patch Changes

- Updated dependencies [[`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- **config:** create config package ([#589](https://github.com/latticexyz/mud/issues/589)) ([d2a23a6](https://github.com/latticexyz/mud/commit/d2a23a6162611353f4930aeadbd8fff2f1c3874c))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
