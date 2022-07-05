# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- add webworker architecture for contract/client sync, add cache webworker ([#10](https://github.com/latticexyz/mud/issues/10)) ([4ef9f90](https://github.com/latticexyz/mud/commit/4ef9f909d1d3c10f6bea888b2c32b1d1df04185a)), closes [#14](https://github.com/latticexyz/mud/issues/14)
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
- **solecs:** create getUniqueEntityId function on World contract ([#4](https://github.com/latticexyz/mud/issues/4)) ([a06a9c5](https://github.com/latticexyz/mud/commit/a06a9c5ac1efb20eb61c459dabd00245d988de30))

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

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.7](https://github.com/latticexyz/mud/compare/v0.1.6...v0.1.7) (2022-05-25)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.6](https://github.com/latticexyz/mud/compare/v0.1.5...v0.1.6) (2022-05-25)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.5](https://github.com/latticexyz/mud/compare/v0.1.4...v0.1.5) (2022-05-24)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.4](https://github.com/latticexyz/mud/compare/v0.1.3...v0.1.4) (2022-05-24)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.3](https://github.com/latticexyz/mud/compare/v0.1.2...v0.1.3) (2022-05-23)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.2](https://github.com/latticexyz/mud/compare/v0.1.1...v0.1.2) (2022-05-23)

**Note:** Version bump only for package @latticexyz/solecs

## [0.1.1](https://github.com/latticexyz/mud/compare/v0.1.0...v0.1.1) (2022-05-23)

**Note:** Version bump only for package @latticexyz/solecs

# 0.1.0 (2022-05-23)

### Bug Fixes

- **@mud/solecs:** early return from Component.remove if value does not exist ([02f78c1](https://github.com/latticexyz/mud/commit/02f78c1114f311196928d565cd271c2243b1e9ef))

### Features

- **@mud/solecs:** add @mud/solecs ([84f05f0](https://github.com/latticexyz/mud/commit/84f05f00540c411eb15cdb8139127fd64fa118cc))
- **@mud/solecs:** add advanced queries with support for relationships ([e56f6f4](https://github.com/latticexyz/mud/commit/e56f6f42163653efd53f11e019eb502d41bd3a2b))

### Performance Improvements

- **@mud/solecs:** add MapSet.sol to improve solecs Component performance (reduce gas) ([678c7ac](https://github.com/latticexyz/mud/commit/678c7aca0db785e2c7df3ab6124c674dac1279ca))
