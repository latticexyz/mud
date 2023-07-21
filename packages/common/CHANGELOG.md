# Change Log

## 2.0.0-next.0

### Minor Changes

- [#1173](https://github.com/latticexyz/mud/pull/1173) [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee) Thanks [@holic](https://github.com/holic)! - `TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

  Also adds a few utils we'll need in the indexer:

  - `bigIntMin` is similar to `Math.min` but for `bigint`s
  - `bigIntMax` is similar to `Math.max` but for `bigint`s
  - `bigIntSort` for sorting an array of `bigint`s
  - `chunk` to split an array into chunks
  - `wait` returns a `Promise` that resolves after specified number of milliseconds

### Patch Changes

- [#1153](https://github.com/latticexyz/mud/pull/1153) [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f) Thanks [@dk1a](https://github.com/dk1a)! - Clean up Memory.sol, make mcopy pure

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)]:
  - @latticexyz/schema-type@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.
