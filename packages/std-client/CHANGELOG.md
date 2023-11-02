# @latticexyz/std-client

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
