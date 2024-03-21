# @latticexyz/network

## 2.0.0

### Major Changes

- 42c7d8986: Removes `network` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

### Patch Changes

- b8a6158d6: bump viem to 1.6.0
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- e019c7761: Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.
- 6c6733256: Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

## 2.0.0-next.18

## 2.0.0-next.17

## 2.0.0-next.16

## 2.0.0-next.15

## 2.0.0-next.14

## 2.0.0-next.13

## 2.0.0-next.12

## 2.0.0-next.11

## 2.0.0-next.10

## 2.0.0-next.9

## 2.0.0-next.8

## 2.0.0-next.7

## 2.0.0-next.6

## 2.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#1348](https://github.com/latticexyz/mud/pull/1348) [`42c7d898`](https://github.com/latticexyz/mud/commit/42c7d898630c93805a5e345bdc8d87c2674b5110) Thanks [@holic](https://github.com/holic)! - Removes `network` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

## 2.0.0-next.3
