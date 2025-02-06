# @latticexyz/stash

## 2.2.19

### Patch Changes

- @latticexyz/common@2.2.19
- @latticexyz/config@2.2.19
- @latticexyz/protocol-parser@2.2.19
- @latticexyz/schema-type@2.2.19
- @latticexyz/store@2.2.19

## 2.2.18

### Patch Changes

- Updated dependencies [5d6fb1b]
- Updated dependencies [10ce339]
  - @latticexyz/store@2.2.18
  - @latticexyz/common@2.2.18
  - @latticexyz/config@2.2.18
  - @latticexyz/protocol-parser@2.2.18
  - @latticexyz/schema-type@2.2.18

## 2.2.17

### Patch Changes

- Updated dependencies [589fd3a]
- Updated dependencies [dead80e]
- Updated dependencies [7385948]
  - @latticexyz/common@2.2.17
  - @latticexyz/protocol-parser@2.2.17
  - @latticexyz/config@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/schema-type@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/common@2.2.16
- @latticexyz/config@2.2.16
- @latticexyz/protocol-parser@2.2.16
- @latticexyz/schema-type@2.2.16
- @latticexyz/store@2.2.16

## 2.2.15

### Patch Changes

- 09e9bd5: Moved viem to peer dependencies to ensure a single, consistent version is installed in downstream projects.
- 96f1473: Consolidated how state changes are applied and subscribers notified. Stash subscribers now receive an ordered list of state updates rather than an object.
- 16242b7: Added `useRecord` and `useRecords` hooks for convenience.

  ```ts
  import { useRecords } from "@latticexyz/stash/react";

  const players = useRecords({ stash, table: Position });
  ```

  ```ts
  import { useRecord } from "@latticexyz/stash/react";

  const player = useRecord({ stash, table: Position, key: { player: "0x..." } });
  ```

- Updated dependencies [9580d29]
- Updated dependencies [09e9bd5]
- Updated dependencies [1b477d4]
- Updated dependencies [9d71887]
- Updated dependencies [09536b0]
- Updated dependencies [88b9daf]
  - @latticexyz/config@2.2.15
  - @latticexyz/common@2.2.15
  - @latticexyz/protocol-parser@2.2.15
  - @latticexyz/schema-type@2.2.15
  - @latticexyz/store@2.2.15

## 2.2.14

### Patch Changes

- 93d0e76: Added `useStash` React hook. It's heavily inspired by Zustand's `useStore` and accepts a stash, a state selector, an an optional equality function to avoid unnecessary re-render cycles when returning unstable values.

  Also updated `getRecord` and `getRecords` to each take either a `stash` or `state` object for more ergonomic use with `useStash`.

  ```ts
  import { useStash } from "@latticexyz/stash/react";
  import { getRecord } from "@latticexyz/stash";
  import config from "../mud.config";

  const tables = config.namespaces.app.tables;

  export function PlayerName({ playerId }) {
    const record = useStash(stash, (state) => getRecord({ state, table: tables.Player, key: { playerId } }));
    ...
  }
  ```

  ```ts
  import isEqual from "fast-deep-equal";
  import { useStash } from "@latticexyz/stash/react";
  import { getRecords } from "@latticexyz/stash";
  import config from "../mud.config";

  export function PlayerNames() {
    const record = useStash(stash, (state) => getRecords({ state, table: tables.Player }), { isEqual });
    ...
  }
  ```

  - @latticexyz/common@2.2.14
  - @latticexyz/config@2.2.14
  - @latticexyz/protocol-parser@2.2.14
  - @latticexyz/schema-type@2.2.14
  - @latticexyz/store@2.2.14

## 2.2.13

### Patch Changes

- @latticexyz/schema-type@2.2.13
- @latticexyz/store@2.2.13
- @latticexyz/config@2.2.13
- @latticexyz/protocol-parser@2.2.13

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
