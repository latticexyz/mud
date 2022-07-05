# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- add webworker architecture for contract/client sync, add cache webworker ([#10](https://github.com/latticexyz/mud/issues/10)) ([4ef9f90](https://github.com/latticexyz/mud/commit/4ef9f909d1d3c10f6bea888b2c32b1d1df04185a)), closes [#14](https://github.com/latticexyz/mud/issues/14)
- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- **network:** integrate checkpoint service ([#24](https://github.com/latticexyz/mud/issues/24)) ([a146164](https://github.com/latticexyz/mud/commit/a146164e1ccab77b88499c213b21f60270ed714b))
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
