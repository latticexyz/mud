# Change Log

## 2.0.0-next.3

### Major Changes

- [#1311](https://github.com/latticexyz/mud/pull/1311) [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1) Thanks [@alvrs](https://github.com/alvrs)! - Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

  - `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

    ```
    - import { getBurnerWallet } from "@latticexyz/std-client";
    + import { getBurnerPrivateKey } from "@latticexyz/common";

    - const privateKey = getBurnerWallet().value;
    - const privateKey = getBurnerPrivateKey();
    ```

  - All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.

  - The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.

  - Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

    ```diff
    - import { ... } from "@latticexyz/std-client";
    + import { ... } from "@latticexyz/std-client/deprecated";
    ```

### Patch Changes

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/cli@2.0.0-next.3
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/world@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/store-cache@2.0.0-next.3
  - @latticexyz/config@2.0.0-next.3
  - @latticexyz/recs@2.0.0-next.3
  - @latticexyz/solecs@2.0.0-next.3
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

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/cli@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/network@2.0.0-next.2
  - @latticexyz/store-cache@2.0.0-next.2
  - @latticexyz/config@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2
  - @latticexyz/solecs@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1206](https://github.com/latticexyz/mud/pull/1206) [`e259ef79`](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b) Thanks [@holic](https://github.com/holic)! - Generated `contractComponents` now properly import `World` as type

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- [#1195](https://github.com/latticexyz/mud/pull/1195) [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd) Thanks [@holic](https://github.com/holic)! - Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

  This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

  - `component.id` is now the on-chain `bytes32` hex representation of the table ID
  - `component.metadata.componentName` is the table name (e.g. `Position`)
  - `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
  - `component.metadata.keySchema` is an object with key names and their corresponding ABI types
  - `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

- Updated dependencies [[`168a4cb4`](https://github.com/latticexyz/mud/commit/168a4cb43ce4f7bfbdb7b1b9d4c305b912a0d3f2), [`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`e259ef79`](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/cli@2.0.0-next.1
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/recs@2.0.0-next.1
  - @latticexyz/network@2.0.0-next.1
  - @latticexyz/world@2.0.0-next.1
  - @latticexyz/store-cache@2.0.0-next.1
  - @latticexyz/config@2.0.0-next.1
  - @latticexyz/solecs@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9), [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`1e2ad78e`](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee), [`c36ffd13`](https://github.com/latticexyz/mud/commit/c36ffd13c3d859d9a4eadd0e07f6f73ad96b54aa), [`e019c776`](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)]:
  - @latticexyz/store@2.0.0-next.0
  - @latticexyz/cli@2.0.0-next.0
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/world@2.0.0-next.0
  - @latticexyz/recs@2.0.0-next.0
  - @latticexyz/solecs@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0
  - @latticexyz/network@2.0.0-next.0
  - @latticexyz/store-cache@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **recs,cli:** fix bigint in recs and tsgen ([#563](https://github.com/latticexyz/mud/issues/563)) ([29fefae](https://github.com/latticexyz/mud/commit/29fefae43d96b107a66b9fd365b566cb8c466f8b))
- **std-client:** export getBurnerWallet ([#547](https://github.com/latticexyz/mud/issues/547)) ([5b5a71a](https://github.com/latticexyz/mud/commit/5b5a71ad5b49c2dfb736832de42f879f8437b1be))

### Features

- **cli/recs/std-client:** add ts definitions generator ([#536](https://github.com/latticexyz/mud/issues/536)) ([dd1efa6](https://github.com/latticexyz/mud/commit/dd1efa6a1ebd2b3c62080d1b191633d7b0072916))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
- **network,recs,std-client:** support StoreSetField before StoreSetRecord ([#581](https://github.com/latticexyz/mud/issues/581)) ([f259f90](https://github.com/latticexyz/mud/commit/f259f90e1c561163a6675f4ec51b1659681d880b)), closes [#479](https://github.com/latticexyz/mud/issues/479) [#523](https://github.com/latticexyz/mud/issues/523)
- **network:** add option to sync in main thread instead of worker ([#522](https://github.com/latticexyz/mud/issues/522)) ([4e8e7d7](https://github.com/latticexyz/mud/commit/4e8e7d774c574de5d08c03f02ef1811bade2ce7c))
- **network:** integrate initial sync from MODE ([#493](https://github.com/latticexyz/mud/issues/493)) ([7d06c1b](https://github.com/latticexyz/mud/commit/7d06c1b5cf00df627000c907e78f60d3cd2415cd))
- **std-client:** add getBurnerWallet util ([#546](https://github.com/latticexyz/mud/issues/546)) ([f427b50](https://github.com/latticexyz/mud/commit/f427b50a01457550624eed280d73c69141deaa3d))
- **std-client:** move v2 setup to its own function/file ([#526](https://github.com/latticexyz/mud/issues/526)) ([ef5b4c2](https://github.com/latticexyz/mud/commit/ef5b4c2ceedc74b94a76f3ed47748fc24028fdb4))
- use viem when creating burner wallet ([#576](https://github.com/latticexyz/mud/issues/576)) ([d5d22e0](https://github.com/latticexyz/mud/commit/d5d22e0b855cc9a606aa6e1380449a0840ea7343))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package @latticexyz/std-client

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

**Note:** Version bump only for package @latticexyz/std-client

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/std-client

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/std-client

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/std-client

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/std-client

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

**Note:** Version bump only for package @latticexyz/std-client

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

### Features

- **network:** add support for external wallets (eg MetaMask) ([#256](https://github.com/latticexyz/mud/issues/256)) ([bf0b5cf](https://github.com/latticexyz/mud/commit/bf0b5cff5f70903ef8b43a46ad07b649946b21a9))

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/std-client

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

### Features

- **react:** add react package ([#294](https://github.com/latticexyz/mud/issues/294)) ([f5ee290](https://github.com/latticexyz/mud/commit/f5ee290e776276b2b0dd273705694df04a85f400))

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

### Features

- **ecs-browser:** replace react syntax highlighter with shiki and bundler with tsup ([#262](https://github.com/latticexyz/mud/issues/262)) ([915506d](https://github.com/latticexyz/mud/commit/915506d7e7ca0b5a68afb646388bb9d4bb689879))

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

**Note:** Version bump only for package @latticexyz/std-client

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

### Bug Fixes

- **std-client:** allow default components to be passed in to setupMUDNetwork ([#299](https://github.com/latticexyz/mud/issues/299)) ([5d043ee](https://github.com/latticexyz/mud/commit/5d043eeb80936ef716ed92972111a9273b63511c))

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

**Note:** Version bump only for package @latticexyz/std-client

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

### Bug Fixes

- add LoadingState component from SyncWorker ([#288](https://github.com/latticexyz/mud/issues/288)) ([2026abc](https://github.com/latticexyz/mud/commit/2026abc43b6104ca231b3bb6c0be3c19c87a7624))

### Features

- **std-client:** add more granular relationship utilities ⏳ ([#283](https://github.com/latticexyz/mud/issues/283)) ([f094624](https://github.com/latticexyz/mud/commit/f094624cc1a6a5b2642917fab37f7f1410b4210d))

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package @latticexyz/std-client

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

**Note:** Version bump only for package @latticexyz/std-client

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

**Note:** Version bump only for package @latticexyz/std-client

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

**Note:** Version bump only for package @latticexyz/std-client

# [1.27.0](https://github.com/latticexyz/mud/compare/v1.26.0...v1.27.0) (2022-11-15)

**Note:** Version bump only for package @latticexyz/std-client

# [1.26.0](https://github.com/latticexyz/mud/compare/v1.25.1...v1.26.0) (2022-11-07)

**Note:** Version bump only for package @latticexyz/std-client

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package @latticexyz/std-client

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

### Features

- **network,std-client:** add support for SystemCall events in default MUD network setup ([#232](https://github.com/latticexyz/mud/issues/232)) ([93d947b](https://github.com/latticexyz/mud/commit/93d947b24bd641d8b6105f0d5ac308944903c26b))
- **std-client:** export missing types ([aefba08](https://github.com/latticexyz/mud/commit/aefba0864f75ff4378b614796a03a87b2803b431))

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

**Note:** Version bump only for package @latticexyz/std-client

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

**Note:** Version bump only for package @latticexyz/std-client

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

### Bug Fixes

- avoid early return for unknown components ([#226](https://github.com/latticexyz/mud/issues/226)) ([bb8684f](https://github.com/latticexyz/mud/commit/bb8684f6390591c2e6e4d07e364cab204c04805c))

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/std-client

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

### Features

- **network:** expose method to register new system contracts on the client ([#224](https://github.com/latticexyz/mud/issues/224)) ([4583767](https://github.com/latticexyz/mud/commit/45837676ebe776f1e752affb7ea1dadf44e451f2))
- **network:** simplify calling untyped systems ([#223](https://github.com/latticexyz/mud/issues/223)) ([94e4788](https://github.com/latticexyz/mud/commit/94e4788174b019d3f57df98f3a291d0498d1f17c))

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

### Features

- **network:** send ack between main thread and sync worker ([#220](https://github.com/latticexyz/mud/issues/220)) ([e06978a](https://github.com/latticexyz/mud/commit/e06978aafc37a0992ca0d7cb58a97da0a5295781))

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

**Note:** Version bump only for package @latticexyz/std-client

# [1.19.0](https://github.com/latticexyz/mud/compare/v1.18.0...v1.19.0) (2022-10-21)

### Features

- **network:** only create encoders if asked for it ([c5af08c](https://github.com/latticexyz/mud/commit/c5af08c7a0aa26ccc6e7085b1539ad4f271d4a41))

# [1.18.0](https://github.com/latticexyz/mud/compare/v1.17.0...v1.18.0) (2022-10-21)

### Features

- service stabilizations, send ecs tx on drip, new pruned snapshot endpoint ([#204](https://github.com/latticexyz/mud/issues/204)) ([d0de185](https://github.com/latticexyz/mud/commit/d0de185ca7fa2418064706928853e5cd691bdde9))

# [1.17.0](https://github.com/latticexyz/mud/compare/v1.16.0...v1.17.0) (2022-10-19)

### Features

- allow specific snapshot chunk ratio ([#212](https://github.com/latticexyz/mud/issues/212)) ([827d972](https://github.com/latticexyz/mud/commit/827d972ac9ca11918520b5f040045dfb4cca1552))

# [1.16.0](https://github.com/latticexyz/mud/compare/v1.15.0...v1.16.0) (2022-10-19)

### Features

- **network:** expose more sync settings ([#211](https://github.com/latticexyz/mud/issues/211)) ([48987f1](https://github.com/latticexyz/mud/commit/48987f1c37af9a82a7f92da6f3c8247ece4a750f))

# [1.15.0](https://github.com/latticexyz/mud/compare/v1.14.2...v1.15.0) (2022-10-18)

### Features

- **network): expose relay ping method, feat(std-client:** add tx hash to action component ([#209](https://github.com/latticexyz/mud/issues/209)) ([3e0b4a7](https://github.com/latticexyz/mud/commit/3e0b4a75ec93605f8dc6f561b140ccc9d9722566))

## [1.14.2](https://github.com/latticexyz/mud/compare/v1.14.1...v1.14.2) (2022-10-18)

**Note:** Version bump only for package @latticexyz/std-client

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package @latticexyz/std-client

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

### Features

- expose registerComponent method from setupMUDNetwork ([#207](https://github.com/latticexyz/mud/issues/207)) ([4b078bd](https://github.com/latticexyz/mud/commit/4b078bd93c14dfbb1b06c5ca8bc92dee2e8dcfea))

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

### Features

- **network:** expose SystemsRegistry and ComponentsRegistry from setupMUDNetwork ([373d62b](https://github.com/latticexyz/mud/commit/373d62bb5e17083e9c348e74c5bc84dd6149ce69))

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

**Note:** Version bump only for package @latticexyz/std-client

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/std-client

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/std-client

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

### Bug Fixes

- **solecs): only allow components to register their own updates, feat(std-client:** add support for multiple overrides per component per action ([#199](https://github.com/latticexyz/mud/issues/199)) ([d8dd63e](https://github.com/latticexyz/mud/commit/d8dd63e8055c603d5df41ad47765a286d800c529))

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

**Note:** Version bump only for package @latticexyz/std-client

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package @latticexyz/std-client

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

**Note:** Version bump only for package @latticexyz/std-client

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

### Bug Fixes

- make OverridableComponent conform with Component type ([#180](https://github.com/latticexyz/mud/issues/180)) ([c9d2c31](https://github.com/latticexyz/mud/commit/c9d2c311aa1c86d9bcabdf67eee598c264618ad0))

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/std-client

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

### Features

- add a stream rpc for message push ([#174](https://github.com/latticexyz/mud/issues/174)) ([e0aa956](https://github.com/latticexyz/mud/commit/e0aa956ac871064ecde87a07394525ca69e7f17d))

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/std-client

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

### Features

- **network:** expose mappings and ecsEvent$ from setupMUDNetwork ([44a8676](https://github.com/latticexyz/mud/commit/44a8676a8d22e73276fd02a459d35270b1b4da9e))

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

### Bug Fixes

- **network:** remove failed actions from the queue ([b27b958](https://github.com/latticexyz/mud/commit/b27b958aefc72eb8e35f72fc5108578dfb0f3b74))
- **std-client:** add stream service config to createMUDNetwork ([98b0861](https://github.com/latticexyz/mud/commit/98b0861cf059cfd291ea42d3a969a9e72be3d034))

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

### Features

- **network:** increase network performance by reducing unnecessary rpc calls ([#165](https://github.com/latticexyz/mud/issues/165)) ([195b710](https://github.com/latticexyz/mud/commit/195b71019b2be623d99f7a90c93a661cdb743a87))

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

### Features

- add createRelayService, add utils to work with Uint8Arrays ([#164](https://github.com/latticexyz/mud/issues/164)) ([b02992b](https://github.com/latticexyz/mud/commit/b02992b73393740d7510b1f9d3d9e6ea0030f462))

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package @latticexyz/std-client

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

**Note:** Version bump only for package @latticexyz/std-client

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

**Note:** Version bump only for package @latticexyz/std-client

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package @latticexyz/std-client

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package @latticexyz/std-client

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

### Bug Fixes

- **std-client:** add generic type to waitForComponentValueIn ([f1641d4](https://github.com/latticexyz/mud/commit/f1641d4a69a5479252a5cc01186a2fdc202eb45e))

### Features

- **network:** add system call stream ([#162](https://github.com/latticexyz/mud/issues/162)) ([5caef57](https://github.com/latticexyz/mud/commit/5caef57165ed1a927dc8631a361189abfd54ea7a))
- **recs:** add support for custom type in component ([#158](https://github.com/latticexyz/mud/issues/158)) ([fdc781d](https://github.com/latticexyz/mud/commit/fdc781d851147f2a98cbe95e89789a3c0ee226ca))

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package @latticexyz/std-client

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

**Note:** Version bump only for package @latticexyz/std-client

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package @latticexyz/std-client

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

**Note:** Version bump only for package @latticexyz/std-client

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

### Bug Fixes

- **std-client:** remove references to old phaser version ([#153](https://github.com/latticexyz/mud/issues/153)) ([c691c6e](https://github.com/latticexyz/mud/commit/c691c6e9288a375dae68cf2969ef42a2a33189fc))

### Features

- **std-client:** add setupContracts ([#154](https://github.com/latticexyz/mud/issues/154)) ([be86d24](https://github.com/latticexyz/mud/commit/be86d243ff3d7efae7225933066246f2747ea759))

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

### Features

- various tweaks for mudwar ([#151](https://github.com/latticexyz/mud/issues/151)) ([53bc3cc](https://github.com/latticexyz/mud/commit/53bc3cc4405c7916821d219963e592e09b51db2a))

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

### Features

- **cli:** forge bulk upload ecs state script ([#142](https://github.com/latticexyz/mud/issues/142)) ([bbd6e1f](https://github.com/latticexyz/mud/commit/bbd6e1f4be18dcae94addc65849136ad01d1ba2a))

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

**Note:** Version bump only for package @latticexyz/std-client

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

**Note:** Version bump only for package @latticexyz/std-client

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

### Features

- **network:** add loading state component update stream to SyncWorker ([#141](https://github.com/latticexyz/mud/issues/141)) ([824c4f3](https://github.com/latticexyz/mud/commit/824c4f366775be1f0e636b3781c743333421b679))

### BREAKING CHANGES

- **network:** The loading state component is attached to the entity with id 0x060D (GodID). The
  std-client package previously exported a different mudwar specific GodID, which has been replaced
  with the 0x060D GodID exported by the network package.

- test(network): add test for LoadingState and fix existing tests

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

**Note:** Version bump only for package @latticexyz/std-client

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

### Features

- add mud.dev ([#133](https://github.com/latticexyz/mud/issues/133)) ([302588c](https://github.com/latticexyz/mud/commit/302588cbbab2803396b894bc006d13e6ac943da9))

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

**Note:** Version bump only for package @latticexyz/std-client

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

**Note:** Version bump only for package @latticexyz/std-client

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

**Note:** Version bump only for package @latticexyz/std-client

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- better getComponentValueStrict error message, small std-client fixes ([#121](https://github.com/latticexyz/mud/issues/121)) ([5c78b82](https://github.com/latticexyz/mud/commit/5c78b82a88a9d50091bf3c4e65100eb3cb6230b2))
- CacheWorker ([#118](https://github.com/latticexyz/mud/issues/118)) ([bfe006e](https://github.com/latticexyz/mud/commit/bfe006e6adf064982a14d5dc1541d39b1b6016e2))

### Features

- **std-client:** add player getter utils for std client ([#120](https://github.com/latticexyz/mud/issues/120)) ([7a06f0b](https://github.com/latticexyz/mud/commit/7a06f0b90b56b916166a5ab2e5409209765352af))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package @latticexyz/std-client

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package @latticexyz/std-client

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package @latticexyz/std-client

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Features

- add 3d components ([d230339](https://github.com/latticexyz/mud/commit/d230339bdf3fbfaf4596de759a25fb616a7ab572))
- **phaserx:** allow running phaser in headless mode for unit testing in jest ([#112](https://github.com/latticexyz/mud/issues/112)) ([22bc4d8](https://github.com/latticexyz/mud/commit/22bc4d8812a69d35f73cc1d0e34064ec6cab2a0e))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package @latticexyz/std-client

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package @latticexyz/std-client

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Features

- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)
- new systems pattern ([#63](https://github.com/latticexyz/mud/issues/63)) ([fb6197b](https://github.com/latticexyz/mud/commit/fb6197b997eb7232e38ecfb9116ff256491dc38c))

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
- **recs:** rewrite for performance improvements (without integrating in ri) ([#22](https://github.com/latticexyz/mud/issues/22)) ([887564d](https://github.com/latticexyz/mud/commit/887564dbe0fad4250b82fd29d144305f176e3b89))
