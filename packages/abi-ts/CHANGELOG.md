# @latticexyz/abi-ts

## 2.2.8

## 2.2.7

## 2.2.6

## 2.2.5

## 2.2.4

## 2.2.3

## 2.2.2

## 2.2.1

## 2.2.0

## 2.1.1

## 2.1.0

### Patch Changes

- e49059f: Bumped `glob` dependency.

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

## 2.0.5

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

## 2.0.0

### Minor Changes

- ca3291751: Moves log output behind a debug flag. You can enable logging with `DEBUG=abi-ts` environment variable.
- 8025c3505: Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

  This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

  ```
  pnpm add @latticexyz/abi-ts
  pnpm abi-ts
  ```

  By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

  ```console
  pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
  ```

### Patch Changes

- 2459e15fc: Let `glob` handle resolving the glob against the current working directory.
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.

## 2.0.0-next.18

## 2.0.0-next.17

## 2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.

## 2.0.0-next.14

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
