# @latticexyz/abi-ts

## 2.0.0-next.13

## 2.0.0-next.12

### Minor Changes

- ca329175: Moves log output behind a debug flag. You can enable logging with `DEBUG=abi-ts` environment variable.

## 2.0.0-next.11

## 2.0.0-next.10

## 2.0.0-next.9

## 2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- [#1418](https://github.com/latticexyz/mud/pull/1418) [`2459e15f`](https://github.com/latticexyz/mud/commit/2459e15fc9bf49fff2d769b9efba07b99635f2cc) Thanks [@holic](https://github.com/holic)! - Let `glob` handle resolving the glob against the current working directory.

## 2.0.0-next.6

### Minor Changes

- [#1413](https://github.com/latticexyz/mud/pull/1413) [`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561) Thanks [@holic](https://github.com/holic)! - Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

  This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

  ```
  pnpm add @latticexyz/abi-ts
  pnpm abi-ts
  ```

  By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

  ```console
  pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
  ```
