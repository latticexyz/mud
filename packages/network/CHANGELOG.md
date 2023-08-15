# Change Log

## 2.0.0-next.2

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2
  - @latticexyz/services@2.0.0-next.2
  - @latticexyz/solecs@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- Updated dependencies [[`3236f799`](https://github.com/latticexyz/mud/commit/3236f799e501be227da6e42e7b41a4928750115c), [`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/services@2.0.0-next.1
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/recs@2.0.0-next.1
  - @latticexyz/world@2.0.0-next.1
  - @latticexyz/solecs@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3

  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types

- [#1109](https://github.com/latticexyz/mud/pull/1109) [`e019c776`](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934) Thanks [@Kooshaba](https://github.com/Kooshaba)! - Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

- Updated dependencies [[`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9), [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`1e2ad78e`](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`086be4ef`](https://github.com/latticexyz/mud/commit/086be4ef4f3c1ecb3eac0e9554d7d4eb64531fc2), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/store@2.0.0-next.0
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/world@2.0.0-next.0
  - @latticexyz/recs@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/solecs@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0
  - @latticexyz/services@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **network:** fall back to RPC sync if MODE is not available ([#555](https://github.com/latticexyz/mud/issues/555)) ([4de4b6d](https://github.com/latticexyz/mud/commit/4de4b6d5ab4f8b27873af6d298ba3e6e1c1fd02f))
- **network:** fix mode decoding ([#562](https://github.com/latticexyz/mud/issues/562)) ([fb82313](https://github.com/latticexyz/mud/commit/fb823131fc8f7bcbdcbfa57de59a8a5dbca2f8b6))
- **network:** handle singleton/empty keys ([#541](https://github.com/latticexyz/mud/issues/541)) ([1e0ddb9](https://github.com/latticexyz/mud/commit/1e0ddb9adaf2376ee6b578e3fb1d1eb0b3e22206))
- **network:** skip sync from cache in dev mode ([#521](https://github.com/latticexyz/mud/issues/521)) ([818c1e2](https://github.com/latticexyz/mud/commit/818c1e2e6e7acb45f4d65d47f5395cb2d3811a57))

### Features

- **create-mud:** use pnpm in templates, move to root so they can be installed/run ([#599](https://github.com/latticexyz/mud/issues/599)) ([010740d](https://github.com/latticexyz/mud/commit/010740d09d40d4ff6d95538d498a513fbb65ca45))
- **network,recs,std-client:** support StoreSetField before StoreSetRecord ([#581](https://github.com/latticexyz/mud/issues/581)) ([f259f90](https://github.com/latticexyz/mud/commit/f259f90e1c561163a6675f4ec51b1659681d880b)), closes [#479](https://github.com/latticexyz/mud/issues/479) [#523](https://github.com/latticexyz/mud/issues/523)
- **network:** add fastTxExecute util ([#543](https://github.com/latticexyz/mud/issues/543)) ([f05a70a](https://github.com/latticexyz/mud/commit/f05a70a2e4be077af44c6d6a0b9c8da8d0c18bc5))
- **network:** add option to sync in main thread instead of worker ([#522](https://github.com/latticexyz/mud/issues/522)) ([4e8e7d7](https://github.com/latticexyz/mud/commit/4e8e7d774c574de5d08c03f02ef1811bade2ce7c))
- **network:** integrate initial sync from MODE ([#493](https://github.com/latticexyz/mud/issues/493)) ([7d06c1b](https://github.com/latticexyz/mud/commit/7d06c1b5cf00df627000c907e78f60d3cd2415cd))
- use viem when creating burner wallet ([#576](https://github.com/latticexyz/mud/issues/576)) ([d5d22e0](https://github.com/latticexyz/mud/commit/d5d22e0b855cc9a606aa6e1380449a0840ea7343))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package @latticexyz/network

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

**Note:** Version bump only for package @latticexyz/network

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/network

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/network

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/network

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/network

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

### Bug Fixes

- **network:** add explicit return type to createFaucetService ([#399](https://github.com/latticexyz/mud/issues/399)) ([cae82e5](https://github.com/latticexyz/mud/commit/cae82e5781931f86d0bc53eb05306197fab3d7aa))
- **network:** use current block number while waiting for new blocks ([#368](https://github.com/latticexyz/mud/issues/368)) ([09b77a7](https://github.com/latticexyz/mud/commit/09b77a7e27d2056a30f9b9c41046b7d6eec8dda7))

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

### Bug Fixes

- **network:** throw errors from txQueue calls ([#351](https://github.com/latticexyz/mud/issues/351)) ([a811ff7](https://github.com/latticexyz/mud/commit/a811ff76e500bbc3e983f32c13877bdee855113d)), closes [#315](https://github.com/latticexyz/mud/issues/315)

### Features

- **network:** add support for external wallets (eg MetaMask) ([#256](https://github.com/latticexyz/mud/issues/256)) ([bf0b5cf](https://github.com/latticexyz/mud/commit/bf0b5cff5f70903ef8b43a46ad07b649946b21a9))

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/network

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

**Note:** Version bump only for package @latticexyz/network

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

**Note:** Version bump only for package @latticexyz/network

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

**Note:** Version bump only for package @latticexyz/network

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

**Note:** Version bump only for package @latticexyz/network

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

**Note:** Version bump only for package @latticexyz/network

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

**Note:** Version bump only for package @latticexyz/network

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package @latticexyz/network

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

**Note:** Version bump only for package @latticexyz/network

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

**Note:** Version bump only for package @latticexyz/network

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

### Features

- **network:** system call stream available in streaming service ([0244eb8](https://github.com/latticexyz/mud/commit/0244eb8d3ec1a7798136cf4ddefbd766cb830b8c)), closes [#254](https://github.com/latticexyz/mud/issues/254)

# [1.27.0](https://github.com/latticexyz/mud/compare/v1.26.0...v1.27.0) (2022-11-15)

### Bug Fixes

- **network:** disable browser cache in dev mode ([#213](https://github.com/latticexyz/mud/issues/213)) ([ba9e6bc](https://github.com/latticexyz/mud/commit/ba9e6bcaa869d48ce4e63c85e4f8c3b0c1d986b0))

# [1.26.0](https://github.com/latticexyz/mud/compare/v1.25.1...v1.26.0) (2022-11-07)

**Note:** Version bump only for package @latticexyz/network

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package @latticexyz/network

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

### Features

- **network,std-client:** add support for SystemCall events in default MUD network setup ([#232](https://github.com/latticexyz/mud/issues/232)) ([93d947b](https://github.com/latticexyz/mud/commit/93d947b24bd641d8b6105f0d5ac308944903c26b))
- **network:** export createBlockNumberStream ([#230](https://github.com/latticexyz/mud/issues/230)) ([c227e5d](https://github.com/latticexyz/mud/commit/c227e5df39dd9ca81652af142f2b07f1b64b3629))

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

**Note:** Version bump only for package @latticexyz/network

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

### Features

- v2 endpoint for pruned snapshot that returns entities as raw bytes ([#215](https://github.com/latticexyz/mud/issues/215)) ([28cce1e](https://github.com/latticexyz/mud/commit/28cce1e8a1240d72363fe786704e7fe976f7c995))

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

**Note:** Version bump only for package @latticexyz/network

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/network

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

### Features

- **network:** expose method to register new system contracts on the client ([#224](https://github.com/latticexyz/mud/issues/224)) ([4583767](https://github.com/latticexyz/mud/commit/45837676ebe776f1e752affb7ea1dadf44e451f2))
- **network:** simplify calling untyped systems ([#223](https://github.com/latticexyz/mud/issues/223)) ([94e4788](https://github.com/latticexyz/mud/commit/94e4788174b019d3f57df98f3a291d0498d1f17c))

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

### Features

- **network:** send ack between main thread and sync worker ([#220](https://github.com/latticexyz/mud/issues/220)) ([e06978a](https://github.com/latticexyz/mud/commit/e06978aafc37a0992ca0d7cb58a97da0a5295781))

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

**Note:** Version bump only for package @latticexyz/network

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

**Note:** Version bump only for package @latticexyz/network

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package @latticexyz/network

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/network

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

**Note:** Version bump only for package @latticexyz/network

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

**Note:** Version bump only for package @latticexyz/network

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/network

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/network

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

### Features

- **network:** fall back to rpc if stream service errors ([#190](https://github.com/latticexyz/mud/issues/190)) ([414e777](https://github.com/latticexyz/mud/commit/414e77799259cdb28bf92c1ef603608d0bdb05fd))

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

### Bug Fixes

- **network:** use websocket to subscribe to relayer messages ([8218249](https://github.com/latticexyz/mud/commit/8218249a228a6b3acd52776b653688aa8d73e9a9))

### Features

- connected relayer clients ([#188](https://github.com/latticexyz/mud/issues/188)) ([dc3fcdf](https://github.com/latticexyz/mud/commit/dc3fcdf7a02f3cced981ca933faf145c38b43fe0))
- **network:** expose connectedAddressChecksum ([#189](https://github.com/latticexyz/mud/issues/189)) ([e39d245](https://github.com/latticexyz/mud/commit/e39d245f62e5edf91896a39bb52c993df814ffb6))
- wss for stream service ([#186](https://github.com/latticexyz/mud/issues/186)) ([d4511ac](https://github.com/latticexyz/mud/commit/d4511acb1805ddacc71f83cdd9dc7858bd07aee1))

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package @latticexyz/network

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

### Features

- add utils to normalize hex ids ([#185](https://github.com/latticexyz/mud/issues/185)) ([170e963](https://github.com/latticexyz/mud/commit/170e963eebce61b27d1b999f8afd8c8e176a739c))

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

**Note:** Version bump only for package @latticexyz/network

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/network

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

### Features

- add a stream rpc for message push ([#174](https://github.com/latticexyz/mud/issues/174)) ([e0aa956](https://github.com/latticexyz/mud/commit/e0aa956ac871064ecde87a07394525ca69e7f17d))

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/network

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

### Features

- add signature verification for all client actions via relay service ([#167](https://github.com/latticexyz/mud/issues/167)) ([7920d6e](https://github.com/latticexyz/mud/commit/7920d6eec20f3a669cb3a1a9e39cd822e421961a))
- **network:** add util for creating faucet service ([#171](https://github.com/latticexyz/mud/issues/171)) ([9f50d9c](https://github.com/latticexyz/mud/commit/9f50d9c3ae31132507c19bce7d3d5c8df7684cad))

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

**Note:** Version bump only for package @latticexyz/network

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

### Bug Fixes

- **network:** check event type instead of just value before decoding ([#166](https://github.com/latticexyz/mud/issues/166)) ([f4dedd9](https://github.com/latticexyz/mud/commit/f4dedd9005a110b2548f5b372f5a53abe06aacbf))

### Features

- **network:** increase network performance by reducing unnecessary rpc calls ([#165](https://github.com/latticexyz/mud/issues/165)) ([195b710](https://github.com/latticexyz/mud/commit/195b71019b2be623d99f7a90c93a661cdb743a87))

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

### Features

- add createRelayService, add utils to work with Uint8Arrays ([#164](https://github.com/latticexyz/mud/issues/164)) ([b02992b](https://github.com/latticexyz/mud/commit/b02992b73393740d7510b1f9d3d9e6ea0030f462))
- initial implementation of ecs relay service ([#157](https://github.com/latticexyz/mud/issues/157)) ([140aec3](https://github.com/latticexyz/mud/commit/140aec3e92269f8c79fe0ef5e6639ca0ff056282))

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package @latticexyz/network

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

### Bug Fixes

- **network:** cancel tx request if gas estimation failed ([565b37f](https://github.com/latticexyz/mud/commit/565b37f5a7408c06e2fd5fdab2f42d69f8db6610))

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

### Bug Fixes

- do gas estimation right before sending tx to avoid invalid gas estimations ([f251642](https://github.com/latticexyz/mud/commit/f25164268834390d35637b7aea84998cf88e16ae))

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package @latticexyz/network

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package @latticexyz/network

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

### Features

- **network:** add system call stream ([#162](https://github.com/latticexyz/mud/issues/162)) ([5caef57](https://github.com/latticexyz/mud/commit/5caef57165ed1a927dc8631a361189abfd54ea7a))
- **std-contracts:** add FunctionComponent ([#161](https://github.com/latticexyz/mud/issues/161)) ([d720277](https://github.com/latticexyz/mud/commit/d7202774a5a068a99b88a63cb18100482dc18cb8))

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package @latticexyz/network

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

**Note:** Version bump only for package @latticexyz/network

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package @latticexyz/network

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

### Bug Fixes

- **network:** initial sync ([#156](https://github.com/latticexyz/mud/issues/156)) ([6116585](https://github.com/latticexyz/mud/commit/611658584ffd52c63f837f239d888aa55959320e))

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

**Note:** Version bump only for package @latticexyz/network

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

**Note:** Version bump only for package @latticexyz/network

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

### Features

- **cli:** forge bulk upload ecs state script ([#142](https://github.com/latticexyz/mud/issues/142)) ([bbd6e1f](https://github.com/latticexyz/mud/commit/bbd6e1f4be18dcae94addc65849136ad01d1ba2a))

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

### Features

- add more granularity to initial sync state report ([#146](https://github.com/latticexyz/mud/issues/146)) ([d4ba338](https://github.com/latticexyz/mud/commit/d4ba338a50048c2d5180ce4f917d94f5b0893935))

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

### Features

- add chunk snapshot and stream service ([#139](https://github.com/latticexyz/mud/issues/139)) ([8c9d4b3](https://github.com/latticexyz/mud/commit/8c9d4b30ed70470ca8770565b6472359e0e0f2bc))

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

### Bug Fixes

- **network:** align hex entity id formatting ([#140](https://github.com/latticexyz/mud/issues/140)) ([93b1bd6](https://github.com/latticexyz/mud/commit/93b1bd6688780dc185a1c7e353954e2c5c85f648))

### Features

- **network:** add loading state component update stream to SyncWorker ([#141](https://github.com/latticexyz/mud/issues/141)) ([824c4f3](https://github.com/latticexyz/mud/commit/824c4f366775be1f0e636b3781c743333421b679))

### BREAKING CHANGES

- **network:** The loading state component is attached to the entity with id 0x060D (GodID). The
  std-client package previously exported a different mudwar specific GodID, which has been replaced
  with the 0x060D GodID exported by the network package.

- test(network): add test for LoadingState and fix existing tests

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

### Bug Fixes

- start from initialBlockNumber, build settings, fix github actions, and other minor additions ([#137](https://github.com/latticexyz/mud/issues/137)) ([08eab5c](https://github.com/latticexyz/mud/commit/08eab5c6b0d99a9ffa8a315e16454ecc9306f410))

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

### Features

- add mud.dev ([#133](https://github.com/latticexyz/mud/issues/133)) ([302588c](https://github.com/latticexyz/mud/commit/302588cbbab2803396b894bc006d13e6ac943da9))
- integrate proto from services into network ([#131](https://github.com/latticexyz/mud/issues/131)) ([756fdb7](https://github.com/latticexyz/mud/commit/756fdb7cae6441e692088fd9cbbc8d9d327a70e0))

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

**Note:** Version bump only for package @latticexyz/network

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

### Code Refactoring

- sync worker (+ integrated snapshot service) ([#125](https://github.com/latticexyz/mud/issues/125)) ([6173b59](https://github.com/latticexyz/mud/commit/6173b596713b0dad73d14288ece3ac66ca3972d3))

### BREAKING CHANGES

- sync worker update stream returns component id instead of component key

- test(network): add tests for sync utils and SyncWorker logic

- chore: remove logs and improve comments

- chore: add logs

Co-authored-by: andrii dobroshynski <24281657+andriidski@users.noreply.github.com>

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

**Note:** Version bump only for package @latticexyz/network

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- CacheWorker ([#118](https://github.com/latticexyz/mud/issues/118)) ([bfe006e](https://github.com/latticexyz/mud/commit/bfe006e6adf064982a14d5dc1541d39b1b6016e2))
- optimism, cancel action if gas check fails, add noise utils, fix ecs-browser entry point ([#119](https://github.com/latticexyz/mud/issues/119)) ([f35d3c3](https://github.com/latticexyz/mud/commit/f35d3c3cc7fc9385a215dfda6762a2a825c9fd6d))

### Features

- logging library with support for topics/filters ([#123](https://github.com/latticexyz/mud/issues/123)) ([4eac3c6](https://github.com/latticexyz/mud/commit/4eac3c6f45cf300c683397d68e405001d31d8dda))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package @latticexyz/network

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package @latticexyz/network

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package @latticexyz/network

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Bug Fixes

- **cli:** extract encoded arguments from signature ([#116](https://github.com/latticexyz/mud/issues/116)) ([f630319](https://github.com/latticexyz/mud/commit/f6303194c5d7147a64542e43669fddebf3abad1a))

### Features

- **network:** faster execution of multiple tx, better revert message logging ([#111](https://github.com/latticexyz/mud/issues/111)) ([bee34dc](https://github.com/latticexyz/mud/commit/bee34dc38194bd54d02cfb7f763025359b49fb05))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package @latticexyz/network

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package @latticexyz/network

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Bug Fixes

- use hardhat as node (better logs) and make hardhat compatible with forge ([#54](https://github.com/latticexyz/mud/issues/54)) ([45a5981](https://github.com/latticexyz/mud/commit/45a5981a07f330b222775c0ad797db677f9e8897))

### Features

- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)
- new systems pattern ([#63](https://github.com/latticexyz/mud/issues/63)) ([fb6197b](https://github.com/latticexyz/mud/commit/fb6197b997eb7232e38ecfb9116ff256491dc38c))

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- add webworker architecture for contract/client sync, add cache webworker ([#10](https://github.com/latticexyz/mud/issues/10)) ([4ef9f90](https://github.com/latticexyz/mud/commit/4ef9f909d1d3c10f6bea888b2c32b1d1df04185a)), closes [#14](https://github.com/latticexyz/mud/issues/14)
- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- **network:** integrate snapshot service ([#24](https://github.com/latticexyz/mud/issues/24)) ([a146164](https://github.com/latticexyz/mud/commit/a146164e1ccab77b88499c213b21f60270ed714b))
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
- **recs:** rewrite for performance improvements (without integrating in ri) ([#22](https://github.com/latticexyz/mud/issues/22)) ([887564d](https://github.com/latticexyz/mud/commit/887564dbe0fad4250b82fd29d144305f176e3b89))

### BREAKING CHANGES

- Components have to implement a getSchema() function

- feat(network): make Sync worker return a stream of ECS events (prev contract events)

- feat(ri-contracts): integrate solecs change (add getSchema to components)

- feat(ri-client): integrate network package changes

- feat(network): store ECS state in cache

- feat(network): load state from cache

- feat(utils): add more utils for iterables

- refactor(network): clean up

- feat(network): generalize component value decoder function, add tests

- fix(network): make it possible to subscribe to ecsStream from sync worker multiple times

- fix(network): start sync from provided initial block number

- feat(network): move storing ecs to indexDB to its own Cache worker

- feat(network): create separate cache for every World contract address

- fix(network): fix issues discovered during live review

- chore: remove unused import

- Update packages/network/src/createBlockNumberStream.ts

Co-authored-by: ludens <ludens@lattice.xyz>

- feat(network): add clock syncInterval as config parameter

- feat(utils): emit values through componentToStream and observableToStream only if non-null

- feat(network): add chain id to cache id, disable loading from cache on hardhat

- fix(contracts): change Position and EntityType schema to int32/uint32 to fit in js number

- docs(client): fix typos in comments

- fix(network): fix tests

- fix(scripting): integrate new network package into ri scripting

- fix(network): fix sending multiple requests for component schema if many events get reduced

## [0.1.8](https://github.com/latticexyz/mud/compare/v0.1.7...v0.1.8) (2022-05-25)

**Note:** Version bump only for package @latticexyz/network

## [0.1.7](https://github.com/latticexyz/mud/compare/v0.1.6...v0.1.7) (2022-05-25)

**Note:** Version bump only for package @latticexyz/network

## [0.1.6](https://github.com/latticexyz/mud/compare/v0.1.5...v0.1.6) (2022-05-25)

**Note:** Version bump only for package @latticexyz/network

## [0.1.5](https://github.com/latticexyz/mud/compare/v0.1.4...v0.1.5) (2022-05-24)

**Note:** Version bump only for package @latticexyz/network

## [0.1.4](https://github.com/latticexyz/mud/compare/v0.1.3...v0.1.4) (2022-05-24)

**Note:** Version bump only for package @latticexyz/network

## [0.1.3](https://github.com/latticexyz/mud/compare/v0.1.2...v0.1.3) (2022-05-23)

**Note:** Version bump only for package @latticexyz/network

## [0.1.2](https://github.com/latticexyz/mud/compare/v0.1.1...v0.1.2) (2022-05-23)

**Note:** Version bump only for package @latticexyz/network

## [0.1.1](https://github.com/latticexyz/mud/compare/v0.1.0...v0.1.1) (2022-05-23)

**Note:** Version bump only for package @latticexyz/network

# 0.1.0 (2022-05-23)

### Bug Fixes

- **@mud/network:** do not increase nonce for view functions ([233c4b5](https://github.com/latticexyz/mud/commit/233c4b51c9cb11ab40fa2c299c2303bc195b6a10))
- **@mud/network:** use component id for ecs event mapping (instead of address) ([baa5f10](https://github.com/latticexyz/mud/commit/baa5f101796086bff7123186e8e0eba1941d20d0))
- **@mud/network:** use component id instead of address for mapping ([39b516c](https://github.com/latticexyz/mud/commit/39b516c477b7e430ef0d00064c65f03afe29d1b4))

### Features

- **@mud/network:** add @mud/network ([9a29452](https://github.com/latticexyz/mud/commit/9a29452e76b743f4bf1de3599eb0755fbcb93533))
- **@mud/network:** add option to ignore tx confirmation to txQueue, add ready state, add fetch log ([438549a](https://github.com/latticexyz/mud/commit/438549adf92c42bb987eec46015c9c6f2235be80))

### Performance Improvements

- **@mud/network:** add initial sync in stages ([d0c026a](https://github.com/latticexyz/mud/commit/d0c026a51bd8570c00517f8502485465d58bc5bb))
- **@mud/network:** move sync and processing of chain events to a webworker ([dad52ea](https://github.com/latticexyz/mud/commit/dad52eaad4a4d8e67582bde8130455159173f609))
