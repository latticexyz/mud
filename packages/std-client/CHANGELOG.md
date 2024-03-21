# @latticexyz/std-client

## 2.0.0

### Major Changes

- c14f8bf1e: - Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

  - Fixed a bug in `waitForComponentValueIn` that caused the promise to not resolve if the component value was already set when the function was called.
  - Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, you must now pass in the full component object to the action's `updates` instead of just the component name.

    ```diff
      actions.add({
        updates: () => [
          {
    -       component: "Resource",
    +       component: Resource,
            ...
          }
        ],
        ...
      });
    ```

- c03aff39e: Removes `std-client` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.
- 48c51b52a: RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

  To migrate existing projects after upgrading to this MUD version:

  1. Remove `contractComponents.ts` from `client/src/mud`
  2. Remove `components` argument from `syncToRecs`
  3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

     ```diff
     - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
     + "build:mud": "mud tablegen && mud worldgen",
     ```

     ```diff
     - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
     + "dev": "pnpm mud dev-contracts",
     ```

- 331f0d636: Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

  - `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

    ```
    - import { getBurnerWallet } from "@latticexyz/std-client";
    + import { getBurnerPrivateKey } from "@latticexyz/common";

    - const privateKey = getBurnerWallet().value;
    - const privateKey = getBurnerPrivateKey();
    ```

  - All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.
  - The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.
  - Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

    ```diff
    - import { ... } from "@latticexyz/std-client";
    + import { ... } from "@latticexyz/std-client/deprecated";
    ```

### Patch Changes

- ce7125a1b: Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.
- e259ef79f: Generated `contractComponents` now properly import `World` as type
- b8a6158d6: bump viem to 1.6.0
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- 6c6733256: Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.
- afdba793f: Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

  This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

  - `component.id` is now the on-chain `bytes32` hex representation of the table ID
  - `component.metadata.componentName` is the table name (e.g. `Position`)
  - `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
  - `component.metadata.keySchema` is an object with key names and their corresponding ABI types
  - `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

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

- [#1351](https://github.com/latticexyz/mud/pull/1351) [`c14f8bf1`](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c) Thanks [@holic](https://github.com/holic)! - - Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

  - Fixed a bug in `waitForComponentValueIn` that caused the promise to not resolve if the component value was already set when the function was called.

  - Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, you must now pass in the full component object to the action's `updates` instead of just the component name.

    ```diff
      actions.add({
        updates: () => [
          {
    -       component: "Resource",
    +       component: Resource,
            ...
          }
        ],
        ...
      });
    ```

- [#1342](https://github.com/latticexyz/mud/pull/1342) [`c03aff39`](https://github.com/latticexyz/mud/commit/c03aff39e9882c8a827a3ed1ee81816231973816) Thanks [@holic](https://github.com/holic)! - Removes `std-client` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

### Patch Changes

- [#1340](https://github.com/latticexyz/mud/pull/1340) [`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64) Thanks [@holic](https://github.com/holic)! - Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.
