# @latticexyz/stash

## 2.2.12

### Patch Changes

- ea18f27: Bumped viem to v2.21.19.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.19
  ```

- Updated dependencies [ea18f27]
  - @latticexyz/config@2.2.12
  - @latticexyz/protocol-parser@2.2.12
  - @latticexyz/schema-type@2.2.12
  - @latticexyz/store@2.2.12

## 2.2.11

### Patch Changes

- Updated dependencies [7ddcf64]
- Updated dependencies [13e5689]
  - @latticexyz/store@2.2.11
  - @latticexyz/config@2.2.11
  - @latticexyz/protocol-parser@2.2.11
  - @latticexyz/schema-type@2.2.11

## 2.2.10

### Patch Changes

- @latticexyz/config@2.2.10
- @latticexyz/protocol-parser@2.2.10
- @latticexyz/schema-type@2.2.10
- @latticexyz/store@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/config@2.2.9
- @latticexyz/protocol-parser@2.2.9
- @latticexyz/schema-type@2.2.9
- @latticexyz/store@2.2.9

## 2.2.8

### Patch Changes

- @latticexyz/config@2.2.8
- @latticexyz/protocol-parser@2.2.8
- @latticexyz/store@2.2.8
- @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/config@2.2.7
  - @latticexyz/protocol-parser@2.2.7
  - @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- 20fac30: Added `@latticexyz/stash` package, a TypeScript client state library optimized for the MUD Store data model.
  It uses the MUD store config to define local tables, which support writing, reading and subscribing to table updates.
  It comes with a query engine optimized for "ECS-style" queries (similar to `@latticexyz/recs`) but with native support for composite keys.

  You can find usage examples in the [`@latticexyz/stash` README.md](https://github.com/latticexyz/mud/blob/main/packages/stash/README.md).

  This package is experimental and will have breaking changes while we refine its APIs and implementation. All of its exports are temporarily under `@latticexyz/stash/internal` until we consider it stable.

  - @latticexyz/config@2.2.6
  - @latticexyz/protocol-parser@2.2.6
  - @latticexyz/schema-type@2.2.6
  - @latticexyz/store@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/config@2.2.5
- @latticexyz/protocol-parser@2.2.5
- @latticexyz/schema-type@2.2.5
- @latticexyz/store@2.2.5

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- Updated dependencies [50010fb]
- Updated dependencies [8b4110e]
  - @latticexyz/config@2.2.4
  - @latticexyz/protocol-parser@2.2.4
  - @latticexyz/schema-type@2.2.4
  - @latticexyz/store@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/config@2.2.3
- @latticexyz/protocol-parser@2.2.3
- @latticexyz/schema-type@2.2.3
- @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/config@2.2.2
- @latticexyz/protocol-parser@2.2.2
- @latticexyz/schema-type@2.2.2
- @latticexyz/store@2.2.2

## 2.2.1

### Patch Changes

- @latticexyz/config@2.2.1
- @latticexyz/protocol-parser@2.2.1
- @latticexyz/store@2.2.1
- @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [04c675c]
  - @latticexyz/config@2.2.0
  - @latticexyz/store@2.2.0
  - @latticexyz/protocol-parser@2.2.0
  - @latticexyz/schema-type@2.2.0
