# Change Log

## 2.2.8

## 2.2.7

## 2.2.6

## 2.2.5

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

## 2.2.3

## 2.2.2

## 2.2.1

## 2.2.0

## 2.1.1

### Patch Changes

- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

## 2.1.0

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

## 2.0.11

## 2.0.10

## 2.0.9

## 2.0.8

## 2.0.7

## 2.0.6

### Patch Changes

- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.

## 2.0.5

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

## 2.0.0

### Major Changes

- aabd30767: Bumped Solidity version to 0.8.24.
- b38c096d: Moved all existing exports to a `/internal` import path to indicate that these are now internal-only and deprecated. We'll be replacing these types and functions with new ones that are compatible with our new, strongly-typed config.
- 92de59982: Bump Solidity version to 0.8.21

### Minor Changes

- b02f9d0e4: add type narrowing `isStaticAbiType`
- bb91edaa0: Added `isSchemaAbiType` helper function to check and narrow an unknown string to the `SchemaAbiType` type
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
- 48909d151: bump forge-std and ds-test dependencies
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- f03531d97: Fix byte lengths for `uint64` and `int64`.
- b8a6158d6: bump viem to 1.6.0
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types

## 2.0.0-next.18

### Major Changes

- b38c096d: Moved all existing exports to a `/internal` import path to indicate that these are now internal-only and deprecated. We'll be replacing these types and functions with new ones that are compatible with our new, strongly-typed config.

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

## 2.0.0-next.17

### Major Changes

- aabd3076: Bumped Solidity version to 0.8.24.

## 2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.

## 2.0.0-next.14

### Minor Changes

- bb91edaa: Added `isSchemaAbiType` helper function to check and narrow an unknown string to the `SchemaAbiType` type

## 2.0.0-next.13

## 2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8

## 2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

## 2.0.0-next.8

## 2.0.0-next.7

## 2.0.0-next.6

## 2.0.0-next.5

## 2.0.0-next.4

## 2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

## 2.0.0-next.1

### Minor Changes

- [#1196](https://github.com/latticexyz/mud/pull/1196) [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07) Thanks [@holic](https://github.com/holic)! - add type narrowing `isStaticAbiType`

## 2.0.0-next.0

### Patch Changes

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1175](https://github.com/latticexyz/mud/pull/1175) [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3) Thanks [@holic](https://github.com/holic)! - Fix byte lengths for `uint64` and `int64`.

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **schema-type:** add SchemaType -> primitive map, rearrange files ([#488](https://github.com/latticexyz/mud/issues/488)) ([b1bf876](https://github.com/latticexyz/mud/commit/b1bf876eee91d783bbd050c1361bb3af1f651e66))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Features

- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.
