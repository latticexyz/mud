# Change Log

## 2.0.0-next.0

### Patch Changes

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1165](https://github.com/latticexyz/mud/pull/1165) [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b) Thanks [@holic](https://github.com/holic)! - bump to latest TS version (5.1.6)

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- align git dep versions ([#577](https://github.com/latticexyz/mud/issues/577)) ([2b5fb5e](https://github.com/latticexyz/mud/commit/2b5fb5e94ad3e7e1134608121fec6c7b6a64d539))
- **create-mud:** use pnpm in templates, move to root so they can be installed/run ([#599](https://github.com/latticexyz/mud/issues/599)) ([010740d](https://github.com/latticexyz/mud/commit/010740d09d40d4ff6d95538d498a513fbb65ca45))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package create-mud

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

### Features

- **create-mud:** default to latest mud version ([#432](https://github.com/latticexyz/mud/issues/432)) ([5a38ad6](https://github.com/latticexyz/mud/commit/5a38ad6b96058883518427fe87ad8f85fb266366))

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

### Bug Fixes

- **create-mud:** small linting/type fixes for templates ([#425](https://github.com/latticexyz/mud/issues/425)) ([1f2598c](https://github.com/latticexyz/mud/commit/1f2598cff40cd9f5059b553b9291ffd2c61bacdd))

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package create-mud

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Features

- **create-mud:** update mud versions ([#407](https://github.com/latticexyz/mud/issues/407)) ([96dfef9](https://github.com/latticexyz/mud/commit/96dfef992f25714963792137043639c0b67c903f))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package create-mud

# [1.36.0](https://github.com/latticexyz/mud/compare/v1.35.0...v1.36.0) (2023-02-16)

### Bug Fixes

- **create-mud:** attempt to fix create-mud build/install issues ([#406](https://github.com/latticexyz/mud/issues/406)) ([ea53acc](https://github.com/latticexyz/mud/commit/ea53accaa684c42982bb1cac4ac1fcefd07d1603))

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

### Features

- **create-mud:** add create-mud package ([#336](https://github.com/latticexyz/mud/issues/336)) ([e85c124](https://github.com/latticexyz/mud/commit/e85c1244bf63ccd0a287849dd33fa685d95ea081))
